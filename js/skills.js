// Skills System

class Skill {
    constructor(id, name, description, type, effect, duration = 0, cooldown = 0, emoji = '⚡', shortName = null) {
        this.id = id;
        this.name = name;
        this.shortName = shortName || name; // Short name for button display
        this.description = description;
        this.type = type; // 'active' or 'passive'
        this.effect = effect; // Object describing the effect
        this.duration = duration; // For active skills (ms)
        this.cooldown = cooldown; // For active skills (ms)
        this.emoji = emoji; // Emoji for visual representation
        this.isActive = false;
        this.remainingDuration = 0;
        this.remainingCooldown = 0;
        this.level = 1;
        this.maxLevel = 5;
    }

    activate(player, enemies, effectsManager = null) {
        if (this.type === 'passive') return; // Passive skills are always active
        if (this.remainingCooldown > 0) return; // On cooldown
        
        this.isActive = true;
        this.remainingDuration = this.duration;
        this.remainingCooldown = this.cooldown;
        
        // Trigger cast effects
        if (effectsManager) {
            const playerPos = { x: player.mainTank.x, y: player.mainTank.y };
            effectsManager.triggerCastEffect(this.effect.type, playerPos.x, playerPos.y);
            
            // Start during effects if skill has duration
            if (this.duration > 0) {
                effectsManager.startDuringEffect(this.effect.type, this);
            }
        }
        
        // Apply immediate effects
        this.applyEffect(player, enemies);
    }

    update(deltaTime, player, enemies, effectsManager = null) {
        // Update cooldown
        if (this.remainingCooldown > 0) {
            this.remainingCooldown -= deltaTime;
        }
        
        // Update active skill duration
        if (this.isActive && this.duration > 0) {
            this.remainingDuration -= deltaTime;
            if (this.remainingDuration <= 0) {
                // Trigger exit effects before deactivating
                if (effectsManager) {
                    const playerPos = { x: player.mainTank.x, y: player.mainTank.y };
                    effectsManager.triggerExitEffect(this.effect.type, playerPos.x, playerPos.y);
                }
                
                this.isActive = false;
                this.removeEffect(player);
            }
        }
        
        // Apply continuous effects for active skills
        if (this.isActive) {
            this.applyContinuousEffect(deltaTime, player, enemies);
        }
    }

    applyEffect(player, enemies) {
        switch (this.effect.type) {
            case 'heal':
                this.applyHeal(player);
                break;
            case 'damage_boost':
                this.applyDamageBoost(player);
                break;
            case 'speed_boost':
                this.applySpeedBoost(player);
                break;
            case 'shield':
                this.applyShield(player);
                break;
            case 'explosive_shot':
                this.applyExplosiveShot(player);
                break;
            case 'multi_shot':
                this.applyMultiShot(player);
                break;
            case 'time_slow':
                this.applyTimeSlow(enemies);
                break;
            case 'auto_repair':
                this.applyAutoRepair(player);
                break;
            case 'formation_expand':
                this.applyFormationExpand(player);
                break;
            case 'freeze_blast':
                this.applyFreezeBlast(enemies);
                break;
            case 'lightning_storm':
                this.applyLightningStorm(player, enemies);
                break;
            case 'fire_nova':
                this.applyFireNova(player, enemies);
                break;
            case 'vortex_field':
                this.applyVortexField(player, enemies);
                break;
            case 'plasma_burst':
                this.applyPlasmaBurst(player, enemies);
                break;
            case 'ice_barrier':
                this.applyIceBarrier(player);
                break;
            case 'magnetic_pull':
                this.applyMagneticPull(player);
                break;
            case 'quantum_strike':
                this.applyQuantumStrike(player, enemies);
                break;
        }
    }

    applyContinuousEffect(deltaTime, player, enemies) {
        switch (this.effect.type) {
            case 'auto_repair':
                if (this.remainingDuration % 1000 < deltaTime) { // Every second
                    player.mainTank.heal(this.effect.value);
                    for (const miniTank of player.miniTanks) {
                        miniTank.heal(this.effect.value / 2);
                    }
                }
                break;
            case 'vortex_field':
                this.applyVortexPull(player, enemies, deltaTime);
                break;
            case 'ice_barrier':
                this.maintainIceBarrier(player, deltaTime);
                break;
            case 'magnetic_pull':
                this.applyMagneticEffect(player, deltaTime);
                break;
        }
    }

