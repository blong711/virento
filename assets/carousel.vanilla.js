// Slideshow initialization
function initSlideshow() {
    const tfSwSlideshow = document.querySelector(".tf-sw-slideshow");
    if (!tfSwSlideshow) return;

    const preview = parseInt(tfSwSlideshow.dataset.preview);
    const tablet = parseInt(tfSwSlideshow.dataset.tablet);
    const mobile = parseInt(tfSwSlideshow.dataset.mobile);
    const spacing = parseInt(tfSwSlideshow.dataset.space);
    const spacingMb = parseInt(tfSwSlideshow.dataset.spaceMb);
    const loop = tfSwSlideshow.dataset.loop === 'true';
    const play = tfSwSlideshow.dataset.autoPlay === 'true';
    const delay = parseInt(tfSwSlideshow.dataset.delay) || 5000;
    const pauseOnHover = tfSwSlideshow.dataset.pauseOnHover === 'true';
    const centered = tfSwSlideshow.dataset.centered === 'true';
    const effect = tfSwSlideshow.dataset.effect;
    const speed = tfSwSlideshow.dataset.speed ? parseInt(tfSwSlideshow.dataset.speed) : 1000;
    const simulateTouch = tfSwSlideshow.dataset.simulateTouch === 'true';

    const swiperSlider = {
        autoplay: play ? {
            delay: delay,
            disableOnInteraction: false,
            pauseOnMouseEnter: pauseOnHover,
        } : false,
        slidesPerView: mobile,
        loop: loop,
        spaceBetween: spacingMb,
        speed: speed,
        observer: true,
        observeParents: true,
        simulateTouch: simulateTouch,
        pagination: {
            el: ".sw-pagination-slider",
            clickable: true,
        },
        navigation: {
            clickable: true,
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        centeredSlides: false,
        breakpoints: {
            768: {
                slidesPerView: tablet,
                spaceBetween: spacing,
                centeredSlides: false,
            },
            1200: {
                slidesPerView: preview,
                spaceBetween: spacing,
                centeredSlides: centered,
            },
        },
    };

    if (effect === "fade") {
        swiperSlider.effect = "fade";
        swiperSlider.fadeEffect = {
            crossFade: true,
        };
    }

    new Swiper(".tf-sw-slideshow", swiperSlider);
}

// Generic Swiper initialization
function initGenericSwipers() {
    document.querySelectorAll(".tf-swiper").forEach(element => {
        const config = JSON.parse(element.dataset.swiper);
        config.preventClicks = false;
        config.preventClicksPropagation = false;
        
        if (element.swiper) {
            element.swiper.destroy(true, true);
        }
        new Swiper(element, config);
    });
}

// Single slide initialization
function initSingleSlide() {
    const singleSlideContainer = document.querySelector(".tf-single-slide");
    if (!singleSlideContainer) return;

    const main = new Swiper(".tf-single-slide", {
        slidesPerView: 1,
        spaceBetween: 0,
        observer: true,
        observeParents: true,
        speed: 800,
        navigation: {
            nextEl: ".single-slide-next",
            prevEl: ".single-slide-prev",
        },
    });

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function updateActiveButton(type, activeIndex) {
        const btnClass = `.${type}-btn`;
        const dataAttr = `data-${type}`;
        const currentClass = `.value-current${capitalizeFirstLetter(type)}`;
        const selectClass = `.select-current${capitalizeFirstLetter(type)}`;

        document.querySelectorAll(btnClass).forEach(btn => btn.classList.remove("active"));

        const currentSlide = document.querySelector(`.tf-single-slide .swiper-slide:nth-child(${activeIndex + 1})`);
        const currentValue = currentSlide?.getAttribute(dataAttr);

        if (currentValue) {
            const activeBtn = document.querySelector(`${btnClass}[${dataAttr}='${currentValue}']`);
            if (activeBtn) activeBtn.classList.add("active");
            
            document.querySelectorAll(currentClass).forEach(el => el.textContent = currentValue);
            document.querySelectorAll(selectClass).forEach(el => el.textContent = currentValue);
        }
    }

    function scrollTo(type, value, color) {
        if (!value || !color) return;

        const slides = Array.from(document.querySelectorAll(".tf-single-slide .swiper-slide"));
        const matchingSlides = slides.filter(slide => 
            slide.getAttribute(`data-${type}`) === value && 
            slide.getAttribute("data-color") === color
        );

        if (matchingSlides.length > 0) {
            const firstIndex = slides.indexOf(matchingSlides[0]);
            main.slideTo(firstIndex, 1000, false);
        } else {
            const fallbackSlides = slides.filter(slide => 
                slide.getAttribute(`data-${type}`) === value
            );

            if (fallbackSlides.length > 0) {
                const fallbackIndex = slides.indexOf(fallbackSlides[0]);
                main.slideTo(fallbackIndex, 1000, false);
            }
        }
    }

    function setupVariantButtons(type) {
        document.querySelectorAll(`.${type}-btn`).forEach(btn => {
            btn.addEventListener("click", function() {
                const value = this.dataset[type];
                const color = document.querySelector(".value-currentColor")?.textContent;

                document.querySelectorAll(`.${type}-btn`).forEach(b => b.classList.remove("active"));
                this.classList.add("active");

                scrollTo(type, value, color);
            });
        });
    }

    ["color"].forEach((type) => {
        main.on("slideChange", function() {
            updateActiveButton(type, this.activeIndex);
        });
        setupVariantButtons(type);
        updateActiveButton(type, main.activeIndex);
    });
}

// Testimonial slider initialization
function initTestimonialSlider() {
    const flatThumbsTes = document.querySelector(".flat-thumbs-tes");
    if (!flatThumbsTes) return;

    const tfThumbTes = document.querySelector(".tf-thumb-tes");
    const tfTesMain = document.querySelector(".tf-tes-main");
    
    const spaceThumbLg = parseInt(tfThumbTes.dataset.spaceLg);
    const spaceThumb = parseInt(tfThumbTes.dataset.space);
    const spaceTesLg = parseInt(tfTesMain.dataset.spaceLg);
    const spaceTes = parseInt(tfTesMain.dataset.space);
    const effect = flatThumbsTes.dataset.effect || "slide";

    const swThumb = new Swiper(".tf-thumb-tes", {
        speed: 800,
        spaceBetween: spaceThumb,
        effect: effect,
        fadeEffect: effect === "fade" ? { crossFade: true } : undefined,
        breakpoints: {
            768: {
                spaceBetween: spaceThumbLg,
            },
        },
    });

    const swTesMain = new Swiper(".tf-tes-main", {
        speed: 800,
        navigation: {
            nextEl: ".nav-next-tes",
            prevEl: ".nav-prev-tes",
        },
        effect: effect,
        fadeEffect: effect === "fade" ? { crossFade: true } : undefined,
        pagination: {
            el: ".sw-pagination-tes",
            clickable: true,
        },
        spaceBetween: spaceTes,
        breakpoints: {
            768: {
                spaceBetween: spaceTesLg,
            },
        },
    });

    swThumb.controller.control = swTesMain;
    swTesMain.controller.control = swThumb;
}

// Thumb slider initialization
function initThumbSlider() {
    const sliderThumbWrap = document.querySelector(".slider-thumb-wrap");
    if (!sliderThumbWrap) return;

    const contentThumbSlider = new Swiper(".slider-content-thumb", {
        slidesPerView: 1,
        loop: true,
        grabCursor: true,
        speed: 800,
        on: {
            slideChange: function() {
                const activeIndex = this.realIndex;
                document.querySelectorAll(".btn-thumbs").forEach(btn => btn.classList.remove("active"));
                document.querySelectorAll(".btn-thumbs")[activeIndex]?.classList.add("active");
            },
        },
    });

    document.querySelectorAll(".btn-thumbs").forEach((btn, index) => {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".btn-thumbs").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            contentThumbSlider.slideToLoop(index);
        });
    });
}

