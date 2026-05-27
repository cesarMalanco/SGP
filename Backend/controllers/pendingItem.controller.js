// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const { Pending_Item } = require("../models/PendingItem");

// ===== CONTROLADORES =====
// Obtener pendientes de un evento
exports.getPendingsByLog = async (req, res) => {
    try {
        const { logId } = req.params;
        const pendings = await Pending_Item.getPendingsByLog(logId);
        res.json(pendings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener pendientes de un expediente completo
exports.getPendingsByCaseFile = async (req, res) => {
    try {
        const { caseId } = req.params;
        const pendings = await Pending_Item.getPendingsByCaseFile(caseId);
        res.json(pendings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Screen Pendientes: todos los pendientes por día y juzgado
exports.getAllPendingsOrganized = async (req, res) => {
    try {
        const pendings = await Pending_Item.getAllPendingsOrganized();
        res.json(pendings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear pendiente
exports.createPending = async (req, res) => {
    try {
        const { log_id, description, date } = req.body;
        const pendingId = await Pending_Item.createPending(log_id, description, date);
        res.status(201).json({ message: "Pendiente creado", pendingId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar pendiente
exports.updatePending = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const pending = await Pending_Item.getPendingById(id);

        if (!pending) {
            return res.status(404).json({ error: "Pendiente no encontrado" });
        }

        const updatedId = await Pending_Item.updatePending(id, updates);
        res.json({ message: "Pendiente actualizado", pendingId: updatedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Marcar o desmarcar como completado
exports.toggleCompleted = async (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body;
        const updatedId = await Pending_Item.toggleCompleted(id, completed);
        res.json({ message: "Estado actualizado", pendingId: updatedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Borrar pendiente
exports.deletePending = async (req, res) => {
    try {
        const { id } = req.params;
        await Pending_Item.deletePending(id);
        res.json({ message: "Pendiente eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};