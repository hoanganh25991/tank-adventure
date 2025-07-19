// Unified Input Manager for Mobile-First Touch Controls
// Consolidates all input handling with minimal desktop support for development

class InputManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isDesktop = !('ontouchstart' in window);
        
        // Input state
        this.joystick = {
            isActive: false,
            x: 0,
            y: 0,
            touchId: null,
            baseRect: null,
            maxDistance: 35,
            deadzone: 0.15
        };
        
        // Button states
        this.buttons = {
            shoot: false,
            skill1: false,
            skill2: false,
            skill3: false
        };
        
        // Cached DOM elements
        this.elements = null;
        
        // Development keyboard support (minimal)
        this.keys = this.isDesktop ? {
            w: false, a: false, s: false, d: false, space: false
        } : {};
        
        this.initialize();
    }
    
    initialize() {
        this.cacheElements();
        this.setupEventListeners();
        console.log(`InputManager initialized for ${this.isDesktop ? 'desktop' : 'mobile'}`);
    }
    
    cacheElements() {
        this.elements = {
            joystickBase: document.getElementById('joystickBase'),
            joystickStick: document.getElementById('joystickStick'),
            primaryShootBtn: document.getElementById('primaryShootBtn'),
            skill1Btn: document.getElementById('skill1Btn'),
            skill2Btn: document.getElementById('skill2Btn'),
            skill3Btn: document.getElementById('skill3Btn'),
            battleScreen: document.getElementById('battleScreen')
        };
    }
    
    setupEventListeners() {
        // Primary touch events (mobile-first)
        if (!this.isDesktop) {
            this.setupTouchEvents();
        } else {
            // Minimal desktop support for development
            this.setupDesktopEvents();
        }
        
        // Unified button events
        this.setupButtonEvents();
        
        // Prevent context menu on mobile controls
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('#mobileControls')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    setupTouchEvents() {
        // Single touch event handler for joystick
        this.elements.joystickBase.addEventListener('touchstart', this.handleJoystickStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Prevent scrolling during gameplay
        document.addEventListener('touchmove', (e) => {
            if (this.isInBattle() && !this.isScrollableArea(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    setupDesktopEvents() {
        // Minimal desktop support for development
        this.elements.joystickBase.addEventListener('mousedown', this.handleJoystickStart.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // WASD keys for development
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    setupButtonEvents() {
        const buttons = [
            { element: this.elements.primaryShootBtn, action: 'shoot' },
            { element: this.elements.skill1Btn, action: 'skill1' },
            { element: this.elements.skill2Btn, action: 'skill2' },
            { element: this.elements.skill3Btn, action: 'skill3' }
        ];
        
        buttons.forEach(({ element, action }) => {
            if (!element) return;
            
            const handler = (e) => {
                e.preventDefault();
                this.handleButtonPress(action);
            };
            
            // Use touchstart for mobile, mousedown for desktop
            const eventType = this.isDesktop ? 'mousedown' : 'touchstart';
            element.addEventListener(eventType, handler, { passive: false });
        });
    }
    
    // Joystick handling
    handleJoystickStart(event) {
        if (!this.isInBattle()) return;
        
        event.preventDefault();
        this.joystick.isActive = true;
        this.joystick.baseRect = this.elements.joystickBase.getBoundingClientRect();
        
        if (event.type === 'touchstart') {
            this.joystick.touchId = event.touches[0].identifier;
            this.updateJoystickPosition(event.touches[0].clientX, event.touches[0].clientY);
        } else {
            this.updateJoystickPosition(event.clientX, event.clientY);
        }
    }
    
    handleTouchMove(event) {
        if (!this.joystick.isActive || !this.isInBattle()) return;
        
        // Find the relevant touch
        let touch = null;
        for (let i = 0; i < event.touches.length; i++) {
            if (event.touches[i].identifier === this.joystick.touchId) {
                touch = event.touches[i];
                break;
            }
        }
        
        if (touch) {
            event.preventDefault();
            this.updateJoystickPosition(touch.clientX, touch.clientY);
        }
    }
    
    handleMouseMove(event) {
        if (!this.joystick.isActive) return;
        this.updateJoystickPosition(event.clientX, event.clientY);
    }
    
    handleTouchEnd(event) {
        if (!this.joystick.isActive) return;
        
        // Check if our touch ended
        let touchEnded = true;
        for (let i = 0; i < event.touches.length; i++) {
            if (event.touches[i].identifier === this.joystick.touchId) {
                touchEnded = false;
                break;
            }
        }
        
        if (touchEnded) {
            this.resetJoystick();
        }
    }
    
    handleMouseUp() {
        this.resetJoystick();
    }
    
    updateJoystickPosition(clientX, clientY) {
        if (!this.joystick.baseRect) return;
        
        const centerX = this.joystick.baseRect.left + this.joystick.baseRect.width / 2;
        const centerY = this.joystick.baseRect.top + this.joystick.baseRect.height / 2;
        
        let deltaX = clientX - centerX;
        let deltaY = clientY - centerY;
        
        // Limit to max distance
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > this.joystick.maxDistance) {
            const ratio = this.joystick.maxDistance / distance;
            deltaX *= ratio;
            deltaY *= ratio;
        }
        
        // Update visual position
        this.elements.joystickStick.style.transform = 
            `translate(-50%, -50%) translate(${deltaX}px, ${deltaY}px)`;
        
        // Store normalized values
        this.joystick.x = deltaX / this.joystick.maxDistance;
        this.joystick.y = deltaY / this.joystick.maxDistance;
    }
    
    resetJoystick() {
        this.joystick.isActive = false;
        this.joystick.x = 0;
        this.joystick.y = 0;
        this.joystick.touchId = null;
        this.joystick.baseRect = null;
        this.elements.joystickStick.style.transform = 'translate(-50%, -50%)';
    }
    
    // Button handling
    handleButtonPress(action) {
        if (!this.isInBattle()) return;
        
        switch (action) {
            case 'shoot':
                this.gameEngine.ui?.handleShoot();
                break;
            case 'skill1':
                this.gameEngine.ui?.handleSkillUse(0);
                break;
            case 'skill2':
                this.gameEngine.ui?.handleSkillUse(1);
                break;
            case 'skill3':
                this.gameEngine.ui?.handleSkillUse(2);
                break;
        }
    }
    
    // Keyboard handling (development only)
    handleKeyDown(event) {
        if (!this.isDesktop) return;
        
        const key = event.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = true;
        }
        
        // Handle spacebar shooting
        if (key === ' ' && this.isInBattle()) {
            event.preventDefault();
            this.handleButtonPress('shoot');
        }
    }
    
    handleKeyUp(event) {
        if (!this.isDesktop) return;
        
        const key = event.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }
    }
    
    // Public interface
    getMovementInput() {
        if (!this.isInBattle()) return { x: 0, y: 0, magnitude: 0 };
        
        let x = this.joystick.x;
        let y = this.joystick.y;
        
        // Add keyboard input for development
        if (this.isDesktop) {
            if (this.keys.a) x -= 1;
            if (this.keys.d) x += 1;
            if (this.keys.w) y -= 1;
            if (this.keys.s) y += 1;
            
            // Normalize keyboard input
            const magnitude = Math.sqrt(x * x + y * y);
            if (magnitude > 1) {
                x /= magnitude;
                y /= magnitude;
            }
        }
        
        // Apply deadzone
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude < this.joystick.deadzone) {
            return { x: 0, y: 0, magnitude: 0 };
        }
        
        // Scale magnitude to remove deadzone effect
        const adjustedMagnitude = Math.min((magnitude - this.joystick.deadzone) / (1 - this.joystick.deadzone), 1);
        const normalizedX = magnitude > 0 ? x / magnitude : 0;
        const normalizedY = magnitude > 0 ? y / magnitude : 0;
        
        return {
            x: normalizedX * adjustedMagnitude,
            y: normalizedY * adjustedMagnitude,
            magnitude: adjustedMagnitude
        };
    }
    
    // Utility methods
    isInBattle() {
        return this.elements.battleScreen?.classList.contains('active') || false;
    }
    
    isScrollableArea(element) {
        return element.closest('#settingsContent') || 
               element.closest('.scrollable') ||
               element.closest('button') ||
               element.closest('.modal');
    }
    
    // Cleanup
    destroy() {
        // Remove all event listeners
        // This would be called when switching scenes or cleaning up
        console.log('InputManager destroyed');
    }
}