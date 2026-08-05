const ChatCanalModel = require("../models/ChatCanalModel");
const ChatMensajeModel = require("../models/ChatMensajeModel");

exports.getCanales = async (req, res) => {
  try {
    const data = await ChatCanalModel.getCanalesDeUsuario(req.user.id_usuario);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/chat/proyecto/:idProyecto — obtiene (o crea) el canal grupal del
// proyecto. Requiere ser miembro (ver requireProjectMembership en la ruta).
exports.getCanalProyecto = async (req, res) => {
  try {
    const canal = await ChatCanalModel.getOrCreateProyecto(req.id_proyecto);
    res.json(canal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/chat/directo/:idUsuario — obtiene (o crea) el canal directo con esa persona.
exports.getCanalDirecto = async (req, res) => {
  try {
    const idOtro = Number(req.params.idUsuario);
    if (idOtro === req.user.id_usuario) {
      return res.status(400).json({ error: "No puedes abrir un chat directo contigo mismo" });
    }
    const canal = await ChatCanalModel.getOrCreateDirecto(req.user.id_usuario, idOtro);
    res.json(canal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMensajes = async (req, res) => {
  try {
    const canal = await ChatCanalModel.getById(req.params.id);
    if (!canal) return res.status(404).json({ error: "Canal no encontrado" });

    const tieneAcceso = await ChatCanalModel.usuarioTieneAcceso(canal, req.user);
    if (!tieneAcceso) return res.status(403).json({ error: "No perteneces a este canal" });

    const data = await ChatMensajeModel.getByCanal(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
