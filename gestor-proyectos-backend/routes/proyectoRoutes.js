const express = require("express");
const router = express.Router();
const controller = require("../controllers/proyectoController");
const invitacionController = require("../controllers/invitacionController");
const videollamadaController = require("../controllers/videollamadaController");
const { authenticate, authorize, requireProjectMembership } = require("../middleware/auth");
const { ROLES } = require("../config/roles");

const porIdDeParametro = (req) => req.params.id;

router.use(authenticate);

router.get("/", controller.getAll);
router.get("/avance", controller.getAvance);
router.post("/", authorize(ROLES.ADMIN, ROLES.LIDER), controller.create);

router.get("/:id", requireProjectMembership(porIdDeParametro), controller.getById);
router.put("/:id", requireProjectMembership(porIdDeParametro), controller.update);
router.delete("/:id", requireProjectMembership(porIdDeParametro), controller.remove);

router.get("/:id/miembros", requireProjectMembership(porIdDeParametro), controller.getMiembros);
router.post("/:id/miembros", requireProjectMembership(porIdDeParametro), controller.addMiembro);
router.put("/:id/miembros/:idUsuario", requireProjectMembership(porIdDeParametro), controller.updateMiembroRol);
router.delete("/:id/miembros/:idUsuario", requireProjectMembership(porIdDeParametro), controller.removeMiembro);

router.get("/:id/invitaciones", requireProjectMembership(porIdDeParametro), invitacionController.listarPorProyecto);
router.post("/:id/invitaciones", requireProjectMembership(porIdDeParametro), invitacionController.crear);

router.get("/:id/videollamadas", requireProjectMembership(porIdDeParametro), videollamadaController.listarPorProyecto);
router.post("/:id/videollamadas", requireProjectMembership(porIdDeParametro), videollamadaController.iniciarOUnirse);

module.exports = router;
