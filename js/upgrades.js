// Upgrades System

class Upgrade {
    constructor(id, name, description, category, baseValue, baseCost, costMultiplier = 1.5) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category; // 'main', 'mini', 'economy', 'special'
        this.baseValue = baseValue;
        this.baseCost = baseCost;
        this.costMultiplier = costMultiplier;
        this.level = 0;
        this.maxLevel = 20;
    }

    getCurrentCost() {
        return Math.floor(this.baseCost * Math.pow(this.costMultiplier, this.level));
    }

    getCurrentValue() {
        return this.baseValue * (this.level + 1);
    }

    getNextValue() {
        return this.baseValue * (this.level + 2);
    }

    canUpgrade(coins) {
        return this.level < this.maxLevel && coins >= this.getCurrentCost();
    }

    upgrade() {
        if (this.level < this.maxLevel) {
            this.level++;
            return true;
        }
        return false;
    }

    getUpgradeInfo() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category,
            level: this.level,
            maxLevel: this.maxLevel,
            currentValue: this.getCurrentValue(),
            nextValue: this.getNextValue(),
            cost: this.getCurrentCost(),
            canUpgrade: this.level < this.maxLevel
        };
    }
}

class UpgradeManager {
    constructor() {
        this.upgrades = this.createUpgrades();
        this.loadUpgrades();
    }

    createUpgrades() {
        const upgrades = {};
        
        // Main Tank Upgrades
        upgrades.mainHealth = new Upgrade(
            'mainHealth',
            'Main Tank Armor',
            'Increase main tank maximum health',
            'main',
            20, // +20 health per level
            100, // Base cost
            1.4
        );
        
        upgrades.mainDamage = new Upgrade(
            'mainDamage',
            'Main Tank Cannon',
            'Increase main tank damage output',
            'main',
            5, // +5 damage per level
            150,
            1.5
        );
        
        upgrades.mainSpeed = new Upgrade(
            'mainSpeed',
            'Main Tank Engine',
            'Increase main tank movement speed',
            'main',
            0.3, // +0.3 speed per level
            200,
            1.6
        );
        
        upgrades.mainFireRate = new Upgrade(
            'mainFireRate',
            'Main Tank Auto-loader',
            'Decrease main tank shooting cooldown',
            'main',
            0.9, // Multiply cooldown by 0.9 per level
            250,
            1.5
        );
        
        // Mini Tank Upgrades
        upgrades.miniHealth = new Upgrade(
            'miniHealth',
            'Mini Tank Armor',
            'Increase mini tank maximum health',
            'mini',
            10, // +10 health per level
            80,
            1.4
        );
        
        upgrades.miniDamage = new Upgrade(
            'miniDamage',
            'Mini Tank Weapons',
            'Increase mini tank damage output',
            'mini',
            2, // +2 damage per level
            120,
            1.5
        );
        
        upgrades.miniSpeed = new Upgrade(
            'miniSpeed',
            'Mini Tank Mobility',
            'Increase mini tank movement speed',
            'mini',
            0.2, // +0.2 speed per level
            150,
            1.5
        );
        
        upgrades.miniFireRate = new Upgrade(
            'miniFireRate',
            'Mini Tank Coordination',
            'Decrease mini tank auto-shoot interval',
            'mini',
            0.9, // Multiply interval by 0.9 per level
            180,
            1.5
        );
        
        // Formation Upgrades
        upgrades.formation = new Upgrade(
            'formation',
            'Formation Tactics',
            'Add additional mini tank (max 8)',
            'special',
            1, // +1 mini tank per level (max 3 additional)
            500,
            2.0
        );
        
        upgrades.coordination = new Upgrade(
            'coordination',
            'Squad Coordination',
            'Improve formation movement and response',
            'special',
            0.1, // +10% coordination per level
            300,
            1.7
        );
        
        // Economy Upgrades
        upgrades.coinBonus = new Upgrade(
            'coinBonus',
            'Salvage Operations',
            'Increase coins earned from enemies',
            'economy',
            0.1, // +10% coins per level
            200,
            1.6
        );
        
        upgrades.expBonus = new Upgrade(
            'expBonus',
            'Combat Experience',
            'Increase experience gained from battles',
            'economy',
            0.1, // +10% experience per level
            250,
            1.6
        );
        
        // Special Upgrades
        upgrades.bulletSpeed = new Upgrade(
            'bulletSpeed',
            'Kinetic Accelerator',
            'Increase bullet speed and range',
            'special',
            1, // +1 bullet speed per level
            300,
            1.5
        );
        
        upgrades.autoRepair = new Upgrade(
            'autoRepair',
            'Self-Repair Systems',
            'Slowly regenerate health during battle',
            'special',
            0.5, // +0.5 health per second per level
            400,
            1.8
        );
        
        upgrades.shield = new Upgrade(
            'shield',
            'Energy Shield',
            'Add shield that absorbs damage',
            'special',
            15, // +15 shield points per level
            600,
            1.9
        );
        
        upgrades.multiShot = new Upgrade(
            'multiShot',
            'Multi-Barrel System',
            'Chance to fire additional bullets',
            'special',
            0.1, // +10% chance per level
            800,
            2.0
        );
        
        return upgrades;
    }

