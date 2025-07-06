// Fullscreen and PWA detection utility
class FullscreenManager {
    constructor() {
        this.isAndroid = this.detectAndroid();
        this.init();
    }
    
    init() {
        // Detect if running in PWA mode
        this.isPWA = this.detectPWA();
        this.isTWA = this.detectTWA();
        
        // Android-specific initialization
        if (this.isAndroid) {
            this.initAndroidFullscreen();
        }
        
        // Force fullscreen immediately for TWAs
        if (this.isTWA) {
            console.log('TWA detected - forcing fullscreen');
            this.forceTWAFullscreen();
        } else if (this.isPWA) {
            this.enableFullscreen();
        }
        
        // Handle orientation changes
        this.handleOrientationChange();
        
        // Hide address bar on mobile browsers
        this.hideAddressBar();
        
        // Additional TWA-specific initialization
        if (this.isTWA) {
            this.initTWASpecific();
        }
    }
    
    initTWASpecific() {
        // TWA-specific initialization
        console.log('Initializing TWA-specific features');
        
        // Force landscape orientation
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {
                console.log('Could not lock orientation');
            });
        }
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Prevent text selection
        document.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
        
        // Force focus to prevent keyboard issues
        document.addEventListener('touchstart', () => {
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
        });
    }
    
    detectAndroid() {
        return /Android/i.test(navigator.userAgent);
    }
    
    initAndroidFullscreen() {
        // Android-specific fullscreen initialization
        document.documentElement.style.height = '100vh';
        document.documentElement.style.height = '100dvh';
        document.body.style.height = '100vh';
        document.body.style.height = '100dvh';
        
        // Force immersive mode on Android
        this.enableAndroidImmersiveMode();
        
        // Handle Android back button
        this.handleAndroidBackButton();
    }
    
    enableAndroidImmersiveMode() {
        // Try to enable immersive mode
        if (window.navigator && window.navigator.standalone === false) {
            // Running in browser - try to hide chrome
            window.addEventListener('load', () => {
                setTimeout(() => {
                    window.scrollTo(0, 1);
                    document.body.style.position = 'fixed';
                    document.body.style.top = '0';
                    document.body.style.left = '0';
                    document.body.style.width = '100vw';
                    document.body.style.height = '100vh';
                    document.body.style.overflow = 'hidden';
                }, 100);
            });
        }
    }
    
    handleAndroidBackButton() {
        // Handle Android back button in TWA
        document.addEventListener('backbutton', (e) => {
            e.preventDefault();
            // Custom back button behavior
            if (window.gameEngine && window.gameEngine.currentScreen !== 'mainMenu') {
                window.gameEngine.showScreen('mainMenu');
            }
        });
    }
    
    detectPWA() {
        // Check if running in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isAppInstalled = window.navigator.standalone === true;
        const isWebApk = document.referrer.includes('android-app://');
        const isPWABuilder = window.matchMedia('(display-mode: fullscreen)').matches;
        const isTWA = this.detectTWA();
        
        return isStandalone || isAppInstalled || isWebApk || isPWABuilder || isTWA;
    }
    
    detectTWA() {
        // Enhanced TWA detection for PWA Builder apps
        const userAgent = navigator.userAgent;
        const isAndroid = /Android/i.test(userAgent);
        
        if (!isAndroid) return false;
        
        // Check for TWA-specific indicators
        const twaIndicators = [
            // PWA Builder TWA indicators
            userAgent.includes('wv'), // WebView
            userAgent.includes('Version/') && userAgent.includes('Chrome/'),
            // Check for custom TWA user agent patterns
            userAgent.includes('tankadventure') || userAgent.includes('TankAdventure'),
            // Check for standalone display mode (common in TWAs)
            window.matchMedia('(display-mode: standalone)').matches,
            window.matchMedia('(display-mode: fullscreen)').matches,
            // Check for Android app context
            document.referrer.includes('android-app://'),
            // Check for TWA-specific window properties
            window.chrome && window.chrome.webstore === undefined,
            // Check if running from our GitHub Pages domain on Android (likely TWA)
            window.location.href.includes('hoanganh25991.github.io'),
            // Check for missing browser features (common in TWA WebView)
            !window.external || !window.external.AddSearchProvider,
            // Check for Android WebView specific properties
            window.AndroidInterface !== undefined,
            // Check for TWA-specific viewport behavior
            window.innerHeight === window.screen.height,
            // Check if window.open is restricted (common in TWA)
            this.isWindowOpenRestricted()
        ];
        
        const detectedCount = twaIndicators.filter(indicator => indicator).length;
        const isTWA = detectedCount >= 2; // Need at least 2 indicators
        
        console.log(`TWA Detection: ${detectedCount}/13 indicators, Result: ${isTWA}`);
        console.log('TWA Indicators:', {
            webview: userAgent.includes('wv'),
            standalone: window.matchMedia('(display-mode: standalone)').matches,
            fullscreen: window.matchMedia('(display-mode: fullscreen)').matches,
            githubPages: window.location.href.includes('hoanganh25991.github.io'),
            noWebstore: window.chrome && window.chrome.webstore === undefined,
            heightMatch: window.innerHeight === window.screen.height
        });
        
        return isTWA;
    }
    
    isWindowOpenRestricted() {
        // Test if window.open is restricted (common in TWA)
        try {
            const testWindow = window.open('', '_blank', 'width=1,height=1');
            if (testWindow) {
                testWindow.close();
                return false;
            }
            return true;
        } catch (e) {
            return true; // Restricted
        }
    }
    
    enableFullscreen() {
        // Enhanced fullscreen for PWA Builder TWAs
        const elem = document.documentElement;
        
        // Force immediate fullscreen for TWAs
        if (this.detectTWA()) {
            this.forceTWAFullscreen();
            return;
        }
        
        // Try standard fullscreen API
        if (elem.requestFullscreen) {
            elem.requestFullscreen({ navigationUI: "hide" }).catch(() => {
                this.fallbackFullscreen();
            });
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else {
            this.fallbackFullscreen();
        }
    }
    
    forceTWAFullscreen() {
        // Aggressive fullscreen for TWA apps
        console.log('Forcing TWA fullscreen mode');
        
        // Set viewport meta tag for fullscreen
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui');
        }
        
        // Force fullscreen CSS
        const style = document.createElement('style');
        style.id = 'twa-fullscreen-style';
        style.textContent = `
            html, body {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                height: 100dvh !important;
                overflow: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-overflow-scrolling: touch !important;
            }
            
            #gameContainer {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                height: 100dvh !important;
                overflow: hidden !important;
                z-index: 9999 !important;
            }
            
            /* Hide any potential browser UI */
            body::before {
                content: '';
                position: fixed;
                top: -100px;
                left: 0;
                width: 100vw;
                height: 100px;
                background: #1a1a1a;
                z-index: 10000;
            }
        `;
        
        // Remove existing style if present
        const existingStyle = document.getElementById('twa-fullscreen-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(style);
        
        // Force layout recalculation
        setTimeout(() => {
            this.adjustTWAViewport();
        }, 100);
    }
    
    adjustTWAViewport() {
        // Aggressive viewport adjustment for TWA
        const updateViewport = () => {
            const vh = window.innerHeight;
            const vw = window.innerWidth;
            const screenHeight = window.screen.height;
            const screenWidth = window.screen.width;
            
            // Use screen dimensions if available and larger
            const finalHeight = Math.max(vh, screenHeight);
            const finalWidth = Math.max(vw, screenWidth);
            
            console.log(`TWA Viewport: ${finalWidth}x${finalHeight} (inner: ${vw}x${vh}, screen: ${screenWidth}x${screenHeight})`);
            
            // Update CSS custom properties
            document.documentElement.style.setProperty('--vh', `${finalHeight}px`);
            document.documentElement.style.setProperty('--vw', `${finalWidth}px`);
            
            // Force body and html dimensions
            document.documentElement.style.height = finalHeight + 'px';
            document.documentElement.style.width = finalWidth + 'px';
            document.body.style.height = finalHeight + 'px';
            document.body.style.width = finalWidth + 'px';
            
            // Update game container
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                gameContainer.style.height = finalHeight + 'px';
                gameContainer.style.width = finalWidth + 'px';
            }
            
            // Update canvas if it exists
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                canvas.style.height = finalHeight + 'px';
                canvas.style.width = finalWidth + 'px';
            }
        };
        
        // Initial viewport setup
        updateViewport();
        
        // Update on various events
        window.addEventListener('resize', updateViewport);
        window.addEventListener('orientationchange', () => {
            setTimeout(updateViewport, 200);
        });
        
        // Force update after a delay to ensure everything is loaded
        setTimeout(updateViewport, 500);
        setTimeout(updateViewport, 1000);
    }
    
    fallbackFullscreen() {
        // Fallback method to maximize viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui');
        }
        
        // Hide browser UI elements
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }
    
    handleOrientationChange() {
        // Handle orientation changes to maintain fullscreen
        const handleOrientationChange = () => {
            setTimeout(() => {
                this.hideAddressBar();
            }, 100);
        };
        
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);
    }
    
    hideAddressBar() {
        // Hide address bar on mobile browsers
        if (window.navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i)) {
            setTimeout(() => {
                window.scrollTo(0, 1);
            }, 100);
        }
        
        // Android-specific viewport adjustments
        if (this.isAndroid) {
            this.adjustAndroidViewport();
        }
    }
    
    adjustAndroidViewport() {
        // Dynamic viewport adjustment for Android
        const updateViewport = () => {
            const vh = window.innerHeight;
            const vw = window.innerWidth;
            
            // Update CSS custom properties for Android
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            document.documentElement.style.setProperty('--vw', `${vw}px`);
            
            // Force layout recalculation
            document.body.style.height = vh + 'px';
            document.body.style.width = vw + 'px';
            
            // Update game container if it exists
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                gameContainer.style.height = vh + 'px';
                gameContainer.style.width = vw + 'px';
            }
        };
        
        // Initial viewport setup
        updateViewport();
        
        // Update on resize and orientation change
        window.addEventListener('resize', updateViewport);
        window.addEventListener('orientationchange', () => {
            setTimeout(updateViewport, 100);
        });
    }
    
    // Check if currently in fullscreen
    isFullscreen() {
        return !!(document.fullscreenElement || 
                 document.webkitFullscreenElement || 
                 document.msFullscreenElement);
    }
    
    // Toggle fullscreen
    toggleFullscreen() {
        if (this.isFullscreen()) {
            this.exitFullscreen();
        } else {
            this.enableFullscreen();
        }
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Handle service worker messages for fullscreen
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'ENABLE_FULLSCREEN') {
            console.log('Service Worker: Fullscreen message received');
            if (window.fullscreenManager) {
                window.fullscreenManager.enableFullscreen();
            }
        }
    });
}

// Initialize fullscreen manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fullscreenManager = new FullscreenManager();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.fullscreenManager = new FullscreenManager();
    });
} else {
    window.fullscreenManager = new FullscreenManager();
}