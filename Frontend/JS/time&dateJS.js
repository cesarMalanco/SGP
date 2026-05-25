
document.addEventListener("DOMContentLoaded", () => {
    const usuarioGuardado = localStorage.getItem("userName");
    if (usuarioGuardado) {
        document.getElementById("user-name").textContent =
            `${usuarioGuardado}`;
    }

    // Función para cerrar sesión
    document.querySelector(".logout").addEventListener("click", () => {
        Swal.fire({
            title: "¿Cerrar sesión?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = "../PAGES/login.html";
            }
        });
    });

});

function updateDateTime(){
    const el = document.getElementById("datetime");

    if (!el) return;
    const fecha = new Date();

    const opciones = {
        weekday:'long',
        year:'numeric',
        month:'long',
        day:'numeric',
        hour:'2-digit',
        minute:'2-digit',
        second:'2-digit'
    };

    let fechaFormateada = fecha.toLocaleDateString('es-MX', opciones);
    const partes = fechaFormateada.split(',');
    if (partes.length > 0) {
        // Para la primera letra en mayúscula
        const dia = partes[0].trim();
        const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
        partes[0] = diaCapitalizado;
        fechaFormateada = partes.join(', ');
    }

    document.getElementById("datetime").textContent = fechaFormateada;
}

setInterval(updateDateTime,1000);
updateDateTime();