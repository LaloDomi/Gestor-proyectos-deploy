const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const invitacionRoutes = require("./routes/invitacionRoutes");
const notificacionRoutes = require("./routes/notificacionRoutes");
const chatRoutes = require("./routes/chatRoutes");
const iaRoutes = require("./routes/iaRoutes");
const rolRoutes = require("./routes/rolRoutes");
const estadoRoutes = require("./routes/estadoRoutes");
const prioridadRoutes = require("./routes/prioridadRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const proyectoRoutes = require("./routes/proyectoRoutes");
const tareaRoutes = require("./routes/tareaRoutes");
const calendarioRoutes = require("./routes/calendarioRoutes");
const reporteRoutes = require("./routes/reporteRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de salud / bienvenida
app.get("/", (req, res) => {
  res.json({
    mensaje: "API GestorProyectos funcionando correctamente",
    endpoints: [
      "/api/auth/register (POST)",
      "/api/auth/login (POST)",
      "/api/roles",
      "/api/estados",
      "/api/prioridades",
      "/api/usuarios",
      "/api/proyectos",
      "/api/proyectos/avance",
      "/api/proyectos/:id/miembros",
      "/api/proyectos/:id/invitaciones",
      "/api/invitaciones/:token",
      "/api/invitaciones/:token/aceptar (POST)",
      "/api/tareas",
      "/api/tareas/stats/estado",
      "/api/tareas/stats/prioridad",
      "/api/tareas/proyecto/:id_proyecto",
      "/api/calendario",
      "/api/reportes",
    ],
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/invitaciones", invitacionRoutes);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/estados", estadoRoutes);
app.use("/api/prioridades", prioridadRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);
app.use("/api/calendario", calendarioRoutes);
app.use("/api/reportes", reporteRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejador de errores genérico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;
