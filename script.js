// ===================================
// Navigation & Section Management
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // Get all catalog links and sections
    const catalogLinks = document.querySelectorAll('.catalog-link');
    const sections = document.querySelectorAll('.section');
    const catalogToggle = document.getElementById('catalogToggle');
    const rightCatalog = document.getElementById('rightCatalog');
    const overlay = document.getElementById('overlay');
    const mainContent = document.querySelector('.main-content');
    const scrollDots = document.querySelectorAll('.scroll-dot');

    // Initial section animation
    sections.forEach((section, index) => {
        if (index === 0) {
            section.classList.add('in-view');
        }
    });

    // Navigation handler - Smooth scroll to sections
    catalogLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target section
            const targetSection = this.getAttribute('data-section');
            const targetElement = document.getElementById(targetSection);
            
            if (targetElement) {
                // Smooth scroll to section with custom duration
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                rightCatalog.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    });

    // Scroll indicator dots functionality
    scrollDots.forEach(dot => {
        dot.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            const targetElement = document.getElementById(targetSection);
            
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile catalog toggle
    if (catalogToggle) {
        catalogToggle.addEventListener('click', function() {
            rightCatalog.classList.toggle('active');
            overlay.classList.toggle('active');
        });
    }

    // Overlay click to close catalog on mobile
    if (overlay) {
        overlay.addEventListener('click', function() {
            rightCatalog.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // ===================================
    // Experience Timeline Expand/Collapse
    // ===================================
    const experienceHeaders = document.querySelectorAll('[data-toggle="experience"]');
    
    experienceHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const experienceItem = this.closest('.experience-item');
            const isExpanded = experienceItem.classList.contains('expanded');
            
            // Close all other items
            document.querySelectorAll('.experience-item').forEach(item => {
                if (item !== experienceItem) {
                    item.classList.remove('expanded');
                }
            });
            
            // Toggle current item
            experienceItem.classList.toggle('expanded');
        });
    });

    // ===================================
    // Project Card & Panel Management
    // ===================================
    const projectCards = document.querySelectorAll('.project-card');
    const projectPanel = document.getElementById('projectPanel');
    const closePanel = document.getElementById('closePanel');
    const panelTitle = document.getElementById('panelTitle');
    const panelDescription = document.getElementById('panelDescription');
    const panelFeatures = document.getElementById('panelFeatures');
    const panelTechnologies = document.getElementById('panelTechnologies');

    // Sample project data (replace with your actual data)
    const projectData = {
        '1': {
            title: '[PROJECT_TITLE_1]',
            description: '[DETAILED_PROJECT_DESCRIPTION]',
            features: ['[FEATURE_1]', '[FEATURE_2]', '[FEATURE_3]', '[FEATURE_4]'],
            technologies: ['[TECH_1]', '[TECH_2]', '[TECH_3]', '[TECH_4]'],
            github: '[GITHUB_URL]',
            demo: '[DEMO_URL]'
        },
        '2': {
            title: '[PROJECT_TITLE_2]',
            description: '[DETAILED_PROJECT_DESCRIPTION]',
            features: ['[FEATURE_1]', '[FEATURE_2]', '[FEATURE_3]', '[FEATURE_4]'],
            technologies: ['[TECH_1]', '[TECH_2]', '[TECH_3]', '[TECH_4]'],
            github: '[GITHUB_URL]',
            demo: '[DEMO_URL]'
        },
        '3': {
            title: '[PROJECT_TITLE_3]',
            description: '[DETAILED_PROJECT_DESCRIPTION]',
            features: ['[FEATURE_1]', '[FEATURE_2]', '[FEATURE_3]', '[FEATURE_4]'],
            technologies: ['[TECH_1]', '[TECH_2]', '[TECH_3]', '[TECH_4]'],
            github: '[GITHUB_URL]',
            demo: '[DEMO_URL]'
        },
        '4': {
            title: '[PROJECT_TITLE_4]',
            description: '[DETAILED_PROJECT_DESCRIPTION]',
            features: ['[FEATURE_1]', '[FEATURE_2]', '[FEATURE_3]', '[FEATURE_4]'],
            technologies: ['[TECH_1]', '[TECH_2]', '[TECH_3]', '[TECH_4]'],
            github: '[GITHUB_URL]',
            demo: '[DEMO_URL]'
        }
    };

    // Open project panel
    projectCards.forEach(card => {
        card.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');
            const project = projectData[projectId];
            
            if (project) {
                // Update panel content
                panelTitle.textContent = project.title;
                panelDescription.textContent = project.description;
                
                // Update features list
                panelFeatures.innerHTML = project.features
                    .map(feature => `<li>${feature}</li>`)
                    .join('');
                
                // Update technologies
                panelTechnologies.innerHTML = project.technologies
                    .map(tech => `<span class="tech-badge">${tech}</span>`)
                    .join('');
                
                // Update links
                const panelLinks = document.querySelector('.panel-links');
                panelLinks.innerHTML = `
                    <a href="${project.github}" class="btn btn-primary" target="_blank">
                        <i class="fab fa-github"></i> View on GitHub
                    </a>
                    <a href="${project.demo}" class="btn btn-outline" target="_blank">
                        <i class="fas fa-external-link-alt"></i> Live Demo
                    </a>
                `;
                
                // Show panel
                projectPanel.classList.add('active');
                overlay.classList.add('active');
            }
        });
    });

    // Close project panel
    if (closePanel) {
        closePanel.addEventListener('click', function() {
            projectPanel.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Close panel when clicking overlay
    overlay.addEventListener('click', function() {
        projectPanel.classList.remove('active');
    });

    // ===================================
    // Smooth Scroll for Hero Buttons and All Anchor Links
    // ===================================
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===================================
    // Keyboard Navigation
    // ===================================
    document.addEventListener('keydown', function(e) {
        // Close panel with Escape key
        if (e.key === 'Escape') {
            if (projectPanel.classList.contains('active')) {
                projectPanel.classList.remove('active');
                overlay.classList.remove('active');
            }
            if (rightCatalog.classList.contains('active') && window.innerWidth <= 768) {
                rightCatalog.classList.remove('active');
                overlay.classList.remove('active');
            }
        }
    });

    // ===================================
    // Active Section Detection on Scroll with Snap
    // ===================================
    function updateActiveSection() {
        let currentSection = '';
        
        // Use Intersection Observer for better performance
        const observerOptions = {
            root: mainContent,
            threshold: 0.5,
            rootMargin: '0px'
        };
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');
                    currentSection = sectionId;
                    
                    // Add animation class
                    entry.target.classList.add('in-view');
                    
                    // Update navigation active states
                    catalogLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === sectionId) {
                            link.classList.add('active');
                        }
                    });
                    
                    // Update scroll indicator dots
                    scrollDots.forEach(dot => {
                        dot.classList.remove('active');
                        if (dot.getAttribute('data-section') === sectionId) {
                            dot.classList.add('active');
                        }
                    });
                    
                    // Update progress line
                    updateProgressLine(sectionId);
                }
            });
        }, observerOptions);
        
        // Observe all sections
        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }
    
    // Initialize section detection
    updateActiveSection();
    
    // Keyboard navigation for sections
    document.addEventListener('keydown', function(e) {
        const currentActive = document.querySelector('.catalog-link.active');
        if (!currentActive) return;
        
        const currentIndex = Array.from(catalogLinks).indexOf(currentActive);
        let targetIndex = currentIndex;
        
        // Arrow down or Page Down
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            targetIndex = Math.min(currentIndex + 1, catalogLinks.length - 1);
        }
        // Arrow up or Page Up
        else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            targetIndex = Math.max(currentIndex - 1, 0);
        }
        
        if (targetIndex !== currentIndex) {
            catalogLinks[targetIndex].click();
        }
    });

    // ===================================
    // Responsive Handling
    // ===================================
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Close mobile menu when resizing to desktop
            if (window.innerWidth > 768) {
                rightCatalog.classList.remove('active');
                overlay.classList.remove('active');
            }
        }, 250);
    });

    // ===================================
    // Contact Form Handler
    // ===================================
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Here you would typically send the data to a server
            // For now, we'll just log it and show a success message
            console.log('Form submitted:', formData);
            
            // Show success message (you can customize this)
            alert('Thank you for your message! I will get back to you soon.');
            
            // Reset form
            contactForm.reset();
            
            // Note: To actually send emails, you'll need to integrate with a backend service
            // like EmailJS, Formspree, or your own server endpoint
        });
    }

    // ===================================
    // Initial Setup
    // ===================================
    // Add loading animation complete class
    document.body.classList.add('loaded');
    
    // Set initial active section
    updateActiveSection();
    
    // Set the line height based on menu items
    setLineHeight();
});

