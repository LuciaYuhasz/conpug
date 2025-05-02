
const express = require('express');
const path = require('path');
const gameRoutes = require('../gameRoutes');
const { getRankingPage } = require('../rankingController');

const app = express();

// Configuración motor de plantillas Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views')); // Carpeta de vistas

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, '../public')));

//app.use(express.static(path.join(__dirname, '../public')));

// Rutas API
app.use('/api', gameRoutes);
app.get('/ranking', getRankingPage);
app.get('/', (req, res) => {
    res.render('index');
});

// Exportar la app para que Vercel la trate como una función serverless
module.exports = app;





/* - app.js
- rankingController.js
-views/
   ---index.pug
   ---ranking.pug
   ---layuot.pug
- public/
   ---styles.css
   ---game.js

- gamesroutes.js
- data/
    ---ranking.json
    */

// netstat -ano | findstr :3001
// taskkill /PID 8852 /F

///      netstat -ano | findstr :3000
////     taskkill /PID 8076 /F

//netlify