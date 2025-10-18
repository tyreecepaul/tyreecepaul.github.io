// ===================================
// AI Pong Game
// ===================================

class Pong {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 600;
        this.canvas.height = 300;
        
        // Game colors - matching portfolio theme
        this.colors = {
            background: 'rgba(15, 15, 20, 0.4)',
            paddle: '#6B7FD7',
            ball: '#8a9de8',
            net: 'rgba(107, 127, 215, 0.3)',
            score: '#b8b8c8',
            text: '#f5f5f5'
        };
        
        // Ball properties
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 6,
            speedX: 3,
            speedY: 3,
            maxSpeed: 5
        };
        
        // Paddle properties
        this.paddleWidth = 8;
        this.paddleHeight = 60;
        this.paddleSpeed = 4;
        
        // Left paddle (AI 1 or Player)
        this.leftPaddle = {
            x: 20,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            score: 0,
            reactionDelay: 0,
            skill: 0.85
        };
        
        // Right paddle (AI 2)
        this.rightPaddle = {
            x: this.canvas.width - 20 - this.paddleWidth,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            score: 0,
            reactionDelay: 0,
            skill: 0.82
        };
        
        this.gameRunning = true;
        this.animationId = null;
        this.playerMode = false;
        this.maxScore = 7;
        this.gameOver = false;
        this.winner = null;
        
        this.playerMovement = {
            up: false,
            down: false
        };
        
        this.setupControls();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.playerMode) return;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.playerMovement.up = true;
            }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.playerMovement.down = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (!this.playerMode) return;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.playerMovement.up = false;
            }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.playerMovement.down = false;
            }
        });
    }
    
    drawCourt() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = this.colors.net;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawPaddle(paddle) {
        this.ctx.fillStyle = this.colors.paddle;
        this.ctx.fillRect(paddle.x, paddle.y, this.paddleWidth, this.paddleHeight);
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.colors.paddle;
        this.ctx.fillRect(paddle.x, paddle.y, this.paddleWidth, this.paddleHeight);
        this.ctx.shadowBlur = 0;
    }
    
    drawBall() {
        this.ctx.fillStyle = this.colors.ball;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.colors.ball;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    drawScores() {
        this.ctx.fillStyle = this.colors.score;
        this.ctx.font = '24px "JetBrains Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.leftPaddle.score.toString(), this.canvas.width / 4, 40);
        this.ctx.fillText(this.rightPaddle.score.toString(), (this.canvas.width * 3) / 4, 40);
        
        this.ctx.font = '10px "JetBrains Mono", monospace';
        this.ctx.fillStyle = this.colors.text;
        this.ctx.fillText(
            this.playerMode ? 'PLAYER vs AI' : 'AI vs AI',
            this.canvas.width / 2,
            20
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
        this.ctx.fillStyle = this.colors.paddle;
        this.ctx.fillText(`${this.winner} WINS!`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        
        this.ctx.font = '14px "JetBrains Mono", monospace';
        this.ctx.fillStyle = this.colors.score;
        this.ctx.fillText('Click RESET to play again', this.canvas.width / 2, this.canvas.height / 2 + 45);
    }
    
    movePlayer() {
        if (this.playerMovement.up) {
            this.leftPaddle.y -= this.paddleSpeed;
        }
        if (this.playerMovement.down) {
            this.leftPaddle.y += this.paddleSpeed;
        }
        
        if (this.leftPaddle.y < 0) this.leftPaddle.y = 0;
        if (this.leftPaddle.y + this.paddleHeight > this.canvas.height) {
            this.leftPaddle.y = this.canvas.height - this.paddleHeight;
        }
    }
    
    aiMove(paddle) {
        if (paddle.reactionDelay > 0) {
            paddle.reactionDelay--;
            return;
        }
        
        let targetY = this.ball.y;
        let error = (1 - paddle.skill) * this.paddleHeight;
        targetY += (Math.random() - 0.5) * error;
        
        let paddleCenter = paddle.y + this.paddleHeight / 2;
        
        if (paddleCenter < targetY - 10) {
            paddle.y += this.paddleSpeed;
        } else if (paddleCenter > targetY + 10) {
            paddle.y -= this.paddleSpeed;
        }
        
        if (paddle.y < 0) paddle.y = 0;
        if (paddle.y + this.paddleHeight > this.canvas.height) {
            paddle.y = this.canvas.height - this.paddleHeight;
        }
    }
    
    updateBall() {
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.speedY = -this.ball.speedY;
        }
        
        if (this.ball.x - this.ball.radius < this.leftPaddle.x + this.paddleWidth &&
            this.ball.y > this.leftPaddle.y &&
            this.ball.y < this.leftPaddle.y + this.paddleHeight &&
            this.ball.speedX < 0) {
            this.handlePaddleCollision(this.leftPaddle);
        }
        
        if (this.ball.x + this.ball.radius > this.rightPaddle.x &&
            this.ball.y > this.rightPaddle.y &&
            this.ball.y < this.rightPaddle.y + this.paddleHeight &&
            this.ball.speedX > 0) {
            this.handlePaddleCollision(this.rightPaddle);
        }
        
        if (this.ball.x < 0) {
            this.rightPaddle.score++;
            this.checkWinner();
            if (!this.gameOver) {
                this.resetBall();
            }
        } else if (this.ball.x > this.canvas.width) {
            this.leftPaddle.score++;
            this.checkWinner();
            if (!this.gameOver) {
                this.resetBall();
            }
        }
    }
    
    checkWinner() {
        if (this.leftPaddle.score >= this.maxScore) {
            this.gameOver = true;
            this.winner = this.playerMode ? 'PLAYER' : 'LEFT AI';
        } else if (this.rightPaddle.score >= this.maxScore) {
            this.gameOver = true;
            this.winner = 'RIGHT AI';
        }
    }
    
    handlePaddleCollision(paddle) {
        this.ball.speedX = -this.ball.speedX;
        
        let paddleCenter = paddle.y + this.paddleHeight / 2;
        let hitPos = (this.ball.y - paddleCenter) / (this.paddleHeight / 2);
        
        this.ball.speedY += hitPos * 2;
        
        if (Math.abs(this.ball.speedX) < this.ball.maxSpeed) {
            this.ball.speedX *= 1.05;
        }
        
        paddle.reactionDelay = Math.floor(Math.random() * 3) + 1;
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 3;
        this.ball.speedY = (Math.random() - 0.5) * 4;
        this.leftPaddle.reactionDelay = 20;
        this.rightPaddle.reactionDelay = 20;
    }
    
    resetGame() {
        this.leftPaddle.score = 0;
        this.rightPaddle.score = 0;
        this.gameOver = false;
        this.winner = null;
        this.resetBall();
        this.leftPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.rightPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
    }
    
    toggleMode() {
        this.playerMode = !this.playerMode;
        this.resetGame();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        if (!this.gameOver) {
            if (this.playerMode) {
                this.movePlayer();
            } else {
                this.aiMove(this.leftPaddle);
            }
            this.aiMove(this.rightPaddle);
            this.updateBall();
        }
        
        this.drawCourt();
        this.drawPaddle(this.leftPaddle);
        this.drawPaddle(this.rightPaddle);
        this.drawBall();
        this.drawScores();
        
        if (this.gameOver) {
            this.drawGameOver();
        }
        
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
}

// Initialize
let pongGame;

document.addEventListener('DOMContentLoaded', function() {
    pongGame = new Pong('pongCanvas');
    if (!pongGame.canvas) return;
    
    pongGame.start();
    
    const modeBtn = document.getElementById('pongModeBtn');
    if (modeBtn) {
        modeBtn.addEventListener('click', () => {
            pongGame.toggleMode();
            modeBtn.textContent = pongGame.playerMode ? 'Switch to AI vs AI' : 'Switch to Player vs AI';
        });
    }
    
    const resetBtn = document.getElementById('pongResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            pongGame.resetGame();
        });
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                pongGame.start();
            } else {
                pongGame.stop();
            }
        });
    }, { threshold: 0.1 });
    
    const homeSection = document.getElementById('home');
    if (homeSection) {
        observer.observe(homeSection);
    }
});
