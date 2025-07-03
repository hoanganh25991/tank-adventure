// Simple Sound Manager for Skill Effects
// This is a placeholder system for demonstration

class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.sounds = {};
        this.audioContext = null;
        
        // Initialize Web Audio API if available
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported, using fallback');
        }
    }

    // Play a sound effect
    play(soundId, options = {}) {
        if (!this.enabled) return;
        
        // For now, just log the sound that would be played
        console.log(`🔊 Playing sound: ${soundId}`);
        
        // Generate a simple tone for demonstration
        if (this.audioContext) {
            this.playTone(this.getSoundFrequency(soundId), 0.1, options.volume || this.volume);
        }
    }

    // Get frequency for different sound types
    getSoundFrequency(soundId) {
        const frequencies = {
            'heal_cast': 440,        // A4 - soothing
            'heal_end': 523,         // C5 - completion
            'damage_boost_cast': 329, // E4 - aggressive
            'damage_boost_end': 261, // C4 - fade out
            'speed_boost_cast': 659, // E5 - energetic
            'speed_boost_end': 523,  // C5 - slow down
            'shield_cast': 349,      // F4 - protective
            'shield_end': 293,       // D4 - fade
            'explosive_shot_cast': 220, // A3 - deep boom
            'explosive_shot_end': 147,  // D3 - rumble
            'multi_shot_cast': 392,     // G4 - rapid
            'multi_shot_end': 330,      // E4 - settle
            'time_slow_cast': 200,      // G3 - mystical
            'time_slow_end': 400,       // G4 - return to normal
            'auto_repair_cast': 466,    // A#4 - mechanical
            'auto_repair_end': 392,     // G4 - completion
            // Tank shooting sounds
            'main_tank_shoot': 180,     // A3 - deep powerful shot
            'mini_tank_shoot': 300,     // D4 - lighter shot
            'main_tank_hit': 250,       // B3 - heavy impact
            'mini_tank_hit': 350,       // F4 - lighter impact
            'main_tank_explosion': 120  // A2 - deep explosion
        };
        
        return frequencies[soundId] || 440;
    }

    // Generate a simple tone
    playTone(frequency, duration, volume = 0.5) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Set volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Enable/disable sound
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // Load sound files (placeholder for future implementation)
    loadSound(soundId, url) {
        // This would load actual audio files in a full implementation
        console.log(`Loading sound: ${soundId} from ${url}`);
        return Promise.resolve();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}