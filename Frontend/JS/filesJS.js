
function obtenerExpedientesStorage() {

    const stored = localStorage.getItem('expedientesData');

    if (stored) {
        return JSON.parse(stored);
    }

    // Datos iniciales por defecto
    return [
        {
            id: 1,
            numero: "EXP-2024-001",
            tipoCliente: "particular",
            juzgado: "Juzgado Civil",
            titulo: "Divorcio Voluntario",
            actor: "María González",
            demandado: "Carlos González",
            fechaIngreso: "2024-01-15",
            estatus: "activo"
        },
        {
            id: 2,
            numero: "EXP-2024-002",
            tipoCliente: "empresa",
            juzgado: "Juzgado Penal",
            titulo: "Robo Agravado",
            actor: "Ministerio Público",
            demandado: "Luis Ramírez",
            fechaIngreso: "2024-02-10",
            estatus: "en_proceso"
        }
    ];
}
// ===== DATOS DE PRUEBA =====
let expedientesData = obtenerExpedientesStorage();


// ===== TEXTO Y CLASES =====
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

function getStatusClass(estatus) {
    const classes = {
        'activo': '',
        'en_proceso': 'status-processing',
        'suspendido': 'status-suspended',
        'concluido': 'status-completed',
        'archivado': 'status-archived'
    };
    return classes[estatus] || '';
}

function getStatusTextClass(estatus) {
    const classes = {
        'activo': 'text-success',
        'en_proceso': 'text-warning',
        'suspendido': 'text-danger',
        'concluido': 'text-info',
        'archivado': 'text-secondary'
    };
    return classes[estatus] || '';
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return 'No registrada';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES');
}

// ===== FUNCIÓN PRINCIPAL DE RENDERIZADO CON FILTROS =====
function renderizarExpedientes() {
    const container = document.getElementById('expedientesContainer');
    const countDisplay = document.getElementById('expCountDisplay');
    const noResults = document.getElementById('noResultsMessage');
    
    // Obtener valores de los filtros
    const searchNumero = document.getElementById('searchNumero')?.value.toLowerCase() || '';
    const searchNombre = document.getElementById('searchNombre')?.value.toLowerCase() || '';
    const filterTipoCliente = document.getElementById('filterTipoCliente')?.value || '';
    const filterJuzgado = document.getElementById('filterJuzgado')?.value || '';
    const filterEstatus = document.getElementById('filterEstatus')?.value || '';
    
    // Aplicar todos los filtros
    let filtered = expedientesData.filter(exp => {
        // por número de expediente
        const matchesNumero = searchNumero === '' || 
            exp.numero.toLowerCase().includes(searchNumero);
        
        // por nombres 
        const matchesNombre = searchNombre === '' || 
            exp.actor.toLowerCase().includes(searchNombre) ||
            exp.demandado.toLowerCase().includes(searchNombre);
        
        // por tipo de cliente
        const matchesTipoCliente = filterTipoCliente === '' || 
            exp.tipoCliente === filterTipoCliente;
        
        //  por juzgado
        const matchesJuzgado = filterJuzgado === '' || 
            exp.juzgado === filterJuzgado;
        
        //  por estatus
        const matchesEstatus = filterEstatus === '' || 
            exp.estatus === filterEstatus;
        
        return matchesNumero && matchesNombre && matchesTipoCliente && 
               matchesJuzgado && matchesEstatus;
    });
    
    // Actualizar contador
    if (countDisplay) countDisplay.textContent = filtered.length;
    
    // Limpiar container
    if (container) container.innerHTML = '';
    
    // Mostrar mensaje si no hay resultados
    if (filtered.length === 0) {
        if (noResults) noResults.classList.remove('d-none');
        return;
    }
    
    if (noResults) noResults.classList.add('d-none');
    
    // Mostrar badges de filtros activos
    mostrarFiltrosActivos();
    
    // Generar tarjetas de cada expediente
    filtered.forEach(exp => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-xl-4';
        col.innerHTML = `
            <div class="expediente-card" data-id="${exp.id}">
                <div class="exp-header">
                    <span class="exp-number">${exp.numero}</span>
                    <div class="exp-status ${getStatusClass(exp.estatus)}"></div>
                </div>
                <h4 class="exp-title">${escapeHtml(exp.titulo) || 'Sin título'}</h4>
                <div class="exp-court">
                    <i class="fas fa-gavel"></i>
                    <span>${escapeHtml(exp.juzgado)}</span>
                </div>
                <div class="exp-details">
                    <div class="exp-detail-item">
                        <span class="detail-label">Tipo Cliente:</span>
                        <span class="detail-value">${getTipoClienteTexto(exp.tipoCliente)}</span>
                    </div>
                    <div class="exp-detail-item">
                        <span class="detail-label">Actor:</span>
                        <span class="detail-value">${escapeHtml(exp.actor) || 'No especificado'}</span>
                    </div>
                    <div class="exp-detail-item">
                        <span class="detail-label">Demandado:</span>
                        <span class="detail-value">${escapeHtml(exp.demandado) || 'No especificado'}</span>
                    </div>
                    <div class="exp-detail-item">
                        <span class="detail-label">Estatus:</span>
                        <span class="detail-value ${getStatusTextClass(exp.estatus)}">${getEstatusTexto(exp.estatus)}</span>
                    </div>
                </div>
                <button class="btn-view-exp" onclick="window.location.href='../PAGES/FILE-DETAIL.html?id=${exp.id}'">
                    <i class="fas fa-eye"></i> Ver Detalle
                </button>
            </div>
        `;
        container.appendChild(col);
    });
}


