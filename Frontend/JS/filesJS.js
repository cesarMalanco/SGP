const API_URL = "http://localhost:3000/api/case-files";
let expedientesData = [];


document.addEventListener("DOMContentLoaded", () => {
    cargarExpedientes();
    configurarFiltros();
});


async function cargarExpedientes() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log(data);

        if (Array.isArray(data)) {
            expedientesData = data;
            renderizarExpedientes();
        } else {
            console.error(data);
        }

        renderizarExpedientes();

    } catch (error) {
        console.error(error);
        alert("Error al cargar expedientes");
    }
}


function renderizarExpedientes() {
    const container =document.getElementById("expedientesContainer");

    const contador =document.getElementById("expCountDisplay");

    const noResults =document.getElementById("noResultsMessage");


    // OBTENER FILTROS
    const numeroBusqueda =document.getElementById("searchNumero").value.toLowerCase();
    const nombreBusqueda =document.getElementById("searchNombre").value.toLowerCase();
    const tipoCliente =document.getElementById("filterTipoCliente").value;
    const juzgado =document.getElementById("filterJuzgado").value;

    const estatus =document.getElementById("filterEstatus").value;


    // FILTRAR
    const filtrados = expedientesData.filter(exp => {
        const matchNumero =!numeroBusqueda ||exp.case_number?.toLowerCase().includes(numeroBusqueda);
        const matchNombre = !nombreBusqueda || exp.actor?.toLowerCase().includes(nombreBusqueda) || exp.demandado?.toLowerCase().includes(nombreBusqueda);
        const matchTipo =!tipoCliente ||exp.client_type === tipoCliente;
        const matchJuzgado =!juzgado ||exp.court === juzgado;
        const matchEstatus =!estatus ||exp.status === estatus;
        return (
            matchNumero &&
            matchNombre &&
            matchTipo &&
            matchJuzgado &&
            matchEstatus
        );
    });


    container.innerHTML = "";
    contador.textContent = filtrados.length;

    // NO HAY RESULTADOS
    if (filtrados.length === 0) {
        noResults.classList.remove("d-none");
        return;
    }

    noResults.classList.add("d-none");

    // CREAR CARDS
    filtrados.forEach(exp => {
        const col = document.createElement("div");
        col.className = "col-md-6 col-xl-4";
        col.innerHTML = `
            <div class="expediente-card">
                <div class="exp-header">
                    <span class="exp-number">
                        ${exp.case_number || "Sin número"}
                    </span>
                    <div class="exp-status 
                        ${getStatusClass(exp.status)}">
                    </div>
                </div>

                <h4 class="exp-title">
                    ${exp.title || "Sin título"}
                </h4>

                <div class="exp-court">
                    <i class="fas fa-gavel"></i>
                    <span>
                        ${exp.court || "No especificado"}
                    </span>
                </div>

                <div class="exp-details">
                    <div class="exp-detail-item">
                        <span class="detail-label">
                            Tipo Cliente:
                        </span>
                        <span class="detail-value">
                            ${getTipoClienteTexto(exp.client_type)}
                        </span>
                    </div>

                    <div class="exp-detail-item">
                        <span class="detail-label">
                            Actor:
                        </span>
                        <span class="detail-value">
                            ${exp.actor || "No especificado"}
                        </span>
                    </div>

                    <div class="exp-detail-item">
                        <span class="detail-label">
                            Demandado:
                        </span>
                        <span class="detail-value">
                            ${exp.demandado || "No especificado"}
                        </span>
                    </div>

                    <div class="exp-detail-item">
                        <span class="detail-label">
                            Estatus:
                        </span>
                        <span class="detail-value 
                            ${getStatusTextClass(exp.status)}">
                            ${getEstatusTexto(exp.status)}
                        </span>
                    </div>
                </div>

                <button class="btn-view-exp"
                    onclick="verDetalle(${exp.case_file_id})">
                    <i class="fas fa-eye"></i>
                    Ver Detalle
                </button>
            </div>
        `;
        container.appendChild(col);
    });
}


// CONFIGURAR FILTROS
function configurarFiltros() {
    document.getElementById("searchNumero").addEventListener("input", renderizarExpedientes);
    document.getElementById("searchNombre").addEventListener("input", renderizarExpedientes);
    document.getElementById("filterTipoCliente").addEventListener("change", renderizarExpedientes);
    document.getElementById("filterJuzgado").addEventListener("change", renderizarExpedientes);
    document.getElementById("filterEstatus").addEventListener("change", renderizarExpedientes);
    document.getElementById("clearFiltersBtn").addEventListener("click", limpiarFiltros);
}

// LIMPIAR FILTROS
function limpiarFiltros() {
    document.getElementById("searchNumero").value = "";
    document.getElementById("searchNombre").value = "";
    document.getElementById("filterTipoCliente").value = "";
    document.getElementById("filterJuzgado").value = "";
    document.getElementById("filterEstatus").value = "";
    renderizarExpedientes();
}


function verDetalle(id) {
    window.location.href =`../PAGES/FILE-DETAIL.html?id=${id}`;
}


function getTipoClienteTexto(tipo) {
    const tipos = {
        particular: "Particular",
        empresa: "Empresa / Corporativo",
        gobierno: "Entidad Gubernamental",
        organismo: "Organismo Internacional"
    };
    return tipos[tipo] || "No especificado";
}


function getEstatusTexto(estatus) {
    const mapa = {
        activo: "Activo",
        en_proceso: "En Proceso",
        suspendido: "Suspendido",
        concluido: "Concluido",
        archivado: "Archivado"
    };
    return mapa[estatus] || estatus;
}


function getStatusClass(estatus) {
    const clases = {
        activo: "",
        en_proceso: "status-processing",
        suspendido: "status-suspended",
        concluido: "status-completed",
        archivado: "status-archived"
    };

    return clases[estatus] || "";
}


function getStatusTextClass(estatus) {
    const clases = {
        activo: "text-success",
        en_proceso: "text-warning",
        suspendido: "text-danger",
        concluido: "text-info",
        archivado: "text-secondary"
    };
    return clases[estatus] || "";
}