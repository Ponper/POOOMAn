const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const passport = require('passport');
const path = require('path');

// Configuração da conexão com o banco de dados
const dbConfig = require('./connection-options.json');
const db = mysql.createConnection(dbConfig);

const multer = require('multer');
// Conecte-se ao banco de dados
// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// Serve the index.html file
router.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// API route to get recipes
router.get('/api/recipes', (req, res) => {
    db.query('SELECT * FROM receita', (err, results) => {
        if (err) {
            console.error('Error fetching recipes:', err);
            res.status(500).send('Error fetching recipes');
            return;
        }
        res.json(results);
    });
});

// API route to get a single recipe by ID
router.get('/api/recipes/:id', (req, res) => {
    const recipeId = req.params.id;
    db.query('SELECT * FROM receita WHERE id_receita = ?', [recipeId], (err, results) => {
        if (err) {
            console.error('Error fetching recipe:', err);
            res.status(500).send('Error fetching recipe');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Recipe not found');
            return;
        }
        res.json(results[0]);
    });
});

// Rota para adicionar uma nova receita com imagem
router.post('/api/recipes', upload.single('imagem'), (req, res) => {
    const { autor, descricao, dificuldade, categoria, tempo, custo, titulo } = req.body;
    const imagem = req.file ? `/uploads/${req.file.filename}` : null;
    const query = 'INSERT INTO receita (autor, descricao, dificuldade, categoria, tempo, custo, titulo, imagem) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [autor, descricao, dificuldade, categoria, tempo, custo, titulo, imagem], (err, results) => {
        if (err) {
            console.error('Error adding recipe:', err);
            return res.status(500).json({ error: 'Error adding recipe' });
        }
        res.status(201).json({ message: 'Recipe added successfully' });
    });
});

// API route to update a recipe by ID
router.put('/api/recipes/:id', upload.single('imagem'), (req, res) => {
    const recipeId = req.params.id;
    const { autor, descricao, dificuldade, categoria, tempo, custo, titulo } = req.body;
    const imagem = req.file ? `/uploads/${req.file.filename}` : null;

    console.log('Received Data for Update:', req.body); // Log the received data

    let query;
    let queryParams;

    if (imagem) {
        query = 'UPDATE receita SET autor = ?, descricao = ?, dificuldade = ?, categoria = ?, tempo = ?, custo = ?, titulo = ?, imagem = ? WHERE id_receita = ?';
        queryParams = [autor, descricao, dificuldade, categoria, tempo, custo, titulo, imagem, recipeId];
    } else {
        query = 'UPDATE receita SET autor = ?, descricao = ?, dificuldade = ?, categoria = ?, tempo = ?, custo = ?, titulo = ? WHERE id_receita = ?';
        queryParams = [autor, descricao, dificuldade, categoria, tempo, custo, titulo, recipeId];
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error updating recipe:', err);
            res.status(500).send('Error updating recipe');
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).send('Recipe not found');
            return;
        }
        res.status(200).json({ message: 'Recipe updated successfully' });
    });
});

// API route to delete a recipe by ID
router.delete('/api/recipes/:id', (req, res) => {
    const recipeId = req.params.id;
    db.query('DELETE FROM receita WHERE id_receita = ?', [recipeId], (err, results) => {
        if (err) {
            console.error('Error deleting recipe:', err);
            res.status(500).send('Error deleting recipe');
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).send('Recipe not found');
            return;
        }
        res.status(200).json({ message: 'Recipe deleted successfully' });
    });
});

// API route for authentication
router.post('/api/auth', passport.authenticate('local'), (req, res) => {
    res.redirect('/'); // Redireciona para a página principal após login bem-sucedido
});

// API route for logout
router.post('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.status(200).send('Logged out successfully');
    });
});

// API route to register a new user
router.post('/api/register', upload.single('imagem'), (req, res) => {
    const { utilizador, password } = req.body;
    const imagem = req.file ? `/uploads/${req.file.filename}` : null;
    const isadmin = false; // Define o valor padrão como false

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }
        const query = 'INSERT INTO utilizador (utilizador, password, imagem, isadmin) VALUES (?, ?, ?, ?)';
        db.query(query, [utilizador, hash, imagem, isadmin], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error registering user' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});
// Rota para obter o nome do utilizador através do valor do autor
router.get('/api/autor/:autor', (req, res) => {
    const autorId = req.params.autor;
    const query = `
        SELECT utilizador.utilizador
        FROM utilizador
        JOIN receita ON utilizador.id_utilizador = receita.autor
        WHERE receita.autor = ?
    `;
    db.query(query, [autorId], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.status(500).send('Error fetching user');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('User not found');
            return;
        }
        res.json(results[0]);
    });
});
router.get('/api/current_user', (req, res) => {
  if (req.isAuthenticated()) {
      res.json(req.user);
  } else {
      res.status(401).send('Not authenticated');
  }
});
// Rota para pesquisar uma receita pelo título
router.get('/api/recipes/search/:titulo', (req, res) => {
    const titulo = req.params.titulo;
    if (!titulo) {
        return res.status(400).json({ error: 'Title query parameter is required' });
    }

    const query = 'SELECT * FROM receita WHERE titulo LIKE ?';
    db.query(query, [`%${titulo}%`], (err, results) => {
        if (err) {
            console.error('Error searching for recipe:', err);
            return res.status(500).json({ error: 'Error searching for recipe' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(results);
    });
});
// Rota para autenticação com Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

// Rota de callback após autenticação com Google
router.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) {
            console.error('Error during Google authentication:', err);
            return next(err);
        }
        if (!user) {
            console.log('No user found during Google authentication');
            return res.redirect('/auth/google/failure');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Error logging in user:', err);
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

// Rota de falha na autenticação com Google
router.get('/auth/google/failure', (req, res) => {
    console.log('Google authentication failed');
    res.send("Erro ao fazer login");
});
module.exports = router;