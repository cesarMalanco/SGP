const API_URL = "http://localhost:3000/api/contacts";

let contacts = [];
let filteredContacts = [];
let currentContactId = null;

function getToken() {
    let token = localStorage.getItem("token");
    if (!token) {
        token = sessionStorage.getItem("token");
    }
    return token;
}

// CARGAR CONTACTOS
async function loadContacts() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });


        if (!response.ok) {
            throw new Error("No se pudieron obtener contactos");
        }

        const result = await response.json();

        contacts = result.data.map(c => ({
            id: c.contact_id,
            name: c.name || "Sin nombre",
            phone: c.phone || "Sin teléfono",
            email: c.address || "Sin correo",
            roles: c.roles || "Sin rol",
            expedientes: c.expedientes || "Sin expediente",
            category: c.category || "Sin categoría"
        }));

        filteredContacts = [...contacts];
        renderContacts();
    } catch (error) {
        console.error(error);
    }
}


function translateRole(role) {

    const roles = {

        actor: "Actor",
        defendant: "Demandado",
        lawyer: "Abogado",
        actor_lawyer: "Abogado del Actor",
        defendant_lawyer: "Abogado del Demandado",
        client: "Cliente",
    };

    return roles[role ?.trim().toLowerCase()] || role;
}

function getBadgeClass(category){

    const badges = {
        cliente: "badge-cliente",
        abogado: "badge-abogado",
        perito: "badge-perito"
    };

    return badges[category?.toLowerCase()] || "badge-default";
}

// MOSTRAR CONTACTOS 
function renderContacts() {
    const container = document.getElementById("contactsContainer");
    const empty = document.getElementById("noResultsMsg");

    container.innerHTML = "";
    if (!filteredContacts.length) {
        empty.style.display = "block";
        updateCounter(0);
        return;
    }

    empty.style.display = "none";

    filteredContacts.forEach(contact => {
        container.innerHTML += `
        <div class="col-md-6 col-lg-4">
            <div class="contact-card">
                <div class="contact-avatar">
                    <i class="fas fa-user"></i>
                </div>
                ${contact.category ? `
                <span class="contact-badge ${getBadgeClass(contact.category)}">
                    ${contact.category}
                </span>
                ` : ""}
                <div class="contact-info">
                    <h4>${contact.name}</h4>
                    <div class="contact-role">
                        <i class="fa-solid fa-user-tag"></i>
                        ${translateRole(contact.roles)}
                    </div>
                    <p>
                        <i class="fa-solid fa-folder-open"></i>
                        Expediente:
                        ${contact.expedientes}
                    </p>
                        <p>
                        <i class="fa-solid fa-phone"></i>
                        ${contact.phone}
                    </p>
                    <p>
                        <i class="fa-solid fa-envelope"></i>
                        ${contact.email}
                    </p>
                </div>
                <div class="contact-actions">
                    <div class="actions-row">
                        <button class="contact-action-btn message" data-bs-toggle="modal" data-bs-target="#messageModal">
                            <i class="fas fa-envelope"></i> Mensaje
                        </button>
                        <button class="contact-action-btn edit" onclick="openEditModal(${contact.id})">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                    </div>
                    <button class="contact-action-btn delete" onclick="deleteContact(${contact.id})">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
        `;
    });

    updateCounter(filteredContacts.length);
}

function openEditModal(id){
    const contact = contacts.find(c=>c.id===id);

    if(!contact)return;

    currentContactId=id;

    // llenar modal
    document.getElementById("editContactId").value=id;
    document.getElementById("editName").value = contact.name;
    document.getElementById("editPhone").value=
    contact.phone === "Sin teléfono" ? "" :contact.phone;
    document.getElementById("editEmail").value = contact.email === "Sin correo" ? "" : contact.email;
    document.getElementById("editCategory").value = contact.category;


    // abrir modal
    const modal = new bootstrap.Modal(document.getElementById("editContactModal"));

    modal.show();
}

async function updateContact(){
    try{
        const category = document.getElementById("editCategory").value;

        const body={
            name:document.getElementById("editName").value.trim(),
            phone:document.getElementById("editPhone").value.trim(),
            address:document.getElementById("editEmail").value.trim(),
            category: category
        };

        const response=await fetch(`${API_URL}/${currentContactId}`,{
            method:"PUT",
            headers:{
                "Content-Type":"application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify(body)
        });

        if(!response.ok){
            throw new Error();
        }

        bootstrap.Modal.getInstance(document.getElementById("editContactModal")).hide();

        // volver a pedir datos 
        await loadContacts();

    Swal.fire({
        icon: "success",
        title: "Contacto actualizado",
        text: "La información se guardó correctamente",
        confirmButtonColor: "#7C3AED"
    });
        }

        catch(error){
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo actualizar el contacto",
                confirmButtonColor: "#7C3AED"
            });
        }
}

async function saveContact() {
    try {
        const body = {
            name: document.getElementById("contactName").value.trim(),
            phone: document.getElementById("contactPhone").value.trim(),
            address: document.getElementById("contactEmail").value.trim(),
            category: document.getElementById("contactCategory").value
        };

        const response = await fetch(API_URL,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify(body)
        });

        if(!response.ok){
            throw new Error();
        }

        bootstrap.Modal.getInstance(document.getElementById("addContactModal")).hide();
        document.getElementById("contactForm").reset();
        await loadContacts();
        Swal.fire({
            icon: "success",
            title: "Contacto agregado",
            text: "El nuevo contacto fue registrado",
            confirmButtonColor: "#7C3AED"
        });
    }catch(error){
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo guardar el contacto",
            confirmButtonColor: "#7C3AED"
        });
    }
}

async function deleteContact(id){
    try{
        const result = await Swal.fire({
            title: "¿Eliminar contacto?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (!result.isConfirmed) return;
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });
        if(!response.ok){
            throw new Error();
        }
        await loadContacts();
        Swal.fire({
            icon: "success",
            title: "Contacto eliminado",
            text: "El contacto fue eliminado correctamente",
            confirmButtonColor: "#7C3AED"
        });
    }catch(error){
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el contacto",
            confirmButtonColor: "#7C3AED"
        });
    }

}

// Función para escapar HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// BUSCAR CONTACTOS
function searchContacts() {
    const text = document.getElementById("searchInput").value.toLowerCase();
    const category = document.getElementById("categoryFilter").value;

    filteredContacts = contacts.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(text) || 
                            c.phone.toLowerCase().includes(text) || 
                            c.email.toLowerCase().includes(text);
        const matchCategory = category==="todos" || c.category.toLowerCase() === category.toLowerCase();
        return (matchSearch && matchCategory);
    });
    renderContacts();
}

// CONTADOR
function updateCounter(total) {
    document.getElementById("totalContacts").innerText = total;
}

// EVENT LISTENERS
document.addEventListener("DOMContentLoaded", () => {
    loadContacts();
    document.getElementById("updateContactBtn").addEventListener("click",updateContact);
    document.getElementById("saveContactBtn").addEventListener("click", saveContact);
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");

    if (searchInput) {
        searchInput.addEventListener("input", searchContacts);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener("change", searchContacts);
    }
});