import ensureAuthenticated from './authenticated.js';
import { getLoggedInUser,logout, loggedInUserId } from './getLoggedinUser.js';
let userName ="";
ensureAuthenticated();
class Recipe {
    constructor(id, author, description, difficulty, category, tempo, cost, title, image, secretauthor) {
        this.id = id;
        this.author = author;
        this.description = description;
        this.difficulty = difficulty;
        this.category = category;
        this.tempo = tempo;
        this.cost = cost || 0;
        this.title = title || '';
        this.image = image || '';
        this.secretauthor = secretauthor;
    }

    createRecipe() {
        const div = document.createElement('div');
        div.className = "recipe";
        div.addEventListener('click', () => {
            window.location.href = `recipedetail.html?id=${this.id}`;
        });
    
        const title = document.createElement('h5');
        title.textContent = this.title;
    
        const author = document.createElement('p');
        author.textContent = `Autor: ${this.author}`;
    
        const difficulty = document.createElement('p');
        difficulty.textContent = `Dificuldade: ${this.difficulty}`;
    
        const time = document.createElement('p');
        time.textContent = `Tempo de preparo: ${this.tempo}`;
    
        const divButton = document.createElement('div');
        divButton.className = "recipe-buttons";
    
        const updateButton = document.createElement('button');
        updateButton.className = "update-btn";
        updateButton.textContent = "Update";
        updateButton.id = `update-recipe-${this.id}`; // Adiciona um ID único ao botão de atualização
        updateButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique no botão de atualização redirecione para a página de detalhes
            this.openUpdateModal();
        });
    
        const deleteButton = document.createElement('button');
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Apagar";
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique no botão de exclusão redirecione para a página de detalhes
            this.deleteRecipe();
        });
    
        getLoggedInUser().then(user => {
            if (user.id_utilizador === this.secretauthor || user.isadmin) {
                divButton.appendChild(updateButton);
                divButton.appendChild(deleteButton);
            }
        }).catch(error => {
            console.error('Error fetching logged in user:', error);
        });
    
        const img = document.createElement('img');
        if (this.image) {
            img.className = "img recipe-img";
            img.src = this.image;
            img.alt = this.title;
        }
    
        div.appendChild(img);
        div.appendChild(title);
        div.appendChild(author);
        div.appendChild(difficulty);
        div.appendChild(time);
        div.appendChild(divButton);
    
        return div;
    }
    deleteRecipe() {
        if (confirm('Quer mesmo apagar esta receita?')) {
            fetch(`/api/recipes/${this.id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Recipe deleted successfully') {
                    alert('Receita apagada com sucesso');
                    loadRecipes(); // Recarrega a lista de receitas
                } else {
                    alert('Error deleting recipe');
                }
            })
            .catch(error => {
                console.error('Error deleting recipe:', error);
                alert('Error deleting recipe');
            });
        }
    }
    openUpdateModal() {
        const modal = document.getElementById('update-recipe-modal');
        document.getElementById('update-titulo').value = this.title;
        document.getElementById('update-autor').value = userName;
        document.getElementById('update-descricao').value = this.description;
        document.getElementById('update-dificuldade').value = this.difficulty;
        document.getElementById('update-categoria').value = this.category;
        document.getElementById('update-tempo').value = this.tempo;
        document.getElementById('update-custo').value = this.cost;

        const updateForm = document.getElementById('update-recipe-form');
        updateForm.onsubmit = (event) => {
            event.preventDefault();
            this.updateRecipe();
            modal.style.display = 'none';
            modal.classList.remove("show");
        };

        modal.classList.add("show");
        modal.style.display = "block";
    }

    updateRecipe() {
        const formData = new FormData();
        formData.append('titulo', document.getElementById('update-titulo').value.trim());
        formData.append('autor', this.secretauthor);
        formData.append('descricao', document.getElementById('update-descricao').value.trim());
        formData.append('dificuldade', document.getElementById('update-dificuldade').value);
        formData.append('categoria', document.getElementById('update-categoria').value.trim());
        formData.append('tempo', document.getElementById('update-tempo').value.trim());
        formData.append('custo', document.getElementById('update-custo').value.trim());
    
        const imagemInput = document.getElementById('update-imagem');
        if (imagemInput.files.length > 0) {
            formData.append('imagem', imagemInput.files[0]);
        }
    
        fetch(`/api/recipes/${this.id}`, {
            method: 'PUT',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Recipe updated successfully') {
                alert('Recipe updated successfully');
                loadRecipes(); // Recarrega a lista de receitas
            } else {
                alert('Error updating recipe');
            }
        })
        .catch(error => {
            console.error('Error updating recipe:', error);
            alert('Error updating recipe');
        });
    }

}
function displayUserAndLogout() {
    const userContainer = document.getElementById('user-container');
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            logout();
            window.location.href = '/login.html'; // Redireciona para a página de login após logout
        });
    }   

    getLoggedInUser().then(user => {
        userContainer.appendChild(logoutButton);
    }).catch(error => {
        console.error('Error fetching logged in user:', error);
    });
}
function loadRecipes() {
    const containerRecipes = document.getElementById("recipes");
    try {
        fetch('/api/recipes')
            .then(response => response.json())
            .then(recipes => {
                if (recipes.length === 0) {
                    console.log('No recipes found');
                    return; // Não carrega as receitas se a lista estiver vazia
                }
    
                while (containerRecipes.firstChild) {
                    containerRecipes.removeChild(containerRecipes.firstChild);
                }
    
                recipes.forEach(recipeData => {
                    // Fetch the user name based on the author id
                    fetch(`/api/autor/${recipeData.autor}`)
                        .then(response => response.json())
                        .then(user => {
                            userName=user.utilizador;
                            let recipe = new Recipe(
                                recipeData.id_receita,
                                user.utilizador, // Use the user name instead of the author id
                                recipeData.descricao,
                                recipeData.dificuldade,
                                recipeData.categoria,
                                recipeData.tempo,
                                recipeData.custo,
                                recipeData.titulo, 
                                recipeData.imagem, // Adicionar a imagem
                                recipeData.autor // Adicionar o autor secreto
                            );
                            let recipeElement = recipe.createRecipe();

                            containerRecipes.appendChild(recipeElement);
                        })
                        .catch(error => console.error('Error fetching user:', error));
                });
            })
            .catch(error => console.error('Error fetching recipes:', error));
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById('add-recipe-form').addEventListener('submit', function(event) {
    event.preventDefault();
    getLoggedInUser().then(() => {
        const formData = new FormData(this); // Cria um objeto FormData com os dados do formulário
        formData.append('autor', loggedInUserId); // Adiciona o autor ao FormData

        // Log the form data to verify values
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        fetch('/api/recipes', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => { throw new Error(text) });
            }
        })
        .then(data => {
            alert('Recipe added successfully');
            document.getElementById('add-recipe-form').reset(); // Reseta o formulário
            document.getElementById('add-recipe-modal').style.display = 'none'; // Fecha o modal
            loadRecipes(); // Recarrega a lista de receitas
        })
        .catch(error => {
            console.error('Error adding recipe:', error);
            alert('Error adding recipe: ' + error.message);
        });
    });
});

document.addEventListener('DOMContentLoaded', getLoggedInUser);


document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();
    displayUserAndLogout();
    getLoggedInUser().then(user => {
        if (user) {
            console.log('User:', user);
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
    // Add Recipes Pop up
    const addModal = document.getElementById("add-recipe-modal");
    const updateModal = document.getElementById('update-recipe-modal');
    const openAddModalBtn = document.getElementById("open-modal-btn");
    const closeAddModalBtn = document.getElementById("close-modal-btn");
    const closeUpdateModalBtn = document.getElementById("close-update-modal-btn");

    // Abre o modal de adicionar
    openAddModalBtn.addEventListener("click", () => {
        addModal.style.display = "block";
    });

    // Fecha o modal de adicionar
    closeAddModalBtn.addEventListener("click", () => {
        addModal.style.display = "none";
    });


    // Fecha o modal de atualização
    closeUpdateModalBtn.addEventListener("click", () => {
        updateModal.style.display = "none";
    });

// Fecha os modals ao clicar fora do conteúdo
window.addEventListener("click", (event) => {
    if (event.target === addModal) {
        addModal.style.display = "none";
    } else if (event.target === updateModal) {
        updateModal.style.display = "none";
    }
});
});