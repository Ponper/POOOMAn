const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Configuração da conexão com o banco de dados
const dbConfig = require('../../connection-options.json');
const db = mysql.createConnection(dbConfig);

// Conecte-se ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
});

passport.use(new LocalStrategy((utilizador, password, done) => {
    const query = 'SELECT * FROM utilizador WHERE utilizador = ?';
    db.query(query, [utilizador], (err, results) => {
        if (err) {
            return done(err);
        }
        if (results.length === 0) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        const user = results[0];
        // Verifique a senha usando bcrypt
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return done(err);
            }
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id_utilizador);
});

passport.deserializeUser((id, done) => {
    const query = 'SELECT * FROM utilizador WHERE id_utilizador = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return done(err);
        }
        if (results.length === 0) {
            return done(null, false);
        }
        const user = results[0];
        done(null, user);
    });
});