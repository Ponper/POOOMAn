import ensureAuthenticated from './authenticated.js';
import { getLoggedInUser, logout } from './getLoggedinUser.js';

ensureAuthenticated();

document.addEventListener('DOMContentLoaded', () => {
    getLoggedInUser().then(user => {
        if (user) {
            console.log('User ID:', user.id_utilizador);
            const userPhotoElement = document.getElementById('user-photo');
            userPhotoElement.src = user.imagem ? user.imagem : 'images/default-user.png'; // Supondo que a imagem do usuário seja 'imagem'
        } else {
            console.log('No user found');
        }
    }).catch(error => {
        console.error('Error fetching logged in user:', error);
    });

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            logout();
            window.location.href = '/login.html'; // Redireciona para a página de login após logout
        });
    }
    document.getElementById('search-button').addEventListener('click', function() {
        const query = document.getElementById('search-input').value;
        fetch(`/api/recipes/search/${query}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(data => {
                const resultsContainer = document.getElementById('search-results');
                resultsContainer.innerHTML = ''; // Clear previous results
                data.forEach(recipe => {
                    const recipeDiv = document.createElement('div');
                    recipeDiv.className = 'recipe';
                    recipeDiv.innerHTML = `
                        <img src="${recipe.imagem}" alt="${recipe.titulo}" class="img recipe-img" />
                        <h5>${recipe.titulo}</h5>
                        <p>Author: ${recipe.autor}</p>
                        <p>Difficulty: ${recipe.dificuldade}</p>
                        <p>Category: ${recipe.categoria}</p>
                        <p>Time to Make: ${recipe.tempo}</p>
                        <p>Cost: ${recipe.custo} €</p>
                    `;
                    recipeDiv.addEventListener('click', () => {
                        window.location.href = `recipedetail.html?id=${recipe.id_receita}`;
                    });
                    resultsContainer.appendChild(recipeDiv);
                });
            })
            .catch(error => console.error('Error fetching recipes:', error));
    });
});
