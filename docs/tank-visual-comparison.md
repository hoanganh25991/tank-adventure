# Tank Visual Comparison

## Tank Rendering Differences

### Main Tank (Blue - #3498db)
```
     ┌─────────────────────┐
     │                     │
     │      ┌─────────┐     │  ← Tank Body (Blue)
     │      │ ○ ██████│══════  ← Turret (Light Blue) + Gun Barrel
     │      └─────────┘     │    ○ = Commander Hatch
     │                     │
     └─────────────────────┘
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← Tank Treads (Dark Blue)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

### Mini Tank (Green - #2ecc71)
```
     ┌─────────────┐
     │    |        │      ← Antenna
     │    ┌─────┐   │
     │    │ █████│════     ← Tank Body (Green)
     │    └─────┘   │      ← Turret (Light Green) + Gun Barrel
     │             │
     └─────────────┘
     ▓▓▓▓▓▓▓▓▓▓▓▓▓          ← Tank Treads (Dark Green)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## Size Comparison

| Tank Type | Radius | Body Width | Body Height | Features |
|-----------|--------|------------|-------------|----------|
| Main Tank | 25px   | 40px       | 30px        | Commander Hatch |
| Mini Tank | 15px   | 24px       | 18px        | Antenna |

## Visual Effects

### Muzzle Flash
- Yellow glow at gun barrel tip when firing
- Fades over time
- Size proportional to tank size

### Hit Flash
- Red overlay when taking damage
- Semi-transparent effect
- Affects entire tank body

### Health Bars
- Only shown for mini tanks when damaged
- Red background, green foreground
- Positioned above tank

## Color Variations

### Main Tank Colors:
- **Body**: #3498db (Base Blue)
- **Turret**: #5dade2 (Light Blue)
- **Outline**: #2471a3 (Dark Blue)
- **Gun**: #1f4e79 (Darker Blue)
- **Treads**: #1a5276 (Darkest Blue)

### Mini Tank Colors:
- **Body**: #2ecc71 (Base Green)
- **Turret**: #58d68d (Light Green)
- **Outline**: #229954 (Dark Green)
- **Gun**: #1e8449 (Darker Green)
- **Treads**: #196f3d (Darkest Green)

## Debug Visualization

When collision boxes are enabled:
- Yellow wireframe box around each tank
- Shows actual collision detection area
- Useful for debugging movement and combat

## Rotation and Movement

- Tanks rotate smoothly based on direction
- Gun barrel always points in movement/aim direction
- Treads remain aligned with tank body
- All visual elements rotate together as a unit