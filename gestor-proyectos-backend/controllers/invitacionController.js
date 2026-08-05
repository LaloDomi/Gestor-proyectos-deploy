const InvitacionModel = require("../models/InvitacionModel");
const ProyectoMiembroModel = require("../models/ProyectoMiembroModel");
const ProyectoModel = require("../models/ProyectoModel");
const UsuarioModel = require("../models/UsuarioModel");
const RolModel = require("../models/RolModel");
const NotificacionModel = require("../models/NotificacionModel");
const { emitirToken } = require("./authController");
const { ROLES } = require("../config/roles");
const emailService = require("../services/emailService");

function esLiderDelProyecto(req) {
  return req.user.rol_codigo === ROLES.ADMIN || req.rolProyecto === "lider";
}

// POST /api/proyectos/:id/invitaciones — solo el líder de ESE proyecto o un admin.
exports.crear = async (req, res) => {
  try {
    if (!esLiderDelProyecto(req)) {
      return res.status(403).json({ error: "Solo el líder de este proyecto puede invitar personas" });
    }
    const { correo, rol_proyecto } = req.body;
    if (!correo) return res.status(400).json({ error: "correo es requerido" });

    const invitacion = await InvitacionModel.create({
      correo,
      id_proyecto: req.id_proyecto,
      rol_proyecto: rol_proyecto === "lider" ? "lider" : "colaborador",
      invitado_por: req.user.id_usuario,
    });

    const [proyecto, invitador] = await Promise.all([
      ProyectoModel.getById(req.id_proyecto),
      UsuarioModel.getById(req.user.id_usuario),
    ]);
    emailService.enviarInvitacion(correo, {
      proyectoNombre: proyecto ? proyecto.nombre : "un proyecto",
      invitadorNombre: invitador ? invitador.nombre : "Un compañero",
      token: invitacion.token,
    });

    res.status(201).json(invitacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/proyectos/:id/invitaciones — pendientes de ESE proyecto.
exports.listarPorProyecto = async (req, res) => {
  try {
    if (!esLiderDelProyecto(req)) {
      return res.status(403).json({ error: "Solo el líder de este proyecto puede ver sus invitaciones" });
    }
    const data = await InvitacionModel.getPendientesPorProyecto(req.id_proyecto);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/invitaciones/:token — público, para que invite-accept.html muestre el contexto.
exports.consultar = async (req, res) => {
  try {
    const invitacion = await InvitacionModel.getByToken(req.params.token);
    if (!invitacion) return res.status(404).json({ error: "Invitación no encontrada" });

    const expirada = new Date(invitacion.fecha_expiracion) < new Date();
    if (invitacion.estado !== "pendiente" || expirada) {
      return res.status(410).json({ error: "Esta invitación ya no está disponible" });
    }

    const usuarioExistente = await UsuarioModel.getByCorreo(invitacion.correo);

    res.json({
      correo: invitacion.correo,
      proyecto_nombre: invitacion.proyecto_nombre,
      invitado_por_nombre: invitacion.invitado_por_nombre,
      rol_proyecto: invitacion.rol_proyecto,
      requiere_cuenta_nueva: !usuarioExistente,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/invitaciones/:token/aceptar — público. Crea cuenta si hace falta
// (nombre + contrasena en el body) o solo une al proyecto si ya existe.
exports.aceptar = async (req, res) => {
  try {
    const invitacion = await InvitacionModel.getByToken(req.params.token);
    if (!invitacion) return res.status(404).json({ error: "Invitación no encontrada" });

    const expirada = new Date(invitacion.fecha_expiracion) < new Date();
    if (invitacion.estado !== "pendiente" || expirada) {
      return res.status(410).json({ error: "Esta invitación ya no está disponible" });
    }

    let usuario = await UsuarioModel.getByCorreo(invitacion.correo);

    if (!usuario) {
      const { nombre, contrasena } = req.body;
      if (!nombre || !contrasena) {
        return res.status(400).json({ error: "nombre y contrasena son requeridos para crear tu cuenta" });
      }
      const rolBase = await RolModel.getByCodigo(ROLES.COLABORADOR);
      await UsuarioModel.create({ nombre, correo: invitacion.correo, contrasena, id_rol: rolBase.id_rol });
      usuario = await UsuarioModel.getByCorreo(invitacion.correo);
    } else {
      // El correo invitado ya tiene cuenta: para evitar que cualquiera con el
      // enlace se "vuelva" ese usuario, exigimos que quien acepta esté
      // autenticado como el dueño real de esa cuenta.
      if (!req.user || req.user.id_usuario !== usuario.id_usuario) {
        return res.status(401).json({
          error: "Ya existe una cuenta con este correo. Inicia sesión con esa cuenta para aceptar la invitación.",
        });
      }
    }

    // Invitar como líder de un proyecto también habilita el rol global LIDER
    // (lo necesita para poder crear sus propios proyectos más adelante).
    if (invitacion.rol_proyecto === "lider" && usuario.rol_codigo === ROLES.COLABORADOR) {
      const rolLider = await RolModel.getByCodigo(ROLES.LIDER);
      await UsuarioModel.actualizarRol(usuario.id_usuario, rolLider.id_rol);
      usuario = await UsuarioModel.getByCorreo(invitacion.correo);
    }

    await ProyectoMiembroModel.add(invitacion.id_proyecto, usuario.id_usuario, invitacion.rol_proyecto);
    await InvitacionModel.marcarAceptada(invitacion.id_invitacion);
    await NotificacionModel.create({
      id_usuario: usuario.id_usuario,
      tipo: "invitacion",
      titulo: "Te uniste a un proyecto",
      mensaje: `Ahora eres ${invitacion.rol_proyecto === "lider" ? "líder" : "colaborador"} de "${invitacion.proyecto_nombre}"`,
      enlace: `project.html?id=${invitacion.id_proyecto}`,
      id_proyecto: invitacion.id_proyecto,
      referencia_tipo: "invitacion",
      referencia_id: invitacion.id_invitacion,
    });

    const usuarioFinal = await UsuarioModel.getById(usuario.id_usuario);
    const token = emitirToken(usuarioFinal);

    res.json({ mensaje: "Invitación aceptada", token, usuario: usuarioFinal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
