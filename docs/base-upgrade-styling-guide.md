# Base & Upgrade Styling Guide

This guide shows how to apply the same styling as the Base & Upgrade section to new components and screens.

## 1. New Upgrade Category

### HTML Structure
```html
<div class="new-upgrade-category">
    <h3>New Category Name</h3>
    <div class="base-style-item">
        <div class="base-style-item-info">
            <div class="base-style-item-name">Feature Name</div>
            <div class="base-style-item-current">Current: Level 5</div>
        </div>
        <button class="base-style-btn">
            <div class="upgrade-cost">$100</div>
            <div class="upgrade-bonus">+10%</div>
        </button>
    </div>
    <!-- More items... -->
</div>
```

### Alternative Button Styles
```html
<!-- Primary (Blue) Button -->
<button class="base-style-btn primary">
    <div class="upgrade-cost">$200</div>
    <div class="upgrade-bonus">Upgrade</div>
</button>

<!-- Success (Green) Button -->
<button class="base-style-btn success">
    <div class="upgrade-cost">Free</div>
    <div class="upgrade-bonus">Unlock</div>
</button>

<!-- Danger (Red) Button -->
<button class="base-style-btn danger">
    <div class="upgrade-cost">$500</div>
    <div class="upgrade-bonus">Reset</div>
</button>

<!-- Disabled Button -->
<button class="base-style-btn" disabled>
    <div class="upgrade-cost">N/A</div>
    <div class="upgrade-bonus">Max</div>
</button>
```

## 2. Apply to Other Screens/Menus

### Full Screen with Base Style
```html
<div id="myNewScreen" class="screen base-style-screen">
    <h2>My New Screen</h2>
    <div class="base-style-content">
        <!-- Your content here -->
    </div>
</div>
```

### Grid Layouts
```html
<!-- Two Column Grid (Default) -->
<div class="base-style-grid">
    <div class="new-upgrade-category">...</div>
    <div class="new-upgrade-category">...</div>
</div>

<!-- Single Column Grid -->
<div class="base-style-grid single-column">
    <div class="new-upgrade-category">...</div>
</div>

<!-- Three Column Grid -->
<div class="base-style-grid three-column">
    <div class="new-upgrade-category">...</div>
    <div class="new-upgrade-category">...</div>
    <div class="new-upgrade-category">...</div>
</div>
```

## 3. Complete Example - New Equipment Screen

```html
<div id="equipmentScreen" class="screen base-style-screen">
    <h2>Equipment & Gear</h2>
    <div class="base-style-content">
        
        <!-- Weapons Section -->
        <div class="base-style-grid">
            <div class="new-upgrade-category">
                <h3>Primary Weapons</h3>
                <div class="base-style-item">
                    <div class="base-style-item-info">
                        <div class="base-style-item-name">Tank Cannon</div>
                        <div class="base-style-item-current">Damage: 50</div>
                    </div>
                    <button class="base-style-btn">
                        <div class="upgrade-cost">$150</div>
                        <div class="upgrade-bonus">+15 DMG</div>
                    </button>
                </div>
                <div class="base-style-item">
                    <div class="base-style-item-info">
                        <div class="base-style-item-name">Machine Gun</div>
                        <div class="base-style-item-current">Rate: 5/s</div>
                    </div>
                    <button class="base-style-btn primary">
                        <div class="upgrade-cost">$80</div>
                        <div class="upgrade-bonus">+1 Rate</div>
                    </button>
                </div>
            </div>
            
            <!-- Armor Section -->
            <div class="new-upgrade-category">
                <h3>Armor & Defense</h3>
                <div class="base-style-item">
                    <div class="base-style-item-info">
                        <div class="base-style-item-name">Hull Armor</div>
                        <div class="base-style-item-current">Defense: 25</div>
                    </div>
                    <button class="base-style-btn success">
                        <div class="upgrade-cost">$200</div>
                        <div class="upgrade-bonus">+10 DEF</div>
                    </button>
                </div>
                <div class="base-style-item">
                    <div class="base-style-item-info">
                        <div class="base-style-item-name">Shield Generator</div>
                        <div class="base-style-item-current">Shield: 100</div>
                    </div>
                    <button class="base-style-btn" disabled>
                        <div class="upgrade-cost">MAX</div>
                        <div class="upgrade-bonus">100%</div>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Special Equipment (Single Column) -->
        <div class="base-style-grid single-column">
            <div class="new-upgrade-category">
                <h3>Special Equipment</h3>
                <div class="base-style-item">
                    <div class="base-style-item-info">
                        <div class="base-style-item-name">Radar System</div>
                        <div class="base-style-item-current">Range: 500m</div>
                    </div>
                    <button class="base-style-btn danger">
                        <div class="upgrade-cost">$1000</div>
                        <div class="upgrade-bonus">+200m</div>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Action Buttons -->
        <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
            <button class="menu-btn">Save Changes</button>
            <button class="menu-btn">Reset All</button>
            <button class="menu-btn">Back to Base</button>
        </div>
    </div>
</div>
```

## 4. CSS Classes Reference

### Screen Structure
- `.base-style-screen` - Apply to screen containers
- `.base-style-content` - Apply to content containers (max-width: 800px, centered)

### Grid Layouts
- `.base-style-grid` - Default 2-column grid
- `.base-style-grid.single-column` - Single column layout
- `.base-style-grid.three-column` - Three column layout

### Categories & Items
- `.new-upgrade-category` - Container for upgrade categories
- `.base-style-item` - Individual item rows
- `.base-style-item-info` - Info section of items
- `.base-style-item-name` - Item name styling
- `.base-style-item-current` - Current value styling

### Buttons
- `.base-style-btn` - Default orange/warning button
- `.base-style-btn.primary` - Blue button
- `.base-style-btn.success` - Green button
- `.base-style-btn.danger` - Red button
- Add `disabled` attribute for disabled state

### Button Content
- `.upgrade-cost` - Cost/price text (smaller, top)
- `.upgrade-bonus` - Bonus/action text (larger, bottom)

## 5. Key Features
- **Responsive Design**: Automatically adapts to mobile devices
- **Touch Optimized**: All buttons include touch support for iPhone Safari
- **Hover Effects**: Smooth animations and color transitions
- **Consistent Styling**: Matches the existing Base & Upgrade design
- **Accessible**: Proper contrast and disabled states
- **Flexible Layouts**: Multiple grid options for different content needs

## 6. Mobile Considerations
- All buttons include proper touch-action and webkit optimizations
- Grid layouts automatically adapt on smaller screens
- Hover effects work on both desktop and touch devices
- Consistent 20px spacing throughout for comfortable touch targets