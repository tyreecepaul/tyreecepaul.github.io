// Terminal functionality
class Terminal {
    constructor() {
        this.input = document.getElementById('terminalInput');
        this.output = document.getElementById('terminalOutput');
        this.commandHistory = [];
        this.historyIndex = -1;
        this.bonsaiInterval = null;
        this.bonsaiFrame = 0;
        
        this.initializeCommands();
        this.setupEventListeners();
    }
    
    initializeCommands() {
        this.commands = {
            help: {
                description: 'Display available commands',
                execute: () => this.showHelp()
            },
            clear: {
                description: 'Clear the terminal',
                execute: () => this.clear()
            },
            about: {
                description: 'Learn about Tyreece Paul',
                execute: () => this.about()
            },
            skills: {
                description: 'Display technical skills',
                execute: () => this.skills()
            },
            projects: {
                description: 'List featured projects',
                execute: () => this.projects()
            },
            contact: {
                description: 'Get contact information',
                execute: () => this.contact()
            },
            experience: {
                description: 'Show work experience',
                execute: () => this.experience()
            },
            education: {
                description: 'Display education background',
                execute: () => this.education()
            },
            bonsai: {
                description: 'Grow a digital bonsai tree',
                execute: () => this.bonsai()
            },
            whoami: {
                description: 'Display current user',
                execute: () => this.whoami()
            },
            date: {
                description: 'Display current date and time',
                execute: () => this.date()
            },
            echo: {
                description: 'Echo the input text',
                execute: (args) => this.echo(args)
            },
            welcome: {
                description: 'Show welcome message',
                execute: () => this.welcome()
            }
        };
    }
    
