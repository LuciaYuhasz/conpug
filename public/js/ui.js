export const questionText = document.getElementById('questionText');
export const optionsList = document.getElementById('optionsList');
export const gameArea = document.getElementById('gameArea');
export const registerForm = document.getElementById('registerForm');
export const usernameInput = document.getElementById('username');
export const startGameButton = document.getElementById('startGameButton');
export const toggleMusicButton = document.getElementById('toggleMusicButton');

export const showFlagHintButton = document.getElementById('showFlagHintButton'); // Renombrado
export const hintContainer = document.getElementById('hintContainer');           // Renombrado

export function updateProgressBar(currentIndex) {
    const progress = (currentIndex / 10) * 100;
    document.getElementById("progressBar").style.width = `${progress}%`;
}

export function setupHintHandler(type, flag, question) {
    hintContainer.style.display = 'none';
    showFlagHintButton.style.display = 'inline-block';

    if (type !== 'flag' && flag) {
        hintContainer.style.display = 'block';
        showFlagHintButton.onclick = () => {
            questionText.innerHTML = `<img src="${flag}" alt="Bandera del país" class="flag-question-img"><br>${question}`;
            showFlagHintButton.style.display = 'none';
        };
    }
}

export function getCountryNameInSpanish(country) {
    return country.translations?.spa?.common || country.name.common;
}

