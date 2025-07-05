// UI System for Mobile Controls and Interface

class VirtualJoystick {
    constructor(baseElement, stickElement) {
        this.base = baseElement;
        this.stick = stickElement;
        this.baseRect = null;
        this.isActive = false;
        this.currentX = 0;
        this.currentY = 0;
        this.maxDistance = 35; // Maximum distance from center
        this.touchId = null; // Track specific touch for multi-touch support
        
        this.setupEvents();
    }

    setupEvents() {
        // Touch events on joystick area
        this.base.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        
        // Global touch events to handle movement outside joystick area
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        document.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
        
        // Mouse events for desktop testing
        this.base.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleTouchStart(event) {
        event.preventDefault();
        this.isActive = true;
        this.touchId = event.touches[0].identifier; // Track specific touch
        this.baseRect = this.base.getBoundingClientRect();
        const touch = event.touches[0];
        this.updateStickPosition(touch.clientX, touch.clientY);
    }

    handleTouchMove(event) {
        if (!this.isActive) return;
        
        // Find the touch that belongs to this joystick
        let relevantTouch = null;
        for (let i = 0; i < event.touches.length; i++) {
            if (event.touches[i].identifier === this.touchId) {
                relevantTouch = event.touches[i];
                break;
            }
        }
        
        if (relevantTouch) {
            event.preventDefault();
            this.updateStickPosition(relevantTouch.clientX, relevantTouch.clientY);
        }
    }

    handleTouchEnd(event) {
        // Check if our tracked touch ended
        let touchEnded = true;
        for (let i = 0; i < event.touches.length; i++) {
            if (event.touches[i].identifier === this.touchId) {
                touchEnded = false;
                break;
            }
        }
        
        if (touchEnded) {
            event.preventDefault();
            this.resetStick();
        }
    }

    handleMouseDown(event) {
        this.isActive = true;
        this.baseRect = this.base.getBoundingClientRect();
        this.updateStickPosition(event.clientX, event.clientY);
    }

    handleMouseMove(event) {
        if (!this.isActive) return;
        this.updateStickPosition(event.clientX, event.clientY);
    }

    handleMouseUp(event) {
        this.resetStick();
    }

    updateStickPosition(clientX, clientY) {
        if (!this.baseRect) return;
        
        // Calculate relative position
        const centerX = this.baseRect.left + this.baseRect.width / 2;
        const centerY = this.baseRect.top + this.baseRect.height / 2;
        
        let deltaX = clientX - centerX;
        let deltaY = clientY - centerY;
        
        // Limit to maximum distance
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > this.maxDistance) {
            const ratio = this.maxDistance / distance;
            deltaX *= ratio;
            deltaY *= ratio;
        }
        
        // Update stick position
        this.stick.style.transform = `translate(-50%, -50%) translate(${deltaX}px, ${deltaY}px)`;
        
        // Store normalized values (-1 to 1)
        this.currentX = deltaX / this.maxDistance;
        this.currentY = deltaY / this.maxDistance;
    }

    resetStick() {
        this.isActive = false;
        this.stick.style.transform = 'translate(-50%, -50%)';
        this.currentX = 0;
        this.currentY = 0;
        this.baseRect = null;
        this.touchId = null;
    }

    getDirection() {
        const magnitude = Math.sqrt(this.currentX * this.currentX + this.currentY * this.currentY);
        
        // Apply deadzone - ignore very small movements
        const deadzone = 0.15;
        if (magnitude < deadzone) {
            return {
                x: 0,
                y: 0,
                magnitude: 0
            };
        }
        
        // Normalize direction and apply magnitude scaling
        const normalizedX = magnitude > 0 ? this.currentX / magnitude : 0;
        const normalizedY = magnitude > 0 ? this.currentY / magnitude : 0;
        
        // Scale magnitude to remove deadzone effect
        const adjustedMagnitude = Math.min((magnitude - deadzone) / (1 - deadzone), 1);
        
        return {
            x: normalizedX * adjustedMagnitude,
            y: normalizedY * adjustedMagnitude,
            magnitude: adjustedMagnitude
        };
    }
}

class GameUI {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.elements = this.initializeElements();
        this.joystick = new VirtualJoystick(
            this.elements.joystickBase,
            this.elements.joystickStick
        );
        
        this.damageTexts = [];
        this.skillSelectionInProgress = false;
        this.localization = window.Localization;
        
        this.setupEventListeners();
        this.updateInterval = setInterval(() => this.updateHUD(), 100);
        
