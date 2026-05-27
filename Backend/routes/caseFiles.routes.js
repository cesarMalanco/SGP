// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const caseFileController = require("../controllers/caseFiles.controller");

// ===== MIDDLEWARE =====
router.use(authenticate)

// ===== RUTAS =====
//Ruta para ver todos los expedientes
router.get("/", caseFileController.getAllCaseFiles);

//Ruta para ver un expediente por ID
router.get("/:id", caseFileController.getCaseFileById);

//Ruta para crear un expediente
router.post("/", caseFileController.createCaseFile);

//Ruta para modificar un expediente
router.put("/:id", caseFileController.updateCaseFile);

//Ruta para borrar un expediente
router.delete("/:id", caseFileController.deleteCaseFile);

// ===== EXPORTACIÓN DE RUTAS =====
module.exports = router;
