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
            },
            freeze_blast: {
                cast: {
                    particles: { color: '#00ccff', count: 60, size: [3, 12], speed: [30, 120] },
                    screenFlash: { color: '#00ccff', intensity: 0.7, duration: 800 },
                    screenShake: { intensity: 8, duration: 600 },
                    sound: 'freeze_blast_cast'
                },
                during: {
                    aura: { color: '#00ccff', intensity: 0.6, pulse: true },
                    particles: { color: '#66ddff', count: 8, size: [2, 6], speed: [15, 40] },
                    interval: 100
                },
                exit: {
                    particles: { color: '#88eeff', count: 40, size: [4, 10], speed: [20, 70] },
                    sound: 'freeze_blast_end'
                }
            },
            lightning_storm: {
                cast: {
                    particles: { color: '#ffff00', count: 80, size: [2, 15], speed: [100, 200] },
                    screenFlash: { color: '#ffff00', intensity: 0.8, duration: 400 },
                    screenShake: { intensity: 12, duration: 500 },
                    sound: 'lightning_storm_cast'
                },
                during: {
                    aura: { color: '#ffff00', intensity: 0.4, pulse: true },
                    particles: { color: '#ffff88', count: 12, size: [1, 4], speed: [80, 150] },
                    interval: 50
                },
                exit: {
                    particles: { color: '#ffffaa', count: 50, size: [2, 8], speed: [60, 120] },
                    sound: 'lightning_storm_end'
                }
            },
            fire_nova: {
                cast: {
                    particles: { color: '#ff3300', count: 100, size: [4, 16], speed: [40, 180] },
                    screenFlash: { color: '#ff3300', intensity: 0.9, duration: 600 },
                    screenShake: { intensity: 10, duration: 700 },
                    sound: 'fire_nova_cast'
                },
                during: {
                    aura: { color: '#ff3300', intensity: 0.7, pulse: true },
                    particles: { color: '#ff6633', count: 15, size: [3, 8], speed: [20, 60] },
                    interval: 80
                },
                exit: {
                    particles: { color: '#ff9966', count: 60, size: [3, 12], speed: [30, 90] },
                    sound: 'fire_nova_end'
                }
            },
            vortex_field: {
                cast: {
                    particles: { color: '#9933ff', count: 70, size: [3, 14], speed: [50, 160] },
                    screenFlash: { color: '#9933ff', intensity: 0.6, duration: 500 },
                    screenShake: { intensity: 6, duration: 400 },
                    sound: 'vortex_field_cast'
                },
                during: {
                    aura: { color: '#9933ff', intensity: 0.5, pulse: true },
                    particles: { color: '#bb66ff', count: 10, size: [2, 6], speed: [30, 80] },
                    interval: 120
                },
                exit: {
                    particles: { color: '#dd99ff', count: 35, size: [4, 9], speed: [25, 70] },
                    sound: 'vortex_field_end'
                }
            },
            plasma_burst: {
                cast: {
                    particles: { color: '#00ffcc', count: 90, size: [3, 18], speed: [80, 220] },
                    screenFlash: { color: '#00ffcc', intensity: 0.8, duration: 300 },
                    screenShake: { intensity: 15, duration: 400 },
                    sound: 'plasma_burst_cast'
                },
                during: {
                    aura: { color: '#00ffcc', intensity: 0.3, pulse: false },
                    particles: { color: '#66ffdd', count: 6, size: [2, 5], speed: [60, 120] },
                    interval: 60
                },
                exit: {
                    particles: { color: '#99ffee', count: 25, size: [3, 7], speed: [40, 100] },
                    sound: 'plasma_burst_end'
                }
            },
            ice_barrier: {
                cast: {
                    particles: { color: '#aaffff', count: 50, size: [4, 12], speed: [20, 100] },
                    screenFlash: { color: '#aaffff', intensity: 0.5, duration: 600 },
                    screenShake: { intensity: 4, duration: 300 },
                    sound: 'ice_barrier_cast'
                },
                during: {
                    aura: { color: '#aaffff', intensity: 0.4, pulse: false },
                    particles: { color: '#ccffff', count: 3, size: [2, 4], speed: [10, 25] },
                    interval: 400
                },
                exit: {
                    particles: { color: '#eeffff', count: 30, size: [3, 8], speed: [15, 50] },
                    sound: 'ice_barrier_end'
                }
            },
            magnetic_pull: {
                cast: {
                    particles: { color: '#cc00ff', count: 60, size: [2, 10], speed: [60, 140] },
                    screenFlash: { color: '#cc00ff', intensity: 0.6, duration: 400 },
                    screenShake: { intensity: 5, duration: 350 },
                    sound: 'magnetic_pull_cast'
                },
                during: {
                    aura: { color: '#cc00ff', intensity: 0.45, pulse: true },
                    particles: { color: '#dd66ff', count: 8, size: [1, 5], speed: [40, 90] },
                    interval: 150
                },
                exit: {
                    particles: { color: '#ee99ff', count: 40, size: [2, 7], speed: [30, 80] },
                    sound: 'magnetic_pull_end'
                }
            },
            quantum_strike: {
                cast: {
                    particles: { color: '#ffffff', count: 120, size: [2, 20], speed: [100, 300] },
                    screenFlash: { color: '#ffffff', intensity: 1.0, duration: 200 },
                    screenShake: { intensity: 20, duration: 600 },
                    sound: 'quantum_strike_cast'
                },
                during: {
                    aura: { color: '#ffffff', intensity: 0.8, pulse: true },
                    particles: { color: '#ccccff', count: 20, size: [1, 8], speed: [50, 200] },
                    interval: 30
                },
                exit: {
                    particles: { color: '#ddddff', count: 80, size: [3, 15], speed: [80, 180] },
                    sound: 'quantum_strike_end'
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

        // Render special effects
        this.renderSpecialEffects();
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
        // Use template manager to create flash effect
        window.templateManager.showFlashEffect(color, intensity, duration);
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

    // Special effect methods for complex skills
    createLightningChain(startX, startY, targets) {
        const chainEffect = {
            type: 'lightning_chain',
            startX,
            startY,
            targets: targets.map(t => ({ x: t.x, y: t.y })),
            duration: 500,
            remainingDuration: 500,
            intensity: 1.0
        };
        this.activeEffects.push(chainEffect);
    }

    createPlasmaBurst(startX, startY, angle, range, width) {
        const burstEffect = {
            type: 'plasma_burst',
            startX,
            startY,
            angle,
            range,
            width,
            duration: 300,
            remainingDuration: 300,
            intensity: 1.0
        };
        this.activeEffects.push(burstEffect);
    }

    createQuantumStrike(fromX, fromY, toX, toY) {
        const teleportEffect = {
            type: 'quantum_teleport',
            fromX,
            fromY,
            toX,
            toY,
            duration: 200,
            remainingDuration: 200,
            intensity: 1.0
        };
        this.activeEffects.push(teleportEffect);
    }

    // Enhanced render method to handle special effects
    renderSpecialEffects() {
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            
            switch (effect.type) {
                case 'lightning_chain':
                    this.renderLightningChain(effect);
                    break;
                case 'plasma_burst':
                    this.renderPlasmaBurst(effect);
                    break;
                case 'quantum_teleport':
                    this.renderQuantumTeleport(effect);
                    break;
            }
            
            // Remove finished effects
            if (effect.remainingDuration <= 0) {
                this.activeEffects.splice(i, 1);
            }
        }
    }

    renderLightningChain(effect) {
        const ctx = this.ctx;
        const progress = 1 - (effect.remainingDuration / effect.duration);
        
        ctx.save();
        ctx.globalAlpha = effect.intensity * (1 - progress);
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3 + Math.sin(Date.now() * 0.02) * 2;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        
        // Draw chain from start to first target
        if (effect.targets.length > 0) {
            ctx.beginPath();
            ctx.moveTo(effect.startX, effect.startY);
            
            for (let i = 0; i < effect.targets.length; i++) {
                const target = effect.targets[i];
                // Add some randomness to the lightning
                const offsetX = (Math.random() - 0.5) * 20;
                const offsetY = (Math.random() - 0.5) * 20;
                ctx.lineTo(target.x + offsetX, target.y + offsetY);
            }
            
            ctx.stroke();
        }
        
        ctx.restore();
        effect.remainingDuration -= 16.67; // Assume 60 FPS
    }

    renderPlasmaBurst(effect) {
        const ctx = this.ctx;
        const progress = 1 - (effect.remainingDuration / effect.duration);
        
        ctx.save();
        ctx.globalAlpha = effect.intensity * (1 - progress);
        
        // Create plasma wave effect
        const gradient = ctx.createLinearGradient(
            effect.startX, effect.startY,
            effect.startX + Math.cos(effect.angle) * effect.range * progress,
            effect.startY + Math.sin(effect.angle) * effect.range * progress
        );
        gradient.addColorStop(0, '#00ffcc');
        gradient.addColorStop(0.5, '#66ffdd');
        gradient.addColorStop(1, 'rgba(0, 255, 204, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Draw plasma wave as a triangle
        const endX = effect.startX + Math.cos(effect.angle) * effect.range * progress;
        const endY = effect.startY + Math.sin(effect.angle) * effect.range * progress;
        const width = effect.width * progress;
        
        ctx.moveTo(effect.startX, effect.startY);
        ctx.lineTo(endX + Math.cos(effect.angle + Math.PI/2) * width/2, 
                   endY + Math.sin(effect.angle + Math.PI/2) * width/2);
        ctx.lineTo(endX + Math.cos(effect.angle - Math.PI/2) * width/2, 
                   endY + Math.sin(effect.angle - Math.PI/2) * width/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        effect.remainingDuration -= 16.67;
    }

    renderQuantumTeleport(effect) {
        const ctx = this.ctx;
        const progress = 1 - (effect.remainingDuration / effect.duration);
        
        ctx.save();
        ctx.globalAlpha = effect.intensity;
        
        // Create teleport portals
        const portalRadius = 30 + Math.sin(Date.now() * 0.01) * 10;
        
        // Source portal
        ctx.beginPath();
        ctx.arc(effect.fromX, effect.fromY, portalRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - progress})`;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Destination portal
        ctx.beginPath();
        ctx.arc(effect.toX, effect.toY, portalRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${progress})`;
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
        effect.remainingDuration -= 16.67;
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

    clearAllEffects() {
        // Clear all active effects
        this.activeEffects = [];
        
        // Clear screen effects
        this.screenEffects = [];
        
        // Clear shake effects
        this.shakeEffects = [];
        
        console.log('All skill effects cleared');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillEffects;
}