/**
 * Orientation Manager
 * Enforces landscape orientation for optimal gameplay experience
 */

class OrientationManager {
    constructor() {
        this.isLandscape = false;
        this.orientationScreen = null;
        this.mainMenu = null;
        this.callbacks = [];
        
        // Initialize orientation detection
        this.init();
    }

    init() {
        // Get DOM elements
        this.orientationScreen = document.getElementById('orientationScreen');
        this.mainMenu = document.getElementById('mainMenu');
        
        // Check initial orientation
        this.checkOrientation();
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            // Use setTimeout to ensure orientation change is complete
            setTimeout(() => {
                this.checkOrientation();
            }, 100);
        });
        
        // Listen for resize events (fallback for devices without orientationchange)
        window.addEventListener('resize', () => {
            this.checkOrientation();
        });
        
        // Also listen for screen orientation API if available
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                this.checkOrientation();
            });
        }
    }

    checkOrientation() {
        const prevLandscape = this.isLandscape;
        
        // Multiple ways to detect landscape orientation
        this.isLandscape = this.detectLandscape();
        
        // Update UI based on orientation
        this.updateUI();
        
        // Trigger callbacks if orientation changed
        if (prevLandscape !== this.isLandscape) {
            this.triggerCallbacks();
        }
    }

    detectLandscape() {
        // Method 1: Screen orientation API
        if (screen.orientation) {
            return screen.orientation.angle === 90 || screen.orientation.angle === -90 || 
                   screen.orientation.type.includes('landscape');
        }
        
        // Method 2: Window orientation (deprecated but still works)
        if (window.orientation !== undefined) {
            return window.orientation === 90 || window.orientation === -90;
        }
        
        // Method 3: Window dimensions
        return window.innerWidth > window.innerHeight;
    }

    updateUI() {
        if (!this.orientationScreen || !this.mainMenu) return;
        
        if (this.isLandscape) {
            // Hide orientation screen, show main menu
            this.orientationScreen.classList.remove('active');
            this.mainMenu.classList.add('active');
            
            // Enable all menu buttons
            this.enableMenuButtons();
        } else {
            // Show orientation screen, hide main menu
            this.orientationScreen.classList.add('active');
            this.mainMenu.classList.remove('active');
            
            // Disable all menu buttons
            this.disableMenuButtons();
        }
    }

    enableMenuButtons() {
        const menuButtons = document.querySelectorAll('.menu-btn');
        menuButtons.forEach(button => {
            button.disabled = false;
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
        });
    }

    disableMenuButtons() {
        const menuButtons = document.querySelectorAll('.menu-btn');
        menuButtons.forEach(button => {
            button.disabled = true;
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
        });
    }

    onOrientationChange(callback) {
        this.callbacks.push(callback);
    }

    triggerCallbacks() {
        this.callbacks.forEach(callback => {
            try {
                callback(this.isLandscape);
            } catch (error) {
                console.error('Error in orientation callback:', error);
            }
        });
    }

    // Force landscape orientation if supported
    async requestLandscape() {
        if (screen.orientation && screen.orientation.lock) {
            try {
                await screen.orientation.lock('landscape');
                return true;
            } catch (error) {
                console.warn('Could not lock orientation:', error);
                return false;
            }
        }
        return false;
    }

    // Get current orientation info for debugging
    getOrientationInfo() {
        return {
            isLandscape: this.isLandscape,
            screenOrientation: screen.orientation ? {
                angle: screen.orientation.angle,
                type: screen.orientation.type
            } : null,
            windowOrientation: window.orientation,
            windowDimensions: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }
}

// Initialize orientation manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.orientationManager = new OrientationManager();
    
    // Add global debug function
    window.debugOrientation = () => {
        console.log('Orientation Info:', window.orientationManager.getOrientationInfo());
    };
});

// Export for global access
window.OrientationManager = OrientationManager;