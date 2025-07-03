// Comprehensive touch verification script for iPhone Safari
// Run this in browser console to check button and skill selection functionality

function verifyTouchElements() {
    console.log('🔍 Verifying touch functionality...');
    
    const buttons = [
        { id: 'startGameBtn', name: 'Start Battle' },
        { id: 'upgradesBtn', name: 'Upgrades' },
        { id: 'settingsBtn', name: 'Settings' },
        { id: 'continueBtn', name: 'Continue' },
        { id: 'backToBaseBtn', name: 'Back to Base' },
        { id: 'backToMenuBtn', name: 'Back to Menu' }
    ];
    
    let results = [];
    
    // Check buttons
    console.log('📱 Checking buttons...');
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
            
            results.push({
                type: 'button',
                name: buttonInfo.name,
                found: true,
                touchAction,
                userSelect,
                tapHighlight
            });
        } else {
            console.log(`❌ Missing button: ${buttonInfo.name}`);
            results.push({
                type: 'button',
                name: buttonInfo.name,
                found: false
            });
        }
    });
    
    // Check skill options
    console.log('\n🎯 Checking skill selection...');
    const skillOptions = document.querySelectorAll('.skill-option');
    if (skillOptions.length > 0) {
        console.log(`✅ Found ${skillOptions.length} skill options`);
        
        skillOptions.forEach((option, index) => {
            const styles = window.getComputedStyle(option);
            const touchAction = styles.getPropertyValue('touch-action');
            const userSelect = styles.getPropertyValue('user-select');
            const tapHighlight = styles.getPropertyValue('-webkit-tap-highlight-color');
            const minHeight = styles.getPropertyValue('min-height');
            
            console.log(`   Skill Option ${index + 1}:`);
            console.log(`     Touch Action: ${touchAction}`);
            console.log(`     User Select: ${userSelect}`);
            console.log(`     Tap Highlight: ${tapHighlight}`);
            console.log(`     Min Height: ${minHeight}`);
            
            results.push({
                type: 'skill',
                name: `Skill Option ${index + 1}`,
                found: true,
                touchAction,
                userSelect,
                tapHighlight,
                minHeight
            });
        });
    } else {
        console.log('❌ No skill options found (may be normal if not in skill selection screen)');
        results.push({
            type: 'skill',
            name: 'Skill Options',
            found: false
        });
    }
    
    // Check upgrade buttons
    console.log('\n⬆️ Checking upgrade buttons...');
    const upgradeButtons = document.querySelectorAll('.upgrade-btn');
    if (upgradeButtons.length > 0) {
        console.log(`✅ Found ${upgradeButtons.length} upgrade buttons`);
        
        upgradeButtons.forEach((button, index) => {
            const styles = window.getComputedStyle(button);
            const touchAction = styles.getPropertyValue('touch-action');
            const userSelect = styles.getPropertyValue('user-select');
            const tapHighlight = styles.getPropertyValue('-webkit-tap-highlight-color');
            
            results.push({
                type: 'upgrade',
                name: `Upgrade Button ${index + 1}`,
                found: true,
                touchAction,
                userSelect,
                tapHighlight
            });
        });
    } else {
        console.log('❌ No upgrade buttons found (may be normal if not in upgrade screen)');
        results.push({
            type: 'upgrade',
            name: 'Upgrade Buttons',
            found: false
        });
    }
    
    console.log('\n📊 Summary:');
    const buttonResults = results.filter(r => r.type === 'button');
    const skillResults = results.filter(r => r.type === 'skill');
    const upgradeResults = results.filter(r => r.type === 'upgrade');
    
    console.log(`📱 Buttons: ${buttonResults.filter(r => r.found).length}/${buttonResults.length}`);
    console.log(`🎯 Skills: ${skillResults.filter(r => r.found).length}/${skillResults.length}`);
    console.log(`⬆️ Upgrades: ${upgradeResults.filter(r => r.found).length}/${upgradeResults.length}`);
    
    return results;
}

// Auto-run verification
verifyTouchElements();

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

// Test skill selection touch
function testSkillTouch(skillIndex = 0) {
    const skillOptions = document.querySelectorAll('.skill-option');
    if (skillOptions.length === 0) {
        console.log('❌ No skill options found');
        return;
    }
    
    if (skillIndex >= skillOptions.length) {
        console.log(`❌ Skill index ${skillIndex} out of range (0-${skillOptions.length - 1})`);
        return;
    }
    
    const skillOption = skillOptions[skillIndex];
    const skillName = skillOption.querySelector('h3')?.textContent || `Skill ${skillIndex}`;
    
    console.log(`🔸 Testing skill option: ${skillName}...`);
    
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
    
    skillOption.dispatchEvent(touchStart);
    setTimeout(() => {
        skillOption.dispatchEvent(touchEnd);
        console.log(`✅ Touch test completed for skill: ${skillName}`);
    }, 100);
}

console.log('🎯 Use testButtonTouch("startGameBtn") to test specific buttons');
console.log('🎯 Use testSkillTouch(0) to test skill selection (index 0-2)');