    removeEffect(player) {
        switch (this.effect.type) {
            case 'damage_boost':
                player.mainTank.damage /= this.effect.multiplier;
                for (const miniTank of player.miniTanks) {
                    miniTank.damage /= this.effect.multiplier;
                }
                break;
            case 'speed_boost':
                player.mainTank.speed /= this.effect.multiplier;
                for (const miniTank of player.miniTanks) {
                    miniTank.speed /= this.effect.multiplier;
                }
                break;
        }
    }

    // Specific effect implementations
    applyHeal(player) {
        const healAmount = this.effect.value * this.level;
        player.mainTank.heal(healAmount);
        for (const miniTank of player.miniTanks) {
            miniTank.heal(healAmount * 0.8);
        }
    }

    applyDamageBoost(player) {
        const multiplier = this.effect.multiplier + (this.level - 1) * 0.2;
        player.mainTank.damage *= multiplier;
        for (const miniTank of player.miniTanks) {
            miniTank.damage *= multiplier;
        }
    }

    applySpeedBoost(player) {
        const multiplier = this.effect.multiplier + (this.level - 1) * 0.1;
        player.mainTank.speed *= multiplier;
        for (const miniTank of player.miniTanks) {
            miniTank.speed *= multiplier;
        }
    }

    applyShield(player) {
        const shieldAmount = this.effect.value * this.level;
        player.mainTank.maxHealth += shieldAmount;
        player.mainTank.health += shieldAmount;
        for (const miniTank of player.miniTanks) {
            miniTank.maxHealth += shieldAmount * 0.6;
            miniTank.health += shieldAmount * 0.6;
        }
    }

    applyExplosiveShot(player) {
        // This effect will be handled in the bullet collision system
        player.explosiveShotActive = true;
        player.explosiveShotDuration = this.duration;
    }

    applyMultiShot(player) {
        // This effect will be handled in the shooting system
        player.multiShotActive = true;
        player.multiShotDuration = this.duration;
        player.multiShotCount = 2 + this.level;
    }

    applyTimeSlow(enemies) {
        for (const enemy of enemies) {
            enemy.speed *= 0.5;
            enemy.maxShootCooldown *= 2;
        }
    }

    applyAutoRepair(player) {
        // Continuous effect handled in applyContinuousEffect
    }

    applyFormationExpand(player) {
        console.log('Applying formation expand skill...');
        
        // Add a new mini tank to the formation if under the limit
        if (player.miniTanks.length >= 8) {
            console.log('Formation already at maximum capacity (8 mini tanks)');
            return;
        }
        
        try {
            const mainTank = player.mainTank;
            if (!mainTank) {
                console.error('No main tank found');
                return;
            }
            
            const existingCount = player.miniTanks.length;
            console.log(`Current mini tanks: ${existingCount}, adding one more`);
            
            // Calculate position for new mini tank
            const angle = (existingCount * Math.PI * 2) / Math.max(8, existingCount + 1);
            const distance = 80;
            const x = mainTank.x + Math.cos(angle) * distance;
            const y = mainTank.y + Math.sin(angle) * distance;
            
            // Check if Tank class is available
            if (typeof Tank === 'undefined') {
                console.error('Tank class is not available. Cannot create new mini tank.');
                return;
            }
            
            console.log(`Creating new mini tank at position (${x}, ${y})`);
            const newMiniTank = new Tank(x, y, 'mini');
            
            // Apply any existing passive upgrades to the new mini tank
            // This should be handled by the upgrade system if it exists
            if (window.gameEngine && window.gameEngine.upgradeManager) {
                const upgrades = window.gameEngine.upgradeManager.upgrades;
                
                // Apply mini tank health upgrades
                if (upgrades.miniHealth && upgrades.miniHealth.level > 0) {
                    const healthBonus = upgrades.miniHealth.getCurrentValue() - upgrades.miniHealth.baseValue;
                    newMiniTank.maxHealth += healthBonus;
                    newMiniTank.health = newMiniTank.maxHealth;
                    console.log(`Applied health upgrade: +${healthBonus}`);
                }
                
                // Apply mini tank damage upgrades
                if (upgrades.miniDamage && upgrades.miniDamage.level > 0) {
                    const damageBonus = upgrades.miniDamage.getCurrentValue() - upgrades.miniDamage.baseValue;
                    newMiniTank.damage += damageBonus;
                    console.log(`Applied damage upgrade: +${damageBonus}`);
                }
                
                // Apply mini tank speed upgrades
                if (upgrades.miniSpeed && upgrades.miniSpeed.level > 0) {
                    const speedBonus = upgrades.miniSpeed.getCurrentValue() - upgrades.miniSpeed.baseValue;
                    newMiniTank.speed += speedBonus;
                    console.log(`Applied speed upgrade: +${speedBonus}`);
                }
            }
            
            player.miniTanks.push(newMiniTank);
            console.log(`Successfully added mini tank! Formation now has ${player.miniTanks.length} mini tanks.`);
            
        } catch (error) {
            console.error('Error adding mini tank:', error);
            // Report error to Sentry if available
            if (window.Sentry) {
                window.Sentry.captureException(error);
            }
        }
    }

