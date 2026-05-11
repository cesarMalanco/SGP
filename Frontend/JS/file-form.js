const API_URL = "http://localhost:3000/api/case-files";
let expedienteId = null;

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("expedienteForm");
    form.addEventListener("submit", guardarExpediente);
    verificarModoEdicion();
});

function verificarModoEdicion() {
    const params = new URLSearchParams(window.location.search);
    expedienteId = params.get("id");

    if (expedienteId) {
        cargarExpediente(expedienteId);
        document.getElementById("formTitle").textContent = "Editar Expediente";
    }
}

async function guardarExpediente(event) {
    event.preventDefault();

    // OBTENER DATOS DEL FORMULARIO
    const expediente = {
        case_number: document.getElementById("expNumero").value,
        internal_number: document.getElementById("expInternalNumber").value,
        court: document.getElementById("expJuzgado").value,
        title: document.getElementById("expTitulo").value,
        trial_type: document.getElementById("expTipoJuicio").value,
        ruling_area: document.getElementById("expAreaDictamen").value,
        status: document.getElementById("expEstatus").value,
        actor: document.getElementById("expActor").value,
        demandado: document.getElementById("expDemandado").value,
        lic_actor: document.getElementById("expLicActor").value,
        lic_demandado: document.getElementById("expLicDemandado").value,
        total_fee: parseFloat(document.getElementById("expTotalCobro").value) || 0,
        entry_date: document.getElementById("expFechaIngreso").value,
        client_type: document.getElementById("expTipoCliente").value,
        expert_role: document.getElementById("expExpertRole").value
    };

    // VALIDACIÓN 
    if (!expediente.case_number || !expediente.court) {
        alert("Complete los campos obligatorios");
        return;
    }

    try {
        // REVISAR SI ES EDICIÓN
        let response;

        // EDITAR
        if (expedienteId) {
            response = await fetch(`${API_URL}/${expedienteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expediente)
            });
        } else {
            // CREAR
            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expediente)
            });
        }

        // RESPUESTA
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            throw new Error(data.error || "Error");
        }

        alert("Expediente guardado correctamente");
        // Redirigir
        window.location.href = "../PAGES/FILES.html";
    } catch (error) {
        console.error(error);
        alert("Error al guardar expediente");
    }
}


// CARGAR EXPEDIENTE PARA EDICIÓN
async function cargarExpediente(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const expediente = await response.json();
        console.log(expediente);

        // LLENAR FORMULARIO
        document.getElementById("expNumero").value = expediente.case_number || "";
        document.getElementById("expInternalNumber").value = expediente.internal_number || "";
        document.getElementById("expJuzgado").value = expediente.court || "";
        document.getElementById("expTitulo").value = expediente.title || "";
        document.getElementById("expTipoJuicio").value = expediente.trial_type || "";
        document.getElementById("expAreaDictamen").value = expediente.ruling_area || "";
        document.getElementById("expEstatus").value = expediente.status || "";
        document.getElementById("expActor").value = expediente.actor || "";
        document.getElementById("expDemandado").value = expediente.demandado || "";
        document.getElementById("expLicActor").value = expediente.lic_actor || "";
        document.getElementById("expLicDemandado").value = expediente.lic_demandado || "";
        document.getElementById("expTotalCobro").value = expediente.total_fee || "";
        document.getElementById("expFechaIngreso").value = expediente.entry_date ? expediente.entry_date.split("T")[0] : "";
        document.getElementById("expTipoCliente").value = expediente.client_type || "";
        document.getElementById("expExpertRole").value = expediente.expert_role || "";
    } catch (error) {
        console.error(error);
        alert("Error al cargar expediente");
    }
}