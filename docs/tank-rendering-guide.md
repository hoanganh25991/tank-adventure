# Enhanced Tank Rendering System

## Overview
This document describes the enhanced tank rendering system that provides visual distinction between main tanks, mini tanks, and enemy units.

## Tank Types and Colors

### Player Tanks
- **Main Tank**: Blue (`#3498db`)
  - Larger size (radius: 25)
  - Commander hatch for distinction
  - Enhanced detail with turret and gun barrel
  
- **Mini Tanks**: Green (`#2ecc71`)
  - Smaller size (radius: 15)
  - Antenna for distinction
  - Same enhanced detail but smaller scale

### Visual Features

#### All Tanks Include:
- Rectangular tank body with proper proportions
- Tank turret (lighter shade of base color)
- Gun barrel with muzzle flash effects
- Tank treads on sides (darker shade)
- Hit flash effects when damaged
- Collision boxes (debug mode)

#### Type-Specific Features:
- **Main Tank**: Commander hatch (small circle on turret)
- **Mini Tank**: Antenna (small line extending upward)

## Color System

### Base Colors
```javascript
this.colorCache.set('player', '#3498db');     // Blue for main tank
this.colorCache.set('mini_tank', '#2ecc71');  // Green for mini tanks
```

### Color Variations
- **Body**: Base color
- **Turret**: Lightened base color (+10% brightness)
- **Outline**: Darkened base color (-30% brightness)
- **Gun Barrel**: Darkened base color (-20% brightness)
- **Treads**: Darkened base color (-40% brightness)

## Debug Features

### Collision Boxes
- Toggle with `gameEngine.toggleCollisionBoxes()`
- Shows yellow wireframe around tank collision radius
- Useful for collision detection debugging

### Rendering Logs
- First tank render logs details to console
- Includes position, color, and radius information

## Implementation Details

### Enhanced Rendering Function
The `renderTank(tank, color)` function provides:
- Proper rotation based on tank angle
- Proportional sizing based on tank radius
- Visual effects integration
- Debug visualization options

### Integration
- Seamlessly integrates with existing Tank class
- Fallback to original rendering if enhanced system unavailable
- Maintains all existing functionality

## Usage Example

```javascript
// In Tank class draw method
const color = this.type === 'main' ? '#3498db' : '#2ecc71';
gameEngine.renderTank(this, color);
```

## Benefits

1. **Visual Clarity**: Easy distinction between tank types
2. **Enhanced Detail**: More realistic tank appearance
3. **Consistent Styling**: Unified color scheme
4. **Debug Support**: Built-in debugging tools
5. **Backward Compatibility**: Fallback rendering system