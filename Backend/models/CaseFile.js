// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const pool = require("../config/database");

// ===== OBJETO CASE_FILE =====
const Case_File = {
    // Obtener todos los expedientes
    async getAllCaseFiles() {

        const [rows] = await pool.query(`

            SELECT 
                cf.*,

                MAX(
                    CASE
                        WHEN type = 'actor'
                        THEN c.name
                    END
                ) AS actor,

                MAX(
                    CASE
                        WHEN type = 'defendant'
                        THEN c.name
                    END
                ) AS demandado,

                MAX(
                    CASE
                        WHEN type = 'lawyer'
                        THEN c.name
                    END
                ) AS licenciado

            FROM case_files cf

            LEFT JOIN case_contact cc
                ON cf.case_file_id = cc.case_file_id

            LEFT JOIN contact c
                ON cc.contact_id = c.contact_id

            LEFT JOIN involved_party ip
                ON c.contact_id = ip.contact_id

            GROUP BY cf.case_file_id

        `);

        return rows;
    },

    // Obtener expediente por ID
    async getCaseFileById(case_file_id) {

        const [rows] = await pool.query(`

            SELECT 
                cf.*,

                MAX(
                    CASE
                        WHEN type = 'actor'
                        THEN c.name
                    END
                ) AS actor,

                MAX(
                    CASE
                        WHEN type = 'defendant'
                        THEN c.name
                    END
                ) AS demandado,

                MAX(
                    CASE
                        WHEN type = 'lawyer'
                        THEN c.name
                    END
                ) AS licenciado

            FROM case_files cf

            LEFT JOIN case_contact cc
                ON cf.case_file_id = cc.case_file_id

            LEFT JOIN contact c
                ON cc.contact_id = c.contact_id

            LEFT JOIN involved_party ip
                ON c.contact_id = ip.contact_id

            WHERE cf.case_file_id = ?

            GROUP BY cf.case_file_id

        `, [case_file_id]);

        return rows[0] || null;
    },

    // Crear expediente
    async createCaseFile(
        caseFile_No,
        court,
        title,
        trial_type,
        ruling_area,
        status,
        total_fee,
        remaining_balance,
        entry_date,
        client_type,
    ) {
        const [result] = await pool.query(
            "INSERT INTO case_files (case_number, court, title, trial_type, ruling_area, status, total_fee, remaining_balance, entry_date, client_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                caseFile_No,
                court,
                title,
                trial_type,
                ruling_area,
                status,
                total_fee,
                remaining_balance,
                entry_date,
                client_type,
            ]
        );
        return result.insertId;
    },

    // Actualizar expediente
    async updateCaseFile(case_file_id, {
        caseFile_No,
        court,
        title,
        trial_type,
        ruling_area,
        status,
        total_fee,
        remaining_balance,
        entry_date,
        client_type
    }) {
        const params = [
            caseFile_No,
            court,
            title,
            trial_type,
            ruling_area,
            status,
            total_fee,
            remaining_balance,
            entry_date,
            client_type
        ];

        let sql = `UPDATE case_files SET case_number = ?, court = ?, title = ?, trial_type = ?, ruling_area = ?, status = ?, total_fee = ?, remaining_balance = ?, entry_date = ?, client_type = ?`;

        params.push(case_file_id);
        sql += ` WHERE case_file_id = ?`;

        await pool.query(sql, params);
        return case_file_id;
    },

    // Borrar expediente y sus datos relacionados
    async deleteCaseFile(case_file_id) {
        // Borrar tareas de procedimientos ligadas a los logs del expediente
        await pool.query(
            `DELETE FROM procedure_task WHERE log_id IN (SELECT log_id FROM log WHERE case_file_id = ?)`,
            [case_file_id]
        );

        // Borrar logs del expediente
        await pool.query(`DELETE FROM log WHERE case_file_id = ?`, [case_file_id]);

        // Borrar pagos del expediente
        await pool.query(`DELETE FROM payment WHERE case_file_id = ?`, [case_file_id]);

        // Borrar pendientes del expediente
        await pool.query(`DELETE FROM pending_item WHERE case_file_id = ?`, [case_file_id]);

        // Borrar relaciones expediente-contacto
        await pool.query(`DELETE FROM case_contact WHERE case_file_id = ?`, [case_file_id]);

        // Finalmente borrar el expediente
        await pool.query("DELETE FROM case_files WHERE case_file_id = ?", [case_file_id]);
        return case_file_id;
    }
}

// ===== EXPORTACIÓN DEL MODELO =====
module.exports = {
    Case_File
};


