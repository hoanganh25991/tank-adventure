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
        
        // Special abilities and status effects
        this.abilities = [];
        this.shield = 0; // Shield points that absorb damage
        this.maxShield = 0;
        this.shieldRegenRate = 0;
        this.shieldRegenDelay = 0;
        this.lastDamageTime = 0;
        this.specialCooldown = 0;
        this.maxSpecialCooldown = 0;
        this.statusEffects = new Map(); // Store temporary effects
        this.damageResistance = 0; // Percentage damage reduction
        this.criticalChance = 0; // Chance for critical hits
        this.multiShotCount = 1; // Number of bullets per shot
        this.homingBullets = false; // Whether bullets home in on target
    }

    setStatsForType(type) {
        // Get current wave from WaveManager for scaling
        const wave = window.gameEngine && window.gameEngine.waveManager ? 
                    window.gameEngine.waveManager.currentWave : 1;
        
        // Get player level for additional scaling
        const playerLevel = window.gameEngine && window.gameEngine.player ? 
                    window.gameEngine.player.level : 1;
        
        // Enhanced progressive scaling factors based on both wave and player level
        // Wave scaling - increases difficulty within a battle
        const waveHealthScaling = 1 + (wave - 1) * 0.25; // 25% health increase per wave
        const waveDamageScaling = 1 + (wave - 1) * 0.20; // 20% damage increase per wave
        const waveSpeedScaling = 1 + (wave - 1) * 0.10; // 10% speed increase per wave
        const waveValueScaling = 1 + (wave - 1) * 0.15; // 15% value increase per wave
        const waveShieldScaling = 1 + (wave - 1) * 0.30; // 30% shield increase per wave
        
        // Level scaling - increases base difficulty as player progresses
        const levelHealthScaling = 1 + (playerLevel - 1) * 0.15; // 15% health increase per level
        const levelDamageScaling = 1 + (playerLevel - 1) * 0.12; // 12% damage increase per level
        const levelSpeedScaling = 1 + (playerLevel - 1) * 0.05; // 5% speed increase per level
        const levelValueScaling = 1 + (playerLevel - 1) * 0.10; // 10% value increase per level
        const levelShieldScaling = 1 + (playerLevel - 1) * 0.20; // 20% shield increase per level
        
        // Combined scaling factors
        const healthScaling = waveHealthScaling * levelHealthScaling;
        const damageScaling = waveDamageScaling * levelDamageScaling;
        const speedScaling = waveSpeedScaling * levelSpeedScaling;
        const valueScaling = waveValueScaling * levelValueScaling;
        const shieldScaling = waveShieldScaling * levelShieldScaling;
        
        // Visual scaling based on wave and player level
        // This will make enemies look more intimidating as they get stronger
        this.visualTier = Math.min(Math.floor((wave + playerLevel) / 5), 3); // 0-3 visual tiers
        
        switch (type) {
            case 'basic': // Armored Infantry Tank
                this.maxHealth = Math.floor(120 * healthScaling); // 4x stronger
                this.health = this.maxHealth;
                this.damage = Math.floor(25 * damageScaling); // 3x stronger
                this.speed = Math.min(1.8 * speedScaling, 3.2);
                this.size = 22;
                this.shootCooldown = 0;
                this.maxShootCooldown = Math.max(800 - wave * 15, 400);
                this.range = 130;
                this.color = '#ff4444'; // Deep red
                this.secondaryColor = '#aa2222'; // Darker red
                this.value = Math.floor(15 * valueScaling);
                this.damageResistance = 0.1; // 10% damage reduction
                this.abilities = ['basic_armor'];
                break;
                
            case 'heavy': // Siege Tank
                this.maxHealth = Math.floor(300 * healthScaling); // 4x stronger
                this.health = this.maxHealth;
                this.damage = Math.floor(45 * damageScaling); // 3x stronger
                this.speed = Math.min(1.0 * speedScaling, 2.0);
                this.size = 35;
                this.shootCooldown = 0;
                this.maxShootCooldown = Math.max(1200 - wave * 25, 600);
                this.range = 160;
                this.color = '#8B4513'; // Brown/bronze
                this.secondaryColor = '#654321';
                this.value = Math.floor(40 * valueScaling);
                this.maxShield = Math.floor(100 * shieldScaling);
                this.shield = this.maxShield;
                this.shieldRegenRate = 5; // Shield regenerates
                this.shieldRegenDelay = 3000; // 3 seconds after taking damage
                this.damageResistance = 0.25; // 25% damage reduction
                this.abilities = ['heavy_armor', 'explosive_shells'];
                this.multiShotCount = 2; // Fires 2 bullets
                break;
                
            case 'fast': // Assault Raider
                this.maxHealth = Math.floor(80 * healthScaling); // 4x stronger
                this.health = this.maxHealth;
                this.damage = Math.floor(20 * damageScaling); // 3x stronger
                this.speed = Math.min(4.5 * speedScaling, 6.5);
                this.size = 18;
                this.shootCooldown = 0;
                this.maxShootCooldown = Math.max(400 - wave * 10, 200);
                this.range = 110;
                this.color = '#FF6600'; // Orange
                this.secondaryColor = '#CC4400';
                this.value = Math.floor(25 * valueScaling);
                this.criticalChance = 0.2; // 20% critical hit chance
                this.abilities = ['speed_boost', 'critical_strikes'];
                break;
                
            case 'sniper': // Precision Marksman
                this.maxHealth = Math.floor(150 * healthScaling); // 6x stronger
                this.health = this.maxHealth;
                this.damage = Math.floor(80 * damageScaling); // 4x stronger
                this.speed = Math.min(1.2 * speedScaling, 2.5);
                this.size = 20;
                this.shootCooldown = 0;
                this.maxShootCooldown = Math.max(1800 - wave * 30, 900);
                this.range = 250;
                this.color = '#9966FF'; // Purple
                this.secondaryColor = '#6633CC';
                this.value = Math.floor(35 * valueScaling);
                this.damageResistance = 0.15;
                this.abilities = ['precision_targeting', 'armor_piercing'];
                this.homingBullets = true; // Bullets track targets
                break;
                
            case 'elite': // Elite Guardian (New Type)
                this.maxHealth = Math.floor(250 * healthScaling);
                this.health = this.maxHealth;
                this.damage = Math.floor(35 * damageScaling);
                this.speed = Math.min(2.2 * speedScaling, 3.5);
                this.size = 28;
                this.shootCooldown = 0;
                this.maxShootCooldown = Math.max(1000 - wave * 20, 500);
                this.range = 180;
                this.color = '#00FFFF'; // Cyan
                this.secondaryColor = '#0099CC';
                this.value = Math.floor(50 * valueScaling);
                this.maxShield = Math.floor(150 * shieldScaling);
                this.shield = this.maxShield;
                this.shieldRegenRate = 8;
                this.shieldRegenDelay = 2500;
                this.damageResistance = 0.2;
                this.criticalChance = 0.15;
                this.abilities = ['energy_shield', 'plasma_burst', 'tactical_retreat'];
                this.maxSpecialCooldown = 5000;
                break;
                
            case 'berserker': // Berserker Destroyer (New Type)
                this.maxHealth = Math.floor(180 * healthScaling);
                this.health = this.maxHealth;
                this.damage = Math.floor(30 * damageScaling);
                this.speed = Math.min(3.8 * speedScaling, 5.5);
                this.size = 24;
                this.shootCooldown = 0;
                this.maxShootCooldown = Math.max(600 - wave * 15, 300);
                this.range = 120;
                this.color = '#FF0066'; // Hot pink/red
                this.secondaryColor = '#CC0044';
                this.value = Math.floor(45 * valueScaling);
                this.criticalChance = 0.3;
                this.abilities = ['berserker_rage', 'ramming_attack', 'blood_frenzy'];
                this.multiShotCount = 3;
                this.maxSpecialCooldown = 4000;
                break;
                
            case 'support': // Support Commander (New Type)
                this.maxHealth = Math.floor(200 * healthScaling);
                this.health = this.maxHealth;
                this.damage = Math.floor(20 * damageScaling);
                this.speed = Math.min(1.5 * speedScaling, 2.8);
                this.size = 26;
                this.shootCooldown = 0;
                this.maxShootCooldown = Math.max(1400 - wave * 25, 700);
                this.range = 200;
                this.color = '#00FF00'; // Green
                this.secondaryColor = '#00AA00';
                this.value = Math.floor(60 * valueScaling);
                this.maxShield = Math.floor(80 * shieldScaling);
                this.shield = this.maxShield;
                this.shieldRegenRate = 12;
                this.shieldRegenDelay = 2000;
                this.abilities = ['heal_allies', 'damage_boost', 'shield_generator'];
                this.maxSpecialCooldown = 6000;
                break;
                
            case 'boss': // Dreadnought Commander
                this.maxHealth = Math.floor(800 * healthScaling); // 4x stronger
                this.health = this.maxHealth;
                this.damage = Math.floor(60 * damageScaling); // 2.4x stronger
                this.speed = Math.min(1.8 * speedScaling, 3.2);
                this.size = 50;
                this.shootCooldown = 0;
                this.maxShootCooldown = Math.max(600 - wave * 15, 300);
                this.range = 200;
                this.color = '#FF1493'; // Deep pink/magenta
                this.secondaryColor = '#CC0066';
                this.value = Math.floor(200 * valueScaling);
                this.maxShield = Math.floor(300 * shieldScaling);
                this.shield = this.maxShield;
                this.shieldRegenRate = 15;
                this.shieldRegenDelay = 1500;
                this.damageResistance = 0.35; // 35% damage reduction
                this.criticalChance = 0.25;
                this.multiShotCount = 4;
                this.homingBullets = true;
                this.abilities = ['boss_barrage', 'summon_minions', 'defensive_matrix', 'devastating_beam'];
                this.maxSpecialCooldown = 3000;
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
        if (this.specialCooldown > 0) {
            this.specialCooldown -= deltaTime;
        }
        
        // Shield regeneration
        if (this.maxShield > 0 && this.shield < this.maxShield) {
            if (Date.now() - this.lastDamageTime > this.shieldRegenDelay) {
                this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * deltaTime / 1000);
            }
        }
        
        // Update status effects
        for (const [effect, data] of this.statusEffects) {
            data.duration -= deltaTime;
            if (data.duration <= 0) {
                this.statusEffects.delete(effect);
            }
        }
        
        // Execute special abilities
        this.updateSpecialAbilities(deltaTime, player);
        
        // AI behavior
        this.updateAI(deltaTime, player);
        
        // Update angle smoothly
        const angleDiff = this.targetAngle - this.angle;
        const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        this.angle += normalizedAngleDiff * 0.08;
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Homing bullet logic
            if (bullet.isHoming && bullet.target && bullet.target.isAlive) {
                const targetAngle = Utils.angle(bullet.x, bullet.y, bullet.target.x, bullet.target.y);
                const turnSpeed = 0.03; // How fast bullets can turn
                const angleDiff = targetAngle - bullet.angle;
                const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                bullet.angle += normalizedAngleDiff * turnSpeed;
            }
            
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
            
            // Fire multiple bullets for multi-shot enemies
            for (let i = 0; i < this.multiShotCount; i++) {
                // Add some inaccuracy except for snipers
                let finalAngle = angle;
                if (this.type !== 'sniper') {
                    const inaccuracy = this.type === 'fast' ? 0.2 : 0.1;
                    finalAngle += (Math.random() - 0.5) * inaccuracy;
                }
                
                // Add spread for multi-shot
                if (this.multiShotCount > 1) {
                    const spread = 0.3; // radians
                    const offset = (i - (this.multiShotCount - 1) / 2) * spread / (this.multiShotCount - 1);
                    finalAngle += offset;
                }
                
                // Calculate damage (with critical hit chance)
                let bulletDamage = this.damage;
                let isCritical = false;
                if (Math.random() < this.criticalChance) {
                    bulletDamage *= 2;
                    isCritical = true;
                }
                
                const bulletSpeed = this.type === 'sniper' ? 12 : 
                                  this.type === 'fast' ? 8 : 6;
                
                const bullet = {
                    x: this.x + Math.cos(finalAngle) * this.size,
                    y: this.y + Math.sin(finalAngle) * this.size,
                    angle: finalAngle,
                    speed: bulletSpeed,
                    damage: bulletDamage,
                    life: this.type === 'sniper' ? 2000 : 1500,
                    owner: 'enemy',
                    isHoming: this.homingBullets,
                    target: this.homingBullets ? target : null,
                    isCritical: isCritical,
                    enemyType: this.type
                };
                
                this.bullets.push(bullet);
            }
            
            this.shootCooldown = this.maxShootCooldown;
            this.muzzleFlash = 1.0;
        }
    }

    takeDamage(damage) {
        if (!this.isAlive) return false;
        
        // Record damage time for shield regeneration
        this.lastDamageTime = Date.now();
        
        // Apply damage resistance
        let finalDamage = damage * (1 - this.damageResistance);
        
        // Shield absorbs damage first
        if (this.shield > 0) {
            const shieldDamage = Math.min(this.shield, finalDamage);
            this.shield -= shieldDamage;
            finalDamage -= shieldDamage;
            
            // Shield break effect
            if (this.shield <= 0) {
                this.statusEffects.set('shield_broken', { duration: 1000 });
                // Play shield break sound
                if (window.gameEngine && window.gameEngine.soundManager) {
                    window.gameEngine.soundManager.play('shield_break');
                }
            }
        }
        
        // Apply remaining damage to health
        if (finalDamage > 0) {
            this.health -= finalDamage;
            this.hitFlash = 1.0;
            
            // Trigger defensive abilities when low health
            if (this.health <= this.maxHealth * 0.3 && this.specialCooldown <= 0) {
                this.triggerDefensiveAbility();
            }
        }
        
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
            return true;
        }
        return false;
    }

    updateSpecialAbilities(deltaTime, player) {
        // Execute type-specific special abilities
        if (this.specialCooldown <= 0 && this.maxSpecialCooldown > 0) {
            switch (this.type) {
                case 'elite':
                    this.eliteSpecialAbility(player);
                    break;
                case 'berserker':
                    this.berserkerSpecialAbility(player);
                    break;
                case 'support':
                    this.supportSpecialAbility(player);
                    break;
                case 'boss':
                    this.bossSpecialAbility(player);
                    break;
            }
        }
    }

    triggerDefensiveAbility() {
        // Emergency defensive abilities when health is low
        if (this.abilities.includes('tactical_retreat')) {
            this.speed *= 1.5;
            this.statusEffects.set('tactical_retreat', { duration: 3000 });
            this.specialCooldown = this.maxSpecialCooldown;
        } else if (this.abilities.includes('defensive_matrix')) {
            this.damageResistance = Math.min(this.damageResistance + 0.3, 0.8);
            this.statusEffects.set('defensive_matrix', { duration: 5000 });
            this.specialCooldown = this.maxSpecialCooldown;
        }
    }

    eliteSpecialAbility(player) {
        const abilityChoice = Math.random();
        
        if (abilityChoice < 0.4) {
            // Plasma Burst - rapid fire
            this.statusEffects.set('plasma_burst', { duration: 3000 });
            this.maxShootCooldown *= 0.3; // 70% faster shooting
        } else if (abilityChoice < 0.8) {
            // Shield Boost
            this.shield = Math.min(this.maxShield, this.shield + this.maxShield * 0.5);
            this.shieldRegenRate *= 2;
            this.statusEffects.set('shield_boost', { duration: 4000 });
        } else {
            // Tactical Retreat with shield regeneration
            this.triggerDefensiveAbility();
        }
        
        this.specialCooldown = this.maxSpecialCooldown;
        
        // Play special ability sound
        if (window.gameEngine && window.gameEngine.soundManager) {
            window.gameEngine.soundManager.play('enemy_special_ability');
        }
    }

    berserkerSpecialAbility(player) {
        const abilityChoice = Math.random();
        
        if (abilityChoice < 0.5) {
            // Berserker Rage - increased damage and speed
            this.damage *= 1.5;
            this.speed *= 1.4;
            this.maxShootCooldown *= 0.5;
            this.statusEffects.set('berserker_rage', { duration: 5000 });
        } else {
            // Blood Frenzy - heal on kill (simplified as health boost)
            this.health = Math.min(this.maxHealth, this.health + this.maxHealth * 0.3);
            this.statusEffects.set('blood_frenzy', { duration: 3000 });
        }
        
        this.specialCooldown = this.maxSpecialCooldown;
        
        // Play special ability sound
        if (window.gameEngine && window.gameEngine.soundManager) {
            window.gameEngine.soundManager.play('enemy_special_ability');
        }
    }

    supportSpecialAbility(player) {
        // Support abilities affect nearby enemies
        const nearbyEnemies = this.getNearbyEnemies(150);
        
        const abilityChoice = Math.random();
        
        if (abilityChoice < 0.4) {
            // Heal nearby allies
            for (const enemy of nearbyEnemies) {
                enemy.health = Math.min(enemy.maxHealth, enemy.health + enemy.maxHealth * 0.2);
                enemy.statusEffects.set('healed', { duration: 500 });
            }
        } else if (abilityChoice < 0.8) {
            // Damage boost to nearby allies
            for (const enemy of nearbyEnemies) {
                enemy.damage *= 1.3;
                enemy.statusEffects.set('damage_boost', { duration: 4000 });
            }
        } else {
            // Shield generator
            for (const enemy of nearbyEnemies) {
                if (enemy.maxShield > 0) {
                    enemy.shield = Math.min(enemy.maxShield, enemy.shield + enemy.maxShield * 0.4);
                }
            }
        }
        
        this.specialCooldown = this.maxSpecialCooldown;
        
        // Play special ability sound
        if (window.gameEngine && window.gameEngine.soundManager) {
            window.gameEngine.soundManager.play('enemy_special_ability');
        }
    }

    bossSpecialAbility(player) {
        const abilityChoice = Math.random();
        
        if (abilityChoice < 0.3) {
            // Boss Barrage - rapid multi-shot
            this.multiShotCount = 8;
            this.maxShootCooldown *= 0.2;
            this.statusEffects.set('boss_barrage', { duration: 3000 });
        } else if (abilityChoice < 0.6) {
            // Defensive Matrix - massive damage reduction
            this.damageResistance = Math.min(this.damageResistance + 0.5, 0.9);
            this.statusEffects.set('defensive_matrix', { duration: 4000 });
        } else {
            // Devastating Beam - high damage homing shot
            if (player && player.mainTank && player.mainTank.isAlive) {
                const angle = Utils.angle(this.x, this.y, player.mainTank.x, player.mainTank.y);
                const bullet = {
                    x: this.x,
                    y: this.y,
                    angle: angle,
                    speed: 4, // Slower but deadly
                    damage: this.damage * 3,
                    life: 3000,
                    owner: 'enemy',
                    isHoming: true,
                    target: player.mainTank,
                    isCritical: true,
                    isDeadly: true,
                    enemyType: 'boss'
                };
                this.bullets.push(bullet);
            }
        }
        
        this.specialCooldown = this.maxSpecialCooldown;
        
        // Play special ability sound
        if (window.gameEngine && window.gameEngine.soundManager) {
            window.gameEngine.soundManager.play('enemy_special_ability');
        }
    }

    getNearbyEnemies(range) {
        if (!window.gameEngine || !window.gameEngine.waveManager) return [];
        
        const nearbyEnemies = [];
        for (const enemy of window.gameEngine.waveManager.enemies) {
            if (enemy !== this && enemy.isAlive) {
                const distance = Utils.distance(this.x, this.y, enemy.x, enemy.y);
                if (distance <= range) {
                    nearbyEnemies.push(enemy);
                }
            }
        }
        return nearbyEnemies;
    }

    drawStatusEffects(ctx) {
        // Draw various status effect glows and indicators
        if (this.statusEffects.has('berserker_rage')) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FF0066';
        } else if (this.statusEffects.has('plasma_burst')) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00FFFF';
        } else if (this.statusEffects.has('defensive_matrix')) {
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#FFD700';
        } else if (this.statusEffects.has('tactical_retreat')) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#00FF00';
        } else if (this.statusEffects.has('boss_barrage')) {
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#FF1493';
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
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'red';
        }
        
        // Status effect glows
        this.drawStatusEffects(ctx);
        
        // Apply visual tier enhancements based on wave and player level
        this.applyVisualTierEffects(ctx);
        
        // Tank body (unique shapes for different types)
        // Color is modified based on visual tier
        ctx.fillStyle = this.getEnhancedColor();
        
        switch (this.type) {
            case 'boss':
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
                break;
                
            case 'heavy':
                // Larger, more armored look
                ctx.fillRect(-this.size * 1.1, -this.size * 0.7, this.size * 2.2, this.size * 1.4);
                // Add armor plating
                ctx.fillStyle = this.secondaryColor;
                ctx.fillRect(-this.size * 0.9, -this.size * 0.5, this.size * 1.8, this.size * 0.3);
                ctx.fillRect(-this.size * 0.9, this.size * 0.2, this.size * 1.8, this.size * 0.3);
                break;
                
            case 'fast':
                // Sleeker, more angular design
                ctx.beginPath();
                ctx.moveTo(-this.size * 0.8, -this.size * 0.5);
                ctx.lineTo(this.size * 1.2, -this.size * 0.3);
                ctx.lineTo(this.size * 1.2, this.size * 0.3);
                ctx.lineTo(-this.size * 0.8, this.size * 0.5);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'sniper':
                // Longer, more streamlined
                ctx.fillRect(-this.size * 0.8, -this.size * 0.5, this.size * 1.6, this.size);
                // Add scope
                ctx.fillStyle = this.secondaryColor;
                ctx.beginPath();
                ctx.arc(this.size * 0.3, 0, this.size * 0.2, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'elite':
                // Octagonal elite design
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI * 2) / 8;
                    const x = Math.cos(angle) * this.size * 0.9;
                    const y = Math.sin(angle) * this.size * 0.7;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'berserker':
                // Spiky, aggressive design
                ctx.beginPath();
                ctx.moveTo(-this.size, 0);
                ctx.lineTo(-this.size * 0.5, -this.size * 0.8);
                ctx.lineTo(this.size * 0.5, -this.size * 0.6);
                ctx.lineTo(this.size * 1.1, 0);
                ctx.lineTo(this.size * 0.5, this.size * 0.6);
                ctx.lineTo(-this.size * 0.5, this.size * 0.8);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'support':
                // Rounded, support-oriented design
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
                ctx.fill();
                // Add support equipment
                ctx.fillStyle = this.secondaryColor;
                ctx.fillRect(-this.size * 0.4, -this.size * 0.2, this.size * 0.8, this.size * 0.4);
                break;
                
            default: // basic
                // Standard rectangular tank
                ctx.fillRect(-this.size, -this.size * 0.6, this.size * 2, this.size * 1.2);
                break;
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
        
        // Type indicator and wave scaling indicator
        if (this.type !== 'basic') {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.type.charAt(0).toUpperCase(), 0, -this.size - 10);
        }
        
        // Wave scaling indicator (show enhanced enemies)
        const currentWave = window.gameEngine && window.gameEngine.waveManager ? 
                           window.gameEngine.waveManager.currentWave : 1;
        const playerLevel = window.gameEngine && window.gameEngine.player ? 
                           window.gameEngine.player.level : 1;
                           
        // Visual tier indicators
        if (this.visualTier > 0) {
            // Base glow for all enhanced enemies
            const glowOpacity = 0.3 + (this.visualTier * 0.15);
            const glowColor = this.visualTier === 1 ? '#ffd700' : 
                             this.visualTier === 2 ? '#ff8c00' : '#ff4500';
            
            // Draw enhancement indicators based on visual tier
            ctx.fillStyle = `rgba(255, 215, 0, ${glowOpacity})`;
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = this.visualTier;
            
            // Draw aura ring
            ctx.beginPath();
            ctx.arc(0, 0, this.size + 5, 0, Math.PI * 2);
            ctx.stroke();
            
            // Additional visual elements for higher tiers
            if (this.visualTier >= 2) {
                // Second ring for tier 2+
                ctx.strokeStyle = this.visualTier === 2 ? '#ffa500' : '#ff4500';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, this.size + 8, 0, Math.PI * 2);
                ctx.stroke();
                
                // Decorative elements for tier 3
                if (this.visualTier === 3) {
                    // Pulsing spikes for highest tier
                    const spikeCount = 8;
                    const pulseScale = 1 + 0.2 * Math.sin(this.animationTimer / 200);
                    
                    ctx.strokeStyle = '#ff0000';
                    ctx.lineWidth = 2;
                    
                    for (let i = 0; i < spikeCount; i++) {
                        const angle = (i / spikeCount) * Math.PI * 2;
                        const innerRadius = this.size + 10;
                        const outerRadius = innerRadius + 8 * pulseScale;
                        
                        ctx.beginPath();
                        ctx.moveTo(
                            Math.cos(angle) * innerRadius,
                            Math.sin(angle) * innerRadius
                        );
                        ctx.lineTo(
                            Math.cos(angle) * outerRadius,
                            Math.sin(angle) * outerRadius
                        );
                        ctx.stroke();
                    }
                }
            }
        }
        
        ctx.restore();
        
        // Health and shield bars
        if (this.health < this.maxHealth || this.shield > 0) {
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
        const barWidth = this.size * 2.5;
        const barHeight = 6;
        let barY = this.y - this.size - 20;
        
        // Shield bar (if shield exists)
        if (this.maxShield > 0) {
            const shieldPercent = this.shield / this.maxShield;
            
            // Shield background
            ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
            ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
            
            // Shield
            ctx.fillStyle = shieldPercent > 0.5 ? 'rgba(0, 150, 255, 0.9)' : 
                          shieldPercent > 0.25 ? 'rgba(100, 200, 255, 0.9)' : 'rgba(150, 220, 255, 0.9)';
            ctx.fillRect(this.x - barWidth / 2, barY, barWidth * shieldPercent, barHeight);
            
            // Shield border
            ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x - barWidth / 2, barY, barWidth, barHeight);
            
            barY += barHeight + 2; // Move health bar down
        }
        
        // Health bar background
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        let healthColor;
        if (healthPercent > 0.7) {
            healthColor = 'rgba(0, 255, 0, 0.9)'; // Green
        } else if (healthPercent > 0.4) {
            healthColor = 'rgba(255, 255, 0, 0.9)'; // Yellow
        } else if (healthPercent > 0.2) {
            healthColor = 'rgba(255, 150, 0, 0.9)'; // Orange
        } else {
            healthColor = 'rgba(255, 50, 50, 0.9)'; // Red
        }
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        
        // Health bar border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth / 2, barY, barWidth, barHeight);
        
        // Damage resistance indicator
        if (this.damageResistance > 0) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.floor(this.damageResistance * 100)}%`, this.x + barWidth / 2 + 15, barY + barHeight / 2 + 3);
        }
        
        // Special ability indicator
        if (this.maxSpecialCooldown > 0 && this.specialCooldown <= 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('!', this.x - barWidth / 2 - 10, barY + barHeight / 2 + 3);
        }
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
            
            // Different bullet visuals based on type and properties
            let bulletColor = '#ff6666';
            let trailColor = 'rgba(255, 100, 100, 0.6)';
            let bulletSize = 2.5;
            
            // Critical hit bullets
            if (bullet.isCritical) {
                bulletColor = '#FFD700';
                trailColor = 'rgba(255, 215, 0, 0.8)';
                bulletSize = 3.5;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#FFD700';
            }
            
            // Homing bullets
            if (bullet.isHoming) {
                bulletColor = '#FF1493';
                trailColor = 'rgba(255, 20, 147, 0.8)';
                ctx.shadowBlur = 6;
                ctx.shadowColor = '#FF1493';
            }
            
            // Deadly boss bullets
            if (bullet.isDeadly) {
                bulletColor = '#8B0000';
                trailColor = 'rgba(139, 0, 0, 0.9)';
                bulletSize = 4;
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#8B0000';
            }
            
            // Enemy type specific bullets
            switch (bullet.enemyType) {
                case 'sniper':
                    bulletColor = '#9966FF';
                    trailColor = 'rgba(153, 102, 255, 0.8)';
                    bulletSize = 3;
                    break;
                case 'heavy':
                    bulletColor = '#8B4513';
                    trailColor = 'rgba(139, 69, 19, 0.7)';
                    bulletSize = 3.2;
                    break;
                case 'fast':
                    bulletColor = '#FF6600';
                    trailColor = 'rgba(255, 102, 0, 0.7)';
                    bulletSize = 2;
                    break;
                case 'elite':
                    bulletColor = '#00FFFF';
                    trailColor = 'rgba(0, 255, 255, 0.8)';
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = '#00FFFF';
                    break;
                case 'berserker':
                    bulletColor = '#FF0066';
                    trailColor = 'rgba(255, 0, 102, 0.8)';
                    break;
                case 'support':
                    bulletColor = '#00FF00';
                    trailColor = 'rgba(0, 255, 0, 0.7)';
                    break;
            }
            
            // Bullet trail
            ctx.strokeStyle = trailColor;
            ctx.lineWidth = bullet.isCritical ? 3 : (bullet.isDeadly ? 4 : 2);
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.lineTo(0, 0);
            ctx.stroke();
            
            // Bullet head
            ctx.fillStyle = bulletColor;
            ctx.beginPath();
            ctx.arc(0, 0, bulletSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Additional effects for special bullets
            if (bullet.isCritical) {
                ctx.strokeStyle = '#FFA500';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, bulletSize + 1, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }
    
    // Get enhanced color based on visual tier
    getEnhancedColor() {
        // Base color from the enemy type
        const baseColor = this.color;
        
        // No enhancement for tier 0
        if (!this.visualTier || this.visualTier === 0) {
            return baseColor;
        }
        
        // Parse the base color to RGB
        let r, g, b;
        if (baseColor.startsWith('#')) {
            const hex = baseColor.substring(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            // Default fallback if color parsing fails
            return baseColor;
        }
        
        // Enhance colors based on tier
        switch (this.visualTier) {
            case 1: // Tier 1: Slightly more saturated
                r = Math.min(r * 1.1, 255);
                g = Math.min(g * 1.1, 255);
                b = Math.min(b * 1.1, 255);
                break;
            case 2: // Tier 2: More vibrant with gold tint
                r = Math.min(r * 1.2, 255);
                g = Math.min(g * 1.1, 255);
                b = Math.min(b * 0.9, 255);
                break;
            case 3: // Tier 3: Intense with slight glow effect
                r = Math.min(r * 1.3, 255);
                g = Math.min(g * 1.2, 255);
                b = Math.min(b * 1.1, 255);
                break;
        }
        
        // Convert back to hex
        return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
    }
    
    // Apply visual effects based on tier
    applyVisualTierEffects(ctx) {
        if (!this.visualTier || this.visualTier === 0) {
            return; // No effects for base tier
        }
        
        // Apply increasing visual effects based on tier
        switch (this.visualTier) {
            case 1: // Tier 1: Slight glow
                ctx.shadowBlur = 5;
                ctx.shadowColor = this.color;
                break;
            case 2: // Tier 2: More pronounced glow and slight size increase
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.color;
                ctx.scale(1.05, 1.05); // 5% larger
                break;
            case 3: // Tier 3: Strong glow, size increase, and pulsing effect
                const pulseAmount = 0.05 * Math.sin(this.animationTimer / 200);
                ctx.shadowBlur = 12;
                ctx.shadowColor = this.color;
                ctx.scale(1.1 + pulseAmount, 1.1 + pulseAmount); // 10% larger with pulse
                break;
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
        
        // New burst spawning properties
        this.burstSpawning = false;
        this.burstTimer = 0;
        this.burstInterval = 8000;
        this.burstCount = 0;
        
        // Dynamic difficulty scaling
        this.difficultyMultiplier = 1.0;
        this.maxConcurrentEnemies = 60; // Increased from 25 to 60 for more enemies on screen
    }

    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.enemies = [];
        this.enemiesSpawned = 0;
        this.waveActive = true;
        this.wavePaused = false;
        this.spawnTimer = 0;
        
        // Enhanced enemy count scaling - exponential growth for challenge
        const baseEnemies = 15; // Increased from 8 to 15
        const exponentialFactor = Math.pow(1.6, waveNumber - 1); // Increased from 1.4 to 1.6 for faster growth
        const linearFactor = waveNumber * 8; // Increased from 4 to 8 for more linear growth
        
        // Combine both factors with a max cap
        this.totalEnemiesInWave = Math.min(
            Math.floor(baseEnemies + exponentialFactor + linearFactor),
            150 // Increased from 80 to 150 for much higher enemy counts
        );
        
        // Aggressive spawn rate scaling - enemies spawn much faster
        const baseSpawnInterval = 800; // Reduced from 1800 to 800ms for faster initial spawning
        const reductionPerWave = 50; // Reduced from 100 to 50ms for more gradual decrease
        const minimumInterval = 100; // Reduced from 200 to 100ms for very fast spawning
        
        this.spawnInterval = Math.max(
            baseSpawnInterval - (waveNumber * reductionPerWave),
            minimumInterval
        );
        
        // Add burst spawning for higher waves (now starts earlier and more frequent)
        this.burstSpawning = waveNumber >= 2; // Start burst spawning from wave 2 instead of 5
        this.burstTimer = 0;
        this.burstInterval = 4000; // Every 4 seconds instead of 8 for more frequent bursts
        this.burstCount = Math.min(Math.floor(waveNumber / 2) + 3, 15); // More enemies per burst (up to 15)
        
        console.log(`Starting Wave ${waveNumber} - ${this.totalEnemiesInWave} enemies, spawn interval: ${this.spawnInterval}ms`);
        if (this.burstSpawning) {
            console.log(`Burst spawning enabled: ${this.burstCount} enemies every ${this.burstInterval/1000}s`);
        }
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
        
        // Regular enemy spawning
        if (this.enemiesSpawned < this.totalEnemiesInWave && this.enemies.length < this.maxConcurrentEnemies) {
            this.spawnTimer += deltaTime;
            if (this.spawnTimer >= this.spawnInterval) {
                // Spawn multiple enemies at once for higher waves
                const simultaneousSpawns = Math.min(Math.floor(this.currentWave / 3) + 1, 4);
                for (let i = 0; i < simultaneousSpawns && this.enemiesSpawned < this.totalEnemiesInWave; i++) {
                    this.spawnEnemy(player);
                }
                this.spawnTimer = 0;
            }
        }
        
        // Burst spawning for higher waves (additional enemies beyond the normal count)
        if (this.burstSpawning && this.currentWave >= 2) {
            this.burstTimer += deltaTime;
            if (this.burstTimer >= this.burstInterval) {
                this.spawnBurst(player);
                this.burstTimer = 0;
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

    spawnBurst(player) {
        if (!player || !player.mainTank) return;
        
        console.log(`Spawning burst of ${this.burstCount} enemies`);
        
        for (let i = 0; i < this.burstCount; i++) {
            const playerX = player.mainTank.x;
            const playerY = player.mainTank.y;
            
            // Vary spawn distance for burst spawning
            const spawnDistance = 300 + Math.random() * 200; // 300-500 units
            
            // Choose random angle around player
            const angle = Math.random() * Math.PI * 2;
            const x = playerX + Math.cos(angle) * spawnDistance;
            const y = playerY + Math.sin(angle) * spawnDistance;
            
            // Choose enemy type - bias toward more aggressive types for bursts
            const enemyType = this.chooseBurstEnemyType();
            const enemy = new Enemy(x, y, enemyType);
            
            this.enemies.push(enemy);
        }
    }

    chooseEnemyType() {
        const wave = this.currentWave;
        
        // Boss every 5 waves with higher chance in later waves
        if (wave % 5 === 0 && Math.random() < Math.min(0.3 + wave * 0.02, 0.7)) {
            return 'boss';
        }
        
        // Additional boss chance for very high waves
        if (wave >= 10 && Math.random() < 0.1) {
            return 'boss';
        }
        
        // Enhanced type probabilities based on wave - including new enemy types
        const types = ['basic', 'heavy', 'fast', 'sniper', 'elite', 'berserker', 'support'];
        const probabilities = [
            Math.max(0.35 - wave * 0.03, 0.05), // basic (decreases faster)
            Math.min(0.20 + wave * 0.02, 0.30),  // heavy 
            Math.min(0.20 + wave * 0.02, 0.25),  // fast 
            Math.min(0.15 + wave * 0.015, 0.25), // sniper
            wave >= 3 ? Math.min(0.05 + wave * 0.02, 0.20) : 0, // elite (unlocks wave 3)
            wave >= 4 ? Math.min(0.03 + wave * 0.015, 0.15) : 0, // berserker (unlocks wave 4)
            wave >= 6 ? Math.min(0.02 + wave * 0.01, 0.10) : 0   // support (unlocks wave 6)
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

    chooseBurstEnemyType() {
        const wave = this.currentWave;
        
        // Burst spawning favors aggressive enemy types including new ones
        const types = ['fast', 'heavy', 'sniper', 'elite', 'berserker', 'boss'];
        const probabilities = [
            Math.min(0.30 + wave * 0.015, 0.45),  // fast (high chance)
            Math.min(0.25 + wave * 0.02, 0.40),   // heavy (medium-high chance)
            Math.min(0.15 + wave * 0.015, 0.30),  // sniper (medium chance)
            wave >= 3 ? Math.min(0.15 + wave * 0.02, 0.35) : 0, // elite (aggressive bursts)
            wave >= 4 ? Math.min(0.10 + wave * 0.02, 0.30) : 0, // berserker (very aggressive)
            Math.min(0.05 + wave * 0.01, 0.25)    // boss (low but increasing chance)
        ];
        
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < types.length; i++) {
            cumulative += probabilities[i];
            if (random < cumulative) {
                return types[i];
            }
        }
        
        return 'fast'; // Default to fast for burst spawning
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