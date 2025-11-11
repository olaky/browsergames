// Game state variables
let gameState = {
    coins: 0,
    streak: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    selectedHouse: null,
    currentLevel: 1,
    currentQuestion: {
        num1: 0,
        num2: 0,
        operator: '+',
        correctAnswer: 0
    },
    isProcessingAnswer: false, // Flag to prevent multiple submissions
    timer: {
        timeLeft: 5, // Will be updated based on level
        maxTime: 5,  // Will be updated based on level
        intervalId: null,
        isRunning: false
    }
};

// Level configuration
const levels = {
    1: {
        name: "Zauber-Novize",
        maxNumber: 10,
        streakRequired: 5,
        description: "Beginne Deine magische Mathematikreise!"
    },
    2: {
        name: "Mathe-Lehrling", 
        maxNumber: 25,
        streakRequired: 10,
        description: "Du meisterst die Grundlagen!"
    },
    3: {
        name: "Zahlen-Zauberer",
        maxNumber: 50, 
        streakRequired: 15,
        description: "Deine Rechenkünste werden stärker!"
    },
    4: {
        name: "Rechen-Meister",
        maxNumber: 100,
        streakRequired: 25,
        description: "Du beherrschst alle vier Grundrechenarten!"
    },
    5: {
        name: "Mathe-Magier",
        maxNumber: 200,
        streakRequired: 35,
        description: "Höchste mathematische Macht erreicht!"
    }
};

// DOM elements
const elements = {
    houseSelectionScreen: document.getElementById('house-selection-screen'),
    mainGame: document.getElementById('main-game'),
    houseDisplay: document.getElementById('house-display'),
    levelDisplay: document.getElementById('level-display'),
    coins: document.getElementById('coins'),
    streak: document.getElementById('streak'),
    totalQuestions: document.getElementById('total-questions'),
    correctAnswers: document.getElementById('correct-answers'),
    num1: document.getElementById('num1'),
    operator: document.getElementById('operator'),
    num2: document.getElementById('num2'),
    answerInput: document.getElementById('answer-input'),
    feedback: document.getElementById('feedback'),
    submitBtn: document.getElementById('submit-btn'),
    timer: document.getElementById('timer'),
    timerProgress: document.getElementById('timer-progress')
};

// House data with emojis and information
const houses = {
    gryffindor: {
        name: 'Gryffindor',
        emoji: '🦁',
        trait: 'Mutig & Kühn',
        colors: ['#ae0001', '#eeba30']
    },
    hufflepuff: {
        name: 'Hufflepuff', 
        emoji: '🦡',
        trait: 'Loyal & Gütig',
        colors: ['#ecb939', '#372e29']
    },
    ravenclaw: {
        name: 'Ravenclaw',
        emoji: '🦅', 
        trait: 'Weise & Geistreich',
        colors: ['#222f5b', '#5d5d5d']
    },
    slytherin: {
        name: 'Slytherin',
        emoji: '🐍',
        trait: 'Gerissen & Ehrgeizig', 
        colors: ['#1a472a', '#5d5d5d']
    }
};

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if a house was previously selected
    const savedHouse = localStorage.getItem('selectedHouse');
    if (savedHouse && houses[savedHouse]) {
        gameState.selectedHouse = savedHouse;
        showMainGame();
    }
    
    initializeGameElements();
});

// Initialize game elements and event listeners
function initializeGameElements() {
    generateNewQuestion();
    updateDisplay();
    
    // Remove existing event listeners to prevent duplicates
    if (elements.answerInput && elements.answerInput.enterKeyHandler) {
        elements.answerInput.removeEventListener('keypress', elements.answerInput.enterKeyHandler);
    }
    
    // Add Enter key support for the input field
    if (elements.answerInput) {
        elements.answerInput.enterKeyHandler = function(event) {
            if (event.key === 'Enter') {
                checkAnswer();
            }
        };
        elements.answerInput.addEventListener('keypress', elements.answerInput.enterKeyHandler);
    }
}

// House selection functions
function selectHouse(houseKey) {
    if (!houses[houseKey]) return;
    
    gameState.selectedHouse = houseKey;
    localStorage.setItem('selectedHouse', houseKey);
    
    // Add transition effect
    elements.houseSelectionScreen.classList.add('screen-transition');
    
    setTimeout(() => {
        showMainGame();
    }, 500);
}

