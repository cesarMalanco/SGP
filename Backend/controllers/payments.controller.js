// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const { Payment } = require("../models/Payment");

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
        const updatedId = await Payment.updatePayment(id, updates);
        res.json({ message: "Pago actualizado", paymentId: updatedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Función para eliminar un pago
exports.deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        await Payment.deletePayment(id);
        res.json({ message: "Pago eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