    // New Advanced Skill Implementations
    applyFreezeBlast(enemies) {
        for (const enemy of enemies) {
            // Apply freeze effect
            enemy.frozen = true;
            enemy.originalSpeed = enemy.speed;
            enemy.speed *= this.effect.slowFactor;
            enemy.freezeDuration = this.effect.freezeDuration;
            enemy.freezeEndTime = Date.now() + this.effect.freezeDuration;
            
            // Visual freeze effect
            enemy.frozenEffect = true;
        }
    }

    applyLightningStorm(player, enemies) {
        if (enemies.length === 0) return;
        
        // Start from player position
        const startX = player.mainTank.x;
        const startY = player.mainTank.y;
        
        // Find closest enemies and create chain
        const targets = [];
        let currentTarget = this.findClosestEnemy(enemies, startX, startY);
        
        for (let i = 0; i < this.effect.chains && currentTarget; i++) {
            targets.push(currentTarget);
            
            // Damage the target
            const damage = this.effect.damage * (1 + this.level * 0.2);
            currentTarget.takeDamage(damage);
            
            // Mark as hit to avoid hitting again
            currentTarget.lightningHit = true;
            
            // Find next target in range
            currentTarget = this.findClosestEnemy(
                enemies.filter(e => !e.lightningHit),
                currentTarget.x, currentTarget.y
            );
        }
        
        // Store lightning chain for visual effects
        if (window.gameEngine && window.gameEngine.effectsManager) {
            window.gameEngine.effectsManager.createLightningChain(startX, startY, targets);
        }
        
        // Clear lightning hit markers
        setTimeout(() => {
            for (const enemy of enemies) {
                enemy.lightningHit = false;
            }
        }, 100);
    }

