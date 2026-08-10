const crypto = require("crypto");
const { pool } = require("../config/db");

const DIAS_EXPIRACION = 7;

class InvitacionModel {
  static async create({ correo, id_proyecto, rol_proyecto, invitado_por }) {
    const token = crypto.randomBytes(24).toString("hex");
    const result = await pool.query(
      `
      INSERT INTO Invitaciones
      (correo, id_proyecto, rol_proyecto, token, invitado_por, fecha_expiracion)
      VALUES ($1, $2, $3, $4, $5, now() + interval '${DIAS_EXPIRACION} days')
      RETURNING *
      `,
      [correo, id_proyecto, rol_proyecto, token, invitado_por]
    );
    return result.rows[0];
  }

  static async getByToken(token) {
    const result = await pool.query(
      `
      SELECT
        i.*,
        p.nombre AS proyecto_nombre,
        u.nombre AS invitado_por_nombre
      FROM Invitaciones i
      INNER JOIN Proyectos p ON i.id_proyecto = p.id_proyecto
      INNER JOIN Usuarios u ON i.invitado_por = u.id_usuario
      WHERE i.token = $1
      `,
      [token]
    );
    return result.rows[0];
  }

  static async getPendientesPorProyecto(id_proyecto) {
    const result = await pool.query(
      `
      SELECT * FROM Invitaciones
      WHERE id_proyecto = $1 AND estado = 'pendiente'
      ORDER BY fecha_creacion DESC
      `,
      [id_proyecto]
    );
    return result.rows;
  }

  static async marcarAceptada(id_invitacion) {
    const result = await pool.query(
      `
      UPDATE Invitaciones
      SET estado = 'aceptada', fecha_aceptacion = now()
      WHERE id_invitacion = $1
      RETURNING *
      `,
      [id_invitacion]
    );
    return result.rows[0];
  }

  static async revocar(id_invitacion, id_proyecto) {
    const result = await pool.query(
      `
      UPDATE Invitaciones
      SET estado = 'revocada'
      WHERE id_invitacion = $1 AND id_proyecto = $2 AND estado = 'pendiente'
      RETURNING *
      `,
      [id_invitacion, id_proyecto]
    );
    return result.rows[0];
  }
}

module.exports = InvitacionModel;
