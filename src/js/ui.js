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
        
        this.setupEvents();
    }

    setupEvents() {
        // Touch events
        this.base.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.base.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.base.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Mouse events for desktop testing
        this.base.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.base.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.base.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.base.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    }

    handleTouchStart(event) {
        event.preventDefault();
        this.isActive = true;
        this.baseRect = this.base.getBoundingClientRect();
        const touch = event.touches[0];
        this.updateStickPosition(touch.clientX, touch.clientY);
    }

    handleTouchMove(event) {
        if (!this.isActive) return;
        event.preventDefault();
        const touch = event.touches[0];
        this.updateStickPosition(touch.clientX, touch.clientY);
    }

    handleTouchEnd(event) {
        event.preventDefault();
        this.resetStick();
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
    }

    getDirection() {
        return {
            x: this.currentX,
            y: this.currentY,
            magnitude: Math.sqrt(this.currentX * this.currentX + this.currentY * this.currentY)
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
        
        // Menu buttons
        this.elements.startGameBtn.addEventListener('click', () => {
            this.gameEngine.startBattle();
        });
        
        this.elements.upgradesBtn.addEventListener('click', () => {
            this.showScreen('baseScreen');
        });
        
        this.elements.continueBtn.addEventListener('click', () => {
            this.gameEngine.continueToNextWave();
        });
        
        this.elements.backToBaseBtn.addEventListener('click', () => {
            this.showScreen('baseScreen');
        });
        
        this.elements.backToMenuBtn.addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Upgrade buttons
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgradeType = e.target.getAttribute('data-upgrade');
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
            
            this.gameEngine.player.manualShoot(centerX, centerY);
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
        
        skillChoices.forEach(skill => {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'skill-option';
            skillDiv.innerHTML = `
                <h3>${skill.name}</h3>
                <p>${skill.description}</p>
                <p><strong>Type:</strong> ${skill.type}</p>
            `;
            
            skillDiv.addEventListener('click', () => {
                this.selectSkill(skill.id);
            });
            
            this.elements.skillOptions.appendChild(skillDiv);
        });
        
        this.showScreen('skillSelection');
    }

    selectSkill(skillId) {
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
        const aspectRatio = 800 / 600; // Game's aspect ratio
        
        let width = containerRect.width;
        let height = containerRect.height;
        
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }
        
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.left = `${(containerRect.width - width) / 2}px`;
        canvas.style.top = `${(containerRect.height - height) / 2}px`;
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

// Export for global access
window.VirtualJoystick = VirtualJoystick;
window.GameUI = GameUI;