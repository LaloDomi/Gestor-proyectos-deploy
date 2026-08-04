const PrioridadModel = require("../models/PrioridadModel");

exports.getAll = async (req, res) => {
  try {
    const data = await PrioridadModel.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await PrioridadModel.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Prioridad no encontrada" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.body.nombre_prioridad) {
      return res.status(400).json({ error: "nombre_prioridad es requerido" });
    }
    const data = await PrioridadModel.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existente = await PrioridadModel.getById(req.params.id);
    if (!existente) return res.status(404).json({ error: "Prioridad no encontrada" });
    const data = await PrioridadModel.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await PrioridadModel.remove(req.params.id);
    if (!data) return res.status(404).json({ error: "Prioridad no encontrada" });
    res.json({ mensaje: "Prioridad eliminada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
