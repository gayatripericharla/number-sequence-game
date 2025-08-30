// script.js
// --- Core Game Variables ---
let score = 0;
let level = 1;
let nextNumber = 1;
let totalNumbersInLevel = 0;
let gridCells = [];
let gridSize = 2;
let timerId;
let timerValue = 60;
let isGameInProgress = false;

const gameModes = {
    easy: { gridSize: 2, startingTime: 30 },
    medium: { gridSize: 3, startingTime: 40 },
    hard: { gridSize: 4, startingTime: 50 },
};

// --- DOM Elements ---
const homePage = document.getElementById('home-page');
const gamePage = document.getElementById('game-page');
const gameGrid = document.getElementById('game-grid');
const scoreDisplay = document.getElementById('scoreDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const messageDisplay = document.getElementById('messageDisplay');
const easyModeBtn = document.getElementById('easyModeBtn');
const mediumModeBtn = document.getElementById('mediumModeBtn');
const hardModeBtn = document.getElementById('hardModeBtn');
const homeBtn = document.getElementById('homeBtn');
const replayBtn = document.getElementById('replayBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');

// --- Event Listeners ---
window.onload = function() {
    showHomePage();
};

easyModeBtn.addEventListener('click', () => startNewGame('easy'));
mediumModeBtn.addEventListener('click', () => startNewGame('medium'));
hardModeBtn.addEventListener('click', () => startNewGame('hard'));
homeBtn.addEventListener('click', showHomePage);
replayBtn.addEventListener('click', replayGame);
nextLevelBtn.addEventListener('click', nextLevel);

// --- Game Functions ---

/**
 * Shows the home screen and hides the game screen.
 */
function showHomePage() {
    clearInterval(timerId);
    homePage.classList.remove('hidden');
    gamePage.classList.add('hidden');
}

/**
 * Shows the game screen and hides the home screen.
 */
function showGamePage() {
    homePage.classList.add('hidden');
    gamePage.classList.remove('hidden');
}

/**
 * Starts a new game from the beginning, resetting all variables.
 * @param {string} mode The selected game mode.
 */
function startNewGame(mode) {
    score = 0;
    level = 1;
    gridSize = gameModes[mode].gridSize;
    timerValue = gameModes[mode].startingTime;
    isGameInProgress = true;
    updateUI();
    showGamePage();
    playLevel();
}

/**
 * Replays the current level.
 */
function replayGame() {
    clearInterval(timerId);
    playLevel();
}

/**
 * Advances to the next level.
 */
function nextLevel() {
    clearInterval(timerId);
    level++;
    gridSize++;
    updateUI();
    playLevel();
}

/**
 * Sets up and starts a new level.
 */
function playLevel() {
    replayBtn.classList.add('hidden');
    nextLevelBtn.classList.add('hidden');
    gameGrid.classList.remove('hidden');

    gameGrid.innerHTML = '';
    gridCells = [];
    nextNumber = 1;

    gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, minmax(0, 1fr))`;

    totalNumbersInLevel = gridSize * gridSize;
    const numbers = Array.from({ length: totalNumbersInLevel }, (_, i) => i + 1);
    shuffle(numbers);

    for (let i = 0; i < totalNumbersInLevel; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.textContent = numbers[i];
        cell.dataset.number = numbers[i];
        cell.addEventListener('click', handleCellClick);
        gameGrid.appendChild(cell);
        gridCells.push(cell);
    }

    // Calculate timer value based on the current level
    timerValue = calculateLevelTime(level);
    timerDisplay.textContent = timerValue;

    // Start the new timer
    clearInterval(timerId);
    timerId = setInterval(() => {
        timerValue--;
        timerDisplay.textContent = timerValue;
        if (timerValue <= 0) {
            gameOver();
        }
    }, 1000);

    messageDisplay.textContent = `Find the numbers...`;
}

/**
 * Calculates the total time for a given level.
 * @param {number} level The current game level.
 * @returns {number} The total time in seconds for the level.
 */
function calculateLevelTime(level) {
    switch (level) {
        case 1:
            return 30;
        case 2:
            return 30 + 5;
        case 3:
            return 30 + 5 + 7;
        default:
            return 30 + 5 + 7 + ((level - 3) * 10);
    }
}

/**
 * Handles the player's click on a grid cell.
 * @param {Event} event The click event object.
 */
function handleCellClick(event) {
    const clickedNumber = parseInt(event.target.dataset.number);
    const clickedCell = event.target;

    if (clickedNumber === nextNumber) {
        clickedCell.classList.add('correct');
        clickedCell.classList.remove('wrong');
        clickedCell.style.pointerEvents = 'none';

        nextNumber++;
        score += 10;
        updateUI();

        if (nextNumber > totalNumbersInLevel) {
            clearInterval(timerId);
            messageDisplay.textContent = 'Correct! Level complete!';
            createConfetti();

            replayBtn.classList.remove('hidden');
            nextLevelBtn.classList.remove('hidden');
        } else {
            messageDisplay.textContent = `Find the next number: ${nextNumber}`;
        }
    } else {
        score = Math.max(0, score - 5);
        updateUI();
        messageDisplay.textContent = `Wrong number! Find ${nextNumber}`;

        clickedCell.classList.add('wrong', 'flash-red');
        setTimeout(() => {
            clickedCell.classList.remove('wrong', 'flash-red');
        }, 500);
    }
}

/**
 * Ends the game when the timer runs out.
 */
function gameOver() {
    clearInterval(timerId);
    gameGrid.classList.add('hidden');
    messageDisplay.textContent = `Time's up! Game Over. Final Score: ${score}`;
    isGameInProgress = false;

    replayBtn.classList.add('hidden');
    nextLevelBtn.classList.add('hidden');
    showHomePage();
}

/**
 * Updates the score and level displays.
 */
function updateUI() {
    scoreDisplay.textContent = score;
    levelDisplay.textContent = `Level: ${level}`;
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array} array The array to shuffle.
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Creates a confetti particle effect.
 */
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        const startX = Math.random() * window.innerWidth;
        const startY = -10;
        confetti.style.left = `${startX}px`;
        confetti.style.top = `${startY}px`;
        const color = ['#ff6347', '#ffd700', '#3cb371', '#6495ed'][Math.floor(Math.random() * 4)];
        confetti.style.backgroundColor = color;
        confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
}
