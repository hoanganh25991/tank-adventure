// Simple Sound Manager for Skill Effects
// This is a placeholder system for demonstration

class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.musicVolume = 0.3; // Separate volume for background music
        this.sounds = {};
        this.audioContext = null;
        this.backgroundMusic = null;
        this.currentMusicTrack = null;
        
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
            
            // Enemy destruction sounds
            'enemy_basic_death': 200,     // G3 - standard death
            'enemy_heavy_death': 150,     // D#3 - heavy thud
            'enemy_fast_death': 400,      // G4 - quick death
            'enemy_sniper_death': 250,    // B3 - precision death
            'enemy_elite_death': 300,     // D4 - special death
            'enemy_berserker_death': 180, // F#3 - brutal death
            'enemy_support_death': 350,   // F4 - support death
            'enemy_boss_death': 100,      // G2 - massive death
            
            // Enemy abilities
            'enemy_special_ability': 500, // B4 - enemy using ability
            'shield_break': 800,          // G5 - shield breaking
            'critical_hit': 600,          // D5 - critical hit sound
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

    // Background Music Methods
    async loadBackgroundMusic(url) {
        try {
            console.log(`Loading background music: ${url}`);
            this.backgroundMusic = new Audio(url);
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = this.musicVolume;
            this.backgroundMusic.preload = 'auto';
            
            // Return a promise that resolves when the audio can play
            return new Promise((resolve, reject) => {
                this.backgroundMusic.addEventListener('canplaythrough', () => {
                    console.log('Background music loaded successfully');
                    resolve();
                });
                this.backgroundMusic.addEventListener('error', (e) => {
                    console.error('Failed to load background music:', e);
                    reject(e);
                });
            });
        } catch (error) {
            console.error('Error loading background music:', error);
            throw error;
        }
    }

    playBackgroundMusic(trackName = 'battle') {
        if (!this.enabled || !this.backgroundMusic) return;
        
        try {
            // Reset to beginning and play
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.volume = this.musicVolume;
            
            const playPromise = this.backgroundMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`🎵 Background music started: ${trackName}`);
                    this.currentMusicTrack = trackName;
                }).catch(error => {
                    console.warn('Background music play failed:', error);
                });
            }
        } catch (error) {
            console.warn('Error playing background music:', error);
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            console.log('🎵 Background music stopped');
            this.currentMusicTrack = null;
        }
    }

    pauseBackgroundMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
            console.log('🎵 Background music paused');
        }
    }

    resumeBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.paused && this.enabled) {
            const playPromise = this.backgroundMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('🎵 Background music resumed');
                }).catch(error => {
                    console.warn('Background music resume failed:', error);
                });
            }
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }

    // Set volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Enable/disable sound
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled && this.backgroundMusic) {
            this.pauseBackgroundMusic();
        }
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