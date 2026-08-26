const API_URL = 'http://localhost:3005';

const precios = {
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


async function crearPedido(event) {

    const boton = event.currentTarget;
    const formulario = boton.closest('form');

    // Verificar formulario
    if (!formulario.reportValidity()) {
        return;
    }

    // Obtener datos
    const platillo = formulario.querySelector('.platillo').value;
    const mesa = Number(formulario.querySelector('.mesa').value);
    const cantidad = Number(formulario.querySelector('.cantidad').value);

    if (!Number.isInteger(mesa) || mesa < 1) {
        alert('Ingresa un número de mesa válido');
        return;
    }

    if (!Number.isInteger(cantidad) || cantidad < 1) {
        alert('Ingresa una cantidad válida');
        return;
    }

    const pedido = {
        platillo: platillo,
        precio: precios[platillo],
        mesa: mesa,
        cantidad: cantidad,
        observaciones: formulario.querySelector('.observaciones').value,
        cliente: formulario.querySelector('.cliente').value,
        fecha: formulario.querySelector('.fecha').value
    };


    try {

        boton.disabled = true;
        boton.textContent = 'Guardando...';

        const respuesta = await fetch(`${API_URL}/pedido`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedido)
        });


        const data = await respuesta.json();


        if (!respuesta.ok) {
            throw new Error(data.message || 'Error al crear el pedido');
        }


        alert('Pedido creado correctamente');

        formulario.reset();
        actualizarPrecioPizza();
        actualizarIngredientesPizza();
        actualizarPrecioPasta();
        actualizarIngredientesPasta();
        showPrice();
        showIngredients();

    } catch (error) {

        alert(error.message);

    } finally {

        boton.disabled = false;
        boton.textContent = 'PEDIR';

    }
}


document.querySelectorAll('.btn-pedido').forEach(boton => {
    boton.addEventListener('click', crearPedido);
});