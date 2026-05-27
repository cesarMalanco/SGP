// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const { Log } = require("../models/Log");

// ===== CONTROLADORES =====
// Obtener todos los eventos de la bitácora de un expediente
exports.getLogsByCaseFile = async (req, res) => {
    try {
        const { caseId } = req.params;
        const logs = await Log.getLogsByCaseFile(caseId);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un evento por ID
exports.getLogById = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await Log.getLogById(id);

        if (!log) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }

        res.json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear evento en la bitácora
exports.createLog = async (req, res) => {
    try {
        const { case_file_id, date, action } = req.body;
        const logId = await Log.createLog(case_file_id, date, action);
        res.status(201).json({ message: "Evento creado", logId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar evento
exports.updateLog = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const log = await Log.getLogById(id);

        if (!log) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }

        const updatedId = await Log.updateLog(id, updates);
        res.json({ message: "Evento actualizado", logId: updatedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Borrar evento y sus pendientes
exports.deleteLog = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await Log.getLogById(id);

        if (!log) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }

        await Log.deleteLog(id);
        res.json({ message: "Evento eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};