const API_URL = 'http://localhost:3005';

const panels = {
    'por entregar': {
        tabla: 'PorEntregar',
        boton: 'Marcar como entregado'
    },

    'entregar': {
        tabla: 'PorEntregar',
        boton: 'Marcar como entregado'
    },

    'entregado': {
        tabla: 'Entregado',
        boton: null
    }
};


// ==========================
// OBTENER PEDIDOS - GET
// ==========================
async function obtenerPedidos() {

    try {

        const respuesta = await fetch(`${API_URL}/mesero`);

        if (!respuesta.ok) {
            throw new Error('Error al obtener los pedidos');
        }

        const data = await respuesta.json();

        console.log('Pedidos:', data);

        // Obtener los pedidos tanto si la API devuelve un arreglo como si usa data.
        const pedidos = Array.isArray(data)
            ? data
            : [
                ...(data.data?.porEntregar || []),
                ...(data.data?.entregado || [])
            ];

        mostrarPedidos(pedidos);

    } catch (error) {

        console.error(error);

    }
}


// ==========================
// MOSTRAR PEDIDOS
// ==========================
function mostrarPedidos(pedidos) {

    const porEntregar =
        document.querySelector('#PorEntregar tbody');

    const entregados =
        document.querySelector('#Entregado tbody');

    porEntregar.innerHTML = '';
    entregados.innerHTML = '';


    pedidos.forEach(pedido => {

        const estado = String(pedido.estado || '').toLowerCase();

        const panel = panels[estado];

        if (!panel) {
            return;
        }


        const tabla =
            document.querySelector(`#${panel.tabla} tbody`);


        const fila = document.createElement('tr');

        const numeroMesa = pedido.mesa ?? pedido.numeroMesa ?? pedido.numMesa ?? '';

        fila.innerHTML = `
            <td>${pedido.platillo || ''}</td>
            <td>Mesa ${numeroMesa}</td>
            <td>${pedido.cantidad || 0}</td>
        `;


        const celdaBoton = fila.querySelector('td:last-child');


        if (panel.boton) {

            const boton = document.createElement('button');

            boton.className = 'btn btn-success';
            boton.textContent = panel.boton;

            boton.addEventListener('click', () => {
                marcarEntregado(pedido.id, boton);
            });

            celdaBoton.appendChild(boton);

        } else {

            celdaBoton.textContent = 'Entregado';

        }


        tabla.appendChild(fila);

    });
}


// ==========================
// MARCAR COMO ENTREGADO - PUT
// ==========================
async function marcarEntregado(id, boton) {

    boton.disabled = true;

    try {

        const respuesta = await fetch(`${API_URL}/entregado`, {

            method: 'PUT',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                id: id
            })
        });


        if (!respuesta.ok) {
            throw new Error('No se pudo entregar el pedido');
        }


        await obtenerPedidos();

    } catch (error) {

        console.error(error);

        boton.disabled = false;

    }
}


// ==========================
// INICIAR
// ==========================
obtenerPedidos();