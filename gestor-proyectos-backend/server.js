require("dotenv").config();

const app = require("./app");
const { pool } = require("./config/db");

const PORT = process.env.PORT || 3000;

// Verificar conexión con PostgreSQL
pool.query("SELECT NOW()")
  .then(() => {
    console.log("✅ Conectado a Supabase PostgreSQL");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar con la base de datos:", err.message);
    process.exit(1);
  });