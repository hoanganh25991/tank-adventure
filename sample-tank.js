/**
 * Render tank (generic)
 */
renderTank(tank, color) {
    const { position, radius } = tank;
    
    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    
    // Get tank rotation angle from direction
    let rotation = 0;
    if (tank.direction) {
        rotation = Math.atan2(tank.direction.y, tank.direction.x);
    }
    this.ctx.rotate(rotation);
    
    // Debug: log first tank render
    if (!this.hasLoggedTankRender) {
        console.log('Rendering tank:', tank.id, 'position:', position, 'color:', color, 'radius:', radius);
        this.hasLoggedTankRender = true;
    }
    
    // Tank body (rectangular base)
    this.ctx.fillStyle = color;
    const bodyWidth = radius * 1.6;
    const bodyHeight = radius * 1.2;
    
    // Main tank body
    this.ctx.fillRect(-bodyWidth/2, -bodyHeight/2, bodyWidth, bodyHeight);
    
    // Tank body outline
    this.ctx.strokeStyle = this.darkenColor(color, 0.3);
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(-bodyWidth/2, -bodyHeight/2, bodyWidth, bodyHeight);
    
    // Tank turret (smaller rectangle on top)
    const turretWidth = radius * 1.0;
    const turretHeight = radius * 0.8;
    this.ctx.fillStyle = this.lightenColor(color, 0.1);
    this.ctx.fillRect(-turretWidth/2, -turretHeight/2, turretWidth, turretHeight);
    this.ctx.strokeRect(-turretWidth/2, -turretHeight/2, turretWidth, turretHeight);
    
    // Tank gun barrel
    this.ctx.fillStyle = this.darkenColor(color, 0.2);
    const barrelLength = radius * 1.2;
    const barrelWidth = radius * 0.15;
    this.ctx.fillRect(0, -barrelWidth/2, barrelLength, barrelWidth);
    this.ctx.strokeRect(0, -barrelWidth/2, barrelLength, barrelWidth);
    
    // Tank treads (side strips)
    this.ctx.fillStyle = this.darkenColor(color, 0.4);
    const treadWidth = radius * 0.2;
    // Left tread
    this.ctx.fillRect(-bodyWidth/2, -bodyHeight/2 - treadWidth/2, bodyWidth, treadWidth);
    // Right tread  
    this.ctx.fillRect(-bodyWidth/2, bodyHeight/2 - treadWidth/2, bodyWidth, treadWidth);
    
    // Collision box (debug)
    if (this.showCollisionBoxes) {
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
    }
    
    this.ctx.restore();
}