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
            internal_number,
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
            lic_actor,
            lic_demandado,
            expert_role,
        } = req.body;

        // Calcular saldo restante
        const calculatedBalance = parseFloat(total_fee) || 0;

        // Crear expediente
        const caseId = await Case_File.createCaseFile(
            case_number, internal_number, court, title, trial_type, ruling_area, status,
            total_fee, calculatedBalance, entry_date, client_type, expert_role
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

        if (lic_actor) {
            const lawyerActorId = await Contact.ensureContact({ name: lic_actor });
            await Contact.createLawyer(lawyerActorId, null);
            await NormalizationAuxiliar.ensureInvolvedParty(
                lawyerActorId,
                "actor_lawyer"
            );

            await NormalizationAuxiliar.addCaseContact(
                caseId,
                lawyerActorId
            );
        }

        if (lic_demandado) {
            const lawyerDefendantId = await Contact.ensureContact({name: lic_demandado});

            await Contact.createLawyer(lawyerDefendantId, null);
            await NormalizationAuxiliar.ensureInvolvedParty(lawyerDefendantId,"defendant_lawyer");
            await NormalizationAuxiliar.addCaseContact(caseId,lawyerDefendantId);
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

        const {
            case_number,
            internal_number,
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
            lic_actor,
            lic_demandado,
            expert_role
        } = req.body;

        // ===== OBTENER SALDO ACTUAL =====
        const [currentCase] = await pool.query(
            `SELECT remaining_balance 
             FROM case_files 
             WHERE case_file_id = ?`,
            [id]
        );

        let remaining_balance = 0;

        if (currentCase.length > 0) {
            remaining_balance = currentCase[0].remaining_balance;
        }

        // ===== ACTUALIZAR TABLA case_files =====
        await Case_File.updateCaseFile(id, {
            case_number,
            internal_number,
            court,
            title,
            trial_type,
            ruling_area,
            status,
            total_fee,
            remaining_balance,
            entry_date,
            client_type,
            expert_role
        });

        // ===== ELIMINAR RELACIONES ANTERIORES =====
        await pool.query(
            "DELETE FROM case_contact WHERE case_file_id = ?",
            [id]
        );

        // ===== ACTOR =====
        if (actor) {
            const actorId = await Contact.ensureContact({
                name: actor
            });

            await NormalizationAuxiliar.ensureInvolvedParty(
                actorId,
                "actor"
            );

            await NormalizationAuxiliar.addCaseContact(
                id,
                actorId
            );
        }

        // ===== DEMANDADO =====
        if (demandado) {
            const defendantId = await Contact.ensureContact({
                name: demandado
            });

            await NormalizationAuxiliar.ensureInvolvedParty(
                defendantId,
                "defendant"
            );

            await NormalizationAuxiliar.addCaseContact(
                id,
                defendantId
            );
        }

        // ===== LIC ACTOR =====
        if (lic_actor) {
            const lawyerActorId = await Contact.ensureContact({
                name: lic_actor
            });

            await Contact.createLawyer(
                lawyerActorId,
                null
            );

            await NormalizationAuxiliar.ensureInvolvedParty(
                lawyerActorId,
                "actor_lawyer"
            );

            await NormalizationAuxiliar.addCaseContact(
                id,
                lawyerActorId
            );
        }

        // ===== LIC DEMANDADO =====
        if (lic_demandado) {
            const lawyerDefendantId = await Contact.ensureContact({
                name: lic_demandado
            });

            await Contact.createLawyer(
                lawyerDefendantId,
                null
            );

            await NormalizationAuxiliar.ensureInvolvedParty(
                lawyerDefendantId,
                "defendant_lawyer"
            );

            await NormalizationAuxiliar.addCaseContact(
                id,
                lawyerDefendantId
            );
        }

        res.json({
            message: "Expediente actualizado correctamente",
            caseId: id
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

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
