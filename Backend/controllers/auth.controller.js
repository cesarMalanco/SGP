// ===== DEPENDENCIAS Y CONFIGURACIÓN =====
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const pool = require("../config/database");

const transporter = require("../config/email");

const { User } = require("../models/User");

// ===== CONTROLADORES =====
// Función para hacer login
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Buscar usuario por email o username
    let user = await User.findByEmail(identifier);
    if (!user) {
      user = await User.findByUsername(identifier);
    }
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Revisar si la cuenta está bloqueada
    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      // Si está bloqueada, solo devolver el tiempo restante, no reiniciar
      const msLeft = new Date(user.lock_until) - new Date();
      return res.status(403).json({
        message: "Cuenta bloqueada por 3 minutos por intentos fallidos.",
        lockTime: Math.ceil(msLeft / 1000),
      });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      let failed_attempts = (user.failed_attempts || 0) + 1;
      let lock_until = null;
      const maxAttempts = 3;
      const attemptsLeft = maxAttempts - failed_attempts;

      if (failed_attempts >= maxAttempts) {
        lock_until = new Date(Date.now() + 3 * 60 * 1000); // 3 minutos
        await User.updateLoginAttempts(user.email, failed_attempts, lock_until);
        return res.status(403).json({
          message: "Cuenta bloqueada por 3 minutos por intentos fallidos.",
          lockTime: 3 * 60,
        });
      }

      await User.updateLoginAttempts(user.email, failed_attempts, lock_until);
      return res.status(400).json({
        message: `Contraseña incorrecta. Te quedan ${attemptsLeft} intento(s) antes del bloqueo.`,
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    await User.updateLoginAttempts(user.email, 0, null);
    res.status(200).json({
      message: "Login exitoso",
      token,
      name: user.name,
      username: user.username,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

// Función para enviar código (recuperación de contraseña)
exports.sendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (!transporter) {
      return res
        .status(500)
        .json({ message: "El servicio de email no está configurado" });
    }

    const user = await User.findByEmail(normalizedEmail);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const code = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    // Usar el email del usuario de la base de datos para consistencia
    await User.saveResetCode(user.email, code, expires);

    const path = require("path");
    const logoPath = path.join(__dirname, "../../Frontend/MEDIA/IMAGES/iussemper_logo.png");

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8F5F0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F8F5F0;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(92, 64, 51, 0.15);">
              
              <!-- Header con Logo -->
              <tr>
                <td style="background: linear-gradient(135deg, #3D2B1F 0%, #5C4033 100%); padding: 40px 30px; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="center">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="vertical-align: middle; padding-right: 20px;">
                              <div style="width: 70px; height: 70px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; border: 2px solid #E8D9A9; display: inline-block; text-align: center; line-height: 66px;">
                                <img src="cid:iussemperlogo" alt="Ius Semper" style="width: 50px; height: 50px; vertical-align: middle; border-radius: 50%;">
                              </div>
                            </td>
                            <td style="vertical-align: middle; text-align: left;">
                              <h1 style="color: #D4AF37; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 700; letter-spacing: 1px;">Ius Semper</h1>
                              <p style="color: #E8D9A9; margin: 5px 0 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-weight: 400;">Despacho Jurídico</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Contenido Principal -->
              <tr>
                <td style="padding: 50px 40px 40px 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <!-- Título -->
                    <tr>
                      <td style="text-align: center; padding-bottom: 30px;">
                        <h2 style="color: #3D2B1F; margin: 0 0 10px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 600;">Recuperación de Contraseña</h2>
                        <p style="color: #5A5A5A; margin: 0; font-size: 15px; line-height: 1.6;">Hemos recibido una solicitud para restablecer su contraseña</p>
                      </td>
                    </tr>
                    
                    <!-- Caja del Código -->
                    <tr>
                      <td style="padding: 30px 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #F8F5F0 0%, #E8E5DE 100%); border-radius: 12px; border: 1px solid #E8D9A9;">
                          <tr>
                            <td style="padding: 35px 30px; text-align: center;">
                              <p style="margin: 0 0 20px 0; color: #5A5A5A; font-size: 14px;">Su código de verificación es:</p>
                              <div style="background: linear-gradient(135deg, #3D2B1F 0%, #5C4033 100%); color: #D4AF37; font-size: 36px; font-weight: 700; letter-spacing: 10px; padding: 22px 40px; border-radius: 10px; display: inline-block; font-family: 'Poppins', monospace; box-shadow: 0 4px 15px rgba(92, 64, 51, 0.3);">
                                ${code}
                              </div>
                              <p style="margin: 20px 0 0 0; color: #8B7355; font-size: 13px;">
                                <span style="color: #D4AF37;">⏱</span> Este código expirará en <strong style="color: #5C4033;">5 minutos</strong>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Aviso de Seguridad -->
                    <tr>
                      <td style="padding-bottom: 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFF9E6; border: 1px solid #E8D9A9; border-radius: 10px; border-left: 4px solid #D4AF37;">
                          <tr>
                            <td style="padding: 18px 20px;">
                              <p style="margin: 0; color: #5C4033; font-size: 13px; line-height: 1.5;">
                                <strong style="color: #3D2B1F;">⚠️ Aviso de Seguridad:</strong><br>
                                Si usted no solicitó este código, puede ignorar este mensaje. Su cuenta permanecerá segura.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Línea decorativa -->
                    <tr>
                      <td style="padding: 10px 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="height: 1px; background: linear-gradient(to right, transparent, #D4AF37, transparent);"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Contacto -->
                    <tr>
                      <td style="text-align: center; padding-top: 25px;">
                        <p style="color: #5A5A5A; font-size: 13px; margin: 0; line-height: 1.6;">
                          ¿Necesita asistencia? Contáctenos en:<br>
                          <a href="mailto:iussemper.soporte@gmail.com" style="color: #5C4033; text-decoration: none; font-weight: 500;">iussemper.soporte@gmail.com</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #3D2B1F; padding: 25px 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="color: #D4AF37; margin: 0 0 8px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 600;">Ius Semper</p>
                        <p style="color: #8B7355; margin: 0 0 15px 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Despacho Jurídico</p>
                        <p style="color: #5A5A5A; margin: 0; font-size: 11px;">
                          © 2026 Ius Semper. Todos los derechos reservados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

    await transporter.sendMail({
      from: `"Ius Semper Despacho Jurídico" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Código de Recuperación de Contraseña | Ius Semper",
      html: emailHtml,
      text: `IUS SEMPER - DESPACHO JURÍDICO\n\nRecuperación de Contraseña\n\nHemos recibido una solicitud para restablecer su contraseña.\n\nSu código de verificación es: ${code}\n\nEste código expirará en 5 minutos.\n\nSi usted no solicitó este código, puede ignorar este mensaje. Su cuenta permanecerá segura.\n\n¿Necesita asistencia? Contáctenos en: iussemper.soporte@gmail.com\n\n© 2026 Ius Semper. Todos los derechos reservados.`,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "iussemperlogo",
        },
      ],
    });

    res.json({ message: "Código enviado" });
  } catch (error) {
    console.error("Error en sendResetCode:", error);
    res.status(500).json({ message: "Error al enviar código" });
  }
};

// Función para verificar código (recuperación de contraseña)
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = String(code).trim();

    const user = await User.findByEmailAndResetCode(
      normalizedEmail,
      normalizedCode,
    );
    if (!user) {
      return res
        .status(400)
        .json({ message: "Código inválido o usuario no encontrado" });
    }
    if (new Date(user.resetCodeExpires) < new Date()) {
      return res.status(400).json({ message: "El código ha expirado" });
    }
    res.json({ message: "Código válido" });
  } catch (error) {
    console.error("Error en verifyResetCode:", error);
    res.status(500).json({ message: "Error al verificar código" });
  }
};

// Función para resetear contraseña (recuperación de contraseña)
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = String(code).trim();

    const user = await User.findByEmailAndResetCode(
      normalizedEmail,
      normalizedCode,
    );
    if (!user) {
      return res
        .status(400)
        .json({ message: "Código inválido o usuario no encontrado" });
    }
    if (new Date(user.resetCodeExpires) < new Date()) {
      return res.status(400).json({ message: "El código ha expirado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualiza la contraseña y elimina el código de recuperación (usa el email de la BD)
    await User.updatePasswordAndClearReset(user.email, hashedPassword);

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ message: "Error al resetear contraseña" });
  }
};
