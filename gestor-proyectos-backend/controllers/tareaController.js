const TareaModel = require("../models/TareaModel");

exports.getAll = async (req, res) => {
  try {
    const data = await TareaModel.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await TareaModel.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByProyecto = async (req, res) => {
  try {
    const data = await TareaModel.getByProyecto(req.params.id_proyecto);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { titulo, fecha_inicio, fecha_limite, id_prioridad, id_estado, id_proyecto, id_responsable } = req.body;
    if (!titulo || !fecha_inicio || !fecha_limite || !id_prioridad || !id_estado || !id_proyecto || !id_responsable) {
      return res.status(400).json({
        error:
          "titulo, fecha_inicio, fecha_limite, id_prioridad, id_estado, id_proyecto e id_responsable son requeridos",
      });
    }
    const data = await TareaModel.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existente = await TareaModel.getById(req.params.id);
    if (!existente) return res.status(404).json({ error: "Tarea no encontrada" });
    const data = await TareaModel.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await TareaModel.remove(req.params.id);
    if (!data) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json({ mensaje: "Tarea eliminada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/tareas/stats/estado
exports.contarPorEstado = async (req, res) => {
  try {
    const data = await TareaModel.contarPorEstado();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/tareas/stats/prioridad
exports.contarPorPrioridad = async (req, res) => {
  try {
    const data = await TareaModel.contarPorPrioridad();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
