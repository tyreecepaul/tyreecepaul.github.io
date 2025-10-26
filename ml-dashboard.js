class MLTrainingDashboard {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`MLTrainingDashboard: container "${containerId}" not found.`);
            return;
        }

        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Training configuration
        this.maxIterations = options.maxIterations || 250; // 250 iterations for 5 seconds
        this.currentIteration = 0;
        this.isTraining = false;
        this.isPaused = false;
        this.trainingSpeed = options.trainingSpeed || 20; // 20ms per iteration = 5 seconds total

        // Profile image
        this.profileImage = null;
        this.loadProfileImage();

        // GAN Metrics history
        this.metrics = {
            generatorLoss: [],
            discriminatorLoss: [],
            discriminatorReal: [],
            discriminatorFake: [],
            fid: [],  // Fréchet Inception Distance
            learningRate: []
        };

        // Current metrics (for display)
        this.currentMetrics = {
            generatorLoss: 0,
            discriminatorLoss: 0,
            discriminatorReal: 0,
            discriminatorFake: 0,
            fid: 250,
            learningRate: 0.002
        };

        // Model info
        this.modelConfig = {
            name: 'StyleGAN2',
            dataset: 'Custom Portrait',
            resolution: '512×512',
            architecture: 'Style-based Generator',
            discriminator: 'Progressive (R1 reg)',
            optimizer: 'Adam (β1=0, β2=0.99)'
        };

        // Chart configuration
        this.chartPadding = { top: 42, right: 12, bottom: 28, left: 48 };
        this.colors = {
            generator: '#10a37f',      // Teal for generator
            discriminator: '#ff6b6b',  // Red for discriminator
            real: '#4ecdc4',           // Cyan for real predictions
            fake: '#ff8b94',           // Pink for fake predictions
            fid: '#ffd93d',            // Yellow for FID
            grid: 'rgba(255, 255, 255, 0.05)',
            text: '#808080',
            textBright: '#ffffff',
            background: '#000000',
            accent: '#10a37f'
        };

        this.animationId = null;
        this.lastUpdate = 0;

        // Responsive resizing
        this._ro = null;
        this.setupEventListeners();
    }

    loadProfileImage() {
        this.profileImage = new Image();
        this.profileImage.crossOrigin = 'anonymous';
        this.profileImage.onload = () => {
            console.log('Profile image loaded successfully');
            this.init();
        };
        this.profileImage.onerror = () => {
            console.error('Failed to load profile image, using placeholder');
            this.init();
        };
        this.profileImage.src = 'img/profile.jpeg';
    }

    init() {
        this.resizeCanvas();
        this.resetTraining();
        this.draw();
    }

    // Support devicePixelRatio for crisp canvas rendering
    resizeCanvas() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        // Set CSS size
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        // Set internal pixel size
        this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
        // Scale context
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setupEventListeners() {
        // ResizeObserver if available
        if (window.ResizeObserver) {
            this._ro = new ResizeObserver(() => {
                this.resizeCanvas();
                this.draw();
            });
            this._ro.observe(this.container);
        } else {
            // Fallback
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.resizeCanvas();
                    this.draw();
                }, 100);
            });
        }
    }

    resetTraining() {
        this.currentIteration = 0;
        this.metrics = {
            generatorLoss: [],
            discriminatorLoss: [],
            discriminatorReal: [],
            discriminatorFake: [],
            fid: [],
            learningRate: []
        };

        // Initialize with realistic GAN starting values
        this.currentMetrics = {
            generatorLoss: 8.5,
            discriminatorLoss: 1.2,
            discriminatorReal: 0.85,
            discriminatorFake: 0.15,
            fid: 250,
            learningRate: 0.002
        };
    }

    simulateIteration() {
        this.currentIteration++;

        // Simulate realistic GAN training dynamics
        const progress = this.currentIteration / Math.max(1, this.maxIterations);
        const noise = () => (Math.random() - 0.5) * 0.15;
        const oscillation = Math.sin(this.currentIteration * 0.1) * 0.3;

        // Generator Loss - starts high, decreases but oscillates (GAN instability)
        const gDecay = Math.exp(-2 * progress);
        this.currentMetrics.generatorLoss = Math.max(0.1, 1.0 + 7.5 * gDecay + noise() + oscillation);

        // Discriminator Loss - oscillates around equilibrium
        this.currentMetrics.discriminatorLoss = Math.max(0.05, 0.5 + 0.7 * gDecay + noise() - oscillation * 0.5);

        // Discriminator Real predictions - should stay high (close to 1)
        this.currentMetrics.discriminatorReal = Math.min(0.99, Math.max(0.5, 0.85 + (1 - gDecay) * 0.1 + noise() * 0.3));

        // Discriminator Fake predictions - should decrease (approach 0 then rise as G improves)
        const fakeProgress = Math.min(1, progress * 1.5);
        this.currentMetrics.discriminatorFake = Math.max(0.01, 0.15 + 0.7 * Math.exp(-3 * fakeProgress) + noise() * 0.2);

        // FID Score - decreases with training (lower is better)
        const fidDecay = Math.exp(-1.8 * progress);
        this.currentMetrics.fid = Math.max(5, 15 + 235 * fidDecay + Math.abs(noise()) * 10);

        // Learning rate with decay
        this.currentMetrics.learningRate = 0.002 * Math.max(0.1, 1 - progress * 0.8);

        // Store history
        this.metrics.generatorLoss.push(this.currentMetrics.generatorLoss);
        this.metrics.discriminatorLoss.push(this.currentMetrics.discriminatorLoss);
        this.metrics.discriminatorReal.push(this.currentMetrics.discriminatorReal);
        this.metrics.discriminatorFake.push(this.currentMetrics.discriminatorFake);
        this.metrics.fid.push(this.currentMetrics.fid);
        this.metrics.learningRate.push(this.currentMetrics.learningRate);

        // Stop when completed (don't restart)
        if (this.currentIteration >= this.maxIterations) {
            this.stopTraining();
        }
    }

    startTraining() {
        if (this.isTraining) return;
        this.isTraining = true;
        this.isPaused = false;
        this.lastUpdate = performance.now();
        this.animate(this.lastUpdate);
    }

    pauseTraining() {
        this.isPaused = !this.isPaused;
    }

    stopTraining() {
        this.isTraining = false;
        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    animate(timestamp) {
        if (!this.isTraining) return;

        // Update at fixed interval
        if (!this.isPaused && timestamp - this.lastUpdate >= this.trainingSpeed) {
            if (this.currentIteration < this.maxIterations) {
                this.simulateIteration();
            }
            this.lastUpdate = timestamp;
        }

        this.draw();
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    draw() {
        const w = this.canvas.clientWidth || parseInt(this.canvas.style.width, 10) || 800;
        const h = this.canvas.clientHeight || parseInt(this.canvas.style.height, 10) || 600;

        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, w, h);

        // Layout: Header at top, then left side for charts, right side for progressive generation
        const margin = 12;
        const headerHeight = 68;
        const gap = 14;

        // Calculate available space
        const availableWidth = w - (margin * 2);
        const availableHeight = h - (margin * 2);

        // Header takes top section
        const headerY = margin;
        const contentStartY = headerY + headerHeight + gap;
        const contentHeight = Math.max(50, availableHeight - headerHeight - gap);

        // Split content area: 55% for charts (left), 45% for progressive image (right)
        const chartsWidth = availableWidth * 0.54;
        const imageWidth = Math.max(100, availableWidth * 0.44);
        const imageX = margin + chartsWidth + gap;

        // Draw header
        this.drawHeader(margin, headerY, availableWidth, headerHeight);

        // Draw charts in 2x2 grid on left
        // Ensure minimum sizes and no overlap
        const chartWidth = Math.max(80, (chartsWidth - gap) / 2);
        const chartHeight = Math.max(80, (contentHeight - gap) / 2);
        
        const charts = [
            { type: 'losses', x: margin, y: contentStartY, w: chartWidth, h: chartHeight },
            { type: 'discriminator', x: margin + chartWidth + gap, y: contentStartY, w: chartWidth, h: chartHeight },
            { type: 'fid', x: margin, y: contentStartY + chartHeight + gap, w: chartWidth, h: chartHeight },
            { type: 'learning', x: margin + chartWidth + gap, y: contentStartY + chartHeight + gap, w: chartWidth, h: chartHeight }
        ];

        charts.forEach(chart => {
            this.drawChart(chart.type, chart.x, chart.y, chart.w, chart.h);
        });

        // Draw progressive generation panel on right
        this.drawProgressiveGenerationPanel(imageX, contentStartY, imageWidth, contentHeight);
    }

    drawHeader(x, y, w, h) {
        const ctx = this.ctx;
        
        // Background
        ctx.fillStyle = 'rgba(17, 17, 17, 0.95)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        
        const padding = 12;
        const textX = x + padding;
        let textY = y + padding;
        
        // Reset text settings
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        
        // Title
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.fillStyle = this.colors.textBright;
        ctx.fillText('StyleGAN2 Training', textX, textY);
        textY += 18;
        
        // Dataset info
        ctx.font = '9px JetBrains Mono';
        ctx.fillStyle = this.colors.text;
        ctx.fillText(`${this.modelConfig.dataset} • ${this.modelConfig.resolution}`, textX, textY);
        textY += 14;
        
        // Architecture info
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(`${this.modelConfig.architecture} + ${this.modelConfig.discriminator}`, textX, textY);
        
        // Progress bar area at bottom
        const progressBarY = y + h - 16;
        const progressBarWidth = w - (padding * 2);
        const progress = this.currentIteration / this.maxIterations;
        
        // FID Score display and status
        ctx.font = '8px JetBrains Mono';
        ctx.textBaseline = 'bottom';
        
        // FID Score display (center)
        ctx.textAlign = 'center';
        ctx.fillStyle = this.colors.fid;
        ctx.fillText(`FID: ${this.currentMetrics.fid.toFixed(1)}`, x + w / 2, progressBarY - 8);
        
        // Status indicator (right side)
        const statusText = this.isTraining ? (this.isPaused ? 'PAUSED' : 'TRAINING') : 'STOPPED';
        const statusColor = this.isTraining && !this.isPaused ? this.colors.accent : this.colors.text;
        const statusIndicator = '● ' + statusText;
        ctx.textAlign = 'right';
        ctx.fillStyle = statusColor;
        ctx.fillText(statusIndicator, x + w - padding, progressBarY - 8);
        
        // Reset text alignment
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        
        // Progress bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(textX, progressBarY, progressBarWidth, 5);
        
        ctx.fillStyle = this.colors.accent;
        ctx.fillRect(textX, progressBarY, progressBarWidth * progress, 5);
        
        // Reset baseline
        ctx.textBaseline = 'alphabetic';
    }

    drawChart(type, x, y, w, h) {
        const ctx = this.ctx;
        const pad = this.chartPadding;
        
        // Chart background
        ctx.fillStyle = 'rgba(17, 17, 17, 0.8)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        
        const chartArea = {
            x: x + pad.left,
            y: y + pad.top,
            w: Math.max(0, w - pad.left - pad.right),
            h: Math.max(0, h - pad.top - pad.bottom),
            titleX: x + 10,
            titleY: y + 10,
            valuesY: y + 26
        };
        
        if (type === 'losses') {
            this.drawGANLossesChart(chartArea);
        } else if (type === 'discriminator') {
            this.drawDiscriminatorChart(chartArea);
        } else if (type === 'fid') {
            this.drawFIDChart(chartArea);
        } else if (type === 'learning') {
            this.drawLearningRateChart(chartArea);
        }
    }

    drawGANLossesChart(area) {
        const ctx = this.ctx;
        
        ctx.save();
        
        // Reset text settings
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        
        // Title
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = this.colors.textBright;
        ctx.fillText('GAN Losses', area.titleX, area.titleY);
        
        // Values
        ctx.font = '8px JetBrains Mono';
        ctx.fillStyle = this.colors.generator;
        ctx.fillText(`G: ${this.currentMetrics.generatorLoss.toFixed(2)}`, area.titleX, area.valuesY);
        ctx.fillStyle = this.colors.discriminator;
        ctx.fillText(`D: ${this.currentMetrics.discriminatorLoss.toFixed(2)}`, area.titleX + 55, area.valuesY);
        
        ctx.restore();
        
        this.drawLineChart(area, [
            { data: this.metrics.generatorLoss, color: this.colors.generator, label: 'Generator' },
            { data: this.metrics.discriminatorLoss, color: this.colors.discriminator, label: 'Discriminator' }
        ], { min: 0, max: 10, ylabel: 'Loss' });
    }

    drawDiscriminatorChart(area) {
        const ctx = this.ctx;
        
        ctx.save();
        
        // Reset text settings
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        
        // Title
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = this.colors.textBright;
        ctx.fillText('Discriminator Output', area.titleX, area.titleY);
        
        // Current values
        ctx.font = '8px JetBrains Mono';
        ctx.fillStyle = this.colors.real;
        ctx.fillText(`Real: ${this.currentMetrics.discriminatorReal.toFixed(2)}`, area.titleX, area.valuesY);
        ctx.fillStyle = this.colors.fake;
        ctx.fillText(`Fake: ${this.currentMetrics.discriminatorFake.toFixed(2)}`, area.titleX + 60, area.valuesY);
        
        ctx.restore();
        
        this.drawLineChart(area, [
            { data: this.metrics.discriminatorReal, color: this.colors.real, label: 'D(real)' },
            { data: this.metrics.discriminatorFake, color: this.colors.fake, label: 'D(fake)' }
        ], { min: 0, max: 1, ylabel: 'Probability' });
    }

    drawFIDChart(area) {
        const ctx = this.ctx;
        
        ctx.save();
        
        // Reset text settings
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        
        // Title
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = this.colors.textBright;
        ctx.fillText('FID Score', area.titleX, area.titleY);
        
        // Current value
        ctx.font = '8px JetBrains Mono';
        ctx.fillStyle = this.colors.fid;
        ctx.fillText(`${this.currentMetrics.fid.toFixed(1)} (lower is better)`, area.titleX, area.valuesY);
        
        ctx.restore();
        
        this.drawLineChart(area, [
            { data: this.metrics.fid, color: this.colors.fid, label: 'FID' }
        ], { min: 0, max: 250, ylabel: 'FID Score' });
    }

    drawLearningRateChart(area) {
        const ctx = this.ctx;
        
        ctx.save();
        
        // Reset text settings
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        
        // Title
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = this.colors.textBright;
        ctx.fillText('Learning Rate Decay', area.titleX, area.titleY);
        
        // Current value
        ctx.font = '8px JetBrains Mono';
        ctx.fillStyle = this.colors.accent;
        ctx.fillText(`Current: ${this.currentMetrics.learningRate.toFixed(6)}`, area.titleX, area.valuesY);
        
        ctx.restore();
        
        // Use the actual stored learning rate data
        this.drawLineChart(area, [
            { data: this.metrics.learningRate, color: this.colors.accent, label: 'LR' }
        ], { min: 0, max: 0.0025, ylabel: 'LR', yformat: (v) => v.toFixed(4) });
    }

    drawLineChart(area, series, config) {
        const ctx = this.ctx;
        
        if (series[0].data.length === 0) return;
        
        // Draw grid
        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1;
        
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const yPos = area.y + (area.h / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(area.x, yPos);
            ctx.lineTo(area.x + area.w, yPos);
            ctx.stroke();
        }
        
        // Y-axis labels
        ctx.font = '8px JetBrains Mono';
        ctx.fillStyle = this.colors.text;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= gridLines; i++) {
            const value = config.max - (config.max - config.min) / gridLines * i;
            const yPos = area.y + (area.h / gridLines) * i;
            const label = config.yformat ? config.yformat(value) : value.toFixed(1);
            ctx.fillText(label, area.x - 5, yPos);
        }
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        
        // Draw lines with anti-aliasing
        series.forEach(s => {
            if (s.data.length < 2) return;
            
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            
            s.data.forEach((value, idx) => {
                const x = area.x + (area.w / this.maxIterations) * idx;
                const normalized = Math.max(0, Math.min(1, (value - config.min) / (config.max - config.min)));
                const y = area.y + area.h - (normalized * area.h);
                
                if (idx === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw last point with glow
            if (s.data.length > 0) {
                const lastIdx = s.data.length - 1;
                const lastValue = s.data[lastIdx];
                const x = area.x + (area.w / this.maxIterations) * lastIdx;
                const normalized = Math.max(0, Math.min(1, (lastValue - config.min) / (config.max - config.min)));
                const y = area.y + area.h - (normalized * area.h);
                
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // X-axis label
        ctx.font = '8px JetBrains Mono';
        ctx.fillStyle = this.colors.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Iterations', area.x + area.w / 2, area.y + area.h + 20);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    drawProgressiveGenerationPanel(x, y, w, h) {
        const ctx = this.ctx;
        
        // Panel background
        ctx.fillStyle = 'rgba(17, 17, 17, 0.8)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        
        // Title
        const padding = 10;
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = this.colors.textBright;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillText('Progressive Generation', x + padding, y + padding);
        
        // Calculate image display area
        const imageStartY = y + padding + 25;
        const availableHeight = h - padding - 40;
        const availableWidth = w - (padding * 2);
        
        // Make it square and centered
        const imageSize = Math.min(availableWidth, availableHeight);
        const imageX = x + (w - imageSize) / 2;
        const imageY = imageStartY + (availableHeight - imageSize) / 2;
        
        // Draw the progressive image
        this.drawProgressiveImage(imageX, imageY, imageSize);
        
        // Progress quality indicator
        const quality = Math.min(100, (this.currentIteration / this.maxIterations) * 100);
        ctx.font = '8px JetBrains Mono';
        ctx.fillStyle = this.colors.text;
        ctx.textAlign = 'center';
        ctx.fillText(`Quality: ${quality.toFixed(0)}%`, x + w / 2, y + h - padding - 5);
    }

    drawProgressiveImage(x, y, size) {
        const ctx = this.ctx;
        const progress = this.currentIteration / this.maxIterations;
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size);
        
        // Create a temporary canvas for the progressive effect
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Start with noise
        if (progress < 0.1) {
            // Pure noise at the beginning
            const imageData = tempCtx.createImageData(size, size);
            for (let i = 0; i < imageData.data.length; i += 4) {
                const val = Math.random() * 255;
                imageData.data[i] = val;
                imageData.data[i + 1] = val;
                imageData.data[i + 2] = val;
                imageData.data[i + 3] = 255;
            }
            tempCtx.putImageData(imageData, 0, 0);
        } else if (this.profileImage && this.profileImage.complete) {
            // Progressive blend from noise to profile image
            const blendFactor = Math.min(1, (progress - 0.1) / 0.9);
            
            // Draw profile image
            tempCtx.drawImage(this.profileImage, 0, 0, size, size);
            
            // Add noise overlay that decreases with progress
            const noiseAmount = (1 - blendFactor) * 100;
            if (noiseAmount > 1) {
                const imageData = tempCtx.getImageData(0, 0, size, size);
                for (let i = 0; i < imageData.data.length; i += 4) {
                    if (Math.random() < (noiseAmount / 100)) {
                        const noise = (Math.random() - 0.5) * noiseAmount * 3;
                        imageData.data[i] += noise;
                        imageData.data[i + 1] += noise;
                        imageData.data[i + 2] += noise;
                    }
                }
                tempCtx.putImageData(imageData, 0, 0);
            }
            
            // Apply blur that decreases with progress (more blur = less quality)
            const blurAmount = (1 - blendFactor) * 15;
            if (blurAmount > 0.5) {
                tempCtx.filter = `blur(${blurAmount}px)`;
                tempCtx.drawImage(tempCanvas, 0, 0);
                tempCtx.filter = 'none';
            }
            
            // Add pixelation effect that decreases with progress
            if (blendFactor < 0.7) {
                const pixelSize = Math.max(1, Math.floor((1 - blendFactor / 0.7) * 8));
                if (pixelSize > 1) {
                    const smallSize = Math.floor(size / pixelSize);
                    const pixelCanvas = document.createElement('canvas');
                    pixelCanvas.width = smallSize;
                    pixelCanvas.height = smallSize;
                    const pixelCtx = pixelCanvas.getContext('2d');
                    
                    pixelCtx.drawImage(tempCanvas, 0, 0, smallSize, smallSize);
                    tempCtx.imageSmoothingEnabled = false;
                    tempCtx.drawImage(pixelCanvas, 0, 0, size, size);
                    tempCtx.imageSmoothingEnabled = true;
                }
            }
        } else {
            // Fallback: colored noise
            tempCtx.fillStyle = '#333333';
            tempCtx.fillRect(0, 0, size, size);
            tempCtx.fillStyle = this.colors.text;
            tempCtx.font = '12px JetBrains Mono';
            tempCtx.textAlign = 'center';
            tempCtx.textBaseline = 'middle';
            tempCtx.fillText('Loading...', size / 2, size / 2);
        }
        
        // Draw the progressive image to main canvas
        ctx.drawImage(tempCanvas, x, y);
    }
}

// Initialize ML Dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const dashboardContainer = document.getElementById('mlDashboard');
    if (dashboardContainer) {
        const dashboard = new MLTrainingDashboard('mlDashboard', {
            maxIterations: 250,  // 250 iterations
            trainingSpeed: 20    // 20ms per iteration = 5 seconds total
        });
        
        dashboard.startTraining();
        
        // Don't auto-restart, just run once and stop
    }
});
