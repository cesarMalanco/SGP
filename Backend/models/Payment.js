// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const pool = require("../config/database");

// ===== OBJETO PAYMENT =====
const Payment = {
    // Obtener pago por ID
    async getById(payment_id) {
        const [rows] = await pool.query("SELECT * FROM payment WHERE payment_id = ?", [payment_id]);
        return rows[0]; 
    },

    // Obtener pagos por expediente
    async getPaymentsByCase(case_file_id) {
        const [rows] = await pool.query("SELECT * FROM payment WHERE case_file_id = ?", [case_file_id]);
        return rows;
    },

    // Crear pago
    async createPayment(case_file_id, date, concept, amount, payment_method, paid_by, receipt_no) {
        const [result] = await pool.query(
            `INSERT INTO payment 
            (case_file_id, date, concept, amount, payment_method, paid_by, receipt_no)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [case_file_id, date, concept, amount, payment_method, paid_by, receipt_no]
        );

        return result.insertId;
    },

    // Actualizar pago
    async updatePayment(payment_id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
        const values = Object.values(updates);
        values.push(payment_id);
        await pool.query(`UPDATE payment SET ${fields} WHERE payment_id = ?`, values);
        return payment_id;
    },

    // Borrar pago
    async deletePayment(payment_id) {
        await pool.query("DELETE FROM payment WHERE payment_id = ?", [payment_id]);
        return payment_id;
    }
};

// ===== EXPORTACIÓN DEL MODELO =====
module.exports = {
    Payment
};
