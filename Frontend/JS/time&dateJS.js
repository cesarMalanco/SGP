
document.addEventListener("DOMContentLoaded", () => {
    const usuarioGuardado = localStorage.getItem("userName");
    if (usuarioGuardado) {
        document.getElementById("user-name").textContent =
            `${usuarioGuardado}`;
    }

});

function updateDateTime(){

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