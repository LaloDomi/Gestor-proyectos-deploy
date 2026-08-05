const express = require("express");
const router = express.Router();
const controller = require("../controllers/iaController");
const { authenticate, requireProjectMembership } = require("../middleware/auth");

const porIdDeParametro = (req) => req.params.id;

router.use(authenticate);

router.get("/proyectos/:id/reportes", requireProjectMembership(porIdDeParametro), controller.listarReportes);
router.post("/proyectos/:id/resumen", requireProjectMembership(porIdDeParametro), controller.resumen);
router.post("/proyectos/:id/preguntar", requireProjectMembership(porIdDeParametro), controller.preguntar);
router.post("/proyectos/:id/reporte", requireProjectMembership(porIdDeParametro), controller.reporte);

module.exports = router;
