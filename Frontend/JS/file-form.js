
// Variable para saber si se está editando
let isEditMode = false;
let currentExpedienteId = null;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Verificar id
    const urlParams = new URLSearchParams(window.location.search);
    const expedienteId = urlParams.get('id');
    
    if (expedienteId) {
        isEditMode = true;
        currentExpedienteId = parseInt(expedienteId);
        cargarExpedienteParaEdicion(currentExpedienteId);
        document.getElementById('formTitle').textContent = 'Editar Expediente';
    }
    
    // Configurar evento del formulario
    const form = document.getElementById('expedienteForm');
    if (form) {
        form.addEventListener('submit', guardarExpediente);
    }
    
    // Validación en tiempo real para campos numéricos
    const totalCobro = document.getElementById('expTotalCobro');
    const restante = document.getElementById('expRestante');
    
    if (totalCobro && restante) {
        totalCobro.addEventListener('input', () => {
            if (parseFloat(restante.value) > parseFloat(totalCobro.value)) {
                restante.value = totalCobro.value;
            }
        });
    }
});

// ===== CARGAR EXPEDIENTE PARA EDICIÓN =====
function cargarExpedienteParaEdicion(id) {
    // Obtener datos del localStorage (simulando base de datos)
    // API **
    const expedientes = obtenerExpedientesStorage();
    const expediente = expedientes.find(exp => exp.id === id);
    
    if (expediente) {
        document.getElementById('expId').value = expediente.id;
        document.getElementById('expNumero').value = expediente.numero || '';
        document.getElementById('expJuzgado').value = expediente.juzgado || '';
        document.getElementById('expTitulo').value = expediente.titulo || '';
        document.getElementById('expTipoJuicio').value = expediente.tipoJuicio || '';
        document.getElementById('expAreaDictamen').value = expediente.areaDictamen || '';
        document.getElementById('expEstatus').value = expediente.estatus || 'activo';
        document.getElementById('expActor').value = expediente.actor || '';
        document.getElementById('expDemandado').value = expediente.demandado || '';
        document.getElementById('expLicenciado').value = expediente.licenciado || '';
        document.getElementById('expTotalCobro').value = expediente.totalCobro || '';
        document.getElementById('expRestante').value = expediente.restante || '';
        document.getElementById('expFechaIngreso').value = expediente.fechaIngreso || '';
        document.getElementById('expTipoCliente').value = expediente.tipoCliente || 'particular';
    }
}

// ===== OBTENER EXPEDIENTES DEL STORAGE =====
function obtenerExpedientesStorage() {
    const stored = localStorage.getItem('expedientesData');
    if (stored) {
        return JSON.parse(stored);
    }
    // Datos por defecto provisionales
    return [
        {
            id: 1,
            numero: "EXP-2024-001",
            tipoCliente: "particular",
            juzgado: "Juzgado Civil",
            titulo: "Divorcio Voluntario",
            actor: "María González",
            demandado: "Carlos González",
            licenciado: "Lic. Ana Rodríguez",
            fechaIngreso: "2024-01-15",
            estatus: "activo",
            tipoJuicio: "civil",
            areaDictamen: "pericial_documental",
            totalCobro: 15000.00,
            restante: 5000.00
        },
        {
            id: 2,
            numero: "EXP-2024-002",
            tipoCliente: "empresa",
            juzgado: "Juzgado Penal",
            titulo: "Robo Agravado",
            actor: "Ministerio Público",
            demandado: "Luis Ramírez",
            licenciado: "Lic. Carlos Méndez",
            fechaIngreso: "2024-02-10",
            estatus: "en_proceso",
            tipoJuicio: "penal",
            areaDictamen: "pericial_medicina",
            totalCobro: 25000.00,
            restante: 15000.00
        },
        {
            id: 3,
            numero: "EXP-2023-089",
            tipoCliente: "particular",
            juzgado: "Juzgado Laboral",
            titulo: "Despido Injustificado",
            actor: "Roberto Méndez",
            demandado: "Empresa XYZ S.A.",
            licenciado: "Lic. Diana Pérez",
            fechaIngreso: "2023-11-20",
            estatus: "concluido",
            tipoJuicio: "laboral",
            areaDictamen: "pericial_contable",
            totalCobro: 32000.00,
            restante: 0.00
        }
    ];
}

// ===== GUARDAR EXPEDIENTE =====
function guardarExpediente(event) {
    event.preventDefault();
    
    // Obtener valores del formulario
    const id = document.getElementById('expId')?.value;
    const numero = document.getElementById('expNumero')?.value;
    const juzgado = document.getElementById('expJuzgado')?.value;
    const titulo = document.getElementById('expTitulo')?.value;
    const tipoJuicio = document.getElementById('expTipoJuicio')?.value;
    const areaDictamen = document.getElementById('expAreaDictamen')?.value;
    const estatus = document.getElementById('expEstatus')?.value;
    const actor = document.getElementById('expActor')?.value;
    const demandado = document.getElementById('expDemandado')?.value;
    const licenciado = document.getElementById('expLicenciado')?.value;
    const totalCobro = parseFloat(document.getElementById('expTotalCobro')?.value) || 0;
    const restante = parseFloat(document.getElementById('expRestante')?.value) || 0;
    const fechaIngreso = document.getElementById('expFechaIngreso')?.value;
    const tipoCliente = document.getElementById('expTipoCliente')?.value;
    
    // Validar campos obligatorios
    if (!numero || !juzgado) {
        alert('Por favor complete los campos obligatorios: Número de Expediente y Juzgado');
        return;
    }
    
    // Obtener expedientes existentes
    let expedientes = obtenerExpedientesStorage();
    
    if (id && id !== '') {
        // Actualizar expediente existente
        const index = expedientes.findIndex(exp => exp.id == id);
        if (index !== -1) {
            expedientes[index] = {
                ...expedientes[index],
                numero, juzgado, titulo, tipoJuicio, areaDictamen,
                estatus, actor, demandado, licenciado,
                totalCobro, restante, fechaIngreso, tipoCliente
            };
        }
    } else {
        // Crear nuevo expediente
        const newId = expedientes.length > 0 ? Math.max(...expedientes.map(e => e.id)) + 1 : 1;
        expedientes.push({
            id: newId,
            numero, juzgado, titulo, tipoJuicio, areaDictamen,
            estatus, actor, demandado, licenciado,
            totalCobro, restante, fechaIngreso, tipoCliente
        });
    }
    
    // Guardar en localStorage
    localStorage.setItem('expedientesData', JSON.stringify(expedientes));
    
    
    // Redirigir a la lista de expedientes
    setTimeout(() => {
        window.location.href = '../PAGES/FILES.html';
    }, 1000);
}

// Animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);