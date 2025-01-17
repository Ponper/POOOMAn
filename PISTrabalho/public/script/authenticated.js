// Função para verificar se o usuário está autenticado
async function ensureAuthenticated() {
    try {
        const response = await fetch('/api/current_user');
        if (response.status === 401) {
            window.location.href = '/login.html'; // Redireciona para a página de login se não estiver autenticado
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
    }
}

export default ensureAuthenticated;