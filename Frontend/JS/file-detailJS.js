
let currentExpediente = null;
let currentPagoId = null;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Obtener ID del expediente
    const urlParams = new URLSearchParams(window.location.search);
    const expedienteId = urlParams.get('id');
    
    if (!expedienteId) {
        alert('No se especificó el expediente');
        window.location.href = '../PAGES/FILES.html';
        return;
    }
    
    cargarExpediente(parseInt(expedienteId));
    
    // Configurar eventos
    const btnEditar = document.getElementById('btnEditarExpediente');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            window.location.href = `../PAGES/FILE-FORM.html?id=${expedienteId}`;
        });
    }
    
    const btnAgregarPago = document.getElementById('btnAgregarPago');
    if (btnAgregarPago) {
        btnAgregarPago.addEventListener('click', () => abrirModalPago());
    }
    
    const pagoForm = document.getElementById('pagoForm');
    if (pagoForm) {
        pagoForm.addEventListener('submit', guardarPago);
    }
});

// ===== OBTENER EXPEDIENTES DEL STORAGE =====
function obtenerExpedientesStorage() {
    const stored = localStorage.getItem('expedientesData');
    if (stored) {
        return JSON.parse(stored);
    }
    return [];
}

// ===== OBTENER PAGOS DEL STORAGE =====
function obtenerPagosStorage(expedienteId) {
    const stored = localStorage.getItem(`pagos_${expedienteId}`);

    if (stored) {
        return JSON.parse(stored);
    }

    return [];
}

// ===== GUARDAR PAGOS EN STORAGE =====
function guardarPagosStorage(expedienteId, pagos) {
    localStorage.setItem(`pagos_${expedienteId}`, JSON.stringify(pagos));
}

// ===== CARGAR EXPEDIENTE =====
function cargarExpediente(id) {
    const expedientes = obtenerExpedientesStorage();
    currentExpediente = expedientes.find(exp => exp.id === id);
    
    if (!currentExpediente) {
        alert('Expediente no encontrado');
        window.location.href = '../PAGES/FILES.html';
        return;
    }
    
    // Actualizar título
    document.getElementById('expNumeroTitle').textContent = `Expediente: ${currentExpediente.numero}`;
    
    // Cargar información en las tarjetas
    cargarInfoGeneral();
    cargarInfoPartes();
    cargarInfoFinanciera();
    cargarInfoLegal();
    
    // Cargar pagos
    cargarPagos();
}

// ===== CARGAR INFORMACIÓN GENERAL =====
function cargarInfoGeneral() {
    const container = document.getElementById('infoGeneral');
    container.innerHTML = `
        <div class="info-row">
            <span class="info-label">Número de Expediente:</span>
            <span class="info-value"><strong>${escapeHtml(currentExpediente.numero)}</strong></span>
        </div>
        <div class="info-row">
            <span class="info-label">Título / Asunto:</span>
            <span class="info-value">${escapeHtml(currentExpediente.titulo) || 'No especificado'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Fecha de Ingreso:</span>
            <span class="info-value">${formatearFecha(currentExpediente.fechaIngreso)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tipo de Cliente:</span>
            <span class="info-value">${getTipoClienteTexto(currentExpediente.tipoCliente)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Estatus:</span>
            <span class="info-value">
                <span class="status-badge status-${currentExpediente.estatus}">${getEstatusTexto(currentExpediente.estatus)}</span>
            </span>
        </div>
    `;
}

// ===== CARGAR PARTES INVOLUCRADAS =====
function cargarInfoPartes() {
    const container = document.getElementById('infoPartes');
    container.innerHTML = `
        <div class="info-row">
            <span class="info-label">Juzgado:</span>
            <span class="info-value">${escapeHtml(currentExpediente.juzgado)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Parte Actora:</span>
            <span class="info-value">${escapeHtml(currentExpediente.actor) || 'No especificado'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Parte Demandada:</span>
            <span class="info-value">${escapeHtml(currentExpediente.demandado) || 'No especificado'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Licenciado Asignado:</span>
            <span class="info-value">${escapeHtml(currentExpediente.licenciado) || 'No asignado'}</span>
        </div>
    `;
}

// ===== CARGAR INFORMACIÓN FINANCIERA =====
function cargarInfoFinanciera() {
    const totalCobro = currentExpediente.totalCobro || 0;
    const restante = currentExpediente.restante || totalCobro;
    const pagado = totalCobro - restante;
    
    const container = document.getElementById('infoFinanciera');
    container.innerHTML = `
        <div class="info-row">
            <span class="info-label">Total de Cobro:</span>
            <span class="info-value">$${totalCobro.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Monto Pagado:</span>
            <span class="info-value text-success">$${pagado.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Saldo Restante:</span>
            <span class="info-value text-warning">$${restante.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
        </div>
    `;
}

