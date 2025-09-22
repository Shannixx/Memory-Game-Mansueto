// Memory Card Game with Stack Operations - FIXED VERSION
// Demonstrates Push, Pop, Peek, and Clear operations

class StackMemoryGame {
    constructor() {
        // Game state variables
        this.gameData = null;
        this.cardStack = []; // Main stack for card management (LIFO)
        this.gameCards = []; // Cards currently in play
        this.flippedCards = []; // Stack for flipped cards during gameplay
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.timer = 0;
        this.gameActive = false;
        this.gameStarted = false;
        this.timerInterval = null;
        this.playerName = localStorage.getItem('stackMemoryPlayerName') || 'StackMaster';
        
        // Stack operation tracking
        this.stackOperationsUsed = {
            push: false,
            pop: false,
            peek: false,
            clear: false
        };
        
        // Initialize game after DOM is loaded
        this.init();
    }

    // Initialize game and load data
    async init() {
        try {
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeGame());
            } else {
                this.initializeGame();
            }
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showMessage('Error loading game. Please refresh the page.');
        }
    }

    // Initialize game components
    async initializeGame() {
        try {
            console.log('Initializing game...');
            
            // Get DOM elements first
            this.getDOMElements();
            
            // Load game data
            await this.loadGameData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize game state
            this.updateHighScore();
            this.initializeDefaultStack();
            this.checkPlayerName();
            
            console.log('Game initialization complete!');
        } catch (error) {
            console.error('Error in initializeGame:', error);
            this.showMessage('Error initializing game. Please check console for details.');
        }
    }

    // Get DOM elements with error checking
    getDOMElements() {
        // Required elements
        this.gameBoard = document.getElementById('game-board');
        this.stackDisplay = document.getElementById('stack-display');
        this.stackSizeEl = document.getElementById('stack-size');
        this.totalPairsEl = document.getElementById('total-pairs');
        this.currentScoreEl = document.getElementById('current-score');
        this.highScoreEl = document.getElementById('high-score');
        this.movesEl = document.getElementById('moves');
        this.timerEl = document.getElementById('timer');
        this.gameMessageEl = document.getElementById('game-message');

        // Check if all required elements exist
        const requiredElements = [
            'game-board', 'stack-display', 'stack-size', 'total-pairs',
            'current-score', 'high-score', 'moves', 'timer', 'game-message'
        ];

        for (const elementId of requiredElements) {
            const element = document.getElementById(elementId);
            if (!element) {
                console.error(`Required element not found: ${elementId}`);
                throw new Error(`Missing required element: ${elementId}`);
            }
        }

        console.log('All DOM elements found successfully');
    }

    // Load game data from JSON file or use fallback
    async loadGameData() {
        try {
            console.log('Loading game data...');
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.gameData = await response.json();
            console.log('Game data loaded from JSON successfully');
        } catch (error) {
            console.warn('Failed to load JSON, using fallback data:', error);
            this.gameData = this.getFallbackData();
        }
    }

    // Fallback data if JSON loading fails
    getFallbackData() {
        return {
            gameConfig: {
                maxCards: 48,
                minCards: 2, // Changed from 4 to 2 for easier testing
                defaultCards: 6, // Start with 6 cards as shown in your screenshot
                stackOperations: { 
                    pushAnimation: 300, 
                    popAnimation: 300, 
                    maxStackSize: 24 
                },
                flipDuration: 600,
                matchDelay: 1000
            },
            cardData: [
                {id: 1, name: "pixel-heart", icon: "❤️", color: "#E91E63", points: 10, rarity: "common"},
                {id: 2, name: "pixel-star", icon: "⭐", color: "#FFD700", points: 10, rarity: "common"},
                {id: 3, name: "pixel-diamond", icon: "💎", color: "#00BCD4", points: 15, rarity: "rare"},
                {id: 4, name: "pixel-crown", icon: "👑", color: "#FF9800", points: 15, rarity: "rare"},
                {id: 5, name: "pixel-gem", icon: "💠", color: "#9C27B0", points: 12, rarity: "uncommon"},
                {id: 6, name: "pixel-fire", icon: "🔥", color: "#FF5722", points: 12, rarity: "uncommon"},
                {id: 7, name: "pixel-lightning", icon: "⚡", color: "#FFC107", points: 12, rarity: "uncommon"},
                {id: 8, name: "pixel-coin", icon: "🪙", color: "#FF8F00", points: 10, rarity: "common"},
                {id: 9, name: "pixel-shield", icon: "🛡️", color: "#607D8B", points: 15, rarity: "rare"},
                {id: 10, name: "pixel-sword", icon: "⚔️", color: "#795548", points: 15, rarity: "rare"},
                {id: 11, name: "pixel-magic", icon: "✨", color: "#E1BEE7", points: 12, rarity: "uncommon"},
                {id: 12, name: "pixel-rocket", icon: "🚀", color: "#2196F3", points: 20, rarity: "legendary"}
            ]
        };
    }

    // Setup event listeners with error checking
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        try {
            // Stack operation buttons
            this.addEventListenerSafe('push-card-btn', 'click', () => this.showCardSelection());
            this.addEventListenerSafe('pop-card-btn', 'click', () => this.popCard());
            this.addEventListenerSafe('peek-stack-btn', 'click', () => this.peekStack());
            this.addEventListenerSafe('clear-stack-btn', 'click', () => this.clearStack());
            
            // Game control buttons
            this.addEventListenerSafe('start-btn', 'click', () => this.startGame());
            this.addEventListenerSafe('reset-btn', 'click', () => this.resetGame());
            this.addEventListenerSafe('pause-btn', 'click', () => this.pauseGame());
            this.addEventListenerSafe('logout-btn', 'click', () => this.logout());
            
            // Modal buttons
            this.addEventListenerSafe('play-again-btn', 'click', () => this.playAgain());
            this.addEventListenerSafe('close-modal-btn', 'click', () => this.closeModal());
            this.addEventListenerSafe('save-name-btn', 'click', () => this.saveName());
            this.addEventListenerSafe('cancel-selection-btn', 'click', () => this.closeCardSelection());
            this.addEventListenerSafe('close-peek-btn', 'click', () => this.closePeekModal());
            
            // Player name input
            const playerNameInput = document.getElementById('player-name');
            if (playerNameInput) {
                playerNameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.saveName();
                    }
                });
            }
            
            console.log('Event listeners set up successfully');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    // Safe event listener addition with error checking
    addEventListenerSafe(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
            console.log(`Event listener added to ${elementId}`);
        } else {
            console.warn(`Element not found: ${elementId}`);
        }
    }

    // Initialize with default cards
    initializeDefaultStack() {
        console.log('Initializing default stack...');
        const defaultCount = Math.min(this.gameData.gameConfig.defaultCards, this.gameData.cardData.length);
        
        // Clear existing stack
        this.cardStack = [];
        
        // Add default cards
        for (let i = 0; i < defaultCount; i++) {
            this.pushCardToStack(this.gameData.cardData[i], false); // Silent push
        }
        
        this.updateStackDisplay();
        this.updateButtonStates(); // Important: Update button states
        this.showMessage(`Initialized with ${defaultCount} card pairs. Ready to start game!`);
        
        console.log(`Stack initialized with ${this.cardStack.length} cards`);
    }

    // STACK OPERATION: Push card to stack
    pushCardToStack(cardData, showMessage = true) {
        if (this.cardStack.length >= this.gameData.gameConfig.stackOperations.maxStackSize) {
            if (showMessage) this.showMessage('Stack is full! Cannot push more cards.');
            return false;
        }

        // Create card with unique ID
        const newCard = {
            ...cardData,
            stackId: Date.now() + Math.random(),
            timestamp: new Date().toISOString()
        };

        this.cardStack.push(newCard);
        this.stackOperationsUsed.push = true;
        this.updateStackDisplay();
        this.updateButtonStates(); // Update button states after stack change
        
        if (showMessage) {
            this.showMessage(`✅ PUSHED: ${cardData.name} added to stack!`);
        }
        
        console.log(`Pushed card: ${cardData.name}, Stack size: ${this.cardStack.length}`);
        return true;
    }

    // STACK OPERATION: Pop card from stack
    popCard() {
        if (this.gameActive) {
            this.showMessage('Cannot modify stack during active game!');
            return;
        }

        if (this.cardStack.length === 0) {
            this.showMessage('Stack is empty! Nothing to pop.');
            return;
        }

        const poppedCard = this.cardStack.pop();
        this.stackOperationsUsed.pop = true;
        this.updateStackDisplay();
        this.updateButtonStates(); // Update button states after stack change
        this.showMessage(`❌ POPPED: ${poppedCard.name} removed from stack!`);
        
        console.log(`Popped card: ${poppedCard.name}, Stack size: ${this.cardStack.length}`);
    }

    // STACK OPERATION: Peek at top card
    peekStack() {
        if (this.cardStack.length === 0) {
            this.showMessage('Stack is empty! Nothing to peek.');
            return;
        }

        const topCard = this.cardStack[this.cardStack.length - 1];
        this.stackOperationsUsed.peek = true;
        this.showPeekModal(topCard);
        
        console.log(`Peeked at card: ${topCard.name}`);
    }

    // STACK OPERATION: Clear entire stack
    clearStack() {
        if (this.gameActive) {
            this.showMessage('Cannot clear stack during active game!');
            return;
        }

        if (this.cardStack.length === 0) {
            this.showMessage('Stack is already empty!');
            return;
        }

        if (confirm(`Clear all ${this.cardStack.length} cards from stack?`)) {
            const clearedCount = this.cardStack.length;
            this.cardStack = [];
            this.stackOperationsUsed.clear = true;
            this.updateStackDisplay();
            this.updateButtonStates(); // Update button states after stack change
            this.showMessage(`🗑️ CLEARED: Removed ${clearedCount} cards from stack!`);
            
            console.log(`Cleared stack, removed ${clearedCount} cards`);
        }
    }

    // Show card selection modal for push operation
    showCardSelection() {
        if (this.gameActive) {
            this.showMessage('Cannot modify stack during active game!');
            return;
        }

        if (this.cardStack.length >= this.gameData.gameConfig.stackOperations.maxStackSize) {
            this.showMessage('Stack is full! Pop some cards first.');
            return;
        }

        // Get available cards (not already in stack)
        const stackCardIds = this.cardStack.map(card => card.id);
        const availableCards = this.gameData.cardData.filter(card => !stackCardIds.includes(card.id));

        if (availableCards.length === 0) {
            this.showMessage('All cards are already in the stack!');
            return;
        }

        // Populate available cards grid
        const availableCardsEl = document.getElementById('available-cards');
        if (!availableCardsEl) {
            console.error('Available cards element not found');
            return;
        }

        availableCardsEl.innerHTML = '';

        availableCards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'available-card';
            cardEl.innerHTML = `
                <div class="available-card-icon">${card.icon}</div>
                <div class="available-card-name">${card.name}</div>
            `;
            cardEl.style.backgroundColor = card.color;
            cardEl.addEventListener('click', () => {
                this.pushCardToStack(card);
                this.closeCardSelection();
            });
            availableCardsEl.appendChild(cardEl);
        });

        const modal = document.getElementById('card-selection-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // Close card selection modal
    closeCardSelection() {
        const modal = document.getElementById('card-selection-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Show peek modal
    showPeekModal(card) {
        const peekDisplay = document.getElementById('peek-card-display');
        if (!peekDisplay) {
            console.error('Peek display element not found');
            return;
        }

        peekDisplay.innerHTML = `
            <div class="peek-card">
                <div class="peek-card-icon">${card.icon}</div>
                <div class="peek-card-info">
                    <div><strong>${card.name}</strong></div>
                    <div>Points: ${card.points}</div>
                    <div>Rarity: ${card.rarity}</div>
                    <div>Stack Position: TOP</div>
                </div>
            </div>
        `;
        peekDisplay.style.backgroundColor = card.color;
        
        const modal = document.getElementById('stack-peek-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // Close peek modal
    closePeekModal() {
        const modal = document.getElementById('stack-peek-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Update stack visualization display
    updateStackDisplay() {
        if (!this.stackSizeEl || !this.totalPairsEl || !this.stackDisplay) {
            console.error('Stack display elements not found');
            return;
        }

        this.stackSizeEl.textContent = this.cardStack.length;
        this.totalPairsEl.textContent = this.cardStack.length;

        // Update stack visualization
        if (this.cardStack.length === 0) {
            this.stackDisplay.innerHTML = '<div class="stack-placeholder">Stack is empty - Push some cards!</div>';
        } else {
            this.stackDisplay.innerHTML = '';
            // Show cards in LIFO order (top of stack first)
            for (let i = this.cardStack.length - 1; i >= 0; i--) {
                const card = this.cardStack[i];
                const cardEl = document.createElement('div');
                cardEl.className = 'stack-card';
                cardEl.innerHTML = `
                    <span class="stack-card-icon">${card.icon}</span>
                    <span class="stack-card-name">${card.name}</span>
                    <span class="stack-card-index">${i === this.cardStack.length - 1 ? 'TOP' : i + 1}</span>
                `;
                cardEl.style.backgroundColor = card.color;
                this.stackDisplay.appendChild(cardEl);
            }
        }

        console.log(`Stack display updated: ${this.cardStack.length} cards`);
    }

    // Update stack button states
    updateStackButtonStates() {
        const pushBtn = document.getElementById('push-card-btn');
        const popBtn = document.getElementById('pop-card-btn');
        const peekBtn = document.getElementById('peek-stack-btn');
        const clearBtn = document.getElementById('clear-stack-btn');

        const stackFull = this.cardStack.length >= this.gameData.gameConfig.stackOperations.maxStackSize;
        const stackEmpty = this.cardStack.length === 0;

        if (pushBtn) pushBtn.disabled = this.gameActive || stackFull;
        if (popBtn) popBtn.disabled = this.gameActive || stackEmpty;
        if (peekBtn) peekBtn.disabled = stackEmpty;
        if (clearBtn) clearBtn.disabled = this.gameActive || stackEmpty;
    }

    // Check player name
    checkPlayerName() {
        if (!this.playerName || this.playerName === 'StackMaster') {
            this.showLoginModal();
        } else {
            this.showMessage(`Welcome back, ${this.playerName}! Stack has ${this.cardStack.length} cards. Ready to start?`);
        }
    }

    // Show login modal
    showLoginModal() {
        const modal = document.getElementById('login-modal');
        const playerNameInput = document.getElementById('player-name');
        
        if (modal) {
            modal.style.display = 'flex';
            if (playerNameInput) {
                playerNameInput.focus();
            }
        }
    }

    // Save player name
    saveName() {
        const nameInput = document.getElementById('player-name');
        if (!nameInput) {
            console.error('Player name input not found');
            return;
        }
        
        const name = nameInput.value.trim();
        
        if (name && name.length > 0) {
            this.playerName = name;
            localStorage.setItem('stackMemoryPlayerName', name);
            const modal = document.getElementById('login-modal');
            if (modal) {
                modal.style.display = 'none';
            }
            this.showMessage(`Welcome, ${this.playerName}! Use push/pop to modify cards, then START GAME!`);
            
            // Update button states after name is saved
            this.updateButtonStates();
        } else {
            alert('Please enter a valid name!');
        }
    }

    // Start new game - FIXED VERSION
    startGame() {
        console.log('Starting game...');
        console.log('Current stack size:', this.cardStack.length);
        console.log('Game active:', this.gameActive);
        console.log('Min cards required:', this.gameData?.gameConfig?.minCards);

        if (this.gameActive) {
            console.log('Game already active, ignoring start request');
            return;
        }

        // Check minimum cards requirement
        const minCards = this.gameData?.gameConfig?.minCards || 2;
        if (this.cardStack.length < minCards) {
            this.showMessage(`Need at least ${minCards} card pairs to start! Use PUSH to add more cards.`);
            console.log(`Insufficient cards: ${this.cardStack.length} < ${minCards}`);
            return;
        }

        try {
            // Reset game state
            this.resetGameState();
            
            // Create game cards from current stack
            this.createGameCardsFromStack();
            console.log('Game cards created:', this.gameCards.length);
            
            // Shuffle the cards
            this.shuffleCards();
            console.log('Cards shuffled');
            
            // Render cards to the board
            this.renderCards();
            console.log('Cards rendered to board');
            
            // Set game as active
            this.gameActive = true;
            this.gameStarted = true;
            
            // Start the timer
            this.startTimer();
            
            // Update UI
            this.updateButtonStates();
            this.showMessage(`Game started with ${this.cardStack.length} pairs! Find all matches, ${this.playerName}!`);
            
            console.log('Game started successfully!');
            
        } catch (error) {
            console.error('Error starting game:', error);
            this.showMessage('Error starting game. Check console for details.');
        }
    }

    // Create game cards from current stack
    createGameCardsFromStack() {
        this.gameCards = [];
        
        // Create pairs from stack cards
        this.cardStack.forEach((cardData, index) => {
            // First card of pair
            this.gameCards.push({
                ...cardData,
                id: `${cardData.id}_1`,
                pairId: cardData.id,
                matched: false,
                flipped: false
            });
            
            // Second card of pair
            this.gameCards.push({
                ...cardData,
                id: `${cardData.id}_2`,
                pairId: cardData.id,
                matched: false,
                flipped: false
            });
        });
        
        console.log(`Created ${this.gameCards.length} game cards from ${this.cardStack.length} stack cards`);
    }

    // Shuffle game cards using Fisher-Yates algorithm
    shuffleCards() {
        for (let i = this.gameCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.gameCards[i], this.gameCards[j]] = [this.gameCards[j], this.gameCards[i]];
        }
    }

    // Render cards to game board
    renderCards() {
        if (!this.gameBoard) {
            console.error('Game board element not found');
            return;
        }

        this.gameBoard.innerHTML = '';
        
        // Update grid columns based on card count
        const cardCount = this.gameCards.length;
        const columns = Math.ceil(Math.sqrt(cardCount));
        this.gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        
        console.log(`Rendering ${cardCount} cards in ${columns} columns`);
        
        this.gameCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.gameBoard.appendChild(cardElement);
        });
    }

    // Create individual card element
    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'memory-card appearing';
        cardDiv.dataset.cardId = card.id;
        cardDiv.dataset.pairId = card.pairId;
        cardDiv.dataset.index = index;
        
        // Create card front (hidden face)
        const cardFront = document.createElement('div');
        cardFront.className = 'card-face card-front';
        
        // Create card back (revealed face)
        const cardBack = document.createElement('div');
        cardBack.className = 'card-face card-back';
        cardBack.innerHTML = `<span style="font-size: 28px;">${card.icon}</span>`;
        cardBack.style.backgroundColor = card.color;
        
        cardDiv.appendChild(cardFront);
        cardDiv.appendChild(cardBack);
        
        // Add click event listener
        cardDiv.addEventListener('click', (e) => this.handleCardClick(e, card, index));
        
        return cardDiv;
    }

    // Handle card click event
    handleCardClick(event, card, index) {
        if (!this.gameActive || card.matched || card.flipped) {
            return;
        }

        if (this.flippedCards.length >= 2) {
            return;
        }

        // Flip the card
        this.flipCard(event.currentTarget, card, index);
        this.flippedCards.push({card, element: event.currentTarget, index});
        
        // Check for match if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            if (this.movesEl) {
                this.movesEl.textContent = this.moves;
            }
            setTimeout(() => this.checkForMatch(), this.gameData.gameConfig.matchDelay || 1000);
        }
    }

    // Flip card animation
    flipCard(cardElement, card, index) {
        cardElement.classList.add('flip');
        card.flipped = true;
    }

    // Check if two flipped cards match
    checkForMatch() {
        if (this.flippedCards.length !== 2) return;
        
        const [firstFlipped, secondFlipped] = this.flippedCards;
        const card1 = firstFlipped.card;
        const card2 = secondFlipped.card;
        
        if (card1.pairId === card2.pairId) {
            this.handleMatch(firstFlipped, secondFlipped);
        } else {
            this.handleNoMatch(firstFlipped, secondFlipped);
        }
        
        this.flippedCards = [];
    }

    // Handle successful match
    handleMatch(firstFlipped, secondFlipped) {
        const card1 = firstFlipped.card;
        const card2 = secondFlipped.card;
        
        card1.matched = true;
        card2.matched = true;
        
        firstFlipped.element.classList.add('matched');
        secondFlipped.element.classList.add('matched');
        
        const baseScore = card1.points || 10;
        const timeBonus = Math.max(0, 100 - this.timer);
        const moveBonus = Math.max(0, 50 - this.moves);
        const totalScore = baseScore + timeBonus + moveBonus;
        
        this.score += totalScore;
        this.matchedPairs++;
        
        this.updateDisplay();
        this.showMessage(`Match found! +${totalScore} points! ${this.matchedPairs}/${this.cardStack.length} pairs found.`);
        
        if (this.matchedPairs === this.cardStack.length) {
            setTimeout(() => this.gameComplete(), 1000);
        }
    }

    // Handle no match
    handleNoMatch(firstFlipped, secondFlipped) {
        setTimeout(() => {
            firstFlipped.element.classList.remove('flip');
            secondFlipped.element.classList.remove('flip');
            firstFlipped.card.flipped = false;
            secondFlipped.card.flipped = false;
            this.showMessage('No match! Try again.');
        }, 1000);
    }

    // Game complete
    gameComplete() {
        this.gameActive = false;
        this.gameStarted = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Calculate final score with bonuses
        const stackSizeBonus = this.cardStack.length * 50;
        const operationsBonus = Object.values(this.stackOperationsUsed).filter(used => used).length * 100;
        this.score += stackSizeBonus + operationsBonus;
        
        // Check for high score
        const currentHighScore = this.getHighScore();
        const isNewHighScore = this.score > currentHighScore;
        
        if (isNewHighScore) {
            localStorage.setItem('stackMemoryHighScore', this.score.toString());
            this.updateHighScore();
        }
        
        this.showGameOverModal(isNewHighScore);
        this.updateButtonStates();
    }

    // Show game over modal
    showGameOverModal(isNewHighScore) {
        const finalScoreEl = document.getElementById('final-score');
        const finalMovesEl = document.getElementById('final-moves');
        const finalTimeEl = document.getElementById('final-time');
        const finalCardsEl = document.getElementById('final-cards');
        const newRecordEl = document.getElementById('new-record');

        if (finalScoreEl) finalScoreEl.textContent = this.score;
        if (finalMovesEl) finalMovesEl.textContent = this.moves;
        if (finalTimeEl) finalTimeEl.textContent = this.formatTime(this.timer);
        if (finalCardsEl) finalCardsEl.textContent = this.cardStack.length * 2;
        
        if (newRecordEl) {
            newRecordEl.style.display = isNewHighScore ? 'block' : 'none';
        }
        
        const modal = document.getElementById('game-over-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // Reset game state
    resetGameState() {
        this.gameCards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.timer = 0;
        this.gameActive = false;
        this.gameStarted = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.updateDisplay();
        
        console.log('Game state reset');
    }

    // Start game timer
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            if (this.timerEl) {
                this.timerEl.textContent = this.formatTime(this.timer);
            }
        }, 1000);
    }

    // Format time display
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Update display elements
    updateDisplay() {
        if (this.currentScoreEl) this.currentScoreEl.textContent = this.score;
        if (this.movesEl) this.movesEl.textContent = this.moves;
        if (this.timerEl) this.timerEl.textContent = this.formatTime(this.timer);
    }

    // Update high score display
    updateHighScore() {
        const highScore = this.getHighScore();
        if (this.highScoreEl) {
            this.highScoreEl.textContent = highScore;
        }
    }

    // Get high score from localStorage
    getHighScore() {
        return parseInt(localStorage.getItem('stackMemoryHighScore')) || 0;
    }

    // Reset game
    resetGame() {
        if (confirm('Reset the current game? This will clear the game board but keep your stack.')) {
            this.resetGameState();
            if (this.gameBoard) {
                this.gameBoard.innerHTML = '';
            }
            this.showMessage('Game reset. Modify your stack and click START GAME when ready!');
            this.updateButtonStates();
        }
    }

    // Pause/Resume game
    pauseGame() {
        if (!this.gameStarted) return;
        
        const pauseBtn = document.getElementById('pause-btn');
        
        if (this.gameActive) {
            this.gameActive = false;
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            if (pauseBtn) pauseBtn.textContent = 'RESUME';
            this.showMessage('Game paused. Click RESUME to continue.');
        } else {
            this.gameActive = true;
            this.startTimer();
            if (pauseBtn) pauseBtn.textContent = 'PAUSE';
            this.showMessage('Game resumed! Keep matching!');
        }
        
        this.updateButtonStates();
    }

    // Logout
    logout() {
        if (confirm('Logout and reset session? This will clear your name and reset the game.')) {
            localStorage.removeItem('stackMemoryPlayerName');
            this.resetGame();
            this.playerName = 'StackMaster';
            this.showLoginModal();
        }
    }

    // Play again
    playAgain() {
        this.closeModal();
        this.startGame();
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('game-over-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Update button states based on game status - FIXED VERSION
    updateButtonStates() {
        const startBtn = document.getElementById('start-btn');
        const resetBtn = document.getElementById('reset-btn');
        const pauseBtn = document.getElementById('pause-btn');
        
        // Check minimum cards requirement
        const minCards = this.gameData?.gameConfig?.minCards || 2;
        const hasEnoughCards = this.cardStack.length >= minCards;
        
        console.log(`Updating button states: cards=${this.cardStack.length}, min=${minCards}, enough=${hasEnoughCards}, gameStarted=${this.gameStarted}, gameActive=${this.gameActive}`);
        
        if (!this.gameStarted) {
            // Game not started - enable start button only if enough cards
            if (startBtn) {
                startBtn.textContent = 'START GAME';
                startBtn.disabled = !hasEnoughCards;
                if (!hasEnoughCards) {
                    startBtn.title = `Need at least ${minCards} card pairs to start`;
                } else {
                    startBtn.title = 'Click to start the game';
                }
            }
            if (resetBtn) resetBtn.disabled = true;
            if (pauseBtn) {
                pauseBtn.disabled = true;
                pauseBtn.textContent = 'PAUSE';
            }
        } else if (this.gameActive) {
            // Game active
            if (startBtn) {
                startBtn.textContent = 'GAME ACTIVE';
                startBtn.disabled = true;
                startBtn.title = 'Game is currently running';
            }
            if (resetBtn) resetBtn.disabled = false;
            if (pauseBtn) {
                pauseBtn.disabled = false;
                pauseBtn.textContent = 'PAUSE';
            }
        } else {
            // Game paused
            if (startBtn) {
                startBtn.textContent = 'START GAME';
                startBtn.disabled = false;
                startBtn.title = 'Resume or start new game';
            }
            if (resetBtn) resetBtn.disabled = false;
            if (pauseBtn) {
                pauseBtn.disabled = false;
                pauseBtn.textContent = 'RESUME';
            }
        }
        
        // Update stack operation buttons
        this.updateStackButtonStates();
    }

    // Show game message with animation
    showMessage(message) {
        if (!this.gameMessageEl) {
            console.warn('Game message element not found');
            return;
        }
        
        this.gameMessageEl.textContent = message;
        this.gameMessageEl.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.gameMessageEl.style.transform = 'scale(1)';
        }, 200);
        
        console.log('Message:', message);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    
    try {
        const game = new StackMemoryGame();
        
        // Make game globally accessible for debugging
        window.stackMemoryGame = game;
        
        // Educational console logs
        console.log('🎮 Stack Memory Game Initialized!');
        console.log('📚 Stack Operations Implemented:');
        console.log('   ✅ PUSH: Add cards to the stack (LIFO)');
        console.log('   ❌ POP: Remove cards from the top of stack');
        console.log('   👀 PEEK: View top card without removing');
        console.log('   🗑️ CLEAR: Empty the entire stack');
        console.log('🎯 Debug: Access game object via window.stackMemoryGame');
        console.log('🔧 If START GAME is disabled, check stack size and console for errors');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        alert('Game initialization failed. Please check the console for details and refresh the page.');
    }
});

// Error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// Error handling for general errors
window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
});
