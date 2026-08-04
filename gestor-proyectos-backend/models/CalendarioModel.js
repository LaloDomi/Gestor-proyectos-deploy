const { pool } = require("../config/db");

class CalendarioModel {
  static async getAll() {
    const result = await pool.query(`
      SELECT
        c.id_evento,
        c.titulo,
        c.descripcion,
        c.fecha,
        c.hora,
        c.id_proyecto,
        p.nombre AS proyecto,
        c.id_tarea,
        t.titulo AS tarea
      FROM Calendario c
      LEFT JOIN Proyectos p ON c.id_proyecto = p.id_proyecto
      LEFT JOIN Tareas t ON c.id_tarea = t.id_tarea
      ORDER BY c.fecha, c.hora
    `);

    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      `
      SELECT
        c.id_evento,
        c.titulo,
        c.descripcion,
        c.fecha,
        c.hora,
        c.id_proyecto,
        p.nombre AS proyecto,
        c.id_tarea,
        t.titulo AS tarea
      FROM Calendario c
      LEFT JOIN Proyectos p ON c.id_proyecto = p.id_proyecto
      LEFT JOIN Tareas t ON c.id_tarea = t.id_tarea
      WHERE c.id_evento = $1
      `,
      [id]
    );

    return result.rows[0];
  }

  static async create({
    titulo,
    descripcion,
    fecha,
    hora,
    id_proyecto,
    id_tarea
  }) {
    const result = await pool.query(
      `
      INSERT INTO Calendario
      (
        titulo,
        descripcion,
        fecha,
        hora,
        id_proyecto,
        id_tarea
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        titulo,
        descripcion,
        fecha,
        hora,
        id_proyecto || null,
        id_tarea || null
      ]
    );

    return result.rows[0];
  }

  static async update(
    id,
    {
      titulo,
      descripcion,
      fecha,
      hora,
      id_proyecto,
      id_tarea
    }
  ) {
    const result = await pool.query(
      `
      UPDATE Calendario
      SET
        titulo = $1,
        descripcion = $2,
        fecha = $3,
        hora = $4,
        id_proyecto = $5,
        id_tarea = $6
      WHERE id_evento = $7
      RETURNING *
      `,
      [
        titulo,
        descripcion,
        fecha,
        hora,
        id_proyecto || null,
        id_tarea || null,
        id
      ]
    );

    return result.rows[0];
  }

  static async remove(id) {
    const result = await pool.query(
      `
      DELETE FROM Calendario
      WHERE id_evento = $1
      RETURNING *
      `,
      [id]
    );

    return result.rows[0];
  }
}

module.exports = CalendarioModel;