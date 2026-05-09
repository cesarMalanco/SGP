// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const pool = require("../config/database");

// ===== OBJETO AUXILIAR =====
const NormalizationAuxiliar = {
    // Validar partes involucradas antes de agregar relación a la BD
    async ensureInvolvedParty(contact_id, type) {
        const [rows] = await pool.query(
            "SELECT * FROM involved_party WHERE contact_id = ? AND type = ? LIMIT 1",
            [contact_id, type]
        );

        if (rows.length === 0) {
            await pool.query(
                "INSERT INTO involved_party (contact_id, type) VALUES (?, ?)",
                [contact_id, type]
            );
        }
    },

    // Agregar la relación entre Case y Contact
    async addCaseContact(case_file_id, contact_id) {
        const [rows] = await pool.query(
            "SELECT * FROM case_contact WHERE case_file_id = ? AND contact_id = ? LIMIT 1",
            [case_file_id, contact_id]
        );

        if (rows.length === 0) {
            await pool.query(
                "INSERT INTO case_contact (case_file_id, contact_id) VALUES (?, ?)",
                [case_file_id, contact_id]
            );
        }
    }
}

// ===== EXPORTACIÓN DEL MODELO =====
module.exports = {
    NormalizationAuxiliar
};