function showMainGame() {
    // Hide house selection screen
    elements.houseSelectionScreen.style.display = 'none';
    
    // Show main game
    elements.mainGame.style.display = 'block';
    
    // Apply house theme
    applyHouseTheme();
    
    // Initialize or re-initialize game elements
    initializeGameElements();
    
    // Focus on input field
    setTimeout(() => {
        if (elements.answerInput) {
            elements.answerInput.focus();
        }
    }, 100);
}

function applyHouseTheme() {
    if (!gameState.selectedHouse || !houses[gameState.selectedHouse]) return;
    
    const house = houses[gameState.selectedHouse];
    
    // Apply house class to body for background
    document.body.className = gameState.selectedHouse;
    
    // Update house display
    if (elements.houseDisplay) {
        elements.houseDisplay.innerHTML = `
            <span class="house-crest">${house.emoji}</span>
            <span>${house.name}</span>
        `;
    }
}

function changeHouse() {
    // Show house selection screen
    elements.houseSelectionScreen.style.display = 'flex';
    
    // Hide main game
    elements.mainGame.style.display = 'none';
    
    // Clear saved house
    localStorage.removeItem('selectedHouse');
    gameState.selectedHouse = null;
    
    // Remove house theme
    document.body.className = '';
}

// Generate a new random math question based on current level
function generateNewQuestion() {
    const currentLevel = levels[gameState.currentLevel];
    const maxNumber = currentLevel.maxNumber;
    
    // Available operations
    const operations = ['+', '-', '×', '÷'];
    const operatorSymbols = {
        '+': '+',
        '-': '−',
        '×': '×', 
        '÷': '÷'
    };

    let operator = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer, maxNumberHalf;

    switch (operator) {
        case '+':
            maxNumberHalf = Math.floor(maxNumber / 2);
            answer = maxNumberHalf + Math.floor(Math.random() * maxNumberHalf);
            num1 = Math.floor(Math.random() * (answer - 1));
            num2 = answer - num1;
            break;
    
        case '-':
            maxNumberHalf = Math.floor(maxNumber / 2);
            num1 = maxNumberHalf + Math.floor(Math.random() * maxNumberHalf);
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
            break;

        case '×':
            num1 = Math.floor(Math.random() * maxNumber) + 1;
            num2 = Math.floor(Math.random() * maxNumber) + 1;
            answer = num1 * num2;
            break;
    
        case '÷':
            num2 = Math.floor(Math.random() * maxNumber) + 1;
            answer = Math.floor(Math.random() * maxNumber) + 1;
            num1 = num2 * answer;
            break;
    }

    // Store the question
    gameState.currentQuestion.num1 = num1;
    gameState.currentQuestion.num2 = num2;
    gameState.currentQuestion.operator = operator;
    gameState.currentQuestion.correctAnswer = answer;
    
    // Update display
    if (elements.num1 && elements.num2 && elements.operator) {
        elements.num1.textContent = gameState.currentQuestion.num1;
        elements.num2.textContent = gameState.currentQuestion.num2;
        elements.operator.textContent = operatorSymbols[operator];
    }
    
    // Clear previous answer and feedback
    if (elements.answerInput) {
        elements.answerInput.value = '';
        elements.answerInput.max = maxNumber * 2; // Update input max for better UX
    }
    if (elements.feedback) {
        elements.feedback.textContent = '';
        elements.feedback.className = 'feedback';
    }
    
    // Focus on input field
    if (elements.answerInput) {
        elements.answerInput.focus();
    }
    
    // Start the timer for the new question
    startTimer();
}

// Check if the user's answer is correct
function checkAnswer() {
    // Prevent multiple submissions of the same answer
    if (gameState.isProcessingAnswer) {
        return;
    }
    
    const userAnswer = parseInt(elements.answerInput.value);
    
    // Validate input
    if (isNaN(userAnswer) || elements.answerInput.value.trim() === '') {
        showFeedback('Bitte gib eine Zahl ein!', 'incorrect');
        return;
    }
    
    // Stop the timer when answer is submitted
    stopTimer();
    
    // Set flag to prevent duplicate processing
    gameState.isProcessingAnswer = true;
    
    gameState.totalQuestions++;
    
    if (userAnswer === gameState.currentQuestion.correctAnswer) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer(userAnswer);
    }
    
    updateDisplay();
    
    // Generate new question after a delay
    setTimeout(() => {
        generateNewQuestion();
        // Reset the processing flag after generating new question
        gameState.isProcessingAnswer = false;
    }, 1000);
}

