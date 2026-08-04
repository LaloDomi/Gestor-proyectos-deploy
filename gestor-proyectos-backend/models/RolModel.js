const { sql, poolPromise } = require("../config/db");

class RolModel {
  static async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Roles ORDER BY id_rol");
    return result.recordset;
  }

  static async getById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_rol", sql.Int, id)
      .query("SELECT * FROM Roles WHERE id_rol = @id_rol");
    return result.recordset[0];
  }

  static async create({ nombre_rol }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("nombre_rol", sql.VarChar(50), nombre_rol)
      .query(
        "INSERT INTO Roles (nombre_rol) OUTPUT INSERTED.* VALUES (@nombre_rol)"
      );
    return result.recordset[0];
  }

  static async update(id, { nombre_rol }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_rol", sql.Int, id)
      .input("nombre_rol", sql.VarChar(50), nombre_rol)
      .query(
        "UPDATE Roles SET nombre_rol = @nombre_rol OUTPUT INSERTED.* WHERE id_rol = @id_rol"
      );
    return result.recordset[0];
  }

  static async remove(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_rol", sql.Int, id)
      .query("DELETE FROM Roles OUTPUT DELETED.* WHERE id_rol = @id_rol");
    return result.recordset[0];
  }
}

module.exports = RolModel;
