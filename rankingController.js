
const fs = require('fs');
const path = require('path');
const rankingFilePath = path.join(__dirname, 'data', 'ranking.json');

// Detectar si estamos en producción
const isProd = process.env.NODE_ENV === 'production';

// Ranking en memoria (solo usado en producción)
let rankings = [];

if (!isProd) {
    // En desarrollo: leer ranking desde archivo al iniciar
    try {
        const data = fs.readFileSync(rankingFilePath, 'utf8');
        rankings = JSON.parse(data || '[]');
    } catch (error) {
        console.error("Error leyendo el ranking al iniciar:", error.message);
        rankings = [];
    }
}

const saveScore = async (username, score, correct, incorrect, totalTime, avgTimePerQuestion) => {
    try {
        const nuevaEntrada = { player: username, score, correct, incorrect, totalTime, avgTimePerQuestion };
        rankings.push(nuevaEntrada);

        // Ordenar: primero por score, luego por menor tiempo
        rankings.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.totalTime - b.totalTime;
        });

        // Limitar a top 20
        rankings = rankings.slice(0, 20);

        if (!isProd) {
            // En desarrollo: guardar en archivo
            await fs.promises.writeFile(rankingFilePath, JSON.stringify(rankings, null, 2), 'utf8');
        }

        // Buscar posición de esta entrada exacta
        const index = rankings.findIndex(entry =>
            entry.player === username &&
            entry.score === score &&
            entry.correct === correct &&
            entry.incorrect === incorrect &&
            entry.totalTime === totalTime
        );

        const position = index !== -1 ? index + 1 : null;

        return {
            message: "Puntaje guardado correctamente",
            position,
            included: position !== null
        };
    } catch (error) {
        console.error("Error guardando el ranking:", error.message);
        throw new Error(`Error al guardar el ranking:  ${error.message}`);
    }
};


// Leer datos
const readRankingData = async () => {
    if (isProd) {
        return rankings;
    }

    try {
        const data = await fs.promises.readFile(rankingFilePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error("Error leyendo el ranking:", error.message);
        throw error;
    }
};

// Devolver ranking por API
const getRanking = async (req, res) => {
    try {
        const data = await readRankingData();

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "⚠️ No hay datos de ranking disponibles." });
        }

        res.json(data);
    } catch (error) {
        console.error("Error al leer el ranking:", error.message);
        res.status(500).json({ error: `Error al obtener el ranking: ${error.message}` });
    }
};

const getRankingPage = async (req, res) => {
    try {
        const rankingData = await readRankingData();
        res.render('ranking', { ranking: rankingData });
    } catch (error) {
        console.error("Error al obtener el ranking:", error);
        res.render('ranking', { ranking: [] });
    }
};

module.exports = { saveScore, getRanking, readRankingData, getRankingPage };
