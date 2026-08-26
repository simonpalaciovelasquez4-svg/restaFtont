async function obtenerPedidos() {

    try {
        const respuesta = await fetch("http://localhost:3005/pedidos");

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los pedidos");
        }

        const respuestaApi = await respuesta.json();
        const datos = Array.isArray(respuestaApi)
            ? respuestaApi
            : respuestaApi.data || [];
        const listaPedidos = document.getElementById("listaPedidos");

        listaPedidos.innerHTML = "";

        datos.forEach(function(pedido) {
            const fila = document.createElement("tr");
            const estado = String(pedido.estado || "").toLowerCase();
            const acciones = {
                "por preparar": { endpoint: "preparando", texto: "Preparar" },
                "preparando": { endpoint: "listo", texto: "Marcar listo" },
                "listo": { endpoint: "entregado", texto: "Entregar" },
                "por entregar": { endpoint: "entregado", texto: "Entregar" }
            };
            const accion = acciones[estado];

            fila.innerHTML = `
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            `;

            fila.children[0].textContent = pedido.platillo || "";
            fila.children[1].textContent = pedido.mesa || "";
            fila.children[2].textContent = pedido.cantidad || 0;
            fila.children[3].textContent = pedido.estado || "";
            const celdaAcciones = fila.querySelector("td:last-child");

            if (accion) {
                const boton = document.createElement("button");
                boton.type = "button";
                boton.className = "btn btn-primary me-1 mb-1";
                boton.textContent = accion.texto;
                boton.addEventListener("click", function() {
                    actualizarEstado(pedido.id, accion.endpoint, boton);
                });
                celdaAcciones.appendChild(boton);
            }

            const botonEditar = document.createElement("button");
            botonEditar.type = "button";
            botonEditar.className = "btn btn-warning me-1 mb-1";
            botonEditar.textContent = "Editar";
            botonEditar.addEventListener("click", function() {
                abrirEditorPedido(pedido);
            });
            celdaAcciones.appendChild(botonEditar);

            const botonEliminar = document.createElement("button");
            botonEliminar.type = "button";
            botonEliminar.className = "btn btn-danger mb-1";
            botonEliminar.textContent = "Eliminar";
            botonEliminar.addEventListener("click", function() {
                eliminarPedido(pedido.id, botonEliminar);
            });
            celdaAcciones.appendChild(botonEliminar);

            listaPedidos.appendChild(fila);
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

async function actualizarEstado(id, endpoint, boton) {
    boton.disabled = true;

    try {
        const respuesta = await fetch(`http://localhost:3005/${endpoint}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id })
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo actualizar el pedido");
        }

        await obtenerPedidos();
    } catch (error) {
        console.error("Error:", error);
        boton.disabled = false;
    }
}

function abrirEditorPedido(pedido) {
    document.getElementById("pedidoId").value = pedido.id;
    document.getElementById("pedidoEstado").value = pedido.estado || "por preparar";

    document.getElementById("pedidoPlatillo").value = pedido.platillo || "";
    document.getElementById("pedidoPrecio").value = pedido.precio || 0;
    document.getElementById("pedidoMesa").value = pedido.mesa || 1;
    document.getElementById("pedidoCantidad").value = pedido.cantidad || 1;

    // Inputs
    document.getElementById("pedidoCliente").value = pedido.cliente || "";
    document.getElementById("pedidoObservaciones").value = pedido.observaciones || "";

    // Fecha
    if (pedido.fecha) {
        document.getElementById("pedidoFecha").value =
            String(pedido.fecha).slice(0, 16).replace(" ", "T");
    } else {
        document.getElementById("pedidoFecha").value = "";
    }

    actualizarPrecioEditor();

    bootstrap.Modal
        .getOrCreateInstance(document.getElementById("editarPedidoModal"))
        .show();
}

const preciosEditor = {
    Formaggio: 15500,
    Margherita: 12500,
    Chicken: 17000,
    "Pineapple'o'clock": 16500,
    "Meat Town": 20000,
    Parma: 21500,
    Lasagna: 13500,
    Ravioli: 14500,
    "Spaghetti Classica": 11000,
    "Seafood pasta": 25500,
    "Today's Soup": 5500,
    Bruschetta: 8500,
    "Garlic bread": 9500,
    Tomozzarella: 7500
};

function actualizarPrecioEditor() {
    const platillo = document.getElementById("pedidoPlatillo").value;
    document.getElementById("pedidoPrecio").value = preciosEditor[platillo];
}

document.getElementById("pedidoPlatillo").addEventListener("change", actualizarPrecioEditor);

document.getElementById("formEditarPedido").addEventListener("submit", async function(evento) {
    evento.preventDefault();
    const botonGuardar = evento.target.querySelector("button[type='submit']");
    botonGuardar.disabled = true;

    const pedido = {
        id: Number(document.getElementById("pedidoId").value),
        platillo: document.getElementById("pedidoPlatillo").value.trim(),
        precio: Number(document.getElementById("pedidoPrecio").value),
        mesa: Number(document.getElementById("pedidoMesa").value),
        cantidad: Number(document.getElementById("pedidoCantidad").value),
        observaciones: document.getElementById("pedidoObservaciones").value.trim(),
        cliente: document.getElementById("pedidoCliente").value.trim(),
        fecha: document.getElementById("pedidoFecha").value,
        estado: document.getElementById("pedidoEstado").value
    };

    try {
        const respuesta = await fetch("http://localhost:3005/pedido", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pedido)
        });
        const resultado = await respuesta.json().catch(function() {
            return {};
        });
        if (!respuesta.ok) {
            throw new Error(resultado.message || "No se pudo editar el pedido");
        }
        bootstrap.Modal.getInstance(document.getElementById("editarPedidoModal")).hide();
        await obtenerPedidos();
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo editar el pedido.");
    } finally {
        botonGuardar.disabled = false;
    }
});

async function eliminarPedido(id, boton) {
    if (!confirm("¿Seguro que deseas eliminar este pedido?")) return;
    boton.disabled = true;

    try {
        const respuesta = await fetch("http://localhost:3005/pedido", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id })
        });
        if (!respuesta.ok) throw new Error("No se pudo eliminar el pedido");
        await obtenerPedidos();
    } catch (error) {
        console.error("Error:", error);
        boton.disabled = false;
        alert("No se pudo eliminar el pedido.");
    }
}

obtenerPedidos();