// Handle correct answer logic
function handleCorrectAnswer() {
    gameState.correctAnswers++;
    gameState.streak++;
    
    // Calculate coins earned (base 1 + streak bonus)
    let coinsEarned = 1;
    let streakBonus = 0;
    
    // Streak bonus system
    if (gameState.streak >= 3) {
        streakBonus = Math.floor(gameState.streak / 3);
        coinsEarned += streakBonus;
    }
    
    gameState.coins += coinsEarned;
    
    // Check for level progression
    const leveledUp = checkLevelProgression();
    
    // Show appropriate feedback
    let feedbackMessage = '🎉 Richtig!';
    if (streakBonus > 0) {
        const coinText = coinsEarned === 1 ? 'Münze' : 'Münzen';
        feedbackMessage += ` +${coinsEarned} ${coinText} (${streakBonus} Serien-Bonus!)`;
    } else {
        const coinText = coinsEarned === 1 ? 'Münze' : 'Münzen';
        feedbackMessage += ` +${coinsEarned} ${coinText}`;
    }
    
    if (leveledUp) {
        const currentLevel = levels[gameState.currentLevel];
        feedbackMessage = `🌟 LEVEL AUFSTIEG! 🌟 ${currentLevel.name}! ${feedbackMessage}`;
    } else if (gameState.streak >= 5) {
        feedbackMessage += ' 🔥 Fantastische Serie!';
    } else if (gameState.streak >= 3) {
        feedbackMessage += ' 🔥 Großartige Serie!';
    }
    
    showFeedback(feedbackMessage, leveledUp ? 'level-up' : 'correct');
    
    // Add visual celebration for milestones
    if (gameState.streak === 5 || gameState.streak === 10 || gameState.streak % 15 === 0) {
        celebrateStreak();
    }
    
    // Additional celebration for level ups
    if (leveledUp) {
        celebrateLevelUp();
    }
}

// Handle incorrect answer logic
function handleIncorrectAnswer(userAnswer) {
    // Lose 1 coin (but don't go below 0)
    if (gameState.coins > 0) {
        gameState.coins--;
    }
    
    // Reset streak
    gameState.streak = 0;
    
    // Show feedback with correct answer
    const correctAnswer = gameState.currentQuestion.correctAnswer;
    const feedbackMessage = `❌ Nicht ganz! Die Antwort war ${correctAnswer}. ${gameState.coins > 0 ? '-1 Münze' : ''}`;
    
    showFeedback(feedbackMessage, 'incorrect');
}

// Check if the player should level up based on current streak
function checkLevelProgression() {
    // Find the highest level the player qualifies for
    let newLevel = gameState.currentLevel;
    
    for (let level = gameState.currentLevel + 1; level <= 5; level++) {
        if (gameState.streak >= levels[level].streakRequired) {
            newLevel = level;
        } else {
            break;
        }
    }
    
    // If we found a higher level, level up!
    if (newLevel > gameState.currentLevel) {
        gameState.currentLevel = newLevel;
        updateLevelDisplay();
        return true;
    }
    
    return false;
}

// Celebrate level up with special animation
function celebrateLevelUp() {
    const gameContainer = document.querySelector('.game-container');
    
    // Add special level-up animation class
    gameContainer.classList.add('level-up-celebration');
    
    // Remove animation after it completes
    setTimeout(() => {
        gameContainer.classList.remove('level-up-celebration');
    }, 1500);
}

