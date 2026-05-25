const { Contact } = require("../models/Contact");

//  OBTENER TODOS LOS CONTACTOS
const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.getAllContacts();
        res.status(200).json({
            success: true,
            data: contacts
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al obtener contactos"
        });
    }
};

//  ACTUALIZAR UN CONTACTO
const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        await Contact.updateContact(id,req.body);

        res.json({
            success: true,
            message: "Contacto actualizado"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// CREAR CONTACTO
const createContact = async (req, res) => {
    try {
        const {name,phone,address,category} = req.body;
        await Contact.createContact({name,phone,address,category});
        res.status(201).json({
            success: true,
            message: "Contacto creado"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ELIMINAR CONTACTO
const deleteContact = async (req,res)=>{
    try{
        const { id } = req.params;
        await Contact.deleteContact(id);
        res.json({
            success:true,
            message:"Contacto eliminado"
        });

    }catch(error){
        console.error(error);
        res.status(500).json({
            success:false,
            error:error.message
        });
    }
};


// EXPORTAR 
module.exports = {
    getAllContacts,
    createContact,
    updateContact, 
    deleteContact
};