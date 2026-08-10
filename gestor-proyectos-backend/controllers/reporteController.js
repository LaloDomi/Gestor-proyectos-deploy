const ReporteModel = require("../models/ReporteModel");

exports.getAll = async (req, res) => {
  try {
    const data = await ReporteModel.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await ReporteModel.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Reporte no encontrado" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { titulo, id_proyecto, id_usuario } = req.body;
    if (!titulo || !id_proyecto || !id_usuario) {
      return res.status(400).json({ error: "titulo, id_proyecto e id_usuario son requeridos" });
    }
    const data = await ReporteModel.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existente = await ReporteModel.getById(req.params.id);
    if (!existente) return res.status(404).json({ error: "Reporte no encontrado" });
    const data = await ReporteModel.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await ReporteModel.remove(req.params.id);
    if (!data) return res.status(404).json({ error: "Reporte no encontrado" });
    res.json({ mensaje: "Reporte eliminado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
