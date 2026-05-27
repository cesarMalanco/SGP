// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const pool = require("../config/database");

// ===== OBJETO LOG =====
const Log = {

    // Obtener todos los eventos de la bitácora de un expediente
    async getLogsByCaseFile(case_file_id) {
        const [rows] = await pool.query(`
            SELECT *
            FROM log
            WHERE case_file_id = ?
            ORDER BY date DESC
        `, [case_file_id]);
        return rows;
    },

    // Obtener evento por ID
    async getLogById(log_id) {
        const [rows] = await pool.query(
            "SELECT * FROM log WHERE log_id = ?",
            [log_id]
        );
        return rows[0] || null;
    },

    // Crear evento en la bitácora
    async createLog(case_file_id, date, action) {
        const [result] = await pool.query(
            "INSERT INTO log (case_file_id, date, action) VALUES (?, ?, ?)",
            [case_file_id, date, action]
        );
        return result.insertId;
    },

    // Actualizar evento
    async updateLog(log_id, { date, action }) {
        await pool.query(
            "UPDATE log SET date = ?, action = ? WHERE log_id = ?",
            [date, action, log_id]
        );
        return log_id;
    },

    // Borrar evento y sus pendientes
    async deleteLog(log_id) {
        await pool.query(`DELETE FROM pending_item WHERE log_id = ?`, [log_id]);
        await pool.query(`DELETE FROM log WHERE log_id = ?`, [log_id]);
        return log_id;
    }

};

// ===== EXPORTACIÓN DEL MODELO =====
module.exports = { Log };