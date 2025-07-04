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
        
        this.setupEventListeners();
        this.updateInterval = setInterval(() => this.updateHUD(), 100);
    }

    initializeElements() {
        return {
            // HUD Elements
            healthFill: document.getElementById('healthFill'),
            healthText: document.getElementById('healthText'),
            waveText: document.getElementById('waveText'),
            enemiesLeft: document.getElementById('enemiesLeft'),
            scoreText: document.getElementById('scoreText'),
            
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
            loadingProgress: document.getElementById('loadingProgress')
        };
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
        
        this.setupMobileButton(this.elements.settingsBtn, () => {
            this.showScreen('settingsScreen');
        });
        
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
        // Show battle type selection dialog
        this.showBattleTypeSelection();
    }
    
    showBattleTypeSelection() {
        // Create a modal dialog for battle type selection
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        // Check if we're on a small screen in landscape mode
        const isSmallLandscape = window.innerHeight <= 450 && window.innerWidth > window.innerHeight;
        
        // Check specifically for iPhone 14 Pro Max dimensions (or similar)
        const isIPhone14ProMaxLandscape = window.innerWidth >= 900 && window.innerHeight <= 430;
        
        // Add a class for iPhone 14 Pro Max
        if (isIPhone14ProMaxLandscape) {
            modal.classList.add('iphone14-landscape');
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Select Battle Type</h2>
                <p class="modal-instruction">Click on a battle type to begin</p>
                <div class="battle-type-options">
                    <button class="battle-type-btn" data-type="quick">
                        <span class="battle-icon">⚡</span>
                        <div class="battle-info">
                            <span class="battle-name">Quick Battle</span>
                            <span class="battle-desc">3 Waves</span>
                            <span class="battle-reward">Reward: x1.0 (x1.3 bonus)</span>
                        </div>
                        <span class="battle-click-hint">▶</span>
                    </button>
                    <button class="battle-type-btn" data-type="standard">
                        <span class="battle-icon">🔥</span>
                        <div class="battle-info">
                            <span class="battle-name">Standard Battle</span>
                            <span class="battle-desc">5 Waves</span>
                            <span class="battle-reward">Reward: x1.2 (x1.5 bonus)</span>
                        </div>
                        <span class="battle-click-hint">▶</span>
                    </button>
                    <button class="battle-type-btn" data-type="extended">
                        <span class="battle-icon">💪</span>
                        <div class="battle-info">
                            <span class="battle-name">Extended Battle</span>
                            <span class="battle-desc">10 Waves</span>
                            <span class="battle-reward">Reward: x1.5 (x2.0 bonus)</span>
                        </div>
                        <span class="battle-click-hint">▶</span>
                    </button>
                </div>
                <button class="modal-close-btn">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners to buttons
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
                    if (modal.parentNode) {
                        document.body.removeChild(modal);
                    }
                    
                    // Request fullscreen and start battle
                    Utils.requestFullscreen(document.documentElement)
                        .then(() => {
                            console.log('Fullscreen mode activated');
                            // Start the battle after fullscreen is activated
                            this.gameEngine.startBattle(battleType);
                        })
                        .catch((error) => {
                            console.warn('Fullscreen request failed:', error);
                            // Start the battle even if fullscreen fails
                            this.gameEngine.startBattle(battleType);
                        });
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
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        };
        
        closeBtn.addEventListener('touchstart', handleClose, { passive: false });
        closeBtn.addEventListener('click', handleClose);
    }

    handleUpgrade(upgradeType) {
        if (!this.gameEngine.player) return;
        
        const costs = {
            health: 100,
            damage: 150,
            speed: 200,
            miniHealth: 80,
            miniDamage: 120
        };
        
        const cost = costs[upgradeType];
        if (!cost) return;
        
        let success = false;
        
        if (['health', 'damage', 'speed'].includes(upgradeType)) {
            success = this.gameEngine.player.upgradeMainTank(upgradeType, cost);
        } else if (['miniHealth', 'miniDamage'].includes(upgradeType)) {
            const stat = upgradeType.replace('mini', '').toLowerCase();
            success = this.gameEngine.player.upgradeMiniTanks(stat, cost);
        }
        
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
            'Reset Game',
            '⚠️ WARNING: This will delete ALL your progress!',
            [
                '• All tank upgrades will be lost',
                '• Your level and experience will reset',
                '• All earned coins will be removed',
                '• All unlocked skills will be lost'
            ],
            'This action cannot be undone.',
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
        // Create a modal dialog for confirmation
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        // Check if we're on a small screen in landscape mode
        const isLandscape = window.innerWidth > window.innerHeight;
        const isSmallScreen = window.innerHeight < 450;
        const isIPhone14ProMaxLandscape = window.innerWidth >= 900 && window.innerHeight <= 430;
        
        // Add a class for iPhone 14 Pro Max
        if (isIPhone14ProMaxLandscape) {
            modal.classList.add('iphone14-landscape');
        }
        
        // Create bullet points HTML if provided
        let bulletPointsHtml = '';
        if (bulletPoints.length > 0) {
            bulletPointsHtml = '<ul class="confirm-bullets">';
            bulletPoints.forEach(point => {
                bulletPointsHtml += `<li>${point}</li>`;
            });
            bulletPointsHtml += '</ul>';
        }
        
        // Create warning text HTML if provided
        let warningHtml = '';
        if (warningText) {
            warningHtml = `<p class="confirm-warning">${warningText}</p>`;
        }
        
        modal.innerHTML = `
            <div class="modal-content confirm-dialog">
                <h2>${title}</h2>
                <p class="confirm-message">${message}</p>
                ${bulletPointsHtml}
                ${warningHtml}
                <div class="confirm-buttons">
                    <button class="modal-close-btn cancel-btn">Cancel</button>
                    <button class="confirm-btn">Confirm</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners to buttons
        const confirmBtn = modal.querySelector('.confirm-btn');
        const handleConfirm = (e) => {
            e.preventDefault();
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
            if (typeof confirmCallback === 'function') {
                confirmCallback();
            }
        };
        confirmBtn.addEventListener('click', handleConfirm);
        confirmBtn.addEventListener('touchend', handleConfirm);
        
        // Close button
        const closeBtn = modal.querySelector('.cancel-btn');
        const handleClose = (e) => {
            e.preventDefault();
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        };
        closeBtn.addEventListener('click', handleClose);
        closeBtn.addEventListener('touchend', handleClose);
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
        this.elements.waveText.textContent = `Wave ${waveManager.currentWave}`;
        this.elements.enemiesLeft.textContent = `Enemies: ${waveManager.getEnemiesRemaining()}`;
        
        // Update score
        this.elements.scoreText.textContent = `Score: ${Utils.formatNumber(player.score)}`;
        
        // Update skill buttons
        const skillInfo = this.gameEngine.skillManager.getSkillInfo();
        const skillButtons = [this.elements.skill1Btn, this.elements.skill2Btn, this.elements.skill3Btn];
        
        skillButtons.forEach((btn, index) => {
            const skill = skillInfo.active[index];
            if (skill) {
                btn.textContent = skill.name;
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
        // Hide all screens
        Object.values(this.elements.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = this.elements.screens[screenName];
        if (targetScreen) {
            targetScreen.classList.add('active');
            
            // Update screen content
            if (screenName === 'baseScreen') {
                this.updateBaseScreen();
            }
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
            skillDiv.innerHTML = `
                <div class="skill-emoji">${skill.emoji}</div>
                <h3>${skill.name}</h3>
                <p>${skill.description}</p>
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
            return;
        }
        
        console.log('Skill selected:', skillId);
        this.skillSelectionInProgress = true;
        
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
        
        this.gameEngine.skillManager.addSkill(skillId);
        this.gameEngine.resumeBattle();
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
                    battleResultTitle.textContent = '🏆 Complete Victory!';
                    battleResultTitle.style.color = '#ffdd44'; // Gold color for final victory
                } else {
                    battleResultTitle.textContent = '🎖️ Battle Victory!';
                    battleResultTitle.style.color = '#44ff44'; // Success green
                }
            } else {
                battleResultTitle.textContent = '☠️ Battle Defeat';
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
        if (!this.gameEngine.player) return;
        
        const player = this.gameEngine.player;
        
        // Update tank stats
        this.elements.tankHealth.textContent = player.mainTank.maxHealth;
        this.elements.tankDamage.textContent = player.mainTank.damage.toFixed(0);
        this.elements.tankSpeed.textContent = player.mainTank.speed.toFixed(1);
        this.elements.miniHealth.textContent = player.miniTanks[0]?.maxHealth || 0;
        this.elements.miniDamage.textContent = (player.miniTanks[0]?.damage || 0).toFixed(0);
        
        // Update player stats
        this.elements.playerLevel.textContent = player.level;
        this.elements.playerExp.textContent = player.experience;
        this.elements.playerExpNext.textContent = player.experienceToNext;
        this.elements.playerCoins.textContent = Utils.formatNumber(player.coins);
        
        // Update upgrade button states
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            const upgradeType = btn.getAttribute('data-upgrade');
            const costs = {
                health: 100, damage: 150, speed: 200,
                miniHealth: 80, miniDamage: 120
            };
            const cost = costs[upgradeType];
            btn.disabled = player.coins < cost;
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
        if (!button) return;
        
        let touchStarted = false;
        let touchMoved = false;
        
        // Enhanced touch support for iPhone Safari
        const handleTouchStart = (e) => {
            e.preventDefault();
            touchStarted = true;
            touchMoved = false;
            
            // Add visual feedback
            button.style.transform = 'scale(0.95)';
            button.style.opacity = '0.8';
        };
        
        const handleTouchMove = (e) => {
            if (touchStarted) {
                touchMoved = true;
            }
        };
        
        const handleTouchEnd = (e) => {
            e.preventDefault();
            
            // Reset visual feedback
            button.style.transform = 'scale(1)';
            button.style.opacity = '1';
            
            // Only trigger callback if touch didn't move (actual tap)
            if (touchStarted && !touchMoved) {
                console.log('Button touched:', button.id);
                callback();
            }
            
            touchStarted = false;
            touchMoved = false;
        };
        
        const handleClick = (e) => {
            e.preventDefault();
            console.log('Button clicked:', button.id);
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
        
        // Make sure button is touchable
        button.style.touchAction = 'manipulation';
        button.style.userSelect = 'none';
        button.style.webkitUserSelect = 'none';
        button.style.webkitTouchCallout = 'none';
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