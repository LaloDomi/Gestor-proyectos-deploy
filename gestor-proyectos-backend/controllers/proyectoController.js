const ProyectoModel = require("../models/ProyectoModel");
const ProyectoMiembroModel = require("../models/ProyectoMiembroModel");
const ChatCanalModel = require("../models/ChatCanalModel");
const { ROLES } = require("../config/roles");

exports.getAll = async (req, res) => {
  try {
    const data =
      req.user.rol_codigo === ROLES.ADMIN
        ? await ProyectoModel.getAll()
        : await ProyectoModel.getAllPorMiembro(req.user.id_usuario);
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

// El creador (ADMIN o LIDER) siempre queda como responsable y como
// miembro 'lider' del proyecto — no se puede asignar el proyecto a otra
// persona al crearlo, solo delegarlo después vía gestión de miembros.
exports.create = async (req, res) => {
  try {
    const { nombre, fecha_inicio, id_estado } = req.body;
    if (!nombre || !fecha_inicio || !id_estado) {
      return res.status(400).json({
        error: "nombre, fecha_inicio e id_estado son requeridos",
      });
    }
    const data = await ProyectoModel.create({
      ...req.body,
      id_responsable: req.user.id_usuario,
    });
    await ProyectoMiembroModel.add(data.id_proyecto, req.user.id_usuario, "lider");
    await ChatCanalModel.getOrCreateProyecto(data.id_proyecto);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function esLiderDelProyecto(req) {
  return req.user.rol_codigo === ROLES.ADMIN || req.rolProyecto === "lider";
}

exports.update = async (req, res) => {
  try {
    if (!esLiderDelProyecto(req)) {
      return res.status(403).json({ error: "Solo el líder de este proyecto puede editarlo" });
    }
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
    if (!esLiderDelProyecto(req)) {
      return res.status(403).json({ error: "Solo el líder de este proyecto puede eliminarlo" });
    }
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
    const data =
      req.user.rol_codigo === ROLES.ADMIN
        ? await ProyectoModel.getAvance()
        : await ProyectoModel.getAvancePorMiembro(req.user.id_usuario);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------- Miembros ----------

exports.getMiembros = async (req, res) => {
  try {
    const data = await ProyectoMiembroModel.getByProyecto(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMiembro = async (req, res) => {
  try {
    if (!esLiderDelProyecto(req)) {
      return res.status(403).json({ error: "Solo el líder de este proyecto puede añadir miembros" });
    }
    const { id_usuario, rol_proyecto } = req.body;
    if (!id_usuario) return res.status(400).json({ error: "id_usuario es requerido" });
    const data = await ProyectoMiembroModel.add(req.params.id, id_usuario, rol_proyecto || "colaborador");
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMiembroRol = async (req, res) => {
  try {
    if (!esLiderDelProyecto(req)) {
      return res.status(403).json({ error: "Solo el líder de este proyecto puede cambiar roles" });
    }
    const { rol_proyecto } = req.body;
    if (!rol_proyecto) return res.status(400).json({ error: "rol_proyecto es requerido" });
    const data = await ProyectoMiembroModel.updateRol(req.params.id, req.params.idUsuario, rol_proyecto);
    if (!data) return res.status(404).json({ error: "Miembro no encontrado" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeMiembro = async (req, res) => {
  try {
    if (!esLiderDelProyecto(req)) {
      return res.status(403).json({ error: "Solo el líder de este proyecto puede quitar miembros" });
    }
    const data = await ProyectoMiembroModel.remove(req.params.id, req.params.idUsuario);
    if (!data) return res.status(404).json({ error: "Miembro no encontrado" });
    res.json({ mensaje: "Miembro eliminado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
