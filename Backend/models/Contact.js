const pool = require("../config/database");

// OBJETO CONTACT 
const Contact = {
    // Obtener todos los contactos
async getAllContacts() {
    const [rows] = await pool.query(`
        SELECT c.contact_id, c.name, c.address, c.phone, c.category,
        GROUP_CONCAT(DISTINCT ip.type SEPARATOR ', ') AS roles,
        GROUP_CONCAT(DISTINCT cf.internal_number SEPARATOR ', ') AS expedientes

        FROM contact c
        LEFT JOIN involved_party ip
        ON c.contact_id = ip.contact_id

        LEFT JOIN case_contact cc
        ON c.contact_id = cc.contact_id

        LEFT JOIN case_files cf
        ON cc.case_file_id = cf.case_file_id

        GROUP BY c.contact_id

        ORDER BY c.contact_id
        `);

        return rows;

    },

    // Obtener contacto por ID
    async getContactById(contact_id) {
        const [rows] = await pool.query(
            "SELECT * FROM contact WHERE contact_id = ?",
            [contact_id]
        );
        return rows[0] || null;
    },

    // Crear contacto
    async createContact({ name, address = null, phone = null, category = null }) {
        const [result] = await pool.query(
            "INSERT INTO contact (name, address, phone, category) VALUES (?, ?, ?, ?)",
            [name, address, phone, category]
        );
        return result.insertId;
    },

    // Actualizar contacto
    async updateContact(contact_id, { name, address, phone, category }) {
        await pool.query(
            "UPDATE contact SET name = ?, address = ?, phone = ?, category = ? WHERE contact_id = ?",
            [name, address, phone, category, contact_id]
        );
        return contact_id;
    },

    // Borrar contacto
    async deleteContact(contact_id) {
        await pool.query("DELETE FROM contact WHERE contact_id = ?", [contact_id]);
        return contact_id;
    },

    // Buscar contacto existente
    async findContact(name) {
        const [rows] =await pool.query(
            `
            SELECT *
            FROM contact
            WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1`, [name]
        );

        return rows[0] || null;

    },

    // Validar contacto antes de crear uno nuevo
    async ensureContact({name, address=null,phone=null,category=null}) {
        const existing = await Contact.findContact(name);
        if(existing){
            return existing.contact_id;
        }
        return await Contact.createContact({name,address,phone,category});
        },
}

//  EXPORTAR  
module.exports = {
    Contact
};


