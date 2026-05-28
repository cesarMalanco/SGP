// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const logController = require("../controllers/log.controller");

// ===== MIDDLEWARE =====
router.use(authenticate);

// ===== RUTAS =====

// Obtener todos los eventos
router.get("/", logController.getAllLogs);

// Obtener todos los eventos de la bitácora de un expediente
router.get("/case/:caseId", logController.getLogsByCaseFile);

// Obtener un evento por ID
router.get("/:id", logController.getLogById);

// Crear evento
router.post("/", logController.createLog);

// Actualizar evento
router.put("/:id", logController.updateLog);

// Borrar evento y sus pendientes
router.delete("/:id", logController.deleteLog);

// ===== EXPORTACIÓN DE RUTAS =====
module.exports = router;