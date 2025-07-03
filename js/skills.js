// Skills System

class Skill {
    constructor(id, name, description, type, effect, duration = 0, cooldown = 0) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type; // 'active' or 'passive'
        this.effect = effect; // Object describing the effect
        this.duration = duration; // For active skills (ms)
        this.cooldown = cooldown; // For active skills (ms)
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
                { type: 'heal', value: 30 }, 0, 8000),
            
            new Skill('damage_boost', 'Combat Overdrive', 'Increases damage for 10 seconds', 'active',
                { type: 'damage_boost', multiplier: 1.5 }, 10000, 15000),
            
            new Skill('speed_boost', 'Nitro Boost', 'Increases movement speed for 8 seconds', 'active',
                { type: 'speed_boost', multiplier: 1.8 }, 8000, 12000),
            
            new Skill('shield', 'Energy Shield', 'Adds temporary shield to all tanks', 'active',
                { type: 'shield', value: 25 }, 15000, 20000),
            
            new Skill('explosive_shot', 'Explosive Rounds', 'Shots explode on impact for 12 seconds', 'active',
                { type: 'explosive_shot', radius: 50, damage: 15 }, 12000, 18000),
            
            new Skill('multi_shot', 'Multi-Cannon', 'Fire multiple shots at once for 10 seconds', 'active',
                { type: 'multi_shot', count: 3 }, 10000, 16000),
            
            new Skill('time_slow', 'Temporal Field', 'Slows all enemies for 6 seconds', 'active',
                { type: 'time_slow', slowFactor: 0.5 }, 6000, 25000),
            
            new Skill('auto_repair', 'Auto-Repair System', 'Gradually repairs tanks for 20 seconds', 'active',
                { type: 'auto_repair', value: 5 }, 20000, 30000),
            
            // Passive Skills
            new Skill('armor_upgrade', 'Reinforced Armor', 'Permanently increases max health', 'passive',
                { type: 'health_increase', value: 20 }),
            
            new Skill('weapon_upgrade', 'Enhanced Weapons', 'Permanently increases damage', 'passive',
                { type: 'damage_increase', value: 3 }),
            
            new Skill('engine_upgrade', 'Improved Engine', 'Permanently increases speed', 'passive',
                { type: 'speed_increase', value: 0.5 }),
            
            new Skill('rapid_fire', 'Rapid Fire System', 'Permanently reduces shoot cooldown', 'passive',
                { type: 'cooldown_reduction', value: 0.8 }),
            
            new Skill('targeting_system', 'Advanced Targeting', 'Increases bullet speed and accuracy', 'passive',
                { type: 'accuracy_boost', value: 1.5 }),
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
            }
            
            if (shouldCast) {
                skill.activate(player, enemies, this.effectsManager);
                break; // Only cast one skill per cycle
            }
        }
    }

    addSkill(skillId) {
        const skillTemplate = this.availableSkills.find(s => s.id === skillId);
        if (!skillTemplate) return false;
        
        // Create a copy of the skill
        const newSkill = new Skill(
            skillTemplate.id,
            skillTemplate.name,
            skillTemplate.description,
            skillTemplate.type,
            skillTemplate.effect,
            skillTemplate.duration,
            skillTemplate.cooldown
        );
        
        if (newSkill.type === 'active') {
            // Add to active skills if there's a slot
            if (this.activeSkills.length < 3) {
                this.activeSkills.push(newSkill);
                this.skillSlots[this.activeSkills.length - 1] = newSkill;
                return true;
            }
        } else {
            // Add passive skill and apply immediately
            this.passiveSkills.push(newSkill);
            return true;
        }
        
        return false;
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

    getRandomSkillChoices(count = 3) {
        const available = this.availableSkills.filter(skill => {
            // Don't offer skills already at max level
            const existing = this.findSkill(skill.id);
            return !existing || existing.level < existing.maxLevel;
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
                level: skill.level,
                cooldownPercent: skill.getCooldownPercent(),
                isReady: skill.isReady(),
                isActive: skill.isActive
            })),
            passive: this.passiveSkills.map(skill => ({
                id: skill.id,
                name: skill.name,
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
                    skill.effect, skill.duration, skill.cooldown
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