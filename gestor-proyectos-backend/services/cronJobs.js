const cron = require("node-cron");
const { pool } = require("../config/db");
const NotificacionModel = require("../models/NotificacionModel");
const UsuarioModel = require("../models/UsuarioModel");
const emailService = require("../services/emailService");
const { fechaISO } = require("../utils/fecha");

// Genera notificaciones (idempotentes) para tareas por vencer/vencidas y
// eventos de calendario próximos, y manda UN correo digesto por usuario con
// solo lo que es realmente nuevo (evita reenviar lo mismo cada día).
async function generarNotificacionesDeVencimientos() {
  const nuevasPorUsuario = {};

  const { rows: tareas } = await pool.query(`
    SELECT t.id_tarea, t.titulo, t.fecha_limite, t.id_proyecto, t.id_responsable
    FROM Tareas t
    INNER JOIN Estados e ON e.id_estado = t.id_estado
    WHERE e.nombre_estado NOT IN ('Finalizado', 'Cancelado')
      AND t.fecha_limite <= (CURRENT_DATE + INTERVAL '3 days')
  `);

  for (const t of tareas) {
    const vencida = new Date(t.fecha_limite) < new Date(new Date().toDateString());
    const fecha = fechaISO(t.fecha_limite);
    const creada = await NotificacionModel.create({
      id_usuario: t.id_responsable,
      tipo: "tarea_vencida",
      titulo: vencida ? "Tarea vencida" : "Tarea por vencer",
      mensaje: `"${t.titulo}" ${vencida ? "venció" : "vence"} el ${fecha}`,
      enlace: `project.html?id=${t.id_proyecto}`,
      id_proyecto: t.id_proyecto,
      referencia_tipo: "tarea",
      referencia_id: t.id_tarea,
    });
    if (creada) (nuevasPorUsuario[t.id_responsable] ||= []).push(creada.mensaje);
  }

  const { rows: eventos } = await pool.query(`
    SELECT c.id_evento, c.titulo, c.fecha, c.hora, c.id_proyecto, pm.id_usuario
    FROM Calendario c
    INNER JOIN ProyectoMiembros pm ON pm.id_proyecto = c.id_proyecto
    WHERE c.id_proyecto IS NOT NULL
      AND c.fecha BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '3 days')
  `);

  for (const ev of eventos) {
    const fecha = fechaISO(ev.fecha);
    const creada = await NotificacionModel.create({
      id_usuario: ev.id_usuario,
      tipo: "evento",
      titulo: "Evento próximo",
      mensaje: `"${ev.titulo}" el ${fecha} a las ${ev.hora}`,
      enlace: `calendar.html`,
      id_proyecto: ev.id_proyecto,
      referencia_tipo: "evento",
      referencia_id: ev.id_evento,
    });
    if (creada) (nuevasPorUsuario[ev.id_usuario] ||= []).push(creada.mensaje);
  }

  for (const [idUsuario, mensajes] of Object.entries(nuevasPorUsuario)) {
    const usuario = await UsuarioModel.getById(idUsuario);
    if (usuario) await emailService.enviarDigestoVencimientos(usuario, mensajes);
  }

  return { tareasRevisadas: tareas.length, eventosRevisados: eventos.length, usuariosNotificados: Object.keys(nuevasPorUsuario).length };
}

// Corre todos los días a las 07:00 hora del servidor.
function iniciarCron() {
  cron.schedule("0 7 * * *", () => {
    generarNotificacionesDeVencimientos().catch((err) =>
      console.error("[cronJobs] Error generando notificaciones de vencimientos:", err.message)
    );
  });
}

module.exports = { iniciarCron, generarNotificacionesDeVencimientos };
