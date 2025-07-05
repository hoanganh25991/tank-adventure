# Advanced Skills System

## Overview
The Tank Adventure game now features an expanded skill system with 8 new advanced active skills designed for long-term gameplay engagement. These skills unlock at higher levels to provide progression and help balance the game as enemies become stronger.

## New Advanced Skills

### ❄️ Freeze Blast (Level 3+)
**Short Name:** FREEZE  
**Cooldown:** 22 seconds  
**Duration:** 8 seconds  
**Effect:** Freezes and slows all enemies by 70% for 8 seconds, with initial 2-second complete freeze
- **Visual:** Icy blue particles and screen flash
- **Strategy:** Perfect for crowd control when overwhelmed
- **Scaling:** Freeze duration increases with level

### ⚡ Lightning Storm (Level 4+)
**Short Name:** BOLT  
**Cooldown:** 18 seconds  
**Duration:** Instant  
**Effect:** Chain lightning jumps between up to 3 enemies, dealing 25 damage each
- **Visual:** Bright yellow lightning chains with crackling effects
- **Strategy:** Excellent for grouped enemies
- **Scaling:** Damage increases 20% per level

### 🔥 Fire Nova (Level 3+)
**Short Name:** NOVA  
**Cooldown:** 16 seconds  
**Duration:** Instant + 5s DoT  
**Effect:** Spreads fire in 120-unit radius, dealing initial damage plus burning DoT
- **Visual:** Intense red/orange explosion with burning particles
- **Strategy:** Great for area denial and sustained damage
- **Scaling:** Initial damage increases 15% per level

### 🌀 Vortex Field (Level 5+)
**Short Name:** VORTEX  
**Cooldown:** 20 seconds  
**Duration:** 6 seconds  
**Effect:** Creates a vortex that pulls enemies together and damages them continuously
- **Visual:** Swirling purple vortex with particle effects
- **Strategy:** Powerful crowd control and positioning tool
- **Scaling:** Pull force and damage increase with level

### 💎 Plasma Burst (Level 4+)
**Short Name:** PLASMA  
**Cooldown:** 14 seconds  
**Duration:** Instant  
**Effect:** Fires a high-damage energy wave that pierces through enemies
- **Visual:** Bright cyan energy wave with trailing particles
- **Strategy:** Perfect for clearing enemy lines
- **Scaling:** Damage increases 25% per level

### 🧊 Ice Barrier (Level 6+)
**Short Name:** WALL  
**Cooldown:** 25 seconds  
**Duration:** 12 seconds  
**Effect:** Creates 6 protective ice walls around the player that absorb damage
- **Visual:** Translucent ice barriers with frosty effects
- **Strategy:** Ultimate defensive skill for survival
- **Scaling:** Barrier health increases with level

### 🧲 Magnetic Field (Level 7+)
**Short Name:** MAGNET  
**Cooldown:** 19 seconds  
**Duration:** 10 seconds  
**Effect:** Attracts and redirects enemy bullets within 180-unit range
- **Visual:** Purple magnetic field with swirling particles
- **Strategy:** Turns enemy firepower against them
- **Scaling:** Range and redirect effectiveness increase with level

### ✨ Quantum Strike (Level 8+)
**Short Name:** QUANTUM  
**Cooldown:** 30 seconds  
**Duration:** Instant  
**Effect:** Teleports behind target enemy and deals 60 damage, plus AoE damage
- **Visual:** Bright white portals with quantum effects
- **Strategy:** Ultimate offensive skill for high-value targets
- **Scaling:** Damage increases 30% per level

## Level-Based Progression

### Early Game (Levels 1-2)
- Basic skills available: Heal, Damage Boost, Speed Boost, Shield
- Focus on learning core mechanics
- Formation Expand unlocks at level 2

### Mid Game (Levels 3-5)
- Advanced crowd control: Freeze Blast, Fire Nova
- Chain attacks: Lightning Storm
- Area control: Vortex Field (level 5)
- Increased enemy difficulty requires strategic skill use

### Late Game (Levels 6-8)
- Defensive mastery: Ice Barrier
- Bullet manipulation: Magnetic Field
- Ultimate abilities: Quantum Strike
- Complex enemy patterns require advanced tactics

## Auto-Cast Intelligence

The AI system automatically casts skills based on combat situations:

### Defensive Skills
- **Freeze Blast:** When 6+ enemies present OR health < 30%
- **Ice Barrier:** When health < 40%
- **Magnetic Field:** When 8+ enemies present

### Offensive Skills
- **Lightning Storm:** When 4+ enemies present
- **Fire Nova:** When 5+ enemies present
- **Plasma Burst:** When 3+ enemies present
- **Vortex Field:** When 7+ enemies present

### Ultimate Skills
- **Quantum Strike:** When 10+ enemies present OR health < 20%

## Visual Effects System

Each skill features a three-phase visual system:

1. **Cast Phase:** Dramatic particles, screen flash, and screen shake
2. **During Phase:** Continuous aura and particle effects
3. **Exit Phase:** Dissipating effects and cleanup

### Special Effects
- **Lightning Storm:** Animated lightning chains between enemies
- **Plasma Burst:** Expanding energy wave visualization
- **Quantum Strike:** Portal effects showing teleportation

## Balance Considerations

### Cooldown Scaling
- Basic skills: 8-18 seconds
- Advanced skills: 14-25 seconds
- Ultimate skills: 30+ seconds

### Damage Scaling
- All skills scale with level (15-30% increases)
- Damage balanced against enemy strength progression
- Utility skills provide non-damage benefits

### Resource Management
- No mana/energy system - only cooldowns
- Encourages strategic timing over spam
- Auto-cast prevents skill waste

## Implementation Notes

### Skills System (`js/skills.js`)
- Added 8 new skill definitions with short names
- Implemented level-based unlocking system
- Enhanced auto-cast intelligence
- Added complex effect implementations

### Visual Effects (`js/skill-effects.js`)
- Comprehensive visual effects for all new skills
- Special rendering for complex effects
- Performance-optimized particle systems
- Consistent visual language across skills

### Integration Points
- Game engine integration for effect rendering
- Player system integration for skill effects
- Enemy system integration for status effects
- UI system integration for cooldown display

## Future Enhancements

### Potential Additions
- **Skill Trees:** Branching upgrade paths
- **Skill Combinations:** Synergy effects between skills
- **Legendary Skills:** Ultra-rare, game-changing abilities
- **Skill Customization:** Player-chosen modifications

### Advanced Features
- **Skill Loadouts:** Pre-configured skill sets
- **Skill Mastery:** Bonus effects for frequently used skills
- **Conditional Skills:** Skills that activate under specific conditions
- **Skill Evolution:** Skills that transform at high levels

This advanced skills system provides depth, progression, and strategic gameplay while maintaining the fast-paced action that makes Tank Adventure engaging.