// Lightbox slider initialization
function initLightboxSlider() {
    const tfSwLb = document.querySelector(".tf-sw-lb");
    if (!tfSwLb) return;

    const swiperLb = new Swiper(".tf-sw-lb", {
        slidesPerView: 1,
        spaceBetween: 12,
        speed: 800,
        pagination: {
            el: ".sw-pagination-lb",
            clickable: true,
        },
        navigation: {
            clickable: true,
            nextEl: ".nav-next-lb",
            prevEl: ".nav-prev-lb",
        },
        breakpoints: {
            768: {
                spaceBetween: 24,
            }
        },
    });

    document.querySelectorAll(".sw-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            const slideIndex = parseInt(this.dataset.slide);
            document.querySelectorAll(".sw-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            swiperLb.slideTo(slideIndex, 800, false);
        });
    });

    swiperLb.on('slideChange', function() {
        const currentIndex = swiperLb.realIndex;
        document.querySelectorAll(".sw-btn").forEach(btn => btn.classList.remove("active"));
        document.querySelector(`.sw-btn[data-slide='${currentIndex}']`)?.classList.add("active");
    });
}

// Initialize all carousel components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initSlideshow();
    initGenericSwipers();
    initSingleSlide();
    initTestimonialSlider();
    initThumbSlider();
    initLightboxSlider();
});