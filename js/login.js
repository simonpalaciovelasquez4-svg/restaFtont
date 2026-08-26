const API_URL = 'http://localhost:3005';

const form = document.querySelector('form');
const userInput = document.querySelector('#user');
const passwordInput = document.querySelector('#password');
const loginButton = document.querySelector('.btn-iniciar');

const showMessage = (message, type = 'danger') => {
	let messageElement = document.querySelector('#login-message');

	if (!messageElement) {
		messageElement = document.createElement('div');
		messageElement.id = 'login-message';
		messageElement.className = 'alert mt-3';
		form.prepend(messageElement);
	}

	messageElement.className = `alert alert-${type} mt-3`;
	messageElement.textContent = message;
};

const getRole = (response) => (
	response.rol ||
	response.role ||
	response.usuario?.rol ||
	response.user?.rol
);

const redirectByRole = (role) => {
	const pagesByRole = {
		cajero: 'cajero.html',
		chef: 'chef.html',
		mesero: 'mesero.html'
	};
	const page = pagesByRole[String(role).toLowerCase()];

	if (!page) {
		showMessage('El usuario no tiene un rol válido.');
		return;
	}

	window.location.href = page;
};

const login = async (event) => {
	event.preventDefault();
	loginButton.disabled = true;
	showMessage('Validando usuario...', 'info');

	try {
		const response = await fetch(`${API_URL}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user: userInput.value.trim(),
				password: passwordInput.value
			})
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || 'Usuario o contraseña incorrectos.');
		}

		localStorage.setItem('usuario', JSON.stringify(data.usuario || data.user || data));
		redirectByRole(getRole(data));
	} catch (error) {
		showMessage(error.message || 'No fue posible conectar con el servidor.');
	} finally {
		loginButton.disabled = false;
	}
};

form.addEventListener('submit', login);
