# Enemy Scaling System

This document describes the enhanced enemy scaling system that makes enemies spawn more frequently and become stronger over time.

## Overview

The enemy scaling system consists of several components that work together to increase difficulty as waves progress:

1. **Enemy Stat Scaling** - Individual enemy stats increase with wave number
2. **Spawn Rate Scaling** - Enemies spawn more frequently in higher waves
3. **Enemy Count Scaling** - More enemies spawn per wave
4. **Burst Spawning** - Additional enemy bursts in higher waves
5. **Enemy Type Distribution** - More dangerous enemy types appear more frequently

## Scaling Mechanics

### 1. Enemy Stat Scaling

Each enemy's stats are multiplied by scaling factors based on the current wave:

- **Health Scaling**: 15% increase per wave
- **Damage Scaling**: 12% increase per wave  
- **Speed Scaling**: 8% increase per wave (with caps)
- **Value Scaling**: 10% increase per wave

```javascript
const healthScaling = 1 + (wave - 1) * 0.15;
const damageScaling = 1 + (wave - 1) * 0.12;
const speedScaling = 1 + (wave - 1) * 0.08;
const valueScaling = 1 + (wave - 1) * 0.1;
```

### 2. Spawn Rate Scaling

Enemies spawn faster as waves progress:

- **Base Spawn Interval**: 1800ms (1.8 seconds)
- **Reduction per Wave**: 100ms
- **Minimum Interval**: 200ms

```javascript
this.spawnInterval = Math.max(
    baseSpawnInterval - (waveNumber * reductionPerWave),
    minimumInterval
);
```

### 3. Enemy Count Scaling

The number of enemies per wave increases exponentially:

- **Base Enemies**: 8
- **Exponential Factor**: 1.4^(wave-1)
- **Linear Factor**: wave * 4
- **Maximum Cap**: 80 enemies

```javascript
const baseEnemies = 8;
const exponentialFactor = Math.pow(1.4, waveNumber - 1);
const linearFactor = waveNumber * 4;

this.totalEnemiesInWave = Math.min(
    Math.floor(baseEnemies + exponentialFactor + linearFactor),
    80
);
```

### 4. Burst Spawning

Starting from wave 5, enemies spawn in bursts:

- **Activation**: Wave 5+
- **Burst Interval**: Every 8 seconds
- **Burst Count**: Up to 8 enemies (scales with wave)
- **Enemy Types**: Favors aggressive types (fast, heavy, sniper, boss)

### 5. Enemy Type Distribution

Enemy type probabilities change with wave progression:

#### Normal Spawning
- **Basic**: 50% → 10% (decreases by 4% per wave)
- **Heavy**: 15% → 45% (increases by 4% per wave)
- **Fast**: 25% → 35% (increases by 3% per wave)
- **Sniper**: 10% → 35% (increases by 2.5% per wave)
- **Boss**: Special rules (every 5th wave + random chance)

#### Burst Spawning
- **Fast**: 40% → 60% (high mobility)
- **Heavy**: 30% → 50% (high damage)
- **Sniper**: 20% → 40% (long range)
- **Boss**: 10% → 30% (ultimate challenge)

## Visual Indicators

Enemies have visual indicators showing their enhancement level:

- **Wave 4+**: Golden enhancement ring
- **Wave 10+**: Additional orange ring for elite enemies

## Performance Considerations

- **Max Concurrent Enemies**: 25 (prevents performance issues)
- **Spawn Rate Cap**: 200ms minimum interval
- **Speed Caps**: Prevents enemies from becoming too fast to track

## Balancing Notes

The scaling system is designed to:

1. **Maintain Early Game Accessibility**: Waves 1-3 remain manageable
2. **Provide Mid-Game Challenge**: Waves 4-10 ramp up difficulty
3. **Create Late Game Intensity**: Waves 10+ become extremely challenging
4. **Reward Progression**: Higher enemy values compensate for increased difficulty

## Configuration

All scaling values can be easily adjusted in the `setStatsForType()` method in `enemy.js`:

```javascript
// Adjust these values to fine-tune difficulty
const healthScaling = 1 + (wave - 1) * 0.15;    // Health scaling rate
const damageScaling = 1 + (wave - 1) * 0.12;    // Damage scaling rate
const speedScaling = 1 + (wave - 1) * 0.08;     // Speed scaling rate
const valueScaling = 1 + (wave - 1) * 0.1;      // Reward scaling rate
```

## Wave Progression Example

| Wave | Enemies | Spawn Rate | Basic HP | Basic Damage | Special Features |
|------|---------|------------|----------|--------------|------------------|
| 1    | 12      | 1800ms     | 30       | 8            | Tutorial pace    |
| 3    | 20      | 1600ms     | 39       | 10           | Ramping up       |
| 5    | 33      | 1300ms     | 48       | 12           | Burst spawning   |
| 8    | 54      | 1000ms     | 66       | 15           | High intensity   |
| 10   | 75      | 800ms      | 75       | 17           | Elite enemies    |
| 15   | 80      | 300ms      | 105      | 22           | Maximum chaos    |

This system ensures that the game remains challenging and engaging throughout extended play sessions while maintaining balanced progression.