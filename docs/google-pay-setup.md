# Google Pay Integration Setup Guide

## Overview
Tank Adventure now includes Google Pay integration for a one-time purchase of 20,000 VND to unlock the full game. This document explains how to configure the payment system for production use.

## Current Implementation

### Trial Version Features
- Limited to 5 waves maximum
- Reduced rewards (50% of normal)
- Some premium upgrades locked
- Trial indicators shown in UI

### Full Version Features
- Unlimited waves and battles
- Full rewards and experience
- All upgrades unlocked
- No restrictions or limitations
- All future updates included

## Configuration Steps

### 1. Google Pay Merchant Setup
1. Create a Google Pay merchant account at [Google Pay Console](https://pay.google.com/business/console)
2. Complete merchant verification process
3. Obtain your Merchant ID

### 2. Update Payment Configuration
Edit `js/payment-manager.js` and update the `paymentConfig` object:

```javascript
this.paymentConfig = {
    environment: 'PRODUCTION', // Change from 'TEST' to 'PRODUCTION'
    merchantId: 'your-actual-merchant-id', // Replace with your real merchant ID
    merchantName: 'Tank Adventure',
    price: '20000',
    currency: 'VND',
    productId: 'tank_adventure_full_game',
    productName: 'Tank Adventure - Full Game',
    productDescription: 'Unlock the complete Tank Adventure experience with unlimited gameplay, all features, and future updates.'
};
```

### 3. Payment Gateway Integration
Update the tokenization specification in the `createPaymentDataRequest()` method:

```javascript
tokenizationSpecification: {
    type: 'PAYMENT_GATEWAY',
    parameters: {
        gateway: 'your-payment-gateway', // e.g., 'stripe', 'square', etc.
        gatewayMerchantId: 'your-gateway-merchant-id'
    }
}
```

### 4. Server-Side Payment Processing
Implement server-side payment verification in the `processPayment()` method:

```javascript
async processPayment(paymentData) {
    try {
        // Send payment data to your server for processing
        const response = await fetch('/api/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentData: paymentData,
                productId: this.paymentConfig.productId,
                amount: this.paymentConfig.price,
                currency: this.paymentConfig.currency
            })
        });
        
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Payment processing error:', error);
        return false;
    }
}
```

## Testing

### Debug Functions
Use these console commands for testing:

```javascript
// Simulate successful purchase
debugPayment.simulatePurchase();

// Reset to trial version
debugPayment.resetPurchase();

// Show purchase dialog
debugPayment.showPurchaseDialog();

// Check current status
debugPayment.checkStatus();
```

### Test Flow
1. Start the game (should show trial version)
2. Play until wave 5 (trial limit)
3. Purchase dialog should appear
4. Test purchase flow
5. Verify full game is unlocked

## Security Considerations

### Payment Verification
- Always verify payments server-side
- Never trust client-side payment confirmations alone
- Implement proper receipt validation
- Store purchase records securely

### Data Protection
- Purchase data is stored in localStorage
- Consider encrypting sensitive data
- Implement backup/restore mechanisms
- Handle data migration for updates

## Deployment Checklist

- [ ] Update merchant ID to production value
- [ ] Change environment to 'PRODUCTION'
- [ ] Configure payment gateway credentials
- [ ] Implement server-side payment processing
- [ ] Test payment flow thoroughly
- [ ] Verify purchase persistence
- [ ] Test trial limitations
- [ ] Validate UI updates after purchase

## Support

### Common Issues
1. **Google Pay not available**: Check browser compatibility and HTTPS requirement
2. **Payment fails**: Verify merchant configuration and gateway setup
3. **Purchase not persisting**: Check localStorage functionality
4. **Trial limits not working**: Verify payment manager integration

### Troubleshooting
- Check browser console for errors
- Verify Google Pay API is loaded
- Test with different payment methods
- Validate server-side processing

## Files Modified
- `js/payment-manager.js` - Main payment logic
- `js/game-engine.js` - Game integration
- `js/ui.js` - UI updates
- `css/game.css` - Payment UI styles
- `index.html` - Script includes and initialization

## Price Configuration
Current price: 20,000 VND (Vietnamese Dong)
- Approximately $0.80 USD
- One-time purchase
- Lifetime access
- No recurring fees
- Includes all future updates