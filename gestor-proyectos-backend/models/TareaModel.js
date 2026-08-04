const { sql, poolPromise } = require("../config/db");

class TareaModel {
  static async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        t.id_tarea, t.titulo, t.descripcion, t.fecha_inicio, t.fecha_limite,
        t.id_prioridad, pr.nombre_prioridad AS prioridad,
        t.id_estado, e.nombre_estado AS estado,
        t.id_proyecto, p.nombre AS proyecto,
        t.id_responsable, u.nombre AS responsable
      FROM Tareas t
      INNER JOIN Proyectos p ON t.id_proyecto = p.id_proyecto
      INNER JOIN Usuarios u ON t.id_responsable = u.id_usuario
      INNER JOIN Prioridades pr ON t.id_prioridad = pr.id_prioridad
      INNER JOIN Estados e ON t.id_estado = e.id_estado
      ORDER BY t.id_tarea
    `);
    return result.recordset;
  }

  static async getById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_tarea", sql.Int, id)
      .query(`
        SELECT
          t.id_tarea, t.titulo, t.descripcion, t.fecha_inicio, t.fecha_limite,
          t.id_prioridad, pr.nombre_prioridad AS prioridad,
          t.id_estado, e.nombre_estado AS estado,
          t.id_proyecto, p.nombre AS proyecto,
          t.id_responsable, u.nombre AS responsable
        FROM Tareas t
        INNER JOIN Proyectos p ON t.id_proyecto = p.id_proyecto
        INNER JOIN Usuarios u ON t.id_responsable = u.id_usuario
        INNER JOIN Prioridades pr ON t.id_prioridad = pr.id_prioridad
        INNER JOIN Estados e ON t.id_estado = e.id_estado
        WHERE t.id_tarea = @id_tarea
      `);
    return result.recordset[0];
  }

  static async getByProyecto(id_proyecto) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_proyecto", sql.Int, id_proyecto)
      .query(`
        SELECT
          t.id_tarea, t.titulo, t.descripcion, t.fecha_inicio, t.fecha_limite,
          t.id_prioridad, pr.nombre_prioridad AS prioridad,
          t.id_estado, e.nombre_estado AS estado,
          t.id_responsable, u.nombre AS responsable
        FROM Tareas t
        INNER JOIN Usuarios u ON t.id_responsable = u.id_usuario
        INNER JOIN Prioridades pr ON t.id_prioridad = pr.id_prioridad
        INNER JOIN Estados e ON t.id_estado = e.id_estado
        WHERE t.id_proyecto = @id_proyecto
        ORDER BY t.id_tarea
      `);
    return result.recordset;
  }

  static async create({ titulo, descripcion, fecha_inicio, fecha_limite, id_prioridad, id_estado, id_proyecto, id_responsable }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("titulo", sql.VarChar(100), titulo)
      .input("descripcion", sql.VarChar(255), descripcion)
      .input("fecha_inicio", sql.Date, fecha_inicio)
      .input("fecha_limite", sql.Date, fecha_limite)
      .input("id_prioridad", sql.Int, id_prioridad)
      .input("id_estado", sql.Int, id_estado)
      .input("id_proyecto", sql.Int, id_proyecto)
      .input("id_responsable", sql.Int, id_responsable)
      .query(`
        INSERT INTO Tareas (titulo, descripcion, fecha_inicio, fecha_limite, id_prioridad, id_estado, id_proyecto, id_responsable)
        OUTPUT INSERTED.*
        VALUES (@titulo, @descripcion, @fecha_inicio, @fecha_limite, @id_prioridad, @id_estado, @id_proyecto, @id_responsable)
      `);
    return result.recordset[0];
  }

  static async update(id, { titulo, descripcion, fecha_inicio, fecha_limite, id_prioridad, id_estado, id_proyecto, id_responsable }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_tarea", sql.Int, id)
      .input("titulo", sql.VarChar(100), titulo)
      .input("descripcion", sql.VarChar(255), descripcion)
      .input("fecha_inicio", sql.Date, fecha_inicio)
      .input("fecha_limite", sql.Date, fecha_limite)
      .input("id_prioridad", sql.Int, id_prioridad)
      .input("id_estado", sql.Int, id_estado)
      .input("id_proyecto", sql.Int, id_proyecto)
      .input("id_responsable", sql.Int, id_responsable)
      .query(`
        UPDATE Tareas
        SET titulo = @titulo, descripcion = @descripcion, fecha_inicio = @fecha_inicio,
            fecha_limite = @fecha_limite, id_prioridad = @id_prioridad, id_estado = @id_estado,
            id_proyecto = @id_proyecto, id_responsable = @id_responsable
        OUTPUT INSERTED.*
        WHERE id_tarea = @id_tarea
      `);
    return result.recordset[0];
  }

  static async remove(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_tarea", sql.Int, id)
      .query("DELETE FROM Tareas OUTPUT DELETED.* WHERE id_tarea = @id_tarea");
    return result.recordset[0];
  }

  // Contar tareas por estado
  static async contarPorEstado() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT e.nombre_estado, COUNT(t.id_tarea) AS total_tareas
      FROM Estados e
      LEFT JOIN Tareas t ON e.id_estado = t.id_estado
      GROUP BY e.nombre_estado
    `);
    return result.recordset;
  }

  // Contar tareas por prioridad
  static async contarPorPrioridad() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT p.nombre_prioridad, COUNT(t.id_tarea) AS total_tareas
      FROM Prioridades p
      LEFT JOIN Tareas t ON p.id_prioridad = t.id_prioridad
      GROUP BY p.nombre_prioridad
    `);
    return result.recordset;
  }
}

module.exports = TareaModel;
