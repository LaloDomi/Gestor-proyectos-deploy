const { pool } = require("../config/db");

class ChatCanalModel {
  static async getById(id_canal) {
    const result = await pool.query("SELECT * FROM ChatCanales WHERE id_canal = $1", [id_canal]);
    return result.rows[0];
  }

  static async getOrCreateProyecto(id_proyecto) {
    const existente = await pool.query(
      "SELECT * FROM ChatCanales WHERE tipo = 'proyecto' AND id_proyecto = $1",
      [id_proyecto]
    );
    if (existente.rows[0]) return existente.rows[0];

    const creado = await pool.query(
      "INSERT INTO ChatCanales (tipo, id_proyecto) VALUES ('proyecto', $1) RETURNING *",
      [id_proyecto]
    );
    return creado.rows[0];
  }

  static async getOrCreateDirecto(idUsuarioA, idUsuarioB) {
    const [a, b] = [idUsuarioA, idUsuarioB].map(Number).sort((x, y) => x - y);
    const existente = await pool.query(
      "SELECT * FROM ChatCanales WHERE tipo = 'directo' AND id_usuario_a = $1 AND id_usuario_b = $2",
      [a, b]
    );
    if (existente.rows[0]) return existente.rows[0];

    const creado = await pool.query(
      "INSERT INTO ChatCanales (tipo, id_usuario_a, id_usuario_b) VALUES ('directo', $1, $2) RETURNING *",
      [a, b]
    );
    return creado.rows[0];
  }

  // Canales de proyecto donde el usuario es miembro + canales directos donde participa.
  static async getCanalesDeUsuario(id_usuario) {
    const proyectos = await pool.query(
      `
      SELECT c.id_canal, c.tipo, c.id_proyecto, p.nombre AS nombre
      FROM ChatCanales c
      INNER JOIN ProyectoMiembros pm ON pm.id_proyecto = c.id_proyecto AND pm.id_usuario = $1
      INNER JOIN Proyectos p ON p.id_proyecto = c.id_proyecto
      WHERE c.tipo = 'proyecto'
      ORDER BY p.nombre
      `,
      [id_usuario]
    );

    const directos = await pool.query(
      `
      SELECT
        c.id_canal, c.tipo,
        u.id_usuario AS id_usuario_peer, u.nombre AS nombre
      FROM ChatCanales c
      INNER JOIN Usuarios u
        ON u.id_usuario = (CASE WHEN c.id_usuario_a = $1 THEN c.id_usuario_b ELSE c.id_usuario_a END)
      WHERE c.tipo = 'directo' AND (c.id_usuario_a = $1 OR c.id_usuario_b = $1)
      ORDER BY u.nombre
      `,
      [id_usuario]
    );

    return { proyectos: proyectos.rows, directos: directos.rows };
  }

  static async usuarioTieneAcceso(canal, usuario) {
    if (canal.tipo === "proyecto") {
      if (usuario.rol_codigo === "ADMIN") return true;
      const result = await pool.query(
        "SELECT 1 FROM ProyectoMiembros WHERE id_proyecto = $1 AND id_usuario = $2",
        [canal.id_proyecto, usuario.id_usuario]
      );
      return result.rows.length > 0;
    }
    return canal.id_usuario_a === usuario.id_usuario || canal.id_usuario_b === usuario.id_usuario;
  }
}

module.exports = ChatCanalModel;
