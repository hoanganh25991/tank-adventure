// Template Manager for HTML Template System
// This replaces dynamic HTML creation with predefined templates

class TemplateManager {
    constructor() {
        this.templates = {};
        this.containers = {};
        this.initializeTemplates();
        this.initializeContainers();
    }

    initializeTemplates() {
        // Get all template elements
        this.templates = {
            skillOption: document.getElementById('skillOptionTemplate'),
            damageText: document.getElementById('damageTextTemplate'),
            healText: document.getElementById('healTextTemplate'),
            battleNotification: document.getElementById('battleNotificationTemplate'),
            generalNotification: document.getElementById('generalNotificationTemplate'),
            flashEffect: document.getElementById('flashEffectTemplate'),
            bonusMessage: document.getElementById('bonusMessageTemplate')
        };

        // Verify templates exist
        for (const [key, template] of Object.entries(this.templates)) {
            if (!template) {
                console.error(`Template not found: ${key}`);
            }
        }
    }

    initializeContainers() {
        // Get all container elements
        this.containers = {
            notifications: document.getElementById('notificationContainer'),
            damageText: document.getElementById('damageTextContainer'),
            flashEffects: document.getElementById('flashEffectsContainer'),
            skillOptions: document.getElementById('skillOptions')
        };

        // Verify containers exist
        for (const [key, container] of Object.entries(this.containers)) {
            if (!container) {
                console.error(`Container not found: ${key}`);
            }
        }
    }

    // Clone a template and return the cloned element
    cloneTemplate(templateName) {
        const template = this.templates[templateName];
        if (!template) {
            console.error(`Template not found: ${templateName}`);
            return null;
        }

        const clone = template.cloneNode(true);
        clone.id = ''; // Remove template ID
        return clone;
    }

    // Create skill option from template
    createSkillOption(skill) {
        const skillElement = this.cloneTemplate('skillOption');
        if (!skillElement) return null;

        // Set unique ID and data attribute
        skillElement.id = `skill-${skill.id}`;
        skillElement.setAttribute('data-skill-id', skill.id);

        // Populate template content
        const skillName = skill.getLocalizedName ? skill.getLocalizedName() : skill.name;
        const skillDesc = skill.getLocalizedDescription ? skill.getLocalizedDescription() : skill.description;

        skillElement.querySelector('.skill-emoji').textContent = skill.emoji;
        skillElement.querySelector('.skill-name').textContent = skillName;
        skillElement.querySelector('.skill-description').textContent = skillDesc;
        skillElement.querySelector('.skill-type-value').textContent = skill.type;

        return skillElement;
    }

    // Create damage text from template
    createDamageText(damage, isHeal = false) {
        const templateName = isHeal ? 'healText' : 'damageText';
        const damageElement = this.cloneTemplate(templateName);
        if (!damageElement) return null;

        // Set damage value
        const damageValue = isHeal ? `+${damage.toFixed(0)}` : `-${damage.toFixed(0)}`;
        damageElement.querySelector('.damage-value').textContent = damageValue;

        return damageElement;
    }

    // Create notification from template
    createNotification(message, type = 'info') {
        const templateName = type === 'battle' ? 'battleNotification' : 'generalNotification';
        const notificationElement = this.cloneTemplate(templateName);
        if (!notificationElement) return null;

        // Add type class
        notificationElement.classList.add(type);

        // Set message content
        const contentElement = notificationElement.querySelector('.battle-notification-content') || 
                              notificationElement.querySelector('.notification-content');
        
        if (contentElement) {
            contentElement.textContent = message;
        }

        return notificationElement;
    }

    // Create flash effect from template
    createFlashEffect(color, intensity) {
        const flashElement = this.cloneTemplate('flashEffect');
        if (!flashElement) return null;

        // Set background style
        flashElement.style.background = `radial-gradient(circle at center, ${color.replace('#', 'rgba(').replace(/(.{2})(.{2})(.{2})/, '$1, $2, $3')}, ${intensity}) 0%, transparent 70%)`;

        return flashElement;
    }

    // Create bonus message from template
    createBonusMessage(message) {
        const bonusElement = this.cloneTemplate('bonusMessage');
        if (!bonusElement) return null;

        // Set message content
        bonusElement.querySelector('.bonus-message-content').textContent = message;
        bonusElement.id = 'bonusMessage';

        return bonusElement;
    }

