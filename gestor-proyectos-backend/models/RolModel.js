const { pool } = require("../config/db");

class RolModel {
  static async getAll() {
    const result = await pool.query(
      "SELECT * FROM Roles ORDER BY id_rol"
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      "SELECT * FROM Roles WHERE id_rol = $1",
      [id]
    );
    return result.rows[0];
  }

  static async getByCodigo(codigo) {
    const result = await pool.query(
      "SELECT * FROM Roles WHERE codigo = $1",
      [codigo]
    );
    return result.rows[0];
  }

  static async create({ nombre_rol }) {
    const result = await pool.query(
      "INSERT INTO Roles (nombre_rol) VALUES ($1) RETURNING *",
      [nombre_rol]
    );
    return result.rows[0];
  }

  static async update(id, { nombre_rol }) {
    const result = await pool.query(
      "UPDATE Roles SET nombre_rol = $1 WHERE id_rol = $2 RETURNING *",
      [nombre_rol, id]
    );
    return result.rows[0];
  }

  static async remove(id) {
    const result = await pool.query(
      "DELETE FROM Roles WHERE id_rol = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = RolModel;