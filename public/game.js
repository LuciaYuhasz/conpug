
// Definición de sonidos para efectos de juego
const keypressSound = new Audio('sounds/tipeo.mp3');
const buttonClickSound = new Audio('sounds/chalentacept.mp3');
const correctSound = new Audio('sounds/correcto.mp3');
const incorrectSound = new Audio('sounds/incorrecto.mp3');
const backgroundMusic = new Audio('sounds/fondoJuego.mp3'); // Música de fondo 

backgroundMusic.loop = true; // Reproducir música en bucle
backgroundMusic.volume = 0.5;
let isMusicMuted = false; // Estado de silenciamiento de la música
const toggleMusicButton = document.getElementById('toggleMusicButton');
const musicControl = document.getElementById('musicControl'); // Contenedor del control de música

// Variables de juego y estado
let gameTimerInterval; // Intervalo del reloj
let countries = [];
let usedCountries = [];
let currentQuestionIndex = 0; // Índice de la pregunta actual
let correct = 0; // Contador de respuestas correctas
let incorrect = 0; // Contador de respuestas incorrectas
let score = 0; // Puntaje total del juego
let startTime;
let username = '';

// Elementos del DOM
const questionText = document.getElementById('questionText');
const optionsList = document.getElementById('optionsList');
const registerForm = document.getElementById('registerForm');
const gameArea = document.getElementById('gameArea');
const startGameButton = document.getElementById('startGameButton');
const usernameInput = document.getElementById('username');

// Evento al escribir en el campo de nombre de usuario
usernameInput.addEventListener('input', () => {
    // Reproducir sonido de tipeo
    keypressSound.pause();
    keypressSound.volume = 0.2;
    keypressSound.currentTime = 0;
    keypressSound.play();
});

//FUNCION DE COMIENZO/REINICIO PARTIDO 
function startGame() {
    console.log("startGame() ejecutado");

    buttonClickSound.pause();
    buttonClickSound.currentTime = 0;
    buttonClickSound.play();

    username = usernameInput.value.trim();// trim para eliminar espacios en blanco
    if (!username) return alert('Ingresa tu nombre.');

    // Reproduce la música al iniciar el juego, si no está silenciada
    if (!isMusicMuted) {
        backgroundMusic.play();
        musicControl.style.display = 'block';
    }

    // Reinicia el juego
    currentQuestionIndex = 0;
    correct = 0;
    incorrect = 0;
    score = 0;
    usedCountries = [];
    startTime = Date.now();

    const gameTimerElement = document.getElementById('gameTimer');
    clearInterval(gameTimerInterval); // Por si estaba corriendo de antes
    gameTimerElement.textContent = "⏱️ Tiempo: 0.00 s";

    gameTimerInterval = setInterval(() => {
        const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
        gameTimerElement.textContent = `⏱️ Tiempo: ${elapsedSeconds} s`;
    }, 100);


    // Limpia la interfaz
    optionsList.innerHTML = "";
    questionText.textContent = "";
    document.getElementById("progressBar").style.width = "0%";

    // Oculta el formulario de registro y el modal final
    registerForm.style.display = 'none';
    document.getElementById('gameResultModal').style.display = "none";

    // Verifica si `gameArea` existe antes de cambiar su estilo
    if (gameArea) {
        console.log("gameArea encontrado, cambiando display a block...");
        gameArea.style.display = "block";
    } else {
        console.error("Error: gameArea no encontrado en el DOM.");
    }

    // Intenta generar la primera pregunta
    loadCountries().then(() => {
        console.log("Datos de países cargados, generando primera pregunta...");
        generateQuestion();
    }).catch(err => {
        console.error("Error al cargar países:", err);
    });
}


// Asignacion la función 'startGame' al botón de inicio
startGameButton.addEventListener('click', startGame);

// También al botón "Jugar de nuevo"
document.getElementById('closeResultModalButton').addEventListener('click', startGame);



// Evento para silenciar o reanudar la música de fondo
toggleMusicButton.addEventListener('click', () => {
    isMusicMuted = !isMusicMuted;
    if (isMusicMuted) {
        backgroundMusic.pause();
        toggleMusicButton.innerHTML = '<i class="bi bi-volume-mute"></i> Reanudar Música';
        toggleMusicButton.classList.add('muted'); // Cambia el estilo

        toggleMusicButton.style.backgroundColor = "#f44336";
    } else {
        backgroundMusic.play();
        toggleMusicButton.innerHTML = '<i class="bi bi-volume-up"></i> Silenciar Música';
        toggleMusicButton.classList.remove('muted'); // Vuelve al estilo original

        toggleMusicButton.style.backgroundColor = "#4CAF50";
        console.log("Clase muted eliminada:", toggleMusicButton.classList.contains('muted'))
    }
    localStorage.setItem('isMusicMuted', isMusicMuted);
});

