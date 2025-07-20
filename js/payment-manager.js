// Payment Manager for Tank Adventure
// Handles Google Pay integration and purchase verification

class PaymentManager {
    constructor() {
        this.isInitialized = false;
        this.googlePayClient = null;
        this.isPurchased = false;
        this.purchaseData = null;
        this.pendingStateChange = undefined;
        
        // Payment configuration
        this.paymentConfig = {
            environment: 'TEST', // Change to 'PRODUCTION' for live
            merchantId: 'your-merchant-id', // Replace with your actual merchant ID
            merchantName: 'Tank Adventure',
            price: '20000',
            currency: 'VND',
            productId: 'tank_adventure_full_game',
            productName: 'Tank Adventure - Full Game',
            productDescription: 'Unlock the complete Tank Adventure experience with unlimited gameplay, all features, and future updates.'
        };
        
        // Trial limitations for free version
        this.trialLimitations = {
            maxWaves: 5,
            maxLevel: 3,
            restrictedFeatures: ['advanced_skills', 'premium_upgrades', 'unlimited_battles']
        };
        
        this.initialize();
    }
    
    async initialize() {
        try {
            // Load purchase state from localStorage
            this.loadPurchaseState();
            
            // Initialize Google Pay if available
            if (this.isGooglePayAvailable()) {
                await this.initializeGooglePay();
            }
            
            this.isInitialized = true;
            console.log('Payment Manager initialized successfully');
            
            // Update UI based on purchase state
            this.updateUIForPurchaseState();
            
        } catch (error) {
            console.error('Failed to initialize Payment Manager:', error);
        }
    }
    
    isGooglePayAvailable() {
        return typeof google !== 'undefined' && google.payments && google.payments.api;
    }
    
    async initializeGooglePay() {
        try {
            const baseRequest = {
                apiVersion: 2,
                apiVersionMinor: 0
            };
            
            const allowedPaymentMethods = [{
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['MASTERCARD', 'VISA']
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'example',
                        gatewayMerchantId: this.paymentConfig.merchantId
                    }
                }
            }];
            
            this.googlePayClient = new google.payments.api.PaymentsClient({
                environment: this.paymentConfig.environment
            });
            
            // Check if Google Pay is ready
            const isReadyToPayRequest = Object.assign({}, baseRequest);
            isReadyToPayRequest.allowedPaymentMethods = allowedPaymentMethods;
            
