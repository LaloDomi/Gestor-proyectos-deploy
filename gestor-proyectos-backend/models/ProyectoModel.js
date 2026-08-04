const { sql, poolPromise } = require("../config/db");

class ProyectoModel {
  static async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        p.id_proyecto, p.nombre, p.descripcion, p.fecha_inicio, p.fecha_fin,
        p.id_estado, e.nombre_estado AS estado,
        p.id_responsable, u.nombre AS responsable
      FROM Proyectos p
      INNER JOIN Estados e ON p.id_estado = e.id_estado
      INNER JOIN Usuarios u ON p.id_responsable = u.id_usuario
      ORDER BY p.id_proyecto
    `);
    return result.recordset;
  }

  static async getById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_proyecto", sql.Int, id)
      .query(`
        SELECT
          p.id_proyecto, p.nombre, p.descripcion, p.fecha_inicio, p.fecha_fin,
          p.id_estado, e.nombre_estado AS estado,
          p.id_responsable, u.nombre AS responsable
        FROM Proyectos p
        INNER JOIN Estados e ON p.id_estado = e.id_estado
        INNER JOIN Usuarios u ON p.id_responsable = u.id_usuario
        WHERE p.id_proyecto = @id_proyecto
      `);
    return result.recordset[0];
  }

  static async create({ nombre, descripcion, fecha_inicio, fecha_fin, id_estado, id_responsable }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("nombre", sql.VarChar(100), nombre)
      .input("descripcion", sql.VarChar(255), descripcion)
      .input("fecha_inicio", sql.Date, fecha_inicio)
      .input("fecha_fin", sql.Date, fecha_fin || null)
      .input("id_estado", sql.Int, id_estado)
      .input("id_responsable", sql.Int, id_responsable)
      .query(`
        INSERT INTO Proyectos (nombre, descripcion, fecha_inicio, fecha_fin, id_estado, id_responsable)
        OUTPUT INSERTED.*
        VALUES (@nombre, @descripcion, @fecha_inicio, @fecha_fin, @id_estado, @id_responsable)
      `);
    return result.recordset[0];
  }

  static async update(id, { nombre, descripcion, fecha_inicio, fecha_fin, id_estado, id_responsable }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_proyecto", sql.Int, id)
      .input("nombre", sql.VarChar(100), nombre)
      .input("descripcion", sql.VarChar(255), descripcion)
      .input("fecha_inicio", sql.Date, fecha_inicio)
      .input("fecha_fin", sql.Date, fecha_fin || null)
      .input("id_estado", sql.Int, id_estado)
      .input("id_responsable", sql.Int, id_responsable)
      .query(`
        UPDATE Proyectos
        SET nombre = @nombre, descripcion = @descripcion, fecha_inicio = @fecha_inicio,
            fecha_fin = @fecha_fin, id_estado = @id_estado, id_responsable = @id_responsable
        OUTPUT INSERTED.*
        WHERE id_proyecto = @id_proyecto
      `);
    return result.recordset[0];
  }

  static async remove(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_proyecto", sql.Int, id)
      .query("DELETE FROM Proyectos OUTPUT DELETED.* WHERE id_proyecto = @id_proyecto");
    return result.recordset[0];
  }

  // Porcentaje de avance por proyecto (consulta especial del script SQL)
  static async getAvance() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        p.id_proyecto,
        p.nombre AS proyecto,
        COUNT(t.id_tarea) AS total_tareas,
        SUM(CASE WHEN e.nombre_estado = 'Finalizado' THEN 1 ELSE 0 END) AS tareas_finalizadas,
        CAST(
          SUM(CASE WHEN e.nombre_estado = 'Finalizado' THEN 1 ELSE 0 END) * 100.0
          / NULLIF(COUNT(t.id_tarea), 0)
          AS DECIMAL(5,2)
        ) AS porcentaje_avance
      FROM Proyectos p
      INNER JOIN Tareas t ON p.id_proyecto = t.id_proyecto
      INNER JOIN Estados e ON t.id_estado = e.id_estado
      GROUP BY p.id_proyecto, p.nombre
    `);
    return result.recordset;
  }
}

module.exports = ProyectoModel;
