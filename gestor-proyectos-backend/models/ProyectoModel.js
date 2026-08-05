const { pool } = require("../config/db");

class ProyectoModel {
  static async getAll() {
    const result = await pool.query(`
      SELECT
        p.id_proyecto,
        p.nombre,
        p.descripcion,
        p.fecha_inicio,
        p.fecha_fin,
        p.id_estado,
        e.nombre_estado AS estado,
        p.id_responsable,
        u.nombre AS responsable
      FROM Proyectos p
      INNER JOIN Estados e ON p.id_estado = e.id_estado
      INNER JOIN Usuarios u ON p.id_responsable = u.id_usuario
      ORDER BY p.id_proyecto
    `);

    return result.rows;
  }

  static async getAllPorMiembro(id_usuario) {
    const result = await pool.query(
      `
      SELECT
        p.id_proyecto,
        p.nombre,
        p.descripcion,
        p.fecha_inicio,
        p.fecha_fin,
        p.id_estado,
        e.nombre_estado AS estado,
        p.id_responsable,
        u.nombre AS responsable,
        pm.rol_proyecto AS mi_rol_proyecto
      FROM Proyectos p
      INNER JOIN Estados e ON p.id_estado = e.id_estado
      INNER JOIN Usuarios u ON p.id_responsable = u.id_usuario
      INNER JOIN ProyectoMiembros pm ON pm.id_proyecto = p.id_proyecto
      WHERE pm.id_usuario = $1
      ORDER BY p.id_proyecto
      `,
      [id_usuario]
    );

    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      `
      SELECT
        p.id_proyecto,
        p.nombre,
        p.descripcion,
        p.fecha_inicio,
        p.fecha_fin,
        p.id_estado,
        e.nombre_estado AS estado,
        p.id_responsable,
        u.nombre AS responsable
      FROM Proyectos p
      INNER JOIN Estados e ON p.id_estado = e.id_estado
      INNER JOIN Usuarios u ON p.id_responsable = u.id_usuario
      WHERE p.id_proyecto = $1
      `,
      [id]
    );

    return result.rows[0];
  }

  static async create({
    nombre,
    descripcion,
    fecha_inicio,
    fecha_fin,
    id_estado,
    id_responsable,
  }) {
    const result = await pool.query(
      `
      INSERT INTO Proyectos
      (
        nombre,
        descripcion,
        fecha_inicio,
        fecha_fin,
        id_estado,
        id_responsable
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        nombre,
        descripcion,
        fecha_inicio,
        fecha_fin,
        id_estado,
        id_responsable,
      ]
    );

    return result.rows[0];
  }

  static async update(
    id,
    {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      id_estado,
      id_responsable,
    }
  ) {
    const result = await pool.query(
      `
      UPDATE Proyectos
      SET
        nombre = $1,
        descripcion = $2,
        fecha_inicio = $3,
        fecha_fin = $4,
        id_estado = $5,
        id_responsable = $6
      WHERE id_proyecto = $7
      RETURNING *
      `,
      [
        nombre,
        descripcion,
        fecha_inicio,
        fecha_fin,
        id_estado,
        id_responsable,
        id,
      ]
    );

    return result.rows[0];
  }

  static async remove(id) {
    const result = await pool.query(
      `
      DELETE FROM Proyectos
      WHERE id_proyecto = $1
      RETURNING *
      `,
      [id]
    );

    return result.rows[0];
  }

  static async getAvance() {
    const result = await pool.query(`
      SELECT
        p.id_proyecto,
        p.nombre AS proyecto,
        COUNT(t.id_tarea) AS total_tareas,
        SUM(
          CASE
            WHEN e.nombre_estado = 'Finalizado' THEN 1
            ELSE 0
          END
        ) AS tareas_finalizadas,
        ROUND(
          (
            SUM(
              CASE
                WHEN e.nombre_estado = 'Finalizado' THEN 1
                ELSE 0
              END
            )::numeric
            /
            NULLIF(COUNT(t.id_tarea),0)
          ) * 100,
          2
        ) AS porcentaje_avance
      FROM Proyectos p
      INNER JOIN Tareas t
        ON p.id_proyecto = t.id_proyecto
      INNER JOIN Estados e
        ON t.id_estado = e.id_estado
      GROUP BY p.id_proyecto, p.nombre
      ORDER BY p.id_proyecto
    `);

    return result.rows;
  }

  static async getAvancePorMiembro(id_usuario) {
    const result = await pool.query(
      `
      SELECT
        p.id_proyecto,
        p.nombre AS proyecto,
        COUNT(t.id_tarea) AS total_tareas,
        SUM(
          CASE
            WHEN e.nombre_estado = 'Finalizado' THEN 1
            ELSE 0
          END
        ) AS tareas_finalizadas,
        ROUND(
          (
            SUM(
              CASE
                WHEN e.nombre_estado = 'Finalizado' THEN 1
                ELSE 0
              END
            )::numeric
            /
            NULLIF(COUNT(t.id_tarea),0)
          ) * 100,
          2
        ) AS porcentaje_avance
      FROM Proyectos p
      INNER JOIN ProyectoMiembros pm ON pm.id_proyecto = p.id_proyecto AND pm.id_usuario = $1
      INNER JOIN Tareas t ON p.id_proyecto = t.id_proyecto
      INNER JOIN Estados e ON t.id_estado = e.id_estado
      GROUP BY p.id_proyecto, p.nombre
      ORDER BY p.id_proyecto
      `,
      [id_usuario]
    );

    return result.rows;
  }
}

module.exports = ProyectoModel;