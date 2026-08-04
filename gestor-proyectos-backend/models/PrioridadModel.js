const { sql, poolPromise } = require("../config/db");

class PrioridadModel {
  static async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Prioridades ORDER BY id_prioridad");
    return result.recordset;
  }

  static async getById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_prioridad", sql.Int, id)
      .query("SELECT * FROM Prioridades WHERE id_prioridad = @id_prioridad");
    return result.recordset[0];
  }

  static async create({ nombre_prioridad }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("nombre_prioridad", sql.VarChar(50), nombre_prioridad)
      .query(
        "INSERT INTO Prioridades (nombre_prioridad) OUTPUT INSERTED.* VALUES (@nombre_prioridad)"
      );
    return result.recordset[0];
  }

  static async update(id, { nombre_prioridad }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_prioridad", sql.Int, id)
      .input("nombre_prioridad", sql.VarChar(50), nombre_prioridad)
      .query(
        "UPDATE Prioridades SET nombre_prioridad = @nombre_prioridad OUTPUT INSERTED.* WHERE id_prioridad = @id_prioridad"
      );
    return result.recordset[0];
  }

  static async remove(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_prioridad", sql.Int, id)
      .query("DELETE FROM Prioridades OUTPUT DELETED.* WHERE id_prioridad = @id_prioridad");
    return result.recordset[0];
  }
}

module.exports = PrioridadModel;