// ===== CARGAR INFORMACIÓN LEGAL =====
function cargarInfoLegal() {
    const container = document.getElementById('infoLegal');
    container.innerHTML = `
        <div class="info-row">
            <span class="info-label">Tipo de Juicio:</span>
            <span class="info-value">${getTipoJuicioTexto(currentExpediente.tipoJuicio)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Área del Dictamen:</span>
            <span class="info-value">${getAreaDictamenTexto(currentExpediente.areaDictamen)}</span>
        </div>
    `;
}

// ===== FUNCIONES AUXILIARES DE TEXTO =====
function getTipoClienteTexto(tipo) {
    const tipos = {
        'particular': 'Particular',
        'empresa': 'Empresa / Corporativo',
        'gobierno': 'Entidad Gubernamental',
        'organismo': 'Organismo Internacional'
    };
    return tipos[tipo] || 'No especificado';
}

function getEstatusTexto(estatus) {
    const estatusMap = {
        'activo': 'Activo',
        'en_proceso': 'En Proceso',
        'suspendido': 'Suspendido',
        'concluido': 'Concluido',
        'archivado': 'Archivado'
    };
    return estatusMap[estatus] || estatus;
}

function getTipoJuicioTexto(tipo) {
    const tipos = {
        'civil': 'Civil',
        'penal': 'Penal',
        'laboral': 'Laboral',
        'familiar': 'Familiar',
        'mercantil': 'Mercantil',
        'administrativo': 'Administrativo'
    };
    return tipos[tipo] || 'No especificado';
}

function getAreaDictamenTexto(area) {
    const areas = {
        'pericial_contable': 'Pericial Contable',
        'pericial_documental': 'Pericial Documental',
        'pericial_ingenieria': 'Pericial Ingeniería',
        'pericial_medicina': 'Pericial Medicina',
        'pericial_informatica': 'Pericial Informática',
        'pericial_valuacion': 'Pericial Valuación'
    };
    return areas[area] || 'No especificado';
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return 'No registrada';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES');
}

