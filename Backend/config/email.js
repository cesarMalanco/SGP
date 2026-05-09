// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const nodemailer = require("nodemailer");

// ===== CREACIÓN DEL TRANSPORTER ====
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  console.warn(
    "EMAIL_USER o EMAIL_PASS no configurados. El envío de emails estará deshabilitado.",
  );
}

// ===== EXPORTACIÓN DEL TRANSPORTER =====
module.exports = transporter;
