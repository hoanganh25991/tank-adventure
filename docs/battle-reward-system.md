# Battle Reward System

## Overview

The Tank Adventure game features a dynamic reward system that scales based on battle type and completion status. This document outlines how rewards are calculated and displayed to the player.

## Battle Types and Reward Multipliers

The game offers three battle types, each with different wave counts and reward structures:

| Battle Type | Waves | Base Multiplier | Completion Bonus | Total Potential Multiplier |
|-------------|-------|----------------|-----------------|----------------------------|
| Quick       | 3     | 1.0x           | 1.3x            | 1.3x                       |
| Standard    | 5     | 1.2x           | 1.5x            | 1.8x                       |
| Extended    | 10    | 1.5x           | 2.0x            | 3.0x                       |

## How Rewards Are Calculated

1. **Base Rewards**: During battle, players earn base rewards for defeating enemies:
   - Score: Based on enemy value
   - Experience: Typically half of the enemy's score value
   - Coins: Calculated as score ÷ 4

2. **Base Multiplier**: Applied to all rewards based on battle type:
   - Quick: No additional multiplier (1.0x)
   - Standard: 20% bonus (1.2x)
   - Extended: 50% bonus (1.5x)

3. **Completion Bonus**: Applied only when the player completes all waves:
   - Quick: 30% bonus (1.3x)
   - Standard: 50% bonus (1.5x)
   - Extended: 100% bonus (2.0x)

4. **Final Calculation**:
   ```
   Final Reward = Base Reward × Base Multiplier × Completion Bonus
   ```

## Implementation Details

The reward system is implemented in the following files:

- `game-engine.js`: Contains the core reward calculation logic in the `endBattle()` method
- `ui.js`: Displays the reward information to the player in battle selection and results screens

## Reward Display

1. **Battle Selection Screen**: Shows potential rewards for each battle type
2. **Battle Results Screen**: Displays the actual rewards earned, including any applied bonuses

## Rationale

The progressive reward structure encourages players to attempt more challenging battles:

- **Quick Battles**: Fast gameplay with modest rewards
- **Standard Battles**: Balanced difficulty and rewards
- **Extended Battles**: Higher difficulty with significantly increased rewards

This system ensures that the extended battle type, which requires more time and effort to complete, provides proportionally higher rewards to compensate players for the additional challenge.

```
┌─────────────────┐
│                 │
│  Quick Battle   │──────┐
│  (3 Waves)      │      │
│                 │      │
└─────────────────┘      │     ┌─────────────────┐
                         │     │                 │
┌─────────────────┐      │     │  Battle Results │
│                 │      │     │                 │
│ Standard Battle │──────┼────▶│  • Score        │
│  (5 Waves)      │      │     │  • Experience   │
│                 │      │     │  • Coins        │
└─────────────────┘      │     │                 │
                         │     └─────────────────┘
┌─────────────────┐      │
│                 │      │
│ Extended Battle │──────┘
│  (10 Waves)     │
│                 │
└─────────────────┘
```