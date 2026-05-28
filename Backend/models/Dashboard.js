const pool = require("../config/database");

// ===== OBJETO DASHBOARD =====
const Dashboard = {
    // ===== Estadísticas =====
    async getStats() {

        // expedientes
        const [caseFiles] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM case_files
        `);

        // contactos
        const [contacts] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM contact
        `);

        // pendientes activos
        const [pendings] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM pending_item
        `);

        // eventos hoy
        const [eventsToday] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM log
            WHERE DATE(date) = CURDATE()
        `);

        return {
            expedientes: caseFiles[0].total,
            contactos: contacts[0].total,
            pendientes: pendings[0].total,
            eventosHoy: eventsToday[0].total
        };
    },

    // ===== Obtener la actividad reciente =====
    async getRecentActivity() {
        const [rows] = await pool.query(`
            SELECT l.log_id, l.date, l.action, cf.case_number, cf.case_file_id
            FROM log l
            JOIN case_files cf
                ON l.case_file_id = cf.case_file_id
            ORDER BY l.date DESC
            LIMIT 8
        `);

        return rows;
    },

    // ===== Obtener los próximos pendientes =====
    async getUpcomingPendings() {

        const [rows] = await pool.query(`
            SELECT p.pending_id, p.description, p.date, cf.case_number, cf.case_file_id
            FROM pending_item p
            JOIN log l
                ON p.log_id = l.log_id
            JOIN case_files cf
                ON l.case_file_id = cf.case_file_id
            WHERE p.date >= CURDATE()
            ORDER BY p.date ASC
            LIMIT 5
        `);
        return rows;
    }

};

module.exports = { Dashboard };

