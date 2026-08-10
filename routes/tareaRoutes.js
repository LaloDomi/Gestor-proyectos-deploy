const express = require("express");
const router = express.Router();
const controller = require("../controllers/tareaController");
const TareaModel = require("../models/TareaModel");
const { authenticate, requireProjectMembership } = require("../middleware/auth");

const porIdDeProyectoEnParametro = (req) => req.params.id_proyecto;
const porIdDeProyectoEnBody = (req) => req.body.id_proyecto;
const porProyectoDeLaTarea = async (req) => {
  const tarea = await TareaModel.getById(req.params.id);
  return tarea && tarea.id_proyecto;
};

router.use(authenticate);

router.get("/", controller.getAll);
router.get("/stats/estado", controller.contarPorEstado);
router.get("/stats/prioridad", controller.contarPorPrioridad);
router.get("/proyecto/:id_proyecto", requireProjectMembership(porIdDeProyectoEnParametro), controller.getByProyecto);
router.get("/:id", requireProjectMembership(porProyectoDeLaTarea), controller.getById);
router.post("/", requireProjectMembership(porIdDeProyectoEnBody), controller.create);
router.put("/:id", requireProjectMembership(porProyectoDeLaTarea), controller.update);
router.delete("/:id", requireProjectMembership(porProyectoDeLaTarea), controller.remove);

module.exports = router;
