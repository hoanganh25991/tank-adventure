// Enemy System

class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.angle = 0;
        this.targetAngle = 0;
        
        // Set stats based on type
        this.setStatsForType(type);
        
        this.isAlive = true;
        this.bullets = [];
        this.behavior = 'seek'; // 'seek', 'patrol', 'flee', 'guard'
        
        // AI state
        this.target = null;
        this.lastShot = 0;
        this.stateTimer = 0;
        this.patrolTarget = { x: x, y: y };
        
        // Visual effects
        this.hitFlash = 0;
        this.muzzleFlash = 0;
        this.isTargeted = false; // For auto-aim visual feedback
        
        // Animation
        this.animationTimer = 0;
    }

    setStatsForType(type) {
        switch (type) {
            case 'basic':
                this.maxHealth = 30;
                this.health = 30;
                this.damage = 8;
                this.speed = 1.5;
                this.size = 20;
                this.shootCooldown = 0;
                this.maxShootCooldown = 1000;
                this.range = 200;
                this.color = '#ff6666';
                this.value = 10; // Score/coins value
                break;
                
            case 'heavy':
                this.maxHealth = 80;
                this.health = 80;
                this.damage = 15;
                this.speed = 0.8;
                this.size = 30;
                this.shootCooldown = 0;
                this.maxShootCooldown = 1500;
                this.range = 250;
                this.color = '#cc4444';
                this.value = 25;
                break;
                
            case 'fast':
                this.maxHealth = 20;
                this.health = 20;
                this.damage = 6;
                this.speed = 3;
                this.size = 15;
                this.shootCooldown = 0;
                this.maxShootCooldown = 600;
                this.range = 150;
                this.color = '#ff9944';
                this.value = 15;
                break;
                
            case 'sniper':
                this.maxHealth = 25;
                this.health = 25;
                this.damage = 20;
                this.speed = 1;
                this.size = 18;
                this.shootCooldown = 0;
                this.maxShootCooldown = 2000;
                this.range = 350;
                this.color = '#9944ff';
                this.value = 20;
                break;
                
            case 'boss':
                this.maxHealth = 200;
                this.health = 200;
                this.damage = 25;
                this.speed = 1.2;
                this.size = 40;
                this.shootCooldown = 0;
                this.maxShootCooldown = 800;
                this.range = 300;
                this.color = '#ff4444';
                this.value = 100;
                break;
        }
    }

    update(deltaTime, player) {
        if (!this.isAlive) return;
        
        this.animationTimer += deltaTime;
        
        // Update cooldowns and effects
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
        if (this.hitFlash > 0) {
            this.hitFlash -= deltaTime * 3;
        }
        if (this.muzzleFlash > 0) {
            this.muzzleFlash -= deltaTime * 5;
        }
        
        // AI behavior
        this.updateAI(deltaTime, player);
        
        // Update angle smoothly
        const angleDiff = this.targetAngle - this.angle;
        const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        this.angle += normalizedAngleDiff * 0.08;
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
            bullet.life -= deltaTime;
            
            if (bullet.life <= 0) {
                this.bullets.splice(i, 1);
            }
        }
    }

    updateAI(deltaTime, player) {
        this.stateTimer += deltaTime;
        
        // Find nearest player tank
        const playerTanks = [player.mainTank, ...player.miniTanks].filter(tank => tank.isAlive);
        if (playerTanks.length === 0) return;
        
        let nearestTank = null;
        let nearestDistance = Infinity;
        
        for (const tank of playerTanks) {
            const distance = Utils.distance(this.x, this.y, tank.x, tank.y);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestTank = tank;
            }
        }
        
        this.target = nearestTank;
        
        // Behavior based on type and distance
        switch (this.type) {
            case 'basic':
                this.basicAI(nearestTank, nearestDistance, deltaTime);
                break;
            case 'heavy':
                this.heavyAI(nearestTank, nearestDistance, deltaTime);
                break;
            case 'fast':
                this.fastAI(nearestTank, nearestDistance, deltaTime);
                break;
            case 'sniper':
                this.sniperAI(nearestTank, nearestDistance, deltaTime);
                break;
            case 'boss':
                this.bossAI(nearestTank, nearestDistance, deltaTime);
                break;
        }
    }

    basicAI(target, distance, deltaTime) {
        if (distance > this.range) {
            // Move towards player
            this.moveTowards(target.x, target.y);
        } else if (distance < 100) {
            // Too close, back away while shooting
            this.moveAway(target.x, target.y);
            this.shootAt(target);
        } else {
            // Good range, shoot
            this.shootAt(target);
        }
    }

    heavyAI(target, distance, deltaTime) {
        if (distance > this.range) {
            this.moveTowards(target.x, target.y);
        } else {
            // Stop and shoot - heavy tanks are slow but powerful
            this.shootAt(target);
        }
    }

    fastAI(target, distance, deltaTime) {
        // Fast hit-and-run tactics
        if (distance > 200) {
            // Rush towards player
            this.moveTowards(target.x, target.y);
        } else if (distance < 80) {
            // Get close and circle strafe
            this.circleStrafe(target, deltaTime);
            this.shootAt(target);
        } else {
            this.shootAt(target);
        }
    }

    sniperAI(target, distance, deltaTime) {
        if (distance > this.range * 0.8) {
            // Move to optimal sniping range
            this.moveTowards(target.x, target.y);
        } else if (distance < 150) {
            // Too close, back away
            this.moveAway(target.x, target.y);
        } else {
            // Perfect range, stay still and snipe
            this.shootAt(target);
        }
    }

    bossAI(target, distance, deltaTime) {
        // Complex boss behavior
        const phase = Math.floor(this.stateTimer / 3000) % 3;
        
        switch (phase) {
            case 0: // Aggressive phase
                if (distance > 150) {
                    this.moveTowards(target.x, target.y);
                }
                this.shootAt(target);
                if (this.stateTimer % 500 < 16) { // Rapid fire bursts
                    this.shootAt(target);
                }
                break;
                
            case 1: // Circle strafe phase
                this.circleStrafe(target, deltaTime);
                this.shootAt(target);
                break;
                
            case 2: // Retreat and snipe phase
                if (distance < 250) {
                    this.moveAway(target.x, target.y);
                }
                this.shootAt(target);
                break;
        }
    }

    moveTowards(targetX, targetY) {
        const angle = Utils.angle(this.x, this.y, targetX, targetY);
        const moveX = Math.cos(angle) * this.speed;
        const moveY = Math.sin(angle) * this.speed;
        
        // Move without boundary constraints (endless world)
        this.x += moveX;
        this.y += moveY;
        this.targetAngle = angle;
    }

    moveAway(targetX, targetY) {
        const angle = Utils.angle(this.x, this.y, targetX, targetY) + Math.PI;
        const moveX = Math.cos(angle) * this.speed;
        const moveY = Math.sin(angle) * this.speed;
        
        // Move without boundary constraints (endless world)
        this.x += moveX;
        this.y += moveY;
        this.targetAngle = Utils.angle(this.x, this.y, targetX, targetY);
    }

    circleStrafe(target, deltaTime) {
        const angle = Utils.angle(this.x, this.y, target.x, target.y);
        const perpendicularAngle = angle + Math.PI / 2;
        
        // Add some variation to the strafing
        const strafeAngle = perpendicularAngle + Math.sin(this.stateTimer * 0.003) * 0.5;
        
        const moveX = Math.cos(strafeAngle) * this.speed;
        const moveY = Math.sin(strafeAngle) * this.speed;
        
        // Move without boundary constraints (endless world)
        this.x += moveX;
        this.y += moveY;
        this.targetAngle = angle;
    }

    shootAt(target) {
        if (this.shootCooldown <= 0 && target && target.isAlive) {
            const angle = Utils.angle(this.x, this.y, target.x, target.y);
            
            // Add some inaccuracy except for snipers
            let finalAngle = angle;
            if (this.type !== 'sniper') {
                const inaccuracy = this.type === 'fast' ? 0.2 : 0.1;
                finalAngle += (Math.random() - 0.5) * inaccuracy;
            }
            
            const bulletSpeed = this.type === 'sniper' ? 12 : 6;
            const bullet = {
                x: this.x + Math.cos(finalAngle) * this.size,
                y: this.y + Math.sin(finalAngle) * this.size,
                angle: finalAngle,
                speed: bulletSpeed,
                damage: this.damage,
                life: 3000,
                owner: 'enemy'
            };
            
            this.bullets.push(bullet);
            this.shootCooldown = this.maxShootCooldown;
            this.muzzleFlash = 1.0;
        }
    }

    takeDamage(damage) {
        if (!this.isAlive) return false;
        
        this.health -= damage;
        this.hitFlash = 1.0;
        
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
            return true;
        }
        return false;
    }

    draw(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Hit flash effect
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.7;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'red';
        }
        
        // Tank body (different shapes for different types)
        ctx.fillStyle = this.color;
        
        if (this.type === 'boss') {
            // Hexagonal shape for boss
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const x = Math.cos(angle) * this.size;
                const y = Math.sin(angle) * this.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            // Standard rectangular tank
            ctx.fillRect(-this.size, -this.size * 0.6, this.size * 2, this.size * 1.2);
        }
        
        // Tank tracks
        ctx.fillStyle = '#222222';
        ctx.fillRect(-this.size, -this.size * 0.8, this.size * 2, this.size * 0.25);
        ctx.fillRect(-this.size, this.size * 0.55, this.size * 2, this.size * 0.25);
        
        // Tank turret
        const turretColor = Utils.interpolateColor(this.color, '#ffffff', 0.3);
        ctx.fillStyle = turretColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Tank cannon
        ctx.fillStyle = '#333333';
        const cannonLength = this.type === 'sniper' ? this.size * 1.5 : this.size * 1.1;
        ctx.fillRect(0, -this.size * 0.12, cannonLength, this.size * 0.24);
        
        // Muzzle flash
        if (this.muzzleFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 0, ${this.muzzleFlash})`;
            ctx.beginPath();
            ctx.arc(cannonLength, 0, this.size * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Type indicator
        if (this.type !== 'basic') {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.type.charAt(0).toUpperCase(), 0, -this.size - 10);
        }
        
        ctx.restore();
        
        // Health bar
        if (this.health < this.maxHealth) {
            this.drawHealthBar(ctx);
        }
        
        // Target indicator for auto-aim
        if (this.isTargeted) {
            this.drawTargetIndicator(ctx);
        }
        
        // Draw bullets
        this.drawBullets(ctx);
    }

    drawHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 4;
        const barY = this.y - this.size - 15;
        
        // Background
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
    }

    drawTargetIndicator(ctx) {
        // Draw targeting reticle around the enemy
        ctx.save();
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8 + 0.2 * Math.sin(Date.now() * 0.01); // Pulsing effect
        
        const reticleSize = this.size + 15;
        
        // Draw corner brackets
        const cornerLength = 8;
        
        // Top-left
        ctx.beginPath();
        ctx.moveTo(this.x - reticleSize, this.y - reticleSize + cornerLength);
        ctx.lineTo(this.x - reticleSize, this.y - reticleSize);
        ctx.lineTo(this.x - reticleSize + cornerLength, this.y - reticleSize);
        ctx.stroke();
        
        // Top-right
        ctx.beginPath();
        ctx.moveTo(this.x + reticleSize - cornerLength, this.y - reticleSize);
        ctx.lineTo(this.x + reticleSize, this.y - reticleSize);
        ctx.lineTo(this.x + reticleSize, this.y - reticleSize + cornerLength);
        ctx.stroke();
        
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(this.x - reticleSize, this.y + reticleSize - cornerLength);
        ctx.lineTo(this.x - reticleSize, this.y + reticleSize);
        ctx.lineTo(this.x - reticleSize + cornerLength, this.y + reticleSize);
        ctx.stroke();
        
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(this.x + reticleSize - cornerLength, this.y + reticleSize);
        ctx.lineTo(this.x + reticleSize, this.y + reticleSize);
        ctx.lineTo(this.x + reticleSize, this.y + reticleSize - cornerLength);
        ctx.stroke();
        
        ctx.restore();
    }

    drawBullets(ctx) {
        for (const bullet of this.bullets) {
            ctx.save();
            ctx.translate(bullet.x, bullet.y);
            ctx.rotate(bullet.angle);
            
            // Bullet trail
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-6, 0);
            ctx.lineTo(0, 0);
            ctx.stroke();
            
            // Bullet head
            ctx.fillStyle = '#ff6666';
            ctx.beginPath();
            ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
}

class WaveManager {
    constructor() {
        this.currentWave = 1;
        this.enemies = [];
        this.enemiesSpawned = 0;
        this.totalEnemiesInWave = 0;
        this.waveActive = false;
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // milliseconds between spawns
        this.wavePaused = false;
    }

    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.enemies = [];
        this.enemiesSpawned = 0;
        this.waveActive = true;
        this.wavePaused = false;
        this.spawnTimer = 0;
        
        // Calculate wave difficulty - More enemies per wave
        this.totalEnemiesInWave = Math.min(10 + waveNumber * 3, 40);
        this.spawnInterval = Math.max(800, 2200 - waveNumber * 80);
        
        console.log(`Starting Wave ${waveNumber} - ${this.totalEnemiesInWave} enemies`);
    }

    update(deltaTime, player) {
        if (!this.waveActive || this.wavePaused) return;
        
        // Update existing enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, player);
            
            // Remove dead enemies
            if (!enemy.isAlive) {
                // Award points and experience
                player.addScore(enemy.value);
                player.addExperience(enemy.value / 2);
                player.addCoins(Math.floor(enemy.value / 4));
                
                this.enemies.splice(i, 1);
            }
        }
        
        // Spawn new enemies
        if (this.enemiesSpawned < this.totalEnemiesInWave) {
            this.spawnTimer += deltaTime;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnEnemy(player);
                this.spawnTimer = 0;
            }
        }
        
        // Check if wave is complete
        if (this.enemiesSpawned >= this.totalEnemiesInWave && this.enemies.length === 0) {
            this.waveActive = false;
        }
    }

    spawnEnemy(player) {
        if (!player || !player.mainTank) return;
        
        // Spawn enemies around player position (off-screen but near player)
        const playerX = player.mainTank.x;
        const playerY = player.mainTank.y;
        const spawnDistance = 400; // Distance from player to spawn
        
        // Choose random angle around player
        const angle = Math.random() * Math.PI * 2;
        const x = playerX + Math.cos(angle) * spawnDistance;
        const y = playerY + Math.sin(angle) * spawnDistance;
        
        // Choose enemy type based on wave number
        const enemyType = this.chooseEnemyType();
        const enemy = new Enemy(x, y, enemyType);
        
        this.enemies.push(enemy);
        this.enemiesSpawned++;
    }

    chooseEnemyType() {
        const wave = this.currentWave;
        
        // Boss every 5 waves
        if (wave % 5 === 0 && Math.random() < 0.3) {
            return 'boss';
        }
        
        // Type probabilities based on wave
        const types = ['basic', 'heavy', 'fast', 'sniper'];
        const probabilities = [
            Math.max(0.6 - wave * 0.05, 0.2), // basic (decreases)
            Math.min(0.1 + wave * 0.03, 0.4),  // heavy (increases)
            Math.min(0.2 + wave * 0.02, 0.3),  // fast (increases)
            Math.min(0.1 + wave * 0.02, 0.3)   // sniper (increases)
        ];
        
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < types.length; i++) {
            cumulative += probabilities[i];
            if (random < cumulative) {
                return types[i];
            }
        }
        
        return 'basic';
    }

    getAllBullets() {
        let bullets = [];
        for (const enemy of this.enemies) {
            bullets = bullets.concat(enemy.bullets);
        }
        return bullets;
    }

    isWaveComplete() {
        return !this.waveActive;
    }

    getEnemiesRemaining() {
        return this.enemies.length + (this.totalEnemiesInWave - this.enemiesSpawned);
    }

    pauseWave() {
        this.wavePaused = true;
    }

    resumeWave() {
        this.wavePaused = false;
    }

    draw(ctx) {
        for (const enemy of this.enemies) {
            enemy.draw(ctx);
        }
    }
}

// Export for global access
window.Enemy = Enemy;
window.WaveManager = WaveManager;