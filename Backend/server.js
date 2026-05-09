// === DEPENDENCIAS Y CONFIGURACIÓN ===
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes.js");
const caseFilesRoutes = require("./routes/caseFiles.routes.js");
const paymentsRoutes = require("./routes/payments.routes");
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

const ALW_ORIGINS = process.env.ALLOWED_ORIGINS

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || ALW_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS: " + origin));
    },

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    optionsSuccessStatus: 200,
  }),
);

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/case-files", caseFilesRoutes);
app.use("/api/payments", paymentsRoutes);

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
