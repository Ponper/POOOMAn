import ensureAuthenticated from './authenticated.js';
import { getLoggedInUser, logout } from './getLoggedinUser.js';
ensureAuthenticated();

document.addEventListener('DOMContentLoaded', () => {
    const recipeId = new URLSearchParams(window.location.search).get('id');

    if (!recipeId) {
        document.getElementById('recipe-detail').textContent = 'Recipe not found';
        return;
    }

    fetch(`/api/recipes/${recipeId}`)
        .then(response => response.json())
        .then(recipe => {
            if (!recipe) {
                document.getElementById('recipe-detail').textContent = 'Recipe not found';
                return;
            }

            const title = document.getElementById('recipe-title');
            title.textContent = recipe.titulo;

            const description = document.getElementById('recipe-description');
            description.textContent = `${recipe.descricao}`;
            fetch(`/api/autor/${recipe.autor}`)
            .then(response => response.json())
            .then(user => {
              const author = document.getElementById('autor');
              author.textContent = `Author: ${user.utilizador}`;
            })
            .catch(error => {
              console.error('Error fetching author:', error);
            });
            const author = document.getElementById('autor');
            author.textContent = `Author: ${recipe.autor}`;

            const difficulty = document.getElementById('difficulty');
            difficulty.textContent = `${recipe.dificuldade}`;

            const category = document.getElementById('ingredients');
            category.textContent = `Categoria: ${recipe.categoria}`;

            const time = document.getElementById('cook-time');
            time.textContent = `${recipe.tempo}`;

            const cost = document.getElementById('cost');
            cost.textContent = `${recipe.custo} €`;

            if (recipe.imagem) {
                const img = document.getElementById('recipe-image');
                img.src = recipe.imagem;
                img.alt = recipe.titulo;
            }
        })
        .catch(error => {
            console.error('Error fetching recipe:', error);
            document.getElementById('recipe-detail').textContent = 'Error fetching recipe';
        });
        getLoggedInUser().then(user => {
            if (user) {
                const autorInput = document.getElementById("autor");
                const userPhotoElement = document.getElementById('user-photo');
                userPhotoElement.src = user.imagem ? user.imagem : 'images/default-user.png'; // Supondo que a imagem do usuário seja 'imagem'
                if (autorInput) {
                    autorInput.value = user.utilizador;
                } else {
                    console.error('Element with ID "autor" not found');
                }
            } else {
                console.log('No user found');
            }
        });    
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            logout();
            window.location.href = '/login.html'; // Redireciona para a página de login após logout
        });
    }
});