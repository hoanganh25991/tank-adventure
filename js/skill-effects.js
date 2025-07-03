// Skill Effects System
// Handles visual effects for skills in three phases: cast, during, exit

class SkillEffects {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.ctx = gameEngine.ctx;
        this.activeEffects = [];
        this.screenEffects = [];
        this.shakeEffects = [];
        
        // Effect configurations for each skill type
        this.effectConfigs = {
            heal: {
                cast: {
                    particles: { color: '#00ff44', count: 20, size: [3, 8], speed: [50, 120] },
                    screenFlash: { color: '#00ff44', intensity: 0.3, duration: 300 },
                    screenShake: { intensity: 2, duration: 200 },
                    sound: 'heal_cast'
                },
                during: {
                    aura: { color: '#00ff44', intensity: 0.4, pulse: true },
                    particles: { color: '#44ff44', count: 2, size: [2, 4], speed: [20, 40] },
                    interval: 200
                },
                exit: {
                    particles: { color: '#88ff88', count: 10, size: [2, 5], speed: [30, 60] },
                    sound: 'heal_end'
                }
            },
            damage_boost: {
                cast: {
                    particles: { color: '#ff4444', count: 25, size: [4, 10], speed: [60, 140] },
                    screenFlash: { color: '#ff4444', intensity: 0.4, duration: 400 },
                    screenShake: { intensity: 4, duration: 300 },
                    sound: 'damage_boost_cast'
                },
                during: {
                    aura: { color: '#ff4444', intensity: 0.5, pulse: true },
                    particles: { color: '#ff6666', count: 3, size: [2, 6], speed: [25, 50] },
                    interval: 150
                },
                exit: {
                    particles: { color: '#ff8888', count: 15, size: [3, 7], speed: [40, 80] },
                    sound: 'damage_boost_end'
                }
            },
            speed_boost: {
                cast: {
                    particles: { color: '#44aaff', count: 30, size: [2, 6], speed: [80, 180] },
                    screenFlash: { color: '#44aaff', intensity: 0.35, duration: 250 },
                    screenShake: { intensity: 3, duration: 200 },
                    sound: 'speed_boost_cast'
                },
                during: {
                    aura: { color: '#44aaff', intensity: 0.3, pulse: true },
                    particles: { color: '#66bbff', count: 4, size: [1, 3], speed: [60, 100] },
                    interval: 100
                },
                exit: {
                    particles: { color: '#88ccff', count: 20, size: [2, 5], speed: [50, 90] },
                    sound: 'speed_boost_end'
                }
            },
            shield: {
                cast: {
                    particles: { color: '#ffaa44', count: 35, size: [3, 9], speed: [40, 100] },
                    screenFlash: { color: '#ffaa44', intensity: 0.45, duration: 500 },
                    screenShake: { intensity: 3, duration: 400 },
                    sound: 'shield_cast'
                },
                during: {
                    aura: { color: '#ffaa44', intensity: 0.6, pulse: false },
                    particles: { color: '#ffcc66', count: 2, size: [2, 5], speed: [15, 30] },
                    interval: 300
                },
                exit: {
                    particles: { color: '#ffdd88', count: 25, size: [4, 8], speed: [35, 70] },
                    sound: 'shield_end'
                }
            },
            explosive_shot: {
                cast: {
                    particles: { color: '#ff6600', count: 40, size: [3, 8], speed: [70, 150] },
                    screenFlash: { color: '#ff6600', intensity: 0.5, duration: 350 },
                    screenShake: { intensity: 6, duration: 400 },
                    sound: 'explosive_shot_cast'
                },
                during: {
                    aura: { color: '#ff6600', intensity: 0.4, pulse: true },
                    particles: { color: '#ff8833', count: 3, size: [2, 5], speed: [30, 60] },
                    interval: 180
                },
                exit: {
                    particles: { color: '#ffaa66', count: 18, size: [3, 6], speed: [45, 85] },
                    sound: 'explosive_shot_end'
                }
            },
            multi_shot: {
                cast: {
                    particles: { color: '#aa44ff', count: 45, size: [2, 7], speed: [90, 160] },
                    screenFlash: { color: '#aa44ff', intensity: 0.4, duration: 300 },
                    sound: 'multi_shot_cast'
                },
                during: {
                    aura: { color: '#aa44ff', intensity: 0.35, pulse: true },
                    particles: { color: '#bb66ff', count: 5, size: [1, 4], speed: [40, 80] },
                    interval: 120
                },
                exit: {
                    particles: { color: '#cc88ff', count: 22, size: [2, 6], speed: [50, 100] },
                    sound: 'multi_shot_end'
                }
            },
            time_slow: {
                cast: {
                    particles: { color: '#44ffff', count: 50, size: [4, 10], speed: [20, 80] },
                    screenFlash: { color: '#44ffff', intensity: 0.6, duration: 600 },
                    sound: 'time_slow_cast'
                },
                during: {
                    aura: { color: '#44ffff', intensity: 0.5, pulse: true },
                    particles: { color: '#66ffff', count: 6, size: [3, 7], speed: [10, 25] },
                    interval: 250
                },
                exit: {
                    particles: { color: '#88ffff', count: 30, size: [3, 8], speed: [25, 50] },
                    sound: 'time_slow_end'
                }
            },
            auto_repair: {
                cast: {
                    particles: { color: '#ffff44', count: 25, size: [3, 7], speed: [45, 110] },
                    screenFlash: { color: '#ffff44', intensity: 0.3, duration: 400 },
                    sound: 'auto_repair_cast'
                },
                during: {
                    aura: { color: '#ffff44', intensity: 0.25, pulse: true },
                    particles: { color: '#ffff66', count: 1, size: [2, 4], speed: [20, 35] },
                    interval: 500
                },
                exit: {
                    particles: { color: '#ffff88', count: 12, size: [2, 5], speed: [30, 60] },
                    sound: 'auto_repair_end'
                }
            }
        };
    }

    // Cast phase - when skill is activated
    triggerCastEffect(skillType, x, y) {
        const config = this.effectConfigs[skillType];
        if (!config) return;

        const castConfig = config.cast;
        
        // Create cast particles
        if (castConfig.particles) {
            this.createSkillParticles(
                x, y, 
                castConfig.particles.color,
                castConfig.particles.count,
                castConfig.particles.size,
                castConfig.particles.speed,
                'cast'
            );
        }

        // Create screen flash
        if (castConfig.screenFlash) {
            this.createScreenFlash(
                castConfig.screenFlash.color,
                castConfig.screenFlash.intensity,
                castConfig.screenFlash.duration
            );
        }

        // Create screen shake
        if (castConfig.screenShake) {
            this.createScreenShake(
                castConfig.screenShake.intensity,
                castConfig.screenShake.duration
            );
        }

        // Play sound effect (if sound system exists)
        if (castConfig.sound && this.gameEngine.soundManager) {
            this.gameEngine.soundManager.play(castConfig.sound);
        }
    }

    // During phase - continuous effects while skill is active
    startDuringEffect(skillType, skill) {
        const config = this.effectConfigs[skillType];
        if (!config || !config.during) return;

        const effect = {
            skillType,
            skill,
            config: config.during,
            timer: 0,
            active: true
        };

        this.activeEffects.push(effect);
    }

    // Exit phase - when skill ends
    triggerExitEffect(skillType, x, y) {
        const config = this.effectConfigs[skillType];
        if (!config) return;

        const exitConfig = config.exit;
        
        // Create exit particles
        if (exitConfig.particles) {
            this.createSkillParticles(
                x, y,
                exitConfig.particles.color,
                exitConfig.particles.count,
                exitConfig.particles.size,
                exitConfig.particles.speed,
                'exit'
            );
        }

        // Play sound effect
        if (exitConfig.sound && this.gameEngine.soundManager) {
            this.gameEngine.soundManager.play(exitConfig.sound);
        }

        // Remove the during effect
        this.activeEffects = this.activeEffects.filter(effect => 
            effect.skillType !== skillType || !effect.skill.isActive
        );
    }

    // Update continuous effects
    update(deltaTime) {
        // Update during effects
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            
            if (!effect.skill.isActive) {
                this.activeEffects.splice(i, 1);
                continue;
            }

            effect.timer += deltaTime;
            
            // Create periodic particles
            if (effect.timer >= effect.config.interval) {
                const player = this.gameEngine.player;
                if (player) {
                    this.createSkillParticles(
                        player.mainTank.x, player.mainTank.y,
                        effect.config.particles.color,
                        effect.config.particles.count,
                        effect.config.particles.size,
                        effect.config.particles.speed,
                        'during'
                    );
                }
                effect.timer = 0;
            }
        }

        // Update screen effects
        for (let i = this.screenEffects.length - 1; i >= 0; i--) {
            const effect = this.screenEffects[i];
            effect.timer += deltaTime;
            
            if (effect.timer >= effect.duration) {
                this.screenEffects.splice(i, 1);
            }
        }

        // Update screen shake effects
        for (let i = this.shakeEffects.length - 1; i >= 0; i--) {
            const shake = this.shakeEffects[i];
            shake.timer += deltaTime;
            
            if (shake.timer >= shake.duration) {
                this.shakeEffects.splice(i, 1);
                // Remove shake class from canvas
                const canvas = this.gameEngine.canvas;
                if (canvas) {
                    canvas.classList.remove('screen-shake');
                }
            }
        }
    }

    // Render visual effects
    render() {
        // Render screen effects
        for (const effect of this.screenEffects) {
            this.renderScreenEffect(effect);
        }

        // Render aura effects around player
        if (this.gameEngine.player) {
            this.renderPlayerAuras();
        }
    }

    // Create skill-specific particles
    createSkillParticles(x, y, color, count, sizeRange, speedRange, phase) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const speed = this.randomBetween(speedRange[0], speedRange[1]);
            const size = this.randomBetween(sizeRange[0], sizeRange[1]);
            
            let vx = Math.cos(angle) * speed;
            let vy = Math.sin(angle) * speed;
            
            // Adjust particle behavior based on phase
            if (phase === 'during') {
                // During effects move more slowly and orbit around player
                const orbitalSpeed = speed * 0.3;
                vx = Math.cos(angle) * orbitalSpeed;
                vy = Math.sin(angle) * orbitalSpeed;
            } else if (phase === 'exit') {
                // Exit effects move outward more dramatically
                vx *= 1.5;
                vy *= 1.5;
            }

            // Add special behaviors for specific skills
            let specialBehavior = null;
            if (color === '#44aaff' && phase === 'during') {
                // Speed boost - create trailing effect
                specialBehavior = 'trail';
            } else if (color === '#ff4444' && phase === 'during') {
                // Damage boost - create pulsing effect
                specialBehavior = 'pulse';
            } else if (color === '#ffaa44' && phase === 'during') {
                // Shield - create protective orbit
                specialBehavior = 'orbit';
            }

            const particle = {
                x: x + this.randomBetween(-10, 10),
                y: y + this.randomBetween(-10, 10),
                vx,
                vy,
                size,
                color,
                life: this.randomBetween(800, 1500),
                maxLife: this.randomBetween(800, 1500),
                alpha: 1,
                phase,
                specialBehavior,
                time: 0,
                originalX: x,
                originalY: y
            };

            this.gameEngine.particles.push(particle);
        }
    }

    // Create screen flash effect
    createScreenFlash(color, intensity, duration) {
        const effect = {
            type: 'flash',
            color,
            intensity,
            duration,
            timer: 0
        };

        this.screenEffects.push(effect);
        
        // Also create HTML overlay flash for better mobile visibility
        this.createHTMLFlash(color, intensity, duration);
    }

    // Create HTML overlay flash effect
    createHTMLFlash(color, intensity, duration) {
        const flashElement = document.createElement('div');
        flashElement.className = 'skill-cast-flash';
        flashElement.style.background = `radial-gradient(circle at center, ${color.replace('#', 'rgba(').replace(/(.{2})(.{2})(.{2})/, '$1, $2, $3')}, ${intensity}) 0%, transparent 70%)`;
        
        document.body.appendChild(flashElement);
        
        // Auto-remove after animation
        setTimeout(() => {
            if (flashElement.parentNode) {
                flashElement.parentNode.removeChild(flashElement);
            }
        }, duration);
    }

    // Create screen shake effect
    createScreenShake(intensity, duration) {
        const shake = {
            intensity,
            duration,
            timer: 0
        };

        this.shakeEffects.push(shake);
        
        // Apply shake class to canvas
        const canvas = this.gameEngine.canvas;
        if (canvas) {
            canvas.classList.add('screen-shake');
            // Create custom shake animation based on intensity
            const shakeKeyframes = this.generateShakeKeyframes(intensity);
            canvas.style.animation = `screenShake ${duration}ms ease-in-out`;
        }
    }

    // Generate shake keyframes based on intensity
    generateShakeKeyframes(intensity) {
        const keyframes = [];
        for (let i = 0; i <= 100; i += 10) {
            const x = (Math.random() - 0.5) * intensity;
            const y = (Math.random() - 0.5) * intensity;
            keyframes.push(`${i}% { transform: translate(${x}px, ${y}px); }`);
        }
        return keyframes.join(' ');
    }

    // Render screen effects
    renderScreenEffect(effect) {
        if (effect.type === 'flash') {
            const progress = effect.timer / effect.duration;
            const alpha = effect.intensity * (1 - progress);
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = effect.color;
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.restore();
        }
    }

    // Render aura effects around player
    renderPlayerAuras() {
        const player = this.gameEngine.player;
        if (!player) return;

        for (const effect of this.activeEffects) {
            if (!effect.config.aura) continue;

            const auraConfig = effect.config.aura;
            const time = Date.now() / 1000;
            
            let intensity = auraConfig.intensity;
            if (auraConfig.pulse) {
                intensity *= 0.5 + 0.5 * Math.sin(time * 4); // Pulse effect
            }

            this.ctx.save();
            this.ctx.globalAlpha = intensity;
            this.ctx.strokeStyle = auraConfig.color;
            this.ctx.lineWidth = 3;
            this.ctx.shadowColor = auraConfig.color;
            this.ctx.shadowBlur = 15;
            
            // Draw aura around main tank
            this.ctx.beginPath();
            this.ctx.arc(player.mainTank.x, player.mainTank.y, 25, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Draw aura around mini tanks
            for (const miniTank of player.miniTanks) {
                this.ctx.beginPath();
                this.ctx.arc(miniTank.x, miniTank.y, 18, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
    }

    // Get player position for effects
    getPlayerPosition() {
        if (!this.gameEngine.player) return { x: 0, y: 0 };
        return {
            x: this.gameEngine.player.mainTank.x,
            y: this.gameEngine.player.mainTank.y
        };
    }

    // Utility function
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Clean up effects when skill ends
    cleanup() {
        this.activeEffects = [];
        this.screenEffects = [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillEffects;
}