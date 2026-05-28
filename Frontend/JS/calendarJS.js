let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let allPendings = [];

function getToken() {
    let token = localStorage.getItem("token");
    if (!token) {
        token = sessionStorage.getItem("token");
    }
    return token;
}

function formatDateLocal(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatPrettyDate(dateString) {
    const date = new Date(dateString + "T00:00:00");
    const formatted = date.toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

document.getElementById("prevMonth").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

document.getElementById("nextMonth").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

// Cargar pendientes 
async function loadPendings() {
    try {
        const response = await fetch("http://localhost:3000/api/pendings/agenda", {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error("Error al cargar pendientes");
        }
        
        allPendings = await response.json();
        renderCalendar(currentMonth, currentYear);
    } catch (error) {
        console.error("Error:", error);
        allPendings = [];
        renderCalendar(currentMonth, currentYear);
    }
}

function renderCalendar(month, year) {
    const calendar = document.getElementById("calendarGrid");
    if (!calendar) return;
    
    calendar.innerHTML = "";
    
    const firstDay = new Date(year, month, 1).getDay();
    let firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril",
        "Mayo", "Junio", "Julio", "Agosto",
        "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const monthTitle = document.getElementById("monthTitle");
    if (monthTitle) {
        monthTitle.textContent = `${monthNames[month]} ${year}`;
    }
    
    for (let i = 0; i < firstDayIndex; i++) {
        const empty = document.createElement("div");
        calendar.appendChild(empty);
    }
    
    const today = new Date();
    const todayStr = formatDateLocal(today);
    
    // Días del mes
    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const div = document.createElement("div");
        div.className = "calendar-day";
        
        // Marcar si es hoy
        if (dateStr === todayStr) {
            div.classList.add("today");
        }

        // Filtrar pendientes del día
        const pendingsDay = allPendings.filter(p => {
            return formatDateLocal(p.date) === dateStr;
        });
        
        div.innerHTML = `
            <div class="day-top">
                <div class="day-number">${day}</div>

                ${
                    pendingsDay.length > 2
                    ? `<div class="more-badge">+${pendingsDay.length - 2}</div>`
                    : ""
                }
            </div>
        `;
        
        // Mostrar 
        pendingsDay.slice(0,2).forEach(p => {
            const color = "#7C3AED";
            div.innerHTML += `
                <div class="day-event"
                    style="background:${color}">
                    ${p.description}
                </div>
            `;
    });
        
        if (pendingsDay.length > 4) {
            div.innerHTML += `<small style="font-size: 10px; color: #7C3AED;">+${pendingsDay.length - 4} más</small>`;
        }
        
        // Evento click para ver detalles
        div.addEventListener("click", (e) => {
            e.stopPropagation();
            renderDayDetails(dateStr);
        });
        
        calendar.appendChild(div);
    }
}

function renderDayDetails(dateStr) {
    const container = document.getElementById("selectedDayPendings");
    const title = document.getElementById("selectedDateTitle");
    if (!container || !title) return;
    title.textContent = formatPrettyDate(dateStr);
    const pendings = allPendings.filter(p => formatDateLocal(p.date) === dateStr);
    
    if (!pendings.length) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <i class="fas fa-calendar-check" style="font-size: 48px; color: #cbd5e1; margin-bottom: 16px;"></i>
                <p style="color: #64748b;">No hay pendientes para este día</p>
                <small style="color: #94a3b8;">Disfruta tu día sin tareas pendientes</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pendings.map(p => `
        <div class="pending-card">       
            <h4>${p.description || "Sin descripción"}</h4>
            <small>
                Expediente: ${p.case_number || "N/A"}
            </small>
            ${p.priority? `<span class="badge" style="background:#fed7aa; color:#9b3412; margin-left:8px;">Prioridad</span>` : ""}
        </div>
    `).join("");
}


document.addEventListener("DOMContentLoaded", async () => {
    await loadPendings();

    document.getElementById("selectedDayPendings").innerHTML = `
        <div class="empty-day">
            <i class="fas fa-calendar-day"></i>
            <p>Selecciona un día para ver pendientes</p>
        </div>
    `;
});