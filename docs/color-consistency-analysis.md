# Tank Adventure Color Consistency Analysis

## Current Color Issues Identified

### Inconsistent Screen Backgrounds
1. **Main Menu**: `url('../assets/background.jpg') + gradient(135deg, rgba(26, 42, 58, 0.8), rgba(42, 58, 74, 0.8))`
2. **Settings Screen**: `linear-gradient(135deg, #2a1a3a, #3a2a4a)` - Purple theme
3. **Base Screen**: `linear-gradient(135deg, #3a2a1a, #4a3a2a)` - Brown theme
4. **Battle Results**: `linear-gradient(135deg, #1a3a1a, #2a4a2a)` - Green theme
5. **Skill Selection**: `rgba(0, 0, 0, 0.9)` - Plain black

### Inconsistent Button Colors
1. **Menu buttons**: Blue gradient `#4a9eff → #2a7eff`
2. **Action buttons**: Blue gradient `#4a9eff → #6bb6ff`
3. **Primary shoot**: Red gradient `#ff4444 → #ff6666`
4. **Upgrade buttons**: Orange gradient `#ff9944 → #ffaa66`
5. **Skill options**: Blue border `#4a9eff` with gray background

### Inconsistent Text Colors
1. **Main title**: `#4a9eff` (blue)
2. **Settings title**: `#9a6fff` (purple)
3. **Base title**: `#ff9944` (orange)
4. **Battle results title**: `#44ff44` (green)
5. **Skill selection title**: `#4a9eff` (blue)

## Proposed Color Scheme

### Primary Colors
- **Main Blue**: `#4a9eff` (primary accent)
- **Secondary Blue**: `#2a7eff` (darker shade)
- **Background Dark**: `#1a1a2e` (main background)
- **Background Mid**: `#16213e` (secondary background)

### Screen-Specific Accents (Minimal)
- **Combat/Action**: `#ff4444` (red for danger/combat)
- **Success/Positive**: `#44ff44` (green for success)
- **Warning/Special**: `#ff9944` (orange for upgrades/special)

### Neutral Colors
- **Text Primary**: `#ffffff` (white)
- **Text Secondary**: `#cccccc` (light gray)
- **Border/Frame**: `#444444` (dark gray)
- **Overlay**: `rgba(0, 0, 0, 0.9)` (black overlay)

## Implementation Plan
1. Standardize all screen backgrounds to use the same base gradient
2. Unify button styling across all screens
3. Consistent title colors (main blue for all titles)
4. Standardize container backgrounds and borders
5. Ensure proper contrast and readability