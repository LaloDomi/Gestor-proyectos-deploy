/**
 * Migración puntual: convierte las contraseñas en texto plano que quedan de
 * antes de la Fase 0 (auth real) a hash bcrypt, sin forzar un reset a nadie.
 * Se puede correr varias veces sin problema: salta las filas que ya están
 * hasheadas (bcrypt siempre empieza con "$2").
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

async function main() {
  const { rows } = await pool.query(
    "SELECT id_usuario, contrasena FROM Usuarios WHERE contrasena NOT LIKE '$2%'"
  );

  if (rows.length === 0) {
    console.log("No hay contraseñas en texto plano pendientes de migrar.");
    await pool.end();
    return;
  }

  for (const { id_usuario, contrasena } of rows) {
    const hash = await bcrypt.hash(contrasena, 10);
    await pool.query("UPDATE Usuarios SET contrasena = $1 WHERE id_usuario = $2", [
      hash,
      id_usuario,
    ]);
    console.log(`✅ Usuario ${id_usuario}: contraseña migrada a bcrypt`);
  }

  console.log(`Listo: ${rows.length} contraseña(s) migrada(s).`);
  await pool.end();
}

main().catch((err) => {
  console.error("❌ Error migrando contraseñas:", err.message);
  process.exit(1);
});