    applyFireNova(player, enemies) {
        const centerX = player.mainTank.x;
        const centerY = player.mainTank.y;
        const radius = this.effect.radius;
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - centerX, 2) + Math.pow(enemy.y - centerY, 2)
            );
            
            if (distance <= radius) {
                // Apply initial damage
                const damage = this.effect.damage * (1 + this.level * 0.15);
                enemy.takeDamage(damage);
                
                // Apply burning effect
                enemy.burning = true;
                enemy.burnDamage = this.effect.damage / 2;
                enemy.burnDuration = this.effect.dotDuration;
                enemy.burnEndTime = Date.now() + this.effect.dotDuration;
                enemy.burnInterval = 500; // Damage every 0.5 seconds
                enemy.lastBurnTick = Date.now();
            }
        }
    }

    applyVortexField(player, enemies) {
        const centerX = player.mainTank.x;
        const centerY = player.mainTank.y;
        
        // Store vortex data for continuous effect
        player.vortexActive = true;
        player.vortexCenter = { x: centerX, y: centerY };
        player.vortexRadius = this.effect.radius;
        player.vortexForce = this.effect.pullForce;
        player.vortexDamage = this.effect.damage;
    }

    applyPlasmaBurst(player, enemies) {
        const startX = player.mainTank.x;
        const startY = player.mainTank.y;
        const angle = player.mainTank.angle;
        const range = this.effect.range;
        const width = this.effect.width;
        const damage = this.effect.damage * (1 + this.level * 0.25);
        
        // Create plasma wave
        for (const enemy of enemies) {
            // Calculate if enemy is within plasma burst area
            const dx = enemy.x - startX;
            const dy = enemy.y - startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= range) {
                // Check if enemy is within the burst width
                const enemyAngle = Math.atan2(dy, dx);
                const angleDiff = Math.abs(enemyAngle - angle);
                const normalizedAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
                
                if (normalizedAngleDiff <= width / 2) {
                    enemy.takeDamage(damage);
                    // Add plasma effect
                    enemy.plasmaHit = true;
                    enemy.plasmaEndTime = Date.now() + 1000;
                }
            }
        }
        
        // Visual plasma burst effect
        if (window.gameEngine && window.gameEngine.effectsManager) {
            window.gameEngine.effectsManager.createPlasmaBurst(startX, startY, angle, range, width);
        }
    }

    applyIceBarrier(player) {
        const centerX = player.mainTank.x;
        const centerY = player.mainTank.y;
        const barriers = [];
        
        // Create ice barriers around the player
        for (let i = 0; i < this.effect.count; i++) {
            const angle = (i / this.effect.count) * Math.PI * 2;
            const distance = 100; // Distance from player
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            barriers.push({
                x: x,
                y: y,
                health: this.effect.health,
                maxHealth: this.effect.health,
                angle: angle,
                active: true
            });
        }
        
        player.iceBarriers = barriers;
        player.iceBarrierActive = true;
    }

    applyMagneticPull(player) {
        player.magneticFieldActive = true;
        player.magneticRange = this.effect.range;
        player.magneticRedirect = this.effect.redirect;
    }

    applyQuantumStrike(player, enemies) {
        if (enemies.length === 0) return;
        
        // Find target enemy
        const target = this.findClosestEnemy(enemies, player.mainTank.x, player.mainTank.y);
        if (!target) return;
        
        // Store original position
        const originalX = player.mainTank.x;
        const originalY = player.mainTank.y;
        
        // Teleport to target
        const teleportX = target.x + Math.cos(target.angle + Math.PI) * 80;
        const teleportY = target.y + Math.sin(target.angle + Math.PI) * 80;
        
        player.mainTank.x = teleportX;
        player.mainTank.y = teleportY;
        
        // Update mini tank positions
        player.updateMiniTankPositions();
        
        // Deal massive damage
        const damage = this.effect.damage * (1 + this.level * 0.3);
        target.takeDamage(damage);
        
        // Damage nearby enemies
        for (const enemy of enemies) {
            if (enemy !== target) {
                const distance = Math.sqrt(
                    Math.pow(enemy.x - teleportX, 2) + Math.pow(enemy.y - teleportY, 2)
                );
                
                if (distance <= this.effect.range) {
                    enemy.takeDamage(damage * 0.5);
                }
            }
        }
        
        // Visual quantum effect
        if (window.gameEngine && window.gameEngine.effectsManager) {
            window.gameEngine.effectsManager.createQuantumStrike(originalX, originalY, teleportX, teleportY);
        }
    }

    // Helper methods for continuous effects
    applyVortexPull(player, enemies, deltaTime) {
        if (!player.vortexActive) return;
        
        const centerX = player.vortexCenter.x;
        const centerY = player.vortexCenter.y;
        const radius = player.vortexRadius;
        const force = player.vortexForce;
        const damage = player.vortexDamage;
        
        for (const enemy of enemies) {
            const dx = centerX - enemy.x;
            const dy = centerY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius && distance > 0) {
                // Pull enemies toward center
                const pullStrength = (force * deltaTime) / 1000;
                const pullX = (dx / distance) * pullStrength;
                const pullY = (dy / distance) * pullStrength;
                
                enemy.x += pullX;
                enemy.y += pullY;
                
                // Damage enemies in vortex
                if (Math.random() < 0.1) { // 10% chance per frame
                    enemy.takeDamage(damage);
                }
            }
        }
    }

    maintainIceBarrier(player, deltaTime) {
        if (!player.iceBarrierActive || !player.iceBarriers) return;
        
        // Update barrier positions to follow player
        const centerX = player.mainTank.x;
        const centerY = player.mainTank.y;
        
        for (let i = 0; i < player.iceBarriers.length; i++) {
            const barrier = player.iceBarriers[i];
            if (barrier.active) {
                const distance = 100;
                barrier.x = centerX + Math.cos(barrier.angle) * distance;
                barrier.y = centerY + Math.sin(barrier.angle) * distance;
            }
        }
    }

    applyMagneticEffect(player, deltaTime) {
        if (!player.magneticFieldActive) return;
        
        // This will be handled by the bullet system to redirect enemy bullets
        // The effect is applied in the game engine's bullet update loop
    }

    // Helper method to find closest enemy
    findClosestEnemy(enemies, x, y) {
        let closest = null;
        let minDistance = Infinity;
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - x, 2) + Math.pow(enemy.y - y, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closest = enemy;
            }
        }
        
        return closest;
    }

    upgrade() {
        if (this.level < this.maxLevel) {
            this.level++;
            return true;
        }
        return false;
    }

    getCooldownPercent() {
        if (this.cooldown === 0) return 1;
        return 1 - (this.remainingCooldown / this.cooldown);
    }

    isReady() {
        return this.remainingCooldown <= 0;
    }
}

