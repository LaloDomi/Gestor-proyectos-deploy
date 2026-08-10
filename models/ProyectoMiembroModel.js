const { pool } = require("../config/db");

class ProyectoMiembroModel {
  static async getByProyecto(id_proyecto) {
    const result = await pool.query(
      `
      SELECT
        pm.id_miembro,
        pm.id_proyecto,
        pm.id_usuario,
        u.nombre,
        u.correo,
        r.codigo AS rol_codigo,
        pm.rol_proyecto,
        pm.fecha_union
      FROM ProyectoMiembros pm
      INNER JOIN Usuarios u ON pm.id_usuario = u.id_usuario
      INNER JOIN Roles r ON u.id_rol = r.id_rol
      WHERE pm.id_proyecto = $1
      ORDER BY pm.rol_proyecto, u.nombre
      `,
      [id_proyecto]
    );
    return result.rows;
  }

  static async getByProyectoYUsuario(id_proyecto, id_usuario) {
    const result = await pool.query(
      "SELECT * FROM ProyectoMiembros WHERE id_proyecto = $1 AND id_usuario = $2",
      [id_proyecto, id_usuario]
    );
    return result.rows[0];
  }

  static async getProyectosDeUsuario(id_usuario) {
    const result = await pool.query(
      "SELECT id_proyecto, rol_proyecto FROM ProyectoMiembros WHERE id_usuario = $1",
      [id_usuario]
    );
    return result.rows;
  }

  static async add(id_proyecto, id_usuario, rol_proyecto = "colaborador") {
    const result = await pool.query(
      `
      INSERT INTO ProyectoMiembros (id_proyecto, id_usuario, rol_proyecto)
      VALUES ($1, $2, $3)
      ON CONFLICT (id_proyecto, id_usuario) DO UPDATE SET rol_proyecto = EXCLUDED.rol_proyecto
      RETURNING *
      `,
      [id_proyecto, id_usuario, rol_proyecto]
    );
    return result.rows[0];
  }

  static async updateRol(id_proyecto, id_usuario, rol_proyecto) {
    const result = await pool.query(
      `
      UPDATE ProyectoMiembros
      SET rol_proyecto = $1
      WHERE id_proyecto = $2 AND id_usuario = $3
      RETURNING *
      `,
      [rol_proyecto, id_proyecto, id_usuario]
    );
    return result.rows[0];
  }

  static async remove(id_proyecto, id_usuario) {
    const result = await pool.query(
      "DELETE FROM ProyectoMiembros WHERE id_proyecto = $1 AND id_usuario = $2 RETURNING *",
      [id_proyecto, id_usuario]
    );
    return result.rows[0];
  }
}

module.exports = ProyectoMiembroModel;
