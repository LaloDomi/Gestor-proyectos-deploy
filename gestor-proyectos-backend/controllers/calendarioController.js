const CalendarioModel = require("../models/CalendarioModel");

exports.getAll = async (req, res) => {
  try {
    const data = await CalendarioModel.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await CalendarioModel.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Evento no encontrado" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { titulo, fecha, hora } = req.body;
    if (!titulo || !fecha || !hora) {
      return res.status(400).json({ error: "titulo, fecha y hora son requeridos" });
    }
    const data = await CalendarioModel.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existente = await CalendarioModel.getById(req.params.id);
    if (!existente) return res.status(404).json({ error: "Evento no encontrado" });
    const data = await CalendarioModel.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await CalendarioModel.remove(req.params.id);
    if (!data) return res.status(404).json({ error: "Evento no encontrado" });
    res.json({ mensaje: "Evento eliminado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
