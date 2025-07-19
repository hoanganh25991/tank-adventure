// Optimized UI System for Mobile Controls and Interface
// VirtualJoystick functionality moved to InputManager for better performance

class GameUI {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.elements = this.initializeElements();
        
        this.damageTexts = [];
        this.skillSelectionInProgress = false;
        this.localization = window.Localization;
        
        this.setupEventListeners();
        this.updateInterval = setInterval(() => this.updateHUD(), 100);
        
        // Initialize localization
        this.initializeLocalization();
        
        // Initialize emoji-only buttons for cleaner UI
        this.initializeEmojiButtons();
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
            this.setupMobileButton(englishBtn, () => {
                this.localization.setLanguage('en');
                this.updateLanguageButtons();
                this.updateDynamicText();
            });
        }
        
        if (vietnameseBtn) {
            this.setupMobileButton(vietnameseBtn, () => {
                this.localization.setLanguage('vi');
                this.updateLanguageButtons();
                this.updateDynamicText();
            });
        }
        
        // Initialize UI with current language
        this.localization.updateAllText();
        this.updateLanguageButtons();
    }

    initializeEmojiButtons() {
        // Set primary shoot button to emoji only for cleaner UI
        if (this.elements.primaryShootBtn) {
            this.elements.primaryShootBtn.textContent = '🔥';
            this.elements.primaryShootBtn.title = 'Shoot'; // Add tooltip for accessibility
        }
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
        
        // Re-apply emoji-only buttons after language change
        this.initializeEmojiButtons();
    }

    setupEventListeners() {
        // Note: Mobile control buttons (joystick, shoot, skills) are now handled by InputManager
        // Only setup menu and UI buttons here
        
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
        
        // Note: Touch event handling and scroll prevention now managed by InputManager
        
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
            
            // Use simplified click handler that works for both touch and mouse
            btn.addEventListener('click', handleBattleTypeSelection);
        });
        
        // Close button
        const closeBtn = modal.querySelector('.modal-close-btn');
        const handleClose = (e) => {
            e.preventDefault();
            modal.classList.add('hidden');
        };
        
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

    async handleStartBattle() {
        console.log('handleStartBattle called');
        
        // Request fullscreen first
        try {
            await this.requestFullscreen();
            console.log('Fullscreen enabled successfully');
        } catch (error) {
            console.warn('Fullscreen request failed:', error);
            // Continue anyway - some browsers/situations don't support fullscreen
        }
        
        // Show battle type selection after fullscreen
        this.showBattleTypeSelection();
    }
    
    async requestFullscreen() {
        // Use simplified Utils method
        await Utils.requestFullscreen();
    }
    
    // Removed unused fullscreen request functions
    // requestFullscreenAndShowBattleType(), showLoadingMessage(), hideLoadingMessage()
    
    showBattleTypeSelection() {
        console.log('showBattleTypeSelection called');
        // Use the existing modal element
        const modal = this.elements.battleTypeModal;
        console.log('Battle type modal element:', modal);
        
        if (!modal) {
            console.error('Battle type modal not found!');
            return;
        }
        
        // Check specifically for iPhone 14 Pro Max dimensions (or similar)
        const isIPhone14ProMaxLandscape = window.innerWidth >= 900 && window.innerHeight <= 430;
        
        // Add a class for iPhone 14 Pro Max
        if (isIPhone14ProMaxLandscape) {
            modal.classList.add('iphone14-landscape');
        } else {
            modal.classList.remove('iphone14-landscape');
        }
        
        // Show the modal
        console.log('Showing battle type modal');
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
                // Use only emoji for skill buttons - cleaner and more impressive
                btn.textContent = skill.emoji || '⚡';
                btn.disabled = !skill.isReady;
                btn.style.opacity = skill.isReady ? '1' : '0.5';
                
                if (skill.isActive) {
                    btn.classList.add('btn-pulse');
                } else {
                    btn.classList.remove('btn-pulse');
                }
            } else {
                btn.textContent = `${index + 1}`;
                btn.disabled = true;
                btn.style.opacity = '0.3';
            }
        });
    }

    // getJoystickInput() method removed - now handled by InputManager

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
        console.log('UI: showSkillSelection called with', skillChoices.length, 'choices');
        this.skillSelectionInProgress = false;
        this.selectedSkillElement = null;
        
        // Reset any existing visual states
        document.querySelectorAll('.skill-option').forEach(option => {
            option.style.pointerEvents = 'auto';
            option.style.opacity = '1';
            option.style.transform = 'scale(1)';
            option.classList.remove('selected', 'processing');
        });
        
        // Use template manager to create skill options
        window.templateManager.showSkillSelection(skillChoices, (skillId) => {
            console.log('UI: Skill callback triggered for', skillId);
            if (!this.skillSelectionInProgress) {
                this.selectSkill(skillId);
            } else {
                console.log('UI: Skill selection already in progress, ignoring');
            }
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
        // Check if bonus message already exists
        const existingBonus = document.getElementById('bonusMessage');
        if (existingBonus) {
            return existingBonus;
        }

        // Use template manager to create bonus message
        const battleResultTitle = document.getElementById('battleResultTitle');
        return window.templateManager.showBonusMessage('', battleResultTitle);
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
        // Use template manager to create damage text
        window.templateManager.showDamageText(x, y, damage, isHeal);
    }

    showNotification(message, type = 'info') {
        // Use template manager to create notifications
        window.templateManager.showNotification(message, type);
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
        
        console.log('Setting up button:', button.id || button.className);
        
        // Force button properties for Android Chrome
        button.style.touchAction = 'manipulation';
        button.style.userSelect = 'none';
        button.style.webkitUserSelect = 'none';
        button.style.webkitTouchCallout = 'none';
        button.style.webkitTapHighlightColor = 'transparent';
        button.style.cursor = 'pointer';
        button.style.pointerEvents = 'auto';
        button.style.position = 'relative';
        button.style.zIndex = '999';
        
        // Remove any existing event listeners to avoid conflicts
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        let isPressed = false;
        let touchStartTime = 0;
        
        // Direct touch handling for Android Chrome
        newButton.addEventListener('touchstart', (e) => {
            console.log('🔥 TOUCH START on:', newButton.id);
            isPressed = true;
            touchStartTime = Date.now();
            
            // Visual feedback
            newButton.style.opacity = '0.7';
            newButton.style.transform = 'scale(0.95)';
            
            // Prevent any interference
            e.stopPropagation();
        }, { passive: true });
        
        newButton.addEventListener('touchend', (e) => {
            console.log('🔥 TOUCH END on:', newButton.id);
            
            // Reset visual feedback
            newButton.style.opacity = '1';
            newButton.style.transform = 'scale(1)';
            
            if (isPressed) {
                const touchDuration = Date.now() - touchStartTime;
                console.log('🔥 Touch duration:', touchDuration + 'ms');
                
                if (touchDuration < 1000) { // Valid tap (less than 1 second)
                    console.log('🔥 EXECUTING CALLBACK from touchend');
                    e.preventDefault();
                    e.stopPropagation();
                    callback();
                }
            }
            
            isPressed = false;
        }, { passive: false });
        
        newButton.addEventListener('touchcancel', (e) => {
            console.log('🔥 TOUCH CANCEL on:', newButton.id);
            newButton.style.opacity = '1';
            newButton.style.transform = 'scale(1)';
            isPressed = false;
        }, { passive: true });
        
        // Fallback click handler
        newButton.addEventListener('click', (e) => {
            console.log('🔥 CLICK EVENT on:', newButton.id);
            e.preventDefault();
            e.stopPropagation();
            
            if (!isPressed) { // Only if not already handled by touch
                console.log('🔥 EXECUTING CALLBACK from click');
                callback();
            }
        });
        
        // Update the reference in elements if this is a known button
        if (button.id === 'pauseBtn') {
            this.elements.pauseBtn = newButton;
        }
        
        console.log('✅ Button setup complete for:', newButton.id);
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
window.GameUI = GameUI;