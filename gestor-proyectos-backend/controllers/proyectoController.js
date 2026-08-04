const ProyectoModel = require("../models/ProyectoModel");

exports.getAll = async (req, res) => {
  try {
    const data = await ProyectoModel.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await ProyectoModel.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Proyecto no encontrado" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, fecha_inicio, id_estado, id_responsable } = req.body;
    if (!nombre || !fecha_inicio || !id_estado || !id_responsable) {
      return res.status(400).json({
        error: "nombre, fecha_inicio, id_estado e id_responsable son requeridos",
      });
    }
    const data = await ProyectoModel.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existente = await ProyectoModel.getById(req.params.id);
    if (!existente) return res.status(404).json({ error: "Proyecto no encontrado" });
    const data = await ProyectoModel.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await ProyectoModel.remove(req.params.id);
    if (!data) return res.status(404).json({ error: "Proyecto no encontrado" });
    res.json({ mensaje: "Proyecto eliminado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/proyectos/avance -> porcentaje de avance por proyecto
exports.getAvance = async (req, res) => {
  try {
    const data = await ProyectoModel.getAvance();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
