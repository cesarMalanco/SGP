// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const pendingController = require("../controllers/pendingItem.controller");

// ===== MIDDLEWARE =====
router.use(authenticate);

// ===== RUTAS =====
// Agenda general: todos los pendientes por día y juzgado
router.get("/agenda", pendingController.getAllPendingsOrganized);

// Pendientes de un expediente completo
router.get("/case/:caseId", pendingController.getPendingsByCaseFile);

// Pendientes de un evento específico
router.get("/log/:logId", pendingController.getPendingsByLog);

// Crear pendiente
router.post("/", pendingController.createPending);

// Actualizar pendiente
router.put("/:id", pendingController.updatePending);

// Marcar/desmarcar como completado
router.patch("/:id/toggle", pendingController.toggleCompleted);

// Borrar pendiente
router.delete("/:id", pendingController.deletePending);

// ===== EXPORTACIÓN DE RUTAS =====
module.exports = router;