let currentExpediente = null;
let expedienteId = null;
let pagoEditandoId = null;

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

// ========== FUNCIONES DE AUTENTICACIÓN ==========
function getToken() {
    let token = localStorage.getItem("token");
    if (!token) {
        token = sessionStorage.getItem("token");
    }
    return token;
}

function isAuthenticated() {
    const token = getToken();
    if (!token) {
        window.location.href = "../PAGES/LOGIN.html";
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userUsername");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userUsername");
    window.location.href = "../PAGES/LOGIN.html";
}

// ========== FUNCIÓN PARA RECARGAR EXPEDIENTE ==========
async function recargarExpedienteCompleto() {
    try {
        const response = await fetch(`http://localhost:3000/api/case-files/${expedienteId}`, {
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });
        
        if (response.status === 401) {
            alert("Sesión expirada. Por favor, inicie sesión nuevamente.");
            logout();
            return;
        }
        
        const data = await response.json();
        currentExpediente = data;
        document.getElementById("expNumeroTitle").textContent = `Expediente: ${currentExpediente.case_number}`;
        cargarInfoGeneral();
        cargarInfoPartes();
        cargarInfoFinanciera();
        cargarInfoLegal();
        await cargarPagos();
        actualizarResumenFinanciero(); // Actualizar resumen
    } catch (error) {
        console.error("Error al recargar expediente:", error);
    }
}

// ========== ACTUALIZAR RESUMEN FINANCIERO ==========
function actualizarResumenFinanciero() {
    const resumenContainer = document.getElementById("pagosResumen");
    if (!resumenContainer) return;
    
    const total = parseFloat(currentExpediente.total_fee) || 0;
    const restante = currentExpediente.remaining_balance !== null && currentExpediente.remaining_balance !== undefined ? parseFloat(currentExpediente.remaining_balance) : total;
    const pagado = total - restante;
    
    resumenContainer.innerHTML = `
        <div class="resumen-card">
            <p>Total del Caso: <strong>$${total.toLocaleString("es-MX")}</strong></p>
            <p>Total Pagado: <strong class="text-success">$${pagado.toLocaleString("es-MX")}</strong></p>
            <p>Saldo Pendiente: <strong class="text-warning">$${restante.toLocaleString("es-MX")}</strong></p>
            <hr style="margin: 10px 0; border-color: rgba(126, 87, 181, 0.2);">
            <p style="font-size: 0.85rem;">Última actualización: ${new Date().toLocaleString("es-MX")}</p>
        </div>
    `;
}

