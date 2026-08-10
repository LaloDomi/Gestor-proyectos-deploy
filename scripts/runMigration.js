/**
 * Ejecuta un archivo .sql de migrations/ contra la base configurada en DATABASE_URL.
 * Uso: node scripts/runMigration.js migrations/001_fase0_auth.sql
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const archivo = process.argv[2];
if (!archivo) {
  console.error("Uso: node scripts/runMigration.js <ruta-al-archivo-sql>");
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(archivo), "utf8");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool
  .query(sql)
  .then(() => {
    console.log(`✅ Migración aplicada: ${archivo}`);
    return pool.end();
  })
  .catch((err) => {
    console.error(`❌ Error al aplicar ${archivo}:`, err.message);
    return pool.end().finally(() => process.exit(1));
  });
