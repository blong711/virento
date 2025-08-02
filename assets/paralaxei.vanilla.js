/**
 * Paralaxei - Vanilla JavaScript Parallax Library
 * Version: 1.0.0
 * Based on Parallaxie by THE ULTRASOFT
 * Licensed under MIT License
 */

class Paralaxei {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            speed: 0.2,
            repeat: 'no-repeat',
            size: 'cover',
            pos_x: 'center',
            offset: 0,
            ...options,
            ...this.getDataOptions(element)
        };
        
        this.init();
    }

    getDataOptions(element) {
        const dataOptions = {};
        const dataset = element.dataset;

        // Parse data-* attributes
        if (dataset.parallaxie) {
            try {
                Object.assign(dataOptions, JSON.parse(dataset.parallaxie));
            } catch (e) {
                console.warn('Invalid parallaxie data attributes:', e);
            }
        }

        // Get image URL from data attribute or CSS
        dataOptions.image = dataset.image || 
            window.getComputedStyle(element).backgroundImage;

        return dataOptions;
    }

    init() {
        if (!this.options.image) return;

        // Set initial styles
        this.setStyles();

        // Initial position calculation
        this.updatePosition();

        // Bind scroll event
        this.scrollHandler = () => this.updatePosition();
        window.addEventListener('scroll', this.scrollHandler, { passive: true });

        // Handle resize events
        this.resizeHandler = () => {
            this.updatePosition();
        };
        window.addEventListener('resize', this.resizeHandler, { passive: true });
    }

    setStyles() {
        Object.assign(this.element.style, {
            backgroundImage: this.options.image,
            backgroundSize: this.options.size,
            backgroundRepeat: this.options.repeat,
            backgroundAttachment: 'fixed',
            backgroundPosition: `${this.options.pos_x} 0px`
        });
    }

    updatePosition() {
        const rect = this.element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const offsetTop = rect.top + scrollTop;
        
        const pos_y = this.options.offset + 
            (offsetTop - scrollTop) * (1 - this.options.speed);

        this.element.style.backgroundPosition = 
            `${this.options.pos_x} ${pos_y}px`;

        // Store position for potential future use
        this.element.dataset.posY = pos_y;
    }

    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.scrollHandler);
        window.removeEventListener('resize', this.resizeHandler);

        // Reset styles
        Object.assign(this.element.style, {
            backgroundImage: '',
            backgroundSize: '',
            backgroundRepeat: '',
            backgroundAttachment: '',
            backgroundPosition: ''
        });

        // Remove stored position
        delete this.element.dataset.posY;
    }

    // Update options
    updateOptions(newOptions) {
        Object.assign(this.options, newOptions);
        this.setStyles();
        this.updatePosition();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize elements with data-paralaxei attribute
    document.querySelectorAll('[data-paralaxei]').forEach(element => {
        const options = JSON.parse(element.dataset.paralaxei || '{}');
        new Paralaxei(element, options);
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Paralaxei;
}