// ========== CARGAR PAGOS CON BOTONES DE EDITAR Y ELIMINAR ==========
async function cargarPagos() {
    try {
        const token = getToken();
        
        if (!token) {
            return;
        }

        const res = await fetch(`http://localhost:3000/api/payments/case/${expedienteId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            alert("Sesión expirada. Por favor, inicie sesión nuevamente.");
            logout();
            return;
        }

        const data = await res.json();

        if (!res.ok) {
            console.error("Error API:", data);
            return;
        }

        const container = document.getElementById("pagosContainer");
        const footer = document.getElementById("pagosFooter");
        
        if (!container) {
            console.error("No se encontró el contenedor pagosContainer");
            return;
        }
        
        container.innerHTML = "";

        if (data.length === 0) {
            container.innerHTML = `<tr><td colspan="7" class="text-center">No hay pagos registrados</td></tr>`;
            if (footer) footer.innerHTML = "";
            actualizarResumenFinanciero();
            return;
        }

        let totalPagado = 0;

        data.forEach(p => {
            const fechaFormateada = p.date ? new Date(p.date).toLocaleDateString("es-MX") : "Sin fecha";
            const monto = parseFloat(p.amount);
            totalPagado += monto;
            
            // Determinar clase para el método de pago
            let metodoClass = "pago-badge ";
            switch(p.payment_method?.toLowerCase()) {
                case "efectivo": metodoClass += "pago-efectivo"; break;
                case "transferencia": metodoClass += "pago-transferencia"; break;
                case "tarjeta": metodoClass += "pago-tarjeta"; break;
                case "cheque": metodoClass += "pago-cheque"; break;
                case "depósito": metodoClass += "pago-deposito"; break;
                default: metodoClass += "";
            }
            
            container.innerHTML += `
                <tr>
                    <td>${fechaFormateada}</td>
                    <td><strong>${p.concept || "-"}</strong></td>
                    <td class="monto-pagado">$${monto.toLocaleString("es-MX")}</td>
                    <td><span class="${metodoClass}">${p.payment_method || "-"}</span></td>
                    <td>${p.paid_by || "-"}</td>
                    <td>${p.receipt_no || "-"}</td>
                    <td>
                        <button class="btn-edit-pago" onclick="abrirModalEditarPago(${p.payment_id})" title="Editar pago">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete-pago" onclick="eliminarPago(${p.payment_id})" title="Eliminar pago">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        // Actualizar footer de la tabla
        if (footer) {
            const totalGeneral = parseFloat(currentExpediente.total_fee) || 0;
            const restante = totalGeneral - totalPagado;
            footer.innerHTML = `
                <tr>
                    <td colspan="2"><strong>TOTALES</strong></td>
                    <td><strong>$${totalPagado.toLocaleString("es-MX")}</strong></td>
                    <td colspan="2"></td>
                    <td><strong>Saldo: $${restante.toLocaleString("es-MX")}</strong></td>
                    <td></td>
                </tr>
            `;
        }
        
        // Actualizar el resumen
        actualizarResumenFinanciero();

    } catch (error) {
        console.error("Error en cargarPagos:", error);
    }
}

// ========== ABRIR MODAL PARA EDITAR PAGO ==========
async function abrirModalEditarPago(paymentId) {
    try {
        const token = getToken();
        const response = await fetch(`http://localhost:3000/api/payments/case/${expedienteId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const pagos = await response.json();
        const pago = pagos.find(p => p.payment_id === paymentId);
        
        if (!pago) {
            alert("No se encontró el pago");
            return;
        }
        
        pagoEditandoId = paymentId;
        
        document.getElementById("pagoFecha").value = pago.date ? pago.date.split('T')[0] : '';
        document.getElementById("pagoConcepto").value = pago.concept || '';
        document.getElementById("pagoMonto").value = pago.amount || '';
        document.getElementById("pagoForma").value = pago.payment_method || 'Efectivo';
        document.getElementById("pagoResponsable").value = pago.paid_by || '';
        document.getElementById("pagoFactura").value = pago.receipt_no || '';
        
        const modalTitle = document.querySelector("#pagoModal .modal-title");
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i> Editar Pago';
        }
        
        const submitBtn = document.querySelector("#pagoForm button[type='submit']");
        if (submitBtn) {
            submitBtn.textContent = "Actualizar Pago";
            submitBtn.classList.add("btn-save-pago");
        }
        
        const modal = new bootstrap.Modal(document.getElementById("pagoModal"));
        modal.show();
        
    } catch (error) {
        console.error("Error al cargar pago para editar:", error);
        alert("Error al cargar los datos del pago");
    }
}

// ========== FUNCIÓN PARA EDITAR PAGO ==========
async function editarPago(paymentId, data) {
    try {
        const token = getToken();
        const response = await fetch(`http://localhost:3000/api/payments/${paymentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.status === 401) {
            alert("Sesión expirada. Por favor, inicie sesión nuevamente.");
            logout();
            return false;
        }
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Error al actualizar pago");
        }
        
        return true;
        
    } catch (error) {
        console.error("Error al editar pago:", error);
        throw error;
    }
}

