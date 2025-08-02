/**
 * InfiniteSlide v2 - Vanilla JavaScript Version
 * Original author: T.Morimoto
 * Converted to vanilla JS
 * Free to use under MIT license
 */

class InfiniteSlide {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            speed: 100, // Speed in px/second
            direction: 'left', // up/down/left/right
            pauseonhover: true, // Pause on mouse hover
            responsive: false, // For responsive layouts
            clone: 1, // Number of times to clone
            ...options
        };
        
        this.id = Date.now() + Math.floor(10000 * Math.random()).toString(16);
        this.isRunning = true;
        
        if (document.readyState === 'complete') {
            this.init();
        } else {
            window.addEventListener('load', () => this.init());
        }
    }

    init() {
        this.setupWrapper();
        this.createClones();
        this.setupAnimation();
        
        if (this.options.pauseonhover) {
            this.setupHoverPause();
        }
        
        if (this.options.responsive) {
            this.setupResponsive();
        }
    }

    setupWrapper() {
        // Create wrapper if needed
        if (!this.element.parentElement.classList.contains('infiniteslide_wrap')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'infiniteslide_wrap';
            wrapper.style.overflow = 'hidden';
            this.element.parentNode.insertBefore(wrapper, this.element);
            wrapper.appendChild(this.element);
        }

        // Set flex direction based on animation direction
        const isVertical = this.options.direction === 'up' || this.options.direction === 'down';
        this.element.style.display = 'flex';
        this.element.style.flexWrap = 'nowrap';
        this.element.style.alignItems = 'center';
        this.element.style.flexDirection = isVertical ? 'column' : 'row';

        // Style children
        Array.from(this.element.children).forEach(child => {
            child.style.flex = 'none';
            child.style.display = 'block';
        });
    }

    createClones() {
        const originalChildren = Array.from(this.element.children);
        for (let i = 0; i < this.options.clone; i++) {
            originalChildren.forEach(child => {
                const clone = child.cloneNode(true);
                clone.classList.add('infiniteslide_clone');
                this.element.appendChild(clone);
            });
        }
    }

    getDimension() {
        const isVertical = this.options.direction === 'up' || this.options.direction === 'down';
        let size = 0;
        
        Array.from(this.element.children)
            .filter(child => !child.classList.contains('infiniteslide_clone'))
            .forEach(child => {
                const rect = child.getBoundingClientRect();
                size += isVertical ? rect.height : rect.width;
                
                // Add margins
                const style = window.getComputedStyle(child);
                if (isVertical) {
                    size += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
                } else {
                    size += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
                }
            });
            
        return size;
    }

    getTransform(size) {
        const { direction } = this.options;
        switch (direction) {
            case 'up':
                return `translate3d(0, -${size}px, 0)`;
            case 'down':
                return `translate3d(0, ${size}px, 0)`;
            case 'left':
                return `translate3d(-${size}px, 0, 0)`;
            case 'right':
                return `translate3d(${size}px, 0, 0)`;
            default:
                return `translate3d(-${size}px, 0, 0)`;
        }
    }

    setupAnimation() {
        const size = this.getDimension();
        const transform = this.getTransform(size);
        const duration = size / this.options.speed;
        const reverse = this.options.direction === 'right' || this.options.direction === 'down';

        // Set container height for vertical scrolling
        if (this.options.direction === 'up' || this.options.direction === 'down') {
            this.element.parentElement.style.height = `${size}px`;
        }

        // Create and inject keyframe animation
        const styleId = `infiniteslide${this.id}_style`;
        const keyframes = `
            @keyframes infiniteslide${this.id} {
                from { transform: translate3d(0, 0, 0); }
                to { transform: ${transform}; }
            }
        `;

        let styleElement = document.getElementById(styleId);
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        styleElement.textContent = keyframes;

        // Apply animation to element
        this.element.style.animation = `infiniteslide${this.id} ${duration}s linear infinite${reverse ? ' reverse' : ''}`;
        this.element.dataset.style = `infiniteslide${this.id}`;
    }

    setupHoverPause() {
        this.element.addEventListener('mouseenter', () => {
            this.element.style.animationPlayState = 'paused';
        });
        
        this.element.addEventListener('mouseleave', () => {
            if (this.isRunning) {
                this.element.style.animationPlayState = 'running';
            }
        });
    }

    setupResponsive() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const size = this.getDimension();
                const transform = this.getTransform(size);
                const styleId = `infiniteslide${this.id}_style`;
                const styleElement = document.getElementById(styleId);
                
                if (styleElement) {
                    const currentStyle = styleElement.textContent;
                    const newStyle = currentStyle.replace(
                        /to\s*{\s*transform:[^}]+}/,
                        `to { transform: ${transform}; }`
                    );
                    styleElement.textContent = newStyle;
                }
            }, 150);
        });
    }

    pause() {
        this.isRunning = false;
        this.element.style.animationPlayState = 'paused';
    }

    resume() {
        this.isRunning = true;
        this.element.style.animationPlayState = 'running';
    }

    destroy() {
        // Remove animation
        this.element.style.animation = '';
        
        // Remove clones
        this.element.querySelectorAll('.infiniteslide_clone').forEach(clone => clone.remove());
        
        // Remove style element
        document.getElementById(`infiniteslide${this.id}_style`)?.remove();
        
        // Unwrap from container
        const parent = this.element.parentElement;
        if (parent.classList.contains('infiniteslide_wrap')) {
            parent.replaceWith(this.element);
        }
        
        // Reset element styles
        this.element.style.display = '';
        this.element.style.flexWrap = '';
        this.element.style.alignItems = '';
        this.element.style.flexDirection = '';
        
        // Reset children styles
        Array.from(this.element.children).forEach(child => {
            child.style.flex = '';
            child.style.display = '';
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize any infinite slides with data attributes
    document.querySelectorAll('[data-infiniteslide]').forEach(element => {
        const options = JSON.parse(element.dataset.infiniteslide || '{}');
        new InfiniteSlide(element, options);
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InfiniteSlide;
}