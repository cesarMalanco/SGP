// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const pool = require("../config/database");

// ===== OBJETO CONTACT =====
const Contact = {
    // Obtener todos los contactos
    async getAllContacts() {
        const [rows] = await pool.query("SELECT * FROM contact");
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
    async createContact({ name, address = null, phone = null }) {
        const [result] = await pool.query(
            "INSERT INTO contact (name, address, phone) VALUES (?, ?, ?)",
            [name, address, phone]
        );
        return result.insertId;
    },

    // Crear registro de abogado
    async createLawyer(contact_id, office = null) {
        await pool.query(
            "INSERT INTO lawyer (contact_id, office) VALUES (?, ?)",
            [contact_id, office]
        );
    },

    // Actualizar contacto
    async updateContact(contact_id, { name, address, phone }) {
        await pool.query(
            "UPDATE contact SET name = ?, address = ?, phone = ? WHERE contact_id = ?",
            [name, address, phone, contact_id]
        );
        return contact_id;
    },

    // Borrar contacto
    async deleteContact(contact_id) {
        await pool.query("DELETE FROM contact WHERE contact_id = ?", [contact_id]);
        return contact_id;
    },

    // Buscar contacto existente
    async findContact(name, phone) {
        const [rows] = await pool.query(
            `SELECT * FROM contact WHERE name = ? AND phone = ? LIMIT 1`,
            [name, phone]
        );
        return rows[0] || null;
    },

    // Validar contacto antes de crear uno nuevo
    async ensureContact({ name, address = null, phone = null }) {
        const existing = await Contact.findContact(name, phone);
        if (existing) return existing.contact_id;
        return await Contact.createContact({ name, address, phone });
    }
}

// ===== EXPORTACIÓN DEL MODELO =====
module.exports = {
    Contact
};


