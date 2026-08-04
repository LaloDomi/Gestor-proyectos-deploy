const { sql, poolPromise } = require("../config/db");

class UsuarioModel {
  static async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, r.nombre_rol, u.fecha_registro
      FROM Usuarios u
      INNER JOIN Roles r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario
    `);
    return result.recordset;
  }

  static async getById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_usuario", sql.Int, id)
      .query(`
        SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, r.nombre_rol, u.fecha_registro
        FROM Usuarios u
        INNER JOIN Roles r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = @id_usuario
      `);
    return result.recordset[0];
  }

  static async create({ nombre, correo, contrasena, id_rol }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("nombre", sql.VarChar(100), nombre)
      .input("correo", sql.VarChar(100), correo)
      .input("contrasena", sql.VarChar(100), contrasena)
      .input("id_rol", sql.Int, id_rol)
      .query(`
        INSERT INTO Usuarios (nombre, correo, contrasena, id_rol)
        OUTPUT INSERTED.*
        VALUES (@nombre, @correo, @contrasena, @id_rol)
      `);
    return result.recordset[0];
  }

  static async update(id, { nombre, correo, contrasena, id_rol }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_usuario", sql.Int, id)
      .input("nombre", sql.VarChar(100), nombre)
      .input("correo", sql.VarChar(100), correo)
      .input("contrasena", sql.VarChar(100), contrasena)
      .input("id_rol", sql.Int, id_rol)
      .query(`
        UPDATE Usuarios
        SET nombre = @nombre, correo = @correo, contrasena = @contrasena, id_rol = @id_rol
        OUTPUT INSERTED.*
        WHERE id_usuario = @id_usuario
      `);
    return result.recordset[0];
  }

  static async remove(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id_usuario", sql.Int, id)
      .query("DELETE FROM Usuarios OUTPUT DELETED.* WHERE id_usuario = @id_usuario");
    return result.recordset[0];
  }

  static async getByCorreo(correo) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("correo", sql.VarChar(100), correo)
      .query("SELECT * FROM Usuarios WHERE correo = @correo");
    return result.recordset[0];
  }
}

module.exports = UsuarioModel;
