const express = require("express");
const router = express.Router();
const controller = require("../controllers/invitacionController");
const { optionalAuthenticate } = require("../middleware/auth");

// Públicas: quien recibe el enlace de invitación todavía no tiene sesión.
// optionalAuthenticate permite distinguir, sin bloquear, si además viene con
// un JWT válido (lo necesita "aceptar" cuando el correo ya tiene cuenta).
router.get("/:token", controller.consultar);
router.post("/:token/aceptar", optionalAuthenticate, controller.aceptar);

module.exports = router;
