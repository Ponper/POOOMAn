document.getElementById('google-login-button').addEventListener('click', function() {
    window.location.href = '/auth/google'; // Redireciona para a rota de login com Google
});

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            window.location.href = '/'; // Redireciona para a página principal após login bem-sucedido
        } else {
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = 'Invalid username or password';
            errorMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Error during login:', error);
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'An error occurred. Please try again later.';
        errorMessage.style.color = 'red';
    }
});