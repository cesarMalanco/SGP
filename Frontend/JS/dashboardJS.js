function getToken() {
    return localStorage.getItem("token")
        || sessionStorage.getItem("token");
}

async function cargarDashboard() {
    try {
        const headers = {
            Authorization: `Bearer ${getToken()}`
        };

        // ===== PETICIONES =====
        const [pendingRes, filesRes, contactsRes, logsRes] = await Promise.all([
            fetch("http://localhost:3000/api/pendings/agenda", { headers }),
            fetch("http://localhost:3000/api/case-files", { headers }),
            fetch("http://localhost:3000/api/contacts", { headers }),
            fetch("http://localhost:3000/api/logs", { headers })
        ]);

        const pendientes = await pendingRes.json();
        const expedientes = await filesRes.json();
        const contactosResponse = await contactsRes.json();
        const contactos = contactosResponse.data;
        const logs = await logsRes.json();

        document.getElementById("totalPendings").textContent = pendientes.length;
        document.getElementById("totalFiles").textContent = expedientes.length;
        document.getElementById("totalContacts").textContent = contactos.length;

        // EVENTOS HOY 
        const hoy = new Date().toISOString().split("T")[0];
        const eventosHoy = logs.filter(log => {
            return log.date?.split("T")[0] === hoy;
        });

        document.getElementById("eventsToday").textContent = eventosHoy.length;

        //ACTIVIDAD RECIENTE 
        const activityList = document.getElementById("activityList");
        let activityHTML = "";

        logs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).forEach(log => {
            activityHTML += `
                <div class="activity-item">
                    <div class="activity-icon bg-soft-purple">
                        <i class="fas fa-book"></i>
                    </div>

                    <div>
                        <p class="mb-0 fw-semibold">
                            ${log.action}
                        </p>

                        <small>
                            ${formatearFecha(log.date)}
                        </small>
                    </div>
                </div>
            `;
        });

        activityList.innerHTML = `
            <div class="scroll-track">
                ${activityHTML}
            </div>
        `;

        const upcoming = document.getElementById("upcomingEvents");
        let upcomingHTML = "";
        pendientes.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5).forEach(p => {
            const fecha = new Date(p.date);
            const dia = fecha.getDate();
            const mes = fecha.toLocaleDateString(
                "es-MX",
                { month: "short" }
            ).toUpperCase();

            upcomingHTML += `
                <div class="calendar-events">
                    <div class="event-date">
                        <span class="date-number">
                            ${dia}
                        </span>
                        <span class="date-month">
                            ${mes}
                        </span>
                    </div>
                    <div class="event-info">
                        <p class="mb-0 fw-bold">
                            ${p.description}
                        </p>
                        <small>
                            ${p.case_number}
                        </small>
                    </div>
                </div>
            `;
        });

        upcoming.innerHTML = `
        <div class="scroll-track">
            ${upcomingHTML}
        </div>
    `;
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cargar el dashboard"
        });
    }
}

function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDashboard();
});