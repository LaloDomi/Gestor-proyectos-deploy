const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UsuarioModel = require("../models/UsuarioModel");
const RolModel = require("../models/RolModel");
const { ROLES } = require("../config/roles");
const emailService = require("../services/emailService");

function emitirToken(usuario) {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      id_rol: usuario.id_rol,
      rol_codigo: usuario.rol_codigo,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

exports.emitirToken = emitirToken;

function omitirContrasena(usuario) {
  const { contrasena, ...resto } = usuario;
  return resto;
}

// Registro público: nadie elige su rol. Todo usuario nuevo entra como
// Colaborador sin proyecto asignado; el admin/líder lo asigna después.
exports.register = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: "nombre, correo y contrasena son requeridos" });
    }

    const existente = await UsuarioModel.getByCorreo(correo);
    if (existente) {
      return res.status(409).json({ error: "Ya existe un usuario con ese correo" });
    }

    const rolBase = await RolModel.getByCodigo(ROLES.COLABORADOR);
    if (!rolBase) {
      return res.status(500).json({ error: "No se encontró el rol base Colaborador" });
    }

    const usuario = await UsuarioModel.create({ nombre, correo, contrasena, id_rol: rolBase.id_rol });
    const usuarioConRol = await UsuarioModel.getById(usuario.id_usuario);

    // La verificación de correo es informativa, no bloquea el acceso (ver
    // límite del plan gratuito de Resend documentado en el README).
    const tokenVerificacion = crypto.randomBytes(24).toString("hex");
    await UsuarioModel.setTokenVerificacion(usuario.id_usuario, tokenVerificacion);
    emailService.enviarVerificacion(usuarioConRol, tokenVerificacion);

    const token = emitirToken(usuarioConRol);

    res.status(201).json({ mensaje: "Registro exitoso", token, usuario: usuarioConRol });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
      return res.status(400).json({ error: "correo y contrasena son requeridos" });
    }

    const usuario = await UsuarioModel.getByCorreo(correo);
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!coincide) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (usuario.estado_cuenta === "suspendido") {
      return res.status(403).json({ error: "Esta cuenta está suspendida" });
    }

    const token = emitirToken(usuario);
    res.json({ mensaje: "Login exitoso", token, usuario: omitirContrasena(usuario) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/verify-email?token=... — público, viene de un enlace de correo.
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "token es requerido" });

    const usuario = await UsuarioModel.getByTokenVerificacion(token);
    if (!usuario) {
      return res.status(400).json({ error: "El enlace de verificación no es válido o ya expiró" });
    }

    await UsuarioModel.marcarCorreoVerificado(usuario.id_usuario);
    res.json({ mensaje: "Correo verificado correctamente", correo: usuario.correo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/resend-verification — reenvía el correo al usuario autenticado.
exports.resendVerification = async (req, res) => {
  try {
    const usuario = await UsuarioModel.getById(req.user.id_usuario);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    if (usuario.correo_verificado) {
      return res.json({ mensaje: "Tu correo ya estaba verificado" });
    }

    const tokenVerificacion = crypto.randomBytes(24).toString("hex");
    await UsuarioModel.setTokenVerificacion(usuario.id_usuario, tokenVerificacion);
    await emailService.enviarVerificacion(usuario, tokenVerificacion);

    res.json({ mensaje: "Correo de verificación reenviado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
