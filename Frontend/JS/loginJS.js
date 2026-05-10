// NOTAS!!!
// La mayoria de estas secciones no tienen conflictos o relacionamiento con el back, se basan en en frotend puro
// Por favor, preferentemente no borrar estas secciones a menos que sea estrictamente necesario
// Muchas de estas secciones son importantes para la experiencia de usuario (UX) y validaciones basicas
// La única sección que podría ser util es la de el botón de reenvíar código, esta comentada en el código :)

// ========================== SECCION DE LOGIN ========================================
document.addEventListener("DOMContentLoaded", function () {
  const togglePassword = document.getElementById("togglePassword");
  // Toggle de visibilidad de contraseña ---> No borrar
  const passwordIn = document.getElementById("password");

  if (togglePassword && passwordIn) {
    togglePassword.addEventListener("click", function () {
      const type =
        passwordIn.getAttribute("type") === "password" ? "text" : "password";
      passwordIn.setAttribute("type", type);

      // Cambia el icono
      const icon = this.querySelector("i");
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  }

  // Validaciones básicas de formulario principal ---> Preferentemente No borrar
  const loginForm = document.querySelector(".login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login-btn");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Validación básica
      let isValid = true;

      // Validar usuario o email
      const value = emailInput.value.trim();
      if (!value) {
        showError(emailInput, "Por favor ingrese su usuario o email");
        isValid = false;
      } else if (value.includes("@")) {
        // Si contiene @, validar como email
        if (!isValidEmail(value)) {
          showError(emailInput, "Por favor ingrese un email válido");
          isValid = false;
        } else {
          clearError(emailInput);
        }
      } else {
        // Si no contiene @, aceptar como usuario
        clearError(emailInput);
      }

      // Validar contraseña
      if (!passwordInput.value || passwordInput.value.length < 6) {
        showError(
          passwordInput,
          "La contraseña debe tener al menos 6 caracteres",
        );
        isValid = false;
      } else {
        clearError(passwordInput);
      }

      // Si es válido, enviar al backend
      if (isValid) {
        try {
          const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              identifier: emailInput.value.trim(),
              password: passwordInput.value,
            }),
          });

          if (response.ok) {
            const data = await response.json();

            // Guardar token según la opción "Recordar sesión"
            const rememberMe = document.getElementById("rememberMe");
            if (rememberMe && rememberMe.checked) {
              localStorage.setItem("token", data.token);
              localStorage.setItem("userName", data.name);
              localStorage.setItem("userUsername", data.username);
            } else {
              sessionStorage.setItem("token", data.token);
              sessionStorage.setItem("userName", data.name);
              sessionStorage.setItem("userUsername", data.username);
            }

            // Limpiar campos y redirigir a dashboard
            emailInput.value = "";
            passwordInput.value = "";
            window.location.href = "../PAGES/DASHBOARD.html";
          } else {
            const data = await response.json();
            // Mostrar error del backend si existe
            if (data && data.message) {
              // Si la cuenta está bloqueada, mostrar tiempo restante
              if (data.lockTime) {
                const minutes = Math.floor(data.lockTime / 60);
                const seconds = data.lockTime % 60;
                let timeMessage = "";
                if (minutes > 0) {
                  timeMessage = `${minutes} minuto(s) y ${seconds} segundo(s)`;
                } else {
                  timeMessage = `${seconds} segundo(s)`;
                }
                showError(
                  passwordInput,
                  `Cuenta bloqueada. Tiempo restante: ${timeMessage}`,
                );
              } else {
                showError(passwordInput, data.message);
              }
            } else {
              showError(passwordInput, "Credenciales incorrectas");
            }
            // Limpiar campo de contraseña al equivocarse
            passwordInput.value = "";
          }
        } catch (err) {
          showError(passwordInput, "Error de conexión. Intente más tarde.");
          // Limpiar campo de contraseña al error
          passwordInput.value = "";
        }
      }
    });
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Funciones para mostrar y limpiar errores ---> Preferentemente No borrar
  function showError(input, message) {
    const container = input.closest(".input-container");
    const errorDiv = document.createElement("div");
    errorDiv.className = "input-error";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
            color: var(--error);
            font-size: 12px;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
        `;

    // Remover error anterior si existe
    const existingError = container.querySelector(".input-error");
    if (existingError) {
      existingError.remove();
    }

    container.appendChild(errorDiv);
    container.classList.add("has-error");
  }

  // Función para limpiar errores ---> Preferentemente No borrar
  function clearError(input) {
    const container = input.closest(".input-container");
    const errorDiv = container.querySelector(".input-error");
    if (errorDiv) {
      errorDiv.remove();
    }

    // Remover clase de error
    container.classList.remove("has-error");
  }

  // Limpiar errores cuando el usuario comienza a escribir ---> Preferentemente No borrar
  [emailInput, passwordInput].forEach((input) => {
    if (input) {
      input.addEventListener("input", function () {
        const container = this.closest(".input-container");
        if (container && container.classList.contains("has-error")) {
          clearError(this);
        }
      });
    }
  });

  // Efectos de hover en inputs---> Preferentemente No borrar
  const inputContainers = document.querySelectorAll(".input-container");
  inputContainers.forEach((container) => {
    const input = container.querySelector("input");

    input.addEventListener("focus", function () {
      container.style.transform = "translateY(-2px)";
    });

    input.addEventListener("blur", function () {
      container.style.transform = "translateY(0)";
    });
  });
});

// ========================== SECCION DE RECUPERACIÓN DE CONTRASEÑA ========================================
document.addEventListener("DOMContentLoaded", function () {
  const forgotLink = document.querySelector(".forgot-password");
  const resetOverlay = document.getElementById("resetOverlay");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const strengthFill = document.getElementById("strength-fill");
  const strengthText = document.getElementById("strength-text");

  let timeLeft = 60;
  let countdownInterval = null;
  let resetEmail = sessionStorage.getItem("resetEmail") || "";
  let isSendingCode = false; // Flag para prevenir envíos dobles

  // Para animaciones de entrada
  if (forgotLink && resetOverlay) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      resetOverlay.classList.add("active");
      goToStep(1);
    });

    // Cerrar al hacer clic fuera del contenedor
    resetOverlay.addEventListener("click", function (e) {
      if (e.target === this) {
        this.classList.remove("active");
        resetForms();
      }
    });

    // Función para navegar entre pasos
    function goToStep(step) {
      // Ocultar todos los pasos
      document.querySelectorAll(".form-container").forEach((el) => {
        el.classList.remove("active");
      });

      // Mostrar el paso seleccionado
      const stepElement = document.querySelector(`.step-${step}`);
      if (stepElement) {
        stepElement.classList.add("active");
      }

      document.querySelectorAll(".progress-step").forEach((el) => {
        el.classList.remove("active");
        if (parseInt(el.dataset.step) <= step) {
          el.classList.add("active");
        }
      });

      // Inicializar contador en el paso 2
      if (step === 2) {
        startResendCounter();
      }

      // Inicializar validaciones en el paso 3
      if (step === 3) {
        initializePasswordValidation();
      }
    }

    // Validación de contraseñas
    function initializePasswordValidation() {
      if (newPasswordInput && confirmPasswordInput) {
        newPasswordInput.addEventListener("input", () => {
          checkPasswordStrength(newPasswordInput.value);
          validatePasswords();
        });

        confirmPasswordInput.addEventListener("input", () => {
          validatePasswords();
        });
      }
    }

    // Manejar envíos de formularios
    document.querySelectorAll(".reset-form").forEach((form) => {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const currentStep = parseInt(
          this.closest(".form-container").className.match(/step-(\d)/)[1],
        );

        // PASO 1: Enviar email para recibir código
        if (currentStep === 1) {
          // Prevenir envíos dobles
          if (isSendingCode) return;
          isSendingCode = true;

          const emailInput = document.getElementById("reset-email");
          const sendCodeBtn = document.getElementById("send-code-btn");
          const btnText = sendCodeBtn.querySelector(".btn-text");

          // Activar animación de carga
          sendCodeBtn.classList.add("loading");
          btnText.textContent = "ENVIANDO...";

          resetEmail = emailInput.value.trim();
          sessionStorage.setItem("resetEmail", resetEmail);

          try {
            const response = await fetch(
              "http://localhost:3000/api/auth/forgot-password",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resetEmail }),
              },
            );

            const data = await response.json();

            if (response.ok) {
              goToStep(2);
            } else {
              alert(data.message || "Error al enviar el código");
            }
          } catch (err) {
            alert("Error de conexión. Intente más tarde.");
          } finally {
            // Desactivar animación de carga
            sendCodeBtn.classList.remove("loading");
            btnText.textContent = "ENVIAR CÓDIGO";
            isSendingCode = false;
          }
          return;
        }

        // PASO 2: Verificar código
        if (currentStep === 2) {
          const codeInput = document.getElementById("verification-code");
          const code = codeInput.value.trim();

          // Recuperar email del sessionStorage por si se perdió
          if (!resetEmail) {
            resetEmail = sessionStorage.getItem("resetEmail") || "";
          }

          try {
            const response = await fetch(
              "http://localhost:3000/api/auth/verify-reset-code",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resetEmail, code }),
              },
            );

            const data = await response.json();

            if (response.ok) {
              goToStep(3);
            } else {
              alert(data.message || "Código inválido o expirado");
            }
          } catch (err) {
            alert("Error de conexión. Intente más tarde.");
          }
          return;
        }

        // PASO 3: Cambiar contraseña
        if (currentStep === 3) {
          if (!validatePasswords()) {
            showPasswordError("Las contraseñas no coinciden");
            return;
          }

          const passwordStrength = getPasswordStrength(newPasswordInput.value);
          if (passwordStrength < 50) {
            showPasswordError(
              "La contraseña es muy débil. Elija una más segura.",
            );
            return;
          }

          const codeInput = document.getElementById("verification-code");
          const code = codeInput.value.trim();

          try {
            const response = await fetch(
              "http://localhost:3000/api/auth/reset-password",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: resetEmail,
                  code,
                  newPassword: newPasswordInput.value,
                }),
              },
            );

            const data = await response.json();

            if (response.ok) {
              goToStep(4); // Paso de éxito
            } else {
              alert(data.message || "Error al cambiar la contraseña");
            }
          } catch (err) {
            alert("Error de conexión. Intente más tarde.");
          }
          return;
        }

        goToStep(currentStep + 1);
      });
    });
  }

  // LÓGICA DEL CONTADOR DE REENVÍO DE CÓDIGO
  const resendBtn = document.getElementById("resend-code");
  const counter = document.getElementById("countdown");
  const timerText = document.getElementById("timer-text");

  function startResendCounter() {
    clearInterval(countdownInterval);

    timeLeft = 60;
    resendBtn.disabled = true;
    resendBtn.classList.remove("enabled");

    counter.textContent = timeLeft;
    timerText.style.display = "inline";

    countdownInterval = setInterval(() => {
      timeLeft--;
      counter.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        resendBtn.disabled = false;
        resendBtn.classList.add("enabled");
        timerText.style.display = "none";
      }
    }, 1000);
  }

  // Click en reenviar
  resendBtn.addEventListener("click", async () => {
    // Bloquear botón mientras se envía
    resendBtn.disabled = true;
    resendBtn.classList.remove("enabled");
    const originalText = resendBtn.textContent;
    resendBtn.textContent = "Enviando...";

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        startResendCounter();
      } else {
        alert(data.message || "Error al reenviar el código");
        // Rehabilitar botón si hay error
        resendBtn.disabled = false;
        resendBtn.classList.add("enabled");
        resendBtn.textContent = originalText;
      }
    } catch (err) {
      alert("Error de conexión. Intente más tarde.");
      // Rehabilitar botón si hay error
      resendBtn.disabled = false;
      resendBtn.classList.add("enabled");
      resendBtn.textContent = originalText;
    }
  });

  // Botón OK para cerrar ventana de éxito
  const closeResetBtn = document.getElementById("close-reset-btn");
  if (closeResetBtn) {
    closeResetBtn.addEventListener("click", () => {
      resetOverlay.classList.remove("active");
      resetForms();
    });
  }

  // SEGURIDAD DE CONTRASEÑA
  function checkPasswordStrength(password) {
    let strength = 0;
    const messages = [];

    // Longitud
    if (password.length >= 8) {
      strength += 25;
    } else {
      messages.push("Mínimo 8 caracteres");
    }

    // Minúsculas
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      messages.push("Incluye minúsculas");
    }

    // Mayúsculas
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      messages.push("Incluye mayúsculas");
    }

    // Números
    if (/[0-9]/.test(password)) {
      strength += 25;
    } else {
      messages.push("Incluye números");
    }

    if (strengthFill) {
      strengthFill.style.width = `${strength}%`;

      if (strength <= 25) {
        strengthFill.style.background = "var(--error)";
        if (strengthText) strengthText.textContent = "Débil";
      } else if (strength <= 50) {
        strengthFill.style.background = "var(--warning)";
        if (strengthText) strengthText.textContent = "Regular";
      } else if (strength <= 75) {
        strengthFill.style.background = "#ff9800";
        if (strengthText) strengthText.textContent = "Buena";
      } else {
        strengthFill.style.background = "var(--success)";
        if (strengthText) strengthText.textContent = "Excelente";
      }
    }

    if (strengthText && messages.length > 0 && password.length > 0) {
      strengthText.textContent = messages.join(", ");
    }

    return strength;
  }

  // Función para obtener la fuerza de la contraseña
  function getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  }

  // Validación de contraseñas en el paso 3
  function validatePasswords() {
    if (!newPasswordInput || !confirmPasswordInput) return false;

    const password = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Solo validar si hay algo escrito
    if (confirmPassword.length === 0) {
      clearPasswordError();
      return false;
    }

    if (password !== confirmPassword) {
      showPasswordError("Las contraseñas no coinciden");
      return false;
    } else {
      clearPasswordError();
      return true;
    }
  }

  // Mostrar error de contraseña
  function showPasswordError(message) {
    if (confirmPasswordInput) {
      const container = confirmPasswordInput.closest(".input-group");
      if (container) {
        container.classList.add("has-error");

        const inputLine = confirmPasswordInput.nextElementSibling;
        if (inputLine && inputLine.classList.contains("input-line")) {
          inputLine.style.opacity = "0";
          inputLine.style.visibility = "hidden";
        }
        confirmPasswordInput.style.borderBottomColor = "var(--error)";

        // Crear mensaje de error
        let errorDiv = container.querySelector(".password-error");
        if (!errorDiv) {
          errorDiv = document.createElement("div");
          errorDiv.className = "password-error";
          container.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
                    color: var(--error);
                    font-size: 12px;
                    margin-top: 5px;
                    animation: fadeIn 0.3s ease;
                `;
      }
    }
  }

  // Limpiar error de contraseña
  function clearPasswordError() {
    if (confirmPasswordInput) {
      const container = confirmPasswordInput.closest(".input-group");
      if (container) {
        container.classList.remove("has-error");

        const inputLine = confirmPasswordInput.nextElementSibling;
        if (inputLine && inputLine.classList.contains("input-line")) {
          inputLine.style.opacity = "";
          inputLine.style.visibility = "";
          inputLine.style.background = "";
        }

        confirmPasswordInput.style.borderBottomColor = "";

        // Eliminar mensaje
        const errorDiv = container.querySelector(".password-error");
        if (errorDiv) {
          errorDiv.remove();
        }
      }
    }
  }

  // Resetear formularios al cerrar
  function resetForms() {
    resetEmail = "";
    sessionStorage.removeItem("resetEmail");
    const resetEmailInput = document.getElementById("reset-email");
    const verificationCode = document.getElementById("verification-code");
    if (resetEmailInput) resetEmailInput.value = "";
    if (verificationCode) verificationCode.value = "";
    if (newPasswordInput) newPasswordInput.value = "";
    if (confirmPasswordInput) confirmPasswordInput.value = "";
    if (strengthFill) strengthFill.style.width = "0%";
    if (strengthText) strengthText.textContent = "Seguridad de la contraseña";
    clearPasswordError();
  }

  // Observer para resetear formularios cuando se cierra el overlay completo
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        const target = mutation.target;
        // Solo resetear cuando el overlay completo se cierra, no al cambiar de paso
        if (
          target.id === "resetOverlay" &&
          !target.classList.contains("active")
        ) {
          resetForms();
        }
      }
    });
  });

  // Observar solo el overlay, no los form-containers individuales
  if (resetOverlay) {
    observer.observe(resetOverlay, { attributes: true });
  }
});
