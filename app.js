const express = require('express')
const mongoose = require('mongoose');

const app = express();

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const path = require('path');

// pour sécuriser la base de donnée
const env = require('./env.json')

mongoose.connect(env.URL_BDD)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(error => console.error('Connexion à MongoDB échouée :', error));



app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;