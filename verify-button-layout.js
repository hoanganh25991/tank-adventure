// Verification script to check button layout
console.log("=== Button Layout Verification ===");

// Check if we're in a browser environment
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Checking button layout...");
        
        const actionButtons = document.getElementById('actionButtons');
        const primaryButton = document.getElementById('primaryShootBtn');
        const skillButtons = document.querySelectorAll('.action-btn.skill');
        
        if (actionButtons && primaryButton && skillButtons.length > 0) {
            const buttons = Array.from(actionButtons.children);
            const primaryIndex = buttons.indexOf(primaryButton);
            const lastIndex = buttons.length - 1;
            
            console.log(`Total buttons: ${buttons.length}`);
            console.log(`Primary button index: ${primaryIndex}`);
            console.log(`Last button index: ${lastIndex}`);
            
            // Check if SHOOT button is at the bottom (last position)
            const shootAtBottom = primaryIndex === lastIndex;
            console.log(`SHOOT button at bottom: ${shootAtBottom ? '✓' : '✗'}`);
            
            // Check button sizes
            const primaryRect = primaryButton.getBoundingClientRect();
            const skillRects = Array.from(skillButtons).map(btn => btn.getBoundingClientRect());
            
            console.log(`Primary button size: ${primaryRect.width}x${primaryRect.height}`);
            skillRects.forEach((rect, i) => {
                console.log(`Skill ${i+1} button size: ${rect.width}x${rect.height}`);
            });
            
            // Check if all buttons have equal width and height
            const allEqual = skillRects.every(rect => 
                Math.abs(rect.width - primaryRect.width) < 2 && 
                Math.abs(rect.height - primaryRect.height) < 2
            );
            
            console.log(`All buttons equal size: ${allEqual ? '✓' : '✗'}`);
            
            // Overall result
            const success = shootAtBottom && allEqual;
            console.log(`\n=== RESULT: ${success ? 'SUCCESS ✓' : 'NEEDS ADJUSTMENT ✗'} ===`);
            
            if (success) {
                console.log("✓ SHOOT button is at the bottom");
                console.log("✓ All buttons have equal size");
            } else {
                if (!shootAtBottom) console.log("✗ SHOOT button is not at the bottom");
                if (!allEqual) console.log("✗ Buttons do not have equal size");
            }
        } else {
            console.log("Could not find button elements");
        }
    });
} else {
    console.log("This script needs to run in a browser environment");
}