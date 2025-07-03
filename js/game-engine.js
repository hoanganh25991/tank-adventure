// Main Game Engine
if (window && window.location && window.location.hostname != "localhost") {
    console.debug = () => {}
    console.log = () => {}
    console.warn = () => {}
}

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Ensure crisp rendering
        this.setupContextForCrispRendering();
        
        // Game state
        this.currentScene = 'menu'; // 'menu', 'battle', 'skillSelection', 'results', 'base'
        this.gameRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Game objects
        this.player = null;
        this.waveManager = new WaveManager();
        this.skillManager = new SkillManager();
        this.upgradeManager = new UpgradeManager();
        this.ui = null;
        
        // Effects system
        this.skillEffects = new SkillEffects(this);
        this.skillManager.effectsManager = this.skillEffects;
        
        // Sound system
        this.soundManager = new SoundManager();
        
        // Game settings
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        
        // Battle state
        this.currentWave = 1;
        this.maxWaves = 10;
        this.battleStats = {
            enemiesDefeated: 0,
            scoreEarned: 0,
            expGained: 0
        };
        
        // Effects
        this.explosions = [];
        this.particles = [];
        
        // Debug flags
        this.debugMode = true; // Temporarily enable to help see environment objects
        this.debugEnvironment = true; // Enable environment debug logging
        this.showCollisionBoxes = false;
        
        // Camera system for endless movement
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.1,
            zoom: 0.7, // Zoom out to see more of the battlefield
            targetZoom: 0.7,
            zoomSmoothing: 0.05
        };
        
        // Keyboard input state for WASD movement and spacebar shooting
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        };
        
        this.initialize();
        this.initializeTankRendering();
        this.setupKeyboardControls();
        this.setupFullscreenHandlers();
    }

    // Helper method to get CSS canvas dimensions (not internal pixel dimensions)
    getCanvasCSSDimensions() {
        const rect = this.canvas.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height
        };
    }

    // Setup context for crisp rendering
    setupContextForCrispRendering() {
        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;
        if (this.ctx.webkitImageSmoothingEnabled !== undefined) {
            this.ctx.webkitImageSmoothingEnabled = false;
        }
        if (this.ctx.mozImageSmoothingEnabled !== undefined) {
            this.ctx.mozImageSmoothingEnabled = false;
        }
        if (this.ctx.msImageSmoothingEnabled !== undefined) {
            this.ctx.msImageSmoothingEnabled = false;
        }
        
        // Set text rendering for crisp text
        this.ctx.textBaseline = 'alphabetic';
    }

    async initialize() {
        console.log('Initializing Tank Adventure...');
        
        // Show loading screen
        this.showLoading();
        
        try {
            // Initialize UI
            this.ui = new GameUI(this);
            
            // Adjust canvas size
            this.ui.adjustCanvasSize();
            
            // Load saved progress
            this.loadGame();
            
            // Initialize player if not loaded
            if (!this.player) {
                this.createNewPlayer();
            }
            
            // Apply upgrades to player
            this.upgradeManager.applyAllUpgrades(this.player);
            this.skillManager.applyPassiveSkills(this.player);
            
            // Set initial scene
            this.currentScene = 'menu';
            this.ui.showScreen('mainMenu');
            
            // Start game loop
            this.startGameLoop();
            
            console.log('Game initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        if (this.ui) {
            this.ui.showLoading();
        }
    }

    hideLoading() {
        if (this.ui) {
            this.ui.hideLoading();
        }
    }

    createNewPlayer() {
        // Create player at center of screen using CSS dimensions (not internal canvas dimensions)
        const rect = this.canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        this.player = new Player(centerX, centerY);
        console.log(`Created new player at (${centerX}, ${centerY}) - Canvas CSS size: ${rect.width}x${rect.height}`);
    }

    startGameLoop() {
        this.gameRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent large jumps
        this.deltaTime = Math.min(this.deltaTime, 50);
        
        // Update and render
        this.update(this.deltaTime);
        this.render();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        switch (this.currentScene) {
            case 'battle':
                this.updateBattle(deltaTime);
                break;
            case 'menu':
            case 'skillSelection':
            case 'results':
            case 'base':
                // These scenes are handled by UI
                break;
        }
        
        // Update effects regardless of scene
        this.updateEffects(deltaTime);
        
        // Handle input
        this.handleInput();
    }

    updateBattle(deltaTime) {
        if (!this.player || !this.waveManager) return;
        
        // Update player
        this.player.update(deltaTime, this.waveManager.enemies);
        
        // Update camera to follow player
        this.updateCamera();
        
        // Update wave manager
        this.waveManager.update(deltaTime, this.player);
        
        // Update skill manager
        this.skillManager.update(deltaTime, this.player, this.waveManager.enemies);
        
        // Check collisions
        this.checkCollisions();
        
        // Apply auto-repair if player has it
        if (this.player.autoRepairRate > 0) {
            this.applyAutoRepair(deltaTime);
        }
        
        // Check battle end conditions
        this.checkBattleEnd();
    }

    updateEffects(deltaTime) {
        // Update skill effects
        this.skillEffects.update(deltaTime);
        
        // Update explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.life -= deltaTime;
            explosion.radius += explosion.growthRate * deltaTime / 1000;
            explosion.alpha = Math.max(0, explosion.life / explosion.maxLife);
            
            if (explosion.life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update particle time
            if (particle.time !== undefined) {
                particle.time += deltaTime;
            }
            
            // Handle special behaviors
            if (particle.specialBehavior) {
                this.updateSpecialParticleBehavior(particle, deltaTime);
            } else {
                // Standard particle movement
                particle.x += particle.vx * deltaTime / 1000;
                particle.y += particle.vy * deltaTime / 1000;
            }
            
            particle.life -= deltaTime;
            particle.alpha = Math.max(0, particle.life / particle.maxLife);
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateSpecialParticleBehavior(particle, deltaTime) {
        const player = this.player;
        if (!player) return;

        switch (particle.specialBehavior) {
            case 'trail':
                // Speed boost trail effect
                particle.x += particle.vx * deltaTime / 1000;
                particle.y += particle.vy * deltaTime / 1000;
                
                // Add some magnetism towards player
                const dx = player.mainTank.x - particle.x;
                const dy = player.mainTank.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const magnetForce = 0.5;
                    particle.vx += (dx / distance) * magnetForce;
                    particle.vy += (dy / distance) * magnetForce;
                }
                break;

            case 'pulse':
                // Damage boost pulsing effect
                particle.x += particle.vx * deltaTime / 1000;
                particle.y += particle.vy * deltaTime / 1000;
                
                // Pulsing size effect
                const pulseSpeed = 0.003;
                particle.size = particle.size * (1 + Math.sin(particle.time * pulseSpeed) * 0.3);
                break;

            case 'orbit':
                // Shield orbital effect
                const orbitSpeed = 0.002;
                const orbitRadius = 30;
                const angle = particle.time * orbitSpeed + (particle.originalX % 100) / 100 * Math.PI * 2;
                
                particle.x = player.mainTank.x + Math.cos(angle) * orbitRadius;
                particle.y = player.mainTank.y + Math.sin(angle) * orbitRadius;
                break;

            case 'spark':
                // Spark behavior with gravity and random effects
                particle.x += particle.vx * deltaTime / 1000;
                particle.y += particle.vy * deltaTime / 1000;
                
                // Apply gravity
                particle.vy += particle.gravity * deltaTime / 1000;
                
                // Add random wind effect
                particle.vx += (Math.random() - 0.5) * 10;
                
                // Fade out faster
                particle.alpha = Math.max(0, particle.life / particle.maxLife * 0.8);
                
                // Random size variation
                particle.size = Math.max(0.5, particle.size + (Math.random() - 0.5) * 0.2);
                break;

            default:
                // Standard movement
                particle.x += particle.vx * deltaTime / 1000;
                particle.y += particle.vy * deltaTime / 1000;
        }
    }

    updateCamera() {
        if (!this.player || !this.player.mainTank) return;
        
        // Set camera target to center on player (adjusted for zoom)
        const canvasDims = this.getCanvasCSSDimensions();
        this.camera.targetX = this.player.mainTank.x - (canvasDims.width / 2) / this.camera.zoom;
        this.camera.targetY = this.player.mainTank.y - (canvasDims.height / 2) / this.camera.zoom;
        
        // Smooth camera movement
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
        
        // Smooth zoom
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * this.camera.zoomSmoothing;
    }

    handleInput() {
        if (this.currentScene !== 'battle' || !this.player || !this.ui) return;
        
        // Get joystick input
        const joystick = this.ui.getJoystickInput();
        
        // Get keyboard input for WASD movement
        const keyboard = this.getKeyboardInput();
        
        // Combine joystick and keyboard input (keyboard takes priority if both are active)
        let finalX = joystick.x;
        let finalY = joystick.y;
        let finalMagnitude = joystick.magnitude;
        let speedMultiplier = 0.5; // Default joystick speed (reduce 10x times)
        
        if (keyboard.magnitude > 0) {
            finalX = keyboard.x;
            finalY = keyboard.y;
            finalMagnitude = keyboard.magnitude;
            speedMultiplier = 0.5; // Keyboard speed (reduce 25x times)
        }
        
        // Set movement direction with appropriate speed multiplier
        this.player.setMovementDirection(finalX, finalY, finalMagnitude, speedMultiplier);
        
        // Handle spacebar shooting
        if (this.keys.space) {
            this.handleKeyboardShoot();
        }
    }

    getKeyboardInput() {
        // Calculate WASD movement direction
        let x = 0;
        let y = 0;
        
        if (this.keys.a) x -= 1; // Left
        if (this.keys.d) x += 1; // Right
        if (this.keys.w) y -= 1; // Up
        if (this.keys.s) y += 1; // Down
        
        // Calculate magnitude and normalize
        const magnitude = Math.sqrt(x * x + y * y);
        
        if (magnitude > 0) {
            x /= magnitude;
            y /= magnitude;
        }
        
        return {
            x: x,
            y: y,
            magnitude: magnitude
        };
    }

    handleKeyboardShoot() {
        if (this.player) {
            // Get canvas center as default target for keyboard shooting
            const canvas = document.getElementById('gameCanvas');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Pass enemies array for auto-aim
            const enemies = this.waveManager ? this.waveManager.enemies : [];
            this.player.manualShoot(centerX, centerY, enemies);
        }
    }

    checkCollisions() {
        const playerBullets = this.player.getAllBullets();
        const enemyBullets = this.waveManager.getAllBullets();
        const enemies = this.waveManager.enemies;
        const playerTanks = [this.player.mainTank, ...this.player.miniTanks].filter(tank => tank.isAlive);
        
        // Player bullets vs enemies
        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const bullet = playerBullets[i];
            let bulletHitCount = 0;
            let shouldRemoveBullet = true;
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (!enemy.isAlive) continue;
                
                // Use bullet size for collision detection (bigger bullets have larger collision)
                const bulletRadius = bullet.size || 3;
                if (Utils.circleCollision(bullet.x, bullet.y, bulletRadius, enemy.x, enemy.y, enemy.size)) {
                    // Hit enemy
                    const destroyed = enemy.takeDamage(bullet.damage);
                    bulletHitCount++;
                    
                    // Create enhanced hit effect for main tank bullets
                    if (bullet.isMainTankBullet) {
                        this.createEnhancedHitEffect(bullet.x, bullet.y, bullet.damage);
                        // Play enhanced hit sound
                        if (this.soundManager) {
                            this.soundManager.play('main_tank_hit');
                        }
                    } else {
                        this.createHitEffect(bullet.x, bullet.y, bullet.damage);
                        // Play standard hit sound
                        if (this.soundManager) {
                            this.soundManager.play('mini_tank_hit');
                        }
                    }
                    
                    // Check for explosive shot or main tank bullet explosion
                    if (this.player.explosiveShotActive) {
                        this.createExplosion(bullet.x, bullet.y, 50, bullet.damage / 2);
                    } else if (bullet.isMainTankBullet && bullet.explosionRadius > 0) {
                        this.createMainTankExplosion(bullet.x, bullet.y, bullet.explosionRadius, bullet.damage * 0.3);
                        // Play explosion sound
                        if (this.soundManager) {
                            this.soundManager.play('main_tank_explosion');
                        }
                    }
                    
                    if (destroyed) {
                        this.battleStats.enemiesDefeated++;
                        this.battleStats.scoreEarned += enemy.value;
                        this.battleStats.expGained += Math.floor(enemy.value / 2);
                    }
                    
                    // Check if bullet should continue (penetration)
                    if (bullet.penetration && bulletHitCount >= bullet.penetration) {
                        shouldRemoveBullet = true;
                        break;
                    } else if (!bullet.penetration || bullet.penetration <= 1) {
                        shouldRemoveBullet = true;
                        break;
                    }
                }
            }
            
            // Remove bullet if it should be removed
            if (shouldRemoveBullet && bulletHitCount > 0) {
                this.removePlayerBullet(bullet);
            }
        }
        
        // Enemy bullets vs player tanks
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const bullet = enemyBullets[i];
            
            for (const tank of playerTanks) {
                if (Utils.circleCollision(bullet.x, bullet.y, 3, tank.x, tank.y, tank.size)) {
                    // Hit player tank
                    const destroyed = tank.takeDamage(bullet.damage);
                    
                    // Create hit effect
                    this.createHitEffect(bullet.x, bullet.y, bullet.damage, true);
                    
                    // Remove bullet
                    this.removeEnemyBullet(bullet);
                    
                    if (destroyed) {
                        console.log(`${tank.type} tank destroyed!`);
                    }
                    
                    break;
                }
            }
        }
        
        // Tank collisions (prevent overlap)
        this.handleTankCollisions();
    }

    removePlayerBullet(bullet) {
        // Find and remove bullet from appropriate tank
        if (this.player.mainTank.bullets.includes(bullet)) {
            Utils.removeFromArray(this.player.mainTank.bullets, bullet);
        } else {
            for (const miniTank of this.player.miniTanks) {
                if (miniTank.bullets.includes(bullet)) {
                    Utils.removeFromArray(miniTank.bullets, bullet);
                    break;
                }
            }
        }
    }

    removeEnemyBullet(bullet) {
        for (const enemy of this.waveManager.enemies) {
            if (enemy.bullets.includes(bullet)) {
                Utils.removeFromArray(enemy.bullets, bullet);
                break;
            }
        }
    }

    handleTankCollisions() {
        const allTanks = [this.player.mainTank, ...this.player.miniTanks, ...this.waveManager.enemies];
        
        for (let i = 0; i < allTanks.length; i++) {
            for (let j = i + 1; j < allTanks.length; j++) {
                const tank1 = allTanks[i];
                const tank2 = allTanks[j];
                
                if (!tank1.isAlive || !tank2.isAlive) continue;
                
                const distance = Utils.distance(tank1.x, tank1.y, tank2.x, tank2.y);
                const minDistance = tank1.size + tank2.size;
                
                if (distance < minDistance) {
                    // Separate tanks
                    const angle = Utils.angle(tank1.x, tank1.y, tank2.x, tank2.y);
                    const separation = (minDistance - distance) / 2;
                    
                    tank1.x -= Math.cos(angle) * separation;
                    tank1.y -= Math.sin(angle) * separation;
                    tank2.x += Math.cos(angle) * separation;
                    tank2.y += Math.sin(angle) * separation;
                    
                    // No boundary constraints for endless world
                }
            }
        }
    }

    applyAutoRepair(deltaTime) {
        const repairAmount = this.player.autoRepairRate * deltaTime / 1000;
        
        this.player.mainTank.heal(repairAmount);
        for (const miniTank of this.player.miniTanks) {
            miniTank.heal(repairAmount * 0.8);
        }
    }

    checkBattleEnd() {
        // Check if player is defeated
        const allPlayerTanksDestroyed = [this.player.mainTank, ...this.player.miniTanks]
            .every(tank => !tank.isAlive);
        
        if (allPlayerTanksDestroyed) {
            this.endBattle(false); // Player lost
            return;
        }
        
        // Check if wave is complete
        if (this.waveManager.isWaveComplete() && !this.waveCompleted) {
            this.waveCompleted = true; // Prevent multiple skill selections for the same wave
            
            if (this.currentWave >= this.maxWaves) {
                this.endBattle(true); // Player won all waves
            } else {
                this.showSkillSelection();
            }
        }
    }

    endBattle(victory) {
        this.currentScene = 'results';
        
        // Update player stats
        this.player.addScore(this.battleStats.scoreEarned);
        this.player.addExperience(this.battleStats.expGained);
        this.player.addCoins(Math.floor(this.battleStats.scoreEarned / 4));
        
        // Save progress
        this.saveGame();
        
        // Show results
        this.ui.showBattleResults({
            victory: victory,
            wave: this.currentWave,
            enemiesDefeated: this.battleStats.enemiesDefeated,
            scoreEarned: this.battleStats.scoreEarned,
            expGained: this.battleStats.expGained
        });
    }

    showSkillSelection() {
        console.log(`Showing skill selection after wave ${this.currentWave}`);
        this.currentScene = 'skillSelection';
        this.waveManager.pauseWave();
        
        const skillChoices = this.skillManager.getRandomSkillChoices(3);
        this.ui.showSkillSelection(skillChoices);
    }

    startBattle() {
        console.log('Starting battle...');
        
        this.currentScene = 'battle';
        this.currentWave = 1;
        this.waveCompleted = false;
        
        // Reset battle stats
        this.battleStats = {
            enemiesDefeated: 0,
            scoreEarned: 0,
            expGained: 0
        };
        
        // Reset player position and health
        const canvasDims = this.getCanvasCSSDimensions();
        this.player.mainTank.x = canvasDims.width / 2;
        this.player.mainTank.y = canvasDims.height / 2;
        
        // Heal all tanks
        this.player.mainTank.heal(this.player.mainTank.maxHealth);
        for (const miniTank of this.player.miniTanks) {
            miniTank.heal(miniTank.maxHealth);
            miniTank.isAlive = true;
        }
        
        // Start first wave
        this.waveManager.startWave(this.currentWave);
        
        // Show battle screen
        this.ui.showScreen('battleScreen');
    }

    continueToNextWave() {
        this.currentWave++;
        this.currentScene = 'battle';
        
        // Start next wave
        this.waveManager.startWave(this.currentWave);
        this.waveManager.resumeWave();
        
        // Show battle screen
        this.ui.showScreen('battleScreen');
    }

    resumeBattle() {
        console.log(`Resuming battle, starting wave ${this.currentWave + 1}`);
        this.currentScene = 'battle';
        
        // Start the next wave after skill selection
        this.currentWave++;
        this.waveCompleted = false; // Reset wave completion flag for new wave
        this.waveManager.startWave(this.currentWave);
        
        this.ui.showScreen('battleScreen');
    }

    render() {
        // Clear canvas
        const canvasDims = this.getCanvasCSSDimensions();
        Utils.clearCanvas(this.ctx, canvasDims.width, canvasDims.height);
        
        if (this.currentScene === 'battle') {
            this.renderBattle();
            
            // Render effects in world space
            this.ctx.save();
            this.ctx.scale(this.camera.zoom, this.camera.zoom);
            this.ctx.translate(-this.camera.x, -this.camera.y);
            this.renderEffects();
            this.ctx.restore();
        }
    }

    renderBattle() {
        // Save context and apply camera transform
        this.ctx.save();
        
        // Apply zoom and camera translation
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw background
        this.drawBackground();
        
        // Draw environment elements
        this.drawEnvironment();
        
        // Draw player
        if (this.player) {
            this.player.draw(this.ctx, this);
        }
        
        // Draw enemies
        this.waveManager.draw(this.ctx);
        
        // Restore context (UI elements are drawn in screen space)
        this.ctx.restore();
        
        // Draw UI elements
        this.drawBattleUI();
    }

    drawBackground() {
        // Infinite grid background
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1 / this.camera.zoom; // Adjust line width for zoom
        
        const gridSize = 50;
        
        // Calculate visible area in world coordinates (accounting for zoom)
        const canvasDims = this.getCanvasCSSDimensions();
        const viewWidth = canvasDims.width / this.camera.zoom;
        const viewHeight = canvasDims.height / this.camera.zoom;
        
        // Calculate grid offset based on camera position
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        const endX = startX + viewWidth + gridSize;
        const endY = startY + viewHeight + gridSize;
        
        // Draw vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
    }

    drawEnvironment() {
        // Draw environmental elements to make the battlefield more interesting
        // Calculate visible area in world coordinates (accounting for zoom)
        const canvasDims = this.getCanvasCSSDimensions();
        const viewWidth = canvasDims.width / this.camera.zoom;
        const viewHeight = canvasDims.height / this.camera.zoom;
        const buffer = 200; // Increased buffer for smoother experience
        
        // Debug: Log that environment function is being called
        if (this.debugMode) {
            console.log('drawEnvironment() called');
        }
        
        const viewLeft = this.camera.x - buffer;
        const viewRight = this.camera.x + viewWidth + buffer;
        const viewTop = this.camera.y - buffer;
        const viewBottom = this.camera.y + viewHeight + buffer;
        
        // Debug logging
        if (this.debugEnvironment) {
            console.log(`Environment view: left=${viewLeft.toFixed(0)}, right=${viewRight.toFixed(0)}, top=${viewTop.toFixed(0)}, bottom=${viewBottom.toFixed(0)}`);
            console.log(`Camera: x=${this.camera.x.toFixed(0)}, y=${this.camera.y.toFixed(0)}, zoom=${this.camera.zoom.toFixed(2)}`);
        }
        
        // Draw rocks/obstacles with random variations
        let rockCount = 0;
        for (let x = Math.floor(viewLeft / 200) * 200; x < viewRight; x += 200) {
            for (let y = Math.floor(viewTop / 200) * 200; y < viewBottom; y += 200) {
                // Use deterministic random based on position
                const seed = (x * 31 + y * 17) % 100;
                if (seed > 50) { // 50% chance for obstacles (increased for better visibility)
                    const rockX = x + (seed % 50) - 25;
                    const rockY = y + ((seed * 7) % 50) - 25;
                    const rockSize = 15 + (seed % 20);
                    
                    // Random rock variations based on seed
                    const colorVariation = (seed * 3) % 40;
                    const shapeVariation = (seed * 5) % 4;
                    
                    // Random brown color variations
                    const baseRed = 139 + colorVariation - 20;
                    const baseGreen = 115 + colorVariation - 20;
                    const baseBue = 85 + colorVariation - 20;
                    
                    this.ctx.fillStyle = `rgb(${baseRed}, ${baseGreen}, ${baseBue})`;
                    this.ctx.strokeStyle = `rgb(${baseRed - 40}, ${baseGreen - 40}, ${baseBue - 40})`;
                    this.ctx.lineWidth = 2 / this.camera.zoom;
                    
                    // Draw rock with random shape
                    this.ctx.save();
                    this.ctx.translate(rockX, rockY);
                    this.ctx.rotate(seed * 0.1);
                    
                    if (shapeVariation === 0) {
                        // Square rock
                        this.ctx.fillRect(-rockSize/2, -rockSize/2, rockSize, rockSize);
                        this.ctx.strokeRect(-rockSize/2, -rockSize/2, rockSize, rockSize);
                    } else if (shapeVariation === 1) {
                        // Circular rock
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, rockSize/2, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.stroke();
                    } else if (shapeVariation === 2) {
                        // Hexagonal rock
                        this.ctx.beginPath();
                        for (let i = 0; i < 6; i++) {
                            const angle = (i * Math.PI * 2) / 6;
                            const px = Math.cos(angle) * rockSize/2;
                            const py = Math.sin(angle) * rockSize/2;
                            if (i === 0) this.ctx.moveTo(px, py);
                            else this.ctx.lineTo(px, py);
                        }
                        this.ctx.closePath();
                        this.ctx.fill();
                        this.ctx.stroke();
                    } else {
                        // Triangular rock
                        this.ctx.beginPath();
                        this.ctx.moveTo(0, -rockSize/2);
                        this.ctx.lineTo(-rockSize/2, rockSize/2);
                        this.ctx.lineTo(rockSize/2, rockSize/2);
                        this.ctx.closePath();
                        this.ctx.fill();
                        this.ctx.stroke();
                    }
                    
                    this.ctx.restore();
                    rockCount++;
                }
            }
        }
        
        // Draw trees/vegetation
        this.ctx.fillStyle = '#4A7C59'; // Brighter green for better visibility
        this.ctx.strokeStyle = '#2E4A36'; // Darker green border
        this.ctx.lineWidth = 1 / this.camera.zoom; // Adjust line width for zoom
        
        let treeCount = 0;
        for (let x = Math.floor(viewLeft / 150) * 150; x < viewRight; x += 150) {
            for (let y = Math.floor(viewTop / 150) * 150; y < viewBottom; y += 150) {
                const seed = (x * 23 + y * 19) % 100;
                if (seed > 40) { // 60% chance for trees (increased for better visibility)
                    const treeX = x + (seed % 40) - 20;
                    const treeY = y + ((seed * 11) % 40) - 20;
                    const treeSize = 20 + (seed % 15);
                    
                    // Draw tree
                    this.ctx.save();
                    this.ctx.translate(treeX, treeY);
                    
                    // Tree trunk
                    this.ctx.fillStyle = '#654321';
                    this.ctx.fillRect(-3, treeSize/2 - 5, 6, 10);
                    
                    // Tree foliage
                    this.ctx.fillStyle = '#4A7C59';
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, treeSize/2, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    this.ctx.restore();
                    treeCount++;
                }
            }
        }
        
        // Draw water/ponds
        this.ctx.fillStyle = '#4A90B8'; // Brighter blue for better visibility
        this.ctx.strokeStyle = '#2B5A7A'; // Darker blue border
        this.ctx.lineWidth = 1 / this.camera.zoom; // Adjust line width for zoom
        
        let waterCount = 0;
        for (let x = Math.floor(viewLeft / 300) * 300; x < viewRight; x += 300) {
            for (let y = Math.floor(viewTop / 300) * 300; y < viewBottom; y += 300) {
                const seed = (x * 13 + y * 29) % 100;
                if (seed > 70) { // 30% chance for water (increased for better visibility)
                    const waterX = x + (seed % 60) - 30;
                    const waterY = y + ((seed * 13) % 60) - 30;
                    const waterSize = 30 + (seed % 25);
                    
                    // Draw water
                    this.ctx.save();
                    this.ctx.translate(waterX, waterY);
                    
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, waterSize/2, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    this.ctx.restore();
                    waterCount++;
                }
            }
        }
        
        // Debug logging for environment objects
        if (this.debugEnvironment) {
            console.log(`Rendered: ${rockCount} rocks, ${treeCount} trees, ${waterCount} water bodies`);
        }
        
        // Draw test objects at fixed world coordinates for debugging
        if (this.debugMode) {
            this.ctx.save();
            this.ctx.fillStyle = '#FF0000'; // Bright red for visibility
            this.ctx.strokeStyle = '#AA0000';
            this.ctx.lineWidth = 3 / this.camera.zoom;
            
            // Test rock at world coordinates (0, 0)
            this.ctx.fillRect(-10, -10, 20, 20);
            this.ctx.strokeRect(-10, -10, 20, 20);
            
            // Test rock at world coordinates (100, 100)
            this.ctx.fillRect(90, 90, 20, 20);
            this.ctx.strokeRect(90, 90, 20, 20);
            
            // Test rock at world coordinates (-100, -100)
            this.ctx.fillRect(-110, -110, 20, 20);
            this.ctx.strokeRect(-110, -110, 20, 20);
            
            // Test rock at world coordinates (200, 0)
            this.ctx.fillRect(190, -10, 20, 20);
            this.ctx.strokeRect(190, -10, 20, 20);
            
            // Test rock at world coordinates (0, 200)
            this.ctx.fillRect(-10, 190, 20, 20);
            this.ctx.strokeRect(-10, 190, 20, 20);
            
            this.ctx.restore();
        }
    }

    drawBattleUI() {
        // Any additional battle UI that needs to be drawn on canvas
        // Most UI is handled by HTML/CSS overlay
    }

    renderEffects() {
        // Draw skill effects
        this.skillEffects.render();
        
        // Draw explosions
        for (const explosion of this.explosions) {
            this.ctx.save();
            this.ctx.globalAlpha = explosion.alpha;
            
            // Outer ring
            this.ctx.strokeStyle = '#ff6600';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Inner fill
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.globalAlpha = explosion.alpha * 0.3;
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, explosion.radius * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        // Draw particles
        for (const particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    createExplosion(x, y, radius, damage) {
        // Create visual explosion
        this.explosions.push({
            x: x,
            y: y,
            radius: 5,
            maxRadius: radius,
            growthRate: radius * 2, // pixels per second
            life: 500,
            maxLife: 500,
            alpha: 1
        });
        
        // Apply damage to nearby enemies
        for (const enemy of this.waveManager.enemies) {
            if (!enemy.isAlive) continue;
            
            const distance = Utils.distance(x, y, enemy.x, enemy.y);
            if (distance <= radius) {
                const damageMultiplier = 1 - (distance / radius);
                const actualDamage = Math.floor(damage * damageMultiplier);
                enemy.takeDamage(actualDamage);
                
                this.createHitEffect(enemy.x, enemy.y, actualDamage);
            }
        }
        
        // Create particles
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const speed = Utils.random(50, 150);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Utils.random(2, 5),
                color: Utils.randomChoice(['#ff6600', '#ffaa00', '#ff9900']),
                life: Utils.random(300, 600),
                maxLife: 500,
                alpha: 1
            });
        }
    }

    createMainTankExplosion(x, y, radius, damage) {
        // Create larger, more dramatic explosion for main tank bullets
        this.explosions.push({
            x: x,
            y: y,
            radius: 8,
            maxRadius: radius,
            growthRate: radius * 2.5, // slightly faster growth
            life: 700,
            maxLife: 700,
            alpha: 1
        });
        
        // Apply damage to nearby enemies
        for (const enemy of this.waveManager.enemies) {
            if (!enemy.isAlive) continue;
            
            const distance = Utils.distance(x, y, enemy.x, enemy.y);
            if (distance <= radius) {
                const damageMultiplier = 1 - (distance / radius);
                const actualDamage = Math.floor(damage * damageMultiplier);
                enemy.takeDamage(actualDamage);
                
                this.createHitEffect(enemy.x, enemy.y, actualDamage);
            }
        }
        
        // Create more particles for main tank explosion
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = Utils.random(70, 200);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Utils.random(3, 7),
                color: Utils.randomChoice(['#ff3300', '#ff6600', '#ffaa00', '#ff9900']),
                life: Utils.random(400, 800),
                maxLife: 600,
                alpha: 1
            });
        }
    }

    createHitEffect(x, y, damage, isPlayerHit = false) {
        // Show damage text in UI
        if (this.ui) {
            this.ui.showDamageText(x, y, damage, false);
        }
        
        // Create hit particles
        const color = isPlayerHit ? '#ff4444' : '#ffff44';
        
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Utils.random(30, 80);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Utils.random(1, 3),
                color: color,
                life: Utils.random(200, 400),
                maxLife: 300,
                alpha: 1
            });
        }
    }

    createEnhancedHitEffect(x, y, damage) {
        // Show enhanced damage text in UI
        if (this.ui) {
            this.ui.showDamageText(x, y, damage, false);
        }
        
        // Create enhanced hit particles with more effects
        const colors = ['#ff9900', '#ffaa00', '#ff6600', '#ffcc00'];
        
        // Create more particles for enhanced effect
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Utils.random(40, 100);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Utils.random(2, 4),
                color: Utils.randomChoice(colors),
                life: Utils.random(300, 500),
                maxLife: 400,
                alpha: 1
            });
        }
        
        // Add larger explosion particles
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Utils.random(20, 60);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Utils.random(4, 6),
                color: '#ff4400',
                life: Utils.random(400, 600),
                maxLife: 500,
                alpha: 1
            });
        }
    }

    saveGame() {
        if (this.player) {
            this.player.saveProgress();
        }
        this.skillManager.saveSkills();
        this.upgradeManager.saveUpgrades();
        
        const gameData = {
            currentWave: this.currentWave,
            lastSaved: Date.now()
        };
        
        Utils.saveGame('tankAdventure_game', gameData);
        console.log('Game saved');
    }

    loadGame() {
        const gameData = Utils.loadGame('tankAdventure_game');
        if (gameData) {
            this.currentWave = gameData.currentWave || 1;
            console.log('Game loaded');
        }
        
        // Load player (will create new if none exists)
        this.createNewPlayer();
        
        // Load skills and upgrades
        this.skillManager.loadSkills();
        // upgradeManager loads automatically in constructor
    }

    // Enhanced Tank Rendering System
    initializeTankRendering() {
        // Color cache for tank rendering
        this.colorCache = new Map();
        this.colorCache.set('player', '#3498db');
        this.colorCache.set('mini_tank', '#2ecc71');
        
        // Debug flags
        this.showCollisionBoxes = false;
        this.hasLoggedTankRender = false;
    }

    /**
     * Render tank (enhanced version)
     */
    renderTank(tank, color) {
        const { x: positionX, y: positionY, size: radius } = tank;
        
        this.ctx.save();
        this.ctx.translate(positionX, positionY);
        
        // Get tank rotation angle from tank.angle
        let rotation = tank.angle || 0;
        this.ctx.rotate(rotation);
        
        // Debug: log first tank render
        if (!this.hasLoggedTankRender) {
            console.log('Rendering enhanced tank:', tank.type, 'position:', {x: positionX, y: positionY}, 'color:', color, 'radius:', radius);
            this.hasLoggedTankRender = true;
        }
        
        // Tank body (rectangular base)
        this.ctx.fillStyle = color;
        const bodyWidth = radius * 1.6;
        const bodyHeight = radius * 1.2;
        
        // Main tank body
        this.ctx.fillRect(-bodyWidth/2, -bodyHeight/2, bodyWidth, bodyHeight);
        
        // Tank body outline
        this.ctx.strokeStyle = this.darkenColor(color, 0.3);
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-bodyWidth/2, -bodyHeight/2, bodyWidth, bodyHeight);
        
        // Tank turret (smaller rectangle on top)
        const turretWidth = radius * 1.0;
        const turretHeight = radius * 0.8;
        this.ctx.fillStyle = this.lightenColor(color, 0.1);
        this.ctx.fillRect(-turretWidth/2, -turretHeight/2, turretWidth, turretHeight);
        this.ctx.strokeStyle = this.darkenColor(color, 0.3);
        this.ctx.strokeRect(-turretWidth/2, -turretHeight/2, turretWidth, turretHeight);
        
        // Tank gun barrel with muzzle flash effect
        this.ctx.fillStyle = this.darkenColor(color, 0.2);
        const barrelLength = radius * 1.2;
        const barrelWidth = radius * 0.15;
        this.ctx.fillRect(0, -barrelWidth/2, barrelLength, barrelWidth);
        this.ctx.strokeStyle = this.darkenColor(color, 0.4);
        this.ctx.strokeRect(0, -barrelWidth/2, barrelLength, barrelWidth);
        
        // Enhanced muzzle flash effect with random variations
        if (tank.muzzleFlash && tank.muzzleFlash > 0) {
            // Random flicker intensity
            const flickerIntensity = 0.8 + Math.random() * 0.4;
            const randomOffset = (Math.random() - 0.5) * 4;
            
            if (tank.type === 'main') {
                // Enhanced main tank muzzle flash with random colors
                const hue = 30 + Math.random() * 30; // Random yellow-orange hue
                const saturation = 80 + Math.random() * 20;
                
                // Outer glow with random flicker
                this.ctx.fillStyle = `hsla(${hue}, ${saturation}%, 70%, ${tank.muzzleFlash * 0.3 * flickerIntensity})`;
                this.ctx.beginPath();
                this.ctx.arc(barrelLength + randomOffset, 0, barrelWidth * (3.5 + Math.random()), 0, Math.PI * 2);
                this.ctx.fill();
                
                // Main flash with random size
                this.ctx.fillStyle = `hsla(${hue}, ${saturation}%, 60%, ${tank.muzzleFlash * 0.8 * flickerIntensity})`;
                this.ctx.beginPath();
                this.ctx.arc(barrelLength + randomOffset, 0, barrelWidth * (2 + Math.random() * 1.5), 0, Math.PI * 2);
                this.ctx.fill();
                
                // Hot center with random white-hot intensity
                this.ctx.fillStyle = `rgba(255, 255, ${200 + Math.random() * 55}, ${tank.muzzleFlash * flickerIntensity})`;
                this.ctx.beginPath();
                this.ctx.arc(barrelLength + randomOffset, 0, barrelWidth * (1 + Math.random() * 0.5), 0, Math.PI * 2);
                this.ctx.fill();
                
                // Random sparks
                if (Math.random() < 0.3) {
                    this.addRandomSparks(barrelLength, 0, 3 + Math.random() * 4);
                }
            } else {
                // Mini tank muzzle flash with random variations
                const hue = 50 + Math.random() * 20;
                this.ctx.fillStyle = `hsla(${hue}, 90%, 60%, ${tank.muzzleFlash * 0.8 * flickerIntensity})`;
                this.ctx.beginPath();
                this.ctx.arc(barrelLength + randomOffset, 0, barrelWidth * (1.5 + Math.random() * 1), 0, Math.PI * 2);
                this.ctx.fill();
                
                // Random mini sparks
                if (Math.random() < 0.2) {
                    this.addRandomSparks(barrelLength, 0, 1 + Math.random() * 2);
                }
            }
        }
        
        // Tank treads (side strips)
        this.ctx.fillStyle = this.darkenColor(color, 0.4);
        const treadWidth = radius * 0.2;
        // Left tread
        this.ctx.fillRect(-bodyWidth/2, -bodyHeight/2 - treadWidth/2, bodyWidth, treadWidth);
        // Right tread  
        this.ctx.fillRect(-bodyWidth/2, bodyHeight/2 - treadWidth/2, bodyWidth, treadWidth);
        
        // Add tank type indicator (visual distinction)
        if (tank.type === 'main') {
            // Main tank has a commander hatch
            this.ctx.fillStyle = this.lightenColor(color, 0.2);
            this.ctx.beginPath();
            this.ctx.arc(-turretWidth/4, 0, radius * 0.15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = this.darkenColor(color, 0.3);
            this.ctx.stroke();
        } else if (tank.type === 'mini') {
            // Mini tanks have a smaller profile with antenna
            this.ctx.strokeStyle = this.darkenColor(color, 0.2);
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(-turretWidth/3, 0);
            this.ctx.lineTo(-turretWidth/3, -radius * 0.4);
            this.ctx.stroke();
        }
        
        // Hit flash effect
        if (tank.hitFlash && tank.hitFlash > 0) {
            this.ctx.fillStyle = `rgba(255, 0, 0, ${tank.hitFlash * 0.3})`;
            this.ctx.fillRect(-bodyWidth/2, -bodyHeight/2, bodyWidth, bodyHeight);
        }
        
        // Collision box (debug)
        if (this.showCollisionBoxes) {
            this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
        }
        
        this.ctx.restore();
    }

    /**
     * Helper function to darken a color
     */
    darkenColor(color, factor) {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Darken by factor
        const newR = Math.max(0, Math.floor(r * (1 - factor)));
        const newG = Math.max(0, Math.floor(g * (1 - factor)));
        const newB = Math.max(0, Math.floor(b * (1 - factor)));
        
        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    addRandomSparks(x, y, count) {
        // Add random spark particles for muzzle flash effects
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            const life = 200 + Math.random() * 300;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                size: 2 + Math.random() * 3,
                color: `hsl(${30 + Math.random() * 30}, 100%, ${50 + Math.random() * 50}%)`,
                alpha: 1,
                gravity: 20 + Math.random() * 30,
                specialBehavior: 'spark'
            });
        }
    }

    /**
     * Helper function to lighten a color
     */
    lightenColor(color, factor) {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Lighten by factor
        const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
        const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
        const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
        
        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    // Debug methods
    toggleDebug() {
        this.debugMode = !this.debugMode;
        console.log('Debug mode:', this.debugMode);
    }
    
    toggleCollisionBoxes() {
        this.showCollisionBoxes = !this.showCollisionBoxes;
        console.log('Collision boxes:', this.showCollisionBoxes);
    }

    setupKeyboardControls() {
        // Setup keydown events
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            
            // Handle WASD movement and spacebar shooting (only during battle)
            if (this.currentScene === 'battle') {
                switch (key) {
                    case 'w':
                        this.keys.w = true;
                        event.preventDefault();
                        break;
                    case 'a':
                        this.keys.a = true;
                        event.preventDefault();
                        break;
                    case 's':
                        this.keys.s = true;
                        event.preventDefault();
                        break;
                    case 'd':
                        this.keys.d = true;
                        event.preventDefault();
                        break;
                    case ' ': // Spacebar
                        this.keys.space = true;
                        event.preventDefault();
                        break;
                }
            }
            
            // Handle debug keys (only during battle)
            if (this.currentScene === 'battle') {
                switch (key) {
                    case 'c':
                        this.toggleCollisionBoxes();
                        break;
                    case 'r':
                        // Reset tank rendering log
                        this.hasLoggedTankRender = false;
                        console.log('Tank rendering log reset');
                        break;
                    case 'z':
                        // Zoom out
                        this.camera.targetZoom = Math.max(0.3, this.camera.targetZoom - 0.1);
                        console.log(`Zoom level: ${this.camera.targetZoom.toFixed(1)}`);
                        break;
                    case 'x':
                        // Zoom in
                        this.camera.targetZoom = Math.min(1.5, this.camera.targetZoom + 0.1);
                        console.log(`Zoom level: ${this.camera.targetZoom.toFixed(1)}`);
                        break;
                    case 'e':
                        // Toggle environment debug
                        this.debugEnvironment = !this.debugEnvironment;
                        console.log(`Environment debug: ${this.debugEnvironment ? 'ON' : 'OFF'}`);
                        break;
                }
            }
        });
        
        // Setup keyup events for movement keys
        document.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            
            switch (key) {
                case 'w':
                    this.keys.w = false;
                    break;
                case 'a':
                    this.keys.a = false;
                    break;
                case 's':
                    this.keys.s = false;
                    break;
                case 'd':
                    this.keys.d = false;
                    break;
                case ' ': // Spacebar
                    this.keys.space = false;
                    break;
            }
        });
        
        console.log('Keyboard controls setup:');
        console.log('Movement: WASD keys');
        console.log('Shooting: Spacebar');
        console.log('Debug keys: C = Collision Boxes, E = Environment Debug, R = Reset Tank Log, Z = Zoom Out, X = Zoom In');
    }

    setupFullscreenHandlers() {
        // Handle fullscreen change events
        const fullscreenEvents = [
            'fullscreenchange',
            'webkitfullscreenchange',
            'mozfullscreenchange',
            'MSFullscreenChange'
        ];
        
        fullscreenEvents.forEach(event => {
            document.addEventListener(event, () => {
                const isFullscreen = Utils.isFullscreen();
                console.log(`Fullscreen mode: ${isFullscreen ? 'ON' : 'OFF'}`);
                
                // Adjust canvas size when fullscreen changes
                if (this.ui) {
                    this.ui.adjustCanvasSize();
                }
                
                // Update UI for fullscreen
                this.handleFullscreenChange(isFullscreen);
            });
        });
        
        // Handle escape key to exit fullscreen
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && Utils.isFullscreen()) {
                Utils.exitFullscreen().catch(console.warn);
            }
        });
    }

    handleFullscreenChange(isFullscreen) {
        // Update body class for CSS styling
        if (isFullscreen) {
            document.body.classList.add('fullscreen');
        } else {
            document.body.classList.remove('fullscreen');
        }
        
        // Log fullscreen state
        console.log(`Game is now in ${isFullscreen ? 'fullscreen' : 'windowed'} mode`);
    }

    resetGame() {
        // Reset all progress
        localStorage.removeItem('tankAdventure_progress');
        localStorage.removeItem('tankAdventure_skills');
        localStorage.removeItem('tankAdventure_upgrades');
        localStorage.removeItem('tankAdventure_game');
        
        // Reinitialize
        this.createNewPlayer();
        this.skillManager.reset();
        this.upgradeManager.reset();
        
        console.log('Game reset');
        
        if (this.ui) {
            this.ui.showNotification('Game Reset!', 'info');
        }
    }

    destroy() {
        this.gameRunning = false;
        if (this.ui) {
            this.ui.destroy();
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    window.gameEngine = new GameEngine();
    
    // Add global debug functions
    window.debugGame = () => window.gameEngine.toggleDebug();
    window.resetGame = () => window.gameEngine.resetGame();
    
    console.log('Tank Adventure loaded successfully!');
    
    // Execute notification as requested
    if (typeof notifyMessage === 'function') {
        notifyMessage("Tank Adventure Game Implementation Complete", "ZenCoder");
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.gameEngine) {
        window.gameEngine.saveGame();
    }
});

// Export for global access
window.GameEngine = GameEngine;