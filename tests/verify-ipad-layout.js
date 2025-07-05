/**
 * iPad Air Layout Verification Script
 * Tests button visibility and layout on iPad Air (1180x820)
 */

function verifyiPadLayout() {
    console.log('🔍 Verifying iPad Air Layout (1180x820)...');
    
    // Test dimensions
    const testDimensions = {
        width: 1180,
        height: 820
    };
    
    console.log(`Current viewport: ${window.innerWidth}x${window.innerHeight}`);
    console.log(`Target dimensions: ${testDimensions.width}x${testDimensions.height}`);
    
    // Check if base screen exists
    const baseScreen = document.getElementById('baseScreen');
    if (!baseScreen) {
        console.error('❌ Base screen not found');
        return;
    }
    
    // Check if base buttons exist
    const baseButtons = document.getElementById('baseButtons');
    if (!baseButtons) {
        console.error('❌ Base buttons not found');
        return;
    }
    
    // Check button positioning
    const buttonsRect = baseButtons.getBoundingClientRect();
    console.log('📍 Base buttons position:', {
        top: buttonsRect.top,
        bottom: buttonsRect.bottom,
        left: buttonsRect.left,
        right: buttonsRect.right,
        height: buttonsRect.height
    });
    
    // Check if buttons are visible within viewport
    const isVisible = buttonsRect.bottom <= window.innerHeight && 
                     buttonsRect.top >= 0 &&
                     buttonsRect.left >= 0 &&
                     buttonsRect.right <= window.innerWidth;
    
    console.log(isVisible ? '✅ Buttons are visible' : '❌ Buttons are cut off');
    
    // Check base content scrolling
    const baseContent = document.getElementById('baseContent');
    if (baseContent) {
        const contentRect = baseContent.getBoundingClientRect();
        const hasScrollbar = baseContent.scrollHeight > baseContent.clientHeight;
        console.log('📜 Base content scrolling:', {
            hasScrollbar,
            scrollHeight: baseContent.scrollHeight,
            clientHeight: baseContent.clientHeight,
            paddingBottom: getComputedStyle(baseContent).paddingBottom
        });
    }
    
    // Check CSS media queries
    const mediaQueries = [
        '(min-width: 1100px) and (max-width: 1200px) and (min-height: 800px) and (max-height: 900px)',
        '(min-width: 768px) and (orientation: landscape)',
        '(orientation: landscape)'
    ];
    
    console.log('🎯 Active media queries:');
    mediaQueries.forEach(query => {
        const matches = window.matchMedia(query).matches;
        console.log(`  ${query}: ${matches ? '✅' : '❌'}`);
    });
    
    // Check computed styles
    const computedButtonsStyle = getComputedStyle(baseButtons);
    console.log('🎨 Base buttons computed styles:', {
        position: computedButtonsStyle.position,
        bottom: computedButtonsStyle.bottom,
        zIndex: computedButtonsStyle.zIndex,
        background: computedButtonsStyle.background,
        padding: computedButtonsStyle.padding,
        margin: computedButtonsStyle.margin
    });
    
    // Test results
    const results = {
        buttonsVisible: isVisible,
        correctDimensions: window.innerWidth === testDimensions.width && 
                         window.innerHeight === testDimensions.height,
        hasScrolling: baseContent && baseContent.scrollHeight > baseContent.clientHeight,
        mediaQueriesActive: mediaQueries.some(q => window.matchMedia(q).matches)
    };
    
    console.log('📊 Test Results:', results);
    
    const allPassed = Object.values(results).every(Boolean);
    console.log(allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed');
    
    return results;
}

// Auto-run when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for CSS to load
    setTimeout(verifyiPadLayout, 500);
});

// Export for manual testing
window.verifyiPadLayout = verifyiPadLayout;