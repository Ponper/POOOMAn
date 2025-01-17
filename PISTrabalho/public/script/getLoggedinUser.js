let loggedInUserId = null;

// Função para obter o usuário logado
function getLoggedInUser() {
    return fetch('/api/current_user')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch logged-in user');
            }
            return response.json();
        })
        .then(user => {
            loggedInUserId = user.id_utilizador; // Supondo que o ID do usuário seja 'id_utilizador'
            return user; // Retorne o usuário para uso posterior
        })
        .catch(error => {
            console.error('Error fetching logged-in user:', error);
        });
}
// Função para fazer logout
function logout() {
    return fetch('/api/logout', {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/login.html'; // Redireciona para a página de login após logout bem-sucedido
        } else {
            throw new Error('Failed to logout');
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });
}

export { getLoggedInUser, loggedInUserId, logout };