// Update level display in the UI
function updateLevelDisplay() {
    if (elements.levelDisplay) {
        const currentLevel = levels[gameState.currentLevel];
        elements.levelDisplay.innerHTML = `
            <span class="level-number">Level ${gameState.currentLevel}</span>
            <span class="level-name">${currentLevel.name}</span>
            <span class="level-progress">Max. Zahl: ${currentLevel.maxNumber}</span>
        `;
        
        // Add progress bar for next level
        if (gameState.currentLevel < 5) {
            const nextLevel = levels[gameState.currentLevel + 1];
            const progress = Math.min(gameState.streak / nextLevel.streakRequired * 100, 100);
            const progressHtml = `
                <div class="level-progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                    <span class="progress-text">Nächster Level: Noch ${nextLevel.streakRequired - gameState.streak} in der Serie</span>
                </div>
            `;
            elements.levelDisplay.innerHTML += progressHtml;
        } else {
            elements.levelDisplay.innerHTML += '<div class="max-level">🏆 Höchstes Level erreicht! 🏆</div>';
        }
    }
}

// Show feedback message with animation
function showFeedback(message, type) {
    elements.feedback.textContent = message;
    elements.feedback.className = `feedback ${type}`;
}

// Update all display elements
function updateDisplay() {
    if (elements.coins) elements.coins.textContent = gameState.coins;
    if (elements.streak) elements.streak.textContent = gameState.streak;
    if (elements.totalQuestions) elements.totalQuestions.textContent = gameState.totalQuestions;
    if (elements.correctAnswers) elements.correctAnswers.textContent = gameState.correctAnswers;
    
    // Update level display
    updateLevelDisplay();
    
    // Update streak display with visual effects
    if (elements.streak) {
        if (gameState.streak >= 5) {
            elements.streak.style.animation = 'pulse 1s infinite';
        } else {
            elements.streak.style.animation = 'none';
        }
    }
}

// Celebrate streak milestones with visual effects
function celebrateStreak() {
    const gameContainer = document.querySelector('.game-container');
    gameContainer.style.animation = 'none';
    gameContainer.offsetHeight; // Trigger reflow
    gameContainer.style.animation = 'celebrateCorrect 0.6s ease-out';
    
    // Reset animation after it completes
    setTimeout(() => {
        gameContainer.style.animation = '';
    }, 600);
}

// Calculate timer duration based on current level
function getTimerDuration() {
    return 20 * gameState.currentLevel; // 10 seconds per level
}

