const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const router = require('./routes');
require('dotenv').config();
// Importe a configuração da estratégia local do Passport
require('./public/script/local-strategy.js');
require('./public/script/google-strategy.js');
const app = express();
const port = 8081;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração da sessão
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

// Use the routes defined in routes.js
app.use('/', router);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});