class SkillManager {
    constructor() {
        this.availableSkills = this.createSkillDatabase();
        this.activeSkills = [];
        this.passiveSkills = [];
        this.skillSlots = [null, null, null]; // 3 active skill slots
        
        // Auto-cast settings
        this.autoCastEnabled = true;
        this.autoCastInterval = 2000; // Try to cast skills every 2 seconds
        this.lastAutoCast = 0;
        
        // Effects manager reference (set by game engine)
        this.effectsManager = null;
    }

    createSkillDatabase() {
        return [
            // Active Skills
            new Skill('heal', 'Emergency Repair', 'Instantly repairs all tanks', 'active', 
                { type: 'heal', value: 30 }, 0, 8000, '🔧', 'REPAIR'),
            
            new Skill('damage_boost', 'Combat Overdrive', 'Increases damage for 10 seconds', 'active',
                { type: 'damage_boost', multiplier: 1.5 }, 10000, 15000, '💥', 'POWER'),
            
            new Skill('speed_boost', 'Nitro Boost', 'Increases movement speed for 8 seconds', 'active',
                { type: 'speed_boost', multiplier: 1.8 }, 8000, 12000, '🚀', 'SPEED'),
            
            new Skill('shield', 'Energy Shield', 'Adds temporary shield to all tanks', 'active',
                { type: 'shield', value: 25 }, 15000, 20000, '🛡️', 'SHIELD'),
            
            new Skill('explosive_shot', 'Explosive Rounds', 'Shots explode on impact for 12 seconds', 'active',
                { type: 'explosive_shot', radius: 50, damage: 15 }, 12000, 18000, '💣', 'BOOM'),
            
            new Skill('multi_shot', 'Multi-Cannon', 'Fire multiple shots at once for 10 seconds', 'active',
                { type: 'multi_shot', count: 3 }, 10000, 16000, '🔫', 'MULTI'),
            
            new Skill('time_slow', 'Temporal Field', 'Slows all enemies for 6 seconds', 'active',
                { type: 'time_slow', slowFactor: 0.5 }, 6000, 25000, '⏰', 'SLOW'),
            
            new Skill('auto_repair', 'Auto-Repair System', 'Gradually repairs tanks for 20 seconds', 'active',
                { type: 'auto_repair', value: 5 }, 20000, 30000, '🔄', 'REGEN'),
            
            // New Advanced Active Skills
            new Skill('freeze_blast', 'Freeze Blast', 'Freezes and slows all enemies for 8 seconds', 'active',
                { type: 'freeze_blast', slowFactor: 0.3, freezeDuration: 2000 }, 8000, 22000, '❄️', 'FREEZE'),
            
            new Skill('lightning_storm', 'Lightning Storm', 'Chain lightning jumps between enemies', 'active',
                { type: 'lightning_storm', damage: 25, chains: 3, range: 150 }, 0, 18000, '⚡', 'BOLT'),
            
            new Skill('fire_nova', 'Fire Nova', 'Spreads burning damage over time', 'active',
                { type: 'fire_nova', damage: 8, dotDuration: 5000, radius: 120 }, 0, 16000, '🔥', 'NOVA'),
            
            new Skill('vortex_field', 'Vortex Field', 'Pulls enemies together and damages them', 'active',
                { type: 'vortex_field', pullForce: 100, damage: 15, radius: 200 }, 6000, 20000, '🌀', 'VORTEX'),
            
            new Skill('plasma_burst', 'Plasma Burst', 'High-damage energy wave that pierces enemies', 'active',
                { type: 'plasma_burst', damage: 40, range: 300, width: 80 }, 0, 14000, '💎', 'PLASMA'),
            
            new Skill('ice_barrier', 'Ice Barrier', 'Creates protective ice walls around tanks', 'active',
                { type: 'ice_barrier', health: 100, duration: 12000, count: 6 }, 12000, 25000, '🧊', 'WALL'),
            
            new Skill('magnetic_pull', 'Magnetic Field', 'Attracts and redirects enemy bullets', 'active',
                { type: 'magnetic_pull', range: 180, redirect: true }, 10000, 19000, '🧲', 'MAGNET'),
            
            new Skill('quantum_strike', 'Quantum Strike', 'Teleports and deals massive damage', 'active',
                { type: 'quantum_strike', damage: 60, range: 250, teleportRange: 150 }, 0, 30000, '✨', 'QUANTUM'),
            
            // Passive Skills
            new Skill('armor_upgrade', 'Reinforced Armor', 'Permanently increases max health', 'passive',
                { type: 'health_increase', value: 20 }, 0, 0, '🛡️', 'ARMOR'),
            
            new Skill('weapon_upgrade', 'Enhanced Weapons', 'Permanently increases damage', 'passive',
                { type: 'damage_increase', value: 3 }, 0, 0, '⚔️', 'WEAPON'),
            
            new Skill('engine_upgrade', 'Improved Engine', 'Permanently increases speed', 'passive',
                { type: 'speed_increase', value: 0.5 }, 0, 0, '⚙️', 'ENGINE'),
            
            new Skill('rapid_fire', 'Rapid Fire System', 'Permanently reduces shoot cooldown', 'passive',
                { type: 'cooldown_reduction', value: 0.8 }, 0, 0, '🔥', 'RAPID'),
            
            new Skill('targeting_system', 'Advanced Targeting', 'Increases bullet speed and accuracy', 'passive',
                { type: 'accuracy_boost', value: 1.5 }, 0, 0, '🎯', 'TARGET'),
            
            // Formation Skills
            new Skill('formation_expand', 'Formation Expansion', 'Add +1 mini tank to formation', 'passive',
                { type: 'formation_expand', value: 1 }, 0, 0, '🚗', 'EXPAND'),
        ];
    }

