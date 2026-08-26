const API_URL = 'http://localhost:3005';

const form = document.querySelector('form');
const registerButton = document.querySelector('.btn-guardar');
const redirectButton = document.querySelector('#redirectButton');

const showMessage = (message, type = 'danger') => {
	let messageElement = document.querySelector('#registro-message');

	if (!messageElement) {
		messageElement = document.createElement('div');
		messageElement.id = 'registro-message';
		messageElement.className = 'alert mt-3';
		form.prepend(messageElement);
	}

	messageElement.className = `alert alert-${type} mt-3`;
	messageElement.textContent = message;
};

const registrarUsuario = async (event) => {
	event.preventDefault();

	if (!form.reportValidity()) {
		return;
	}

	const usuario = {
		user: document.querySelector('#user').value.trim(),
		name: document.querySelector('#name').value.trim(),
		rol: document.querySelector('#rol').value,
		password: document.querySelector('#password').value
	};

	registerButton.disabled = true;
	showMessage('Registrando usuario...', 'info');

	try {
		const response = await fetch(`${API_URL}/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(usuario)
		});
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || 'No se pudo registrar el usuario.');
		}

		showMessage(data.message || 'Usuario registrado correctamente.', 'success');
		form.reset();
		setTimeout(() => {
			window.location.href = 'login.html';
		}, 1200);
	} catch (error) {
		showMessage(error.message || 'No fue posible conectar con el servidor.');
	} finally {
		registerButton.disabled = false;
	}
};

form.addEventListener('submit', registrarUsuario);

redirectButton.addEventListener('click', () => {
	window.location.href = 'index.html';
});
