// Main Game Engine

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
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
        
        // Camera system for endless movement
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.1
        };
        
        this.initialize();
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
        // Create player at center of screen
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        console.log('Created new player');
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
            particle.x += particle.vx * deltaTime / 1000;
            particle.y += particle.vy * deltaTime / 1000;
            particle.life -= deltaTime;
            particle.alpha = Math.max(0, particle.life / particle.maxLife);
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateCamera() {
        if (!this.player || !this.player.mainTank) return;
        
        // Set camera target to center on player
        this.camera.targetX = this.player.mainTank.x - this.canvas.width / 2;
        this.camera.targetY = this.player.mainTank.y - this.canvas.height / 2;
        
        // Smooth camera movement
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
    }

    handleInput() {
        if (this.currentScene !== 'battle' || !this.player || !this.ui) return;
        
        // Get joystick input
        const joystick = this.ui.getJoystickInput();
        
        // Set movement direction directly instead of target points
        this.player.setMovementDirection(joystick.x, joystick.y, joystick.magnitude);
    }

    checkCollisions() {
        const playerBullets = this.player.getAllBullets();
        const enemyBullets = this.waveManager.getAllBullets();
        const enemies = this.waveManager.enemies;
        const playerTanks = [this.player.mainTank, ...this.player.miniTanks].filter(tank => tank.isAlive);
        
        // Player bullets vs enemies
        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const bullet = playerBullets[i];
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (!enemy.isAlive) continue;
                
                if (Utils.circleCollision(bullet.x, bullet.y, 3, enemy.x, enemy.y, enemy.size)) {
                    // Hit enemy
                    const destroyed = enemy.takeDamage(bullet.damage);
                    
                    // Create hit effect
                    this.createHitEffect(bullet.x, bullet.y, bullet.damage);
                    
                    // Check for explosive shot
                    if (this.player.explosiveShotActive) {
                        this.createExplosion(bullet.x, bullet.y, 50, bullet.damage / 2);
                    }
                    
                    // Remove bullet
                    this.removePlayerBullet(bullet);
                    
                    if (destroyed) {
                        this.battleStats.enemiesDefeated++;
                        this.battleStats.scoreEarned += enemy.value;
                        this.battleStats.expGained += Math.floor(enemy.value / 2);
                    }
                    
                    break;
                }
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
        if (this.waveManager.isWaveComplete()) {
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
        this.currentScene = 'skillSelection';
        this.waveManager.pauseWave();
        
        const skillChoices = this.skillManager.getRandomSkillChoices(3);
        this.ui.showSkillSelection(skillChoices);
    }

    startBattle() {
        console.log('Starting battle...');
        
        this.currentScene = 'battle';
        this.currentWave = 1;
        
        // Reset battle stats
        this.battleStats = {
            enemiesDefeated: 0,
            scoreEarned: 0,
            expGained: 0
        };
        
        // Reset player position and health
        this.player.mainTank.x = this.canvas.width / 2;
        this.player.mainTank.y = this.canvas.height / 2;
        
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
        this.currentScene = 'battle';
        this.waveManager.resumeWave();
        this.ui.showScreen('battleScreen');
    }

    render() {
        // Clear canvas
        Utils.clearCanvas(this.ctx, this.canvas.width, this.canvas.height);
        
        if (this.currentScene === 'battle') {
            this.renderBattle();
            
            // Render effects in world space
            this.ctx.save();
            this.ctx.translate(-this.camera.x, -this.camera.y);
            this.renderEffects();
            this.ctx.restore();
        }
    }

    renderBattle() {
        // Save context and apply camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw background
        this.drawBackground();
        
        // Draw player
        if (this.player) {
            this.player.draw(this.ctx);
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
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        
        // Calculate grid offset based on camera position
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        const endX = startX + this.canvas.width + gridSize;
        const endY = startY + this.canvas.height + gridSize;
        
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

    drawBattleUI() {
        // Any additional battle UI that needs to be drawn on canvas
        // Most UI is handled by HTML/CSS overlay
    }

    renderEffects() {
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

    // Debug methods
    toggleDebug() {
        this.debugMode = !this.debugMode;
        console.log('Debug mode:', this.debugMode);
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