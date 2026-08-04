const { sql, poolPromise } = require("../config/db");

class ReporteModel {
  static async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        r.id_reporte, r.titulo, r.descripcion, r.fecha_generacion,
        r.id_proyecto, p.nombre AS proyecto,
        r.id_usuario, u.nombre AS usuario
      FROM Reportes r
      INNER JOIN Proyectos p ON r.id_proyecto = p.id_proyecto
      INNER JOIN Usuarios u ON r.id_usuario = u.id_usuario
      ORDER BY r.id_reporte
    `);
    return result.recordset;
  }

  static async getById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_reporte", sql.Int, id)
      .query(`
        SELECT
          r.id_reporte, r.titulo, r.descripcion, r.fecha_generacion,
          r.id_proyecto, p.nombre AS proyecto,
          r.id_usuario, u.nombre AS usuario
        FROM Reportes r
        INNER JOIN Proyectos p ON r.id_proyecto = p.id_proyecto
        INNER JOIN Usuarios u ON r.id_usuario = u.id_usuario
        WHERE r.id_reporte = @id_reporte
      `);
    return result.recordset[0];
  }

  static async create({ titulo, descripcion, id_proyecto, id_usuario }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("titulo", sql.VarChar(100), titulo)
      .input("descripcion", sql.VarChar(255), descripcion)
      .input("id_proyecto", sql.Int, id_proyecto)
      .input("id_usuario", sql.Int, id_usuario)
      .query(`
        INSERT INTO Reportes (titulo, descripcion, id_proyecto, id_usuario)
        OUTPUT INSERTED.*
        VALUES (@titulo, @descripcion, @id_proyecto, @id_usuario)
      `);
    return result.recordset[0];
  }

  static async update(id, { titulo, descripcion, id_proyecto, id_usuario }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_reporte", sql.Int, id)
      .input("titulo", sql.VarChar(100), titulo)
      .input("descripcion", sql.VarChar(255), descripcion)
      .input("id_proyecto", sql.Int, id_proyecto)
      .input("id_usuario", sql.Int, id_usuario)
      .query(`
        UPDATE Reportes
        SET titulo = @titulo, descripcion = @descripcion, id_proyecto = @id_proyecto, id_usuario = @id_usuario
        OUTPUT INSERTED.*
        WHERE id_reporte = @id_reporte
      `);
    return result.recordset[0];
  }

  static async remove(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_reporte", sql.Int, id)
      .query("DELETE FROM Reportes OUTPUT DELETED.* WHERE id_reporte = @id_reporte");
    return result.recordset[0];
  }
}

module.exports = ReporteModel;
