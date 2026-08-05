const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const ChatCanalModel = require("../../models/ChatCanalModel");
const ChatMensajeModel = require("../../models/ChatMensajeModel");
const UsuarioModel = require("../../models/UsuarioModel");

module.exports = function initSocket(httpServer) {
  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error("No autenticado"));
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Token inválido o expirado"));
    }
  });

  io.on("connection", (socket) => {
    // Sala personal — útil a futuro para notificaciones push por socket.
    socket.join(`usuario:${socket.user.id_usuario}`);

    socket.on("canal:unirse", async ({ id_canal }, callback) => {
      try {
        const canal = await ChatCanalModel.getById(id_canal);
        if (!canal) return callback && callback({ error: "Canal no encontrado" });

        const tieneAcceso = await ChatCanalModel.usuarioTieneAcceso(canal, socket.user);
        if (!tieneAcceso) return callback && callback({ error: "No perteneces a este canal" });

        socket.join(`canal:${id_canal}`);
        callback && callback({ ok: true });
      } catch (err) {
        callback && callback({ error: err.message });
      }
    });

    socket.on("mensaje:enviar", async ({ id_canal, contenido }, callback) => {
      try {
        if (!contenido || !contenido.trim()) return callback && callback({ error: "Mensaje vacío" });
        if (!socket.rooms.has(`canal:${id_canal}`)) {
          return callback && callback({ error: "Únete al canal antes de enviar mensajes" });
        }

        const mensaje = await ChatMensajeModel.create({
          id_canal,
          id_usuario: socket.user.id_usuario,
          contenido: contenido.trim().slice(0, 2000),
        });
        const usuario = await UsuarioModel.getById(socket.user.id_usuario);
        const mensajeCompleto = { ...mensaje, usuario_nombre: usuario.nombre };

        io.to(`canal:${id_canal}`).emit("mensaje:nuevo", mensajeCompleto);
        callback && callback({ ok: true, mensaje: mensajeCompleto });
      } catch (err) {
        callback && callback({ error: err.message });
      }
    });
  });

  return io;
};
