// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const pool = require("../config/database");

// ===== OBJETO USER =====
const User = {
  // Buscar usuario por email
  async findByEmail(email) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
      [email.trim()],
    );

    return rows.length > 0 ? rows[0] : null;
  },

  // Buscar usuario por nombre de usuario
  async findByUsername(username) {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    return rows.length > 0 ? rows[0] : null;
  },

  // Buscar usuario por ID
  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    return rows.length > 0 ? rows[0] : null;
  },


  // Realizar conteo de intentos fallidos de login
  async updateLoginAttempts(email, failed_attempts, lock_until) {
    await pool.query(
      "UPDATE users SET failed_attempts = ?, lock_until = ? WHERE email = ?",
      [failed_attempts, lock_until, email],
    );
  },

  // Guardar el código de recuperación y su expiración
  async saveResetCode(email, code, expires) {
    await pool.query(
      "UPDATE users SET resetCode = ?, resetCodeExpires = ? WHERE LOWER(email) = LOWER(?)",
      [String(code).trim(), expires, email.trim()],
    );
  },

  // Buscar usuario por email y código de recuperación
  async findByEmailAndResetCode(email, code) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND resetCode = ?",
      [email.trim(), String(code).trim()],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  // Actualizar la contraseña y borra el código de recuperación
  async updatePasswordAndClearReset(email, hashedPassword) {
    await pool.query(
      "UPDATE users SET password = ?, resetCode = NULL, resetCodeExpires = NULL WHERE email = ?",
      [hashedPassword, email],
    );
  },
};

// ===== EXPORTACIÓN DEL MODELO =====
module.exports = {
  User
};