function escapeHtml(text) {
    if (!text) return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== FUNCIÓN PARA MOSTRAR FILTROS ACTIVOS =====
function mostrarFiltrosActivos() {
    const filtrosActivos = [];
    
    const searchNumero = document.getElementById('searchNumero')?.value;
    const searchNombre = document.getElementById('searchNombre')?.value;
    const filterTipoCliente = document.getElementById('filterTipoCliente')?.value;
    const filterJuzgado = document.getElementById('filterJuzgado')?.value;
    const filterEstatus = document.getElementById('filterEstatus')?.value;
    
    if (searchNumero) filtrosActivos.push(`N°: ${searchNumero}`);
    if (searchNombre) filtrosActivos.push(`Nombre: ${searchNombre}`);
    if (filterTipoCliente) filtrosActivos.push(`Tipo: ${getTipoClienteTexto(filterTipoCliente)}`);
    if (filterJuzgado) filtrosActivos.push(`Juzgado: ${filterJuzgado}`);
    if (filterEstatus) filtrosActivos.push(`Estatus: ${getEstatusTexto(filterEstatus)}`);
    
    let badgeContainer = document.getElementById('activeFiltersBadge');
    if (!badgeContainer && filtrosActivos.length > 0) {
        const filtersSection = document.querySelector('.filters-section');
        if (filtersSection) {
            badgeContainer = document.createElement('div');
            badgeContainer.id = 'activeFiltersBadge';
            badgeContainer.className = 'active-filters-badge';
            filtersSection.after(badgeContainer);
        }
    }
    
    if (badgeContainer) {
        if (filtrosActivos.length > 0) {
            badgeContainer.innerHTML = `
                <i class="fas fa-filter"></i>
                <span>Filtros activos:</span>
                ${filtrosActivos.map(filtro => `
                    <span class="filter-tag">
                        ${escapeHtml(filtro)}
                        <i class="fas fa-times-circle" onclick="removerFiltro('${filtro.split(':')[0]}')"></i>
                    </span>
                `).join('')}
            `;
            badgeContainer.style.display = 'flex';
        } else {
            badgeContainer.style.display = 'none';
        }
    }
}


function limpiarFiltros() {
    const searchNumero = document.getElementById('searchNumero');
    const searchNombre = document.getElementById('searchNombre');
    const filterTipoCliente = document.getElementById('filterTipoCliente');
    const filterJuzgado = document.getElementById('filterJuzgado');
    const filterEstatus = document.getElementById('filterEstatus');
    
    if (searchNumero) searchNumero.value = '';
    if (searchNombre) searchNombre.value = '';
    if (filterTipoCliente) filterTipoCliente.value = '';
    if (filterJuzgado) filterJuzgado.value = '';
    if (filterEstatus) filterEstatus.value = '';
    
    renderizarExpedientes();
}

function removerFiltro(tipo) {
    switch(tipo) {
        case 'N°':
            const searchNumero = document.getElementById('searchNumero');
            if (searchNumero) searchNumero.value = '';
            break;
        case 'Nombre':
            const searchNombre = document.getElementById('searchNombre');
            if (searchNombre) searchNombre.value = '';
            break;
        case 'Tipo':
            const filterTipoCliente = document.getElementById('filterTipoCliente');
            if (filterTipoCliente) filterTipoCliente.value = '';
            break;
        case 'Juzgado':
            const filterJuzgado = document.getElementById('filterJuzgado');
            if (filterJuzgado) filterJuzgado.value = '';
            break;
        case 'Estatus':
            const filterEstatus = document.getElementById('filterEstatus');
            if (filterEstatus) filterEstatus.value = '';
            break;
    }
    renderizarExpedientes();
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Renderizar expedientes
    renderizarExpedientes();
    
    // FILTROS
    const searchNumero = document.getElementById('searchNumero');
    const searchNombre = document.getElementById('searchNombre');
    const filterTipoCliente = document.getElementById('filterTipoCliente');
    const filterJuzgado = document.getElementById('filterJuzgado');
    const filterEstatus = document.getElementById('filterEstatus');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    
    if (searchNumero) searchNumero.addEventListener('input', renderizarExpedientes);
    if (searchNombre) searchNombre.addEventListener('input', renderizarExpedientes);
    if (filterTipoCliente) filterTipoCliente.addEventListener('change', renderizarExpedientes);
    if (filterJuzgado) filterJuzgado.addEventListener('change', renderizarExpedientes);
    if (filterEstatus) filterEstatus.addEventListener('change', renderizarExpedientes);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', limpiarFiltros);
});

// ===== EXPONER FUNCIONES GLOBALMENTE =====
window.removerFiltro = removerFiltro;