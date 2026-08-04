const { sql, poolPromise } = require("../config/db");

class EstadoModel {
  static async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Estados ORDER BY id_estado");
    return result.recordset;
  }

  static async getById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_estado", sql.Int, id)
      .query("SELECT * FROM Estados WHERE id_estado = @id_estado");
    return result.recordset[0];
  }

  static async create({ nombre_estado }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("nombre_estado", sql.VarChar(50), nombre_estado)
      .query(
        "INSERT INTO Estados (nombre_estado) OUTPUT INSERTED.* VALUES (@nombre_estado)"
      );
    return result.recordset[0];
  }

  static async update(id, { nombre_estado }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_estado", sql.Int, id)
      .input("nombre_estado", sql.VarChar(50), nombre_estado)
      .query(
        "UPDATE Estados SET nombre_estado = @nombre_estado OUTPUT INSERTED.* WHERE id_estado = @id_estado"
      );
    return result.recordset[0];
  }

  static async remove(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_estado", sql.Int, id)
      .query("DELETE FROM Estados OUTPUT DELETED.* WHERE id_estado = @id_estado");
    return result.recordset[0];
  }
}

module.exports = EstadoModel;
