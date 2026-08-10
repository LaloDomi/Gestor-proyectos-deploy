const { pool } = require("../config/db");

class TareaModel {
  static async getAll() {
    const result = await pool.query(`
      SELECT
        t.id_tarea,
        t.titulo,
        t.descripcion,
        t.fecha_inicio,
        t.fecha_limite,
        t.id_prioridad,
        pr.nombre_prioridad AS prioridad,
        t.id_estado,
        e.nombre_estado AS estado,
        t.id_proyecto,
        p.nombre AS proyecto,
        t.id_responsable,
        u.nombre AS responsable
      FROM Tareas t
      INNER JOIN Proyectos p ON t.id_proyecto = p.id_proyecto
      INNER JOIN Usuarios u ON t.id_responsable = u.id_usuario
      INNER JOIN Prioridades pr ON t.id_prioridad = pr.id_prioridad
      INNER JOIN Estados e ON t.id_estado = e.id_estado
      ORDER BY t.id_tarea
    `);

    return result.rows;
  }

  static async getAllPorMiembro(id_usuario) {
    const result = await pool.query(
      `
      SELECT
        t.id_tarea,
        t.titulo,
        t.descripcion,
        t.fecha_inicio,
        t.fecha_limite,
        t.id_prioridad,
        pr.nombre_prioridad AS prioridad,
        t.id_estado,
        e.nombre_estado AS estado,
        t.id_proyecto,
        p.nombre AS proyecto,
        t.id_responsable,
        u.nombre AS responsable
      FROM Tareas t
      INNER JOIN Proyectos p ON t.id_proyecto = p.id_proyecto
      INNER JOIN Usuarios u ON t.id_responsable = u.id_usuario
      INNER JOIN Prioridades pr ON t.id_prioridad = pr.id_prioridad
      INNER JOIN Estados e ON t.id_estado = e.id_estado
      INNER JOIN ProyectoMiembros pm ON pm.id_proyecto = t.id_proyecto
      WHERE pm.id_usuario = $1
      ORDER BY t.id_tarea
      `,
      [id_usuario]
    );

    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(`
      SELECT
        t.id_tarea,
        t.titulo,
        t.descripcion,
        t.fecha_inicio,
        t.fecha_limite,
        t.id_prioridad,
        pr.nombre_prioridad AS prioridad,
        t.id_estado,
        e.nombre_estado AS estado,
        t.id_proyecto,
        p.nombre AS proyecto,
        t.id_responsable,
        u.nombre AS responsable
      FROM Tareas t
      INNER JOIN Proyectos p ON t.id_proyecto = p.id_proyecto
      INNER JOIN Usuarios u ON t.id_responsable = u.id_usuario
      INNER JOIN Prioridades pr ON t.id_prioridad = pr.id_prioridad
      INNER JOIN Estados e ON t.id_estado = e.id_estado
      WHERE t.id_tarea = $1
    `, [id]);

    return result.rows[0];
  }

  static async getByProyecto(id_proyecto) {
    const result = await pool.query(`
      SELECT
        t.id_tarea,
        t.titulo,
        t.descripcion,
        t.fecha_inicio,
        t.fecha_limite,
        t.id_prioridad,
        pr.nombre_prioridad AS prioridad,
        t.id_estado,
        e.nombre_estado AS estado,
        t.id_responsable,
        u.nombre AS responsable
      FROM Tareas t
      INNER JOIN Usuarios u ON t.id_responsable = u.id_usuario
      INNER JOIN Prioridades pr ON t.id_prioridad = pr.id_prioridad
      INNER JOIN Estados e ON t.id_estado = e.id_estado
      WHERE t.id_proyecto = $1
      ORDER BY t.id_tarea
    `, [id_proyecto]);

    return result.rows;
  }

  static async create(data) {
    const {
      titulo,
      descripcion,
      fecha_inicio,
      fecha_limite,
      id_prioridad,
      id_estado,
      id_proyecto,
      id_responsable
    } = data;

    const result = await pool.query(`
      INSERT INTO Tareas
      (
        titulo,
        descripcion,
        fecha_inicio,
        fecha_limite,
        id_prioridad,
        id_estado,
        id_proyecto,
        id_responsable
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `, [
      titulo,
      descripcion,
      fecha_inicio,
      fecha_limite,
      id_prioridad,
      id_estado,
      id_proyecto,
      id_responsable
    ]);

    return result.rows[0];
  }

  static async update(id, data) {
    const {
      titulo,
      descripcion,
      fecha_inicio,
      fecha_limite,
      id_prioridad,
      id_estado,
      id_proyecto,
      id_responsable
    } = data;

    const result = await pool.query(`
      UPDATE Tareas
      SET
        titulo = $1,
        descripcion = $2,
        fecha_inicio = $3,
        fecha_limite = $4,
        id_prioridad = $5,
        id_estado = $6,
        id_proyecto = $7,
        id_responsable = $8
      WHERE id_tarea = $9
      RETURNING *
    `, [
      titulo,
      descripcion,
      fecha_inicio,
      fecha_limite,
      id_prioridad,
      id_estado,
      id_proyecto,
      id_responsable,
      id
    ]);

    return result.rows[0];
  }

  static async remove(id) {
    const result = await pool.query(
      "DELETE FROM Tareas WHERE id_tarea = $1 RETURNING *",
      [id]
    );

    return result.rows[0];
  }

  static async contarPorEstado() {
    const result = await pool.query(`
      SELECT
        e.nombre_estado,
        COUNT(t.id_tarea) AS total_tareas
      FROM Estados e
      LEFT JOIN Tareas t
        ON e.id_estado = t.id_estado
      GROUP BY e.nombre_estado
      ORDER BY e.nombre_estado
    `);

    return result.rows;
  }

  static async contarPorPrioridad() {
    const result = await pool.query(`
      SELECT
        p.nombre_prioridad,
        COUNT(t.id_tarea) AS total_tareas
      FROM Prioridades p
      LEFT JOIN Tareas t
        ON p.id_prioridad = t.id_prioridad
      GROUP BY p.nombre_prioridad
      ORDER BY p.nombre_prioridad
    `);

    return result.rows;
  }
}

module.exports = TareaModel;