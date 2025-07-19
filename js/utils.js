// Utility Functions for Tank Adventure Game

class Utils {
    // Math utilities
    static distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    static normalizeAngle(angle) {
        // Normalize angle to be between -PI and PI
        return Math.atan2(Math.sin(angle), Math.cos(angle));
    }

    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Vector utilities
    static normalize(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    }

    static rotatePoint(x, y, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: x * cos - y * sin,
            y: x * sin + y * cos
        };
    }

    // Collision detection
    static circleCollision(x1, y1, r1, x2, y2, r2) {
        const distance = this.distance(x1, y1, x2, y2);
        return distance < (r1 + r2);
    }

    static rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    static pointInCircle(px, py, cx, cy, radius) {
        return this.distance(px, py, cx, cy) <= radius;
    }

    static pointInRect(px, py, rx, ry, width, height) {
        return px >= rx && px <= rx + width && py >= ry && py <= ry + height;
    }

    // Canvas utilities
    static clearCanvas(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
    }

    static drawCircle(ctx, x, y, radius, color, fill = true) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (fill) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
    }

    static drawRect(ctx, x, y, width, height, color, fill = true) {
        if (fill) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
        } else {
            ctx.strokeStyle = color;
            ctx.strokeRect(x, y, width, height);
        }
    }

    static drawLine(ctx, x1, y1, x2, y2, color, width = 1) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }

    static drawText(ctx, text, x, y, color = 'white', font = '16px Arial', align = 'center') {
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
    }

    // Local storage utilities
    static saveGame(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save game data:', e);
            return false;
        }
    }

    static loadGame(key, defaultData = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultData;
        } catch (e) {
            console.error('Failed to load game data:', e);
            return defaultData;
        }
    }

    // Animation utilities
    static easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    static easeIn(t) {
        return t * t;
    }

    static easeOut(t) {
        return t * (2 - t);
    }

    // Color utilities
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static interpolateColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        if (!c1 || !c2) return color1;
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        
        return this.rgbToHex(r, g, b);
    }

    // Touch/Mobile utilities
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Fullscreen utilities
    static requestFullscreen(element = document.documentElement) {
        if (!element) return Promise.reject(new Error('Element not found'));
        if (window.location.hostname == 'localhost' ) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const onFullscreenChange = () => {
                if (this.isFullscreen()) {
                    resolve();
                } else {
                    reject(new Error('Fullscreen request was cancelled'));
                }
                // Clean up event listeners
                document.removeEventListener('fullscreenchange', onFullscreenChange);
                document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
                document.removeEventListener('mozfullscreenchange', onFullscreenChange);
                document.removeEventListener('MSFullscreenChange', onFullscreenChange);
                
                // Also remove error listeners
                document.removeEventListener('fullscreenerror', onFullscreenError);
                document.removeEventListener('webkitfullscreenerror', onFullscreenError);
                document.removeEventListener('mozfullscreenerror', onFullscreenError);
                document.removeEventListener('MSFullscreenError', onFullscreenError);
            };
            
            const onFullscreenError = () => {
                reject(new Error('Fullscreen request failed'));
                // Clean up event listeners
                document.removeEventListener('fullscreenchange', onFullscreenChange);
                document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
                document.removeEventListener('mozfullscreenchange', onFullscreenChange);
                document.removeEventListener('MSFullscreenChange', onFullscreenChange);
                
                document.removeEventListener('fullscreenerror', onFullscreenError);
                document.removeEventListener('webkitfullscreenerror', onFullscreenError);
                document.removeEventListener('mozfullscreenerror', onFullscreenError);
                document.removeEventListener('MSFullscreenError', onFullscreenError);
            };
            
            // Add event listeners for fullscreen change and error
            document.addEventListener('fullscreenchange', onFullscreenChange);
            document.addEventListener('webkitfullscreenchange', onFullscreenChange);
            document.addEventListener('mozfullscreenchange', onFullscreenChange);
            document.addEventListener('MSFullscreenChange', onFullscreenChange);
            
            document.addEventListener('fullscreenerror', onFullscreenError);
            document.addEventListener('webkitfullscreenerror', onFullscreenError);
            document.addEventListener('mozfullscreenerror', onFullscreenError);
            document.addEventListener('MSFullscreenError', onFullscreenError);
            
            // Set a timeout to reject if fullscreen doesn't activate within 5 seconds
            setTimeout(() => {
                reject(new Error('Fullscreen request timeout'));
                // Clean up event listeners
                document.removeEventListener('fullscreenchange', onFullscreenChange);
                document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
                document.removeEventListener('mozfullscreenchange', onFullscreenChange);
                document.removeEventListener('MSFullscreenChange', onFullscreenChange);
                
                document.removeEventListener('fullscreenerror', onFullscreenError);
                document.removeEventListener('webkitfullscreenerror', onFullscreenError);
                document.removeEventListener('mozfullscreenerror', onFullscreenError);
                document.removeEventListener('MSFullscreenError', onFullscreenError);
            }, 5000);
            
            // Try to request fullscreen
            try {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullscreen) { // Safari
                    element.webkitRequestFullscreen();
                } else if (element.mozRequestFullScreen) { // Firefox
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) { // IE/Edge
                    element.msRequestFullscreen();
                } else {
                    reject(new Error('Fullscreen not supported'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    static exitFullscreen() {
        if (document.exitFullscreen) {
            return document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Safari
            return document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            return document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            return document.msExitFullscreen();
        } else {
            return Promise.reject(new Error('Exit fullscreen not supported'));
        }
    }

    static isFullscreen() {
        return !!(document.fullscreenElement || 
                  document.webkitFullscreenElement || 
                  document.mozFullScreenElement || 
                  document.msFullscreenElement);
    }

    static toggleFullscreen(element = document.documentElement) {
        if (this.isFullscreen()) {
            return this.exitFullscreen();
        } else {
            return this.requestFullscreen(element);
        }
    }

    static getTouchPos(canvas, touch) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
        };
    }

    static getMousePos(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    // Performance utilities
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Array utilities
    static shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    static removeFromArray(array, item) {
        const index = array.indexOf(item);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    }

    // Sound utilities (for future sound implementation)
    static playSound(audioElement, volume = 1.0) {
        if (audioElement && typeof audioElement.play === 'function') {
            audioElement.volume = volume;
            audioElement.currentTime = 0;
            audioElement.play().catch(e => console.warn('Could not play sound:', e));
        }
    }

    // Format utilities
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Export for use in other modules
window.Utils = Utils;