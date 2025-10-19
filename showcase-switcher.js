// ===================================
// Project Showcase Switcher
// Handles switching between different project visualizations
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.showcase-tab');
    const showcaseItems = document.querySelectorAll('.showcase-item');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const showcaseId = tab.getAttribute('data-showcase');
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all showcase items
            showcaseItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // Show selected showcase item
            const selectedShowcase = document.getElementById(`showcase-${showcaseId}`);
            if (selectedShowcase) {
                selectedShowcase.classList.add('active');
                
                // Trigger resize events for canvas elements
                window.dispatchEvent(new Event('resize'));
                
                // Focus terminal input if terminal is selected
                if (showcaseId === 'terminal') {
                    setTimeout(() => {
                        const terminalInput = document.getElementById('terminalInput');
                        if (terminalInput) {
                            terminalInput.focus();
                        }
                    }, 100);
                }
            }
        });
    });
});
