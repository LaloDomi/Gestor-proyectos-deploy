const { sql, poolPromise } = require("../config/db");

class CalendarioModel {
  static async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        c.id_evento, c.titulo, c.descripcion, c.fecha, c.hora,
        c.id_proyecto, p.nombre AS proyecto,
        c.id_tarea, t.titulo AS tarea
      FROM Calendario c
      LEFT JOIN Proyectos p ON c.id_proyecto = p.id_proyecto
      LEFT JOIN Tareas t ON c.id_tarea = t.id_tarea
      ORDER BY c.fecha, c.hora
    `);
    return result.recordset;
  }

  static async getById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_evento", sql.Int, id)
      .query(`
        SELECT
          c.id_evento, c.titulo, c.descripcion, c.fecha, c.hora,
          c.id_proyecto, p.nombre AS proyecto,
          c.id_tarea, t.titulo AS tarea
        FROM Calendario c
        LEFT JOIN Proyectos p ON c.id_proyecto = p.id_proyecto
        LEFT JOIN Tareas t ON c.id_tarea = t.id_tarea
        WHERE c.id_evento = @id_evento
      `);
    return result.recordset[0];
  }

  static async create({ titulo, descripcion, fecha, hora, id_proyecto, id_tarea }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("titulo", sql.VarChar(100), titulo)
      .input("descripcion", sql.VarChar(255), descripcion)
      .input("fecha", sql.Date, fecha)
      .input("hora", sql.VarChar(8), hora) // formato "HH:MM" o "HH:MM:SS"
      .input("id_proyecto", sql.Int, id_proyecto || null)
      .input("id_tarea", sql.Int, id_tarea || null)
      .query(`
        INSERT INTO Calendario (titulo, descripcion, fecha, hora, id_proyecto, id_tarea)
        OUTPUT INSERTED.*
        VALUES (@titulo, @descripcion, @fecha, @hora, @id_proyecto, @id_tarea)
      `);
    return result.recordset[0];
  }

  static async update(id, { titulo, descripcion, fecha, hora, id_proyecto, id_tarea }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_evento", sql.Int, id)
      .input("titulo", sql.VarChar(100), titulo)
      .input("descripcion", sql.VarChar(255), descripcion)
      .input("fecha", sql.Date, fecha)
      .input("hora", sql.VarChar(8), hora)
      .input("id_proyecto", sql.Int, id_proyecto || null)
      .input("id_tarea", sql.Int, id_tarea || null)
      .query(`
        UPDATE Calendario
        SET titulo = @titulo, descripcion = @descripcion, fecha = @fecha,
            hora = @hora, id_proyecto = @id_proyecto, id_tarea = @id_tarea
        OUTPUT INSERTED.*
        WHERE id_evento = @id_evento
      `);
    return result.recordset[0];
  }

  static async remove(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_evento", sql.Int, id)
      .query("DELETE FROM Calendario OUTPUT DELETED.* WHERE id_evento = @id_evento");
    return result.recordset[0];
  }
}

module.exports = CalendarioModel;