            const response = await this.googlePayClient.isReadyToPay(isReadyToPayRequest);
            if (response.result) {
                console.log('Google Pay is ready');
                return true;
            } else {
                console.log('Google Pay is not available');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Google Pay:', error);
            return false;
        }
    }
    
    async purchaseFullGame() {
        if (this.isPurchased) {
            this.showMessage('You have already purchased the full game!', 'success');
            return true;
        }
        
        if (!this.isGooglePayAvailable() || !this.googlePayClient) {
            // Fallback for testing or when Google Pay is not available
            return this.showPurchaseDialog();
        }
        
        try {
            const paymentDataRequest = this.createPaymentDataRequest();
            const paymentData = await this.googlePayClient.loadPaymentData(paymentDataRequest);
            
            // Process the payment
            const success = await this.processPayment(paymentData);
            
            if (success) {
                this.setPurchased(true);
                this.showMessage('Purchase successful! Thank you for supporting Tank Adventure!', 'success');
                return true;
            } else {
                this.showMessage('Payment failed. Please try again.', 'error');
                return false;
            }
            
        } catch (error) {
            console.error('Payment error:', error);
            if (error.statusCode === 'CANCELED') {
                this.showMessage('Payment was cancelled.', 'info');
            } else {
                this.showMessage('Payment failed. Please try again.', 'error');
            }
            return false;
        }
    }
    
    createPaymentDataRequest() {
        const baseRequest = {
            apiVersion: 2,
            apiVersionMinor: 0
        };
        
        const allowedPaymentMethods = [{
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA']
            },
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                    gateway: 'example',
                    gatewayMerchantId: this.paymentConfig.merchantId
                }
            }
        }];
        
        const transactionInfo = {
            totalPriceStatus: 'FINAL',
            totalPriceLabel: 'Total',
            totalPrice: this.formatPrice(this.paymentConfig.price),
            currencyCode: this.paymentConfig.currency,
            countryCode: 'VN'
        };
        
        const merchantInfo = {
            merchantName: this.paymentConfig.merchantName,
            merchantId: this.paymentConfig.merchantId
        };
        
        return Object.assign({}, baseRequest, {
            allowedPaymentMethods: allowedPaymentMethods,
            transactionInfo: transactionInfo,
            merchantInfo: merchantInfo
        });
    }
    
    async processPayment(paymentData) {
        // In a real implementation, you would send this to your server
        // for verification and processing
        console.log('Processing payment data:', paymentData);
        
        // Simulate payment processing
        return new Promise((resolve) => {
            setTimeout(() => {
                // For demo purposes, always succeed
                resolve(true);
            }, 2000);
        });
    }
    
    showPurchaseDialog() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal purchase-modal';
            modal.innerHTML = `
                <div class="modal-content purchase-content">
                    <h2>🎮 Unlock Full Game</h2>
                    <div class="purchase-info">
                        <div class="product-details">
                            <h3>${this.paymentConfig.productName}</h3>
                            <p>${this.paymentConfig.productDescription}</p>
                            <div class="price-display">
                                <span class="price">${this.formatPrice(this.paymentConfig.price)} ${this.paymentConfig.currency}</span>
                            </div>
                        </div>
                        <div class="purchase-benefits">
                            <h4>✨ What you get:</h4>
                            <ul>
                                <li>🚀 Unlimited waves and battles</li>
                                <li>🎯 All advanced skills unlocked</li>
                                <li>⭐ Premium tank upgrades</li>
                                <li>🔄 All future updates included</li>
                                <li>❌ No restrictions or limitations</li>
                            </ul>
                        </div>
                    </div>
                    <div class="modal-buttons">
                        <button id="confirmPurchaseBtn" class="menu-btn purchase-btn">
                            💳 Purchase Now
                        </button>
                        <button id="cancelPurchaseBtn" class="menu-btn cancel-btn">
                            ❌ Cancel
                        </button>
                    </div>
                    <div class="purchase-note">
                        <p>💡 One-time purchase • Lifetime access • Family friendly</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            modal.style.display = 'flex';
            
            const confirmBtn = modal.querySelector('#confirmPurchaseBtn');
            const cancelBtn = modal.querySelector('#cancelPurchaseBtn');
            
            confirmBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                // Simulate successful purchase for demo
                this.setPurchased(true);
                this.showMessage('Purchase successful! Thank you for supporting Tank Adventure!', 'success');
                resolve(true);
            });
            
            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });
        });
    }
    
    setPurchased(purchased) {
        this.isPurchased = purchased;
        if (purchased) {
            this.purchaseData = {
                purchaseDate: new Date().toISOString(),
                productId: this.paymentConfig.productId,
                price: this.paymentConfig.price,
                currency: this.paymentConfig.currency
            };
        } else {
            this.purchaseData = null;
        }
        
        this.savePurchaseState();
        this.updateUIForPurchaseState();
        
        // Notify game engine of purchase state change
        if (window.gameEngine && typeof window.gameEngine.onPurchaseStateChanged === 'function') {
            window.gameEngine.onPurchaseStateChanged(purchased);
        } else {
            // Store the state change to apply later when game engine is ready
            this.pendingStateChange = purchased;
        }
    }
    
    // Method to connect with game engine and apply any pending state changes
    connectToGameEngine() {
        if (window.gameEngine && typeof window.gameEngine.onPurchaseStateChanged === 'function') {
            // Apply any pending state change
            if (this.pendingStateChange !== undefined) {
                window.gameEngine.onPurchaseStateChanged(this.pendingStateChange);
                this.pendingStateChange = undefined;
            } else {
                // Apply current state
                window.gameEngine.onPurchaseStateChanged(this.isPurchased);
            }
            console.log('Payment manager connected to game engine');
        }
    }
    
    savePurchaseState() {
        const data = {
            isPurchased: this.isPurchased,
            purchaseData: this.purchaseData,
            version: '1.0'
        };
        Utils.saveGame('tankAdventure_purchase', data);
    }
    
    loadPurchaseState() {
        const data = Utils.loadGame('tankAdventure_purchase', {
            isPurchased: false,
            purchaseData: null,
            version: '1.0'
        });
        
        this.isPurchased = data.isPurchased || false;
        this.purchaseData = data.purchaseData || null;
    }
    
    updateUIForPurchaseState() {
        // Update main menu
        this.updateMainMenu();
        
        // Update battle screen if needed
        this.updateBattleScreen();
        
        // Update base screen
        this.updateBaseScreen();
    }
    
    updateMainMenu() {
        const mainMenu = document.getElementById('mainMenu');
        if (!mainMenu) return;
        
        // Remove existing purchase button
        const existingBtn = mainMenu.querySelector('#purchaseBtn');
        if (existingBtn) {
            existingBtn.remove();
        }
        
        if (!this.isPurchased) {
            // Add purchase button to main menu
            const purchaseBtn = document.createElement('button');
            purchaseBtn.id = 'purchaseBtn';
            purchaseBtn.className = 'menu-btn purchase-btn';
            purchaseBtn.innerHTML = '💎 Unlock Full Game';
            purchaseBtn.addEventListener('click', () => this.purchaseFullGame());
            
            // Insert before settings button
            const settingsBtn = mainMenu.querySelector('#settingsBtn');
            if (settingsBtn) {
                mainMenu.insertBefore(purchaseBtn, settingsBtn);
            } else {
                mainMenu.appendChild(purchaseBtn);
            }
        }
        
        // Add purchase status indicator
        this.updatePurchaseStatus();
    }
    
    updatePurchaseStatus() {
        // Remove existing status
        const existingStatus = document.querySelector('.purchase-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        const statusDiv = document.createElement('div');
        statusDiv.className = 'purchase-status';
        
        if (this.isPurchased) {
            statusDiv.innerHTML = '✅ Full Game Unlocked';
            statusDiv.classList.add('purchased');
        } else {
            statusDiv.innerHTML = '🔒 Trial Version';
            statusDiv.classList.add('trial');
        }
        
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.appendChild(statusDiv);
        }
    }
    
    updateBattleScreen() {
        // Add trial limitations UI if not purchased
        if (!this.isPurchased) {
            this.showTrialLimitations();
        }
    }
    
    updateBaseScreen() {
        // Lock premium upgrades if not purchased
        if (!this.isPurchased) {
            this.lockPremiumUpgrades();
        }
    }
    
    showTrialLimitations() {
        const hud = document.getElementById('hud');
        if (!hud) return;
        
        // Remove existing trial indicator
        const existing = hud.querySelector('.trial-indicator');
        if (existing) {
            existing.remove();
        }
        
        const trialIndicator = document.createElement('div');
        trialIndicator.className = 'trial-indicator';
        trialIndicator.innerHTML = '🔒 Trial Mode';
        trialIndicator.addEventListener('click', () => this.purchaseFullGame());
        
        hud.appendChild(trialIndicator);
    }
    
    lockPremiumUpgrades() {
        const upgradeButtons = document.querySelectorAll('.upgrade-btn');
        upgradeButtons.forEach((btn, index) => {
            if (index > 5) { // Lock upgrades after the first few
                btn.classList.add('locked');
                btn.disabled = true;
                btn.innerHTML = '🔒 Premium';
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showPremiumFeatureDialog();
                });
            }
        });
    }
    
    showPremiumFeatureDialog() {
        this.showMessage('This feature is available in the full version. Unlock now for unlimited access!', 'premium');
        setTimeout(() => {
            this.purchaseFullGame();
        }, 2000);
    }
    
    // Game restriction checks
    canAccessWave(waveNumber) {
        if (this.isPurchased) return true;
        return waveNumber <= this.trialLimitations.maxWaves;
    }
    
    canAccessLevel(level) {
        if (this.isPurchased) return true;
        return level <= this.trialLimitations.maxLevel;
    }
    
    canAccessFeature(featureName) {
        if (this.isPurchased) return true;
        return !this.trialLimitations.restrictedFeatures.includes(featureName);
    }
    
    getTrialWaveLimit() {
        return this.trialLimitations.maxWaves;
    }
    
    // Utility methods
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(parseInt(price));
    }
    
    showMessage(message, type = 'info') {
        // Create a toast message
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getToastIcon(type)}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Hide toast after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
    
    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            premium: '💎'
        };
        return icons[type] || 'ℹ️';
    }
    
    // Debug methods
    resetPurchase() {
        this.setPurchased(false);
        console.log('Purchase state reset');
    }
    
    simulatePurchase() {
        this.setPurchased(true);
        console.log('Purchase simulated');
    }
}

// Global instance
window.paymentManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.paymentManager = new PaymentManager();
});

// Global debug functions for testing
window.debugPayment = {
    simulatePurchase: () => {
        if (window.paymentManager) {
            window.paymentManager.simulatePurchase();
        }
    },
    resetPurchase: () => {
        if (window.paymentManager) {
            window.paymentManager.resetPurchase();
        }
    },
    showPurchaseDialog: () => {
        if (window.paymentManager) {
            window.paymentManager.purchaseFullGame();
        }
    },
    checkStatus: () => {
        if (window.paymentManager) {
            console.log('Purchase Status:', {
                isPurchased: window.paymentManager.isPurchased,
                purchaseData: window.paymentManager.purchaseData,
                trialLimit: window.paymentManager.getTrialWaveLimit(),
                gameEngineConnected: !!(window.gameEngine && typeof window.gameEngine.onPurchaseStateChanged === 'function'),
                pendingStateChange: window.paymentManager.pendingStateChange
            });
        }
    },
    reconnect: () => {
        if (window.paymentManager) {
            window.paymentManager.connectToGameEngine();
        }
    }
};

console.log('Payment debug functions available:');
console.log('- debugPayment.simulatePurchase() - Simulate successful purchase');
console.log('- debugPayment.resetPurchase() - Reset to trial version');
console.log('- debugPayment.showPurchaseDialog() - Show purchase dialog');
console.log('- debugPayment.checkStatus() - Check current purchase status');
console.log('- debugPayment.reconnect() - Reconnect to game engine');