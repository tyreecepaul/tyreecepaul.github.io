// ===================================
// Asteroids Game
// ===================================

class Asteroids {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 300;
        this.canvas.height = 600;
        
        // Colors matching portfolio theme
        this.colors = {
            background: 'rgba(15, 15, 20, 0.4)',
            ship: '#6B7FD7',
            asteroid: '#8a9de8',
            bullet: '#5566c4',
            text: '#f5f5f5',
            score: '#b8b8c8'
        };
        
        this.aiMode = true;
        this.gameRunning = false;
        this.animationId = null;
        
        this.reset();
        this.setupControls();
    }
    
    reset() {
        // Ship
        this.ship = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            angle: 0,
            velocity: { x: 0, y: 0 },
            radius: 10,
            thrust: false,
            lives: 3
        };
        
        // Bullets
        this.bullets = [];
        this.maxBullets = 8;
        this.bulletSpeed = 5;
        
        // Asteroids
        this.asteroids = [];
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        
        // AI state
        this.aiTarget = null;
        this.aiShootCooldown = 0;
        this.aiTurnDirection = 0;
        
        // Spawn initial asteroids
        this.spawnAsteroids(4);
    }
    
    setupControls() {
        this.keys = {};
        
        document.addEventListener('keydown', (e) => {
            if (!this.aiMode && this.gameRunning) {
                this.keys[e.key] = true;
                
                // Spacebar to shoot
                if (e.key === ' ') {
                    e.preventDefault();
                    this.shootBullet();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (!this.aiMode && this.gameRunning) {
                this.keys[e.key] = false;
            }
        });
    }
    
    spawnAsteroids(count) {
        for (let i = 0; i < count; i++) {
            let x, y;
            // Spawn away from ship
            do {
                x = Math.random() * this.canvas.width;
                y = Math.random() * this.canvas.height;
            } while (this.distance(x, y, this.ship.x, this.ship.y) < 100);
            
            this.asteroids.push({
                x: x,
                y: y,
                velocity: {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2
                },
                radius: 30 + Math.random() * 20,
                size: 'large'
            });
        }
    }
    
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    shootBullet() {
        if (this.bullets.length < this.maxBullets) {
            const angle = this.ship.angle;
            this.bullets.push({
                x: this.ship.x + Math.cos(angle) * this.ship.radius,
                y: this.ship.y + Math.sin(angle) * this.ship.radius,
                velocity: {
                    x: Math.cos(angle) * this.bulletSpeed,
                    y: Math.sin(angle) * this.bulletSpeed
                },
                life: 60 // frames
            });
        }
    }
    
    updateShip() {
        if (this.aiMode) {
            this.updateAI();
        } else {
            this.updatePlayer();
        }
        
        // Apply velocity
        this.ship.x += this.ship.velocity.x;
        this.ship.y += this.ship.velocity.y;
        
        // Friction
        this.ship.velocity.x *= 0.99;
        this.ship.velocity.y *= 0.99;
        
        // Wrap around screen
        if (this.ship.x < 0) this.ship.x = this.canvas.width;
        if (this.ship.x > this.canvas.width) this.ship.x = 0;
        if (this.ship.y < 0) this.ship.y = this.canvas.height;
        if (this.ship.y > this.canvas.height) this.ship.y = 0;
    }
    
    updatePlayer() {
        // Rotate
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.ship.angle -= 0.1;
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.ship.angle += 0.1;
        }
        
        // Thrust
        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.ship.thrust = true;
            this.ship.velocity.x += Math.cos(this.ship.angle) * 0.15;
            this.ship.velocity.y += Math.sin(this.ship.angle) * 0.15;
        } else {
            this.ship.thrust = false;
        }
    }
    
    updateAI() {
        // Find nearest asteroid
        let nearestDist = Infinity;
        let nearest = null;
        
        for (let asteroid of this.asteroids) {
            const dist = this.distance(this.ship.x, this.ship.y, asteroid.x, asteroid.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = asteroid;
            }
        }
        
        if (nearest) {
            // Calculate angle to asteroid
            const targetAngle = Math.atan2(
                nearest.y - this.ship.y,
                nearest.x - this.ship.x
            );
            
            // Normalize angles
            let angleDiff = targetAngle - this.ship.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // Turn towards asteroid
            if (Math.abs(angleDiff) > 0.1) {
                this.ship.angle += Math.sign(angleDiff) * 0.08;
            }
            
            // Shoot if aimed well
            if (Math.abs(angleDiff) < 0.2 && this.aiShootCooldown === 0) {
                this.shootBullet();
                this.aiShootCooldown = 20;
            }
            
            // Move towards asteroid if far, away if too close
            if (nearestDist > 150) {
                this.ship.thrust = true;
                this.ship.velocity.x += Math.cos(this.ship.angle) * 0.1;
                this.ship.velocity.y += Math.sin(this.ship.angle) * 0.1;
            } else if (nearestDist < 80) {
                // Evade
                this.ship.velocity.x -= Math.cos(this.ship.angle) * 0.05;
                this.ship.velocity.y -= Math.sin(this.ship.angle) * 0.05;
                this.ship.thrust = false;
            }
        }
        
        if (this.aiShootCooldown > 0) this.aiShootCooldown--;
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            bullet.x += bullet.velocity.x;
            bullet.y += bullet.velocity.y;
            bullet.life--;
            
            // Wrap around
            if (bullet.x < 0) bullet.x = this.canvas.width;
            if (bullet.x > this.canvas.width) bullet.x = 0;
            if (bullet.y < 0) bullet.y = this.canvas.height;
            if (bullet.y > this.canvas.height) bullet.y = 0;
            
            // Remove if expired
            if (bullet.life <= 0) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateAsteroids() {
        for (let asteroid of this.asteroids) {
            asteroid.x += asteroid.velocity.x;
            asteroid.y += asteroid.velocity.y;
            
            // Wrap around
            if (asteroid.x < 0) asteroid.x = this.canvas.width;
            if (asteroid.x > this.canvas.width) asteroid.x = 0;
            if (asteroid.y < 0) asteroid.y = this.canvas.height;
            if (asteroid.y > this.canvas.height) asteroid.y = 0;
        }
    }
    
    checkCollisions() {
        // Bullets vs Asteroids
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                const asteroid = this.asteroids[j];
                
                if (this.distance(bullet.x, bullet.y, asteroid.x, asteroid.y) < asteroid.radius) {
                    // Remove bullet
                    this.bullets.splice(i, 1);
                    
                    // Split or remove asteroid
                    this.splitAsteroid(asteroid, j);
                    
                    // Score
                    if (asteroid.size === 'large') this.score += 20;
                    else if (asteroid.size === 'medium') this.score += 50;
                    else this.score += 100;
                    
                    break;
                }
            }
        }
        
        // Ship vs Asteroids
        for (let asteroid of this.asteroids) {
            if (this.distance(this.ship.x, this.ship.y, asteroid.x, asteroid.y) < 
                this.ship.radius + asteroid.radius) {
                this.ship.lives--;
                
                if (this.ship.lives <= 0) {
                    this.gameOver = true;
                } else {
                    // Respawn ship
                    this.ship.x = this.canvas.width / 2;
                    this.ship.y = this.canvas.height / 2;
                    this.ship.velocity = { x: 0, y: 0 };
                }
            }
        }
        
        // Check for level complete
        if (this.asteroids.length === 0 && !this.gameOver) {
            this.level++;
            this.spawnAsteroids(3 + this.level);
        }
    }
    
    splitAsteroid(asteroid, index) {
        this.asteroids.splice(index, 1);
        
        if (asteroid.size === 'large') {
            // Split into 2 medium asteroids
            for (let i = 0; i < 2; i++) {
                this.asteroids.push({
                    x: asteroid.x,
                    y: asteroid.y,
                    velocity: {
                        x: (Math.random() - 0.5) * 3,
                        y: (Math.random() - 0.5) * 3
                    },
                    radius: asteroid.radius / 2,
                    size: 'medium'
                });
            }
        } else if (asteroid.size === 'medium') {
            // Split into 2 small asteroids
            for (let i = 0; i < 2; i++) {
                this.asteroids.push({
                    x: asteroid.x,
                    y: asteroid.y,
                    velocity: {
                        x: (Math.random() - 0.5) * 4,
                        y: (Math.random() - 0.5) * 4
                    },
                    radius: asteroid.radius / 2,
                    size: 'small'
                });
            }
        }
        // Small asteroids just disappear
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ship
        this.drawShip();
        
        // Draw bullets
        for (let bullet of this.bullets) {
            this.ctx.fillStyle = this.colors.bullet;
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw asteroids
        for (let asteroid of this.asteroids) {
            this.ctx.strokeStyle = this.colors.asteroid;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Add some detail lines
            this.ctx.beginPath();
            this.ctx.moveTo(asteroid.x - asteroid.radius * 0.5, asteroid.y);
            this.ctx.lineTo(asteroid.x + asteroid.radius * 0.5, asteroid.y);
            this.ctx.stroke();
        }
        
        // Draw HUD
        this.drawHUD();
        
        // Draw game over
        if (this.gameOver) {
            this.drawGameOver();
        }
    }
    
    drawShip() {
        this.ctx.save();
        this.ctx.translate(this.ship.x, this.ship.y);
        this.ctx.rotate(this.ship.angle);
        
        // Ship triangle
        this.ctx.strokeStyle = this.colors.ship;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.ship.radius, 0);
        this.ctx.lineTo(-this.ship.radius, -this.ship.radius / 2);
        this.ctx.lineTo(-this.ship.radius, this.ship.radius / 2);
        this.ctx.closePath();
        this.ctx.stroke();
        
        // Thrust flame
        if (this.ship.thrust) {
            this.ctx.fillStyle = this.colors.bullet;
            this.ctx.beginPath();
            this.ctx.moveTo(-this.ship.radius, -this.ship.radius / 3);
            this.ctx.lineTo(-this.ship.radius - 8, 0);
            this.ctx.lineTo(-this.ship.radius, this.ship.radius / 3);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawHUD() {
        this.ctx.fillStyle = this.colors.score;
        this.ctx.font = '16px "JetBrains Mono", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
        this.ctx.fillText(`Level: ${this.level}`, 10, 45);
        this.ctx.fillText(`Lives: ${this.ship.lives}`, 10, 65);
        
        // Mode indicator
        this.ctx.font = '12px "JetBrains Mono", monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(
            this.aiMode ? 'AI MODE' : 'PLAYER MODE',
            this.canvas.width - 10,
            25
        );
    }
    
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(15, 15, 20, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '36px "JetBrains Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        this.ctx.font = '20px "JetBrains Mono", monospace';
        this.ctx.fillStyle = this.colors.ship;
        this.ctx.fillText(
            `Final Score: ${this.score}`,
            this.canvas.width / 2,
            this.canvas.height / 2 + 10
        );
        
        this.ctx.font = '14px "JetBrains Mono", monospace';
        this.ctx.fillStyle = this.colors.score;
        this.ctx.fillText(
            'Click RESET to play again',
            this.canvas.width / 2,
            this.canvas.height / 2 + 45
        );
    }
    
    update() {
        if (!this.gameOver) {
            this.updateShip();
            this.updateBullets();
            this.updateAsteroids();
            this.checkCollisions();
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    start() {
        this.gameRunning = true;
        this.gameLoop();
    }
    
    stop() {
        this.gameRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    toggleMode() {
        this.aiMode = !this.aiMode;
        this.keys = {}; // Reset keys
    }
    
    resetGame() {
        this.reset();
    }
}

// Initialize
let asteroidsGame;

document.addEventListener('DOMContentLoaded', function() {
    asteroidsGame = new Asteroids('asteroidsCanvas');
    if (!asteroidsGame.canvas) return;
    
    asteroidsGame.start();
    
    // Mode toggle button
    const modeBtn = document.getElementById('asteroidsModeBtn');
    if (modeBtn) {
        modeBtn.addEventListener('click', () => {
            asteroidsGame.toggleMode();
            modeBtn.textContent = asteroidsGame.aiMode ? 'Switch to Player Mode' : 'Switch to AI Mode';
        });
    }
    
    // Reset button
    const resetBtn = document.getElementById('asteroidsResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            asteroidsGame.resetGame();
        });
    }
    
    // Stop/start based on visibility
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                asteroidsGame.start();
            } else {
                asteroidsGame.stop();
            }
        });
    }, { threshold: 0.1 });
    
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        observer.observe(aboutSection);
    }
});
