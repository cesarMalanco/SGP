// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const { Case_File } = require("../models/CaseFile");
const { Contact } = require("../models/Contact");
const { NormalizationAuxiliar } = require("../models/NormalizationAuxiliar");
const pool = require("../config/database");

// ===== CONTROLADORES =====
// Función para obtener todos los expedientes
exports.getAllCaseFiles = async (req, res) => {
    try {
        const caseFiles = await Case_File.getAllCaseFiles();
        res.json(caseFiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Función para obtener expediente por ID
exports.getCaseFileById = async (req, res) => {
    try {
        const { id } = req.params;
        const caseFile = await Case_File.getCaseFileById(id);
        if (!caseFile) {
            return res.status(404).json({ error: "Expediente no encontrado" });
        }
        res.json(caseFile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Función para crear un expediente
exports.createCaseFile = async (req, res) => {
    try {
        const {
            case_number,
            court,
            title,
            trial_type,
            ruling_area,
            status,
            total_fee,
            entry_date,
            client_type,
            actor,
            demandado,
            licenciado
        } = req.body;

        // Calcular saldo restante
        const calculatedBalance = total_fee;

        // Crear expediente
        const caseId = await Case_File.createCaseFile(
            case_number, court, title, trial_type, ruling_area, status,
            total_fee, calculatedBalance, entry_date, client_type
        );

        // Crear contactos y relaciones
        if (actor) {
            const actorId = await Contact.ensureContact({ name: actor });
            await NormalizationAuxiliar.ensureInvolvedParty(actorId, "actor");
            await NormalizationAuxiliar.addCaseContact(caseId, actorId);
        }

        if (demandado) {
            const defendantId = await Contact.ensureContact({ name: demandado });
            await NormalizationAuxiliar.ensureInvolvedParty(defendantId, "defendant");
            await NormalizationAuxiliar.addCaseContact(caseId, defendantId);
        }

        if (licenciado) {
            const lawyerId = await Contact.ensureContact({ name: licenciado });
            await Contact.createLawyer(lawyerId, null);
            await NormalizationAuxiliar.ensureInvolvedParty(lawyerId, "lawyer");
            await NormalizationAuxiliar.addCaseContact(caseId, lawyerId);
        }

        res.status(201).json({ message: "Expediente creado", caseId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Función para actualizar expediente
exports.updateCaseFile = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedId = await Case_File.updateCaseFile(id, updateData);
        res.json({ message: "Expediente actualizado", caseId: updatedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Función para borrar expediente
exports.deleteCaseFile = async (req, res) => {
    try {
        const { id } = req.params;
        await Case_File.deleteCaseFile(id);
        res.json({ message: "Expediente eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