// ========== FUNCIÓN PARA ELIMINAR PAGO ==========
async function eliminarPago(id) {
    const result = await Swal.fire({
    title: "¿Eliminar pago?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#7C3AED",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
});

if (!result.isConfirmed) return;

    try {
        const response = await fetch(`http://localhost:3000/api/payments/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        if (response.status === 401) {
            Toast.fire({
                icon: "error",
                title: "Sesión expirada. Por favor, inicie sesión nuevamente."
            });
            logout();
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Error al eliminar pago");
        }

        await recargarExpedienteCompleto();
        Toast.fire({
            icon: "success",
            title: "Pago eliminado correctamente"
        });
        
    } catch (error) {
        console.error("Error al eliminar pago:", error);
        Toast.fire({
            icon: "error",
            title: "Error al eliminar pago: " + error.message
        });
    }
}

// ========== RESETEAR MODAL A ESTADO DE CREACIÓN ==========
function resetearModalACreacion() {
    pagoEditandoId = null;
    const modalTitle = document.querySelector("#pagoModal .modal-title");
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-plus-circle me-2"></i> Agregar Pago';
    }
    const submitBtn = document.querySelector("#pagoForm button[type='submit']");
    if (submitBtn) {
        submitBtn.textContent = "Guardar Pago";
    }
    document.getElementById("pagoForm").reset();
}

// ========== CONFIGURACIÓN INICIAL ==========
document.addEventListener("DOMContentLoaded", () => {
    if (!isAuthenticated()) return;
    
    const urlParams = new URLSearchParams(window.location.search); 
    expedienteId = urlParams.get("id");
    
    if (!expedienteId) {
        console.error("No se proporcionó ID de expediente");
        alert("Error: No se especificó el expediente");
        return;
    }
    
    const btnEliminar = document.getElementById("btnEliminarExpediente");
    const btnAgregarPago = document.getElementById("btnAgregarPago");
    const btnEditar = document.getElementById("btnEditarExpediente");

    const logoutBtn = document.querySelector(".logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    fetch(`http://localhost:3000/api/case-files/${expedienteId}`, {
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
    }).then(response => {
        if (response.status === 401) {
            Toast.fire({
                icon: "error",
                title: "Sesión expirada. Por favor, inicie sesión nuevamente."
            });
            logout();
            return;
        }
        return response.json();
    }).then(data => {
        if (data) {
            currentExpediente = data;
            document.getElementById("expNumeroTitle").textContent = `Expediente: ${currentExpediente.case_number}`;
            cargarInfoGeneral();
            cargarInfoPartes();
            cargarInfoFinanciera();
            cargarInfoLegal();
            cargarPagos();
        }
    }).catch(error => {
        console.error(error);
    });

    document.getElementById("pagoForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            date: document.getElementById("pagoFecha").value,
            concept: document.getElementById("pagoConcepto").value,
            amount: parseFloat(document.getElementById("pagoMonto").value),
            payment_method: document.getElementById("pagoForma").value,
            paid_by: document.getElementById("pagoResponsable").value,
            receipt_no: document.getElementById("pagoFactura").value
        };

        if (!data.date || !data.concept || !data.amount || !data.payment_method || !data.paid_by) {
            Swal.fire({
                icon: "warning",
                title: "Campos incompletos",
                text: "Por favor, completa todos los campos requeridos antes de continuar.",
                confirmButtonColor: "#7C3AED"
            });
            return;
        }

        if (data.amount <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Monto inválido",
                text: "El monto debe ser mayor a 0",
                confirmButtonColor: "#7C3AED"
            });
            return;
        }

        try {
            let success = false;
            
            if (pagoEditandoId) {
                await editarPago(pagoEditandoId, data);
                success = true;
            } else {
                data.case_file_id = expedienteId;
                const response = await fetch("http://localhost:3000/api/payments", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.status === 401) {
                    alert("Sesión expirada. Por favor, inicie sesión nuevamente.");
                    logout();
                    return;
                }
                
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                success = true;
            }
            
            if (success) {
                bootstrap.Modal.getInstance(document.getElementById("pagoModal")).hide();
                await recargarExpedienteCompleto();
                Toast.fire({
                    icon: "success",
                    title: pagoEditandoId ? "Pago actualizado correctamente" : "Pago agregado correctamente"
                });
                resetearModalACreacion();
            }
            
        } catch (error) {
            console.error("Error al guardar pago:", error);
            Toast.fire({
                icon: "error",
                title: "Error al guardar pago: " + error.message
            });
        }
    });

    if (btnEditar) {
        btnEditar.addEventListener("click", () => {
            window.location.href = `../PAGES/FILE-FORM.html?id=${expedienteId}`;
        });
    }

    if (btnEliminar) {
        btnEliminar.addEventListener("click", eliminarExpediente);
    }

    if (btnAgregarPago) {
        btnAgregarPago.addEventListener("click", () => {
            resetearModalACreacion();
            const modal = new bootstrap.Modal(document.getElementById("pagoModal"));
            modal.show();
        });
    }
});

// ========== FUNCIONES EXISTENTES ==========
function cargarInfoGeneral() {
    const container = document.getElementById("infoGeneral");
    container.innerHTML = `
        <div class="info-row">
            <span class="info-label">Número de expediente:</span>
            <span class="info-value">${currentExpediente.case_number || "N/A"}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Número interno:</span>
            <span class="info-value">${currentExpediente.internal_number || "N/A"}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Título:</span>
            <span class="info-value">${currentExpediente.title || "N/A"}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Juzgado:</span>
            <span class="info-value">${currentExpediente.court || "N/A"}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Fecha:</span>
            <span class="info-value">${formatearFecha(currentExpediente.entry_date)}</span>
        </div>
    `;
}

