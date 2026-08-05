const VideollamadaModel = require("../models/VideollamadaModel");
const ProyectoMiembroModel = require("../models/ProyectoMiembroModel");
const ProyectoModel = require("../models/ProyectoModel");
const NotificacionModel = require("../models/NotificacionModel");

// POST /api/proyectos/:id/videollamadas — inicia una llamada nueva o se une
// a la que ya esté activa para no partir al equipo en dos salas distintas.
exports.iniciarOUnirse = async (req, res) => {
  try {
    const activa = await VideollamadaModel.getActivaReciente(req.id_proyecto);
    if (activa) return res.json({ ...activa, nueva: false });

    const llamada = await VideollamadaModel.create({
      id_proyecto: req.id_proyecto,
      titulo: req.body.titulo,
      creado_por: req.user.id_usuario,
    });

    const [miembros, proyecto] = await Promise.all([
      ProyectoMiembroModel.getByProyecto(req.id_proyecto),
      ProyectoModel.getById(req.id_proyecto),
    ]);
    for (const m of miembros) {
      if (m.id_usuario === req.user.id_usuario) continue;
      await NotificacionModel.create({
        id_usuario: m.id_usuario,
        tipo: "videollamada",
        titulo: "Videollamada en curso",
        mensaje: `Hay una videollamada activa en "${proyecto ? proyecto.nombre : "un proyecto"}"`,
        enlace: `videollamada.html?proyecto=${req.id_proyecto}`,
        id_proyecto: req.id_proyecto,
        referencia_tipo: "videollamada",
        referencia_id: llamada.id_llamada,
      });
    }

    res.status(201).json({ ...llamada, nueva: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listarPorProyecto = async (req, res) => {
  try {
    const data = await VideollamadaModel.getByProyecto(req.id_proyecto);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
