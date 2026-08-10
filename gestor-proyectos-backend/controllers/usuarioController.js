const UsuarioModel = require("../models/UsuarioModel");
const NotificacionModel = require("../models/NotificacionModel");

exports.getAll = async (req, res) => {
  try {
    const data = await UsuarioModel.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await UsuarioModel.getById(req.params.id);
    if (!data) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Creación de usuarios por un administrador (con rol explícito). El registro
// público (sin elegir rol) vive en authController.register.
exports.create = async (req, res) => {
  try {
    const { nombre, correo, contrasena, id_rol } = req.body;
    if (!nombre || !correo || !contrasena || !id_rol) {
      return res.status(400).json({
        error: "nombre, correo, contrasena e id_rol son requeridos",
      });
    }
    const existente = await UsuarioModel.getByCorreo(correo);
    if (existente) {
      return res.status(409).json({ error: "Ya existe un usuario con ese correo" });
    }
    const data = await UsuarioModel.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existente = await UsuarioModel.getById(req.params.id);
    if (!existente) return res.status(404).json({ error: "Usuario no encontrado" });
    const data = await UsuarioModel.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Solo ADMIN (ver routes/usuarioRoutes.js): cambia el rol global de un usuario.
exports.actualizarRol = async (req, res) => {
  try {
    const { id_rol } = req.body;
    if (!id_rol) return res.status(400).json({ error: "id_rol es requerido" });
    const existente = await UsuarioModel.getById(req.params.id);
    if (!existente) return res.status(404).json({ error: "Usuario no encontrado" });
    const data = await UsuarioModel.actualizarRol(req.params.id, id_rol);
    await NotificacionModel.create({
      id_usuario: Number(req.params.id),
      tipo: "rol_cambiado",
      titulo: "Tu rol cambió",
      mensaje: `Un administrador actualizó tu rol. Vuelve a iniciar sesión para que se aplique.`,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await UsuarioModel.remove(req.params.id);
    if (!data) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario eliminado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
