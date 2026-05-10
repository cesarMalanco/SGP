// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const { Payment } = require("../models/Payment");
const pool = require("../config/database");

// ===== CONTROLADORES =====
// Función para obtener los pagos por expediente
exports.getPaymentsByCase = async (req, res) => {
    try {
        const { caseId } = req.params;
        const payments = await Payment.getPaymentsByCase(caseId);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Función para crear un pago
exports.createPayment = async (req, res) => {
    try {
        const { case_file_id, date, concept, amount, payment_method, paid_by, receipt_no } = req.body;
        const paymentId = await Payment.createPayment(case_file_id, date, concept, amount, payment_method, paid_by, receipt_no);
        await exports.updateBalanceCaseFile(case_file_id);
        res.status(201).json({ message: "Pago creado", paymentId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Función para actualizar un pago
exports.updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const payment = await Payment.getById(id);

        if (!payment) {
            return res.status(404).json({ error: "Pago no encontrado" });
        }
        const updatedId = await Payment.updatePayment(id, updates);
        await exports.updateBalanceCaseFile(payment.case_file_id);
        res.json({ message: "Pago actualizado", paymentId: updatedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Función para eliminar un pago
exports.deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.getById(id);
        await Payment.deletePayment(id);
        if (payment) {
            await exports.updateBalanceCaseFile(payment.case_file_id);
        }
        res.json({ message: "Pago eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Función para actualizar los honorarios restantes del expediente
exports.updateBalanceCaseFile = async (case_file_id) => {
    try {
        // Obtener el total_fee del expediente
        const [caseFile] = await pool.query(
            "SELECT total_fee FROM case_files WHERE case_file_id = ?",
            [case_file_id]
        );

        if (!caseFile.length) return;

        const totalFee = caseFile[0].total_fee;

        // Sumar todos los pagos del expediente
        const [payments] = await pool.query(
            "SELECT SUM(amount) as totalPaid FROM payment WHERE case_file_id = ?",
            [case_file_id]
        );

        const totalPaid = payments[0].totalPaid || 0;

        // Calcular el nuevo saldo
        const remainingBalance = totalFee - totalPaid;

        // Actualizar el expediente
        await pool.query(
            "UPDATE case_files SET remaining_balance = ? WHERE case_file_id = ?",
            [remainingBalance, case_file_id]
        );
    } catch (error) {
        console.error("Error al actualizar saldo:", error);
    }
}