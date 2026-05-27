// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const pool = require("../config/database");

// ===== OBJETO PENDING_ITEM =====
const Pending_Item = {

    // Obtener pendiente por ID
    async getPendingById(pending_id) {
        const [rows] = await pool.query(
            "SELECT * FROM pending_item WHERE pending_id = ?",
            [pending_id]
        );
        return rows[0] || null;
    },

    // Obtener todos los pendientes de un evento
    async getPendingsByLog(log_id) {
        const [rows] = await pool.query(`
            SELECT *
            FROM pending_item
            WHERE log_id = ?
            ORDER BY date ASC
        `, [log_id]);
        return rows;
    },

    // Obtener todos los pendientes de un expediente (via log)
    async getPendingsByCaseFile(case_file_id) {
        const [rows] = await pool.query(`
            SELECT
                p.pending_id,
                p.description,
                p.date,
                p.completed,
                l.log_id,
                l.action    AS evento
            FROM pending_item p
            JOIN log l ON p.log_id = l.log_id
            WHERE l.case_file_id = ?
            ORDER BY p.date ASC
        `, [case_file_id]);
        return rows;
    },

    // Screen Pendientes: todos los pendientes ordenados por día y luego por juzgado
    async getAllPendingsOrganized() {
        const [rows] = await pool.query(`
            SELECT
                p.pending_id,
                p.description,
                p.date,
                p.completed,
                l.log_id,
                l.action        AS evento,
                cf.case_file_id,
                cf.case_number,
                cf.title        AS expediente,
                cf.court        AS juzgado
            FROM pending_item p
            JOIN log l          ON p.log_id        = l.log_id
            JOIN case_files cf  ON l.case_file_id  = cf.case_file_id
            ORDER BY p.date ASC, cf.court ASC
        `);
        return rows;
    },

    // Crear pendiente
    async createPending(log_id, description, date) {
        const [result] = await pool.query(
            "INSERT INTO pending_item (log_id, description, date, completed) VALUES (?, ?, ?, 0)",
            [log_id, description, date]
        );
        return result.insertId;
    },

    // Actualizar pendiente
    async updatePending(pending_id, { description, date, completed }) {
        await pool.query(
            "UPDATE pending_item SET description = ?, date = ?, completed = ? WHERE pending_id = ?",
            [description, date, completed, pending_id]
        );
        return pending_id;
    },

    // Marcar o desmarcar como completado
    async toggleCompleted(pending_id, completed) {
        await pool.query(
            "UPDATE pending_item SET completed = ? WHERE pending_id = ?",
            [completed ? 1 : 0, pending_id]
        );
        return pending_id;
    },

    // Borrar pendiente
    async deletePending(pending_id) {
        await pool.query(
            "DELETE FROM pending_item WHERE pending_id = ?",
            [pending_id]
        );
        return pending_id;
    }

};

// ===== EXPORTACIÓN DEL MODELO =====
module.exports = { Pending_Item };