    update(deltaTime, player, enemies) {
        // Update all active skills
        for (const skill of this.activeSkills) {
            skill.update(deltaTime, player, enemies, this.effectsManager);
        }
        
        // Auto-cast skills if enabled
        if (this.autoCastEnabled) {
            this.lastAutoCast += deltaTime;
            if (this.lastAutoCast >= this.autoCastInterval) {
                this.autoCastSkills(player, enemies);
                this.lastAutoCast = 0;
            }
        }
    }

    autoCastSkills(player, enemies) {
        const playerHealth = player.getHealthPercent();
        
        for (const skill of this.activeSkills) {
            if (!skill.isReady()) continue;
            
            let shouldCast = false;
            
            switch (skill.effect.type) {
                case 'heal':
                    shouldCast = playerHealth < 0.5; // Cast when health below 50%
                    break;
                case 'damage_boost':
                    shouldCast = enemies.length > 3; // Cast when many enemies
                    break;
                case 'speed_boost':
                    shouldCast = enemies.length > 5 || playerHealth < 0.3;
                    break;
                case 'shield':
                    shouldCast = playerHealth < 0.4;
                    break;
                case 'explosive_shot':
                    shouldCast = enemies.length > 4;
                    break;
                case 'multi_shot':
                    shouldCast = enemies.length > 6;
                    break;
                case 'time_slow':
                    shouldCast = enemies.length > 8 || playerHealth < 0.2;
                    break;
                case 'auto_repair':
                    shouldCast = playerHealth < 0.6;
                    break;
                case 'freeze_blast':
                    shouldCast = enemies.length > 6 || playerHealth < 0.3;
                    break;
                case 'lightning_storm':
                    shouldCast = enemies.length > 4;
                    break;
                case 'fire_nova':
                    shouldCast = enemies.length > 5;
                    break;
                case 'vortex_field':
                    shouldCast = enemies.length > 7;
                    break;
                case 'plasma_burst':
                    shouldCast = enemies.length > 3;
                    break;
                case 'ice_barrier':
                    shouldCast = playerHealth < 0.4;
                    break;
                case 'magnetic_pull':
                    shouldCast = enemies.length > 8;
                    break;
                case 'quantum_strike':
                    shouldCast = enemies.length > 10 || playerHealth < 0.2;
                    break;
            }
            
            if (shouldCast) {
                skill.activate(player, enemies, this.effectsManager);
                break; // Only cast one skill per cycle
            }
        }
    }