        // Initialize localization
        this.initializeLocalization();
    }

    initializeElements() {
        console.log('Initializing UI elements...');
        
        const elements = {
            // HUD Elements
            healthFill: document.getElementById('healthFill'),
            healthText: document.getElementById('healthText'),
            waveText: document.getElementById('waveText'),
            enemiesLeft: document.getElementById('enemiesLeft'),
            scoreText: document.getElementById('scoreText'),
            pauseBtn: document.getElementById('pauseBtn'),
            
            // Mobile Controls
            joystickBase: document.getElementById('joystickBase'),
            joystickStick: document.getElementById('joystickStick'),
            primaryShootBtn: document.getElementById('primaryShootBtn'),
            skill1Btn: document.getElementById('skill1Btn'),
            skill2Btn: document.getElementById('skill2Btn'),
            skill3Btn: document.getElementById('skill3Btn'),
            
            // Screens
            screens: {
                mainMenu: document.getElementById('mainMenu'),
                battleScreen: document.getElementById('battleScreen'),
                skillSelection: document.getElementById('skillSelection'),
                battleResults: document.getElementById('battleResults'),
                baseScreen: document.getElementById('baseScreen'),
                settingsScreen: document.getElementById('settingsScreen')
            },
            
            // Menu Buttons
            startGameBtn: document.getElementById('startGameBtn'),
            upgradesBtn: document.getElementById('upgradesBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            continueBtn: document.getElementById('continueBtn'),
            backToBaseBtn: document.getElementById('backToBaseBtn'),
            backToMenuBtn: document.getElementById('backToMenuBtn'),
            backToMenuFromSettingsBtn: document.getElementById('backToMenuFromSettingsBtn'),
            resetGameBtn: document.getElementById('resetGameBtn'),
            startBattleFromBaseBtn: document.getElementById('startBattleFromBaseBtn'),
            
            // Skill Selection
            skillOptions: document.getElementById('skillOptions'),
            
            // Battle Results
            waveCompleted: document.getElementById('waveCompleted'),
            enemiesDefeated: document.getElementById('enemiesDefeated'),
            scoreEarned: document.getElementById('scoreEarned'),
            expGained: document.getElementById('expGained'),
            
            // Base Screen
            tankHealth: document.getElementById('tankHealth'),
            tankDamage: document.getElementById('tankDamage'),
            tankSpeed: document.getElementById('tankSpeed'),
            miniHealth: document.getElementById('miniHealth'),
            miniDamage: document.getElementById('miniDamage'),
            playerLevel: document.getElementById('playerLevel'),
            playerExp: document.getElementById('playerExp'),
            playerExpNext: document.getElementById('playerExpNext'),
            playerCoins: document.getElementById('playerCoins'),
            
            // Loading
            loadingScreen: document.getElementById('loadingScreen'),
            loadingProgress: document.getElementById('loadingProgress'),
            
            // Battle Type Modal
            battleTypeModal: document.getElementById('battleTypeModal'),
            
            // Confirm Dialog
            confirmDialog: document.getElementById('confirmDialog'),
            confirmTitle: document.getElementById('confirmTitle'),
            confirmMessage: document.getElementById('confirmMessage'),
            confirmBullets: document.getElementById('confirmBullets'),
            confirmWarning: document.getElementById('confirmWarning'),
            
            // Pause Modal
            pauseModal: document.getElementById('pauseModal'),
            resumeBtn: document.getElementById('resumeBtn'),
            exitBattleBtn: document.getElementById('exitBattleBtn')
        };
        
        // Debug: Check if critical elements exist
        console.log('Guide button found:', elements.settingsBtn ? 'YES' : 'NO');
        console.log('Pause button found:', elements.pauseBtn ? 'YES' : 'NO');
        console.log('Guide screen found:', elements.screens.settingsScreen ? 'YES' : 'NO');
        
        return elements;
    }

    initializeLocalization() {
        if (!this.localization) {
            console.error('Localization not available');
            return;
        }
        
        // Setup language button event listeners
        const englishBtn = document.getElementById('englishBtn');
        const vietnameseBtn = document.getElementById('vietnameseBtn');
        
        if (englishBtn) {
            // Add comprehensive touch and click event listeners for mobile compatibility
            const englishHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Reset visual feedback
                englishBtn.style.transform = '';
                this.localization.setLanguage('en');
                this.updateLanguageButtons();
                this.updateDynamicText();
            };
            
            // Add all necessary event listeners
            englishBtn.addEventListener('click', englishHandler);
            englishBtn.addEventListener('touchend', englishHandler, { passive: false });
            englishBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                // Add visual feedback for touch
                englishBtn.style.transform = 'translateY(1px)';
            }, { passive: false });
            englishBtn.addEventListener('touchcancel', () => {
                // Reset visual feedback
                englishBtn.style.transform = '';
            });
        }
        
        if (vietnameseBtn) {
            // Add comprehensive touch and click event listeners for mobile compatibility
            const vietnameseHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Reset visual feedback
                vietnameseBtn.style.transform = '';
                this.localization.setLanguage('vi');
                this.updateLanguageButtons();
                this.updateDynamicText();
            };
            
            // Add all necessary event listeners
            vietnameseBtn.addEventListener('click', vietnameseHandler);
            vietnameseBtn.addEventListener('touchend', vietnameseHandler, { passive: false });
            vietnameseBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                // Add visual feedback for touch
                vietnameseBtn.style.transform = 'translateY(1px)';
            }, { passive: false });
            vietnameseBtn.addEventListener('touchcancel', () => {
                // Reset visual feedback
                vietnameseBtn.style.transform = '';
            });
        }
        
        // Initialize UI with current language
        this.localization.updateAllText();
        this.updateLanguageButtons();
    }

    updateLanguageButtons() {
        const englishBtn = document.getElementById('englishBtn');
        const vietnameseBtn = document.getElementById('vietnameseBtn');
        
        if (englishBtn && vietnameseBtn) {
            const currentLang = this.localization.getCurrentLanguage();
            
            englishBtn.classList.toggle('active', currentLang === 'en');
            vietnameseBtn.classList.toggle('active', currentLang === 'vi');
        }
    }

    updateDynamicText() {
        // Update any dynamic text that's not covered by data-translate attributes
        // This will be called when language changes
        if (this.gameEngine && this.gameEngine.player) {
            this.updateHUD();
        }
    }

    setupEventListeners() {
        // Mobile control buttons
        this.elements.primaryShootBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleShoot();
        });
        
        this.elements.primaryShootBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.handleShoot();
        });
        
        // Skill buttons
        [this.elements.skill1Btn, this.elements.skill2Btn, this.elements.skill3Btn].forEach((btn, index) => {
            const handler = (e) => {
                e.preventDefault();
                this.handleSkillUse(index);
            };
            btn.addEventListener('touchstart', handler);
            btn.addEventListener('mousedown', handler);
        });
        
        // Menu buttons - Enhanced for mobile touch support
        this.setupMobileButton(this.elements.startGameBtn, () => {
            this.handleStartBattle();
        });
        
        this.setupMobileButton(this.elements.upgradesBtn, () => {
            this.showScreen('baseScreen');
        });
        
        // Debug: Check if settingsBtn exists
        if (!this.elements.settingsBtn) {
            console.error('Guide button not found in DOM!');
        } else {
            console.log('Guide button found:', this.elements.settingsBtn);
        }
        
        this.setupMobileButton(this.elements.settingsBtn, () => {
            console.log('Guide button callback triggered');
            
            // If we're in battle, pause the game
            if (this.gameEngine.currentScene === 'battle') {
                console.log('Pausing game from guide button');
                this.gameEngine.pauseGame();
            } else {
                // Otherwise show guide screen
                this.showScreen('settingsScreen');
            }
        });
        
        // Emergency fallback for guide button - direct event listeners
        if (this.elements.settingsBtn) {
            const emergencyClickHandler = (e) => {
                console.log('Emergency guide button handler triggered');
                e.preventDefault();
                e.stopPropagation();
                
                // If we're in battle, pause the game
                if (this.gameEngine.currentScene === 'battle') {
                    console.log('Emergency pause game from guide button');
                    this.gameEngine.pauseGame();
                } else {
                    // Otherwise show guide screen
                    this.showScreen('settingsScreen');
                }
            };
            
            // Add multiple event types to ensure it works
            this.elements.settingsBtn.addEventListener('click', emergencyClickHandler, { passive: false });
            this.elements.settingsBtn.addEventListener('touchstart', emergencyClickHandler, { passive: false });
            this.elements.settingsBtn.addEventListener('pointerdown', emergencyClickHandler, { passive: false });
            
            console.log('Emergency settings button handlers added');
        }
        
        // Pause button (the gear icon in HUD)
        if (this.elements.pauseBtn) {
            this.setupMobileButton(this.elements.pauseBtn, () => {
                console.log('Pause button clicked');
                this.gameEngine.pauseGame();
            });
        }
        
        // Fullscreen button
        if (this.elements.fullscreenBtn) {
            this.setupMobileButton(this.elements.fullscreenBtn, () => {
                Utils.toggleFullscreen().catch(err => {
                    console.warn('Error toggling fullscreen:', err);
                });
            });
        }
        
        this.setupMobileButton(this.elements.continueBtn, () => {
            this.gameEngine.continueToNextWave();
        });
        
        this.setupMobileButton(this.elements.backToBaseBtn, () => {
            this.showScreen('baseScreen');
        });
        
        this.setupMobileButton(this.elements.backToMenuBtn, () => {
            this.showScreen('mainMenu');
        });
        
        this.setupMobileButton(this.elements.backToMenuFromSettingsBtn, () => {
            this.showScreen('mainMenu');
        });
        
        this.setupMobileButton(this.elements.resetGameBtn, () => {
            this.handleResetGame();
        });
        
        // Add handler for the new Battle button in base screen
        if (this.elements.startBattleFromBaseBtn) {
            this.setupMobileButton(this.elements.startBattleFromBaseBtn, () => {
                this.showBattleTypeSelection();
            });
        }
        
        // Upgrade buttons - Enhanced for mobile touch support
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            this.setupMobileButton(btn, () => {
                const upgradeType = btn.getAttribute('data-upgrade');
                this.handleUpgrade(upgradeType);
            });
        });
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('#mobileControls')) {
                e.preventDefault();
            }
        });
        
        // Prevent scrolling on touch
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('#gameContainer')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Setup battle type modal event listeners
        this.setupBattleTypeModal();
        
        // Setup pause modal event listeners
        this.setupPauseModal();
    }

    setupPauseModal() {
        // Resume button
        if (this.elements.resumeBtn) {
            this.setupMobileButton(this.elements.resumeBtn, () => {
                this.gameEngine.resumeGame();
            });
        }
        
        // Exit to menu button
        if (this.elements.exitBattleBtn) {
            this.setupMobileButton(this.elements.exitBattleBtn, () => {
                this.gameEngine.exitToMenu();
            });
        }
    }

    setupBattleTypeModal() {
        const modal = this.elements.battleTypeModal;
        
        // Set up battle type button event listeners
        const battleButtons = modal.querySelectorAll('.battle-type-btn');
        battleButtons.forEach(btn => {
            // Helper function to handle both touch and click
            const handleBattleTypeSelection = (e) => {
                e.preventDefault(); // Prevent default behavior
                const battleType = btn.getAttribute('data-type');
                
                // Add visual feedback
                btn.classList.add('active');
                
                // Small delay for visual feedback
                setTimeout(() => {
                    // Hide the modal
                    modal.classList.add('hidden');
                    
                    // Start the battle directly without fullscreen request
                    this.gameEngine.startBattle(battleType);
                }, 150);
            };
            
            // Add both touch and click event listeners
            btn.addEventListener('touchstart', handleBattleTypeSelection, { passive: false });
            btn.addEventListener('click', handleBattleTypeSelection);
        });
        
        // Close button
        const closeBtn = modal.querySelector('.modal-close-btn');
        const handleClose = (e) => {
            e.preventDefault();
            modal.classList.add('hidden');
        };
        
        closeBtn.addEventListener('touchstart', handleClose, { passive: false });
        closeBtn.addEventListener('click', handleClose);
    }

    handleShoot() {
        if (this.gameEngine.currentScene === 'battle' && this.gameEngine.player) {
            // Get canvas center as default target
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Pass enemies array for auto-aim
            const enemies = this.gameEngine.waveManager ? this.gameEngine.waveManager.enemies : [];
            this.gameEngine.player.manualShoot(centerX, centerY, enemies);
        }
    }

    handleSkillUse(skillIndex) {
        if (this.gameEngine.currentScene === 'battle' && this.gameEngine.skillManager) {
            this.gameEngine.skillManager.manualCastSkill(
                skillIndex, 
                this.gameEngine.player, 
                this.gameEngine.waveManager.enemies
            );
        }
    }

    handleStartBattle() {
        // Show battle type selection directly without requesting fullscreen
        this.showBattleTypeSelection();
    }
    
    // Removed unused fullscreen request functions
    // requestFullscreenAndShowBattleType(), showLoadingMessage(), hideLoadingMessage()
    
    showBattleTypeSelection() {
        // Use the existing modal element
        const modal = this.elements.battleTypeModal;
        
        // Check specifically for iPhone 14 Pro Max dimensions (or similar)
        const isIPhone14ProMaxLandscape = window.innerWidth >= 900 && window.innerHeight <= 430;
        
        // Add a class for iPhone 14 Pro Max
        if (isIPhone14ProMaxLandscape) {
            modal.classList.add('iphone14-landscape');
        } else {
            modal.classList.remove('iphone14-landscape');
        }
        
        // Show the modal
        modal.classList.remove('hidden');
    }

    handleUpgrade(upgradeType) {
        if (!this.gameEngine.player || !this.gameEngine.upgradeManager) return;
        
        const success = this.gameEngine.upgradeManager.upgradeItem(upgradeType, this.gameEngine.player);
        
        if (success) {
            this.updateBaseScreen();
            this.showNotification(`Upgraded ${upgradeType}!`, 'success');
        } else {
            this.showNotification('Not enough coins!', 'error');
        }
    }

    handleResetGame() {
        // Show custom confirmation dialog before resetting
        this.showConfirmDialog(
            this.localization.t('reset_game_title'),
            this.localization.t('reset_game_message'),
            [
                this.localization.t('reset_bullet_upgrades'),
                this.localization.t('reset_bullet_level'),
                this.localization.t('reset_bullet_coins'),
                this.localization.t('reset_bullet_skills')
            ],
            this.localization.t('reset_game_warning'),
            () => {
                // Call the resetGame function from the game engine
                this.gameEngine.resetGame();
                
                // Navigate back to main menu
                this.showScreen('mainMenu');
                
                // Update all screens to reflect the reset
                this.updateBaseScreen();
                this.updateHUD();
            }
        );
    }
    
    showConfirmDialog(title, message, bulletPoints = [], warningText = '', confirmCallback) {
        // Use the static modal from HTML
        const modal = this.elements.confirmDialog;
        
        // Check if we're on a small screen in landscape mode
        const isLandscape = window.innerWidth > window.innerHeight;
        const isSmallScreen = window.innerHeight < 450;
        const isIPhone14ProMaxLandscape = window.innerWidth >= 900 && window.innerHeight <= 430;
        
        // Add a class for iPhone 14 Pro Max
        if (isIPhone14ProMaxLandscape) {
            modal.classList.add('iphone14-landscape');
        } else {
            modal.classList.remove('iphone14-landscape');
        }
        
        // Update the dynamic content
        this.elements.confirmTitle.textContent = title;
        this.elements.confirmMessage.textContent = message;
        
        // Handle bullet points
        if (bulletPoints.length > 0) {
            this.elements.confirmBullets.innerHTML = bulletPoints.map(point => `<li>${point}</li>`).join('');
            this.elements.confirmBullets.style.display = 'block';
        } else {
            this.elements.confirmBullets.innerHTML = '';
            this.elements.confirmBullets.style.display = 'none';
        }
        
        // Handle warning text
        if (warningText) {
            this.elements.confirmWarning.textContent = warningText;
            this.elements.confirmWarning.style.display = 'block';
        } else {
            this.elements.confirmWarning.textContent = '';
            this.elements.confirmWarning.style.display = 'none';
        }
        
        // Show the modal
        modal.classList.remove('hidden');
        
        // Clear any existing event listeners by cloning the button elements
        const confirmBtn = modal.querySelector('.confirm-btn');
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        const closeBtn = modal.querySelector('.cancel-btn');
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        // Add event listeners to buttons
        const handleConfirm = (e) => {
            e.preventDefault();
            modal.classList.add('hidden');
            if (typeof confirmCallback === 'function') {
                confirmCallback();
            }
        };
        newConfirmBtn.addEventListener('click', handleConfirm);
        newConfirmBtn.addEventListener('touchend', handleConfirm);
        
        // Close button
        const handleClose = (e) => {
            e.preventDefault();
            modal.classList.add('hidden');
        };
        newCloseBtn.addEventListener('click', handleClose);
        newCloseBtn.addEventListener('touchend', handleClose);
        
        // Modal backdrop click to close
        const handleBackdropClick = (e) => {
            if (e.target === modal) {
                handleClose(e);
            }
        };
        modal.addEventListener('click', handleBackdropClick);
        
        // Prevent modal content clicks from closing the modal
        const modalContent = modal.querySelector('.modal-content');
        modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    updateHUD() {
        if (this.gameEngine.currentScene !== 'battle' || !this.gameEngine.player) return;
        
        const player = this.gameEngine.player;
        const waveManager = this.gameEngine.waveManager;
        
        // Update health (main tank only)
        const healthPercent = player.mainTank.health / player.mainTank.maxHealth;
        this.elements.healthFill.style.width = `${healthPercent * 100}%`;
        this.elements.healthText.textContent = `${player.mainTank.health}/${player.mainTank.maxHealth}`;
        
        // Update wave info
        this.elements.waveText.textContent = `${this.localization.t('wave')} ${waveManager.currentWave}`;
        this.elements.enemiesLeft.textContent = `${this.localization.t('enemies')}: ${waveManager.getEnemiesRemaining()}`;
        
        // Update score
        this.elements.scoreText.textContent = `${this.localization.t('score')}: ${Utils.formatNumber(player.score)}`;
        
        // Update skill buttons
        const skillInfo = this.gameEngine.skillManager.getSkillInfo();
        const skillButtons = [this.elements.skill1Btn, this.elements.skill2Btn, this.elements.skill3Btn];
        
        skillButtons.forEach((btn, index) => {
            const skill = skillInfo.active[index];
            if (skill) {
                // Use localized skill name
                const skillName = skill.getLocalizedName ? skill.getLocalizedName() : skill.name;
                btn.textContent = `${skill.emoji || '⚡'} ${skillName || 'NO NAME'}`;
                btn.disabled = !skill.isReady;
                btn.style.opacity = skill.isReady ? '1' : '0.5';
                
                if (skill.isActive) {
                    btn.classList.add('btn-pulse');
                } else {
                    btn.classList.remove('btn-pulse');
                }
            } else {
                btn.textContent = `SKILL ${index + 1}`;
                btn.disabled = true;
                btn.style.opacity = '0.3';
            }
        });
    }

    getJoystickInput() {
        return this.joystick.getDirection();
    }

    showScreen(screenName) {
        console.log('Showing screen:', screenName);
        
        // Hide all screens
        Object.values(this.elements.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = this.elements.screens[screenName];
        if (targetScreen) {
            console.log('Target screen found:', targetScreen.id);
            targetScreen.classList.add('active');
            
            // Update screen content
            if (screenName === 'baseScreen') {
                this.updateBaseScreen();
            }
        } else {
            console.error('Target screen not found:', screenName);
            console.log('Available screens:', Object.keys(this.elements.screens));
        }
    }

    showSkillSelection(skillChoices) {
        this.elements.skillOptions.innerHTML = '';
        this.skillSelectionInProgress = false;
        this.selectedSkillElement = null;
        
        skillChoices.forEach(skill => {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'skill-option';
            skillDiv.setAttribute('data-skill-id', skill.id);
            const skillName = skill.getLocalizedName ? skill.getLocalizedName() : skill.name;
            const skillDesc = skill.getLocalizedDescription ? skill.getLocalizedDescription() : skill.description;
            skillDiv.innerHTML = `
                <div class="skill-emoji">${skill.emoji}</div>
                <h3>${skillName}</h3>
                <p>${skillDesc}</p>
                <p><strong>Type:</strong> ${skill.type}</p>
            `;
            
            // Use mobile-friendly touch events for skill selection
            this.setupMobileButton(skillDiv, () => {
                if (!this.skillSelectionInProgress) {
                    this.selectedSkillElement = skillDiv;
                    this.selectSkill(skill.id);
                }
            });
            
            this.elements.skillOptions.appendChild(skillDiv);
        });
        
        this.showScreen('skillSelection');
    }

    selectSkill(skillId) {
        // Prevent multiple selections
        if (this.gameEngine.currentScene !== 'skillSelection' || this.skillSelectionInProgress) {
            console.log('Skill selection blocked - already in progress or wrong scene');
            return;
        }
        
        console.log('Skill selected:', skillId);
        this.skillSelectionInProgress = true;
        
        try {
            // Enhanced visual feedback for mobile
            document.querySelectorAll('.skill-option').forEach(option => {
                option.style.pointerEvents = 'none';
                option.style.opacity = '0.6';
                option.style.transform = 'scale(0.95)';
            });
            
            // Add selection animation
            if (this.selectedSkillElement) {
                this.selectedSkillElement.style.opacity = '1';
                this.selectedSkillElement.style.transform = 'scale(1.05)';
                this.selectedSkillElement.style.borderColor = '#00ff00';
                this.selectedSkillElement.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)';
            }
            
            console.log('About to add skill to skill manager...');
            const addSkillResult = this.gameEngine.skillManager.addSkill(skillId);
            
            if (addSkillResult) {
                console.log('Skill successfully added, resuming battle...');
                
                // Add a small delay to ensure any passive effects are fully applied
                setTimeout(() => {
                    this.gameEngine.resumeBattle();
                }, 100);
            } else {
                console.error('Failed to add skill');
                this.skillSelectionInProgress = false;
                // Reset visual feedback
                document.querySelectorAll('.skill-option').forEach(option => {
                    option.style.pointerEvents = 'auto';
                    option.style.opacity = '1';
                    option.style.transform = 'scale(1)';
                });
            }
            
        } catch (error) {
            console.error('Error in selectSkill:', error);
            this.skillSelectionInProgress = false;
            // Report error to Sentry if available
            if (window.Sentry) {
                window.Sentry.captureException(error);
            }
        }
    }

    showBattleResults(results) {
        // Update stats
        this.elements.waveCompleted.textContent = results.wave;
        this.elements.enemiesDefeated.textContent = results.enemiesDefeated;
        this.elements.scoreEarned.textContent = Utils.formatNumber(results.scoreEarned);
        this.elements.expGained.textContent = results.expGained;
        
        // Update title based on victory/defeat and final wave status
        const battleResultTitle = document.getElementById('battleResultTitle');
        if (battleResultTitle) {
            if (results.victory) {
                if (results.isFinalWave) {
                    battleResultTitle.textContent = this.localization.t('complete_victory');
                    battleResultTitle.style.color = '#ffdd44'; // Gold color for final victory
                } else {
                    battleResultTitle.textContent = this.localization.t('battle_victory');
                    battleResultTitle.style.color = '#44ff44'; // Success green
                }
            } else {
                battleResultTitle.textContent = this.localization.t('battle_defeat');
                battleResultTitle.style.color = '#ff4444'; // Danger red
            }
        }
        
        // Add bonus message for final wave completion
        const bonusMessage = document.getElementById('bonusMessage') || this.createBonusMessageElement();
        if (results.bonusApplied) {
            let bonusText = '';
            let baseMultiplierText = '';
            
            // Set bonus text based on battle type
            switch (results.battleType) {
                case 'quick':
                    bonusText = '+30%';
                    baseMultiplierText = '';  // No base multiplier for quick battles
                    break;
                case 'standard':
                    bonusText = '+50%';
                    baseMultiplierText = ' (Base: +20%)';
                    break;
                case 'extended':
                    bonusText = '+100%';
                    baseMultiplierText = ' (Base: +50%)';
                    break;
                default:
                    bonusText = '+50%';
                    baseMultiplierText = '';
            }
            
            bonusMessage.textContent = `🌟 ${results.battleType.charAt(0).toUpperCase() + results.battleType.slice(1)} Battle Rewards: ${bonusText} Completion Bonus${baseMultiplierText}! 🌟`;
            bonusMessage.style.display = 'block';
        } else {
            bonusMessage.style.display = 'none';
        }
        
        // Show/hide continue button based on victory and if it's not the final wave
        if (this.elements.continueBtn) {
            if (results.victory && !results.isFinalWave) {
                this.elements.continueBtn.style.display = 'inline-block';
            } else {
                this.elements.continueBtn.style.display = 'none';
            }
        }
        
        // Show the results screen
        this.showScreen('battleResults');
    }
    
    createBonusMessageElement() {
        // Create bonus message element if it doesn't exist
        const bonusMessage = document.createElement('div');
        bonusMessage.id = 'bonusMessage';
        bonusMessage.style.color = '#ffdd44'; // Gold color
        bonusMessage.style.fontSize = '1.2em';
        bonusMessage.style.fontWeight = 'bold';
        bonusMessage.style.marginTop = '10px';
        bonusMessage.style.marginBottom = '10px';
        bonusMessage.style.textAlign = 'center';
        bonusMessage.style.padding = '5px';
        bonusMessage.style.borderRadius = '5px';
        bonusMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        
        // Insert after the battle result title
        const battleResultTitle = document.getElementById('battleResultTitle');
        if (battleResultTitle && battleResultTitle.parentNode) {
            battleResultTitle.parentNode.insertBefore(bonusMessage, battleResultTitle.nextSibling);
        } else {
            // Fallback - insert at the beginning of the battle results screen
            const battleResults = document.getElementById('battleResults');
            if (battleResults) {
                battleResults.insertBefore(bonusMessage, battleResults.firstChild);
            }
        }
        
        return bonusMessage;
    }

    updateBaseScreen() {
        if (!this.gameEngine.player || !this.gameEngine.upgradeManager) return;
        
        const player = this.gameEngine.player;
        const upgradeManager = this.gameEngine.upgradeManager;
        
        // Update tank stats
        this.elements.tankHealth.textContent = player.mainTank.maxHealth;
        this.elements.tankDamage.textContent = player.mainTank.damage.toFixed(0);
        this.elements.tankSpeed.textContent = player.mainTank.speed.toFixed(1);
        this.elements.miniHealth.textContent = player.miniTanks[0]?.maxHealth || 0;
        this.elements.miniDamage.textContent = (player.miniTanks[0]?.damage || 0).toFixed(0);
        
        // Update additional stats
        const miniSpeedElement = document.getElementById('miniSpeed');
        if (miniSpeedElement) {
            miniSpeedElement.textContent = (player.miniTanks[0]?.speed || 0).toFixed(1);
        }
        
        const tankFireRateElement = document.getElementById('tankFireRate');
        if (tankFireRateElement) {
            const fireRateUpgrade = upgradeManager.getUpgrade('mainFireRate');
            const reduction = fireRateUpgrade ? Math.round((1 - Math.pow(0.9, fireRateUpgrade.level)) * 100) : 0;
            tankFireRateElement.textContent = `${100 - reduction}%`;
        }
        
        const miniFireRateElement = document.getElementById('miniFireRate');
        if (miniFireRateElement) {
            const fireRateUpgrade = upgradeManager.getUpgrade('miniFireRate');
            const reduction = fireRateUpgrade ? Math.round((1 - Math.pow(0.9, fireRateUpgrade.level)) * 100) : 0;
            miniFireRateElement.textContent = `${100 - reduction}%`;
        }
        
        // Update formation stats
        const formationElement = document.getElementById('formation');
        if (formationElement) {
            formationElement.textContent = player.miniTanks.length;
        }
        
        const coordinationElement = document.getElementById('coordination');
        if (coordinationElement) {
            const coordBonus = Math.round((player.coordinationBonus || 0) * 100);
            coordinationElement.textContent = `${100 + coordBonus}%`;
        }
        
        // Update economy stats
        const coinBonusElement = document.getElementById('coinBonus');
        if (coinBonusElement) {
            const coinBonus = Math.round(((player.coinMultiplier || 1) - 1) * 100);
            coinBonusElement.textContent = `${100 + coinBonus}%`;
        }
        
        const expBonusElement = document.getElementById('expBonus');
        if (expBonusElement) {
            const expBonus = Math.round(((player.expMultiplier || 1) - 1) * 100);
            expBonusElement.textContent = `${100 + expBonus}%`;
        }
        
        // Update special stats
        const bulletSpeedElement = document.getElementById('bulletSpeed');
        if (bulletSpeedElement) {
            const bulletUpgrade = upgradeManager.getUpgrade('bulletSpeed');
            bulletSpeedElement.textContent = 5 + (bulletUpgrade ? bulletUpgrade.level : 0);
        }
        
        const autoRepairElement = document.getElementById('autoRepair');
        if (autoRepairElement) {
            autoRepairElement.textContent = (player.autoRepairRate || 0).toFixed(1);
        }
        
        const shieldElement = document.getElementById('shield');
        if (shieldElement) {
            shieldElement.textContent = player.maxShieldPoints || 0;
        }
        
        const multiShotElement = document.getElementById('multiShot');
        if (multiShotElement) {
            const multiShotBonus = Math.round((player.multiShotChance || 0) * 100);
            multiShotElement.textContent = `${multiShotBonus}%`;
        }
        
        // Update player stats
        this.elements.playerLevel.textContent = player.level;
        this.elements.playerExp.textContent = player.experience;
        this.elements.playerExpNext.textContent = player.experienceToNext;
        this.elements.playerCoins.textContent = Utils.formatNumber(player.coins);
        
        // Update upgrade button states and costs
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            const upgradeType = btn.getAttribute('data-upgrade');
            const upgrade = upgradeManager.getUpgrade(upgradeType);
            
            if (upgrade) {
                const canUpgrade = upgrade.canUpgrade(player.coins);
                btn.disabled = !canUpgrade;
                
                // Update cost display
                const costElement = btn.querySelector('.upgrade-cost');
                if (costElement) {
                    costElement.textContent = `${upgrade.getCurrentCost()}💰`;
                }
                
                // Update bonus display
                const bonusElement = btn.querySelector('.upgrade-bonus');
                if (bonusElement) {
                    const effect = upgradeManager.getUpgradeEffect(upgradeType, 1);
                    bonusElement.textContent = effect || `+${upgrade.baseValue}`;
                }
            }
        });
    }

    showDamageText(x, y, damage, isHeal = false) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        
        const damageDiv = document.createElement('div');
        damageDiv.className = isHeal ? 'damage-text heal-text' : 'damage-text';
        damageDiv.textContent = isHeal ? `+${damage.toFixed(0)}` : `-${damage.toFixed(0)}`;
        damageDiv.style.left = `${rect.left + (x / canvas.width) * rect.width}px`;
        damageDiv.style.top = `${rect.top + (y / canvas.height) * rect.height}px`;
        
        document.body.appendChild(damageDiv);
        
        // Remove after animation
        setTimeout(() => {
            if (damageDiv.parentNode) {
                damageDiv.parentNode.removeChild(damageDiv);
            }
        }, 1000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Special styling for battle notifications
        if (type === 'battle') {
            notification.innerHTML = `<div class="battle-notification-content">${message}</div>`;
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 20px 30px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                border-radius: 15px;
                border: 3px solid #ff7e5f;
                z-index: 1000;
                animation: fadeInOut 2s ease-out;
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                box-shadow: 0 0 30px rgba(255, 126, 95, 0.5);
            `;
            
            // Add CSS animation for battle notification
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    30% { transform: translate(-50%, -50%) scale(1); }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
            
            // Remove the style element when notification is removed
            setTimeout(() => {
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 2500);
            
            // Shorter display time for battle notification
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 2500);
        } else {
            // Regular notifications
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: ${type === 'success' ? '#44aa44' : type === 'error' ? '#aa4444' : '#4a9eff'};
                color: white;
                border-radius: 8px;
                z-index: 1000;
                animation: slideUp 0.3s ease-out;
            `;
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
        
        document.body.appendChild(notification);
    }

    showLoading(progress = 0) {
        this.elements.loadingScreen.style.display = 'flex';
        this.elements.loadingProgress.style.width = `${progress}%`;
    }

    hideLoading() {
        this.elements.loadingScreen.style.display = 'none';
    }

    adjustCanvasSize() {
        const canvas = document.getElementById('gameCanvas');
        const container = document.getElementById('gameContainer');
        
        const containerRect = container.getBoundingClientRect();
        
        // Use full screen dimensions
        const width = containerRect.width;
        const height = containerRect.height;
        
        // Get device pixel ratio for crisp rendering on high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        console.log(`Device pixel ratio detected: ${dpr}`);
        
        // Set the internal canvas resolution to match screen size * device pixel ratio
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        // Set the CSS size to fill the screen
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.left = '0px';
        canvas.style.top = '0px';
        
        // Scale the canvas context to match the device pixel ratio
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        // Set additional context properties for crisp rendering
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        
        // Store dimensions for game logic
        this.canvasScale = dpr;
        this.canvasOffsetX = 0;
        this.canvasOffsetY = 0;
        
        console.log(`Canvas resized to full screen: ${width}x${height} (DPR: ${dpr})`);
        
        // Ensure crisp rendering is maintained after resize
        if (window.gameEngine && window.gameEngine.setupContextForCrispRendering) {
            window.gameEngine.setupContextForCrispRendering();
        }
    }

    setupMobileButton(button, callback) {
        if (!button) {
            console.warn('setupMobileButton called with null/undefined button');
            return;
        }
        
        console.log('Setting up mobile button:', button.id || 'unnamed button');
        
        let touchStarted = false;
        let touchMoved = false;
        
        // Enhanced touch support for iPhone Safari
        const handleTouchStart = (e) => {
            console.log('Touch start on button:', button.id);
            e.preventDefault();
            touchStarted = true;
            touchMoved = false;
            
            // Add visual feedback
            button.style.transform = 'scale(0.95)';
            button.style.opacity = '0.8';
        };
        
        const handleTouchMove = (e) => {
            if (touchStarted) {
                console.log('Touch move on button:', button.id);
                touchMoved = true;
            }
        };
        
        const handleTouchEnd = (e) => {
            console.log('Touch end on button:', button.id, 'touchStarted:', touchStarted, 'touchMoved:', touchMoved);
            e.preventDefault();
            
            // Reset visual feedback
            button.style.transform = 'scale(1)';
            button.style.opacity = '1';
            
            // Only trigger callback if touch didn't move (actual tap)
            if (touchStarted && !touchMoved) {
                console.log('Button touched successfully:', button.id);
                callback();
            }
            
            touchStarted = false;
            touchMoved = false;
        };
        
        const handleClick = (e) => {
            console.log('Button clicked:', button.id);
            e.preventDefault();
            callback();
        };
        
        // Add event listeners
        button.addEventListener('touchstart', handleTouchStart, { passive: false });
        button.addEventListener('touchmove', handleTouchMove, { passive: false });
        button.addEventListener('touchend', handleTouchEnd, { passive: false });
        button.addEventListener('touchcancel', handleTouchEnd, { passive: false });
        
        // Keep click for desktop/fallback
        button.addEventListener('click', handleClick);
        
        // Prevent default behaviors that might interfere
        button.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Debug: Check button's computed style
        const computedStyle = window.getComputedStyle(button);
        console.log('Button styles for', button.id, ':', {
            pointerEvents: computedStyle.pointerEvents,
            zIndex: computedStyle.zIndex,
            position: computedStyle.position,
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity
        });
        
        // Make sure button is touchable
        button.style.touchAction = 'manipulation';
        button.style.userSelect = 'none';
        button.style.webkitUserSelect = 'none';
        button.style.webkitTouchCallout = 'none';
        button.style.webkitTapHighlightColor = 'transparent';
        
        // Additional debugging for iOS/Safari issues
        if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
            console.log('iOS device detected, applying additional touch fixes for button:', button.id);
            button.style.cursor = 'pointer';
        }
        
        // Test direct touch on button element
        button.addEventListener('touchstart', (e) => {
            console.log('Direct touchstart event on button:', button.id);
        }, { passive: false, capture: true });
        
        console.log('Mobile button setup complete for:', button.id);
    }

    showPauseModal() {
        console.log('Showing pause modal');
        if (this.elements.pauseModal) {
            this.elements.pauseModal.style.display = 'flex';
            
            // iPhone viewport height fix
            this.fixModalForIPhone(this.elements.pauseModal);
        }
    }

    hidePauseModal() {
        console.log('Hiding pause modal');
        if (this.elements.pauseModal) {
            this.elements.pauseModal.style.display = 'none';
            
            // Clean up iPhone fixes
            if (this.elements.pauseModal._iphoneCleanup) {
                this.elements.pauseModal._iphoneCleanup();
            }
        }
    }

    fixModalForIPhone(modal) {
        // Fix iPhone viewport height issues
        const isIPhone = /iPhone|iPad/i.test(navigator.userAgent);
        const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIPhone || isIOSSafari) {
            console.log('Applying iPhone modal fixes');
            
            // Fix viewport height
            const viewportHeight = window.innerHeight;
            modal.style.height = `${viewportHeight}px`;
            
            // Ensure modal is properly centered
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.zIndex = '1000';
            
            // Apply CSS transforms for centering
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.position = 'relative';
                modalContent.style.margin = 'auto';
                modalContent.style.transform = 'translateZ(0)';
            }
            
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            // Add a resize listener to handle orientation changes
            const resizeHandler = () => {
                if (modal.style.display === 'flex') {
                    modal.style.height = `${window.innerHeight}px`;
                }
            };
            
            window.addEventListener('resize', resizeHandler);
            window.addEventListener('orientationchange', () => {
                setTimeout(resizeHandler, 100);
            });
            
            // Store cleanup function
            modal._iphoneCleanup = () => {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                window.removeEventListener('resize', resizeHandler);
            };
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Handle window resize
window.addEventListener('resize', Utils.debounce(() => {
    if (window.gameUI) {
        window.gameUI.adjustCanvasSize();
    }
}, 250));

// Handle orientation change for mobile devices
window.addEventListener('orientationchange', Utils.debounce(() => {
    if (window.gameUI) {
        // Small delay to ensure screen size is updated
        setTimeout(() => {
            window.gameUI.adjustCanvasSize();
        }, 100);
    }
}, 250));

// Export for global access
window.VirtualJoystick = VirtualJoystick;
window.GameUI = GameUI;