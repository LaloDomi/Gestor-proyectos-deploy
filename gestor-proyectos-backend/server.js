require("dotenv").config();
const app = require("./app");
const { poolPromise } = require("./config/db");

const PORT = process.env.PORT || 3000;

poolPromise
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("No se pudo iniciar el servidor por error de conexión a la BD:", err.message);
    process.exit(1);
  });
