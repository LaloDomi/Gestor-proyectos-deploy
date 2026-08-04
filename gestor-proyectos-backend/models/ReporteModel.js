const { pool } = require("../config/db");

class ReporteModel {
  static async getAll() {
    const result = await pool.query(`
      SELECT
        r.id_reporte,
        r.titulo,
        r.descripcion,
        r.fecha_generacion,
        r.id_proyecto,
        p.nombre AS proyecto,
        r.id_usuario,
        u.nombre AS usuario
      FROM Reportes r
      INNER JOIN Proyectos p ON r.id_proyecto = p.id_proyecto
      INNER JOIN Usuarios u ON r.id_usuario = u.id_usuario
      ORDER BY r.id_reporte
    `);

    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      `
      SELECT
        r.id_reporte,
        r.titulo,
        r.descripcion,
        r.fecha_generacion,
        r.id_proyecto,
        p.nombre AS proyecto,
        r.id_usuario,
        u.nombre AS usuario
      FROM Reportes r
      INNER JOIN Proyectos p ON r.id_proyecto = p.id_proyecto
      INNER JOIN Usuarios u ON r.id_usuario = u.id_usuario
      WHERE r.id_reporte = $1
      `,
      [id]
    );

    return result.rows[0];
  }

  static async create({
    titulo,
    descripcion,
    id_proyecto,
    id_usuario,
  }) {
    const result = await pool.query(
      `
      INSERT INTO Reportes
      (
        titulo,
        descripcion,
        id_proyecto,
        id_usuario
      )
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [titulo, descripcion, id_proyecto, id_usuario]
    );

    return result.rows[0];
  }

  static async update(
    id,
    {
      titulo,
      descripcion,
      id_proyecto,
      id_usuario,
    }
  ) {
    const result = await pool.query(
      `
      UPDATE Reportes
      SET
        titulo = $1,
        descripcion = $2,
        id_proyecto = $3,
        id_usuario = $4
      WHERE id_reporte = $5
      RETURNING *
      `,
      [titulo, descripcion, id_proyecto, id_usuario, id]
    );

    return result.rows[0];
  }

  static async remove(id) {
    const result = await pool.query(
      `
      DELETE FROM Reportes
      WHERE id_reporte = $1
      RETURNING *
      `,
      [id]
    );

    return result.rows[0];
  }
}

module.exports = ReporteModel;