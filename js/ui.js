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
                baseScreen: document.getElementById('baseScreen')
            },
            
            // Menu Buttons
            startGameBtn: document.getElementById('startGameBtn'),
            upgradesBtn: document.getElementById('upgradesBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            continueBtn: document.getElementById('continueBtn'),
            backToBaseBtn: document.getElementById('backToBaseBtn'),
            backToMenuBtn: document.getElementById('backToMenuBtn'),
            
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
        
        this.setupMobileButton(this.elements.continueBtn, () => {
            this.gameEngine.continueToNextWave();
        });
        
        this.setupMobileButton(this.elements.backToBaseBtn, () => {
            this.showScreen('baseScreen');
        });
        
        this.setupMobileButton(this.elements.backToMenuBtn, () => {
            this.showScreen('mainMenu');
        });
        
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
        // Request fullscreen first
        Utils.requestFullscreen(document.documentElement)
            .then(() => {
                console.log('Fullscreen mode activated');
                // Start the battle after fullscreen is activated
                this.gameEngine.startBattle();
            })
            .catch((error) => {
                console.warn('Fullscreen request failed:', error);
                // Start the battle even if fullscreen fails
                this.gameEngine.startBattle();
            });
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

    updateHUD() {
        if (this.gameEngine.currentScene !== 'battle' || !this.gameEngine.player) return;
        
        const player = this.gameEngine.player;
        const waveManager = this.gameEngine.waveManager;
        
        // Update health
        const healthPercent = player.getHealthPercent();
        this.elements.healthFill.style.width = `${healthPercent * 100}%`;
        this.elements.healthText.textContent = `${player.getTotalHealth()}/${player.getTotalMaxHealth()}`;
        
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
        this.elements.waveCompleted.textContent = results.wave;
        this.elements.enemiesDefeated.textContent = results.enemiesDefeated;
        this.elements.scoreEarned.textContent = Utils.formatNumber(results.scoreEarned);
        this.elements.expGained.textContent = results.expGained;
        
        this.showScreen('battleResults');
    }

    updateBaseScreen() {
        if (!this.gameEngine.player) return;
        
        const player = this.gameEngine.player;
        
        // Update tank stats
        this.elements.tankHealth.textContent = player.mainTank.maxHealth;
        this.elements.tankDamage.textContent = player.mainTank.damage;
        this.elements.tankSpeed.textContent = player.mainTank.speed.toFixed(1);
        this.elements.miniHealth.textContent = player.miniTanks[0]?.maxHealth || 0;
        this.elements.miniDamage.textContent = player.miniTanks[0]?.damage || 0;
        
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
        damageDiv.textContent = isHeal ? `+${damage}` : `-${damage}`;
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
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
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