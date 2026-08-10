require("dotenv").config();
const http = require("http");

const app = require("./app");
const { pool } = require("./config/db");
const { iniciarCron } = require("./services/cronJobs");
const initSocket = require("./services/realtime");

const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app);
initSocket(httpServer);

// Verificar conexión con PostgreSQL
pool.query("SELECT NOW()")
  .then(() => {
    console.log("✅ Conectado a Supabase PostgreSQL");

    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      iniciarCron();
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar con la base de datos:", err.message);
    process.exit(1);
  });
