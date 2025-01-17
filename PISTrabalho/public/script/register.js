document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const formData = new FormData(this); // Cria um objeto FormData com os dados do formulário

    fetch('/api/register', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(json => { throw new Error(json.error) });
        }
    })
    .then(data => {
        alert(data.message);
        window.location.href = '/login.html'; // Redireciona para a página de login após o registro bem-sucedido
    })
    .catch(error => {
        alert('Error: ' + error.message);
    });
});