// Quick Actions System for PWA Shortcuts
// Handles URL parameters from manifest.json shortcuts

class QuickActions {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.pendingAction = null;
        this.actionDelay = 1500; // Wait for game to fully initialize
        
        this.initialize();
    }
    
    initialize() {
        // Check URL parameters on page load
        this.checkURLParameters();
        
        // Listen for game initialization completion
        if (this.pendingAction) {
            this.waitForGameReady();
        }
    }
    
    checkURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        console.log('Quick Actions: Checking URL parameters, action =', action);
        
        if (action) {
            this.pendingAction = action;
            console.log('Quick Actions: Pending action set to', action);
            
            // Clear URL parameters to prevent re-triggering on refresh
            this.clearURLParameters();
        }
    }
    
    clearURLParameters() {
        // Remove URL parameters without triggering page reload
        const url = new URL(window.location);
        url.searchParams.delete('action');
        window.history.replaceState({}, document.title, url.pathname + url.hash);
    }
    
    waitForGameReady() {
        const checkReady = () => {
            if (this.isGameReady()) {
                console.log('Quick Actions: Game is ready, executing pending action');
                this.executePendingAction();
            } else {
                console.log('Quick Actions: Game not ready yet, waiting...');
                setTimeout(checkReady, 500);
            }
        };
        
        // Initial delay to ensure all components are loaded
        setTimeout(checkReady, this.actionDelay);
    }
    
    isGameReady() {
        return this.gameEngine && 
               this.gameEngine.ui && 
               this.gameEngine.player && 
               this.gameEngine.currentScene === 'menu' &&
               document.getElementById('mainMenu').classList.contains('active');
    }
    
    executePendingAction() {
        if (!this.pendingAction) return;
        
        const action = this.pendingAction;
        this.pendingAction = null;
        
        console.log('Quick Actions: Executing action:', action);
        
        switch (action) {
            case 'quick-battle':
                this.startQuickBattle();
                break;
            case 'base':
                this.goToBase();
                break;
            default:
                console.warn('Quick Actions: Unknown action:', action);
        }
    }
    
    startQuickBattle() {
        console.log('Quick Actions: Starting quick battle');
        
        try {
            // Show notification about quick battle
            if (this.gameEngine.ui.showNotification) {
                this.gameEngine.ui.showNotification('🚀 Quick Battle Starting!', 'info');
            }
            
            // Set battle type to quick
            this.gameEngine.battleType = 'quick';
            this.gameEngine.battleTitle = 'Quick Battle';
            this.gameEngine.maxWaves = 5; // Shorter battle for quick action
            
            // Start battle directly without showing battle type selection
            this.gameEngine.ui.startBattle('quick');
            
            console.log('Quick Actions: Quick battle started successfully');
            
        } catch (error) {
            console.error('Quick Actions: Failed to start quick battle:', error);
            // Fallback to normal battle start
            this.fallbackToBattleSelection();
        }
    }
    
    goToBase() {
        console.log('Quick Actions: Going to base');
        
        try {
            // Show notification about base access
            if (this.gameEngine.ui.showNotification) {
                this.gameEngine.ui.showNotification('🏠 Welcome to Tank Base!', 'info');
            }
            
            // Navigate to base screen
            this.gameEngine.ui.showScreen('baseScreen');
            this.gameEngine.currentScene = 'base';
            
            console.log('Quick Actions: Base screen shown successfully');
            
        } catch (error) {
            console.error('Quick Actions: Failed to show base screen:', error);
            // Stay on main menu if base fails
            console.log('Quick Actions: Staying on main menu due to error');
        }
    }
    
    fallbackToBattleSelection() {
        console.log('Quick Actions: Falling back to battle type selection');
        
        try {
            // Show battle type selection as fallback
            this.gameEngine.ui.showBattleTypeSelection();
        } catch (error) {
            console.error('Quick Actions: Fallback also failed:', error);
            // Show notification about failure
            if (this.gameEngine.ui.showNotification) {
                this.gameEngine.ui.showNotification('❌ Failed to start battle. Please try manually.', 'error');
            }
        }
    }
    
    // Method to handle quick actions from other parts of the app
    executeAction(action) {
        console.log('Quick Actions: Direct action execution requested:', action);
        this.pendingAction = action;
        
        if (this.isGameReady()) {
            this.executePendingAction();
        } else {
            this.waitForGameReady();
        }
    }
    
    // Method to check if a quick action is pending
    hasPendingAction() {
        return this.pendingAction !== null;
    }
    
    // Method to get the current pending action
    getPendingAction() {
        return this.pendingAction;
    }
    
    // Method to cancel pending action
    cancelPendingAction() {
        console.log('Quick Actions: Cancelling pending action:', this.pendingAction);
        this.pendingAction = null;
    }
}

// Export for use in other modules
window.QuickActions = QuickActions;