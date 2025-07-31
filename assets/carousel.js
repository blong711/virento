if ($(".tf-sw-slideshow").length > 0) {
    var tfSwSlideshow = $(".tf-sw-slideshow");
    var preview = tfSwSlideshow.data("preview");
    var tablet = tfSwSlideshow.data("tablet");
    var mobile = tfSwSlideshow.data("mobile");
    var spacing = tfSwSlideshow.data("space");
    var spacingMb = tfSwSlideshow.data("space-mb");
    var loop = tfSwSlideshow.data("loop");
    var play = tfSwSlideshow.data("auto-play");
    var centered = tfSwSlideshow.data("centered");
    var effect = tfSwSlideshow.data("effect");
    var speed = tfSwSlideshow.data("speed") !== undefined ? tfSwSlideshow.data("speed") : 1000;
    var swiperSlider = {
        autoplay: play
        ? {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        }
        : false,
        slidesPerView: mobile,
        loop: loop,
        spaceBetween: spacingMb,
        speed: speed,
        observer: true,
        observeParents: true,
        pagination: {
            el: ".sw-pagination-slider",
            clickable: true,
        },
        navigation: {
            clickable: true,
            nextEl: ".navigation-next-slider",
            prevEl: ".navigation-prev-slider",
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
    var swiper = new Swiper(".tf-sw-slideshow", swiperSlider);
}

if ($(".tf-swiper").length > 0) {
    $(".tf-swiper").each(function () {
        const config = $(this).data("swiper");
        config.preventClicks = false;
        config.preventClicksPropagation = false;
        if (this.swiper) {
            this.swiper.destroy(true, true);
        }
        new Swiper(this, config);
    });
}

if ($(".tf-single-slide").length > 0) {
    var main = new Swiper(".tf-single-slide", {
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

    function updateActiveButton(type, activeIndex) {
        var btnClass = `.${type}-btn`;
        var dataAttr = `data-${type}`;
        var currentClass = `.value-current${capitalizeFirstLetter(type)}`;
        var selectClass = `.select-current${capitalizeFirstLetter(type)}`;
        $(btnClass).removeClass("active");

        var currentSlide = $(".tf-single-slide .swiper-slide").eq(activeIndex);
        var currentValue = currentSlide.attr(dataAttr);

        if (currentValue) {
            $(`${btnClass}[${dataAttr}='${currentValue}']`).addClass("active");
            $(currentClass).text(currentValue);
            $(selectClass).text(currentValue);
        }
    }

    function scrollTo(type, value, color) {
        if (!value || !color) return;
        var matchingSlides = $(".tf-single-slide .swiper-slide").filter(
            function () {
                return (
                    $(this).attr(`data-${type}`) === value &&
                    $(this).attr("data-color") === color
                );
            }
        );

        if (matchingSlides.length > 0) {
            var firstIndex = matchingSlides.first().index();
            main.slideTo(firstIndex, 1000, false);
        } else {
            var fallbackSlides = $(".tf-single-slide .swiper-slide").filter(
                function () {
                    return $(this).attr(`data-${type}`) === value;
                }
            );

            if (fallbackSlides.length > 0) {
                var fallbackIndex = fallbackSlides.first().index();
                main.slideTo(fallbackIndex, 1000, false);
            }
        }
    }

    function setupVariantButtons(type) {
        $(`.${type}-btn`).on("click", function () {
            var value = $(this).data(type);
            var color = $(".value-currentColor").text();

            $(`.${type}-btn`).removeClass("active");
            $(this).addClass("active");

            scrollTo(type, value, color);
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    ["color"].forEach((type) => {
        main.on("slideChange", function () {
            updateActiveButton(type, this.activeIndex);
        });
        setupVariantButtons(type);
        updateActiveButton(type, main.activeIndex);
    });
}

if ($(".flat-thumbs-tes").length > 0) {
    var spaceThumbLg = $(".tf-thumb-tes").data("space-lg");
    var spaceThumb = $(".tf-thumb-tes").data("space");
    var spaceTesLg = $(".tf-tes-main").data("space-lg");
    var spaceTes = $(".tf-tes-main").data("space");
    var effect = $(".flat-thumbs-tes").data("effect") || "slide";
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

if ($(".slider-thumb-wrap").length > 0) {
    const contentThumbSlider = new Swiper(".slider-content-thumb", {
        slidesPerView: 1,
        loop: true,
        grabCursor: true,
        speed:800,
        on: {
            slideChange: function () {
                const activeIndex = this.realIndex;
                $(".btn-thumbs").removeClass("active");
                $(".btn-thumbs").eq(activeIndex).addClass("active");
            },
        },
    });

    $(".btn-thumbs").on("click", function () {
        const index = $(this).index();
        $(".btn-thumbs").removeClass("active");
        $(this).addClass("active");
        contentThumbSlider.slideToLoop(index);
    });
}

if ($(".tf-sw-lb").length > 0) {
    var tfSwLb = $(".tf-sw-lb");
    var swiperLb = new Swiper(".tf-sw-lb", {
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
  
    $(".sw-btn").click(function () {
      var slideIndex = $(this).data("slide");
      $(".sw-btn").removeClass("active");
      $(this).addClass("active");
      swiperLb.slideTo(slideIndex,800,false);
    });
    swiperLb.on('slideChange', function () {
        var currentIndex = swiperLb.realIndex;
    
        $(".sw-btn").removeClass("active");
    
        $(".sw-btn[data-slide='" + currentIndex + "']").addClass("active");
    });
  }