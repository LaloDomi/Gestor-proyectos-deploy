const NotificacionModel = require("../models/NotificacionModel");

exports.getAll = async (req, res) => {
  try {
    const data = await NotificacionModel.getByUsuario(req.user.id_usuario);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.marcarLeida = async (req, res) => {
  try {
    const data = await NotificacionModel.marcarLeida(req.params.id, req.user.id_usuario);
    if (!data) return res.status(404).json({ error: "Notificación no encontrada" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.marcarTodasLeidas = async (req, res) => {
  try {
    await NotificacionModel.marcarTodasLeidas(req.user.id_usuario);
    res.json({ mensaje: "Notificaciones marcadas como leídas" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
