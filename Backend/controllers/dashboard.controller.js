const { Pending_Item } = require("../models/PendingItem");
const { Case_File } = require("../models/CaseFile");
const { Contact } = require("../models/Contact");
const { Log } = require("../models/Log");

exports.getDashboardData = async (req, res) => {

    try{
        const [pendientes,expedientes,contactos,logs] = await Promise.all([
            Pending_Item.getAllPendingsOrganized(),
            Case_File.getAllCaseFiles(),
            Contact.getAllContacts(),
            Log.getAllLogs()
        ]);
        res.json({pendientes,expedientes,contactos,logs});
    }catch(error){
        res.status(500).json({
            error:error.message
        });
    }
};