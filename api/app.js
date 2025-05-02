const express = require('express');
const path = require('path');

// ⛔ Estás en /api, debes subir un nivel para encontrar estos archivos:
const gameRoutes = require('../gameRoutes');
const { getRankingPage } = require('../rankingController');

const app = express();

// ✅ Ajustar rutas a 'views' y 'public':
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views')); // estaba mal: '/views' busca dentro de /api/views

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (como CSS, JS del cliente, etc.)
app.use(express.static(path.join(__dirname, '../public')));

// Rutas API y frontend
app.use('/api', gameRoutes);
app.get('/ranking', getRankingPage);
app.get('/', (req, res) => {
  res.render('index');
});

// Exportar la app para Vercel
module.exports = app;

// Ejecutar servidor localmente
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
}














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
// git commit -m "Adaptación para Vercel y correcciones en rutas"
//git commit -m "Adaptación Vercel "