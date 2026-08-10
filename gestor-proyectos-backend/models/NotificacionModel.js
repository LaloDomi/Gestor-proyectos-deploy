const { pool } = require("../config/db");

class NotificacionModel {
  static async getByUsuario(id_usuario) {
    const result = await pool.query(
      "SELECT * FROM Notificaciones WHERE id_usuario = $1 ORDER BY creada_en DESC LIMIT 100",
      [id_usuario]
    );
    return result.rows;
  }

  // Devuelve la fila creada, o undefined si ya existía una igual (dedupe por
  // id_usuario+tipo+referencia — solo aplica cuando hay referencia_tipo).
  static async create({ id_usuario, tipo, titulo, mensaje, enlace, id_proyecto, referencia_tipo, referencia_id }) {
    if (referencia_tipo) {
      const result = await pool.query(
        `
        INSERT INTO Notificaciones (id_usuario, tipo, titulo, mensaje, enlace, id_proyecto, referencia_tipo, referencia_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id_usuario, tipo, referencia_tipo, referencia_id) WHERE referencia_tipo IS NOT NULL
        DO NOTHING
        RETURNING *
        `,
        [id_usuario, tipo, titulo, mensaje || null, enlace || null, id_proyecto || null, referencia_tipo, referencia_id]
      );
      return result.rows[0];
    }

    const result = await pool.query(
      `
      INSERT INTO Notificaciones (id_usuario, tipo, titulo, mensaje, enlace, id_proyecto)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [id_usuario, tipo, titulo, mensaje || null, enlace || null, id_proyecto || null]
    );
    return result.rows[0];
  }

  static async marcarLeida(id_notificacion, id_usuario) {
    const result = await pool.query(
      `
      UPDATE Notificaciones
      SET leida = TRUE
      WHERE id_notificacion = $1 AND id_usuario = $2
      RETURNING *
      `,
      [id_notificacion, id_usuario]
    );
    return result.rows[0];
  }

  static async marcarTodasLeidas(id_usuario) {
    await pool.query("UPDATE Notificaciones SET leida = TRUE WHERE id_usuario = $1 AND leida = FALSE", [id_usuario]);
  }
}

module.exports = NotificacionModel;