function formatearFecha(fecha) {
    if (!fecha) return "No especificada";
    const nuevaFecha = new Date(fecha);
    return nuevaFecha.toLocaleDateString("es-MX");
}

function cargarInfoPartes() {
    const container = document.getElementById("infoPartes");
    container.innerHTML = `
        <div class="info-row">
            <span class="info-label">Actor:</span>
            <span class="info-value">${currentExpediente.actor || "No especificado"}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Demandado:</span>
            <span class="info-value">${currentExpediente.demandado || "No especificado"}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Licenciado parte actora:</span>
            <span class="info-value">${currentExpediente.lic_actor || "No asignado"}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Licenciado parte demandada:</span>
            <span class="info-value">${currentExpediente.lic_demandado || "No asignado"}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Perito:</span>
            <span class="info-value">${currentExpediente.expert_role || "No especificado"}</span>
        </div>
    `;
}

function cargarInfoFinanciera() {
    const container = document.getElementById("infoFinanciera");
    const total = parseFloat(currentExpediente.total_fee) || 0;
    const restante = currentExpediente.remaining_balance !== null && currentExpediente.remaining_balance !== undefined ? parseFloat(currentExpediente.remaining_balance) : total;
    const pagado = total - restante;

    container.innerHTML = `
        <div class="info-row">
            <span class="info-label">Total del Caso:</span>
            <span class="info-value">$${total.toLocaleString("es-MX")}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Monto Pagado:</span>
            <span class="info-value" style="color: #22C55E; font-weight: 700;">$${pagado.toLocaleString("es-MX")}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Saldo Pendiente:</span>
            <span class="info-value" style="color: #EF4444; font-weight: 700;">$${restante.toLocaleString("es-MX")}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Porcentaje:</span>
            <span class="info-value">
                <div class="progress" style="height: 8px; border-radius: 10px; margin-top: 5px;">
                    <div class="progress-bar" style="width: ${total > 0 ? (pagado / total) * 100 : 0}%; background: linear-gradient(90deg, var(--purple-soft), var(--purple-rich)); border-radius: 10px;"></div>
                </div>
                <small>${total > 0 ? Math.round((pagado / total) * 100) : 0}% pagado</small>
            </span>
        </div>
    `;
}

function cargarInfoLegal() {
    const container = document.getElementById("infoLegal");

    function getAreaTexto(area) {
        return area || "No especificado";
    }
    
    container.innerHTML = `
        <div class="info-row">
            <span class="info-label">Tipo de Juicio:</span>
            <span class="info-value">
                ${currentExpediente.trial_type || "No especificado"}
            </span>
        </div>

        <div class="info-row">
            <span class="info-label">Área:</span>
            <span class="info-value">
                ${getAreaTexto(currentExpediente.ruling_area) || "No especificado"}
            </span>
        </div>

        <div class="info-row">
            <span class="info-label">Estatus:</span>
            <span class="info-value">
                <span class="status-badge status-${currentExpediente.status || 'activo'}">
                    ${getEstatusTexto(currentExpediente.status)}
                </span>
            </span>
        </div>
    `;
}

function getEstatusTexto(estatus) {
    const estatusMap = {
        activo: "Activo",
        en_proceso: "En Proceso",
        suspendido: "Suspendido",
        concluido: "Concluido",
        archivado: "Archivado"
    };
    return estatusMap[estatus] || estatus;
}

function getAreaTexto(area) {
    return area || "No especificado";
}

async function eliminarExpediente() {
    const confirmar = await Swal.fire({
        title: "¿Eliminar expediente?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7C3AED",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });

    if (!confirmar.isConfirmed) return;

    try {
        const response = await fetch(`http://localhost:3000/api/case-files/${expedienteId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${getToken()}` }
        });

        if (response.status === 401) {
            alert("Sesión expirada. Por favor, inicie sesión nuevamente.");
            logout();
            return;
        }

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Error");
        }

        Toast.fire({
            icon: "success",
            title: "Expediente eliminado correctamente"
        });
        window.location.href = "../PAGES/FILES.html";

    } catch (error) {
        console.error(error);
        Toast.fire({
            icon: "error",
            title: "Error al eliminar expediente"
        });
    }
}