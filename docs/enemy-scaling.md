# Enemy Scaling System

## Overview
The enemy scaling system has been redesigned to provide a more balanced gameplay experience based on player level. This ensures that:
1. New players aren't overwhelmed with too many enemies
2. Higher-level players still face appropriate challenges
3. The difficulty curve is smoother and more gradual

## Key Changes

### Wave Size Scaling
- Base enemies per wave reduced from 15 to 5 for easier early waves
- Enemy count now scales with player level using a factor between 0.5 and 1.5
- Wave-based scaling uses a gentler exponential growth (1.3 instead of 1.6)
- Maximum enemies per wave are now capped based on wave number:
  - Waves 1-3: Max 15 enemies
  - Waves 4-6: Max 25 enemies
  - Waves 7-10: Max 40 enemies
  - Waves 11+: Max 60 enemies

### Spawn Rate Adjustments
- Base spawn interval increased from 800ms to 1000ms for less frantic early waves
- Minimum spawn interval increased from 100ms to 200ms
- Simultaneous spawns now scale with player level (higher level = more simultaneous spawns)

### Burst Spawning Improvements
- Burst spawning starts at wave 3 instead of wave 2
- Burst interval increased from 4s to 6s
- Burst count formula adjusted to be less aggressive
- Burst count capped at 8 enemies (down from 15)
- Burst enemy count scales with player level
- Burst enemies spawn further away (400-600 units instead of 300-500)
- Lower-level players get less aggressive enemy types in bursts

### Concurrent Enemy Limits
- Maximum concurrent enemies reduced from 60 to 40
- Actual concurrent enemies now scale with player level: `10 + (level * 2)`
- Bursts only spawn if there's room for at least a few more enemies

## Formula Details

### Enemy Count Calculation
```
baseEnemies = 5
playerLevelFactor = max(0.5, min(1.5, playerLevel / 10))
waveScaling = Math.pow(1.3, waveNumber - 1)
linearFactor = waveNumber * 3
calculatedEnemies = (baseEnemies + waveScaling + linearFactor) * playerLevelFactor
```

### Concurrent Enemy Limit
```
adjustedMaxEnemies = min(10 + floor(playerLevel * 2), maxConcurrentEnemies)
```

### Burst Enemy Count
```
adjustedBurstCount = max(2, floor(burstCount * (0.5 + playerLevel / 20)))
```

## Example Scenarios

### New Player (Level 1, Wave 2)
- ~8-10 total enemies in wave
- Maximum of ~12 concurrent enemies
- No burst spawning yet
- Slower spawn rate

### Mid-Game Player (Level 5, Wave 5)
- ~20-22 total enemies in wave
- Maximum of ~20 concurrent enemies
- Burst spawning with ~4-5 enemies per burst
- Medium spawn rate

### Advanced Player (Level 10, Wave 8)
- ~35-38 total enemies in wave
- Maximum of ~30 concurrent enemies
- Burst spawning with ~6-7 enemies per burst
- Faster spawn rate