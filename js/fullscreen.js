// Fullscreen and PWA detection utility
class FullscreenManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Detect if running in PWA mode
        this.isPWA = this.detectPWA();
        
        // Force fullscreen if possible
        if (this.isPWA) {
            this.enableFullscreen();
        }
        
        // Handle orientation changes
        this.handleOrientationChange();
        
        // Hide address bar on mobile browsers
        this.hideAddressBar();
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