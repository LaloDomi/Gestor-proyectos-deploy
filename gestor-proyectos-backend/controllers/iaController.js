const aiService = require("../services/aiService");
const ReporteModel = require("../models/ReporteModel");

function manejarErrorIA(err, res) {
  const status = err.noConfigurado ? 503 : 500;
  res.status(status).json({ error: err.message });
}

// POST /api/ia/proyectos/:id/resumen
exports.resumen = async (req, res) => {
  try {
    const resumen = await aiService.summarizeProject(req.id_proyecto);
    res.json({ resumen });
  } catch (err) {
    manejarErrorIA(err, res);
  }
};

// POST /api/ia/proyectos/:id/preguntar — body: { pregunta }
exports.preguntar = async (req, res) => {
  try {
    const { pregunta } = req.body;
    if (!pregunta || !pregunta.trim()) {
      return res.status(400).json({ error: "pregunta es requerida" });
    }
    const respuesta = await aiService.askAboutProject(req.id_proyecto, pregunta.trim());
    res.json({ respuesta });
  } catch (err) {
    manejarErrorIA(err, res);
  }
};

// POST /api/ia/proyectos/:id/reporte — genera Y guarda un reporte (origen='ia').
exports.reporte = async (req, res) => {
  try {
    const borrador = await aiService.draftStatusReport(req.id_proyecto);
    if (!borrador) return res.status(404).json({ error: "Proyecto no encontrado" });

    const reporte = await ReporteModel.create({
      titulo: borrador.titulo,
      descripcion: borrador.descripcion,
      id_proyecto: req.id_proyecto,
      id_usuario: req.user.id_usuario,
      origen: "ia",
    });
    res.status(201).json(reporte);
  } catch (err) {
    manejarErrorIA(err, res);
  }
};

// GET /api/ia/proyectos/:id/reportes — historial de reportes del proyecto (manuales + IA).
exports.listarReportes = async (req, res) => {
  try {
    const data = await ReporteModel.getByProyecto(req.id_proyecto);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
