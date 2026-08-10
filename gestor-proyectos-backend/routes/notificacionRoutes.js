const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificacionController");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/", controller.getAll);
router.put("/marcar-todas", controller.marcarTodasLeidas);
router.put("/:id/leida", controller.marcarLeida);

module.exports = router;
