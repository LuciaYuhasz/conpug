//app.js
const express = require('express');
const path = require('path');
const gameRoutes = require('./gameRoutes');
const { getRankingPage } = require('./rankingController');


const app = express();
//const PORT = process.env.PORT || 3000;


// Configuracion motor de plantillas Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Carpeta de vistas


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// Rutas
app.use('/api', gameRoutes);
// Ruta principal


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/ranking', getRankingPage);
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
}

module.exports = app;

//module.exports = app;
// Iniciar servidor
//app.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));



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