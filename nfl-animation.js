// ===================================
// NFL Player Tracking Animation
// Simulates NFL Big Data Bowl 2026 player tracking visualization
// Based on real NFL tracking data format
// ===================================

class NFLAnimation {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Field dimensions (in yards)
        this.fieldLength = 120; // Including endzones
        this.fieldWidth = 53.3;
        
        // Animation state
        this.currentFrame = 0;
        this.maxFrames = 30;
        this.isPlaying = true;
        this.playData = null;
        this.playsCollection = null;
        this.currentPlayIndex = 0;
        this.useRealData = true; // Flag to use real NFL data
        
        // Animation timing control
        this.fps = 5; // Frames per second (reduced from 60 for slower playback)
        this.frameInterval = 1000 / this.fps;
        this.lastFrameTime = 0;
        
        // Role colors matching the Kaggle notebook
        this.roleColors = {
            'Targeted Receiver': '#ff4444',
            'Passer': '#4444ff',
            'Defensive Coverage': '#ffdd44',
            'Other Route Runner': '#ff8844',
            'Ball': '#000000'
        };
        
        // UI elements
        this.createControls();
        this.createTitleElement();
        
        this.init();
        this.setupEventListeners();
    }
    
    createTitleElement() {
        // Create title element below the canvas
        this.titleElement = document.createElement('div');
        this.titleElement.className = 'showcase-title';
        this.container.appendChild(this.titleElement);
    }
    
    async init() {
        this.resizeCanvas();
        
        // Try to load real data first
        const loaded = await this.loadRealData();
        
        if (!loaded) {
            console.log('Could not load real data, using simulated data');
            this.useRealData = false;
            this.generatePlayData();
        }
        
        this.animate();
    }
    
    async loadRealData() {
        try {
            // Try to load the plays collection
            const response = await fetch('data/nfl_plays_collection.json');
            
            if (!response.ok) {
                throw new Error('Failed to load plays collection');
            }
            
            const data = await response.json();
            this.playsCollection = data.plays;
            
            if (this.playsCollection && this.playsCollection.length > 0) {
                console.log(`Loaded ${this.playsCollection.length} real NFL plays`);
                this.loadPlay(0);
                this.updatePlaySelector();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading real NFL data:', error);
            return false;
        }
    }
    
    loadPlay(index) {
        if (!this.playsCollection || index >= this.playsCollection.length) {
            return;
        }
        
        this.currentPlayIndex = index;
        const playData = this.playsCollection[index];
        
        // Store frame boundaries for visualization
        this.numInputFrames = playData.num_input_frames;
        this.numOutputFrames = playData.num_output_frames;
        this.throwFrame = playData.num_input_frames; // Ball thrown at end of input frames
        
        // Convert real data format to animation format
        this.playData = {
            gameId: playData.game_id,
            playId: playData.play_id,
            playDirection: playData.play_direction,
            lineOfScrimmage: playData.line_of_scrimmage,
            ballLandX: playData.ball_land_x,
            ballLandY: playData.ball_land_y,
            releaseFrame: playData.num_input_frames - 5, // Ball starts moving 5 frames before throw
            catchFrame: playData.num_input_frames + Math.floor(playData.num_output_frames * 0.3),
            players: playData.players.map(p => ({
                id: p.position + p.nfl_id.slice(-2),
                name: p.name,
                role: p.role,
                position: p.position,
                trajectory: p.trajectory.map(t => ({
                    x: t.x,
                    y: t.y,
                    o: t.o,
                    s: t.s,
                    a: t.a,
                    dir: t.dir
                }))
            }))
        };
        
        this.maxFrames = playData.total_frames;
        this.currentFrame = 0;
        
        // Update title text
        this.updateTitleText();
        
        console.log(`Loaded Play: Game ${playData.game_id}, Play ${playData.play_id}`);
        console.log(`  - Input frames (pre-throw): ${playData.num_input_frames}`);
        console.log(`  - Output frames (post-throw): ${playData.num_output_frames}`);
        console.log(`  - Total frames: ${playData.total_frames}`);
    }
    
    resizeCanvas() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Calculate scale to fit field with more padding for UI elements
        const paddingX = 30;
        const paddingY = 80; // More padding on Y to account for controls and legend
        this.scaleX = (this.canvas.width - paddingX * 2) / this.fieldLength;
        this.scaleY = (this.canvas.height - paddingY * 2) / this.fieldWidth;
        this.scale = Math.min(this.scaleX, this.scaleY);
        
        // Center the field
        this.offsetX = (this.canvas.width - this.fieldLength * this.scale) / 2;
        this.offsetY = (this.canvas.height - this.fieldWidth * this.scale) / 2;
    }
    
    createControls() {
        // Left side control panel - positioned at top of left info section
        const leftControlsDiv = document.createElement('div');
        leftControlsDiv.style.cssText = `
            position: absolute;
            left: 15px;
            top: 15px;
            display: flex;
            gap: 8px;
            align-items: center;
            background: rgba(0, 0, 0, 0.85);
            padding: 8px 10px;
            border-radius: 8px;
            border: 1px solid rgba(16, 163, 127, 0.5);
            width: 140px;
        `;
        
        // Play/Pause button
        this.playBtn = document.createElement('button');
        this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        this.playBtn.style.cssText = `
            background: #10a37f;
            border: none;
            color: #000;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: all 0.3s ease;
            flex-shrink: 0;
        `;
        this.playBtn.addEventListener('click', () => this.togglePlay());
        
        // Restart button
        this.restartBtn = document.createElement('button');
        this.restartBtn.innerHTML = '<i class="fas fa-redo"></i>';
        this.restartBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: all 0.3s ease;
            flex-shrink: 0;
        `;
        this.restartBtn.addEventListener('click', () => this.restart());
        
        leftControlsDiv.appendChild(this.playBtn);
        leftControlsDiv.appendChild(this.restartBtn);
        
        this.container.appendChild(leftControlsDiv);
        
        // Play selector (will be populated when data loads) - positioned on left side
        this.playSelector = document.createElement('select');
        this.playSelector.style.cssText = `
            position: absolute;
            left: 15px;
            bottom: 70px;
            background: rgba(0, 0, 0, 0.85);
            border: 1px solid rgba(16, 163, 127, 0.5);
            color: #fff;
            padding: 8px 10px;
            border-radius: 6px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            cursor: pointer;
            display: none;
            width: 140px;
            max-width: 140px;
        `;
        this.playSelector.addEventListener('change', (e) => {
            const index = parseInt(e.target.value);
            this.loadPlay(index);
            this.restart();
        });
        this.container.appendChild(this.playSelector);
        
        // Info badge
        this.infoBadge = document.createElement('div');
        this.infoBadge.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(0, 0, 0, 0.8);
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            color: #10a37f;
        `;
        this.infoBadge.innerHTML = '<i class="fas fa-database"></i> NFL Big Data Bowl 2026';
        this.container.appendChild(this.infoBadge);
    }
    
    updatePlaySelector() {
        if (!this.playsCollection || this.playsCollection.length === 0) {
            return;
        }
        
        // Clear existing options
        this.playSelector.innerHTML = '';
        
        // Add options for each play (shorter labels for vertical layout)
        this.playsCollection.forEach((play, index) => {
            const option = document.createElement('option');
            option.value = index;
            // Shorter format: "Play 1: 2023090700"
            const gameShort = play.game_id.toString().slice(-8);
            option.textContent = `Play ${index + 1}: ${gameShort}`;
            this.playSelector.appendChild(option);
        });
        
        // Show selector
        this.playSelector.style.display = 'block';
        
        // Update badge
        this.infoBadge.innerHTML = '<i class="fas fa-check-circle"></i> Real NFL Data Loaded';
    }
    
    setupEventListeners() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeCanvas();
            }, 100);
        });
    }
    
    generatePlayData() {
        // Simulate a passing play with realistic NFL player movements
        // Game ID: 2023_01, Play ID: 42 (example)
        
        const playDirection = 'right';
        const lineOfScrimmage = 25;
        const ballLandX = 60;
        const ballLandY = 26;
        
        // Define players
        const players = [
            // Passer (QB)
            {
                id: 'QB12',
                role: 'Passer',
                startX: lineOfScrimmage - 7,
                startY: 26.65,
                trajectory: this.generateQBTrajectory(lineOfScrimmage - 7, 26.65)
            },
            // Targeted Receiver
            {
                id: 'WR18',
                role: 'Targeted Receiver',
                startX: lineOfScrimmage + 2,
                startY: 15,
                trajectory: this.generateReceiverTrajectory(lineOfScrimmage + 2, 15, ballLandX, ballLandY)
            },
            // Other Route Runners
            {
                id: 'WR11',
                role: 'Other Route Runner',
                startX: lineOfScrimmage,
                startY: 5,
                trajectory: this.generateRouteTrajectory(lineOfScrimmage, 5, 'streak')
            },
            {
                id: 'WR84',
                role: 'Other Route Runner',
                startX: lineOfScrimmage + 1,
                startY: 48,
                trajectory: this.generateRouteTrajectory(lineOfScrimmage + 1, 48, 'out')
            },
            // Defensive Coverage
            {
                id: 'DB24',
                role: 'Defence Coverage',
                startX: lineOfScrimmage + 8,
                startY: 12,
                trajectory: this.generateDefenderTrajectory(lineOfScrimmage + 8, 12, ballLandX, ballLandY - 3)
            },
            {
                id: 'DB31',
                role: 'Defence Coverage',
                startX: lineOfScrimmage + 7,
                startY: 20,
                trajectory: this.generateDefenderTrajectory(lineOfScrimmage + 7, 20, ballLandX, ballLandY + 2)
            },
            {
                id: 'DB22',
                role: 'Defence Coverage',
                startX: lineOfScrimmage + 10,
                startY: 45,
                trajectory: this.generateDefenderTrajectory(lineOfScrimmage + 10, 45, ballLandX - 15, 42)
            }
        ];
        
        this.playData = {
            gameId: '2023_01_W1',
            playId: 42,
            playDirection: playDirection,
            lineOfScrimmage: lineOfScrimmage,
            ballLandX: ballLandX,
            ballLandY: ballLandY,
            releaseFrame: 30, // Ball released at frame 30
            catchFrame: 75, // Ball caught at frame 75
            players: players
        };
        
        // Update title text
        this.updateTitleText();
    }
    
    generateQBTrajectory(startX, startY) {
        const trajectory = [];
        for (let i = 0; i < this.maxFrames; i++) {
            if (i < 10) {
                // Drop back
                trajectory.push({
                    x: startX - (i * 0.3),
                    y: startY,
                    o: 90 // Orientation facing downfield
                });
            } else if (i < 30) {
                // Plant and prepare to throw
                trajectory.push({
                    x: startX - 3,
                    y: startY,
                    o: 90
                });
            } else {
                // After throw, minimal movement
                trajectory.push({
                    x: startX - 3 + Math.random() * 0.5,
                    y: startY + Math.random() * 0.5,
                    o: 90
                });
            }
        }
        return trajectory;
    }
    
    generateReceiverTrajectory(startX, startY, targetX, targetY) {
        const trajectory = [];
        const releaseFrame = 5;
        const catchFrame = 75;
        
        for (let i = 0; i < this.maxFrames; i++) {
            if (i < releaseFrame) {
                // At line
                trajectory.push({ x: startX, y: startY, o: 90 });
            } else if (i < catchFrame) {
                // Run route
                const progress = (i - releaseFrame) / (catchFrame - releaseFrame);
                const x = startX + (targetX - startX) * progress;
                const y = startY + (targetY - startY) * progress * 0.8 + Math.sin(progress * Math.PI) * 3;
                const angle = Math.atan2(targetY - y, targetX - x) * 180 / Math.PI;
                trajectory.push({ x, y, o: 90 + angle });
            } else {
                // After catch, continue forward
                const progress = (i - catchFrame) / (this.maxFrames - catchFrame);
                trajectory.push({
                    x: targetX + progress * 15,
                    y: targetY + Math.sin(progress * 4) * 2,
                    o: 90
                });
            }
        }
        return trajectory;
    }
    
    generateRouteTrajectory(startX, startY, routeType) {
        const trajectory = [];
        for (let i = 0; i < this.maxFrames; i++) {
            const t = i / this.maxFrames;
            let x = startX;
            let y = startY;
            let o = 90;
            
            if (routeType === 'streak') {
                x = startX + t * 40;
                y = startY;
                o = 90;
            } else if (routeType === 'out') {
                if (t < 0.3) {
                    x = startX + t * 40;
                    y = startY;
                } else {
                    x = startX + 12 + (t - 0.3) * 20;
                    y = startY > 26.65 ? startY + (t - 0.3) * 15 : startY - (t - 0.3) * 15;
                    o = startY > 26.65 ? 45 : 135;
                }
            }
            
            trajectory.push({ x, y, o });
        }
        return trajectory;
    }
    
    generateDefenderTrajectory(startX, startY, targetX, targetY) {
        const trajectory = [];
        for (let i = 0; i < this.maxFrames; i++) {
            const t = Math.min(i / 70, 1);
            const x = startX + (targetX - startX) * t + Math.sin(i * 0.2) * 1;
            const y = startY + (targetY - startY) * t + Math.cos(i * 0.15) * 1.5;
            const angle = Math.atan2(targetY - y, targetX - x) * 180 / Math.PI;
            trajectory.push({ x, y, o: 90 + angle });
        }
        return trajectory;
    }
    
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        this.playBtn.innerHTML = this.isPlaying ? 
            '<i class="fas fa-pause"></i>' : 
            '<i class="fas fa-play"></i>';
    }
    
    restart() {
        this.currentFrame = 0;
        this.isPlaying = true;
        this.lastFrameTime = 0; // Reset timing
        this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    
    animate(timestamp) {
        // Calculate time since last frame
        if (!this.lastFrameTime) {
            this.lastFrameTime = timestamp;
        }
        
        const elapsed = timestamp - this.lastFrameTime;
        
        // Only update frame if enough time has passed
        if (elapsed >= this.frameInterval) {
            this.draw();
            
            if (this.isPlaying) {
                this.currentFrame++;
                if (this.currentFrame >= this.maxFrames) {
                    this.currentFrame = 0;
                }
            }
            
            this.lastFrameTime = timestamp;
        } else {
            // Still draw even if not updating frame (for smooth rendering)
            this.draw();
        }
        
        requestAnimationFrame((ts) => this.animate(ts));
    }
    
    draw() {
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.fillStyle = '#1a4d2e';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw field
        this.drawField();
        
        // Draw phase indicator banner
        this.drawPhaseIndicator();
        
        // Draw legend
        this.drawLegend();
        
        // Draw players
        if (this.playData) {
            this.drawPlayers();
            
            // Draw ball if released
            if (this.currentFrame >= this.playData.releaseFrame) {
                this.drawBall();
            }
        }
    }
    
    drawField() {
        const ctx = this.ctx;
        const data = this.playData;
        
        // Field background
        ctx.fillStyle = '#2d5016';
        ctx.fillRect(
            this.offsetX,
            this.offsetY,
            this.fieldLength * this.scale,
            this.fieldWidth * this.scale
        );
        
        // Endzones
        ctx.fillStyle = 'rgba(100, 149, 237, 0.3)'; // Left endzone
        ctx.fillRect(
            this.offsetX,
            this.offsetY,
            10 * this.scale,
            this.fieldWidth * this.scale
        );
        
        ctx.fillStyle = 'rgba(220, 20, 60, 0.3)'; // Right endzone
        ctx.fillRect(
            this.offsetX + 110 * this.scale,
            this.offsetY,
            10 * this.scale,
            this.fieldWidth * this.scale
        );
        
        // Yard lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        for (let yard = 10; yard <= 110; yard += 10) {
            const x = this.offsetX + yard * this.scale;
            ctx.beginPath();
            ctx.moveTo(x, this.offsetY);
            ctx.lineTo(x, this.offsetY + this.fieldWidth * this.scale);
            ctx.stroke();
        }
        
        // Yard numbers
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `${Math.max(12, this.scale * 2)}px Arial`;
        ctx.textAlign = 'center';
        for (let yard = 20; yard <= 100; yard += 10) {
            const x = this.offsetX + yard * this.scale;
            const yardNum = Math.min(yard - 10, 110 - yard);
            ctx.fillText(yardNum.toString(), x, this.offsetY + 10 * this.scale);
            ctx.fillText(yardNum.toString(), x, this.offsetY + (this.fieldWidth - 5) * this.scale);
        }
        
        // Line of scrimmage
        if (data) {
            ctx.strokeStyle = '#0066ff';
            ctx.lineWidth = 2;
            const losX = this.offsetX + data.lineOfScrimmage * this.scale;
            ctx.beginPath();
            ctx.moveTo(losX, this.offsetY);
            ctx.lineTo(losX, this.offsetY + this.fieldWidth * this.scale);
            ctx.stroke();
        }
        
        // Hash marks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        const hashY = [18.37, 34.93];
        for (let yard = 10; yard < 110; yard++) {
            const x = this.offsetX + yard * this.scale;
            for (let hash of hashY) {
                const y = this.offsetY + hash * this.scale;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 0.4 * this.scale);
                ctx.stroke();
            }
        }
    }
    
    drawPhaseIndicator() {
        if (!this.numInputFrames) return;
        
        const ctx = this.ctx;
        const isPreThrow = this.currentFrame < this.numInputFrames;
        
        // Vertical info panel on the left side
        const panelX = 15;
        const panelY = this.offsetY + 15;
        const panelWidth = 140;
        
        // Background for info panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(panelX, panelY, panelWidth, 200);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX, panelY, panelWidth, 200);
        
        let currentY = panelY + 20;
        
        // Game info
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = '#10a37f';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('NFL BIG DATA', panelX + 10, currentY);
        currentY += 14;
        ctx.fillText('BOWL 2026', panelX + 10, currentY);
        currentY += 25;
        
        if (this.playData) {
            ctx.font = '9px JetBrains Mono';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`Game: ${this.playData.gameId}`, panelX + 10, currentY);
            currentY += 14;
            ctx.fillText(`Play: ${this.playData.playId}`, panelX + 10, currentY);
            currentY += 14;
            ctx.fillText(`Players: ${this.playData.players.length}`, panelX + 10, currentY);
            currentY += 20;
        }
        
        // Separator line
        ctx.strokeStyle = 'rgba(16, 163, 127, 0.5)';
        ctx.beginPath();
        ctx.moveTo(panelX + 10, currentY);
        ctx.lineTo(panelX + panelWidth - 10, currentY);
        ctx.stroke();
        currentY += 15;
        
        // Phase indicator
        if (isPreThrow) {
            ctx.fillStyle = '#10a37f';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.fillText('PHASE:', panelX + 10, currentY);
            currentY += 14;
            ctx.fillStyle = '#10a37f';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.fillText('PRE-THROW', panelX + 10, currentY);
            currentY += 14;
            ctx.font = '8px JetBrains Mono';
            ctx.fillStyle = '#888888';
            ctx.fillText('Input Data', panelX + 10, currentY);
            currentY += 12;
            ctx.fillText('(Before Ball', panelX + 10, currentY);
            currentY += 10;
            ctx.fillText('Thrown)', panelX + 10, currentY);
        } else {
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.fillText('PHASE:', panelX + 10, currentY);
            currentY += 14;
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.fillText('POST-THROW', panelX + 10, currentY);
            currentY += 14;
            ctx.font = '8px JetBrains Mono';
            ctx.fillStyle = '#888888';
            ctx.fillText('Output Data', panelX + 10, currentY);
            currentY += 12;
            ctx.fillText('(After Ball', panelX + 10, currentY);
            currentY += 10;
            ctx.fillText('Thrown)', panelX + 10, currentY);
        }
        
        // Transition marker at throw moment
        if (Math.abs(this.currentFrame - this.numInputFrames) < 3) {
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            const throwX = this.offsetX + (this.fieldLength * this.scale / 2);
            ctx.beginPath();
            ctx.moveTo(throwX, this.offsetY);
            ctx.lineTo(throwX, this.offsetY + this.fieldWidth * this.scale);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // "BALL THROWN" text
            ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
            ctx.fillRect(throwX - 60, this.offsetY + this.fieldWidth * this.scale / 2 - 20, 120, 40);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('⚡ BALL THROWN ⚡', throwX, this.offsetY + this.fieldWidth * this.scale / 2);
        }
        
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
    }
    
    drawLegend() {
        const ctx = this.ctx;
        const startX = this.offsetX + 5;
        const startY = this.offsetY + this.fieldWidth * this.scale + 15;
        
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'left';
        
        let x = startX;
        Object.entries(this.roleColors).forEach(([role, color]) => {
            if (role === 'Ball') return;
            
            // Circle
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, startY, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Label
            ctx.fillStyle = '#808080';
            ctx.fillText(role, x + 10, startY + 4);
            
            x += ctx.measureText(role).width + 30;
        });
    }
    
    updateTitleText() {
        // Update the HTML title element below the canvas
        if (!this.titleElement) return;
        
        const title = this.useRealData ? 
            'NFL Big Data Bowl 2026 - Real Game Data' : 
            'NFL Player Tracking - Simulated Play';
        
        let subtitle = '';
        if (this.playData) {
            subtitle = this.useRealData ?
                `Game: ${this.playData.gameId} | Play: ${this.playData.playId} | ${this.playData.players.length} Players` :
                `Game: ${this.playData.gameId} | Play: ${this.playData.playId}`;
        }
        
        this.titleElement.innerHTML = `
            <div class="showcase-title-main">${title}</div>
            ${subtitle ? `<div class="showcase-title-sub">${subtitle}</div>` : ''}
        `;
    }
    
    drawPhaseProgressBar() {
        const ctx = this.ctx;
        const barWidth = 300;
        const barHeight = 25;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = 20; // Moved up since no title above
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Input phase section
        const inputWidth = (this.numInputFrames / this.maxFrames) * barWidth;
        ctx.fillStyle = 'rgba(16, 163, 127, 0.5)';
        ctx.fillRect(barX, barY, inputWidth, barHeight);
        
        // Output phase section
        const outputWidth = (this.numOutputFrames / this.maxFrames) * barWidth;
        ctx.fillStyle = 'rgba(255, 68, 68, 0.5)';
        ctx.fillRect(barX + inputWidth, barY, outputWidth, barHeight);
        
        // Current position indicator
        const currentPos = (this.currentFrame / this.maxFrames) * barWidth;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(barX + currentPos - 2, barY - 5, 4, barHeight + 10);
        
        // Labels
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Input label
        ctx.fillText('INPUT', barX + inputWidth / 2, barY + barHeight / 2);
        
        // Output label
        ctx.fillText('OUTPUT', barX + inputWidth + outputWidth / 2, barY + barHeight / 2);
        
        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Divider at throw point
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(barX + inputWidth, barY);
        ctx.lineTo(barX + inputWidth, barY + barHeight);
        ctx.stroke();
        
        ctx.textBaseline = 'alphabetic';
    }
    
    drawPlayers() {
        const ctx = this.ctx;
        const data = this.playData;
        
        data.players.forEach(player => {
            // Find the position for the current frame
            let pos = null;
            
            if (this.useRealData) {
                // For real data, find the exact frame or interpolate
                const exactFrame = player.trajectory.find(t => t.frame === this.currentFrame + 1);
                if (exactFrame) {
                    pos = exactFrame;
                } else if (this.currentFrame < player.trajectory.length) {
                    pos = player.trajectory[this.currentFrame];
                }
            } else {
                // For simulated data, direct index access
                pos = player.trajectory[this.currentFrame];
            }
            
            if (!pos) return;
            
            const screenX = this.offsetX + pos.x * this.scale;
            const screenY = this.offsetY + pos.y * this.scale;
            const radius = Math.max(4, this.scale * 0.8);
            
            // Draw orientation line
            if (pos.o !== undefined && pos.o !== 0) {
                const angleRad = (pos.o * Math.PI) / 180;
                const lineLength = radius * 2.5;
                const endX = screenX + Math.sin(angleRad) * lineLength;
                const endY = screenY + Math.cos(angleRad) * lineLength;
                
                ctx.strokeStyle = this.roleColors[player.role] || '#888888';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(screenX, screenY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
            
            // Draw player circle
            ctx.fillStyle = this.roleColors[player.role] || '#888888';
            ctx.beginPath();
            ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw player ID or position
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.max(7, this.scale * 0.5)}px JetBrains Mono`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const label = player.id || player.position || '?';
            ctx.fillText(label, screenX, screenY);
        });
    }
    
    drawBall() {
        const ctx = this.ctx;
        const data = this.playData;
        
        let ballX, ballY;
        let isInFlight = false;
        
        if (this.currentFrame < data.catchFrame) {
            // Ball in flight
            isInFlight = true;
            const progress = (this.currentFrame - data.releaseFrame) / (data.catchFrame - data.releaseFrame);
            const qb = data.players.find(p => p.role === 'Passer');
            const qbPos = qb.trajectory[data.releaseFrame];
            
            ballX = qbPos.x + (data.ballLandX - qbPos.x) * progress;
            ballY = qbPos.y + (data.ballLandY - qbPos.y) * progress;
            
            // Add arc
            ballY -= Math.sin(progress * Math.PI) * 8;
        } else {
            // Ball caught, follow receiver
            const receiver = data.players.find(p => p.role === 'Targeted Receiver');
            const receiverPos = receiver.trajectory[this.currentFrame];
            if (receiverPos) {
                ballX = receiverPos.x;
                ballY = receiverPos.y;
            } else {
                return; // No ball position available
            }
        }
        
        const screenX = this.offsetX + ballX * this.scale;
        const screenY = this.offsetY + ballY * this.scale;
        
        // Draw glow effect if ball is in flight
        if (isInFlight) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
            
            // Draw trajectory line
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            const qb = data.players.find(p => p.role === 'Passer');
            const qbPos = qb.trajectory[data.releaseFrame];
            const qbScreenX = this.offsetX + qbPos.x * this.scale;
            const qbScreenY = this.offsetY + qbPos.y * this.scale;
            ctx.beginPath();
            ctx.moveTo(qbScreenX, qbScreenY);
            ctx.lineTo(screenX, screenY);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Draw ball
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = isInFlight ? '#FFFF00' : '#FFFFFF';
        ctx.lineWidth = isInFlight ? 2 : 1;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY, isInFlight ? 6 : 4, isInFlight ? 8 : 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Laces
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.5;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(screenX - 2, screenY + i * 2);
            ctx.lineTo(screenX + 2, screenY + i * 2);
            ctx.stroke();
        }
        
        // "IN FLIGHT" label if ball is being thrown
        if (isInFlight) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('BALL IN FLIGHT', screenX, screenY - 12);
            ctx.textBaseline = 'alphabetic';
        }
    }
}

// Initialize NFL Animation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const nflContainer = document.getElementById('nflAnimation');
    if (nflContainer) {
        new NFLAnimation('nflAnimation');
    }
});
