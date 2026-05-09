// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const pool = require("../config/database");

// ===== OBJETO USER =====
const User = {
  /**
   * Busca un usuario por su correo electrónico
   *
   * @param {string} email - Correo electrónico del usuario
   * @returns {Promise<Object|null>} - Retorna el usuario si se encuentra, o null si no existe
   */
  async findByEmail(email) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
      [email.trim()],
    );

    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Busca un usuario por su nombre de usuario
   *
   * @param {string} username - Nombre de usuario usuario
   * @returns {Promise<Object|null>} - Retorna el usuario si se encuentra, o null si no existe
   */
  async findByUsername(username) {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Busca un usuario por su ID
   *
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>} - Retorna el usuario si se encuentra, o null si no existe
   */
  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Hace el conteo de intentos fallidos de login
   */
  async updateLoginAttempts(email, failed_attempts, lock_until) {
    await pool.query(
      "UPDATE users SET failed_attempts = ?, lock_until = ? WHERE email = ?",
      [failed_attempts, lock_until, email],
    );
  },

  /**
   * Guarda el código de recuperación y su expiración
   */
  async saveResetCode(email, code, expires) {
    await pool.query(
      "UPDATE users SET resetCode = ?, resetCodeExpires = ? WHERE LOWER(email) = LOWER(?)",
      [String(code).trim(), expires, email.trim()],
    );
  },

  /**
   * Busca usuario por email y código de recuperación
   */
  async findByEmailAndResetCode(email, code) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND resetCode = ?",
      [email.trim(), String(code).trim()],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Actualiza la contraseña y borra el código de recuperación
   */
  async updatePasswordAndClearReset(email, hashedPassword) {
    await pool.query(
      "UPDATE users SET password = ?, resetCode = NULL, resetCodeExpires = NULL WHERE email = ?",
      [hashedPassword, email],
    );
  },
};

// ===== EXPORTACIÓN DEL MODELO =====
module.exports = {
  User,
};