    getUpgrade(id) {
        return this.upgrades[id];
    }

    getAllUpgrades() {
        return Object.values(this.upgrades);
    }

    getUpgradesByCategory(category) {
        return Object.values(this.upgrades).filter(upgrade => upgrade.category === category);
    }

    canUpgrade(id, coins) {
        const upgrade = this.upgrades[id];
        return upgrade ? upgrade.canUpgrade(coins) : false;
    }

    upgradeItem(id, player) {
        const upgrade = this.upgrades[id];
        if (!upgrade || !upgrade.canUpgrade(player.coins)) {
            return false;
        }
        
        const cost = upgrade.getCurrentCost();
        player.coins -= cost;
        upgrade.upgrade();
        
        // Apply the upgrade effect
        this.applyUpgrade(id, upgrade, player);
        
        this.saveUpgrades();
        return true;
    }

    applyUpgrade(id, upgrade, player) {
        const value = upgrade.baseValue;
        
        switch (id) {
            case 'mainHealth':
                player.mainTank.maxHealth += value;
                player.mainTank.health += value; // Also heal
                break;
                
            case 'mainDamage':
                player.mainTank.damage += value;
                break;
                
            case 'mainSpeed':
                player.mainTank.speed += value;
                break;
                
            case 'mainFireRate':
                player.mainTank.maxShootCooldown = Math.floor(player.mainTank.maxShootCooldown * value);
                break;
                
            case 'miniHealth':
                for (const miniTank of player.miniTanks) {
                    miniTank.maxHealth += value;
                    miniTank.health += value; // Also heal
                }
                break;
                
            case 'miniDamage':
                for (const miniTank of player.miniTanks) {
                    miniTank.damage += value;
                }
                break;
                
            case 'miniSpeed':
                for (const miniTank of player.miniTanks) {
                    miniTank.speed += value;
                }
                break;
                
            case 'miniFireRate':
                player.autoShootInterval = Math.floor(player.autoShootInterval * value);
                break;
                
            case 'formation':
                // Add additional mini tank (up to 3 more)
                if (player.miniTanks.length < 8) {
                    this.addMiniTank(player);
                }
                break;
                
            case 'coordination':
                // Improve formation response (handled in player movement)
                player.coordinationBonus = (player.coordinationBonus || 0) + value;
                break;
                
            case 'coinBonus':
                player.coinMultiplier = (player.coinMultiplier || 1) + value;
                break;
                
            case 'expBonus':
                player.expMultiplier = (player.expMultiplier || 1) + value;
                break;
                
            case 'bulletSpeed':
                // Applied when bullets are created
                break;
                
            case 'autoRepair':
                player.autoRepairRate = (player.autoRepairRate || 0) + value;
                break;
                
            case 'shield':
                player.shieldPoints = (player.shieldPoints || 0) + value;
                player.maxShieldPoints = (player.maxShieldPoints || 0) + value;
                break;
                
            case 'multiShot':
                player.multiShotChance = (player.multiShotChance || 0) + value;
                break;
        }
    }

    addMiniTank(player) {
        const mainTank = player.mainTank;
        const existingCount = player.miniTanks.length;
        
        // Calculate position for new mini tank
        const angle = (existingCount * Math.PI * 2) / 8; // Distribute around circle
        const distance = 80;
        const x = mainTank.x + Math.cos(angle) * distance;
        const y = mainTank.y + Math.sin(angle) * distance;
        
        const newMiniTank = new Tank(x, y, 'mini');
        
        // Apply existing upgrades to new mini tank
        const miniHealthUpgrade = this.upgrades.miniHealth;
        const miniDamageUpgrade = this.upgrades.miniDamage;
        const miniSpeedUpgrade = this.upgrades.miniSpeed;
        
        if (miniHealthUpgrade.level > 0) {
            newMiniTank.maxHealth += miniHealthUpgrade.getCurrentValue() - miniHealthUpgrade.baseValue;
            newMiniTank.health = newMiniTank.maxHealth;
        }
        
        if (miniDamageUpgrade.level > 0) {
            newMiniTank.damage += miniDamageUpgrade.getCurrentValue() - miniDamageUpgrade.baseValue;
        }
        
        if (miniSpeedUpgrade.level > 0) {
            newMiniTank.speed += miniSpeedUpgrade.getCurrentValue() - miniSpeedUpgrade.baseValue;
        }
        
        player.miniTanks.push(newMiniTank);
    }

    applyAllUpgrades(player) {
        // Apply all upgrades to a player (used when loading game)
        for (const [id, upgrade] of Object.entries(this.upgrades)) {
            if (upgrade.level > 0) {
                // Apply upgrade multiple times based on level
                for (let i = 0; i < upgrade.level; i++) {
                    this.applyUpgrade(id, upgrade, player);
                }
            }
        }
    }

