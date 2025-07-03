// Button verification script for iPhone Safari
// Run this in browser console to check button functionality

function verifyButtons() {
    console.log('🔍 Verifying button functionality...');
    
    const buttons = [
        { id: 'startGameBtn', name: 'Start Battle' },
        { id: 'upgradesBtn', name: 'Upgrades' },
        { id: 'settingsBtn', name: 'Settings' }
    ];
    
    let results = [];
    
    buttons.forEach(buttonInfo => {
        const button = document.getElementById(buttonInfo.id);
        if (button) {
            console.log(`✅ Found button: ${buttonInfo.name}`);
            
            // Check CSS properties
            const styles = window.getComputedStyle(button);
            const touchAction = styles.getPropertyValue('touch-action');
            const userSelect = styles.getPropertyValue('user-select');
            const tapHighlight = styles.getPropertyValue('-webkit-tap-highlight-color');
            
            console.log(`   Touch Action: ${touchAction}`);
            console.log(`   User Select: ${userSelect}`);
            console.log(`   Tap Highlight: ${tapHighlight}`);
            
            // Check event listeners
            const events = getEventListeners(button);
            console.log(`   Event listeners:`, Object.keys(events));
            
            results.push({
                name: buttonInfo.name,
                found: true,
                touchAction,
                userSelect,
                events: Object.keys(events)
            });
        } else {
            console.log(`❌ Missing button: ${buttonInfo.name}`);
            results.push({
                name: buttonInfo.name,
                found: false
            });
        }
    });
    
    console.log('\n📊 Summary:');
    results.forEach(result => {
        console.log(`${result.found ? '✅' : '❌'} ${result.name}`);
    });
    
    return results;
}

// Auto-run verification
verifyButtons();

// Also add a test function to simulate touch
function testButtonTouch(buttonId) {
    const button = document.getElementById(buttonId);
    if (!button) {
        console.log(`❌ Button ${buttonId} not found`);
        return;
    }
    
    console.log(`🔸 Testing ${buttonId}...`);
    
    // Simulate touch sequence
    const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 }],
        targetTouches: [{ clientX: 100, clientY: 100, identifier: 0 }],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
    });
    
    const touchEnd = new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
    });
    
    button.dispatchEvent(touchStart);
    setTimeout(() => {
        button.dispatchEvent(touchEnd);
        console.log(`✅ Touch test completed for ${buttonId}`);
    }, 100);
}

console.log('🎯 Use testButtonTouch("startGameBtn") to test specific buttons');