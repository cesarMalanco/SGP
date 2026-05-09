// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const paymentsController = require("../controllers/payments.controller");

// ===== MIDDLEWARE =====
router.use(authenticate)

// ===== RUTAS =====
//Ruta para ver todos los pagos por expediente
router.get("/case/:caseId", paymentsController.getPaymentsByCase);

//Ruta para crear un pago
router.post("/", paymentsController.createPayment);

//Ruta para modificar un pago
router.put("/:id", paymentsController.updatePayment);

//Ruta para eliminar un pago
router.delete("/:id", paymentsController.deletePayment);

// ===== EXPORTACIÓN DE RUTAS =====
module.exports = router;
