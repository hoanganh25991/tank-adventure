// Android TWA (Trusted Web Activity) Detection and Optimization
class AndroidTWAManager {
    constructor() {
        this.isAndroidTWA = this.detectAndroidTWA();
        this.init();
    }
    
    init() {
        if (this.isAndroidTWA) {
            this.optimizeForTWA();
        }
    }
    
    detectAndroidTWA() {
        // Multiple methods to detect Android TWA
        const userAgent = navigator.userAgent;
        const isAndroid = /Android/i.test(userAgent);
        
        // Check for TWA-specific indicators
        const isTWA = (
            // Check for TWA user agent
            userAgent.includes('wv') || // WebView
            // Check for standalone display mode
            window.matchMedia('(display-mode: standalone)').matches ||
            // Check for Android app context
            document.referrer.includes('android-app://') ||
            // Check for TWA-specific window properties
            window.chrome && window.chrome.webstore === undefined
        );
        
        return isAndroid && isTWA;
    }
    
    optimizeForTWA() {
        // Apply TWA-specific optimizations
        this.forceFullscreen();
        this.hideSystemUI();
        this.preventScrolling();
        this.handleNavigationBar();
        this.optimizeViewport();
    }
    
    forceFullscreen() {
        // Force fullscreen mode for TWA
        document.documentElement.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
        `;
        
        document.body.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
        `;
    }
    
    hideSystemUI() {
        // Hide Android system UI elements
        const metaElements = [
            { name: 'theme-color', content: '#1a1a1a' },
            { name: 'android-immersive', content: 'true' },
            { name: 'mobile-web-app-status-bar-style', content: 'black-translucent' }
        ];
        
        metaElements.forEach(meta => {
            let element = document.querySelector(`meta[name="${meta.name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.name = meta.name;
                document.head.appendChild(element);
            }
            element.content = meta.content;
        });
    }
    
    preventScrolling() {
        // Prevent any scrolling behavior
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Prevent pull-to-refresh
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    handleNavigationBar() {
        // Handle Android navigation bar
        const updateViewportForNavigationBar = () => {
            const visualViewport = window.visualViewport;
            if (visualViewport) {
                const height = visualViewport.height;
                const width = visualViewport.width;
                
                document.documentElement.style.setProperty('--vh', `${height}px`);
                document.documentElement.style.setProperty('--vw', `${width}px`);
                
                // Update game container
                const gameContainer = document.getElementById('gameContainer');
                if (gameContainer) {
                    gameContainer.style.height = height + 'px';
                    gameContainer.style.width = width + 'px';
                }
            }
        };
        
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateViewportForNavigationBar);
            updateViewportForNavigationBar();
        }
    }
    
    optimizeViewport() {
        // Optimize viewport for TWA
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui';
        }
        
        // Add CSS to ensure proper viewport handling
        const style = document.createElement('style');
        style.textContent = `
            /* TWA-specific viewport optimization */
            @media screen and (max-width: 1024px) {
                html, body {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    overflow: hidden !important;
                }
                
                #gameContainer {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    overflow: hidden !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize Android TWA manager
document.addEventListener('DOMContentLoaded', () => {
    window.androidTWAManager = new AndroidTWAManager();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.androidTWAManager = new AndroidTWAManager();
    });
} else {
    window.androidTWAManager = new AndroidTWAManager();
}