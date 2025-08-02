import PhotoSwipeLightbox from './photoswipe-lightbox.esm.min.js';
import PhotoSwipe from './photoswipe.esm.min.js';

// Initialize product gallery
if (document.querySelector(".thumbs-slider")) {
    const thumbsContainer = document.querySelector(".tf-product-media-thumbs");
    const direction = thumbsContainer.dataset.direction;
    const preview = parseInt(thumbsContainer.dataset.preview);

    const thumbs = new Swiper(".tf-product-media-thumbs", {
        spaceBetween: 10,
        slidesPerView: preview,
        freeMode: true,
        direction: "vertical",
        watchSlidesProgress: true,
        observer: true,
        observeParents: true,
        breakpoints: {
            0: {
                direction: "horizontal",
                slidesPerView: preview,
            },
            1200: {
                direction: direction,
            },
        },
    });

    const main = new Swiper(".tf-product-media-main", {
        spaceBetween: 0,
        observer: true,
        observeParents: true,
        speed: 800,
        navigation: {
            nextEl: ".thumbs-next",
            prevEl: ".thumbs-prev",
        },
        thumbs: {
            swiper: thumbs,
        },
    });

    // 3D Model Viewer handling
    const modelViewer = document.querySelector('.slide-3d');
    if (modelViewer) {
        modelViewer.addEventListener('mouseenter', () => {
            main.allowTouchMove = false;
        });
        
        modelViewer.addEventListener('mouseleave', () => {
            main.allowTouchMove = true;
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function updateActiveButton(type, activeIndex) {
        const btnClass = `.${type}-btn`;
        const dataAttr = `data-${type}`;
        const currentClass = `.value-current${capitalizeFirstLetter(type)}`;
        const selectClass = `.select-current${capitalizeFirstLetter(type)}`;
        
        // Remove active class from all buttons
        document.querySelectorAll(btnClass).forEach(btn => btn.classList.remove("active"));
        
        // Get current slide and its value
        const currentSlide = document.querySelector(".tf-product-media-main .swiper-slide:nth-child(" + (activeIndex + 1) + ")");
        const currentValue = currentSlide ? currentSlide.getAttribute(dataAttr) : null;
        
        if (currentValue) {
            // Add active class to matching button
            const activeBtn = document.querySelector(`${btnClass}[${dataAttr}='${currentValue}']`);
            if (activeBtn) activeBtn.classList.add("active");
            
            // Update text displays
            document.querySelectorAll(currentClass).forEach(el => el.textContent = currentValue);
            document.querySelectorAll(selectClass).forEach(el => el.textContent = currentValue);
        }
    }

    function scrollTo(type, value, color) {
        if (!value || !color) return;
        
        // Find matching slides
        const slides = Array.from(document.querySelectorAll(".tf-product-media-main .swiper-slide"));
        const matchingSlides = slides.filter(slide => 
            slide.getAttribute(`data-${type}`) === value && 
            slide.getAttribute('data-color') === color
        );
        
        if (matchingSlides.length > 0) {
            const firstIndex = slides.indexOf(matchingSlides[0]);
            main.slideTo(firstIndex, 1000, false);
            thumbs.slideTo(firstIndex, 1000, false);
        } else {
            // Fallback to slides matching just the type
            const fallbackSlides = slides.filter(slide => 
                slide.getAttribute(`data-${type}`) === value
            );
            
            if (fallbackSlides.length > 0) {
                const fallbackIndex = slides.indexOf(fallbackSlides[0]);
                main.slideTo(fallbackIndex, 1000, false);
                thumbs.slideTo(fallbackIndex, 1000, false);
            }
        }
    }

    function setupVariantButtons(type) {
        document.querySelectorAll(`.${type}-btn`).forEach(btn => {
            btn.addEventListener("click", function() {
                const value = this.dataset[type];
                const color = document.querySelector(".value-currentColor").textContent;
                
                document.querySelectorAll(`.${type}-btn`).forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                
                scrollTo(type, value, color);
            });
        });
    }

    // Setup variant buttons and slide change handlers
    ["color", "size"].forEach((type) => {
        main.on("slideChange", function() {
            updateActiveButton(type, this.activeIndex);
        });
        setupVariantButtons(type);
        updateActiveButton(type, main.activeIndex);
    });
}

// Zoom functionality
function initZoomFunctionality() {
    function handleSectionZoom() {
        document.querySelectorAll(".tf-image-zoom").forEach(img => {
            img.addEventListener("mouseover", () => {
                img.closest(".section-image-zoom").classList.add("zoom-active");
            });
            
            img.addEventListener("mouseleave", () => {
                img.closest(".section-image-zoom").classList.remove("zoom-active");
            });
        });
    }

    function initCustomZoom() {
        function setupImageZoom() {
            const driftAll = document.querySelectorAll('.tf-image-zoom');
            const pane = document.querySelector('.tf-zoom-main');
            
            if (matchMedia("only screen and (min-width: 1200px)").matches) {
                driftAll.forEach(el => {
                    if (!el._drift) {
                        el._drift = new Drift(el, {
                            zoomFactor: 2,
                            paneContainer: pane,
                            inlinePane: false,
                            handleTouch: false,
                            hoverBoundingBox: true,
                            containInline: true,
                        });
                    }
                });
            } else {
                driftAll.forEach(el => {
                    if (el._drift) {
                        el._drift.destroy();
                        el._drift = null;
                    }
                });
            }
        }

        window.addEventListener('resize', setupImageZoom);
        setupImageZoom();
    }

    function initZoomMagnifier() {
        document.querySelectorAll('.tf-image-zoom-magnifier').forEach(el => {
            new Drift(el, {
                zoomFactor: 2,
                inlinePane: true,
                containInline: false,
            });
        });
    }

    function initZoomInner() {
        const pane = document.querySelector('.tf-product-zoom-inner');
        document.querySelectorAll('.tf-image-zoom-inner').forEach(el => {
            new Drift(el, {
                paneContainer: pane,
                zoomFactor: 2,
                inlinePane: false,
                containInline: false,
            });
        });
    }

    function initLightboxSwiper() {
        const lightbox = new PhotoSwipeLightbox({
            gallery: '#gallery-swiper-started',
            children: 'a',
            pswpModule: PhotoSwipe,
            bgOpacity: 1,
            secondaryZoomLevel: 2,
            maxZoomLevel: 3,
        });
        
        lightbox.init();

        lightbox.on('change', () => {
            const { pswp } = lightbox;
            if (typeof main !== 'undefined') {
                main.slideTo(pswp.currIndex, 0, false);
            }
        });

        lightbox.on('afterInit', () => {
            if (typeof main !== 'undefined' && main.params.autoplay.enabled) {
                main.autoplay.stop();
            }
        });

        lightbox.on('closingAnimationStart', () => {
            const { pswp } = lightbox;
            if (typeof main !== 'undefined') {
                main.slideTo(pswp.currIndex, 0, false);
                if (main.params.autoplay.enabled) {
                    main.autoplay.start();
                }
            }
        });
    }

    function initLightbox() {
        const lightbox = new PhotoSwipeLightbox({
            gallery: '#gallery-started',
            children: 'a',
            pswpModule: PhotoSwipe,
            bgOpacity: 1,
            secondaryZoomLevel: 2,
            maxZoomLevel: 3,
        });
        lightbox.init();
    }

    function initModelViewer() {
        const modelViewerContainer = document.querySelector(".tf-model-viewer");
        if (!modelViewerContainer) return;

        document.querySelectorAll(".tf-model-viewer-ui-button").forEach(button => {
            button.addEventListener("click", function() {
                const container = this.closest(".tf-model-viewer");
                const modelViewer = container.querySelector("model-viewer");
                modelViewer.classList.remove("disabled");
                container.classList.toggle("active");
            });
        });

        document.querySelectorAll(".tf-model-viewer-ui").forEach(ui => {
            ui.addEventListener("dblclick", function() {
                const container = this.closest(".tf-model-viewer");
                const modelViewer = container.querySelector("model-viewer");
                
                modelViewer.classList.add("disabled");
                container.classList.toggle("active");
                
                if (modelViewer) {
                    modelViewer.cameraOrbit = "0deg 90deg auto";
                    modelViewer.updateFraming();
                }
            });
        });
    }

    // Initialize all zoom-related functionality
    handleSectionZoom();
    initCustomZoom();
    initZoomMagnifier();
    initZoomInner();
    initLightboxSwiper();
    initLightbox();
    initModelViewer();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initZoomFunctionality);