    // Show skill selection with templates
    showSkillSelection(skillChoices, onSkillSelect) {
        this.clearContainer('skillOptions');

        skillChoices.forEach(skill => {
            const skillElement = this.createSkillOption(skill);
            if (skillElement) {
                // Create a wrapper function to handle the click properly
                const handleClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Skill clicked:', skill.id);
                    
                    // Check if already processing
                    if (skillElement.classList.contains('processing') || 
                        skillElement.classList.contains('selected')) {
                        console.log('Skill already processing/selected');
                        return;
                    }
                    
                    this.selectSkill(skillElement, skill.id, onSkillSelect);
                };
                
                // Simplified unified event handler for both touch and mouse
                skillElement.addEventListener('click', handleClick);
                
                // Visual feedback for touch (simplified)
                skillElement.addEventListener('touchstart', (e) => {
                    skillElement.style.transform = 'scale(0.98)';
                }, { passive: true });

                skillElement.addEventListener('touchend', (e) => {
                    skillElement.style.transform = 'scale(1)';
                }, { passive: true });

                // Add the element to container
                this.containers.skillOptions.appendChild(skillElement);
            }
        });
        
        // Force a reflow to ensure DOM is updated
        this.containers.skillOptions.offsetHeight;
        console.log('Skill selection UI updated with', skillChoices.length, 'options');
    }

    // Handle skill selection
    selectSkill(skillElement, skillId, onSkillSelect) {
        // Mark as selected
        skillElement.classList.add('selected');

        // Mark all others as processing
        const allSkills = this.containers.skillOptions.querySelectorAll('.skill-option');
        allSkills.forEach(option => {
            if (option !== skillElement) {
                option.classList.add('processing');
            }
        });

        // Call the callback
        if (onSkillSelect) {
            onSkillSelect(skillId);
        }
    }

    // Show damage text at position
    showDamageText(x, y, damage, isHeal = false) {
        const damageElement = this.createDamageText(damage, isHeal);
        if (!damageElement) return;

        // Position the damage text
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        
        damageElement.style.left = `${rect.left + (x / canvas.width) * rect.width}px`;
        damageElement.style.top = `${rect.top + (y / canvas.height) * rect.height}px`;

        this.containers.damageText.appendChild(damageElement);

        // Auto-remove after animation
        setTimeout(() => {
            if (damageElement.parentNode) {
                damageElement.parentNode.removeChild(damageElement);
            }
        }, 1000);
    }

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        const notificationElement = this.createNotification(message, type);
        if (!notificationElement) return;

        // Special handling for battle notifications
        if (type === 'battle') {
            // Center the notification
            notificationElement.style.position = 'fixed';
            notificationElement.style.top = '50%';
            notificationElement.style.left = '50%';
            notificationElement.style.transform = 'translate(-50%, -50%)';
            notificationElement.style.zIndex = '1000';
            
            // Add to body instead of container for battle notifications
            document.body.appendChild(notificationElement);
            
            // Auto-remove after 2 seconds
            setTimeout(() => {
                if (notificationElement.parentNode) {
                    notificationElement.parentNode.removeChild(notificationElement);
                }
            }, 2000);
        } else {
            // Regular notifications go to container
            this.containers.notifications.appendChild(notificationElement);

            // Auto-remove after specified duration
            setTimeout(() => {
                if (notificationElement.parentNode) {
                    notificationElement.classList.add('fade-out');
                    setTimeout(() => {
                        if (notificationElement.parentNode) {
                            notificationElement.parentNode.removeChild(notificationElement);
                        }
                    }, 300);
                }
            }, duration);
        }
    }

    // Show flash effect
    showFlashEffect(color, intensity, duration) {
        const flashElement = this.createFlashEffect(color, intensity);
        if (!flashElement) return;

        this.containers.flashEffects.appendChild(flashElement);

        // Auto-remove after animation
        setTimeout(() => {
            if (flashElement.parentNode) {
                flashElement.parentNode.removeChild(flashElement);
            }
        }, duration);
    }

    // Show bonus message
    showBonusMessage(message, targetElement) {
        const bonusElement = this.createBonusMessage(message);
        if (!bonusElement) return null;

        // Insert after the target element (usually battle result title)
        if (targetElement && targetElement.parentNode) {
            targetElement.parentNode.insertBefore(bonusElement, targetElement.nextSibling);
        } else {
            // Fallback - insert at the beginning of the battle results screen
            const battleResults = document.getElementById('battleResults');
            if (battleResults) {
                battleResults.insertBefore(bonusElement, battleResults.firstChild);
            }
        }

        return bonusElement;
    }

    // Clear a container
    clearContainer(containerName) {
        const container = this.containers[containerName];
        if (container) {
            container.innerHTML = '';
        }
    }


}

// Create global instance
window.templateManager = new TemplateManager();