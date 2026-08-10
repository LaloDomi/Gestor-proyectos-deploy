const jwt = require("jsonwebtoken");
const ProyectoMiembroModel = require("../models/ProyectoMiembroModel");
const { ROLES } = require("../config/roles");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// Igual que authenticate, pero nunca bloquea: si no hay token o es inválido,
// sigue con req.user = null. Úsalo en rutas públicas que se comportan
// distinto si quien llama resulta estar logueado (ej. aceptar invitación).
function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme === "Bearer" && token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

function authorize(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol_codigo)) {
      return res.status(403).json({ error: "No tienes permiso para esta acción" });
    }
    next();
  };
}

// resolveProyectoId(req) -> id_proyecto (puede ser async, ej. cuando hay que
// buscar primero la tarea para saber a qué proyecto pertenece).
// ADMIN siempre pasa. Para los demás, deja req.rolProyecto ('lider'/'colaborador').
function requireProjectMembership(resolveProyectoId) {
  return async (req, res, next) => {
    try {
      const id_proyecto = await resolveProyectoId(req);
      if (!id_proyecto) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }
      req.id_proyecto = id_proyecto;

      if (req.user.rol_codigo === ROLES.ADMIN) return next();

      const miembro = await ProyectoMiembroModel.getByProyectoYUsuario(id_proyecto, req.user.id_usuario);
      if (!miembro) {
        return res.status(403).json({ error: "No perteneces a este proyecto" });
      }
      req.rolProyecto = miembro.rol_proyecto;
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = { authenticate, optionalAuthenticate, authorize, requireProjectMembership };
