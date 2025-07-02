// Player and Tank System

class Tank {
    constructor(x, y, type = 'main') {
        this.x = x;
        this.y = y;
        this.type = type; // 'main' or 'mini'
        this.angle = 0;
        this.targetAngle = 0;
        
        // Base stats (will be modified by upgrades)
        if (type === 'main') {
            this.maxHealth = 100;
            this.health = 100;
            this.damage = 10;
            this.speed = 3;
            this.size = 25;
            this.shootCooldown = 0;
            this.maxShootCooldown = 300; // milliseconds
        } else {
            this.maxHealth = 50;
            this.health = 50;
            this.damage = 5;
            this.speed = 2.5;
            this.size = 15;
            this.shootCooldown = 0;
            this.maxShootCooldown = 500;
        }
        
        this.isAlive = true;
        this.bullets = [];
        
        // Visual effects
        this.hitFlash = 0;
        this.muzzleFlash = 0;
    }

    update(deltaTime) {
        // Update cooldowns
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
        
        // Update visual effects
        if (this.hitFlash > 0) {
            this.hitFlash -= deltaTime * 3;
        }
        if (this.muzzleFlash > 0) {
            this.muzzleFlash -= deltaTime * 5;
        }
        
        // Smooth angle rotation
        const angleDiff = this.targetAngle - this.angle;
        const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        this.angle += normalizedAngleDiff * 0.1;
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
            bullet.life -= deltaTime;
            
            // Remove bullets that are out of bounds or expired
            if (bullet.life <= 0 || bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
                this.bullets.splice(i, 1);
            }
        }
    }

    shoot(targetX = null, targetY = null) {
        if (this.shootCooldown <= 0 && this.isAlive) {
            let angle = this.angle;
            
            // If target is specified, aim at target
            if (targetX !== null && targetY !== null) {
                angle = Utils.angle(this.x, this.y, targetX, targetY);
                this.targetAngle = angle;
            }
            
            // Create bullet
            const bulletSpeed = 8;
            const bullet = {
                x: this.x + Math.cos(angle) * this.size,
                y: this.y + Math.sin(angle) * this.size,
                angle: angle,
                speed: bulletSpeed,
                damage: this.damage,
                life: 2000, // 2 seconds
                owner: this.type
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
            return true; // Tank destroyed
        }
        return false;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        if (this.health > 0) {
            this.isAlive = true;
        }
    }

    draw(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Hit flash effect
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.7;
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'red';
        }
        
        // Tank body
        const bodyColor = this.type === 'main' ? '#4a9eff' : '#44aa44';
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-this.size, -this.size * 0.6, this.size * 2, this.size * 1.2);
        
        // Tank tracks
        ctx.fillStyle = '#333333';
        ctx.fillRect(-this.size, -this.size * 0.8, this.size * 2, this.size * 0.3);
        ctx.fillRect(-this.size, this.size * 0.5, this.size * 2, this.size * 0.3);
        
        // Tank turret
        ctx.fillStyle = this.type === 'main' ? '#6bb6ff' : '#66cc66';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Tank cannon
        ctx.fillStyle = '#555555';
        ctx.fillRect(0, -this.size * 0.15, this.size * 1.2, this.size * 0.3);
        
        // Muzzle flash
        if (this.muzzleFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 0, ${this.muzzleFlash})`;
            ctx.beginPath();
            ctx.arc(this.size * 1.2, 0, this.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Health bar (for mini tanks)
        if (this.type === 'mini' && this.health < this.maxHealth) {
            this.drawHealthBar(ctx);
        }
        
        // Draw bullets
        this.drawBullets(ctx);
    }

    drawHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 4;
        const barY = this.y - this.size - 10;
        
        // Background
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
    }

    drawBullets(ctx) {
        for (const bullet of this.bullets) {
            ctx.save();
            ctx.translate(bullet.x, bullet.y);
            ctx.rotate(bullet.angle);
            
            // Bullet trail
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.lineTo(0, 0);
            ctx.stroke();
            
            // Bullet head
            ctx.fillStyle = '#ffff44';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
}

class Player {
    constructor(x, y) {
        this.mainTank = new Tank(x, y, 'main');
        this.miniTanks = [];
        
        // Create 5 mini tanks in formation around main tank
        const positions = [
            { x: -60, y: -60 }, // Top-left
            { x: 60, y: -60 },  // Top-right
            { x: -60, y: 60 },  // Bottom-left
            { x: 60, y: 60 },   // Bottom-right
            { x: 0, y: -80 }    // Top-center
        ];
        
        for (const pos of positions) {
            const miniTank = new Tank(x + pos.x, y + pos.y, 'mini');
            this.miniTanks.push(miniTank);
        }
        
        // Movement
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;
        
        // Auto-shoot for mini tanks
        this.autoShootTimer = 0;
        this.autoShootInterval = 800; // milliseconds
        
        // Stats
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = 100;
        this.coins = 0;
        this.score = 0;
        
        // Load saved progress
        this.loadProgress();
    }

    update(deltaTime, enemies = []) {
        // Update main tank
        this.mainTank.update(deltaTime);
        
        // Update mini tanks
        for (const miniTank of this.miniTanks) {
            miniTank.update(deltaTime);
        }
        
        // Move towards target position
        this.updateMovement(deltaTime);
        
        // Auto-shoot mini tanks at nearest enemies
        this.updateAutoShoot(deltaTime, enemies);
    }

    updateMovement(deltaTime) {
        const mainTank = this.mainTank;
        const distance = Utils.distance(mainTank.x, mainTank.y, this.targetX, this.targetY);
        
        if (distance > 5) {
            this.isMoving = true;
            const angle = Utils.angle(mainTank.x, mainTank.y, this.targetX, this.targetY);
            const moveX = Math.cos(angle) * mainTank.speed;
            const moveY = Math.sin(angle) * mainTank.speed;
            
            // Move main tank
            mainTank.x += moveX;
            mainTank.y += moveY;
            
            // Move mini tanks in formation
            const positions = [
                { x: -60, y: -60 }, // Top-left
                { x: 60, y: -60 },  // Top-right
                { x: -60, y: 60 },  // Bottom-left
                { x: 60, y: 60 },   // Bottom-right
                { x: 0, y: -80 }    // Top-center
            ];
            
            for (let i = 0; i < this.miniTanks.length; i++) {
                const miniTank = this.miniTanks[i];
                const targetPos = positions[i];
                const targetX = mainTank.x + targetPos.x;
                const targetY = mainTank.y + targetPos.y;
                
                // Smooth follow movement
                miniTank.x = Utils.lerp(miniTank.x, targetX, 0.1);
                miniTank.y = Utils.lerp(miniTank.y, targetY, 0.1);
            }
        } else {
            this.isMoving = false;
        }
    }

    updateAutoShoot(deltaTime, enemies) {
        this.autoShootTimer += deltaTime;
        
        if (this.autoShootTimer >= this.autoShootInterval) {
            this.autoShootTimer = 0;
            
            // Each mini tank shoots at nearest enemy
            for (const miniTank of this.miniTanks) {
                if (!miniTank.isAlive) continue;
                
                let nearestEnemy = null;
                let nearestDistance = Infinity;
                
                for (const enemy of enemies) {
                    if (!enemy.isAlive) continue;
                    
                    const distance = Utils.distance(miniTank.x, miniTank.y, enemy.x, enemy.y);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestEnemy = enemy;
                    }
                }
                
                if (nearestEnemy) {
                    miniTank.shoot(nearestEnemy.x, nearestEnemy.y);
                }
            }
        }
    }

    manualShoot(targetX, targetY) {
        this.mainTank.shoot(targetX, targetY);
    }

    setMoveTarget(x, y) {
        this.targetX = Utils.clamp(x, 50, 750);
        this.targetY = Utils.clamp(y, 50, 550);
    }

    getAllBullets() {
        let bullets = [...this.mainTank.bullets];
        for (const miniTank of this.miniTanks) {
            bullets = bullets.concat(miniTank.bullets);
        }
        return bullets;
    }

    takeDamage(damage) {
        // Distribute damage to alive tanks
        const aliveTanks = [this.mainTank, ...this.miniTanks].filter(tank => tank.isAlive);
        if (aliveTanks.length === 0) return true; // Player defeated
        
        // Damage random alive tank
        const targetTank = Utils.randomChoice(aliveTanks);
        const destroyed = targetTank.takeDamage(damage);
        
        // Check if all tanks are destroyed
        const allDestroyed = [this.mainTank, ...this.miniTanks].every(tank => !tank.isAlive);
        return allDestroyed;
    }

    getHealthPercent() {
        const totalHealth = this.mainTank.health + this.miniTanks.reduce((sum, tank) => sum + tank.health, 0);
        const totalMaxHealth = this.mainTank.maxHealth + this.miniTanks.reduce((sum, tank) => sum + tank.maxHealth, 0);
        return totalHealth / totalMaxHealth;
    }

    getTotalHealth() {
        return this.mainTank.health + this.miniTanks.reduce((sum, tank) => sum + tank.health, 0);
    }

    getTotalMaxHealth() {
        return this.mainTank.maxHealth + this.miniTanks.reduce((sum, tank) => sum + tank.maxHealth, 0);
    }

    addExperience(amount) {
        this.experience += amount;
        while (this.experience >= this.experienceToNext) {
            this.experience -= this.experienceToNext;
            this.level++;
            this.experienceToNext = Math.floor(this.experienceToNext * 1.2);
            
            // Level up rewards
            this.coins += this.level * 10;
            
            // Heal all tanks on level up
            this.mainTank.heal(this.mainTank.maxHealth * 0.5);
            for (const miniTank of this.miniTanks) {
                miniTank.heal(miniTank.maxHealth * 0.5);
            }
        }
    }

    addScore(amount) {
        this.score += amount;
    }

    addCoins(amount) {
        this.coins += amount;
    }

    draw(ctx) {
        // Draw main tank
        this.mainTank.draw(ctx);
        
        // Draw mini tanks
        for (const miniTank of this.miniTanks) {
            miniTank.draw(ctx);
        }
        
        // Draw formation lines (debug)
        if (false) { // Set to true for debug
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            for (const miniTank of this.miniTanks) {
                ctx.beginPath();
                ctx.moveTo(this.mainTank.x, this.mainTank.y);
                ctx.lineTo(miniTank.x, miniTank.y);
                ctx.stroke();
            }
        }
    }

    // Upgrade system
    upgradeMainTank(stat, cost) {
        if (this.coins < cost) return false;
        
        this.coins -= cost;
        
        switch (stat) {
            case 'health':
                this.mainTank.maxHealth += 20;
                this.mainTank.heal(20);
                break;
            case 'damage':
                this.mainTank.damage += 5;
                break;
            case 'speed':
                this.mainTank.speed += 0.5;
                break;
        }
        
        this.saveProgress();
        return true;
    }

    upgradeMiniTanks(stat, cost) {
        if (this.coins < cost) return false;
        
        this.coins -= cost;
        
        for (const miniTank of this.miniTanks) {
            switch (stat) {
                case 'health':
                    miniTank.maxHealth += 10;
                    miniTank.heal(10);
                    break;
                case 'damage':
                    miniTank.damage += 2;
                    break;
                case 'speed':
                    miniTank.speed += 0.2;
                    break;
            }
        }
        
        this.saveProgress();
        return true;
    }

    // Save/Load progress
    saveProgress() {
        const data = {
            level: this.level,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            coins: this.coins,
            score: this.score,
            mainTankStats: {
                maxHealth: this.mainTank.maxHealth,
                damage: this.mainTank.damage,
                speed: this.mainTank.speed
            },
            miniTankStats: {
                maxHealth: this.miniTanks[0]?.maxHealth || 50,
                damage: this.miniTanks[0]?.damage || 5,
                speed: this.miniTanks[0]?.speed || 2.5
            }
        };
        
        Utils.saveGame('tankAdventure_progress', data);
    }

    loadProgress() {
        const data = Utils.loadGame('tankAdventure_progress');
        if (!data) return;
        
        this.level = data.level || 1;
        this.experience = data.experience || 0;
        this.experienceToNext = data.experienceToNext || 100;
        this.coins = data.coins || 0;
        this.score = data.score || 0;
        
        // Apply saved stats
        if (data.mainTankStats) {
            this.mainTank.maxHealth = data.mainTankStats.maxHealth;
            this.mainTank.health = this.mainTank.maxHealth;
            this.mainTank.damage = data.mainTankStats.damage;
            this.mainTank.speed = data.mainTankStats.speed;
        }
        
        if (data.miniTankStats) {
            for (const miniTank of this.miniTanks) {
                miniTank.maxHealth = data.miniTankStats.maxHealth;
                miniTank.health = miniTank.maxHealth;
                miniTank.damage = data.miniTankStats.damage;
                miniTank.speed = data.miniTankStats.speed;
            }
        }
    }
}

// Export for global access
window.Tank = Tank;
window.Player = Player;