// FUNCION ASINCRONA PARA CARGAR PAISES EN LA API 
async function loadCountries() {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.style.display = 'none'; // Oculta errores anteriores
    errorContainer.textContent = '';
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        // Validar estado de respuesta HTTP
        if (!response.ok) {
            throw new Error(`Error al obtener países: ${response.status} ${response.statusText}`);
        }
        countries = await response.json();
    } catch (error) {

        console.error(error);
        errorContainer.textContent = `⚠️ ${error.message}`;
        errorContainer.style.display = 'block'; // Muestra el error en pantalla
    }
}

// Función para actualizar la barra de progreso del juego
function updateProgressBar() {
    const progress = (currentQuestionIndex / 3) * 100;
    document.getElementById("progressBar").style.width = `${progress}%`;// se  ajusta el ancho segun el valor de progrees, que representa el porsentaje 
}


// Función para generar y mostrar una pregunta aleatoria
function generateQuestion() {
    if (currentQuestionIndex >= 3) {
        return endGame(); // Finaliza juego si se mostraron todas las preguntas
    }

    let country;
    do {
        country = countries[Math.floor(Math.random() * countries.length)];
    } while (usedCountries.includes(country.name.common));

    usedCountries.push(country.name.common); // Agregar país usado al array

    // Definir tipos de preguntas disponibles
    const types = ['capital', 'flag', 'borders'];
    const type = types[Math.floor(Math.random() * types.length)]; // Seleccionar tipo de pregunta aleatoriamente

    let question = '';
    let correctAnswer = '';
    let options = [];

    switch (type) {
        case 'capital':
            if (!country.capital) return generateQuestion(); // Evitar preguntas sin capital definida
            question = `¿${country.capital[0]} , es la capital de qué país?`;
            //correctAnswer = country.name.common;
            correctAnswer = country.translations?.spa?.common || country.name.common;

            options = generateOptions(correctAnswer); // Generar opciones de respuesta
            break;
        case 'flag':
            if (!country.flags || !country.flags.png) return generateQuestion(); // Evitar países sin bandera
            question = `¿Qué país está representado por esta bandera?`;
            //correctAnswer = country.name.common;
            correctAnswer = country.translations?.spa?.common || country.name.common;


            options = generateOptions(correctAnswer); // Generar opciones de respuesta
            break;
        case 'borders':
            question = `¿Cuántos países limítrofes tiene ${country.name.common}?`;
            correctAnswer = country.borders ? country.borders.length : 0; // Obtener número de países limítrofes
            options = generateNumericOptions(correctAnswer); // Generar opciones numéricas de respuesta
            break;
    }
    // Mostrar la pregunta y opciones en pantalla
    displayQuestion({ question, type, correctAnswer, options, flag: country.flags?.png });
}


// Función para mostrar la pregunta y opciones en pantalla
function displayQuestion({ question, options, correctAnswer, type, flag }) {
    const questionModal = document.getElementById('questionResultModal');
    const modalMessageQuestion = document.getElementById('modalMessageQuestion');

    // Mostrar pregunta con la bandera si está disponible
    questionText.innerHTML = (type === 'flag' && flag)
        ? `<img src="${flag}" alt="Bandera" class="flag-question-img"><br>${question}`
        : question;


    const hintContainer = document.getElementById('hintContainer');
    const showFlagHintButton = document.getElementById('showFlagHintButton');
    const flagHint = document.getElementById('flagHint');

    // Ocultar pista por defecto
    hintContainer.style.display = 'none';
    //flagHint.innerHTML = '';
    showFlagHintButton.style.display = 'inline-block'; // Asegura que vuelva a aparecer el botón


    // Mostrar botón de pista si no es pregunta de bandera
    if (type !== 'flag' && flag) {
        hintContainer.style.display = 'block';

        showFlagHintButton.onclick = () => {
            questionText.innerHTML = `<img src="${flag}" alt="Bandera del país" class="flag-question-img"><br>${question}`;
            showFlagHintButton.style.display = 'none';
        };
    }

    optionsList.innerHTML = ''; // Limpiar lista de opciones

    // Mostrar cada opción como elemento de lista
    options.forEach((option, index) => {
        const li = document.createElement('li');
        li.textContent = option;
        li.classList.add('list-group-item'); // Estilo básico con animaciones
        li.style.animationDelay = `${index * 0.2}s`; // Retraso dinámico para cada opción

        li.onclick = () => {
            const allOptions = document.querySelectorAll('#optionsList li');
            allOptions.forEach(opt => opt.onclick = null); // Deshabilitar clic en opciones

            const isCorrect = option.toString().toLowerCase() === correctAnswer.toString().toLowerCase();

            if (isCorrect) {
                li.classList.add('correct-answer'); // Estilo para respuesta correcta
                correctSound.pause();
                correctSound.currentTime = 0;
                correctSound.play(); // Reproducir sonido de respuesta correcta
                score += type === 'flag' ? 5 : 3; // Aumentar puntaje según tipo de pregunta
                correct++;
                modalMessageQuestion.textContent = "✅ ¡Correcto!";
            } else {
                li.classList.add('incorrect-answer'); // Estilo para respuesta incorrecta
                incorrectSound.pause();
                incorrectSound.currentTime = 0;
                incorrectSound.play(); // Reproducir sonido de respuesta incorrecta
                incorrect++;
                modalMessageQuestion.textContent = `❌ Incorrecto. La respuesta era: ${correctAnswer}`;
            }

            questionModal.style.display = "flex"; // Mostrar modal de resultado

            // Cerrar modal y avanzar a la siguiente pregunta
            document.getElementById('closeQuestionModalButton').onclick = () => {
                questionModal.style.display = "none";
                currentQuestionIndex++;
                updateProgressBar();
                generateQuestion();
            };
        };

        setTimeout(() => {
            li.style.opacity = 1; // Hacer visible la opción con animación
            li.style.transform = 'translateY(0)'; // Posición final
        }, index * 200); // Retraso por índice

        optionsList.appendChild(li); // Agregar opción a la lista
    });
}