    getUpgradeEffect(id, level = null) {
        const upgrade = this.upgrades[id];
        if (!upgrade) return null;
        
        const effectLevel = level !== null ? level : upgrade.level;
        const totalEffect = upgrade.baseValue * effectLevel;
        
        switch (id) {
            case 'mainHealth':
            case 'miniHealth':
                return `+${totalEffect} Health`;
                
            case 'mainDamage':
            case 'miniDamage':
                return `+${totalEffect.toFixed(0)} Damage`;
                
            case 'mainSpeed':
            case 'miniSpeed':
                return `+${totalEffect.toFixed(1)} Speed`;
                
            case 'mainFireRate':
            case 'miniFireRate':
                const reduction = Math.round((1 - Math.pow(upgrade.baseValue, effectLevel)) * 100);
                return `-${reduction}% Cooldown`;
                
            case 'formation':
                return `+${Math.min(effectLevel, 3)} Mini Tanks`;
                
            case 'coordination':
                return `+${(totalEffect * 100).toFixed(0)}% Coordination`;
                
            case 'coinBonus':
            case 'expBonus':
                return `+${(totalEffect * 100).toFixed(0)}% Bonus`;
                
            case 'bulletSpeed':
                return `+${totalEffect} Bullet Speed`;
                
            case 'autoRepair':
                return `${totalEffect.toFixed(1)} HP/sec`;
                
            case 'shield':
                return `+${totalEffect} Shield`;
                
            case 'multiShot':
                return `${(totalEffect * 100).toFixed(0)}% Multi-Shot`;
                
            default:
                return `Level ${effectLevel}`;
        }
    }

    getUpgradePreview(id) {
        const upgrade = this.upgrades[id];
        if (!upgrade) return null;
        
        return {
            current: this.getUpgradeEffect(id),
            next: upgrade.level < upgrade.maxLevel ? this.getUpgradeEffect(id, upgrade.level + 1) : null,
            cost: upgrade.getCurrentCost(),
            canUpgrade: upgrade.level < upgrade.maxLevel
        };
    }

    getTotalInvestment() {
        let total = 0;
        for (const upgrade of Object.values(this.upgrades)) {
            for (let i = 0; i < upgrade.level; i++) {
                total += Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, i));
            }
        }
        return total;
    }

    getUpgradeStats() {
        const categories = ['main', 'mini', 'special', 'economy'];
        const stats = {};
        
        for (const category of categories) {
            const categoryUpgrades = this.getUpgradesByCategory(category);
            stats[category] = {
                totalLevels: categoryUpgrades.reduce((sum, upgrade) => sum + upgrade.level, 0),
                maxLevels: categoryUpgrades.reduce((sum, upgrade) => sum + upgrade.maxLevel, 0),
                totalCost: categoryUpgrades.reduce((sum, upgrade) => {
                    let cost = 0;
                    for (let i = 0; i < upgrade.level; i++) {
                        cost += Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, i));
                    }
                    return sum + cost;
                }, 0)
            };
        }
        
        return stats;
    }

    reset() {
        for (const upgrade of Object.values(this.upgrades)) {
            upgrade.level = 0;
        }
        this.saveUpgrades();
    }

    saveUpgrades() {
        const data = {};
        for (const [id, upgrade] of Object.entries(this.upgrades)) {
            data[id] = upgrade.level;
        }
        Utils.saveGame('tankAdventure_upgrades', data);
    }

    loadUpgrades() {
        const data = Utils.loadGame('tankAdventure_upgrades');
        if (!data) return;
        
        for (const [id, level] of Object.entries(data)) {
            if (this.upgrades[id]) {
                this.upgrades[id].level = Math.min(level, this.upgrades[id].maxLevel);
            }
        }
    }

    // Helper method to get recommended upgrades based on player stats
    getRecommendedUpgrades(player, count = 3) {
        const available = Object.values(this.upgrades).filter(upgrade => 
            upgrade.canUpgrade(player.coins)
        );
        
        if (available.length === 0) return [];
        
        // Score upgrades based on usefulness
        const scoredUpgrades = available.map(upgrade => {
            let score = 0;
            
            // Prioritize low-level upgrades
            score += (upgrade.maxLevel - upgrade.level) / upgrade.maxLevel * 10;
            
            // Prioritize affordable upgrades
            const affordability = player.coins / upgrade.getCurrentCost();
            score += Math.min(affordability, 5);
            
            // Category-based scoring
            switch (upgrade.category) {
                case 'main':
                    score += player.mainTank.health < player.mainTank.maxHealth * 0.8 ? 5 : 2;
                    break;
                case 'mini':
                    score += player.miniTanks.some(tank => tank.health < tank.maxHealth * 0.8) ? 4 : 2;
                    break;
                case 'special':
                    score += 3;
                    break;
                case 'economy':
                    score += 1;
                    break;
            }
            
            return { upgrade, score };
        });
        
        // Sort by score and return top recommendations
        scoredUpgrades.sort((a, b) => b.score - a.score);
        return scoredUpgrades.slice(0, count).map(item => item.upgrade);
    }
}

// Export for global access
window.Upgrade = Upgrade;
window.UpgradeManager = UpgradeManager;