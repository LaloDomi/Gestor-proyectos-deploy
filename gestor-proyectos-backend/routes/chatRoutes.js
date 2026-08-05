const express = require("express");
const router = express.Router();
const controller = require("../controllers/chatController");
const { authenticate, requireProjectMembership } = require("../middleware/auth");

router.use(authenticate);

router.get("/canales", controller.getCanales);
router.get("/proyecto/:idProyecto", requireProjectMembership((req) => req.params.idProyecto), controller.getCanalProyecto);
router.get("/directo/:idUsuario", controller.getCanalDirecto);
router.get("/canales/:id/mensajes", controller.getMensajes);

module.exports = router;
