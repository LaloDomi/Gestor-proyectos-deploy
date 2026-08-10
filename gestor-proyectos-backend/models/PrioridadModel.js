const { pool } = require("../config/db");

class PrioridadModel {
  static async getAll() {
    const result = await pool.query(
      "SELECT * FROM Prioridades ORDER BY id_prioridad"
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      "SELECT * FROM Prioridades WHERE id_prioridad = $1",
      [id]
    );
    return result.rows[0];
  }

  static async create({ nombre_prioridad }) {
    const result = await pool.query(
      "INSERT INTO Prioridades (nombre_prioridad) VALUES ($1) RETURNING *",
      [nombre_prioridad]
    );
    return result.rows[0];
  }

  static async update(id, { nombre_prioridad }) {
    const result = await pool.query(
      "UPDATE Prioridades SET nombre_prioridad = $1 WHERE id_prioridad = $2 RETURNING *",
      [nombre_prioridad, id]
    );
    return result.rows[0];
  }

  static async remove(id) {
    const result = await pool.query(
      "DELETE FROM Prioridades WHERE id_prioridad = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = PrioridadModel;