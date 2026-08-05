const { pool } = require("../config/db");

class ChatMensajeModel {
  static async create({ id_canal, id_usuario, contenido }) {
    const result = await pool.query(
      `
      INSERT INTO ChatMensajes (id_canal, id_usuario, contenido)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [id_canal, id_usuario, contenido]
    );
    return result.rows[0];
  }

  static async getByCanal(id_canal, { limit = 50 } = {}) {
    const result = await pool.query(
      `
      SELECT m.id_mensaje, m.id_canal, m.id_usuario, u.nombre AS usuario_nombre, m.contenido, m.creado_en
      FROM ChatMensajes m
      INNER JOIN Usuarios u ON u.id_usuario = m.id_usuario
      WHERE m.id_canal = $1
      ORDER BY m.creado_en DESC
      LIMIT $2
      `,
      [id_canal, limit]
    );
    return result.rows.reverse();
  }
}

module.exports = ChatMensajeModel;
