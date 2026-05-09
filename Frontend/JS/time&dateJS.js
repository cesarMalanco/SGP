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

    const fechaFormateada =
        fecha.toLocaleDateString('es-MX', opciones);

    document.getElementById("datetime")
        .textContent = fechaFormateada;
}

setInterval(updateDateTime,1000);

updateDateTime();