function escapeHtml(text) {
    if (!text) return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== FUNCIONES PARA PAGOS =====
function cargarPagos() {
    const pagos = obtenerPagosStorage(currentExpediente.id);
    const container = document.getElementById('pagosContainer');
    const footer = document.getElementById('pagosFooter');
    const resumen = document.getElementById('pagosResumen');
    
    if (!container) return;
    
    if (pagos.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-5">
                    <i class="fas fa-coins fa-3x mb-3 d-block" style="color: var(--purple-mist);"></i>
                    <p>No hay pagos registrados</p>
                    <small>Haga clic en "Agregar Pago" para registrar el primero</small>
                </td>
            </tr>
        `;
        if (footer) footer.innerHTML = '';
        if (resumen) resumen.innerHTML = '';
        return;
    }
    
    let totalPagado = 0;
    container.innerHTML = pagos.map(pago => {
        totalPagado += pago.monto;
        return `
            <tr>
                <td>${formatearFecha(pago.fecha)}</td>
                <td><strong>${escapeHtml(pago.concepto)}</strong></td>
                <td class="monto-pagado fw-bold">$${pago.monto.toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                <td><span class="pago-badge pago-${(pago.formaPago || 'efectivo').toLowerCase()}">${pago.formaPago || 'Efectivo'}</span></td>
                <td>${escapeHtml(pago.responsable) || '-'}</td>
                <td>${escapeHtml(pago.factura) || '-'}</td>
                <td>
                    <button class="btn-edit-pago" onclick="editarPago(${pago.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete-pago" onclick="confirmarEliminarPago(${pago.id})" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Actualizar footer
    if (footer) {
        footer.innerHTML = `
            <tr>
                <td colspan="2"><strong>Total Pagado</strong></td>
                <td class="monto-pagado fw-bold">$${totalPagado.toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                <td colspan="4"></td>
            </tr>
        `;
    }
    
    // Actualizar resumen
    const totalCobro = currentExpediente.totalCobro || 0;
    const restante = Math.max(totalCobro - totalPagado, 0);
    
    if (resumen) {
        resumen.innerHTML = `
            <div class="resumen-card">
                <p>Total: <strong>$${totalCobro.toLocaleString('es-MX', {minimumFractionDigits: 2})}</strong></p>
                <p>Pagado: <strong class="text-success">$${totalPagado.toLocaleString('es-MX', {minimumFractionDigits: 2})}</strong></p>
                <h4>Saldo pendiente: $${restante.toLocaleString('es-MX', {minimumFractionDigits: 2})}</h4>
            </div>
        `;
    }
    
    // Actualizar restante
    currentExpediente.restante = restante;
    actualizarRestanteEnStorage();
    cargarInfoFinanciera();
}

function actualizarRestanteEnStorage() {
    const expedientes = obtenerExpedientesStorage();
    const index = expedientes.findIndex(exp => exp.id === currentExpediente.id);
    if (index !== -1) {
        expedientes[index].restante = currentExpediente.restante;
        localStorage.setItem('expedientesData', JSON.stringify(expedientes));
    }
}

function abrirModalPago(id = null) {
    const modal = new bootstrap.Modal(document.getElementById('pagoModal'));
    const form = document.getElementById('pagoForm');
    const title = document.getElementById('pagoModalTitle');
    
    form.reset();
    document.getElementById('pagoId').value = '';
    document.getElementById('pagoFecha').value = new Date().toISOString().split('T')[0];
    
    if (id) {
        const pagos = obtenerPagosStorage(currentExpediente.id);
        const pago = pagos.find(p => p.id === id);
        if (pago) {
            title.innerHTML = '<i class="fas fa-edit me-2"></i> Editar Pago';
            document.getElementById('pagoId').value = pago.id;
            document.getElementById('pagoFecha').value = pago.fecha;
            document.getElementById('pagoMonto').value = pago.monto;
            document.getElementById('pagoConcepto').value = pago.concepto;
            document.getElementById('pagoForma').value = pago.formaPago || 'Efectivo';
            document.getElementById('pagoResponsable').value = pago.responsable || '';
            document.getElementById('pagoReferencia').value = pago.referencia || '';
            document.getElementById('pagoFactura').value = pago.factura || '';
            document.getElementById('pagoObservaciones').value = pago.observaciones || '';
            currentPagoId = id;
        }
    } else {
        title.innerHTML = '<i class="fas fa-plus-circle me-2"></i> Agregar Pago';
        document.getElementById('pagoForma').value = 'Efectivo';
        currentPagoId = null;
    }
    
    modal.show();
}


function guardarPago(event) {
    event.preventDefault();

    const id = document.getElementById('pagoId').value;
    const fecha = document.getElementById('pagoFecha').value;
    const monto = parseFloat(document.getElementById('pagoMonto').value);
    const concepto = document.getElementById('pagoConcepto').value;
    const formaPago = document.getElementById('pagoForma').value;
    const responsable = document.getElementById('pagoResponsable').value;
    const referencia = document.getElementById('pagoReferencia').value;
    const factura = document.getElementById('pagoFactura').value;
    const observaciones = document.getElementById('pagoObservaciones').value;

    if (!fecha || isNaN(monto) || monto <= 0 || !concepto) {
        alert('Por favor complete los campos obligatorios: Fecha, Monto y Concepto');
        return;
    }

    let pagos = obtenerPagosStorage(currentExpediente.id);

    if (id && id !== '') {
        // Editar
        const index = pagos.findIndex(p => p.id == id);
        if (index !== -1) {
            pagos[index] = {
                ...pagos[index],
                fecha, monto, concepto, formaPago, responsable, referencia, factura, observaciones
            };
        }
    } else {
        // Nuevo pago
        const newId = pagos.length > 0 ? Math.max(...pagos.map(p => p.id)) + 1 : 1;
        pagos.push({
            id: newId, fecha, monto, concepto, formaPago, responsable, referencia, factura, observaciones
        });
    }

    guardarPagosStorage(currentExpediente.id, pagos);
    
    bootstrap.Modal.getInstance(document.getElementById('pagoModal')).hide();
    cargarPagos();
}


function confirmarEliminarPago(id) {
    const confirmar = confirm('¿Está seguro de eliminar este pago?');

    if (confirmar) {
        let pagos = obtenerPagosStorage(currentExpediente.id);

        pagos = pagos.filter(p => p.id !== id);

        guardarPagosStorage(currentExpediente.id, pagos);

        cargarPagos();
    }
}

function eliminarPagoConfirmado() {
    if (currentDeleteId) {
        let pagos = obtenerPagosStorage(currentExpediente.id);
        pagos = pagos.filter(p => p.id !== currentDeleteId);
        guardarPagosStorage(currentExpediente.id, pagos);
        
        bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
        cargarPagos();
        currentDeleteId = null;
    }
}

function editarPago(id) {
    abrirModalPago(id);
}


window.editarPago = editarPago;
window.confirmarEliminarPago = confirmarEliminarPago;
window.confirmarCierreSesion = confirmarCierreSesion;