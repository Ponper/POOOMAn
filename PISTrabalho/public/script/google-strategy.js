const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const dbConfig = require('../../connection-options.json');
const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
},
(accessToken, refreshToken, profile, done) => {
    const googleId = profile.id;
    const utilizador = profile.displayName;
    const imagem = profile.photos[0].value;

    const query = 'SELECT * FROM utilizador WHERE google_id = ?';
    db.query(query, [googleId], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return done(err);
        }
        if (results.length > 0) {
            // Atualizar a imagem do usuário existente
            const updateQuery = 'UPDATE utilizador SET imagem = ? WHERE google_id = ?';
            db.query(updateQuery, [imagem, googleId], (err) => {
                if (err) {
                    console.error('Error updating user image:', err);
                    return done(err);
                }
                console.log('User image updated successfully');
                // Retornar o usuário atualizado
                db.query(query, [googleId], (err, updatedResults) => {
                    if (err) {
                        console.error('Error querying the updated user:', err);
                        return done(err);
                    }
                    return done(null, updatedResults[0]);
                });
            });
        } else {
            // Gerar uma senha aleatória
            const randomPassword = Math.random().toString(36).slice(-8);
            
            // Hash da senha
            bcrypt.hash(randomPassword, 10, (err, hash) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    return done(err);
                }

                // Inserir novo usuário com imagem
                const insertQuery = 'INSERT INTO utilizador (google_id, utilizador, password, imagem) VALUES (?, ?, ?, ?)';
                db.query(insertQuery, [googleId, utilizador, hash, imagem], (err, results) => {
                    if (err) {
                        console.error('Error inserting new user:', err);
                        return done(err);
                    }
                    const newUser = {
                        id_utilizador: results.insertId,
                        google_id: googleId,
                        utilizador: utilizador,
                        imagem: imagem
                    };
                    console.log('New user inserted successfully:', newUser);
                    return done(null, newUser);
                });
            });
        }
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id_utilizador);
});

passport.deserializeUser((id, done) => {
    const query = 'SELECT * FROM utilizador WHERE id_utilizador = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deserializing user:', err);
            return done(err);
        }
        done(null, results[0]);
    });
});