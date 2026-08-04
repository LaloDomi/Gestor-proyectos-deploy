const { pool } = require("../config/db");

class UsuarioModel {
  static async getAll() {
    const result = await pool.query(`
      SELECT
        u.id_usuario,
        u.nombre,
        u.correo,
        u.id_rol,
        r.nombre_rol,
        u.fecha_registro
      FROM Usuarios u
      INNER JOIN Roles r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario
    `);

    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      `
      SELECT
        u.id_usuario,
        u.nombre,
        u.correo,
        u.id_rol,
        r.nombre_rol,
        u.fecha_registro
      FROM Usuarios u
      INNER JOIN Roles r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1
      `,
      [id]
    );

    return result.rows[0];
  }

  static async create({ nombre, correo, contrasena, id_rol }) {
    const result = await pool.query(
      `
      INSERT INTO Usuarios
      (nombre, correo, contrasena, id_rol)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [nombre, correo, contrasena, id_rol]
    );

    return result.rows[0];
  }

  static async update(id, { nombre, correo, contrasena, id_rol }) {
    const result = await pool.query(
      `
      UPDATE Usuarios
      SET
        nombre = $1,
        correo = $2,
        contrasena = $3,
        id_rol = $4
      WHERE id_usuario = $5
      RETURNING *
      `,
      [nombre, correo, contrasena, id_rol, id]
    );

    return result.rows[0];
  }

  static async remove(id) {
    const result = await pool.query(
      `
      DELETE FROM Usuarios
      WHERE id_usuario = $1
      RETURNING *
      `,
      [id]
    );

    return result.rows[0];
  }

  static async getByCorreo(correo) {
    const result = await pool.query(
      `
      SELECT *
      FROM Usuarios
      WHERE correo = $1
      `,
      [correo]
    );

    return result.rows[0];
  }
}

module.exports = UsuarioModel;