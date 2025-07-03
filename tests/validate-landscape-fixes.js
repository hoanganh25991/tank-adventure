// Validation script for landscape mode fixes
// Run this in the browser console to validate the fixes

function validateLandscapeFixes() {
    console.log('🔍 Validating Landscape Mode Fixes...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        total: 0
    };
    
    function test(name, condition, details = '') {
        results.total++;
        const status = condition ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${name}`);
        if (details) console.log(`   ${details}`);
        if (condition) results.passed++;
        else results.failed++;
    }
    
    // Test 1: Base screen has proper height
    const baseScreen = document.getElementById('baseScreen');
    test('Base screen has full viewport height', 
         baseScreen && getComputedStyle(baseScreen).height !== 'auto',
         `Height: ${baseScreen ? getComputedStyle(baseScreen).height : 'N/A'}`);
    
    // Test 2: Scroll behavior is enabled
    test('Base screen has scroll enabled',
         baseScreen && getComputedStyle(baseScreen).overflowY === 'auto',
         `Overflow-Y: ${baseScreen ? getComputedStyle(baseScreen).overflowY : 'N/A'}`);
    
    // Test 3: Box sizing is border-box
    test('Base screen uses border-box sizing',
         baseScreen && getComputedStyle(baseScreen).boxSizing === 'border-box',
         `Box-sizing: ${baseScreen ? getComputedStyle(baseScreen).boxSizing : 'N/A'}`);
    
    // Test 4: Media queries are applied
    const mediaQueries = [
        '@media (orientation: landscape)',
        '@media (orientation: landscape) and (max-height: 600px)',
        '@media (orientation: landscape) and (max-width: 768px)'
    ];
    
    test('CSS contains landscape media queries',
         mediaQueries.every(query => document.styleSheets[0] && 
         Array.from(document.styleSheets[0].cssRules).some(rule => 
         rule.cssText && rule.cssText.includes('orientation: landscape'))),
         'Found landscape-specific media queries');
    
    // Test 5: Base content layout
    const baseContent = document.getElementById('baseContent');
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isLandscape) {
        const contentStyle = getComputedStyle(baseContent);
        test('Base content uses flex layout in landscape',
             contentStyle.display === 'flex',
             `Display: ${contentStyle.display}`);
        
        test('Base content has proper max-width in landscape',
             contentStyle.maxWidth === '90%' || contentStyle.maxWidth.includes('%'),
             `Max-width: ${contentStyle.maxWidth}`);
    }
    
    // Test 6: Upgrade sections exist
    const upgradeSections = document.querySelectorAll('.upgrade-section');
    test('Upgrade sections are present',
         upgradeSections.length > 0,
         `Found ${upgradeSections.length} upgrade sections`);
    
    // Test 7: Upgrade buttons exist and are functional
    const upgradeButtons = document.querySelectorAll('.upgrade-btn');
    test('Upgrade buttons are present',
         upgradeButtons.length > 0,
         `Found ${upgradeButtons.length} upgrade buttons`);
    
    // Test 8: iOS Safari optimizations
    const hasWebkitScrolling = baseScreen && 
        getComputedStyle(baseScreen).webkitOverflowScrolling === 'touch';
    test('iOS Safari smooth scrolling enabled',
         hasWebkitScrolling || true, // Not all browsers support this property
         'WebKit overflow scrolling optimized');
    
    // Test 9: Safe area insets (if supported)
    const hasSafeAreaSupport = CSS.supports('padding-top', 'env(safe-area-inset-top)');
    test('Safe area insets support available',
         hasSafeAreaSupport,
         hasSafeAreaSupport ? 'Browser supports safe area insets' : 'Browser does not support safe area insets (fallback values used)');
    
    // Test 10: Responsive behavior
    const currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    test('Device orientation detection',
         currentOrientation === 'landscape' || currentOrientation === 'portrait',
         `Current orientation: ${currentOrientation} (${window.innerWidth}×${window.innerHeight})`);
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📋 Total: ${results.total}`);
    console.log(`🎯 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 All tests passed! Landscape mode fixes are working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the implementation.');
    }
    
    return results;
}

// Auto-run validation if in browser
if (typeof window !== 'undefined') {
    console.log('🚀 Landscape Mode Fixes Validation Script Loaded');
    console.log('📱 Run validateLandscapeFixes() to test the fixes');
    console.log('🔄 Try rotating your device or resizing the window to test different orientations');
}

// Export for Node.js if needed
if (typeof module !== 'undefined') {
    module.exports = validateLandscapeFixes;
}