// Set the progress line track height to match menu items
function setLineHeight() {
    const catalogMenu = document.querySelector('.catalog-menu');
    const menuItems = catalogMenu.querySelectorAll('li');
    
    if (menuItems.length < 2) return;
    
    const firstItem = menuItems[0];
    const lastItem = menuItems[menuItems.length - 1];
    
    // Calculate distance from center of first item to center of last item
    const firstCenter = firstItem.offsetTop + (firstItem.offsetHeight / 2);
    const lastCenter = lastItem.offsetTop + (lastItem.offsetHeight / 2);
    const lineHeight = lastCenter - firstCenter;
    
    // Set as CSS variable
    catalogMenu.style.setProperty('--line-height', `${lineHeight}px`);
}

// ===================================
// Utility Functions
// ===================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Update progress line in navigation
function updateProgressLine(sectionId) {
    const catalogMenu = document.querySelector('.catalog-menu');
    const menuItems = catalogMenu.querySelectorAll('li');
    const sections = ['home', 'about', 'stack', 'experience', 'projects', 'contact'];
    const currentIndex = sections.indexOf(sectionId);
    
    if (currentIndex === -1 || !catalogMenu || menuItems.length === 0) return;
    
    // Calculate the actual height based on menu items
    const firstItem = menuItems[0];
    const lastItem = menuItems[menuItems.length - 1];
    
    if (!firstItem || !lastItem) return;
    
    // Get positions
    const firstItemTop = firstItem.offsetTop + (firstItem.offsetHeight / 2);
    const lastItemTop = lastItem.offsetTop + (lastItem.offsetHeight / 2);
    const totalHeight = lastItemTop - firstItemTop;
    
    // Calculate progress based on current item
    const currentItem = menuItems[currentIndex];
    if (!currentItem) return;
    
    const currentItemCenter = currentItem.offsetTop + (currentItem.offsetHeight / 2);
    const progressHeight = currentItemCenter - firstItemTop;
    
    // Update the ::after pseudo-element height
    catalogMenu.style.setProperty('--progress-height', `${progressHeight}px`);
}