// Timer functions
function startTimer() {
    // Stop any existing timer
    stopTimer();
    
    // Calculate time based on current level
    const levelTime = getTimerDuration();
    gameState.timer.maxTime = levelTime;
    gameState.timer.timeLeft = levelTime;
    gameState.timer.isRunning = true;
    
    // Update display immediately
    updateTimerDisplay();
    
    // Start countdown
    gameState.timer.intervalId = setInterval(() => {
        gameState.timer.timeLeft--;
        updateTimerDisplay();
        
        // Check if time is up
        if (gameState.timer.timeLeft <= 0) {
            handleTimerTimeout();
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timer.intervalId) {
        clearInterval(gameState.timer.intervalId);
        gameState.timer.intervalId = null;
    }
    gameState.timer.isRunning = false;
}

function updateTimerDisplay() {
    if (elements.timer) {
        elements.timer.textContent = gameState.timer.timeLeft;
        
        // Calculate proportional thresholds based on max time
        const redThreshold = Math.max(1, Math.ceil(gameState.timer.maxTime * 0.2)); // 20% of max time
        const orangeThreshold = Math.max(2, Math.ceil(gameState.timer.maxTime * 0.4)); // 40% of max time
        
        // Add visual urgency when time is running low
        if (gameState.timer.timeLeft <= redThreshold) {
            elements.timer.style.color = '#ff4444';
            elements.timer.style.animation = 'pulse 0.5s infinite';
        } else if (gameState.timer.timeLeft <= orangeThreshold) {
            elements.timer.style.color = '#ff8800';
            elements.timer.style.animation = 'none';
        } else {
            elements.timer.style.color = '#2ecc71';
            elements.timer.style.animation = 'none';
        }
    }
    
    // Update progress bar
    if (elements.timerProgress) {
        const progressPercent = (gameState.timer.timeLeft / gameState.timer.maxTime) * 100;
        elements.timerProgress.style.width = progressPercent + '%';
        
        // Calculate proportional thresholds for progress bar color
        const redThreshold = Math.max(1, Math.ceil(gameState.timer.maxTime * 0.2));
        const orangeThreshold = Math.max(2, Math.ceil(gameState.timer.maxTime * 0.4));
        
        // Change color based on time remaining
        if (gameState.timer.timeLeft <= redThreshold) {
            elements.timerProgress.style.backgroundColor = '#ff4444';
        } else if (gameState.timer.timeLeft <= orangeThreshold) {
            elements.timerProgress.style.backgroundColor = '#ff8800';
        } else {
            elements.timerProgress.style.backgroundColor = '#2ecc71';
        }
    }
}

function handleTimerTimeout() {
    // Stop the timer
    stopTimer();
    
    // Prevent multiple processing if answer was already submitted
    if (gameState.isProcessingAnswer) {
        return;
    }
    
    // Set flag to prevent duplicate processing
    gameState.isProcessingAnswer = true;
    
    // Count as total question
    gameState.totalQuestions++;
    
    // Handle as incorrect answer (time ran out)
    handleIncorrectAnswer('Zeit abgelaufen');
    
    // Update display
    updateDisplay();
    
    // Show special timeout feedback
    showFeedback('⏰ Zeit abgelaufen! Die Antwort war ' + gameState.currentQuestion.correctAnswer + '. ' + (gameState.coins > 0 ? '-1 Münze' : ''), 'incorrect');
    
    // Generate new question after a delay
    setTimeout(() => {
        generateNewQuestion();
        // Reset the processing flag after generating new question
        gameState.isProcessingAnswer = false;
    }, 1000);
}

// Reset the game to initial state
function resetGame() {
    const currentHouse = gameState.selectedHouse; // Preserve house selection
    
    // Stop any running timer
    stopTimer();
    
    gameState = {
        coins: 0,
        streak: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        selectedHouse: currentHouse, // Restore house selection
        currentLevel: 1, // Reset to level 1
        currentQuestion: {
            num1: 0,
            num2: 0,
            operator: '+',
            correctAnswer: 0
        },
        isProcessingAnswer: false, // Reset processing flag
        timer: {
            timeLeft: 5, // Will be updated when timer starts
            maxTime: 5,  // Will be updated when timer starts
            intervalId: null,
            isRunning: false
        }
    };
    
    updateDisplay();
    generateNewQuestion();
    
    // Show reset confirmation
    showFeedback('🎮 Neues Spiel gestartet! Viel Glück!', 'correct');
    setTimeout(() => {
        elements.feedback.textContent = '';
        elements.feedback.className = 'feedback';
    }, 2000);
}

// Calculate accuracy percentage for display
function getAccuracy() {
    if (gameState.totalQuestions === 0) return 0;
    return Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100);
}

// Add some fun sound effects (optional - browser dependent)
function playSound(type) {
    // This is a simple implementation that could be enhanced with actual sound files
    if (type === 'correct' && gameState.streak >= 3) {
        console.log('🎵 Streak sound effect!');
    }
}

// Add keyboard shortcuts for better accessibility
document.addEventListener('keydown', function(event) {
    // Press 'R' to restart game
    if (event.key.toLowerCase() === 'r' && event.ctrlKey) {
        event.preventDefault();
        resetGame();
    }
    
    // Press Escape to clear input
    if (event.key === 'Escape') {
        elements.answerInput.value = '';
        elements.answerInput.focus();
    }
});

// Prevent form submission if wrapped in a form
document.addEventListener('submit', function(event) {
    event.preventDefault();
    checkAnswer();
});

// Add visual feedback when input is focused/blurred
elements.answerInput.addEventListener('focus', function() {
    this.parentElement.style.transform = 'scale(1.02)';
});

elements.answerInput.addEventListener('blur', function() {
    this.parentElement.style.transform = 'scale(1)';
});

// Initialize game statistics tracking
const gameStats = {
    sessionStart: new Date(),
    bestStreak: 0,
    fastestAnswer: Infinity,
    questionStartTime: null
};

// Track question timing
function startQuestionTimer() {
    gameStats.questionStartTime = Date.now();
}

// Update best streak tracking
function updateBestStreak() {
    if (gameState.streak > gameStats.bestStreak) {
        gameStats.bestStreak = gameState.streak;
    }
}

// Start timer when new question is generated
const originalGenerateNewQuestion = generateNewQuestion;
generateNewQuestion = function() {
    originalGenerateNewQuestion();
    startQuestionTimer();
};

