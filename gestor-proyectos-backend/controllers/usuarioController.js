const UsuarioModel = require("../models/UsuarioModel");

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

exports.remove = async (req, res) => {
  try {
    const data = await UsuarioModel.remove(req.params.id);
    if (!data) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario eliminado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login simple (comparación directa, solo para pruebas - ver nota de seguridad en README)
exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
      return res.status(400).json({ error: "correo y contrasena son requeridos" });
    }
    const usuario = await UsuarioModel.getByCorreo(correo);
    if (!usuario || usuario.contrasena !== contrasena) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    const { contrasena: _omit, ...usuarioSinPassword } = usuario;
    res.json({ mensaje: "Login exitoso", usuario: usuarioSinPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
