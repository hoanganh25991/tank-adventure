// Fullscreen and PWA detection utility
class FullscreenManager {
    constructor() {
        this.isAndroid = this.detectAndroid();
        this.init();
    }
    
    init() {
        // Detect if running in PWA mode
        this.isPWA = this.detectPWA();
        
        // Android-specific initialization
        if (this.isAndroid) {
            this.initAndroidFullscreen();
        }
        
        // Force fullscreen if possible
        if (this.isPWA) {
            this.enableFullscreen();
        }
        
        // Handle orientation changes
        this.handleOrientationChange();
        
        // Hide address bar on mobile browsers
        this.hideAddressBar();
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
        
        return isStandalone || isAppInstalled || isWebApk;
    }
    
    enableFullscreen() {
        // Request fullscreen if available
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {
                // Fallback for browsers that don't support fullscreen
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