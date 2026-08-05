const crypto = require("crypto");
const { pool } = require("../config/db");

const VENTANA_ACTIVA_HORAS = 4;

class VideollamadaModel {
  // Reutiliza una llamada "activa" reciente del proyecto si existe, para que
  // todos los que le den a "Iniciar videollamada" caigan en la misma sala.
  static async getActivaReciente(id_proyecto) {
    const result = await pool.query(
      `
      SELECT * FROM Videollamadas
      WHERE id_proyecto = $1
        AND estado = 'activa'
        AND creado_en > now() - interval '${VENTANA_ACTIVA_HORAS} hours'
      ORDER BY creado_en DESC
      LIMIT 1
      `,
      [id_proyecto]
    );
    return result.rows[0];
  }

  static async create({ id_proyecto, titulo, creado_por }) {
    const sala = `projectflow-${id_proyecto}-${crypto.randomBytes(6).toString("hex")}`;
    const result = await pool.query(
      `
      INSERT INTO Videollamadas (id_proyecto, sala, titulo, creado_por)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [id_proyecto, sala, titulo || null, creado_por]
    );
    return result.rows[0];
  }

  static async getByProyecto(id_proyecto) {
    const result = await pool.query(
      `
      SELECT v.*, u.nombre AS creado_por_nombre
      FROM Videollamadas v
      INNER JOIN Usuarios u ON u.id_usuario = v.creado_por
      WHERE v.id_proyecto = $1
      ORDER BY v.creado_en DESC
      LIMIT 20
      `,
      [id_proyecto]
    );
    return result.rows;
  }
}

module.exports = VideollamadaModel;
