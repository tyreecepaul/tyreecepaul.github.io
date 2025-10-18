// Image Gallery Auto-Rotation
class ImageGallery {
    constructor() {
        this.currentIndex = 0;
        this.images = document.querySelectorAll('.gallery-image');
        this.dots = document.querySelectorAll('.gallery-dot');
        this.prevBtn = document.querySelector('.gallery-prev');
        this.nextBtn = document.querySelector('.gallery-next');
        this.autoRotateInterval = null;
        this.autoRotateDelay = 10000; // 10 seconds
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }
    
    init() {
        if (this.images.length === 0) return;
        
        // Add event listeners
        this.prevBtn?.addEventListener('click', () => this.navigate(-1));
        this.nextBtn?.addEventListener('click', () => this.navigate(1));
        
        // Add click handlers to dots
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const aboutSection = document.getElementById('about');
            const isInView = aboutSection?.classList.contains('in-view');
            
            if (isInView) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.navigate(-1);
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.navigate(1);
                }
            }
        });
        
        // Start auto-rotation
        this.startAutoRotate();
        
        // Pause on hover
        const gallery = document.querySelector('.about-image');
        if (gallery) {
            gallery.addEventListener('mouseenter', () => this.stopAutoRotate());
            gallery.addEventListener('mouseleave', () => this.startAutoRotate());
            
            // Touch swipe support
            gallery.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            gallery.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            }, { passive: true });
        }
        
        // Handle visibility change to pause when tab is not active
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoRotate();
            } else {
                this.startAutoRotate();
            }
        });
    }
    
    handleSwipe() {
        const swipeThreshold = 50; // Minimum swipe distance
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left, go to next
                this.navigate(1);
            } else {
                // Swiped right, go to previous
                this.navigate(-1);
            }
        }
    }
    
    navigate(direction) {
        // Remove active class from current image and dot
        this.images[this.currentIndex].classList.remove('active');
        this.dots[this.currentIndex]?.classList.remove('active');
        this.dots[this.currentIndex]?.setAttribute('aria-selected', 'false');
        
        // Calculate new index
        this.currentIndex += direction;
        
        // Loop around
        if (this.currentIndex >= this.images.length) {
            this.currentIndex = 0;
        } else if (this.currentIndex < 0) {
            this.currentIndex = this.images.length - 1;
        }
        
        // Add active class to new image and dot
        this.images[this.currentIndex].classList.add('active');
        this.dots[this.currentIndex]?.classList.add('active');
        this.dots[this.currentIndex]?.setAttribute('aria-selected', 'true');
        
        // Announce to screen readers
        const galleryRegion = document.querySelector('.image-gallery');
        if (galleryRegion) {
            galleryRegion.setAttribute('aria-label', `Gallery image ${this.currentIndex + 1} of ${this.images.length}`);
        }
        
        // Reset auto-rotate timer
        this.resetAutoRotate();
    }
    
    goToSlide(index) {
        if (index === this.currentIndex) return;
        
        // Remove active class from current image and dot
        this.images[this.currentIndex].classList.remove('active');
        this.dots[this.currentIndex]?.classList.remove('active');
        this.dots[this.currentIndex]?.setAttribute('aria-selected', 'false');
        
        // Set new index
        this.currentIndex = index;
        
        // Add active class to new image and dot
        this.images[this.currentIndex].classList.add('active');
        this.dots[this.currentIndex]?.classList.add('active');
        this.dots[this.currentIndex]?.setAttribute('aria-selected', 'true');
        
        // Announce to screen readers
        const galleryRegion = document.querySelector('.image-gallery');
        if (galleryRegion) {
            galleryRegion.setAttribute('aria-label', `Gallery image ${this.currentIndex + 1} of ${this.images.length}`);
        }
        
        // Reset auto-rotate timer
        this.resetAutoRotate();
    }
    
    startAutoRotate() {
        this.stopAutoRotate(); // Clear any existing interval
        this.autoRotateInterval = setInterval(() => {
            this.navigate(1);
        }, this.autoRotateDelay);
    }
    
    stopAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }
    
    resetAutoRotate() {
        this.stopAutoRotate();
        this.startAutoRotate();
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageGallery();
});
