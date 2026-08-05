/**
 * Corre una sola vez el job de notificaciones de vencimientos, sin esperar
 * a las 07:00. Útil para probar Fase 2 manualmente.
 * Uso: node scripts/runCronOnce.js
 */
require("dotenv").config();
const { pool } = require("../config/db");
const { generarNotificacionesDeVencimientos } = require("../services/cronJobs");

generarNotificacionesDeVencimientos()
  .then((resumen) => {
    console.log("✅ Cron ejecutado:", resumen);
    return pool.end();
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
    return pool.end().finally(() => process.exit(1));
  });
