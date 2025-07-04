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
        this.maxWaves = 10; // Default max waves
        this.battleType = 'standard'; // 'quick', 'standard', 'extended'
        this.battleTitle = 'Standard Battle';
        this.battleStats = {
            enemiesDefeated: 0,
            scoreEarned: 0,
            expGained: 0
        };
        
        // Effects
        this.explosions = [];
        this.damageNumbers = []; // Floating damage numbers
        this.particles = [];
        
        // Debug flags
        this.debugMode = false; // Set to true to see test objects at fixed coordinates
        this.debugEnvironment = false; // Set to true to enable environment debug logging
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
        
        // Dynamic environment spawning system
        this.dynamicEnvironment = {
            lastPlayerX: 0,
            lastPlayerY: 0,
            movementThreshold: 150, // Spawn new environment every 150 units of movement
            accumulatedDistance: 0,
            spawnedRegions: new Set(), // Track which grid regions have been spawned
            maxSpawnedRegions: 1000 // Limit to prevent memory issues
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
        this.updateDamageNumbers(deltaTime);
        
        // Handle input
        this.handleInput();
    }

    updateBattle(deltaTime) {
        if (!this.player || !this.waveManager) return;
        
        // Update player
        this.player.update(deltaTime, this.waveManager.enemies);
        
        // Update camera to follow player
        this.updateCamera();
        
        // Update dynamic environment based on player movement
        this.updateDynamicEnvironment();
        
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

    updateDynamicEnvironment() {
        if (!this.player || !this.player.mainTank) return;
        
        const currentX = this.player.mainTank.x;
        const currentY = this.player.mainTank.y;
        
        // Calculate distance moved since last check
        const dx = currentX - this.dynamicEnvironment.lastPlayerX;
        const dy = currentY - this.dynamicEnvironment.lastPlayerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.dynamicEnvironment.accumulatedDistance += distance;
        
        // Check if we should trigger new environment spawning
        if (this.dynamicEnvironment.accumulatedDistance >= this.dynamicEnvironment.movementThreshold) {
            this.spawnEnvironmentAroundPlayer(currentX, currentY);
            this.dynamicEnvironment.accumulatedDistance = 0;
            
            // Clean up old regions if we have too many
            if (this.dynamicEnvironment.spawnedRegions.size > this.dynamicEnvironment.maxSpawnedRegions) {
                this.cleanupDistantEnvironmentRegions(currentX, currentY);
            }
        }
        
        // Update last position
        this.dynamicEnvironment.lastPlayerX = currentX;
        this.dynamicEnvironment.lastPlayerY = currentY;
    }

    spawnEnvironmentAroundPlayer(playerX, playerY) {
        // Define spawn radius around player
        const spawnRadius = 400;
        const gridSize = 200;
        
        // Generate environment in a grid around the player
        for (let x = playerX - spawnRadius; x <= playerX + spawnRadius; x += gridSize) {
            for (let y = playerY - spawnRadius; y <= playerY + spawnRadius; y += gridSize) {
                const regionKey = `${Math.floor(x / gridSize)}_${Math.floor(y / gridSize)}`;
                
                // Only spawn if this region hasn't been generated yet
                if (!this.dynamicEnvironment.spawnedRegions.has(regionKey)) {
                    this.dynamicEnvironment.spawnedRegions.add(regionKey);
                    
                    // Chance to spawn special environmental clusters
                    const seed = (Math.floor(x / gridSize) * 31 + Math.floor(y / gridSize) * 37) % 100;
                    
                    if (seed < 15) { // 15% chance for special environment cluster
                        this.spawnEnvironmentCluster(x, y, seed);
                    }
                }
            }
        }
    }

    spawnEnvironmentCluster(centerX, centerY, seed) {
        const clusterRadius = 80;
        const clusterType = seed % 4;
        
        switch (clusterType) {
            case 0: // Mushroom grove
                this.spawnMushroomGrove(centerX, centerY, seed);
                break;
            case 1: // Crystal formation
                this.spawnCrystalFormation(centerX, centerY, seed);
                break;
            case 2: // Ancient ruins
                this.spawnRuinCluster(centerX, centerY, seed);
                break;
            case 3: // Dense flower field
                this.spawnFlowerField(centerX, centerY, seed);
                break;
        }
    }

    spawnMushroomGrove(centerX, centerY, seed) {
        // This is just for tracking - the actual rendering is still handled 
        // by the grid-based rendering system. This method could store 
        // special environment data if needed for future features.
        if (this.debugEnvironment) {
            console.log(`Spawned mushroom grove at (${centerX}, ${centerY})`);
        }
    }

    spawnCrystalFormation(centerX, centerY, seed) {
        if (this.debugEnvironment) {
            console.log(`Spawned crystal formation at (${centerX}, ${centerY})`);
        }
    }

    spawnRuinCluster(centerX, centerY, seed) {
        if (this.debugEnvironment) {
            console.log(`Spawned ruin cluster at (${centerX}, ${centerY})`);
        }
    }

    spawnFlowerField(centerX, centerY, seed) {
        if (this.debugEnvironment) {
            console.log(`Spawned flower field at (${centerX}, ${centerY})`);
        }
    }

    cleanupDistantEnvironmentRegions(playerX, playerY) {
        const cleanupRadius = 1000; // Remove regions beyond this distance
        const regionsToRemove = [];
        
        this.dynamicEnvironment.spawnedRegions.forEach(regionKey => {
            const [gridX, gridY] = regionKey.split('_').map(Number);
            const worldX = gridX * 200; // gridSize = 200
            const worldY = gridY * 200;
            
            const distance = Math.sqrt(
                (worldX - playerX) ** 2 + (worldY - playerY) ** 2
            );
            
            if (distance > cleanupRadius) {
                regionsToRemove.push(regionKey);
            }
        });
        
        regionsToRemove.forEach(regionKey => {
            this.dynamicEnvironment.spawnedRegions.delete(regionKey);
        });
        
        if (this.debugEnvironment && regionsToRemove.length > 0) {
            console.log(`Cleaned up ${regionsToRemove.length} distant environment regions`);
        }
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
                    
                    // Create floating damage number
                    this.createDamageNumber(bullet.x, bullet.y, bullet.damage, destroyed, enemy.shield > 0);
                    
                    // Play critical hit sound if it was a critical hit
                    if (bullet.isCritical && this.soundManager) {
                        this.soundManager.play('critical_hit');
                    }
                    
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
                        
                        // Play enemy death sound
                        this.playEnemyDeathSound(enemy.type);
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
        
        // Check if this was the final wave
        const isFinalWave = this.currentWave >= this.maxWaves;
        
        // Apply bonus rewards for completing all waves
        let bonusMultiplier = 1.0;
        let baseMultiplier = 1.0;
        
        // Apply different base multipliers based on battle type
        if (this.battleType === 'quick') {
            baseMultiplier = 1.0; // Base multiplier for quick battles
        } else if (this.battleType === 'standard') {
            baseMultiplier = 1.2; // 20% higher base rewards for standard battles
        } else if (this.battleType === 'extended') {
            baseMultiplier = 1.5; // 50% higher base rewards for extended battles
        }
        
        // Apply completion bonus if player won the final wave
        if (victory && isFinalWave) {
            // Different completion bonuses based on battle type
            if (this.battleType === 'quick') {
                bonusMultiplier = 1.3; // 30% bonus for completing quick battle
            } else if (this.battleType === 'standard') {
                bonusMultiplier = 1.5; // 50% bonus for completing standard battle
            } else if (this.battleType === 'extended') {
                bonusMultiplier = 2.0; // 100% bonus for completing extended battle (double rewards)
            }
            
            console.log(`Final wave completed! Battle type: ${this.battleType}. Applying ${(bonusMultiplier-1)*100}% completion bonus to rewards.`);
        }
        
        // Calculate final rewards with both base multiplier and completion bonus
        const totalMultiplier = baseMultiplier * bonusMultiplier;
        const finalScore = Math.floor(this.battleStats.scoreEarned * totalMultiplier);
        const finalExp = Math.floor(this.battleStats.expGained * totalMultiplier);
        const finalCoins = Math.floor(finalScore / 4);
        
        this.player.addScore(finalScore);
        this.player.addExperience(finalExp);
        this.player.addCoins(finalCoins);
        
        // Save progress
        this.saveGame();
        
        // Show results
        this.ui.showBattleResults({
            victory: victory,
            wave: this.currentWave,
            enemiesDefeated: this.battleStats.enemiesDefeated,
            scoreEarned: finalScore,
            expGained: finalExp,
            battleType: this.battleType,
            isFinalWave: isFinalWave,
            bonusApplied: isFinalWave && victory,
            baseMultiplier: baseMultiplier,
            bonusMultiplier: bonusMultiplier,
            totalMultiplier: totalMultiplier
        });
    }

    showSkillSelection() {
        console.log(`Showing skill selection after wave ${this.currentWave}`);
        this.currentScene = 'skillSelection';
        this.waveManager.pauseWave();
        
        const skillChoices = this.skillManager.getRandomSkillChoices(3);
        this.ui.showSkillSelection(skillChoices);
    }

    startBattle(battleType = 'standard') {
        console.log(`Starting ${battleType} battle...`);
        
        this.currentScene = 'battle';
        this.currentWave = 1;
        this.waveCompleted = false;
        
        // Set battle type and max waves
        this.battleType = battleType;
        switch (battleType) {
            case 'quick':
                this.maxWaves = 3;
                this.battleTitle = '⚡ Quick Battle (3 Waves)';
                break;
            case 'standard':
                this.maxWaves = 5;
                this.battleTitle = '🔥 Standard Battle (5 Waves)';
                break;
            case 'extended':
                this.maxWaves = 10;
                this.battleTitle = '💪 Extended Battle (10 Waves)';
                break;
            default:
                this.maxWaves = 5;
                this.battleTitle = '🔥 Standard Battle (5 Waves)';
        }
        
        // Clear active skills for new battle session
        this.skillManager.clearActiveSkills();
        
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
        
        // Show battle title notification
        if (this.ui) {
            this.ui.showNotification(this.battleTitle, 'battle');
        }
    }

    continueToNextWave() {
        this.currentWave++;
        this.currentScene = 'battle';
        
        // Regenerate health for all tanks to 100% after each wave
        this.regenerateAllTanksHealth();
        
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
        
        // Regenerate health for all tanks to 100% after each wave
        this.regenerateAllTanksHealth();
        
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
        
        // Draw damage numbers (in world space)
        this.drawDamageNumbers(this.ctx);
        
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
        // Draw environmental elements using emojis to make the battlefield more interesting
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
        
        // Set up emoji rendering
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 🗿 Draw rocks with 4 shapes (square, circle, hexagon, triangle)
        let rockCount = 0;
        for (let x = Math.floor(viewLeft / 200) * 200; x < viewRight; x += 200) {
            for (let y = Math.floor(viewTop / 200) * 200; y < viewBottom; y += 200) {
                const seed = (x * 31 + y * 17) % 100;
                if (seed > 50) { // 50% chance for rocks
                    const rockX = x + (seed % 50) - 25;
                    const rockY = y + ((seed * 7) % 50) - 25;
                    const rockSize = (15 + (seed % 20)) / this.camera.zoom;
                    
                    this.ctx.font = `${rockSize}px Arial`;
                    this.ctx.fillStyle = '#8B4513'; // Brown color for rock emoji shadow
                    this.ctx.fillText('🗿', rockX, rockY);
                    rockCount++;
                }
            }
        }
        
        // 🌳 Draw trees with 3 types (standard, pine, bushy)
        let treeCount = 0;
        for (let x = Math.floor(viewLeft / 150) * 150; x < viewRight; x += 150) {
            for (let y = Math.floor(viewTop / 150) * 150; y < viewBottom; y += 150) {
                const seed = (x * 23 + y * 19) % 100;
                if (seed > 40) { // 60% chance for trees
                    const treeX = x + (seed % 40) - 20;
                    const treeY = y + ((seed * 11) % 40) - 20;
                    const treeSize = (20 + (seed % 15)) / this.camera.zoom;
                    const treeType = (seed * 7) % 3; // 3 tree types
                    
                    this.ctx.font = `${treeSize}px Arial`;
                    
                    let treeEmoji;
                    switch (treeType) {
                        case 0: treeEmoji = '🌳'; break; // Standard tree
                        case 1: treeEmoji = '🌲'; break; // Pine tree
                        case 2: treeEmoji = '🌴'; break; // Bushy/palm tree
                    }
                    
                    this.ctx.fillStyle = '#228B22'; // Forest green shadow
                    this.ctx.fillText(treeEmoji, treeX, treeY);
                    treeCount++;
                }
            }
        }
        
        // 🟦 Draw water with animated ripples
        let waterCount = 0;
        const time = Date.now() * 0.001;
        for (let x = Math.floor(viewLeft / 300) * 300; x < viewRight; x += 300) {
            for (let y = Math.floor(viewTop / 300) * 300; y < viewBottom; y += 300) {
                const seed = (x * 13 + y * 29) % 100;
                if (seed > 70) { // 30% chance for water
                    const waterX = x + (seed % 60) - 30;
                    const waterY = y + ((seed * 13) % 60) - 30;
                    const waterSize = (30 + (seed % 25)) / this.camera.zoom;
                    
                    // Animated water effect with slight movement
                    const waveOffset = Math.sin(time + seed * 0.1) * 2;
                    
                    this.ctx.font = `${waterSize}px Arial`;
                    this.ctx.fillStyle = '#4169E1'; // Royal blue shadow
                    this.ctx.fillText('🟦', waterX + waveOffset, waterY);
                    
                    // Add some ripple effects with smaller water emojis
                    if (waterSize > 20) {
                        const rippleSize = waterSize * 0.6;
                        this.ctx.font = `${rippleSize}px Arial`;
                        this.ctx.globalAlpha = 0.5;
                        this.ctx.fillText('💧', waterX - waveOffset, waterY + waveOffset);
                        this.ctx.globalAlpha = 1.0;
                    }
                    
                    waterCount++;
                }
            }
        }
        
        // 🌿 Draw bushes as small clustered shrubs
        let bushCount = 0;
        for (let x = Math.floor(viewLeft / 120) * 120; x < viewRight; x += 120) {
            for (let y = Math.floor(viewTop / 120) * 120; y < viewBottom; y += 120) {
                const seed = (x * 41 + y * 37) % 100;
                if (seed > 65) { // 35% chance for bushes
                    const bushX = x + (seed % 30) - 15;
                    const bushY = y + ((seed * 9) % 30) - 15;
                    const bushSize = (8 + (seed % 8)) / this.camera.zoom;
                    
                    this.ctx.font = `${bushSize}px Arial`;
                    this.ctx.fillStyle = '#32CD32'; // Lime green shadow
                    this.ctx.fillText('🌿', bushX, bushY);
                    
                    // Add clustered effect with smaller bushes nearby
                    if (bushSize > 6) {
                        const clusterSize = bushSize * 0.7;
                        this.ctx.font = `${clusterSize}px Arial`;
                        this.ctx.globalAlpha = 0.7;
                        
                        // Add 1-2 smaller bushes nearby
                        const clusterCount = 1 + (seed % 2);
                        for (let i = 0; i < clusterCount; i++) {
                            const offsetX = ((seed * (i + 1)) % 12) - 6;
                            const offsetY = ((seed * (i + 2)) % 12) - 6;
                            this.ctx.fillText('🌱', bushX + offsetX, bushY + offsetY);
                        }
                        this.ctx.globalAlpha = 1.0;
                    }
                    
                    bushCount++;
                }
            }
        }
        
        // 🌸 Draw flowers with 4 colors (red, teal, blue, yellow)
        let flowerCount = 0;
        for (let x = Math.floor(viewLeft / 80) * 80; x < viewRight; x += 80) {
            for (let y = Math.floor(viewTop / 80) * 80; y < viewBottom; y += 80) {
                const seed = (x * 47 + y * 43) % 100;
                if (seed > 75) { // 25% chance for flowers
                    const flowerX = x + (seed % 20) - 10;
                    const flowerY = y + ((seed * 11) % 20) - 10;
                    const flowerSize = (3 + (seed % 3)) / this.camera.zoom;
                    
                    // 4 flower colors as requested
                    const colorType = (seed * 13) % 4;
                    let flowerEmoji;
                    switch (colorType) {
                        case 0: flowerEmoji = '🌺'; break; // Red flower
                        case 1: flowerEmoji = '🌸'; break; // Teal/pink flower
                        case 2: flowerEmoji = '💙'; break; // Blue flower (using blue heart as flower)
                        case 3: flowerEmoji = '🌻'; break; // Yellow flower (sunflower)
                    }
                    
                    this.ctx.font = `${Math.max(8, flowerSize)}px Arial`;
                    this.ctx.fillStyle = '#FF69B4'; // Hot pink shadow
                    this.ctx.fillText(flowerEmoji, flowerX, flowerY);
                    flowerCount++;
                }
            }
        }
        
        // 🟫 Draw dirt patches as irregular brown areas
        let dirtCount = 0;
        for (let x = Math.floor(viewLeft / 250) * 250; x < viewRight; x += 250) {
            for (let y = Math.floor(viewTop / 250) * 250; y < viewBottom; y += 250) {
                const seed = (x * 59 + y * 61) % 100;
                if (seed > 80) { // 20% chance for dirt patches
                    const dirtX = x + (seed % 40) - 20;
                    const dirtY = y + ((seed * 17) % 40) - 20;
                    const dirtSize = (25 + (seed % 15)) / this.camera.zoom;
                    
                    this.ctx.font = `${dirtSize}px Arial`;
                    this.ctx.fillStyle = '#8B4513'; // Saddle brown shadow
                    this.ctx.fillText('🟫', dirtX, dirtY);
                    
                    // Add irregular effect with multiple dirt patches
                    if (dirtSize > 15) {
                        const patchCount = 2 + (seed % 3);
                        for (let i = 0; i < patchCount; i++) {
                            const patchSize = dirtSize * (0.5 + (seed * (i + 1) % 30) / 100);
                            const offsetX = ((seed * (i + 1)) % 20) - 10;
                            const offsetY = ((seed * (i + 2)) % 20) - 10;
                            
                            this.ctx.font = `${patchSize}px Arial`;
                            this.ctx.globalAlpha = 0.6 + (i * 0.1);
                            this.ctx.fillText('🟤', dirtX + offsetX, dirtY + offsetY);
                        }
                        this.ctx.globalAlpha = 1.0;
                    }
                    
                    dirtCount++;
                }
            }
        }
        
        // 🍄 Draw mushrooms for additional variety
        let mushroomCount = 0;
        for (let x = Math.floor(viewLeft / 180) * 180; x < viewRight; x += 180) {
            for (let y = Math.floor(viewTop / 180) * 180; y < viewBottom; y += 180) {
                const seed = (x * 67 + y * 71) % 100;
                if (seed > 85) { // 15% chance for mushrooms
                    const mushroomX = x + (seed % 30) - 15;
                    const mushroomY = y + ((seed * 19) % 30) - 15;
                    const mushroomSize = (6 + (seed % 6)) / this.camera.zoom;
                    
                    this.ctx.font = `${Math.max(8, mushroomSize)}px Arial`;
                    this.ctx.fillStyle = '#8B4513'; // Brown shadow
                    this.ctx.fillText('🍄', mushroomX, mushroomY);
                    mushroomCount++;
                }
            }
        }
        
        // 🌾 Draw grass/wheat for additional texture
        let grassCount = 0;
        for (let x = Math.floor(viewLeft / 60) * 60; x < viewRight; x += 60) {
            for (let y = Math.floor(viewTop / 60) * 60; y < viewBottom; y += 60) {
                const seed = (x * 73 + y * 79) % 100;
                if (seed > 70) { // 30% chance for grass
                    const grassX = x + (seed % 15) - 7;
                    const grassY = y + ((seed * 23) % 15) - 7;
                    const grassSize = (4 + (seed % 4)) / this.camera.zoom;
                    
                    this.ctx.font = `${Math.max(6, grassSize)}px Arial`;
                    this.ctx.fillStyle = '#9ACD32'; // Yellow green shadow
                    this.ctx.fillText('🌾', grassX, grassY);
                    grassCount++;
                }
            }
        }
        
        // 🪨 Draw additional stone variations
        let stoneCount = 0;
        for (let x = Math.floor(viewLeft / 220) * 220; x < viewRight; x += 220) {
            for (let y = Math.floor(viewTop / 220) * 220; y < viewBottom; y += 220) {
                const seed = (x * 83 + y * 89) % 100;
                if (seed > 75) { // 25% chance for stones
                    const stoneX = x + (seed % 40) - 20;
                    const stoneY = y + ((seed * 29) % 40) - 20;
                    const stoneSize = (10 + (seed % 12)) / this.camera.zoom;
                    
                    this.ctx.font = `${Math.max(8, stoneSize)}px Arial`;
                    this.ctx.fillStyle = '#696969'; // Dim gray shadow
                    this.ctx.fillText('🪨', stoneX, stoneY);
                    stoneCount++;
                }
            }
        }
        
        // 🌵 Draw cacti for desert areas
        let cactusCount = 0;
        for (let x = Math.floor(viewLeft / 400) * 400; x < viewRight; x += 400) {
            for (let y = Math.floor(viewTop / 400) * 400; y < viewBottom; y += 400) {
                const seed = (x * 97 + y * 101) % 100;
                if (seed > 90) { // 10% chance for cacti (rare)
                    const cactusX = x + (seed % 80) - 40;
                    const cactusY = y + ((seed * 31) % 80) - 40;
                    const cactusSize = (18 + (seed % 12)) / this.camera.zoom;
                    
                    this.ctx.font = `${Math.max(12, cactusSize)}px Arial`;
                    this.ctx.fillStyle = '#228B22'; // Forest green shadow
                    this.ctx.fillText('🌵', cactusX, cactusY);
                    cactusCount++;
                }
            }
        }
        
        // Debug information
        if (this.debugEnvironment) {
            console.log(`Environment counts - Rocks: ${rockCount}, Trees: ${treeCount}, Water: ${waterCount}, Bushes: ${bushCount}, Flowers: ${flowerCount}, Dirt: ${dirtCount}, Mushrooms: ${mushroomCount}, Grass: ${grassCount}, Stones: ${stoneCount}, Cacti: ${cactusCount}`);
        }
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

    playEnemyDeathSound(enemyType) {
        if (this.soundManager) {
            const soundId = `enemy_${enemyType}_death`;
            this.soundManager.play(soundId);
        }
    }

    createDamageNumber(x, y, damage, isKill = false, hitShield = false) {
        // Create floating damage number
        const damageNumber = {
            x: x,
            y: y,
            damage: Math.floor(damage),
            life: 1500,
            maxLife: 1500,
            vy: -50, // Float upward
            vx: (Math.random() - 0.5) * 20, // Slight horizontal drift
            isKill: isKill,
            hitShield: hitShield,
            scale: 1.2,
            alpha: 1.0
        };
        
        this.damageNumbers.push(damageNumber);
    }

    updateDamageNumbers(deltaTime) {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dmg = this.damageNumbers[i];
            
            // Update position
            dmg.x += dmg.vx * deltaTime / 1000;
            dmg.y += dmg.vy * deltaTime / 1000;
            
            // Update properties
            dmg.life -= deltaTime;
            dmg.alpha = dmg.life / dmg.maxLife;
            dmg.scale = 1.2 + (1 - dmg.alpha) * 0.5;
            
            // Slow down vertical movement
            dmg.vy *= 0.98;
            
            // Remove expired numbers
            if (dmg.life <= 0) {
                this.damageNumbers.splice(i, 1);
            }
        }
    }

    drawDamageNumbers(ctx) {
        for (const dmg of this.damageNumbers) {
            ctx.save();
            ctx.globalAlpha = dmg.alpha;
            ctx.font = `${Math.floor(16 * dmg.scale)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Color based on damage type
            if (dmg.isKill) {
                ctx.fillStyle = '#FF0000'; // Red for kills
                ctx.shadowColor = '#FF0000';
                ctx.shadowBlur = 8;
            } else if (dmg.hitShield) {
                ctx.fillStyle = '#00BFFF'; // Blue for shield hits
                ctx.shadowColor = '#00BFFF';
                ctx.shadowBlur = 6;
            } else {
                ctx.fillStyle = '#FFFF00'; // Yellow for normal damage
                ctx.shadowColor = '#FFFF00';
                ctx.shadowBlur = 4;
            }
            
            // Draw damage number
            ctx.fillText(dmg.damage.toString(), dmg.x, dmg.y);
            
            // Add "KILL!" text for kills
            if (dmg.isKill) {
                ctx.font = `${Math.floor(12 * dmg.scale)}px Arial`;
                ctx.fillText('KILL!', dmg.x, dmg.y + 20);
            }
            
            ctx.restore();
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
            document.addEventListener(event, Utils.debounce(() => {
                const isFullscreen = Utils.isFullscreen();
                console.log(`Fullscreen mode: ${isFullscreen ? 'ON' : 'OFF'}`);
                
                // Adjust canvas size when fullscreen changes
                if (this.ui) {
                    this.ui.adjustCanvasSize();
                }
                
                // Update UI for fullscreen
                this.handleFullscreenChange(isFullscreen);
                
                // Update player position if in battle mode to prevent off-screen issues
                if (this.currentScene === 'battle' && this.player && this.player.mainTank) {
                    const canvasDims = this.getCanvasCSSDimensions();
                    // Only adjust if player is way off screen
                    if (this.player.mainTank.x < -canvasDims.width || 
                        this.player.mainTank.x > canvasDims.width * 2 ||
                        this.player.mainTank.y < -canvasDims.height || 
                        this.player.mainTank.y > canvasDims.height * 2) {
                        this.player.mainTank.x = canvasDims.width / 2;
                        this.player.mainTank.y = canvasDims.height / 2;
                        console.log('Player position adjusted for fullscreen');
                    }
                }
            }, 100));
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
        
        // Force canvas context re-setup for crisp rendering
        setTimeout(() => {
            this.updateCanvasForFullscreen();
        }, 100); // Small delay to ensure canvas resize has completed
        
        // Log fullscreen state
        console.log(`Game is now in ${isFullscreen ? 'fullscreen' : 'windowed'} mode`);
    }

    updateCanvasForFullscreen() {
        // Re-setup canvas context for crisp rendering
        this.setupContextForCrispRendering();
        
        // Update camera if in battle mode to re-center on player
        if (this.currentScene === 'battle' && this.player && this.player.mainTank) {
            this.updateCamera();
            
            // Force immediate camera update to new screen dimensions
            const canvasDims = this.getCanvasCSSDimensions();
            this.camera.targetX = this.player.mainTank.x - (canvasDims.width / 2) / this.camera.zoom;
            this.camera.targetY = this.player.mainTank.y - (canvasDims.height / 2) / this.camera.zoom;
            this.camera.x = this.camera.targetX;
            this.camera.y = this.camera.targetY;
        }
        
        // Trigger a render to ensure everything is displayed correctly
        this.render();
        
        console.log('Canvas updated for fullscreen transition');
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

    regenerateAllTanksHealth() {
        if (!this.player) return;
        
        console.log('Regenerating health for all tanks to 100%');
        
        // Regenerate main tank health to 100%
        this.player.mainTank.health = this.player.mainTank.maxHealth;
        this.player.mainTank.isAlive = true;
        
        // Regenerate all mini tanks health to 100%
        for (const miniTank of this.player.miniTanks) {
            miniTank.health = miniTank.maxHealth;
            miniTank.isAlive = true;
        }
        
        // Show a visual notification to the player
        if (this.ui) {
            this.ui.showNotification('💚 All Tanks Fully Healed!', 'success');
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
    
    // Request fullscreen on page load
    // Note: Most browsers require a user interaction before allowing fullscreen
    // We'll add a click event listener to the document to request fullscreen on first interaction
    const requestFullscreenOnInteraction = () => {
        // Only request fullscreen if not already in fullscreen mode
        if (!Utils.isFullscreen()) {
            Utils.requestFullscreen().catch(err => {
                console.warn('Error attempting to enable fullscreen:', err);
            });
        }
        // Remove the event listener after first interaction
        document.removeEventListener('click', requestFullscreenOnInteraction);
    };
    
    // Add event listener for the first user interaction
    document.addEventListener('click', requestFullscreenOnInteraction);
    
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