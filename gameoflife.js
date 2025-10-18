// ===================================
// Conway's Game of Life Background
// ===================================
class GameOfLife {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = options.cellSize || 10;
        this.updateInterval = options.updateInterval || 150;
        this.aliveColor = options.aliveColor || 'rgba(107, 127, 215, 0.6)';
        this.deadColor = options.deadColor || 'rgba(0, 0, 0, 0)';
        this.gridColor = options.gridColor || 'rgba(107, 127, 215, 0.05)';
        this.showGrid = options.showGrid !== undefined ? options.showGrid : false;
        
        this.cols = 0;
        this.rows = 0;
        this.grid = [];
        this.nextGrid = [];
        
        this.isRunning = false;
        this.animationId = null;
        this.lastUpdate = 0;
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // Set canvas size to window size
        this.resizeCanvas();
        
        // Calculate grid dimensions
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        
        // Initialize grids
        this.grid = this.createEmptyGrid();
        this.nextGrid = this.createEmptyGrid();
        
        // Seed with interesting patterns instead of pure random
        this.seedWithPatterns();
        
        // Track generations for auto-reset
        this.generation = 0;
        this.stableCount = 0;
        this.lastPopulation = 0;
    }
    
    createEmptyGrid() {
        const grid = [];
        for (let i = 0; i < this.rows; i++) {
            grid[i] = [];
            for (let j = 0; j < this.cols; j++) {
                grid[i][j] = 0;
            }
        }
        return grid;
    }
    
    randomize(probability = 0.15) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.grid[i][j] = Math.random() < probability ? 1 : 0;
            }
        }
    }
    
    addGlider(row, col) {
        // Classic glider pattern
        const pattern = [
            [0, 1, 0],
            [0, 0, 1],
            [1, 1, 1]
        ];
        
        for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < pattern[i].length; j++) {
                const r = (row + i) % this.rows;
                const c = (col + j) % this.cols;
                this.grid[r][c] = pattern[i][j];
            }
        }
    }
    
    addGliderGun(row, col) {
        // Gosper's Glider Gun (simplified version)
        const pattern = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
        
        for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < pattern[i].length; j++) {
                const r = (row + i) % this.rows;
                const c = (col + j) % this.cols;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    this.grid[r][c] = pattern[i][j];
                }
            }
        }
    }
    
    seedWithPatterns() {
        // Clear grid first
        this.grid = this.createEmptyGrid();
        
        // Add several gliders in random positions
        const numGliders = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numGliders; i++) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            this.addGlider(row, col);
        }
        
        // Occasionally add a glider gun
        if (Math.random() < 0.3 && this.cols > 40) {
            const row = Math.floor(Math.random() * (this.rows - 10));
            const col = Math.floor(Math.random() * (this.cols - 40));
            this.addGliderGun(row, col);
        }
        
        // Add some random cells for variety (much lower density)
        this.randomize(0.08);
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.init();
        });
    }
    
    countNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const newRow = (row + i + this.rows) % this.rows;
                const newCol = (col + j + this.cols) % this.cols;
                
                count += this.grid[newRow][newCol];
            }
        }
        return count;
    }
    
    update() {
        // Apply Conway's Game of Life rules STRICTLY
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const neighbors = this.countNeighbors(i, j);
                const cell = this.grid[i][j];
                
                if (cell === 1) {
                    // Cell is alive
                    // Rule 1: Any live cell with fewer than 2 neighbors dies (underpopulation)
                    // Rule 2: Any live cell with 2 or 3 neighbors lives on
                    // Rule 3: Any live cell with more than 3 neighbors dies (overpopulation)
                    if (neighbors === 2 || neighbors === 3) {
                        this.nextGrid[i][j] = 1; // Survives
                    } else {
                        this.nextGrid[i][j] = 0; // Dies
                    }
                } else {
                    // Cell is dead
                    // Rule 4: Any dead cell with exactly 3 neighbors becomes alive (reproduction)
                    if (neighbors === 3) {
                        this.nextGrid[i][j] = 1; // Becomes alive
                    } else {
                        this.nextGrid[i][j] = 0; // Stays dead
                    }
                }
            }
        }
        
        // Swap grids
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
        
        // Track population and check for stability
        this.generation++;
        const currentPopulation = this.countPopulation();
        
        // Check if population is stable or dead
        if (currentPopulation === 0) {
            // All cells died, reset
            this.reset();
        } else if (Math.abs(currentPopulation - this.lastPopulation) < 5) {
            this.stableCount++;
            if (this.stableCount > 50) {
                // Population has been stable for 50 generations, reset
                this.reset();
            }
        } else {
            this.stableCount = 0;
        }
        
        this.lastPopulation = currentPopulation;
    }
    
    countPopulation() {
        let count = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                count += this.grid[i][j];
            }
        }
        return count;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.deadColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cells
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.grid[i][j] === 1) {
                    this.ctx.fillStyle = this.aliveColor;
                    this.ctx.fillRect(
                        j * this.cellSize,
                        i * this.cellSize,
                        this.cellSize - 1,
                        this.cellSize - 1
                    );
                }
            }
        }
        
        // Draw grid lines (optional)
        if (this.showGrid) {
            this.ctx.strokeStyle = this.gridColor;
            this.ctx.lineWidth = 1;
            
            for (let i = 0; i <= this.rows; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, i * this.cellSize);
                this.ctx.lineTo(this.canvas.width, i * this.cellSize);
                this.ctx.stroke();
            }
            
            for (let j = 0; j <= this.cols; j++) {
                this.ctx.beginPath();
                this.ctx.moveTo(j * this.cellSize, 0);
                this.ctx.lineTo(j * this.cellSize, this.canvas.height);
                this.ctx.stroke();
            }
        }
    }
    
    animate(timestamp) {
        if (!this.isRunning) return;
        
        // Update at fixed interval
        if (timestamp - this.lastUpdate >= this.updateInterval) {
            this.update();
            this.draw();
            this.lastUpdate = timestamp;
        }
        
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastUpdate = performance.now();
        this.animate(this.lastUpdate);
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    reset() {
        this.stop();
        this.init();
        this.draw();
        this.start();
    }
    
    clear() {
        this.grid = this.createEmptyGrid();
        this.nextGrid = this.createEmptyGrid();
        this.draw();
    }
}

// Initialize Game of Life when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const gameOfLife = new GameOfLife('gameOfLifeCanvas', {
        cellSize: 25,
        updateInterval: 350,
        aliveColor: 'rgba(107, 127, 215, 0.08)',
        deadColor: 'rgba(0, 0, 0, 0)',
        gridColor: 'rgba(107, 127, 215, 0.02)',
        showGrid: false
    });
    
    gameOfLife.start();
    
    // Manual reset every 2 minutes as backup
    setInterval(() => {
        if (gameOfLife.isRunning) {
            gameOfLife.reset();
        }
    }, 120000);
});
