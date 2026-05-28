function getToken(){
    return localStorage.getItem("token")
        || sessionStorage.getItem("token");
}

async function cargarPendientes(){
    try{
        const response = await fetch("http://localhost:3000/api/pendings/agenda",{
                headers:{
                    Authorization:`Bearer ${getToken()}`
                }
            }
        );
        const pendientes = await response.json();

        const container =document.getElementById("agendaContainer");
        container.innerHTML = "";
        if(!pendientes.length){
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>No hay pendientes</h3>
                    <p>Todo está al día</p>
                </div>
            `;
            return;
        }

        // AGRUPAR POR FECHA 
        const groupedByDate = {};
        pendientes.forEach(p => {
            const fechaObj = new Date(p.date);

            const fechaKey = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2,"0")}-${ String(fechaObj.getDate()).padStart(2,"0")}`;
            if(!groupedByDate[fechaKey]){
                groupedByDate[fechaKey] = [];
            }
            groupedByDate[fechaKey].push(p);
        });

        //  RECORRER FECHAS 
        const fechasOrdenadas = Object.keys(groupedByDate).sort((a,b)=>{
            const hoy = new Date();
            hoy.setHours(0,0,0,0);

            const fechaA = new Date(a + "T00:00:00");
            const fechaB = new Date(b + "T00:00:00");

            // DIFERENCIA EN DÍAS
            const diffA = Math.floor((fechaA - hoy) / (1000 * 60 * 60 * 24));
            const diffB = Math.floor((fechaB - hoy) / (1000 * 60 * 60 * 24));

            // ===== PRIORIDADES =====

            const prioridad = (diff) => {
                // HOY
                if(diff === 0) return 0;
                // MAÑANA
                if(diff === 1) return 1;
                // FUTURAS
                if(diff > 1) return 2;
                // ATRASADAS
                return 3;
            };

            const prioridadA = prioridad(diffA);
            const prioridadB = prioridad(diffB);

            // ORDENAR POR PRIORIDAD
            if(prioridadA !== prioridadB){
                return prioridadA - prioridadB;
            }
            // DENTRO DE LA MISMA PRIORIDAD
            return fechaA - fechaB;

        });
        for(const fecha of fechasOrdenadas){
            const section = document.createElement("div");
            section.className = "day-section";
            section.innerHTML = `
                <div class="day-title">
                    <i class="fas fa-calendar-day"></i>
                    ${formatearTituloFecha(fecha)}
                </div>
            `;

            //  AGRUPAR POR JUZGADO 
            const groupedByCourt = {};
            groupedByDate[fecha].forEach(p => {
                if(!groupedByCourt[p.juzgado]){
                    groupedByCourt[p.juzgado] = [];
                }
                groupedByCourt[p.juzgado].push(p);
            });

            // CARDS 
            for(const juzgado in groupedByCourt){
                const courtCard = document.createElement("div");
                courtCard.className = "court-card";
                let html = `
                    <div class="court-title">
                        <i class="fas fa-landmark"></i>
                        ${juzgado}
                    </div>
                `;

                groupedByCourt[juzgado]
                .forEach(p => {
                    const hoy = new Date();
                    hoy.setHours(0,0,0,0);
                    const fechaPendiente = new Date(p.date);
                    fechaPendiente.setHours(0,0,0,0);
                    const vencido = fechaPendiente < hoy;

                    html += `
                        <div class="pending-item ${vencido ? 'pending-overdue' : ''}">
                            <div class="pending-left">
                                <input type="checkbox" class="pending-checkbox" onchange="completarPendiente(${p.pending_id})">
                                <div class="pending-info">
                                    <h4>${p.description}</h4>
                                    <div class="pending-meta">
                                        <span><i class="fas fa-folder-open"></i>${p.case_number}</span>
                                        <span><i class="fas fa-book"></i>${p.evento}</span>
                                    </div>
                                </div>
                            </div>
                            <button class="btn-go-exp ${vencido ? 'btn-overdue' : ''}" onclick=" window.location.href='../PAGES/FILE-DETAIL.html?id=${p.case_file_id}'">
                                Ver expediente
                            </button>
                        </div>
                    `;
                });

                courtCard.innerHTML = html;
                section.appendChild(courtCard);
            }
            container.appendChild(section);
        }
    }catch(error){
        console.error(error);
    }
}

function formatearTituloFecha(fecha){
    const hoy = new Date();
    const manana = new Date();

    manana.setDate(hoy.getDate() + 1);

    const fechaObj = new Date(fecha + "T00:00:00");
    const normalizar = (f) => {
        return `${f.getFullYear()}-${
            String(f.getMonth() + 1).padStart(2,"0")
        }-${
            String(f.getDate()).padStart(2,"0")
        }`;
    };

    const fechaTexto = normalizar(fechaObj);
    const hoyTexto = normalizar(hoy);
    const mananaTexto = normalizar(manana);

    if(fechaTexto === hoyTexto){
        return "HOY";
    }

    if(fechaTexto === mananaTexto){
        return "MAÑANA";
    }

    return fechaObj.toLocaleDateString(
        "es-MX",
        {
            weekday:"long",
            day:"numeric",
            month:"long"
        }
    ).toUpperCase();
}

async function completarPendiente(id){
    const confirmacion = await Swal.fire({
        title:"¿Completar pendiente?",
        text:"Se eliminará de la agenda.",
        icon:"warning",
        showCancelButton:true,
        confirmButtonColor:"#7C3AED",
        cancelButtonColor:"#d33",
        confirmButtonText:"Sí, completar",
        cancelButtonText:"Cancelar"
    });

    if(!confirmacion.isConfirmed){
        cargarPendientes();
        return;
    }

    try{
        await fetch(`http://localhost:3000/api/pendings/${id}`,
            {
                method:"DELETE",
                headers:{
                    Authorization:
                    `Bearer ${getToken()}`
                }
            }
        );

        await cargarPendientes();

        Swal.fire({
            icon:"success",
            title:"Pendiente completado",
            timer:1500,
            showConfirmButton:false
        });

    }catch(error){
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarPendientes();
});