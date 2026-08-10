const TareaModel = require("../models/TareaModel");
const NotificacionModel = require("../models/NotificacionModel");
const { ROLES } = require("../config/roles");
const { fechaISO } = require("../utils/fecha");

exports.getAll = async (req, res) => {
  try {
    const data =
      req.user.rol_codigo === ROLES.ADMIN
        ? await TareaModel.getAll()
        : await TareaModel.getAllPorMiembro(req.user.id_usuario);
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

function esLiderDelProyecto(req) {
  return req.user.rol_codigo === ROLES.ADMIN || req.rolProyecto === "lider";
}

exports.create = async (req, res) => {
  try {
    if (!esLiderDelProyecto(req)) {
      return res.status(403).json({ error: "Solo el líder de este proyecto puede crear tareas" });
    }
    const { titulo, fecha_inicio, fecha_limite, id_prioridad, id_estado, id_proyecto, id_responsable } = req.body;
    if (!titulo || !fecha_inicio || !fecha_limite || !id_prioridad || !id_estado || !id_proyecto || !id_responsable) {
      return res.status(400).json({
        error:
          "titulo, fecha_inicio, fecha_limite, id_prioridad, id_estado, id_proyecto e id_responsable son requeridos",
      });
    }
    const data = await TareaModel.create(req.body);

    if (data.id_responsable !== req.user.id_usuario) {
      await NotificacionModel.create({
        id_usuario: data.id_responsable,
        tipo: "tarea_asignada",
        titulo: "Nueva tarea asignada",
        mensaje: `Se te asignó "${data.titulo}", vence el ${fechaISO(data.fecha_limite)}`,
        enlace: `project.html?id=${data.id_proyecto}`,
        id_proyecto: data.id_proyecto,
        referencia_tipo: "tarea",
        referencia_id: data.id_tarea,
      });
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existente = await TareaModel.getById(req.params.id);
    if (!existente) return res.status(404).json({ error: "Tarea no encontrada" });

    let body = req.body;
    if (!esLiderDelProyecto(req)) {
      // Un colaborador del proyecto solo puede mover sus propias tareas de
      // columna (kanban), no editar el resto de campos ni tareas ajenas.
      if (existente.id_responsable !== req.user.id_usuario) {
        return res.status(403).json({ error: "No puedes editar una tarea que no tienes asignada" });
      }
      body = { ...existente, id_estado: req.body.id_estado ?? existente.id_estado };
    }

    const data = await TareaModel.update(req.params.id, body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    if (!esLiderDelProyecto(req)) {
      return res.status(403).json({ error: "Solo el líder de este proyecto puede eliminar tareas" });
    }
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