// ===================================
// Bonsai Tree Animation
// ===================================
class BonsaiTree {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = 35;
        this.height = 22;
        this.grid = [];
        this.branches = [];
        this.animationFrame = 0;
        this.isGrowing = false;
        this.colors = {
            trunk: '#6B6B6B',      // Dark grey
            branch: '#8B8B8B',     // Medium grey
            leaf: '#8A9DE8',       // Light blue
            darkLeaf: '#5566C4'    // Blue-purple
        };
        this.init();
    }

    init() {
        // Initialize grid with spaces
        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = { char: ' ', color: '#d4d4d4' };
            }
        }
    }

    setChar(x, y, char, color) {
        const ix = Math.round(x);
        const iy = Math.round(y);
        if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
            this.grid[iy][ix] = { char, color };
        }
    }

    createBranch(x, y, life, angle, type = 'trunk') {
        return {
            x, y, life, angle, type,
            age: 0,
            dx: 0,
            dy: 0
        };
    }

    step() {
        if (!this.isGrowing) return;

        let stillGrowing = false;
        const newBranches = [];

        for (let branch of this.branches) {
            if (branch.age < branch.life) {
                stillGrowing = true;
                branch.age++;

                // Calculate movement - more dynamic
                if (branch.type === 'trunk') {
                    branch.dy = -0.9 + Math.random() * 0.2;
                    // Keep trunk more centered with balanced left/right movement
                    branch.dx = Math.sin(branch.angle) * 0.3 + (Math.random() - 0.5) * 0.15;
                    branch.angle += (Math.random() - 0.5) * 0.08; // Smaller angle change for balance
                } else {
                    branch.dy = -0.4 + (Math.random() - 0.5) * 0.4;
                    branch.dx = Math.cos(branch.angle) * 0.7 + (Math.random() - 0.5) * 0.4;
                    branch.angle += (Math.random() - 0.5) * 0.15; // More organic movement
                }

                branch.x += branch.dx;
                branch.y += branch.dy;

                // Determine character and color
                let char, color;
                const lifeRatio = branch.age / branch.life;

                if (lifeRatio < 0.65) {
                    // Trunk or branch
                    if (branch.type === 'trunk') {
                        if (Math.abs(branch.dx) < 0.15) {
                            char = '|';
                        } else if (branch.dx > 0) {
                            char = '/';
                        } else {
                            char = '\\';
                        }
                    } else {
                        if (branch.dx > 0.3) {
                            char = Math.random() > 0.5 ? '/' : '|';
                        } else if (branch.dx < -0.3) {
                            char = Math.random() > 0.5 ? '\\' : '|';
                        } else {
                            char = Math.random() > 0.5 ? '~' : '_';
                        }
                    }
                    color = branch.age < 4 ? this.colors.trunk : this.colors.branch;
                } else {
                    // Leaves
                    const leafChars = ['&', '@', '*', '%', '§', '❀', '✿'];
                    char = leafChars[Math.floor(Math.random() * leafChars.length)];
                    color = Math.random() > 0.5 ? this.colors.leaf : this.colors.darkLeaf;
                }

                this.setChar(branch.x, branch.y, char, color);

                // Create new branches - more dynamic spawning
                if (branch.type === 'trunk' && branch.age > 3 && branch.life - branch.age > 4) {
                    // More frequent and varied branching
                    if (Math.random() > 0.7) {
                        const angleVariation = (Math.random() - 0.5) * Math.PI / 1.5;
                        const newLife = Math.floor(branch.life * (0.5 + Math.random() * 0.3));
                        newBranches.push(this.createBranch(
                            branch.x, branch.y,
                            newLife,
                            branch.angle + angleVariation,
                            'branch'
                        ));
                    }
                } else if (branch.type === 'branch' && branch.age > 2 && branch.life - branch.age > 3 && Math.random() > 0.85) {
                    // Secondary branching for more complexity
                    const angleVariation = (Math.random() - 0.5) * Math.PI / 2;
                    const newLife = Math.floor(branch.life * (0.4 + Math.random() * 0.2));
                    newBranches.push(this.createBranch(
                        branch.x, branch.y,
                        newLife,
                        branch.angle + angleVariation,
                        'branch'
                    ));
                }
            }
        }

        // Add new branches to the array
        this.branches.push(...newBranches);

        this.render();

        if (stillGrowing) {
            setTimeout(() => this.step(), 40); // Slightly faster for more dynamic feel
        } else {
            this.isGrowing = false;
        }
    }

    drawBase() {
        const baseY = this.height - 1;
        const base = '(---./~~\\.---)';
        const pot1 = ' (         ) ';
        const pot2 = ' (_________) ';

        const startX = Math.floor((this.width - base.length) / 2);
        
        for (let i = 0; i < base.length; i++) {
            this.setChar(startX + i, baseY - 2, base[i], this.colors.trunk);
        }
        for (let i = 0; i < pot1.length; i++) {
            this.setChar(startX + i, baseY - 1, pot1[i], this.colors.trunk);
        }
        for (let i = 0; i < pot2.length; i++) {
            this.setChar(startX + i, baseY, pot2[i], this.colors.trunk);
        }
    }

    render() {
        let output = '';
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                output += `<span style="color: ${cell.color}">${cell.char}</span>`;
            }
            output += '\n';
        }
        this.container.innerHTML = output;
    }

    grow() {
        if (this.isGrowing) return;

        this.init();
        this.branches = [];
        this.drawBase();
        this.isGrowing = true;

        // Start main trunk - add slight random variation but keep it centered
        const startX = this.width / 2;
        const startY = this.height - 4;
        const trunkLife = 18;
        const startAngle = Math.PI / 2 + (Math.random() - 0.5) * 0.1; // Small random variation

        this.branches.push(this.createBranch(
            startX, startY, trunkLife,
            startAngle,
            'trunk'
        ));

        // Start the animation
        this.step();
    }
}

// Initialize bonsai tree on page load
let bonsaiInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    const bonsaiContainer = document.getElementById('bonsaiTree');
    if (bonsaiContainer) {
        bonsaiInstance = new BonsaiTree('bonsaiTree');
        
        // Initial delay before first growth
        setTimeout(() => {
            bonsaiInstance.grow();
        }, 500);
        
        // Regrow tree every 15 seconds
        setInterval(() => {
            bonsaiInstance.grow();
        }, 15000);
    }
});
