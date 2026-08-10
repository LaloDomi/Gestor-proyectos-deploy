const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const CAMPOS_PUBLICOS = `
  u.id_usuario,
  u.nombre,
  u.correo,
  u.id_rol,
  r.nombre_rol,
  r.codigo AS rol_codigo,
  u.correo_verificado,
  u.estado_cuenta,
  u.fecha_registro
`;

class UsuarioModel {
  static async getAll() {
    const result = await pool.query(`
      SELECT ${CAMPOS_PUBLICOS}
      FROM Usuarios u
      INNER JOIN Roles r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario
    `);

    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      `
      SELECT ${CAMPOS_PUBLICOS}
      FROM Usuarios u
      INNER JOIN Roles r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1
      `,
      [id]
    );

    return result.rows[0];
  }

  static async create({ nombre, correo, contrasena, id_rol }) {
    const hash = await bcrypt.hash(contrasena, 10);
    const result = await pool.query(
      `
      INSERT INTO Usuarios
      (nombre, correo, contrasena, id_rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id_usuario, nombre, correo, id_rol, correo_verificado, estado_cuenta, fecha_registro
      `,
      [nombre, correo, hash, id_rol]
    );

    return result.rows[0];
  }

  static async update(id, { nombre, correo, id_rol }) {
    const result = await pool.query(
      `
      UPDATE Usuarios
      SET nombre = $1, correo = $2, id_rol = $3
      WHERE id_usuario = $4
      RETURNING id_usuario, nombre, correo, id_rol, correo_verificado, estado_cuenta, fecha_registro
      `,
      [nombre, correo, id_rol, id]
    );

    return result.rows[0];
  }

  static async actualizarRol(id, id_rol) {
    const result = await pool.query(
      `
      UPDATE Usuarios
      SET id_rol = $1
      WHERE id_usuario = $2
      RETURNING id_usuario, nombre, correo, id_rol
      `,
      [id_rol, id]
    );

    return result.rows[0];
  }

  static async cambiarPassword(id, contrasenaPlano) {
    const hash = await bcrypt.hash(contrasenaPlano, 10);
    const result = await pool.query(
      `
      UPDATE Usuarios
      SET contrasena = $1
      WHERE id_usuario = $2
      RETURNING id_usuario
      `,
      [hash, id]
    );

    return result.rows[0];
  }

  static async marcarCorreoVerificado(id) {
    const result = await pool.query(
      `
      UPDATE Usuarios
      SET correo_verificado = TRUE, token_verificacion = NULL, token_verificacion_expira = NULL
      WHERE id_usuario = $1
      RETURNING id_usuario, correo_verificado
      `,
      [id]
    );

    return result.rows[0];
  }

  static async setTokenVerificacion(id, token, horasValidez = 48) {
    const result = await pool.query(
      `
      UPDATE Usuarios
      SET token_verificacion = $1, token_verificacion_expira = now() + ($2 || ' hours')::interval
      WHERE id_usuario = $3
      RETURNING id_usuario
      `,
      [token, horasValidez, id]
    );

    return result.rows[0];
  }

  static async getByTokenVerificacion(token) {
    const result = await pool.query(
      `
      SELECT * FROM Usuarios
      WHERE token_verificacion = $1 AND token_verificacion_expira > now()
      `,
      [token]
    );

    return result.rows[0];
  }

  static async remove(id) {
    const result = await pool.query(
      `
      DELETE FROM Usuarios
      WHERE id_usuario = $1
      RETURNING id_usuario
      `,
      [id]
    );

    return result.rows[0];
  }

  // Incluye la contraseña hasheada — solo para uso interno en login.
  static async getByCorreo(correo) {
    const result = await pool.query(
      `
      SELECT u.*, r.codigo AS rol_codigo
      FROM Usuarios u
      INNER JOIN Roles r ON u.id_rol = r.id_rol
      WHERE u.correo = $1
      `,
      [correo]
    );

    return result.rows[0];
  }
}

module.exports = UsuarioModel;
