const EstadoModel = require("../models/EstadoModel");

exports.getAll = async (req, res) => {
  try {
    const data = await EstadoModel.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await EstadoModel.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Estado no encontrado" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.body.nombre_estado) {
      return res.status(400).json({ error: "nombre_estado es requerido" });
    }
    const data = await EstadoModel.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existente = await EstadoModel.getById(req.params.id);
    if (!existente) return res.status(404).json({ error: "Estado no encontrado" });
    const data = await EstadoModel.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await EstadoModel.remove(req.params.id);
    if (!data) return res.status(404).json({ error: "Estado no encontrado" });
    res.json({ mensaje: "Estado eliminado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
