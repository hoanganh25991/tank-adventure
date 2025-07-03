# Skill Effects System

## Overview
The skill effects system provides comprehensive visual feedback for skill usage in Tank Adventure. Each skill has unique effects across three distinct phases: Cast, During, and Exit.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Skill Effects System                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ Cast Phase  │    │During Phase │    │ Exit Phase  │        │
│  │             │    │             │    │             │        │
│  │ • Particles │    │ • Auras     │    │ • Particles │        │
│  │ • Flash     │    │ • Particles │    │ • Sound     │        │
│  │ • Sound     │    │ • Cont. FX  │    │ • Cleanup   │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                                │
├─────────────────────────────────────────────────────────────────┤
│                     Visual Components                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Canvas Effects (World Space)                               │ │
│  │ • Particle Systems                                         │ │
│  │ • Aura Effects around Player                              │ │
│  │ • Screen Flash Overlays                                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ HTML/CSS Effects (Screen Space)                           │ │
│  │ • Full-screen Flash Effects                               │ │
│  │ • Button Feedback Animations                              │ │
│  │ • Screen Shake Effects                                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Phase Details

### Cast Phase
- **Triggers**: When skill is activated
- **Effects**: 
  - Burst of particles from player position
  - Screen flash with skill-specific color
  - Sound effect (if audio system available)
- **Duration**: 200-600ms depending on skill

### During Phase
- **Triggers**: While skill is active (for duration-based skills)
- **Effects**:
  - Continuous aura around player tanks
  - Periodic particle emissions
  - Pulsing visual effects
- **Duration**: Entire skill duration

### Exit Phase
- **Triggers**: When skill effect ends
- **Effects**:
  - Final particle burst
  - Exit sound effect
  - Effect cleanup
- **Duration**: 200-500ms

## Skill-Specific Effects

### Heal (Emergency Repair)
- **Color**: Green (#00ff44)
- **Cast**: 20 green particles, gentle flash
- **During**: Green aura, small healing particles
- **Exit**: Soft green particle burst

### Damage Boost (Combat Overdrive)
- **Color**: Red (#ff4444)
- **Cast**: 25 red particles, intense flash
- **During**: Red pulsing aura, aggressive particles
- **Exit**: Dramatic red particle explosion

### Speed Boost (Nitro Boost)
- **Color**: Blue (#44aaff)
- **Cast**: 30 fast blue particles, quick flash
- **During**: Blue aura, rapid particle streams
- **Exit**: Speed trail effect

### Shield (Energy Shield)
- **Color**: Orange (#ffaa44)
- **Cast**: 35 protective particles, strong flash
- **During**: Steady orange aura, protective particles
- **Exit**: Shield dissipation effect

### Explosive Shot
- **Color**: Orange-Red (#ff6600)
- **Cast**: 40 explosive particles, powerful flash
- **During**: Orange aura, explosive particles
- **Exit**: Explosive particle burst

### Multi-Shot
- **Color**: Purple (#aa44ff)
- **Cast**: 45 multi-colored particles, rapid flash
- **During**: Purple aura, multiple particle streams
- **Exit**: Multi-directional particle burst

### Time Slow
- **Color**: Cyan (#44ffff)
- **Cast**: 50 slow-moving particles, long flash
- **During**: Cyan aura, slow particle effects
- **Exit**: Time ripple effect

### Auto Repair
- **Color**: Yellow (#ffff44)
- **Cast**: 25 repair particles, moderate flash
- **During**: Yellow aura, repair particles
- **Exit**: Gentle repair completion effect

## Technical Implementation

### File Structure
```
js/
├── skill-effects.js     # Main effects system
├── skills.js           # Modified to integrate effects
└── game-engine.js      # Modified to render effects

css/
└── game.css           # Enhanced with skill effect styles
```

### Integration Points
1. **Skill Activation**: Effects trigger when skills are cast
2. **Update Loop**: Continuous effects updated every frame
3. **Render Loop**: Effects rendered in world and screen space
4. **HTML Integration**: Flash effects use HTML overlays for better mobile visibility

### Performance Considerations
- Particle pooling for efficient memory usage
- Effect culling based on distance and importance
- Optimized rendering with proper alpha blending
- Automatic cleanup of finished effects

## Usage Examples

### Manual Skill Casting
```javascript
// Cast skill and trigger effects
skillManager.manualCastSkill(0, player, enemies);
// Effects automatically triggered through integration
```

### Auto-Cast with Effects
```javascript
// Auto-cast system includes effects
skillManager.autoCastSkills(player, enemies);
// All effects handled automatically
```

### Custom Effect Triggering
```javascript
// Direct effect triggering (advanced usage)
skillEffects.triggerCastEffect('heal', playerX, playerY);
skillEffects.startDuringEffect('heal', skill);
skillEffects.triggerExitEffect('heal', playerX, playerY);
```

## Future Enhancements

### Planned Features
1. **Sound Integration**: Full audio effects system
2. **Screen Shake**: Camera shake effects for impact
3. **Combo Effects**: Special effects for skill combinations
4. **Customizable Intensity**: Player-configurable effect intensity
5. **Mobile Optimization**: Enhanced touch feedback

### Advanced Effects
1. **Particle Trails**: Persistent particle trails for movement skills
2. **Area Effects**: Ground-based effect indicators
3. **Chain Effects**: Effects that propagate between targets
4. **Environmental Effects**: Skills that affect the battlefield visually

## Browser Compatibility
- **Desktop**: Full effects support on all modern browsers
- **Mobile**: Optimized for iOS Safari and Chrome mobile
- **Performance**: Graceful degradation on lower-end devices
- **Touch**: Enhanced visual feedback for touch interfaces