    setupEventListeners() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.processCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down');
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autocomplete();
            }
        });
        
        // Focus input when clicking anywhere in the terminal
        document.getElementById('terminalBody')?.addEventListener('click', () => {
            this.input.focus();
        });
    }
    
    processCommand() {
        const commandText = this.input.value.trim();
        
        if (commandText) {
            // Add to history
            this.commandHistory.push(commandText);
            this.historyIndex = this.commandHistory.length;
            
            // Display command
            this.addLine(`<span class="terminal-prompt">tyreece@portfolio:~λ</span> ${commandText}`);
            
            // Parse and execute command
            const [cmd, ...args] = commandText.split(' ');
            const command = this.commands[cmd.toLowerCase()];
            
            if (command) {
                command.execute(args);
            } else {
                this.addLine(`<span class="terminal-error">Command not found: ${cmd}</span>`);
                this.addLine(`Type 'help' for available commands`);
            }
        }
        
        // Clear input
        this.input.value = '';
        this.scrollToBottom();
    }
    
    navigateHistory(direction) {
        if (direction === 'up' && this.historyIndex > 0) {
            this.historyIndex--;
            this.input.value = this.commandHistory[this.historyIndex];
        } else if (direction === 'down' && this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
            this.input.value = this.commandHistory[this.historyIndex];
        } else if (direction === 'down' && this.historyIndex === this.commandHistory.length - 1) {
            this.historyIndex = this.commandHistory.length;
            this.input.value = '';
        }
    }
    
    autocomplete() {
        const partial = this.input.value.toLowerCase();
        if (!partial) return;
        
        const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(partial));
        
        if (matches.length === 1) {
            this.input.value = matches[0];
        } else if (matches.length > 1) {
            this.addLine(`<span class="terminal-prompt">tyreece@portfolio:~λ</span> ${partial}`);
            this.addLine(matches.join('  '));
        }
    }
    
    addLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.innerHTML = text;
        this.output.appendChild(line);
    }
    
    scrollToBottom() {
        const terminalBody = document.getElementById('terminalBody');
        if (terminalBody) {
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    }
    
    // Command implementations
    showHelp() {
        this.addLine('');
        this.addLine('<span class="terminal-success">Available Commands:</span>');
        this.addLine('');
        
        const maxCmdLength = Math.max(...Object.keys(this.commands).map(cmd => cmd.length));
        
        Object.entries(this.commands).forEach(([cmd, info]) => {
            const padding = ' '.repeat(maxCmdLength - cmd.length + 2);
            this.addLine(`  <span class="terminal-command">${cmd}</span>${padding}- ${info.description}`);
        });
        
        this.addLine('');
        this.addLine('Tips:');
        this.addLine('  • Use ↑/↓ arrow keys to navigate command history');
        this.addLine('  • Press Tab for command autocomplete');
        this.addLine('');
    }
    
    clear() {
        this.output.innerHTML = '';
        if (this.bonsaiInterval) {
            clearInterval(this.bonsaiInterval);
            this.bonsaiInterval = null;
        }
    }
    
    about() {
        this.addLine('');
        this.addLine('<span class="terminal-success">About Tyreece Paul</span>');
        this.addLine('');
        this.addLine('Machine Learning Engineer and Applied Mathematician');
        this.addLine('specializing in deep learning, computer vision, and');
        this.addLine('data-driven solutions.');
        this.addLine('');
        this.addLine('I build intelligent systems through code and mathematics,');
        this.addLine('combining theoretical foundations with practical applications.');
        this.addLine('');
        this.addLine('Focus Areas:');
        this.addLine('  • Machine Learning & Deep Learning');
        this.addLine('  • Computer Vision');
        this.addLine('  • Data Science & Analytics');
        this.addLine('  • Sports Analytics (NFL Big Data Bowl)');
        this.addLine('');
    }
    
    skills() {
        this.addLine('');
        this.addLine('<span class="terminal-success">Technical Skills</span>');
        this.addLine('');
        this.addLine('<span class="terminal-command">Machine Learning & AI:</span>');
        this.addLine('  PyTorch • TensorFlow • Scikit-learn • OpenCV');
        this.addLine('');
        this.addLine('<span class="terminal-command">Data Science & Analytics:</span>');
        this.addLine('  Pandas • NumPy • Matplotlib • Seaborn • SQL');
        this.addLine('');
        this.addLine('<span class="terminal-command">Software Development:</span>');
        this.addLine('  Python • JavaScript • React • Node.js • HTML/CSS');
        this.addLine('');
        this.addLine('<span class="terminal-command">DevOps & Tools:</span>');
        this.addLine('  Git • Docker • AWS • Linux • CI/CD');
        this.addLine('');
    }
    
    projects() {
        this.addLine('');
        this.addLine('<span class="terminal-success">Featured Projects</span>');
        this.addLine('');
        
        const projects = [
            {
                name: 'StyleGAN2 Image Generation',
                tech: 'PyTorch, GANs, Computer Vision',
                desc: 'Progressive image generation using StyleGAN2 architecture'
            },
            {
                name: 'NFL Player Tracking System',
                tech: 'Python, Data Science, Sports Analytics',
                desc: 'Real-time player tracking visualization from NFL Big Data Bowl'
            },
            {
                name: 'Neural Collaborative Filtering',
                tech: 'Deep Learning, Recommender Systems, TensorFlow',
                desc: 'Advanced recommendation system using neural networks'
            },
            {
                name: 'Interactive Data Visualizations',
                tech: 'JavaScript, Canvas API, D3.js',
                desc: 'Real-time interactive visualizations for complex datasets'
            }
        ];
        
        projects.forEach((project, index) => {
            this.addLine(`${index + 1}. <span class="terminal-command">${project.name}</span>`);
            this.addLine(`   Technologies: ${project.tech}`);
            this.addLine(`   ${project.desc}`);
            this.addLine('');
        });
    }
    
    contact() {
        this.addLine('');
        this.addLine('<span class="terminal-success">Contact Information</span>');
        this.addLine('');
        this.addLine('📧 Email:     contact@tyrecepaul.com');
        this.addLine('📍 Location:  United Kingdom');
        this.addLine('🎓 Education: Computer Science & Mathematics');
        this.addLine('');
        this.addLine('Connect with me:');
        this.addLine('  GitHub:   github.com/tyreecepaul');
        this.addLine('  LinkedIn: [Your LinkedIn]');
        this.addLine('  Kaggle:   [Your Kaggle]');
        this.addLine('');
    }
    
    experience() {
        this.addLine('');
        this.addLine('<span class="terminal-success">Work Experience</span>');
        this.addLine('');
        
        this.addLine('<span class="terminal-command">Machine Learning Engineer</span>');
        this.addLine('Research Project | 2024 - Present');
        this.addLine('• Implemented StyleGAN2 for high-quality image generation');
        this.addLine('• Developed NFL player tracking visualization system');
        this.addLine('• Built neural collaborative filtering recommender systems');
        this.addLine('');
        
        this.addLine('<span class="terminal-command">Data Science Intern</span>');
        this.addLine('Various Projects | 2023 - 2024');
        this.addLine('• Analyzed large datasets using Pandas and NumPy');
        this.addLine('• Created interactive visualizations with Matplotlib');
        this.addLine('• Applied machine learning models to real-world problems');
        this.addLine('');
        
        this.addLine('<span class="terminal-command">Software Developer</span>');
        this.addLine('Personal Projects | 2022 - 2023');
        this.addLine('• Built responsive web applications with modern frameworks');
        this.addLine('• Implemented Canvas API visualizations');
        this.addLine('• Developed version control workflows with Git');
        this.addLine('');
    }
    
    education() {
        this.addLine('');
        this.addLine('<span class="terminal-success">Education</span>');
        this.addLine('');
        this.addLine('🎓 <span class="terminal-command">Computer Science with Machine Learning</span>');
        this.addLine('   Focus: Deep Learning, Computer Vision, AI');
        this.addLine('');
        this.addLine('🎓 <span class="terminal-command">Mathematics with Applied Inference</span>');
        this.addLine('   Focus: Statistical Methods, Mathematical Modeling');
        this.addLine('');
        this.addLine('Key Coursework:');
        this.addLine('  • Machine Learning & Deep Learning');
        this.addLine('  • Computer Vision');
        this.addLine('  • Statistical Inference');
        this.addLine('  • Data Structures & Algorithms');
        this.addLine('  • Linear Algebra & Optimization');
        this.addLine('');
    }
    
    bonsai() {
        if (this.bonsaiInterval) {
            this.addLine('<span class="terminal-error">Bonsai is already growing!</span>');
            return;
        }
        
        this.addLine('');
        this.addLine('<span style="color: #10a37f;">bonsai.sh</span> - a beautifully random bonsai tree generator');
        this.addLine('');
        
        // More authentic bonsai.sh style frames with colors
        const bonsaiFrames = [
            [
                '                    <span style="color: #8aac8b;">&</span>',
                '                   <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span>',
                '                  <span style="color: #6a8a6b;">~</span><span style="color: #8aac8b;">&</span><span style="color: #6a8a6b;">|</span>',
                '                   <span style="color: #6a8a6b;">|</span><span style="color: #8aac8b;">&</span>',
                '             <span style="color: #8aac8b;">&</span>    <span style="color: #6a8a6b;">/</span>  <span style="color: #8aac8b;">&</span>',
                '            <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span> <span style="color: #6a8a6b;">/</span><span style="color: #6a8a6b;">|</span>',
                '              <span style="color: #6a8a6b;">\\</span><span style="color: #6a8a6b;">/</span>',
                '               <span style="color: #8b6f47;">|</span>',
                '              <span style="color: #8b6f47;">/</span><span style="color: #8b6f47;">|</span>',
                '             <span style="color: #8b6f47;">/</span> <span style="color: #8b6f47;">|</span>',
                '            <span style="color: #8b6f47;">/</span>  <span style="color: #8b6f47;">|</span>',
                '           <span style="color: #8b6f47;">|</span>   <span style="color: #8b6f47;">|</span>',
                '    <span style="color: #9e9e9e;">:</span><span style="color: #6a8a6b;">___________</span><span style="color: #8b6f47;">./~~\\.</span><span style="color: #6a8a6b;">___________</span><span style="color: #9e9e9e;">:</span>',
                '     \\                          /',
                '      \\________________________/',
                '      (_)                    (_)'
            ],
            [
                '                    <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span>',
                '                   <span style="color: #8aac8b;">&</span> <span style="color: #6a8a6b;">|</span><span style="color: #8aac8b;">&</span>',
                '                  <span style="color: #6a8a6b;">~</span><span style="color: #8aac8b;">&</span><span style="color: #6a8a6b;">|</span>',
                '               <span style="color: #8aac8b;">&</span>  <span style="color: #6a8a6b;">|</span><span style="color: #8aac8b;">&</span>',
                '             <span style="color: #8aac8b;">&</span>    <span style="color: #6a8a6b;">/</span>  <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span>',
                '            <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span> <span style="color: #6a8a6b;">/</span><span style="color: #6a8a6b;">|</span><span style="color: #6a8a6b;">\\</span>',
                '              <span style="color: #6a8a6b;">\\</span><span style="color: #6a8a6b;">/</span><span style="color: #6a8a6b;">|</span>',
                '               <span style="color: #8b6f47;">|</span>',
                '              <span style="color: #8b6f47;">/</span><span style="color: #8b6f47;">|</span><span style="color: #8b6f47;">\\</span>',
                '             <span style="color: #8b6f47;">/</span> <span style="color: #8b6f47;">|</span> <span style="color: #8b6f47;">\\</span>',
                '            <span style="color: #8b6f47;">/</span>  <span style="color: #8b6f47;">|</span>  <span style="color: #8b6f47;">\\</span>',
                '           <span style="color: #8b6f47;">|</span>   <span style="color: #8b6f47;">|</span>   <span style="color: #8b6f47;">|</span>',
                '    <span style="color: #9e9e9e;">:</span><span style="color: #6a8a6b;">___________</span><span style="color: #8b6f47;">./~~\\.</span><span style="color: #6a8a6b;">___________</span><span style="color: #9e9e9e;">:</span>',
                '     \\                          /',
                '      \\________________________/',
                '      (_)                    (_)'
            ],
            [
                '                 <span style="color: #8aac8b;">&</span>   <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span>',
                '                <span style="color: #8aac8b;">&</span> <span style="color: #6a8a6b;">\\</span> <span style="color: #6a8a6b;">/</span><span style="color: #8aac8b;">&</span>',
                '                 <span style="color: #6a8a6b;">~</span><span style="color: #8aac8b;">&</span><span style="color: #6a8a6b;">|</span><span style="color: #8aac8b;">&</span>',
                '               <span style="color: #8aac8b;">&</span>  <span style="color: #6a8a6b;">|</span><span style="color: #8aac8b;">&</span>  <span style="color: #8aac8b;">&</span>',
                '             <span style="color: #8aac8b;">&</span>    <span style="color: #6a8a6b;">/</span><span style="color: #6a8a6b;">|</span> <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span>',
                '            <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span> <span style="color: #6a8a6b;">/</span> <span style="color: #6a8a6b;">|</span><span style="color: #6a8a6b;">\\</span>',
                '              <span style="color: #6a8a6b;">\\</span><span style="color: #6a8a6b;">/</span> <span style="color: #6a8a6b;">|</span><span style="color: #6a8a6b;">\\</span>',
                '               <span style="color: #8b6f47;">|</span> <span style="color: #8b6f47;">|</span>',
                '              <span style="color: #8b6f47;">/</span><span style="color: #8b6f47;">|</span> <span style="color: #8b6f47;">\\</span>',
                '             <span style="color: #8b6f47;">/</span> <span style="color: #8b6f47;">|</span>  <span style="color: #8b6f47;">\\</span>',
                '            <span style="color: #8b6f47;">/</span>  <span style="color: #8b6f47;">|</span>   <span style="color: #8b6f47;">\\</span>',
                '           <span style="color: #8b6f47;">|</span>   <span style="color: #8b6f47;">|</span>    <span style="color: #8b6f47;">|</span>',
                '    <span style="color: #9e9e9e;">:</span><span style="color: #6a8a6b;">___________</span><span style="color: #8b6f47;">./~~\\.</span><span style="color: #6a8a6b;">___________</span><span style="color: #9e9e9e;">:</span>',
                '     \\                          /',
                '      \\________________________/',
                '      (_)                    (_)'
            ],
            [
                '                 <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span>',
                '                <span style="color: #8aac8b;">&</span> <span style="color: #6a8a6b;">\\</span><span style="color: #6a8a6b;">/</span><span style="color: #6a8a6b;">|</span><span style="color: #8aac8b;">&</span>',
                '                 <span style="color: #6a8a6b;">~</span><span style="color: #8aac8b;">&</span><span style="color: #6a8a6b;">|</span><span style="color: #8aac8b;">&</span><span style="color: #6a8a6b;">\\</span>',
                '               <span style="color: #8aac8b;">&</span>  <span style="color: #6a8a6b;">|</span><span style="color: #8aac8b;">&</span>  <span style="color: #8aac8b;">&</span>',
                '             <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span> <span style="color: #6a8a6b;">/</span><span style="color: #6a8a6b;">|</span> <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span>',
                '            <span style="color: #8aac8b;">&</span> <span style="color: #8aac8b;">&</span> <span style="color: #6a8a6b;">/</span> <span style="color: #6a8a6b;">|</span><span style="color: #6a8a6b;">\\</span><span style="color: #6a8a6b;">\\</span>',
                '              <span style="color: #6a8a6b;">\\</span><span style="color: #6a8a6b;">/</span> <span style="color: #6a8a6b;">|</span> <span style="color: #6a8a6b;">\\</span>',
                '               <span style="color: #8b6f47;">|</span> <span style="color: #8b6f47;">|</span> <span style="color: #8b6f47;">|</span>',
                '              <span style="color: #8b6f47;">/</span><span style="color: #8b6f47;">|</span> <span style="color: #8b6f47;">|</span><span style="color: #8b6f47;">\\</span>',
                '             <span style="color: #8b6f47;">/</span> <span style="color: #8b6f47;">|</span> <span style="color: #8b6f47;">|</span> <span style="color: #8b6f47;">\\</span>',
                '            <span style="color: #8b6f47;">/</span>  <span style="color: #8b6f47;">|</span> <span style="color: #8b6f47;">|</span>  <span style="color: #8b6f47;">\\</span>',
                '           <span style="color: #8b6f47;">|</span>   <span style="color: #8b6f47;">|</span> <span style="color: #8b6f47;">|</span>   <span style="color: #8b6f47;">|</span>',
                '    <span style="color: #9e9e9e;">:</span><span style="color: #6a8a6b;">___________</span><span style="color: #8b6f47;">./~~\\.</span><span style="color: #6a8a6b;">___________</span><span style="color: #9e9e9e;">:</span>',
                '     \\                          /',
                '      \\________________________/',
                '      (_)                    (_)'
            ]
        ];
        
        let frameIndex = 0;
        const startLine = this.output.children.length;
        
        // Add initial frame
        bonsaiFrames[0].forEach(line => this.addLine(line));
        
        this.bonsaiInterval = setInterval(() => {
            frameIndex = (frameIndex + 1) % bonsaiFrames.length;
            
            // Remove old frame
            for (let i = 0; i < bonsaiFrames[0].length; i++) {
                if (this.output.children[startLine]) {
                    this.output.removeChild(this.output.children[startLine]);
                }
            }
            
            // Add new frame at the same position
            const currentLength = this.output.children.length;
            bonsaiFrames[frameIndex].forEach((line, index) => {
                const lineElement = document.createElement('div');
                lineElement.className = 'terminal-line';
                lineElement.innerHTML = line;
                
                if (startLine + index < currentLength) {
                    this.output.insertBefore(lineElement, this.output.children[startLine + index]);
                } else {
                    this.output.appendChild(lineElement);
                }
            });
            
        }, 3000);
        
        this.addLine('');
        this.addLine('<span style="color: #888;">Type "clear" to stop and clear the terminal</span>');
        this.addLine('');
    }
    
    whoami() {
        this.addLine('');
        this.addLine('tyreece');
        this.addLine('');
    }
    
    date() {
        const now = new Date();
        this.addLine('');
        this.addLine(now.toString());
        this.addLine('');
    }
    
    echo(args) {
        this.addLine('');
        this.addLine(args.join(' '));
        this.addLine('');
    }
    
    welcome() {
        this.addLine('');
        this.addLine(' ╔════════════════════════════════════════════════╗');
        this.addLine(' ║     Welcome to Tyreece Paul\'s Portfolio      ║');
        this.addLine(' ║            Interactive Terminal               ║');
        this.addLine(' ╚════════════════════════════════════════════════╝');
        this.addLine('');
        this.addLine('  Machine Learning Engineer | Applied Mathematician');
        this.addLine('');
        this.addLine('  Specializing in:');
        this.addLine('    • Deep Learning & Computer Vision');
        this.addLine('    • Data Science & Analytics');
        this.addLine('    • Software Development');
        this.addLine('');
        this.addLine('  Type \'<span class="terminal-command">help</span>\' to see available commands');
        this.addLine('');
    }
}

// Initialize terminal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const terminal = new Terminal();
});