    addSkill(skillId) {
        console.log(`Adding skill: ${skillId}`);
        
        try {
            const skillTemplate = this.availableSkills.find(s => s.id === skillId);
            if (!skillTemplate) {
                console.error(`Skill template not found for ID: ${skillId}`);
                return false;
            }
            
            console.log(`Found skill template: ${skillTemplate.name} (${skillTemplate.type})`);
            
            // Check if skill already exists (for upgrading)
            const existingSkill = this.findSkill(skillId);
            if (existingSkill) {
                console.log(`Upgrading existing skill: ${skillId}`);
                return existingSkill.upgrade();
            }
            
            // Create a copy of the skill
            const newSkill = new Skill(
                skillTemplate.id,
                skillTemplate.name,
                skillTemplate.description,
                skillTemplate.type,
                skillTemplate.effect,
                skillTemplate.duration,
                skillTemplate.cooldown,
                skillTemplate.emoji,
                skillTemplate.shortName
            );
            
            console.log(`Created new skill instance: ${newSkill.name}`);
            
            if (newSkill.type === 'active') {
                // Add to active skills if there's a slot
                if (this.activeSkills.length < 3) {
                    this.activeSkills.push(newSkill);
                    this.skillSlots[this.activeSkills.length - 1] = newSkill;
                    console.log(`Added active skill to slot ${this.activeSkills.length - 1}`);
                    return true;
                }
            } else {
                // Add passive skill and apply immediately
                this.passiveSkills.push(newSkill);
                console.log(`Added passive skill to collection`);
                
                // Apply passive effect immediately
                if (window.gameEngine && window.gameEngine.player) {
                    console.log(`Applying passive skill effect for: ${skillId}`);
                    newSkill.applyEffect(window.gameEngine.player, window.gameEngine.enemies);
                    console.log(`Successfully applied passive skill effect`);
                } else {
                    console.warn('Game engine or player not available for passive skill application');
                }
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Error in addSkill:', error);
            // Report error to Sentry if available
            if (window.Sentry) {
                window.Sentry.captureException(error);
            }
            return false;
        }
    }

    removeSkill(skillId) {
        // Remove from active skills
        for (let i = 0; i < this.activeSkills.length; i++) {
            if (this.activeSkills[i].id === skillId) {
                this.activeSkills.splice(i, 1);
                this.skillSlots[i] = null;
                return true;
            }
        }
        
        // Remove from passive skills
        for (let i = 0; i < this.passiveSkills.length; i++) {
            if (this.passiveSkills[i].id === skillId) {
                this.passiveSkills.splice(i, 1);
                return true;
            }
        }
        
        return false;
    }

    upgradeSkill(skillId) {
        const skill = this.findSkill(skillId);
        return skill ? skill.upgrade() : false;
    }

    findSkill(skillId) {
        return [...this.activeSkills, ...this.passiveSkills].find(s => s.id === skillId);
    }

    manualCastSkill(slotIndex, player, enemies) {
        if (slotIndex < 0 || slotIndex >= this.skillSlots.length) return false;
        
        const skill = this.skillSlots[slotIndex];
        if (!skill || !skill.isReady()) return false;
        
        skill.activate(player, enemies, this.effectsManager);
        return true;
    }

    getRandomSkillChoices(count = 3, playerLevel = 1) {
        const available = this.availableSkills.filter(skill => {
            // Don't offer skills already at max level
            const existing = this.findSkill(skill.id);
            if (existing && existing.level >= existing.maxLevel) {
                return false;
            }
            
            // Check if player level meets skill requirements
            const requiredLevel = this.getSkillRequiredLevel(skill.id);
            return playerLevel >= requiredLevel;
        });
        
        if (available.length <= count) {
            return available;
        }
        
        // Randomly select skills with some bias towards skills player doesn't have
        const choices = [];
        const weights = available.map(skill => {
            const existing = this.findSkill(skill.id);
            return existing ? 1 : 3; // 3x more likely to offer new skills
        });
        
        for (let i = 0; i < count; i++) {
            if (available.length === 0) break;
            
            const totalWeight = weights.reduce((sum, w) => sum + w, 0);
            let random = Math.random() * totalWeight;
            
            let selectedIndex = 0;
            for (let j = 0; j < weights.length; j++) {
                random -= weights[j];
                if (random <= 0) {
                    selectedIndex = j;
                    break;
                }
            }
            
            choices.push(available[selectedIndex]);
            available.splice(selectedIndex, 1);
            weights.splice(selectedIndex, 1);
        }
        
        return choices;
    }

    // Define level requirements for advanced skills
    getSkillRequiredLevel(skillId) {
        const levelRequirements = {
            // Basic skills (available from level 1)
            'heal': 1,
            'damage_boost': 1,
            'speed_boost': 1,
            'shield': 1,
            'explosive_shot': 1,
            'multi_shot': 1,
            'time_slow': 1,
            'auto_repair': 1,
            
            // Advanced skills (require higher levels)
            'freeze_blast': 3,      // Level 3+ for freeze effects
            'lightning_storm': 4,   // Level 4+ for chain lightning
            'fire_nova': 3,         // Level 3+ for DoT effects
            'vortex_field': 5,      // Level 5+ for area control
            'plasma_burst': 4,      // Level 4+ for piercing attacks
            'ice_barrier': 6,       // Level 6+ for defensive structures
            'magnetic_pull': 7,     // Level 7+ for bullet redirection
            'quantum_strike': 8,    // Level 8+ for teleportation
            
            // Passive skills (available from level 1)
            'armor_upgrade': 1,
            'weapon_upgrade': 1,
            'engine_upgrade': 1,
            'rapid_fire': 1,
            'targeting_system': 1,
            'formation_expand': 2   // Level 2+ for formation changes
        };
        
        return levelRequirements[skillId] || 1;
    }

    applyPassiveSkills(player) {
        for (const skill of this.passiveSkills) {
            switch (skill.effect.type) {
                case 'health_increase':
                    const healthBonus = skill.effect.value * skill.level;
                    player.mainTank.maxHealth += healthBonus;
                    for (const miniTank of player.miniTanks) {
                        miniTank.maxHealth += healthBonus * 0.6;
                    }
                    break;
                    
                case 'damage_increase':
                    const damageBonus = skill.effect.value * skill.level;
                    player.mainTank.damage += damageBonus;
                    for (const miniTank of player.miniTanks) {
                        miniTank.damage += damageBonus * 0.8;
                    }
                    break;
                    
                case 'speed_increase':
                    const speedBonus = skill.effect.value * skill.level;
                    player.mainTank.speed += speedBonus;
                    for (const miniTank of player.miniTanks) {
                        miniTank.speed += speedBonus * 0.8;
                    }
                    break;
                    
                case 'cooldown_reduction':
                    const cooldownFactor = Math.pow(skill.effect.value, skill.level);
                    player.mainTank.maxShootCooldown *= cooldownFactor;
                    for (const miniTank of player.miniTanks) {
                        miniTank.maxShootCooldown *= cooldownFactor;
                    }
                    break;
            }
        }
    }

    getSkillInfo() {
        return {
            active: this.activeSkills.map(skill => ({
                id: skill.id,
                name: skill.name,
                shortName: skill.shortName,
                level: skill.level,
                cooldownPercent: skill.getCooldownPercent(),
                isReady: skill.isReady(),
                isActive: skill.isActive,
                emoji: skill.emoji
            })),
            passive: this.passiveSkills.map(skill => ({
                id: skill.id,
                name: skill.name,
                shortName: skill.shortName,
                level: skill.level
            }))
        };
    }

    reset() {
        this.activeSkills = [];
        this.passiveSkills = [];
        this.skillSlots = [null, null, null];
    }

    clearActiveSkills() {
        // Clear active skills for new battle session
        this.activeSkills = [];
        this.skillSlots = [null, null, null];
        console.log('Active skills cleared for new battle');
    }

    saveSkills() {
        const data = {
            // Only save passive skills, not active skills
            // Active skills are temporary and should not be persisted
            passiveSkills: this.passiveSkills.map(skill => ({
                id: skill.id,
                level: skill.level
            }))
        };
        Utils.saveGame('tankAdventure_skills', data);
    }

    loadSkills() {
        const data = Utils.loadGame('tankAdventure_skills');
        if (!data) return;
        
        // Clear active skills first - they should not be persisted
        this.activeSkills = [];
        this.skillSlots = [null, null, null];
        
        // Load only passive skills
        for (const skillData of data.passiveSkills || []) {
            const skill = this.availableSkills.find(s => s.id === skillData.id);
            if (skill) {
                const newSkill = new Skill(
                    skill.id, skill.name, skill.description, skill.type,
                    skill.effect, skill.duration, skill.cooldown, skill.emoji, skill.shortName
                );
                newSkill.level = skillData.level;
                this.passiveSkills.push(newSkill);
            }
        }
        
        // Clean up any legacy active skills from localStorage
        this.cleanupLegacyActiveSkills();
    }
    
    cleanupLegacyActiveSkills() {
        // Remove any active skills that might have been saved in localStorage
        // This ensures a clean transition to the new system
        const data = Utils.loadGame('tankAdventure_skills');
        if (data && data.activeSkills) {
            const cleanData = {
                passiveSkills: data.passiveSkills || []
            };
            Utils.saveGame('tankAdventure_skills', cleanData);
            console.log('Cleaned up legacy active skills from localStorage');
        }
    }
}

// Export for global access
window.Skill = Skill;
window.SkillManager = SkillManager;