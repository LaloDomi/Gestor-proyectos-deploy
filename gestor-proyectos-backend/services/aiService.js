const { GoogleGenerativeAI } = require("@google/generative-ai");
const ProyectoModel = require("../models/ProyectoModel");
const TareaModel = require("../models/TareaModel");
const ProyectoMiembroModel = require("../models/ProyectoMiembroModel");
const { fechaISO } = require("../utils/fecha");

const MODELO = process.env.GEMINI_MODEL || "gemini-flash-latest";
const MAX_TAREAS_EN_CONTEXTO = 60;

function getModel() {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error("El asistente de IA no está configurado (falta GEMINI_API_KEY).");
    err.noConfigurado = true;
    throw err;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: MODELO });
}

async function buildProjectContext(id_proyecto) {
  const [proyecto, tareas, miembros] = await Promise.all([
    ProyectoModel.getById(id_proyecto),
    TareaModel.getByProyecto(id_proyecto),
    ProyectoMiembroModel.getByProyecto(id_proyecto),
  ]);

  if (!proyecto) return null;

  const total = tareas.length;
  const finalizadas = tareas.filter((t) => t.estado === "Finalizado").length;
  const pct = total ? Math.round((finalizadas / total) * 100) : 0;
  const hoy = new Date();
  const vencidas = tareas.filter((t) => t.estado !== "Finalizado" && t.estado !== "Cancelado" && new Date(t.fecha_limite) < hoy);

  const tareasTexto = tareas
    .slice(0, MAX_TAREAS_EN_CONTEXTO)
    .map((t) => `- [#${t.id_tarea}] "${t.titulo}" · estado: ${t.estado} · prioridad: ${t.prioridad} · responsable: ${t.responsable} · vence: ${fechaISO(t.fecha_limite)}`)
    .join("\n");
  const recorte = total > MAX_TAREAS_EN_CONTEXTO ? `\n(...y ${total - MAX_TAREAS_EN_CONTEXTO} tarea(s) más, no listadas por espacio)` : "";

  return `
PROYECTO: ${proyecto.nombre}
Descripción: ${proyecto.descripcion || "(sin descripción)"}
Estado del proyecto: ${proyecto.estado}
Fecha inicio: ${fechaISO(proyecto.fecha_inicio)} · Fecha fin: ${proyecto.fecha_fin ? fechaISO(proyecto.fecha_fin) : "(sin definir)"}
Responsable: ${proyecto.responsable}
Miembros del equipo: ${miembros.map((m) => `${m.nombre} (${m.rol_proyecto})`).join(", ") || "(ninguno registrado)"}

AVANCE: ${finalizadas}/${total} tareas finalizadas (${pct}%)
TAREAS VENCIDAS SIN COMPLETAR: ${vencidas.length}

TAREAS (${total} en total):
${tareasTexto || "(este proyecto todavía no tiene tareas)"}${recorte}
`.trim();
}

const INSTRUCCION_BASE =
  "Eres el asistente de proyectos de ProjectFlow. Respondes SIEMPRE en español, de forma breve y concreta. " +
  "Usa ÚNICAMENTE la información del contexto de datos reales que se te da a continuación — nunca inventes tareas, " +
  "nombres o fechas que no aparezcan ahí. Si no hay suficiente información para responder algo, dilo explícitamente " +
  "en vez de adivinar.";

const TIMEOUT_MS = 25000;

function conTimeout(promesa, ms) {
  let temporizador;
  const limite = new Promise((_, reject) => {
    temporizador = setTimeout(() => reject(new Error("TIMEOUT")), ms);
  });
  return Promise.race([promesa, limite]).finally(() => clearTimeout(temporizador));
}

async function generar(prompt) {
  try {
    const model = getModel();
    const resultado = await conTimeout(model.generateContent(prompt), TIMEOUT_MS);
    return resultado.response.text().trim();
  } catch (err) {
    if (err.noConfigurado) throw err;
    if (err.message === "TIMEOUT") {
      throw new Error("El asistente tardó demasiado en responder. Intenta de nuevo en un momento.");
    }
    if (err.message && err.message.includes("429")) {
      throw new Error("El asistente está ocupado en este momento (límite de la API gratuita). Intenta de nuevo en unos segundos.");
    }
    if (err.message && err.message.includes("503")) {
      throw new Error("El servicio de IA está saturado ahora mismo. Intenta de nuevo en un momento.");
    }
    throw new Error("No se pudo generar la respuesta del asistente: " + err.message);
  }
}

exports.askAboutProject = async (id_proyecto, pregunta) => {
  const contexto = await buildProjectContext(id_proyecto);
  if (!contexto) return "No encontré ese proyecto.";
  return generar(`${INSTRUCCION_BASE}\n\n${contexto}\n\nPREGUNTA DEL USUARIO: ${pregunta}\n\nRespuesta:`);
};

exports.summarizeProject = async (id_proyecto) => {
  const contexto = await buildProjectContext(id_proyecto);
  if (!contexto) return "No encontré ese proyecto.";
  return generar(
    `${INSTRUCCION_BASE}\n\n${contexto}\n\n` +
      "Redacta un resumen de estado de 3 a 5 líneas: menciona el avance general, si hay tareas vencidas y cuáles son " +
      "los próximos vencimientos importantes. Sé directo, como si se lo reportaras a un líder de proyecto."
  );
};

exports.draftStatusReport = async (id_proyecto) => {
  const contexto = await buildProjectContext(id_proyecto);
  if (!contexto) return null;
  const texto = await generar(
    `${INSTRUCCION_BASE}\n\n${contexto}\n\n` +
      "Redacta un reporte de avance formal para este proyecto. Responde EXACTAMENTE en este formato, sin nada más:\n" +
      "TITULO: <un título breve, menos de 80 caracteres>\n" +
      "CUERPO: <4 a 8 líneas cubriendo avance general, logros recientes, riesgos/tareas vencidas si las hay, y próximos pasos>"
  );

  const matchTitulo = texto.match(/TITULO:\s*(.+)/i);
  const matchCuerpo = texto.match(/CUERPO:\s*([\s\S]+)/i);
  return {
    titulo: matchTitulo ? matchTitulo[1].trim().slice(0, 100) : "Reporte de avance generado por IA",
    descripcion: matchCuerpo ? matchCuerpo[1].trim() : texto,
  };
};