// Función para generar opciones de respuesta
function generateOptions(correctAnswer) {
    const options = new Set();
    options.add(correctAnswer);

    while (options.size < 4) {
        const random = countries[Math.floor(Math.random() * countries.length)];
        //options.add(random.name.common);
        const nameInSpanish = random.translations?.spa?.common || random.name.common;
        options.add(nameInSpanish);
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
}

function generateNumericOptions(correctAnswer) {
    const options = new Set();
    options.add(correctAnswer);

    while (options.size < 4) {
        options.add(Math.floor(Math.random() * 10));
    }

    return Array.from(options).sort((a, b) => a - b);
}



function endGame() {
    clearInterval(gameTimerInterval); // Detener el cronómetro 
    const totalTime = (Date.now() - startTime) / 1000; // Calcula el tiempo total jugado
    const avgTimePerQuestion = (totalTime / 3).toFixed(3); // Calcula el tiempo promedio por pregunta

    // Verificar y actualizar récord
    const previousHighScore = localStorage.getItem(`highScore_${username}`);
    const currentScore = score;



    let recordMessage = "";

    if (previousHighScore !== null && currentScore > Number(previousHighScore)) {
        localStorage.setItem(`highScore_${username}`, currentScore);
        recordMessage = `🎉 <strong>¡Nuevo récord, ${username}!</strong> Tu nuevo puntaje es <strong>${currentScore}</strong>.`;
    } else if (previousHighScore === null) {
        localStorage.setItem(`highScore_${username}`, currentScore);
        recordMessage = `🎯 <strong>Primer intento, ${username}!</strong> Este es tu puntaje: <strong>${currentScore}</strong>.`;
    } else {
        recordMessage = `✅ Tu puntaje fue <strong>${currentScore}</strong>. Tu récord actual es <strong>${previousHighScore}</strong>.`;
    }

    fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score, correct, incorrect, totalTime, avgTimePerQuestion })
    })
        .then(res => res.json())
        .then(data => {
            localStorage.removeItem('ranking');
            // Obtener los elementos del modal
            const gameModal = document.getElementById('gameResultModal');
            const modalMessage = document.getElementById('modalMessage');
            const modalDetails = document.getElementById('modalDetails');
            const modalRanking = document.getElementById('modalRanking');

            // Rellena el mensaje del modal con los resultados
            modalMessage.innerHTML = `<strong> Tu resultado :</strong>`;
            modalDetails.innerHTML = `
                <p>Puntaje: <strong>${score}</strong></p>
                <p>Correctas: <strong>${correct}</strong></p>
                <p>Incorrectas: <strong>${incorrect}</strong></p>
                <p>Tiempo total: <strong>${totalTime.toFixed(3)} segundos</strong></p>
                <p>Tiempo promedio por pregunta: <strong>${avgTimePerQuestion} segundos</strong></p>
                
            `;
            // Mensaje de ranking 
            if (data.position !== null) {
                modalRanking.textContent = `🔥🔥¡LLEGASTE AL PUESTO ${data.position}, FELICITACIONES!!🔥🔥`;
            } else {
                modalRanking.textContent = ` Todavía no estás en la cima, pero cada intento te acerca más 🔝`;
            }

            // Mostrar el modal
            gameModal.style.display = "flex";

            // Asignar evento al botón "Jugar de nuevo"
            document.getElementById('closeResultModalButton').onclick = startGame;
        })
        .catch(err => {
            console.error("Error al guardar el resultado:", err);
            alert("Ocurrió un error al guardar el puntaje.");
        });
}

document.getElementById('viewRankingButton').onclick = () => {
    window.location.href = "/ranking"; // Redirige a la nueva página de ranking
};

document.getElementById('viewRankingButtonFinal').onclick = () => {
    window.location.href = "/ranking";
};
