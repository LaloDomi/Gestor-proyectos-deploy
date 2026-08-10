const RolModel = require("../models/RolModel");

exports.getAll = async (req, res) => {
  try {
    const data = await RolModel.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await RolModel.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Rol no encontrado" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.body.nombre_rol) {
      return res.status(400).json({ error: "nombre_rol es requerido" });
    }
    const data = await RolModel.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existente = await RolModel.getById(req.params.id);
    if (!existente) return res.status(404).json({ error: "Rol no encontrado" });
    const data = await RolModel.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await RolModel.remove(req.params.id);
    if (!data) return res.status(404).json({ error: "Rol no encontrado" });
    res.json({ mensaje: "Rol eliminado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
