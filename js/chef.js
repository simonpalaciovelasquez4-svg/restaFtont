const API_URL = 'http://localhost:3005';

const panels = {
    'preparar': {
        tabla: 'PorPreparar',
        accion: 'preparando',
        boton: 'Empezar preparación'
    },

    'preparando': {
        tabla: 'Preparando',
        accion: 'listo',
        boton: 'Marcar como listo'
    }
};


// ===============================
// OBTENER PEDIDOS - GET
// ===============================
async function obtenerPedidos() {

    try {

        const response = await fetch(`${API_URL}/chef`);

        if (!response.ok) {
            throw new Error('Error al obtener los pedidos');
        }

        const data = await response.json();

        console.log('Respuesta del servidor:', data);

   
        let pedidos = Array.isArray(data)
            ? data

      
            : [
                ...(data.data?.porPreparar || []),
                ...(data.data?.preparando || [])
            ];

        mostrarPedidos(pedidos);

    } catch (error) {

        console.error('Error:', error);

    }
}



function mostrarPedidos(pedidos) {

    const tablaPorPreparar =
        document.querySelector('#PorPreparar tbody');

    const tablaPreparando =
        document.querySelector('#Preparando tbody');

    // Limpiar tablas
    tablaPorPreparar.innerHTML = '';
    tablaPreparando.innerHTML = '';


    pedidos.forEach(pedido => {

        const estado = String(pedido.estado || '').toLowerCase();

        const panel = panels[estado];

        if (!panel) {
            console.log('Estado no reconocido:', pedido.estado);
            return;
        }

        mostrarPedido(pedido, panel);

    });
}


function mostrarPedido(pedido, panel) {

    const tabla =
        document.querySelector(`#${panel.tabla} tbody`);

    const fila = document.createElement('tr');

    fila.innerHTML = `
        <td>${pedido.platillo || ''}</td>
        <td>${pedido.mesa || ''}</td>
        <td>${pedido.cantidad || 0}</td>
        <td>
            <button class="btn btn-primary">
                ${panel.boton}
            </button>
        </td>
    `;


    const boton = fila.querySelector('button');

    boton.addEventListener('click', () => {

        actualizarEstado(
            pedido.id,
            panel.accion,
            boton
        );

    });


    tabla.appendChild(fila);
}



async function actualizarEstado(id, accion, boton) {

    boton.disabled = true;

    try {

        const response = await fetch(`${API_URL}/${accion}`, {

            method: 'PUT',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                id: id
            })
        });


        if (!response.ok) {
            throw new Error('No se pudo actualizar el pedido');
        }


        // Volver a pedir los pedidos
        await obtenerPedidos();

    } catch (error) {

        console.error('Error:', error);

        boton.disabled = false;

    }
}

obtenerPedidos();