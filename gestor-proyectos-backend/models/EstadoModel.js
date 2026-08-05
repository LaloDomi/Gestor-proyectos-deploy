const { pool } = require("../config/db");

class EstadoModel {
  static async getAll() {
    const result = await pool.query(
      "SELECT * FROM Estados ORDER BY id_estado"
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      "SELECT * FROM Estados WHERE id_estado = $1",
      [id]
    );
    return result.rows[0];
  }

  static async create({ nombre_estado }) {
    const result = await pool.query(
      "INSERT INTO Estados (nombre_estado) VALUES ($1) RETURNING *",
      [nombre_estado]
    );
    return result.rows[0];
  }

  static async update(id, { nombre_estado }) {
    const result = await pool.query(
      "UPDATE Estados SET nombre_estado = $1 WHERE id_estado = $2 RETURNING *",
      [nombre_estado, id]
    );
    return result.rows[0];
  }

  static async remove(id) {
    const result = await pool.query(
      "DELETE FROM Estados WHERE id_estado = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = EstadoModel;