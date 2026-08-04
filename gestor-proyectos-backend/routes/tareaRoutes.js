const express = require("express");
const router = express.Router();
const controller = require("../controllers/tareaController");

router.get("/", controller.getAll);
router.get("/stats/estado", controller.contarPorEstado);
router.get("/stats/prioridad", controller.contarPorPrioridad);
router.get("/proyecto/:id_proyecto", controller.getByProyecto);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
