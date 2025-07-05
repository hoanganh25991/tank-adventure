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
            this.maxHealth = 300;
            this.health = 300;
            this.damage = 20; // Increased from 10 to 20 for stronger bullets
            this.speed = 8; // Increased from 3 to 8 for faster movement
            this.size = 25;
            this.shootCooldown = 0;
            this.maxShootCooldown = 250; // Reduced from 300 to 250 for faster firing
        } else {
            this.maxHealth = 100;
            this.health = 100;
            this.damage = 5;
            this.speed = 6; // Increased from 2.5 to 6 for faster movement
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
        
        // Smooth angle rotation (faster rotation for responsive movement)
        const angleDiff = this.targetAngle - this.angle;
        const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        this.angle += normalizedAngleDiff * 0.3; // Increased from 0.1 to 0.3 for faster rotation
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
            bullet.life -= deltaTime;
            
            // Remove expired bullets (no bounds checking for endless world)
            if (bullet.life <= 0) {
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
            
            // Create bullet with different properties for main vs mini tanks
            const bulletSpeed = this.type === 'main' ? 10 : 8; // Main tank has faster bullets
            const bulletSize = this.type === 'main' ? 6 : 3; // Main tank has bigger bullets
            const bulletLife = this.type === 'main' ? 1500 : 1000; // Main tank bullets travel further
            
            const bullet = {
                x: this.x + Math.cos(angle) * this.size,
                y: this.y + Math.sin(angle) * this.size,
                angle: angle,
                speed: bulletSpeed,
                damage: this.damage,
                life: bulletLife,
                owner: this.type,
                size: bulletSize,
                // Enhanced properties for main tank bullets
                isMainTankBullet: this.type === 'main',
                penetration: this.type === 'main' ? 2 : 1, // Main tank bullets can hit multiple enemies
                explosionRadius: this.type === 'main' ? 20 : 0 // Main tank bullets have small explosion
            };
            
            this.bullets.push(bullet);
            this.shootCooldown = this.maxShootCooldown;
            this.muzzleFlash = 1.0;
            
            // Play enhanced shooting sound effect
            if (window.gameInstance && window.gameInstance.soundManager) {
                const soundId = this.type === 'main' ? 'main_tank_shoot' : 'mini_tank_shoot';
                window.gameInstance.soundManager.play(soundId);
            }
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

    draw(ctx, gameEngine = null) {
        if (!this.isAlive) return;
        
        // Use enhanced rendering if game engine is provided
        if (gameEngine && gameEngine.renderTank) {
            const color = this.type === 'main' ? '#daa520' : '#8fbc8f'; // Main tank: goldenrod, Mini tanks: sea green
            gameEngine.renderTank(this, color);
        } else {
            // Fallback to original rendering
            this.drawOriginal(ctx);
        }
        
        // Health bar (for all tanks)
        this.drawHealthBar(ctx);
        
        // Draw bullets
        this.drawBullets(ctx);
    }

    drawOriginal(ctx) {
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
        const bodyColor = this.type === 'main' ? '#daa520' : '#8fbc8f'; // Main tank: goldenrod, Mini tanks: sea green
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-this.size, -this.size * 0.6, this.size * 2, this.size * 1.2);
        
        // Tank tracks
        ctx.fillStyle = '#8b4513'; // Rich brown tracks
        ctx.fillRect(-this.size, -this.size * 0.8, this.size * 2, this.size * 0.3);
        ctx.fillRect(-this.size, this.size * 0.5, this.size * 2, this.size * 0.3);
        
        // Tank turret
        ctx.fillStyle = this.type === 'main' ? '#ffd700' : '#98fb98'; // Main tank: gold, Mini tanks: light green
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Tank cannon
        ctx.fillStyle = '#cd853f'; // Warm bronze cannon
        ctx.fillRect(0, -this.size * 0.15, this.size * 1.2, this.size * 0.3);
        
        // Enhanced muzzle flash for main tank
        if (this.muzzleFlash > 0) {
            if (this.type === 'main') {
                // Enhanced main tank muzzle flash
                // Outer glow
                ctx.fillStyle = `rgba(255, 215, 0, ${this.muzzleFlash * 0.3})`; // Golden glow
                ctx.beginPath();
                ctx.arc(this.size * 1.2, 0, this.size * 0.6, 0, Math.PI * 2);
                ctx.fill();
                
                // Main flash
                ctx.fillStyle = `rgba(255, 140, 0, ${this.muzzleFlash})`; // Orange flame
                ctx.beginPath();
                ctx.arc(this.size * 1.2, 0, this.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
                
                // Hot center
                ctx.fillStyle = `rgba(255, 255, 255, ${this.muzzleFlash * 0.8})`; // White hot center
                ctx.beginPath();
                ctx.arc(this.size * 1.2, 0, this.size * 0.2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Standard mini tank muzzle flash
                ctx.fillStyle = `rgba(255, 140, 0, ${this.muzzleFlash})`; // Orange flame color
                ctx.beginPath();
                ctx.arc(this.size * 1.2, 0, this.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }

    drawHealthBar(ctx) {
        // Different health bar styles for main and mini tanks
        const barWidth = this.type === 'main' ? this.size * 2.5 : this.size * 2;
        const barHeight = this.type === 'main' ? 6 : 4;
        const barY = this.y - this.size - (this.type === 'main' ? 15 : 10);
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
        
        // Health background (red)
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
        
        // Health foreground (Ghibli theme)
        const healthPercent = this.health / this.maxHealth;
        if (this.type === 'main') {
            // Main tank health bar - warm Ghibli green
            ctx.fillStyle = 'rgba(154, 205, 50, 0.9)'; // Yellow-green
        } else {
            // Mini tank health bar - lighter Ghibli green
            ctx.fillStyle = 'rgba(143, 188, 143, 0.9)'; // Dark sea green
        }
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        
        // Health bar border
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)'; // Rich brown border
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth / 2, barY, barWidth, barHeight);
        
        // Show level for main tank
        if (this.type === 'main' && window.gameEngine && window.gameEngine.player) {
            const level = window.gameEngine.player.level;
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`Lv.${level}`, this.x, barY - 2);
            
            // Add a small badge/background for the level
            const textWidth = ctx.measureText(`Lv.${level}`).width;
            const badgeWidth = textWidth + 8;
            const badgeHeight = 14;
            const badgeY = barY - 16;
            
            // Badge background
            ctx.fillStyle = 'rgba(139, 69, 19, 0.8)'; // Rich brown background
            ctx.fillRect(this.x - badgeWidth / 2, badgeY, badgeWidth, badgeHeight);
            
            // Badge border
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)'; // Gold border
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x - badgeWidth / 2, badgeY, badgeWidth, badgeHeight);
            
            // Level text (redraw on top)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText(`Lv.${level}`, this.x, barY - 2);
        }
    }

    drawBullets(ctx) {
        for (const bullet of this.bullets) {
            ctx.save();
            ctx.translate(bullet.x, bullet.y);
            ctx.rotate(bullet.angle);
            
            if (bullet.isMainTankBullet) {
                // Enhanced main tank bullet rendering
                
                // Bullet trail (longer and brighter)
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)'; // Golden trail
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(-15, 0);
                ctx.lineTo(0, 0);
                ctx.stroke();
                
                // Secondary trail glow
                ctx.strokeStyle = 'rgba(255, 140, 0, 0.4)'; // Orange glow
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(-12, 0);
                ctx.lineTo(0, 0);
                ctx.stroke();
                
                // Main bullet body (larger)
                ctx.fillStyle = '#ffd700'; // Gold bullet
                ctx.beginPath();
                ctx.arc(0, 0, bullet.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Bullet core (darker center)
                ctx.fillStyle = '#daa520'; // Goldenrod core
                ctx.beginPath();
                ctx.arc(0, 0, bullet.size * 0.6, 0, Math.PI * 2);
                ctx.fill();
                
                // Bullet highlight
                ctx.fillStyle = '#ffff99'; // Light yellow highlight
                ctx.beginPath();
                ctx.arc(-bullet.size * 0.3, -bullet.size * 0.3, bullet.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
                
                // Energy aura around bullet
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, bullet.size * 1.5, 0, Math.PI * 2);
                ctx.stroke();
                
            } else {
                // Standard mini tank bullet rendering
                
                // Bullet trail
                ctx.strokeStyle = 'rgba(255, 140, 0, 0.5)'; // Orange trail
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-8, 0);
                ctx.lineTo(0, 0);
                ctx.stroke();
                
                // Bullet head
                ctx.fillStyle = '#cd7f32'; // Bronze/copper bullet
                ctx.beginPath();
                ctx.arc(0, 0, bullet.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
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
        
        // Direction-based movement
        this.moveDirectionX = 0;
        this.moveDirectionY = 0;
        this.moveIntensity = 0;
        
        // Auto-shoot for mini tanks
        this.autoShootTimer = 0;
        this.autoShootInterval = 800; // milliseconds
        
        // Auto-aim system (for manual shooting)
        this.autoAimEnabled = true;
        
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
        
        // Check if we're moving based on joystick input
        if (this.moveIntensity > 0.1) {
            this.isMoving = true;
            
            // Calculate movement velocity (no acceleration, immediate movement)
            const deltaTimeSeconds = deltaTime / 1000; // Convert to seconds
            const velocityX = this.moveDirectionX * this.moveIntensity * mainTank.speed;
            const velocityY = this.moveDirectionY * this.moveIntensity * mainTank.speed;
            
            // Apply movement immediately with speed multiplier
            const speedMultiplier = this.speedMultiplier || 1.0;
            mainTank.x += velocityX * deltaTimeSeconds * 60 * speedMultiplier; // Apply speed multiplier
            mainTank.y += velocityY * deltaTimeSeconds * 60 * speedMultiplier;
            
            // Rotate main tank to face movement direction
            if (Math.abs(this.moveDirectionX) > 0.1 || Math.abs(this.moveDirectionY) > 0.1) {
                const movementAngle = Math.atan2(this.moveDirectionY, this.moveDirectionX);
                mainTank.targetAngle = movementAngle;
            }
            
            // Update target position for reference
            this.targetX = mainTank.x;
            this.targetY = mainTank.y;
            
            // Move mini tanks in formation
            this.updateMiniTankFormation();
        } else {
            this.isMoving = false;
        }
    }
    
    generateFormationPositions(count) {
        // Generate formation positions dynamically based on number of mini tanks
        const positions = [];
        
        if (count <= 5) {
            // Use the original fixed positions for the first 5 tanks
            const fixedPositions = [
                { x: -60, y: -60 }, // Top-left
                { x: 60, y: -60 },  // Top-right  
                { x: -60, y: 60 },  // Bottom-left
                { x: 60, y: 60 },   // Bottom-right
                { x: 0, y: -80 }    // Top-center
            ];
            return fixedPositions.slice(0, count);
        } else {
            // For more than 5 tanks, use a circular formation
            const baseRadius = 70;
            const radiusIncrement = 25;
            
            for (let i = 0; i < count; i++) {
                const layer = Math.floor(i / 8); // 8 tanks per layer
                const positionInLayer = i % 8;
                const radius = baseRadius + (layer * radiusIncrement);
                const angle = (positionInLayer * Math.PI * 2) / 8;
                
                positions.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius
                });
            }
            return positions;
        }
    }

    updateMiniTankFormation() {
        const mainTank = this.mainTank;
        
        // Generate formation positions dynamically based on number of mini tanks
        const basePositions = this.generateFormationPositions(this.miniTanks.length);
        
        // Only calculate movement direction if we're actually moving
        if (this.moveIntensity > 0.1) {
            // Get the movement direction vector
            const movementVector = {
                x: this.moveDirectionX,
                y: this.moveDirectionY
            };
            
            // Calculate the dot product between movement vector and tank's facing direction
            // This tells us if we're moving forward (positive) or backward (negative)
            const tankDirectionVector = {
                x: Math.cos(mainTank.targetAngle),
                y: Math.sin(mainTank.targetAngle)
            };
            
            // Dot product to determine forward/backward movement
            const dotProduct = movementVector.x * tankDirectionVector.x + 
                              movementVector.y * tankDirectionVector.y;
            
            // Process each mini tank
            for (let i = 0; i < this.miniTanks.length; i++) {
                const miniTank = this.miniTanks[i];
                
                // Safety check for base position
                if (!basePositions[i]) {
                    console.warn(`Missing base position for mini tank ${i}/${this.miniTanks.length}`);
                    continue;
                }
                
                // Calculate target position based on movement direction
                let targetPos;
                
                if (dotProduct >= 0) {
                    // Moving forward or sideways - use standard formation
                    targetPos = this.calculateFormationPosition(basePositions[i], mainTank);
                } else {
                    // Moving backward - adjust formation to be behind the tank
                    // Flip the y coordinate for a more natural backward formation
                    const adjustedPos = {
                        x: basePositions[i].x,
                        y: -basePositions[i].y
                    };
                    targetPos = this.calculateFormationPosition(adjustedPos, mainTank);
                }
                
                // Apply smooth movement with variable lerp factor
                // Use a faster lerp factor for quick direction changes
                // Calculate distance to target position to adjust lerp factor
                const distToTarget = Utils.distance(miniTank.x, miniTank.y, targetPos.x, targetPos.y);
                
                // Adjust lerp factor based on distance - faster when far away, smoother when close
                const baseLerpFactor = 0.15;
                const distanceBoost = Math.min(distToTarget / 100, 0.5); // Cap the boost
                const lerpFactor = baseLerpFactor + distanceBoost;
                
                miniTank.x = Utils.lerp(miniTank.x, targetPos.x, lerpFactor);
                miniTank.y = Utils.lerp(miniTank.y, targetPos.y, lerpFactor);
                
                // Sync rotation with main tank
                miniTank.targetAngle = mainTank.targetAngle;
            }
        } else {
            // When not moving, maintain standard formation
            for (let i = 0; i < this.miniTanks.length; i++) {
                const miniTank = this.miniTanks[i];
                
                // Safety check for base position
                if (!basePositions[i]) {
                    console.warn(`Missing base position for mini tank ${i}/${this.miniTanks.length}`);
                    continue;
                }
                
                const targetPos = this.calculateFormationPosition(basePositions[i], mainTank);
                
                // Apply smooth movement with distance-based adjustment
                const distToTarget = Utils.distance(miniTank.x, miniTank.y, targetPos.x, targetPos.y);
                const baseLerpFactor = 0.1;
                const distanceBoost = Math.min(distToTarget / 150, 0.3); // Gentler boost when not moving
                const lerpFactor = baseLerpFactor + distanceBoost;
                
                miniTank.x = Utils.lerp(miniTank.x, targetPos.x, lerpFactor);
                miniTank.y = Utils.lerp(miniTank.y, targetPos.y, lerpFactor);
                
                // Sync rotation with main tank
                miniTank.targetAngle = mainTank.targetAngle;
            }
        }
    }
    
    // Helper method to calculate the final position of a mini tank in formation
    calculateFormationPosition(basePos, mainTank) {
        // Rotate the position based on main tank's angle
        const rotatedPos = this.rotateFormationPosition(basePos, mainTank.targetAngle);
        
        // Return the world position
        return {
            x: mainTank.x + rotatedPos.x,
            y: mainTank.y + rotatedPos.y
        };
    }
    
    rotateFormationPosition(position, angle) {
        // Defensive check for undefined position
        if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
            console.warn('Invalid position passed to rotateFormationPosition:', position);
            return { x: 0, y: 0 };
        }
        
        // Rotate formation position around main tank based on main tank's direction
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        return {
            x: position.x * cos - position.y * sin,
            y: position.x * sin + position.y * cos
        };
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

    findNearestEnemy(enemies) {
        if (!enemies || enemies.length === 0) return null;
        
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        for (const enemy of enemies) {
            if (!enemy.isAlive) continue;
            
            const distance = Utils.distance(this.mainTank.x, this.mainTank.y, enemy.x, enemy.y);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        // Mark the nearest enemy as targeted for visual feedback
        if (nearestEnemy) {
            // Clear previous target markers
            for (const enemy of enemies) {
                enemy.isTargeted = false;
            }
            nearestEnemy.isTargeted = true;
        }
        
        return nearestEnemy;
    }

    manualShoot(targetX = null, targetY = null, enemies = []) {
        if (!this.mainTank.isAlive) return;
        
        // If auto-aim is enabled and we have enemies, aim at nearest enemy
        if (this.autoAimEnabled && enemies.length > 0) {
            const nearestEnemy = this.findNearestEnemy(enemies);
            if (nearestEnemy) {
                this.mainTank.shoot(nearestEnemy.x, nearestEnemy.y);
                return;
            }
        }
        
        // Fallback to manual target or current facing direction
        this.mainTank.shoot(targetX, targetY);
    }

    setMoveTarget(x, y) {
        // Allow endless movement - no boundaries
        this.targetX = x;
        this.targetY = y;
    }
    
    setMovementDirection(directionX, directionY, intensity, speedMultiplier = 1.0) {
        this.moveDirectionX = directionX;
        this.moveDirectionY = directionY;
        this.moveIntensity = intensity;
        this.speedMultiplier = speedMultiplier;
        this.isMoving = intensity > 0.1; // Only consider moving if intensity is above threshold
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

    draw(ctx, gameEngine = null) {
        // Draw main tank
        this.mainTank.draw(ctx, gameEngine);
        
        // Draw mini tanks
        for (const miniTank of this.miniTanks) {
            miniTank.draw(ctx, gameEngine);
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