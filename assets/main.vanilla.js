/**
 * Modern Vanilla JavaScript implementation
 * Replacing jQuery dependencies with native JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  selectImages();
  variantPicker();
  customDropdown();
  handleProgressBar();
  totalPriceVariant();
  scrollGridProduct();
  hoverVideo();
  changeValueDropdown();
  buttonLoading();
  itemCheckbox();
  handleFooter();
  efectParalax();
  infiniteSlide();
  predictiveSearch();
  // buttonQuantity();
  // deleteItem();
  clickControl();
  tabSlide();
  copyText();
  // wishList();
  bottomSticky();
  handleSidebarFilter();
  cookieSetting();
  preloader();
  goTop();
  checkClick();
  swatchColor();
  sidebarMobile();
  staggerWrap();
  clickModalSecond();
  estimateShipping();
  headerSticky();
  newsletterPopup();
  exitPopup();
  new WOW().init();
  handleLocalizationSelectors();
});

/* Localization Selectors
---------------------------------------------------------------------------*/
const handleLocalizationSelectors = () => {
  // Handle language selector
  const languageSelector = document.getElementById('language-selector-topbar');
  if (languageSelector) {
    languageSelector.addEventListener('change', function () {
      const form = this.closest('form');
      if (form) {
        form.submit();
      }
    });
  }

  // Handle currency selector
  const currencySelector = document.getElementById('currency-selector-topbar');
  if (currencySelector) {
    currencySelector.addEventListener('change', function () {
      const form = this.closest('form');
      if (form) {
        form.submit();
      }
    });
  }
};

/* Custom Select with Images
---------------------------------------------------------------------------*/
const selectImages = () => {
  const imageSelects = document.querySelectorAll('.image-select');
  if (imageSelects.length === 0) return;

  class CustomSelect {
    constructor(originalSelect) {
      this.originalSelect = originalSelect;
      this.customSelect = document.createElement('div');
      this.customSelect.classList.add('custom-select-container');

      // Create selected display
      this.selectedDisplay = document.createElement('div');
      this.selectedDisplay.classList.add('custom-select-selected');

      // Create options container
      this.optionsContainer = document.createElement('div');
      this.optionsContainer.classList.add('custom-select-options');

      // Hide original select
      this.originalSelect.style.display = 'none';

      // Insert custom select after original
      this.originalSelect.parentNode.insertBefore(this.customSelect, this.originalSelect.nextSibling);

      // Add components to custom select
      this.customSelect.appendChild(this.selectedDisplay);
      this.customSelect.appendChild(this.optionsContainer);

      // Initialize
      this.createOptions();
      this.updateSelected();
      this.addEventListeners();
    }

    createOptions() {
      Array.from(this.originalSelect.options).forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('custom-select-option');

        const thumbnail = option.getAttribute('data-thumbnail');

        optionElement.innerHTML = `
          <div class="custom-select-option-content" style="display: flex;">
            ${
              thumbnail
                ? `<img class=\"option-image\" src=\"${thumbnail}\" alt=\"\" width=\"16\" height=\"16\" loading=\"lazy\">`
                : ''
            }
            <span class="option-text">${option.text}</span>
          </div>
        `;

        optionElement.dataset.value = option.value;
        optionElement.dataset.index = index;

        if (option.selected) {
          optionElement.classList.add('selected');
        }

        this.optionsContainer.appendChild(optionElement);
      });
    }

    updateSelected() {
      const selectedOption = this.originalSelect.options[this.originalSelect.selectedIndex];
      const imgURL = selectedOption.getAttribute('data-thumbnail');

      this.selectedDisplay.innerHTML = `
        <div class="custom-select-selected-content">
          ${
            imgURL
              ? `<img class=\"selected-image\" src=\"${imgURL}\" alt=\"\" width=\"16\" height=\"16\" loading=\"lazy\">`
              : ''
          }
          <span class="selected-text">${selectedOption.text}</span>
        </div>
        <span class="custom-select-arrow"></span>
      `;
    }

    addEventListeners() {
      // Toggle options on selected display click
      this.selectedDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close all other dropdowns first
        document.querySelectorAll('.custom-select-container.open').forEach((openSelect) => {
          if (openSelect !== this.customSelect) {
            openSelect.classList.remove('open');
          }
        });
        this.customSelect.classList.toggle('open');
      });

      // Handle option selection
      this.optionsContainer.addEventListener('click', (e) => {
        const option = e.target.closest('.custom-select-option');
        if (!option) return;

        const index = parseInt(option.dataset.index);
        this.originalSelect.selectedIndex = index;

        // Update selected option in custom select
        this.optionsContainer.querySelectorAll('.custom-select-option').forEach((opt) => {
          opt.classList.remove('selected');
        });
        option.classList.add('selected');

        this.updateSelected();
        this.customSelect.classList.remove('open');

        // Trigger change event on original select
        const event = new Event('change', { bubbles: true });
        this.originalSelect.dispatchEvent(event);
      });

      // Close on click outside
      document.addEventListener('click', (e) => {
        if (!this.customSelect.contains(e.target)) {
          this.customSelect.classList.remove('open');
        }
      });

      // Handle keyboard navigation
      this.customSelect.addEventListener('keydown', (e) => {
        const options = this.optionsContainer.querySelectorAll('.custom-select-option');
        const currentIndex = this.originalSelect.selectedIndex;

        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            if (currentIndex > 0) {
              this.originalSelect.selectedIndex = currentIndex - 1;
              this.updateSelected();
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (currentIndex < options.length - 1) {
              this.originalSelect.selectedIndex = currentIndex + 1;
              this.updateSelected();
            }
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            this.customSelect.classList.toggle('open');
            break;
          case 'Escape':
            this.customSelect.classList.remove('open');
            break;
        }
      });
    }
  }

  // Initialize custom select for each image-select element
  imageSelects.forEach((select) => {
    if (!select.customSelectInitialized) {
      new CustomSelect(select);
      select.customSelectInitialized = true;
    }
  });

  // Watch for changes to reinitialize
  const observer = new MutationObserver(() => {
    const newSelects = document.querySelectorAll('.image-select');
    newSelects.forEach((select) => {
      if (!select.customSelectInitialized) {
        new CustomSelect(select);
        select.customSelectInitialized = true;
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

/* Variant Picker
---------------------------------------------------------------------------*/
const variantPicker = () => {
  const variantPickers = document.querySelectorAll('.variant-picker-item');
  if (variantPickers.length === 0) return;

  // Color variant
  document.querySelectorAll('.color-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const value = btn.dataset.scroll;
      document.querySelectorAll('.value-currentColor').forEach((el) => {
        el.textContent = value;
      });

      // Remove active class from all buttons in the same group
      const parentValues = btn.closest('.variant-picker-values');
      if (parentValues) {
        parentValues.querySelectorAll('.color-btn').forEach((b) => {
          b.classList.remove('active');
        });
      }
      btn.classList.add('active');
    });
  });

  // Size variant
  document.querySelectorAll('.size-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const value = btn.dataset.size;
      document.querySelectorAll('.value-currentSize').forEach((el) => {
        el.textContent = value;
      });

      const parentValues = btn.closest('.variant-picker-values');
      if (parentValues) {
        parentValues.querySelectorAll('.size-btn').forEach((b) => {
          b.classList.remove('active');
        });
      }
      btn.classList.add('active');
    });
  });
};

/* Custom Dropdown
-------------------------------------------------------------------------*/
const customDropdown = () => {
  const updateDropdownClass = () => {
    const dropdowns = document.querySelectorAll('.dropdown-custom');

    dropdowns.forEach((dropdown) => {
      if (window.innerWidth <= 991) {
        dropdown.classList.add('dropup');
        dropdown.classList.remove('dropend');
      } else {
        dropdown.classList.add('dropend');
        dropdown.classList.remove('dropup');
      }
    });
  };

  // Initial call
  updateDropdownClass();

  // Update on window resize
  window.addEventListener('resize', updateDropdownClass);
};

/* Handle Progress Bar
-------------------------------------------------------------------------*/
const handleProgressBar = () => {
  const handleProgress = (showEvent, hideEvent, target) => {
    const progressBar = document.querySelector(target);
    if (!progressBar) return;

    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = scrolled + '%';
    };

    document.addEventListener(showEvent, () => {
      progressBar.style.display = 'block';
      updateProgress();
    });

    document.addEventListener(hideEvent, () => {
      progressBar.style.display = 'none';
    });

    document.addEventListener('scroll', updateProgress);
  };

  handleProgress('scroll', 'DOMContentLoaded', '.scroll-progress-bar');
};

/* Total Price Variant
-------------------------------------------------------------------------*/
const totalPriceVariant = () => {
  const updateTotalPrice = (price, scope) => {
    const totalPriceElements = scope.querySelectorAll('.total-price');
    totalPriceElements.forEach((el) => {
      el.textContent = price;
    });
  };

  document.querySelectorAll('.variant-price').forEach((variant) => {
    variant.addEventListener('change', (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const price = selectedOption.dataset.price;
      updateTotalPrice(price, variant.closest('.product-item'));
    });
  });
};

/* Scroll Grid Product
-------------------------------------------------------------------------*/
const scrollGridProduct = () => {
  const isHorizontalMode = () => {
    return window.innerWidth > 991;
  };

  const getTargetScroll = (target, isHorizontal) => {
    return isHorizontal ? target.scrollLeft : target.scrollTop;
  };

  document.querySelectorAll('.grid-product').forEach((grid) => {
    const scrollContainer = grid.querySelector('.grid-product-content');
    if (!scrollContainer) return;

    let isScrolling = false;
    let startPosition = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    scrollContainer.addEventListener('mousedown', (e) => {
      isScrolling = true;
      scrollContainer.classList.add('active');
      startPosition = isHorizontalMode() ? e.pageX - scrollContainer.offsetLeft : e.pageY - scrollContainer.offsetTop;
      scrollLeft = scrollContainer.scrollLeft;
      scrollTop = scrollContainer.scrollTop;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isScrolling) return;
      e.preventDefault();

      const position = isHorizontalMode() ? e.pageX - scrollContainer.offsetLeft : e.pageY - scrollContainer.offsetTop;
      const walk = position - startPosition;

      if (isHorizontalMode()) {
        scrollContainer.scrollLeft = scrollLeft - walk;
      } else {
        scrollContainer.scrollTop = scrollTop - walk;
      }
    });

    document.addEventListener('mouseup', () => {
      isScrolling = false;
      scrollContainer.classList.remove('active');
    });
  });
};

/* Hover Video
-------------------------------------------------------------------------*/
const hoverVideo = () => {
  document.querySelectorAll('.video-hover').forEach((video) => {
    video.addEventListener('mouseover', () => {
      video.play();
    });

    video.addEventListener('mouseout', () => {
      video.pause();
    });
  });
};

/* Change Value Dropdown
-------------------------------------------------------------------------*/
const changeValueDropdown = () => {
  document.querySelectorAll('.dropdown-menu .dropdown-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const value = item.dataset.value;
      const parent = item.closest('.dropdown');
      if (parent) {
        const button = parent.querySelector('.dropdown-toggle');
        if (button) {
          button.textContent = value;
        }
      }
    });
  });
};

/* Button Loading
-------------------------------------------------------------------------*/
const buttonLoading = () => {
  document.querySelectorAll('.btn-loading').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.add('loading');
      setTimeout(() => {
        btn.classList.remove('loading');
      }, 2000);
    });
  });
};

/* Item Checkbox
-------------------------------------------------------------------------*/
const itemCheckbox = () => {
  document.querySelectorAll('.item-checkbox').forEach((item) => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    checkbox.addEventListener('change', () => {
      item.classList.toggle('active', checkbox.checked);
    });
  });
};

/* Handle Footer
-------------------------------------------------------------------------*/
const handleFooter = () => {
  const footerAccordion = () => {
    const args = { duration: 250 };
    document.querySelectorAll('.footer-heading-mobile').forEach((heading) => {
      heading.addEventListener('click', function () {
        const parent = this.closest('.footer-col-block');
        const content = this.nextElementSibling;

        parent.classList.toggle('open');

        if (!parent.classList.contains('open')) {
          // Close accordion
          content.style.display = 'none';
        } else {
          // Open accordion
          content.style.display = 'block';
        }
      });
    });
  };

  const handleAccordion = () => {
    if (window.matchMedia('only screen and (max-width: 575px)').matches) {
      const headings = document.querySelectorAll('.footer-heading-mobile');
      if (!headings[0]?.hasAttribute('data-accordion-initialized')) {
        footerAccordion();
        headings.forEach((h) => h.setAttribute('data-accordion-initialized', 'true'));
      }
    } else {
      // Reset for desktop
      document.querySelectorAll('.footer-heading-mobile').forEach((heading) => {
        const parent = heading.closest('.footer-col-block');
        const content = heading.nextElementSibling;

        parent?.classList.remove('open');
        if (content) {
          content.style.display = '';
        }
        heading.removeAttribute('data-accordion-initialized');
      });
    }
  };

  handleAccordion();
  window.addEventListener('resize', handleAccordion);
};
/* Cookie Setting
-------------------------------------------------------------------------*/
const cookieSetting = () => {
  const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  };

  const detectUserCountry = () => {
    // Try to detect user country from IP or browser locale
    const userCountry = getCookie('user_country');
    if (!userCountry) {
      // Use browser locale as fallback
      const locale = navigator.language || navigator.userLanguage;
      const country = locale.split('-')[1] || locale.split('_')[1];
      if (country) {
        setCookie('user_country', country.toUpperCase(), 365);
      }
    }
  };

  const getCookie = (name) => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (cookieName.trim() === name) {
        return cookieValue;
      }
    }
    return null;
  };

  const checkCookie = () => {
    // Check if we're in the Shopify theme customizer
    const isThemeCustomizer = window.Shopify && window.Shopify.designMode;
    if (isThemeCustomizer) {
      return; // Don't show cookie banner in theme customizer
    }

    const cookieConsent = getCookie('cookie_consent');
    const cookieBanner = document.querySelector('.cookie-banner');

    if (!cookieConsent && cookieBanner) {
      // Check the banner setting from the section data
      const sectionId = cookieBanner.getAttribute('data-section-id');
      const bannerSetting = cookieBanner.getAttribute('data-show-banner');

      // Show banner based on setting
      let shouldShow = true;

      if (bannerSetting === 'targeted_regions') {
        // For targeted regions, check if user is in EU/EEA/UK/Switzerland
        // You can enhance this with more sophisticated geolocation
        const userCountry = getCookie('user_country');
        if (userCountry) {
          const euCountries = [
            'AT',
            'BE',
            'BG',
            'HR',
            'CY',
            'CZ',
            'DK',
            'EE',
            'FI',
            'FR',
            'DE',
            'GR',
            'HU',
            'IE',
            'IT',
            'LV',
            'LT',
            'LU',
            'MT',
            'NL',
            'PL',
            'PT',
            'RO',
            'SK',
            'SI',
            'ES',
            'SE',
          ];
          const eeaCountries = ['IS', 'LI', 'NO'];
          const otherCountries = ['GB', 'CH'];
          const allTargetedCountries = [...euCountries, ...eeaCountries, ...otherCountries];
          shouldShow = allTargetedCountries.includes(userCountry);
        } else {
          // If no country detected, show banner to be safe
          shouldShow = true;
        }
      } else if (bannerSetting === 'all_regions') {
        shouldShow = true;
      }

      if (shouldShow) {
        cookieBanner.classList.add('show');

        // Add event listener to the accept button
        const acceptButton = cookieBanner.querySelector('#accept-cookie');
        if (acceptButton) {
          acceptButton.addEventListener('click', () => {
            setCookie('cookie_consent', 'accepted', 30);
            cookieBanner.classList.remove('show');
            cookieBanner.classList.add('hidden');
          });
        }
      }
    }
  };

  // Theme customizer functionality
  if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:select', function (event) {
      // Check if the selected section is a cookies-popup section
      if (event.target.id && event.target.id.includes('__cookies-popup')) {
        // Get the cookie banner element and show it
        const cookieBanner = document.querySelector('.cookie-banner');
        if (cookieBanner) {
          cookieBanner.classList.add('show');
          cookieBanner.classList.remove('hidden');
        }
      } else {
        // Hide the cookie banner when other sections are selected
        const cookieBanner = document.querySelector('.cookie-banner');
        if (cookieBanner) {
          cookieBanner.classList.remove('show');
          cookieBanner.classList.add('hidden');
        }
      }
    });
  }

  detectUserCountry();
  checkCookie();
};

/* Preloader
-------------------------------------------------------------------------*/
const preloader = () => {
  window.addEventListener('load', () => {
    const loader = document.querySelector('.preloader');
    if (loader) {
      loader.classList.add('loaded');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 1000);
    }
  });
};

/* Go Top
-------------------------------------------------------------------------*/
const goTop = () => {
  const goTopBtn = document.querySelector('.go-top');
  const borderProgress = document.querySelector('.border-progress');
  if (!goTopBtn) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    const progressAngle = (scrollPercent / 100) * 360;

    if (borderProgress) {
      borderProgress.style.setProperty('--progress-angle', progressAngle + 'deg');
    }

    if (scrollTop > 100) {
      goTopBtn.classList.add('show');
    } else {
      goTopBtn.classList.remove('show');
    }
  });

  goTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
};

/* Check Click
-------------------------------------------------------------------------*/
const checkClick = () => {
  const checkItems = document.querySelectorAll('.flat-check-list .check-item');
  checkItems.forEach((item) => {
    item.addEventListener('click', () => {
      const list = item.closest('.flat-check-list');
      list.querySelectorAll('.check-item').forEach((i) => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
};

/* Swatch Color
-------------------------------------------------------------------------*/
const swatchColor = () => {
  const products = document.querySelectorAll('.card-product');
  if (products.length === 0) return;

  products.forEach((product) => {
    const swatches = product.querySelectorAll('.color-swatch');
    swatches.forEach((swatch) => {
      ['click', 'mouseover'].forEach((event) => {
        swatch.addEventListener(event, () => {
          const swatchImg = swatch.querySelector('img');
          const imgProduct = product.querySelector('.img-product');
          if (swatchImg && imgProduct) {
            imgProduct.src = swatchImg.src;
            product.querySelector('.color-swatch.active')?.classList.remove('active');
            swatch.classList.add('active');
          }
        });
      });
    });
  });
};

/* Sidebar Mobile
-------------------------------------------------------------------------*/
const sidebarMobile = () => {
  const sidebarContent = document.querySelector('.sidebar-content-wrap');
  const sidebarAppend = document.querySelector('.sidebar-mobile-append');
  if (sidebarContent && sidebarAppend) {
    sidebarAppend.innerHTML = sidebarContent.innerHTML;
  }
};

/* Stagger Wrap
-------------------------------------------------------------------------*/
const staggerWrap = () => {
  const staggerWrap = document.querySelector('.stagger-wrap');
  if (!staggerWrap) return;

  const items = staggerWrap.querySelectorAll('.stagger-item');
  items.forEach((item, index) => {
    const delay = (index + 1) * 0.2;
    item.style.transitionDelay = `${delay}s`;
    item.classList.add('stagger-finished');
  });
};

/* Click Modal Second
-------------------------------------------------------------------------*/
const clickModalSecond = () => {
  // Using event delegation to handle dynamically added buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-quickview, .quickview');
    if (!btn) return;

    e.preventDefault();

    // Safely parse JSON data with error handling
    let variants = [];
    let options = [];

    try {
      const variantsAttr = btn.getAttribute('data-product-variants');
      if (variantsAttr) {
        variants = JSON.parse(variantsAttr);
      }
    } catch (e) {
      console.warn('Failed to parse variants data:', e);
    }

    try {
      const optionsAttr = btn.getAttribute('data-product-options');
      if (optionsAttr) {
        options = JSON.parse(optionsAttr);
      }
    } catch (e) {
      console.warn('Failed to parse options data:', e);
    }

    const productData = {
      id: btn.getAttribute('data-product-id'),
      handle: btn.getAttribute('data-product-handle'),
      title: btn.getAttribute('data-product-title'),
      price: btn.getAttribute('data-product-price'),
      comparePrice: btn.getAttribute('data-product-compare-price'),
      description: btn.getAttribute('data-product-description'),
      url: btn.getAttribute('data-product-url'),
      images: btn.getAttribute('data-product-images') ? btn.getAttribute('data-product-images').split(',') : [],
      variants: variants,
      options: options,
    };

    const quickViewModal = new bootstrap.Modal(document.getElementById('quickView'));
    const modalElement = document.getElementById('quickView');
    const mediaWrap = document.querySelector('#quickView .tf-product-media-wrap');
    const infoWrap = document.querySelector('#quickView .tf-product-info-wrap');

    // Store product variants data in modal for variant selection
    modalElement.setAttribute('data-product-variants', JSON.stringify(productData.variants));

    // Generate HTML content from product data
    const { mediaHTML, infoHTML } = generateQuickviewContent(productData);
    mediaWrap.innerHTML = mediaHTML;
    infoWrap.innerHTML = infoHTML;

    quickViewModal.show();

    // Initialize swiper after content is loaded
    setTimeout(() => {
      const swiperContainer = document.querySelector('#quickView .tf-single-slide');
      let quickviewSwiper = null;

      if (swiperContainer && typeof Swiper !== 'undefined') {
        quickviewSwiper = new Swiper(swiperContainer, {
          slidesPerView: 1,
          spaceBetween: 0,
          navigation: {
            nextEl: '.single-slide-next',
            prevEl: '.single-slide-prev',
          },
          on: {
            slideChange: function () {
              // Update variant selection when swiper changes
              updateVariantFromSwiper(this.activeIndex);
            },
          },
        });

        // Store swiper instance in modal for access
        modalElement.setAttribute('data-swiper-instance', 'initialized');
      }

      // Reinitialize quantity buttons and variant picker
      buttonQuantity();
      variantPicker();

      // Reset quantity to 1 when modal opens
      const quantityInput = modalElement.querySelector('input[name="quantity"]');
      if (quantityInput) {
        quantityInput.value = 1;
      }

      // Initialize variant selection for quickview
      initializeQuickviewVariants();
    }, 100);
  });

  // Function to generate quickview content HTML
  const generateQuickviewContent = (product) => {
    const hasSale = product.comparePrice && product.comparePrice !== product.price;
    const hasVariants = product.options && product.options.length > 0;

    let imagesHTML = '';
    if (product.images && product.images.length > 0) {
      // Create a mapping of colors to variants for better matching
      const colorToVariantMap = {};
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant) => {
          const color = variant.option1 || variant.option2 || variant.option3 || '';
          if (color) {
            colorToVariantMap[color.toLowerCase()] = variant;
          }
        });
      }

      imagesHTML = product.images
        .map((image, index) => {
          // Try to determine which variant this image belongs to
          let variantId = '';
          let variantColor = '';

          // First, try to match by image position if we have enough variants
          if (product.variants && product.variants.length > index) {
            const variant = product.variants[index];
            variantId = variant.id;
            variantColor = variant.option1 || variant.option2 || variant.option3 || '';
          } else if (product.variants && product.variants.length > 0) {
            // If we don't have enough variants, use the first variant
            const variant = product.variants[0];
            variantId = variant.id;
            variantColor = variant.option1 || variant.option2 || variant.option3 || '';
          }

          return `
          <div class="swiper-slide" 
               data-variant-id="${variantId}"
               data-variant-color="${variantColor.toLowerCase().replace(/\s+/g, '-')}"
               data-color="${variantColor.toLowerCase().replace(/\s+/g, '-')}"
               data-image-index="${index}">
            <div class="item">
              <img class="lazyload" 
                   data-src="${image}"
                   src="${image}" 
                   alt="${product.title}"
                   width="600"
                   height="600">
            </div>
          </div>
        `;
        })
        .join('');
    }

    let variantsHTML = '';
    if (hasVariants) {
      const colorOption = product.options.find((option) => option.name === 'Color' || option.name === 'Colour');

      if (colorOption) {
        const colorValues = colorOption.values
          .map(
            (value, index) => `
          <div class="hover-tooltip color-btn${index === 0 ? ' active' : ''}" 
               data-color="${value.toLowerCase().replace(/\s+/g, '-')}">
            <span class="check-color bg-${value.toLowerCase().replace(/\s+/g, '-')}"></span>
            <span class="tooltip">${value}</span>
          </div>
        `
          )
          .join('');

        variantsHTML = `
          <div class="tf-product-info-variant">
            <div class="variant-picker-item variant-color">
              <div class="variant-picker-label">
                ${colorOption.name}:<span class="variant-picker-label-value value-currentColor">${
          colorOption.selected_value || colorOption.values[0]
        }</span>
              </div>
              <div class="variant-picker-values">
                ${colorValues}
              </div>
            </div>
          </div>
        `;
      }
    }

    const mediaHTML = `
      <div dir="ltr" class="swiper tf-single-slide">
        <div class="swiper-wrapper">
          ${imagesHTML}
        </div>
        <div class="swiper-button-prev nav-swiper arrow-1 nav-prev-cls single-slide-prev"></div>
        <div class="swiper-button-next nav-swiper arrow-1 nav-next-cls single-slide-next"></div>
      </div>
    `;

    const infoHTML = `
      <div class="tf-product-info-inner">
        <div class="tf-product-info-heading">
          <h6 class="product-info-name">${product.title}</h6>
          <div class="product-info-price">
            ${
              hasSale
                ? `
              <h6 class="price-new price-on-sale">${product.price}</h6>
              <h6 class="price-old">${product.comparePrice}</h6>
            `
                : `
              <h6 class="price-new">${product.price}</h6>
            `
            }
          </div>
          <p class="text">${product.description}</p>
        </div>
        
        ${variantsHTML}
        
        <div class="tf-product-total-quantity">
          <div class="group-btn">
            <div class="wg-quantity">
              <button type="button" class="btn-quantity minus-btn">-</button>
              <input class="quantity-product font-4" type="number" name="quantity" value="1" min="1">
              <button type="button" class="btn-quantity plus-btn">+</button>
            </div>
            <a href="#" 
               class="tf-btn hover-primary product-cart-button" 
               data-variant-id="${product.variants[0]?.id || ''}"
               data-product-id="${product.id}"
               data-selected-variant="${product.variants[0]?.id || ''}">
              ${window.ShopifyTranslations?.quickview?.add_to_cart}
            </a>
          </div>
          <a href="${product.url}" class="tf-btn w-100 animate-btn paypal btn-primary">${
      window.ShopifyTranslations?.quickview?.buy_it_now
    }</a>
          <a href="/cart" class="more-choose-payment link">${
            window.ShopifyTranslations?.quickview?.more_payment_options
          }</a>
        </div>
        <a href="${product.url}" class="view-details link">${
      window.ShopifyTranslations?.quickview?.view_full_details
    } <i class="icon icon-arrow-right"></i></a>
      </div>
    `;

    return { mediaHTML, infoHTML };
  };

  // Function to update variant selection when swiper changes
  const updateVariantFromSwiper = (activeIndex) => {
    const quickviewModal = document.getElementById('quickView');
    if (!quickviewModal) return;

    // Prevent recursive updates
    if (quickviewModal.getAttribute('data-updating-variant') === 'true') return;

    const swiperContainer = quickviewModal.querySelector('.tf-single-slide');
    if (!swiperContainer) return;

    const activeSlide = swiperContainer.querySelector(`.swiper-slide:nth-child(${activeIndex + 1})`);
    if (!activeSlide) return;

    const variantColor = activeSlide.getAttribute('data-variant-color');
    if (!variantColor) return;

    // Find the corresponding color button
    const colorButtons = quickviewModal.querySelectorAll('.color-btn');
    const matchingButton = Array.from(colorButtons).find((button) => {
      const buttonColor = button.getAttribute('data-color');
      return buttonColor === variantColor;
    });

    if (matchingButton) {
      // Remove active class from all buttons
      colorButtons.forEach((btn) => btn.classList.remove('active'));
      // Add active class to matching button
      matchingButton.classList.add('active');

      // Update the selected color label
      const colorLabel = quickviewModal.querySelector('.value-currentColor');
      const tooltip = matchingButton.querySelector('.tooltip');
      if (colorLabel && tooltip) {
        colorLabel.textContent = tooltip.textContent;
      }

      // Update cart button with selected variant
      const productData = JSON.parse(quickviewModal.getAttribute('data-product-variants') || '[]');
      const selectedVariant = productData.find((variant) => {
        return (
          variant.option1 === tooltip.textContent ||
          variant.option2 === tooltip.textContent ||
          variant.option3 === tooltip.textContent
        );
      });

      const cartButton = quickviewModal.querySelector('.product-cart-button');
      if (cartButton && selectedVariant) {
        cartButton.setAttribute('data-variant-id', selectedVariant.id);
        cartButton.setAttribute('data-selected-variant', selectedVariant.id);
      }
    } else {
      // If no exact match found, try to find the closest match or use the first variant
      const productData = JSON.parse(quickviewModal.getAttribute('data-product-variants') || '[]');
      if (productData.length > 0) {
        const firstVariant = productData[0];
        const firstColorButton = colorButtons[0];

        if (firstColorButton) {
          // Remove active class from all buttons
          colorButtons.forEach((btn) => btn.classList.remove('active'));
          // Add active class to first button
          firstColorButton.classList.add('active');

          // Update the selected color label
          const colorLabel = quickviewModal.querySelector('.value-currentColor');
          const tooltip = firstColorButton.querySelector('.tooltip');
          if (colorLabel && tooltip) {
            colorLabel.textContent = tooltip.textContent;
          }

          // Update cart button with first variant
          const cartButton = quickviewModal.querySelector('.product-cart-button');
          if (cartButton) {
            cartButton.setAttribute('data-variant-id', firstVariant.id);
            cartButton.setAttribute('data-selected-variant', firstVariant.id);
          }
        }
      }

      // Clear the flag after a short delay
      setTimeout(() => {
        quickviewModal.removeAttribute('data-updating-variant');
      }, 100);
    }
  };

  // Function to update swiper when variant is selected
  const updateSwiperFromVariant = (selectedColor) => {
    const quickviewModal = document.getElementById('quickView');
    if (!quickviewModal) return;

    // Set flag to prevent recursive updates
    quickviewModal.setAttribute('data-updating-variant', 'true');

    const swiperContainer = quickviewModal.querySelector('.tf-single-slide');
    if (!swiperContainer) return;

    // Find the slide that corresponds to this color
    const slides = swiperContainer.querySelectorAll('.swiper-slide');
    const normalizedColor = selectedColor.toLowerCase().replace(/\s+/g, '-');

    const targetSlideIndex = Array.from(slides).findIndex((slide) => {
      const slideColor = slide.getAttribute('data-variant-color');
      return slideColor === normalizedColor;
    });

    if (targetSlideIndex !== -1) {
      // Get the swiper instance and slide to the target slide
      const swiperInstance = swiperContainer.swiper;
      if (swiperInstance && swiperInstance.slideTo) {
        swiperInstance.slideTo(targetSlideIndex);
      }
    } else {
      // If no exact match found, try to find a slide with similar color or use the first slide
      const fallbackIndex = Array.from(slides).findIndex((slide) => {
        const slideColor = slide.getAttribute('data-variant-color');
        // Try to find a slide that contains the color name
        return slideColor && slideColor.includes(normalizedColor.split('-')[0]);
      });

      if (fallbackIndex !== -1) {
        const swiperInstance = swiperContainer.swiper;
        if (swiperInstance && swiperInstance.slideTo) {
          swiperInstance.slideTo(fallbackIndex);
        }
      } else if (slides.length > 0) {
        // If still no match, go to the first slide
        const swiperInstance = swiperContainer.swiper;
        if (swiperInstance && swiperInstance.slideTo) {
          swiperInstance.slideTo(0);
        }
      }
    }

    // Clear the flag after a short delay
    setTimeout(() => {
      quickviewModal.removeAttribute('data-updating-variant');
    }, 100);
  };

  // Function to handle variant selection in quickview
  const initializeQuickviewVariants = () => {
    const quickviewModal = document.getElementById('quickView');
    if (!quickviewModal) return;

    const colorButtons = quickviewModal.querySelectorAll('.color-btn');
    const cartButton = quickviewModal.querySelector('.product-cart-button');
    const productData = JSON.parse(quickviewModal.getAttribute('data-product-variants') || '[]');

    colorButtons.forEach((button) => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        colorButtons.forEach((btn) => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        // Update the selected color label
        const colorValue = button.getAttribute('data-color');
        const colorLabel = quickviewModal.querySelector('.value-currentColor');
        const tooltip = button.querySelector('.tooltip');
        if (colorLabel && tooltip) {
          colorLabel.textContent = tooltip.textContent;
        }

        // Find the corresponding variant
        const selectedVariant = productData.find((variant) => {
          // Check if variant has the selected color option
          return (
            variant.option1 === tooltip.textContent ||
            variant.option2 === tooltip.textContent ||
            variant.option3 === tooltip.textContent
          );
        });

        // Update cart button with selected variant
        if (cartButton && selectedVariant) {
          cartButton.setAttribute('data-variant-id', selectedVariant.id);
          cartButton.setAttribute('data-selected-variant', selectedVariant.id);
        }

        // Update swiper to show corresponding image for this variant
        // Add a small delay to prevent conflicts with swiper's own slideChange event
        setTimeout(() => {
          updateSwiperFromVariant(tooltip.textContent);
        }, 50);
      });
    });
  };

  document.querySelectorAll('.btn-addtocart').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Check cart type setting
      const cartType = window.themeSettings?.cartType || 'drawer';

      if (cartType === 'drawer') {
        const cartModal = new bootstrap.Modal(document.getElementById('shoppingCart'));
        cartModal.show();
      } else if (cartType === 'cart-page') {
        window.location = window.routes?.cart_url || '/cart';
      } else if (cartType === 'checkout-page') {
        window.location = `${window.routes?.checkout_url || '/checkout'}`;
      }
      // For 'none' type, do nothing
    });
  });

  document.querySelectorAll('.btn-add-gift').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('.add-gift')?.classList.add('open');
    });
  });

  document.querySelectorAll('.btn-add-note').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('.add-note')?.classList.add('open');
    });
  });

  document.querySelectorAll('.btn-coupon').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('.coupon')?.classList.add('open');
    });
  });

  document.querySelectorAll('.btn-estimate-shipping').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('.estimate-shipping')?.classList.add('open');
    });
  });

  document.querySelectorAll('.tf-mini-cart-tool-close').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf-mini-cart-tool-openable').forEach((tool) => {
        tool.classList.remove('open');
      });
    });
  });
};

/* Estimate Shipping
-------------------------------------------------------------------------*/
const estimateShipping = () => {
  const shippingForm = document.querySelector('.estimate-shipping');
  if (!shippingForm) return;

  const countrySelect = document.getElementById('shipping-country-form');
  const provinceSelect = document.getElementById('shipping-province-form');
  const zipcodeInput = document.getElementById('zipcode');
  const zipcodeMessage = document.getElementById('zipcode-message');
  const zipcodeSuccess = document.getElementById('zipcode-success');

  const updateProvinces = () => {
    if (!countrySelect || !provinceSelect) return;

    const selectedOption = countrySelect.options[countrySelect.selectedIndex];
    const provincesData = selectedOption.getAttribute('data-provinces');
    const provinces = JSON.parse(provincesData || '[]');

    provinceSelect.innerHTML = '';

    if (provinces.length === 0) {
      const option = document.createElement('option');
      option.textContent = '------';
      provinceSelect.appendChild(option);
    } else {
      provinces.forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        provinceSelect.appendChild(option);
      });
    }
  };

  const validateZipcode = (zipcode, country) => {
    const patterns = {
      Australia: /^\d{4}$/,
      Austria: /^\d{4}$/,
      Belgium: /^\d{4}$/,
      Canada: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      'Czech Republic': /^\d{5}$/,
      Denmark: /^\d{4}$/,
      Finland: /^\d{5}$/,
      France: /^\d{5}$/,
      Germany: /^\d{5}$/,
      'United States': /^\d{5}(-\d{4})?$/,
      'United Kingdom': /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/,
      India: /^\d{6}$/,
      Japan: /^\d{3}-\d{4}$/,
      Mexico: /^\d{5}$/,
      'South Korea': /^\d{5}$/,
      Spain: /^\d{5}$/,
      Italy: /^\d{5}$/,
      Vietnam: /^\d{6}$/,
    };

    return patterns[country] ? patterns[country].test(zipcode) : true;
  };

  countrySelect?.addEventListener('change', updateProvinces);

  document.getElementById('shipping-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const zipcode = zipcodeInput?.value.trim();
    const country = countrySelect?.value;

    if (zipcode && country && !validateZipcode(zipcode, country)) {
      zipcodeMessage.style.display = 'block';
      zipcodeSuccess.style.display = 'none';
    } else {
      zipcodeMessage.style.display = 'none';
      zipcodeSuccess.style.display = 'block';
    }
  });

  // Initialize provinces on load
  updateProvinces();
};

/* Header Sticky
-------------------------------------------------------------------------*/
const headerSticky = () => {
  let lastScrollTop = 0;
  const delta = 5;
  let didScroll = false;
  const header = document.querySelector('#header');
  if (!header) return;

  const headerHeight = header.offsetHeight;
  const stickyType = header.dataset.stickyType;

  // If sticky type is none, don't set up scroll handling
  if (stickyType === 'none') return;

  // Handle scroll events for on_scroll_up type
  window.addEventListener('scroll', () => {
    didScroll = true;
  });

  setInterval(() => {
    if (didScroll) {
      const st = window.pageYOffset || document.documentElement.scrollTop;

      if (Math.abs(lastScrollTop - st) <= delta) return;

      if (st < headerHeight) {
        header.classList.remove('header-visible', 'header-hidden');
        header.style.position = '';
        header.style.top = '';
        document.body.style.paddingTop = '';
      } else if (st > lastScrollTop) {
        // Scrolling down
        header.classList.remove('header-visible');
        header.classList.add('header-hidden');
        header.style.position = 'fixed';
        header.style.top = `-${headerHeight}px`;
        header.style.width = '100%';
        document.body.style.paddingTop = `${headerHeight}px`;
      } else {
        // Scrolling up
        header.classList.remove('header-hidden');
        header.classList.add('header-visible');
        header.style.position = 'fixed';
        header.style.top = '0';
        header.style.width = '100%';
        document.body.style.paddingTop = `${headerHeight}px`;
      }

      lastScrollTop = st;
      didScroll = false;
    }
  }, 250);
};

/* Newsletter Popup
-------------------------------------------------------------------------*/
const newsletterPopup = () => {
  const popup = document.querySelector('.newsletter-popup');
  if (!popup) return;

  // Get popup settings from data attributes
  const popupTrigger = popup.dataset.popupTrigger || 'time';
  const popupDelay = parseInt(popup.dataset.popupDelay) || 3;
  const scrollThreshold = parseInt(popup.dataset.scrollThreshold) || 300;
  const daysNextShow = parseInt(popup.dataset.daysNextShow) || 7;

  const pageKey = 'showPopup_' + window.location.pathname;
  const showPopup = sessionStorage.getItem(pageKey);
  const globalPopupKey = 'newsletterPopupHidden';

  // Check if user has globally hidden the popup
  const globalHidden = localStorage.getItem(globalPopupKey);
  if (globalHidden === 'true') return;

  // Check if we're in theme customization mode
  const isThemeCustomizer = window.Shopify && window.Shopify.designMode;
  if (isThemeCustomizer) return;

  // Check if enough days have passed since last close
  const lastCloseDate = localStorage.getItem('newsletterPopupLastClose');
  if (lastCloseDate) {
    const daysSinceClose = (Date.now() - new Date(lastCloseDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceClose < daysNextShow) return;
  }

  // Only show popup on first visit to the page
  if (!JSON.parse(showPopup)) {
    if (popupTrigger === 'time') {
      // Show popup after specified delay
      setTimeout(() => {
        const modal = new bootstrap.Modal(popup);
        modal.show();
      }, popupDelay * 1000);
    } else if (popupTrigger === 'scroll') {
      // Show popup after user scrolls specified pixels
      let hasShown = false;
      const handleScroll = () => {
        if (hasShown) return;
        if (window.scrollY >= scrollThreshold) {
          hasShown = true;
          const modal = new bootstrap.Modal(popup);
          modal.show();
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll);
    }
  }

  // Handle close button
  document.querySelector('.btn-hide-popup')?.addEventListener('click', () => {
    // Store the close date for "days until next show" functionality
    localStorage.setItem('newsletterPopupLastClose', new Date().toISOString());
    sessionStorage.setItem(pageKey, true);
  });

  // Handle form submission
  const form = popup.querySelector('.form-newsletter');
  if (form) {
    const emailInput = form.querySelector('input[name="contact[email]"]');
    const submitButton = form.querySelector('.subscribe-button');

    // Email validation function
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    // Real-time validation
    if (emailInput && submitButton) {
      emailInput.addEventListener('input', function () {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
          this.style.borderColor = '#dc3545';
          submitButton.disabled = true;
          submitButton.style.opacity = '0.6';
        } else {
          this.style.borderColor = '';
          submitButton.disabled = false;
          submitButton.style.opacity = '1';
        }
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const email = formData.get('contact[email]');

      // Enhanced validation
      if (!email || !email.trim()) {
        alert('Please enter your email address.');
        emailInput?.focus();
        return;
      }

      if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        emailInput?.focus();
        return;
      }

      // If validation passes, show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Subscribing...';
      }

      // Show success message and hide form
      const successMessage = popup.querySelector('.newsletter-success-message');
      if (successMessage) {
        successMessage.style.display = 'block';
        form.style.display = 'none';

        // Hide popup after 3 seconds
        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(popup);
          if (modal) {
            modal.hide();
          }
        }, 3000);
      }

      // Store the close date for "days until next show" functionality
      localStorage.setItem('newsletterPopupLastClose', new Date().toISOString());
    });
  }

  // Handle modal hidden event (when popup is closed by any means)
  popup.addEventListener('hidden.bs.modal', () => {
    // Store the close date for "days until next show" functionality
    localStorage.setItem('newsletterPopupLastClose', new Date().toISOString());
  });
};

// Theme customizer functionality
if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener('shopify:section:select', function (event) {
    // Check if the selected section is a newsletter-popup section
    if (event.target.id && event.target.id.includes('__newsletter-popup')) {
      // Get the newsletter popup element and show it
      const newsletterPopup = document.querySelector('.newsletter-popup');
      if (newsletterPopup) {
        const modal = new bootstrap.Modal(newsletterPopup);
        modal.show();
      }
    } else {
      // Hide the newsletter popup when other sections are selected
      const newsletterPopup = document.querySelector('.newsletter-popup');
      if (newsletterPopup) {
        const modal = bootstrap.Modal.getInstance(newsletterPopup);
        if (modal) {
          modal.hide();
        }
      }
    }
  });
}

const exitPopup = () => {
  const popup = document.querySelector('.exit-popup');
  if (!popup) return;

  // Get popup settings from data attributes
  const popupTrigger = popup.dataset.popupTrigger || 'mouseleave';
  const popupDelay = parseInt(popup.dataset.popupDelay) || 0;
  const daysNextShow = parseInt(popup.dataset.daysNextShow) || 1;

  const pageKey = 'showExitPopup_' + window.location.pathname;
  const showPopup = sessionStorage.getItem(pageKey);
  const globalPopupKey = 'exitPopupHidden';

  // Check if user has globally hidden the popup
  const globalHidden = localStorage.getItem(globalPopupKey);
  if (globalHidden === 'true') return;

  // Check if we're in theme customization mode
  const isThemeCustomizer = window.Shopify && window.Shopify.designMode;
  if (isThemeCustomizer) return;

  // Check if enough days have passed since last close (for all trigger types)
  const lastCloseDate = localStorage.getItem('exitPopupLastClose');
  if (lastCloseDate) {
    const daysSinceClose = (Date.now() - new Date(lastCloseDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceClose < daysNextShow) return;
  }

  // Only show popup on first visit to the page
  if (!JSON.parse(showPopup)) {
    if (popupTrigger === 'time') {
      // Show popup after specified delay
      setTimeout(() => {
        const modal = new bootstrap.Modal(popup);
        modal.show();
      }, popupDelay * 1000);
    } else if (popupTrigger === 'mouseleave') {
      // Show popup when user moves mouse to close tab/window
      let hasShown = false;
      const handleMouseLeave = (e) => {
        if (hasShown) return;
        if (e.clientY <= 0) {
          hasShown = true;
          const modal = new bootstrap.Modal(popup);
          modal.show();
          document.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);
    } else if (popupTrigger === 'scroll') {
      // Show popup after user scrolls specified percentage
      let hasShown = false;
      const scrollThreshold = parseInt(popup.dataset.scrollThreshold) || 80;
      const handleScroll = () => {
        if (hasShown) return;
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent >= scrollThreshold) {
          hasShown = true;
          const modal = new bootstrap.Modal(popup);
          modal.show();
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll);
    }
  }

  // Handle close button
  document.querySelector('.btn-hide-popup')?.addEventListener('click', () => {
    // Store the close date for "days until next show" functionality
    localStorage.setItem('exitPopupLastClose', new Date().toISOString());
    sessionStorage.setItem(pageKey, true);
  });

  // Handle modal hidden event (when popup is closed by any means)
  popup.addEventListener('hidden.bs.modal', () => {
    // Store the close date for "days until next show" functionality
    localStorage.setItem('exitPopupLastClose', new Date().toISOString());
  });
};

// Theme customizer functionality for exit popup
if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener('shopify:section:select', function (event) {
    // Check if the selected section is an exit-popup section
    if (event.target.id && event.target.id.includes('__exit-popup')) {
      // Get the exit popup element and show it
      const exitPopupElement = document.querySelector('.exit-popup');
      if (exitPopupElement) {
        const modal = new bootstrap.Modal(exitPopupElement);
        modal.show();
      }
    } else {
      // Hide the exit popup when other sections are selected
      const exitPopupElement = document.querySelector('.exit-popup');
      if (exitPopupElement) {
        const modal = bootstrap.Modal.getInstance(exitPopupElement);
        if (modal) {
          modal.hide();
        }
      }
    }
  });
}

/* Parallax Effects
-------------------------------------------------------------------------*/
const efectParalax = () => {
  const parallaxElements = document.querySelectorAll('.effect-paralax');
  if (parallaxElements.length === 0) return;

  parallaxElements.forEach((element) => {
    new SimpleParallax(element, {
      delay: 0.5,
      orientation: 'up',
      scale: 1.3,
      transition: 'cubic-bezier(0.2, 0.8, 1, 1)',
    });
  });
};

/* Handle Sidebar Filter
-------------------------------------------------------------------------*/
const handleSidebarFilter = () => {
  // Filter shop button click handlers
  document.querySelectorAll('#filterShop, .sidebar-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 1200) {
        document.querySelector('.sidebar-filter')?.classList.add('show');
        document.querySelector('.overlay-filter')?.classList.add('show');
      }
    });
  });

  // Close filter handlers
  document.querySelectorAll('.close-filter, .overlay-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('.sidebar-filter')?.classList.remove('show');
      document.querySelector('.overlay-filter')?.classList.remove('show');
    });
  });
};

/* Bottom Sticky
-------------------------------------------------------------------------*/
const bottomSticky = () => {
  window.addEventListener('scroll', () => {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const stickyButton = document.querySelector('.tf-sticky-btn-atc');

    if (stickyButton) {
      if (scrollPosition >= 500) {
        stickyButton.classList.add('show');
      } else {
        stickyButton.classList.remove('show');
      }
    }
  });
};

/* Wish List
-------------------------------------------------------------------------*/
const wishList = () => {
  // Handle standalone wishlist buttons
  document.querySelectorAll('.btn-add-wishlist').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('added-wishlist');
    });
  });

  // Handle product card wishlist buttons
  document.querySelectorAll('.card-product .wishlist').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('addwishlist');

      const icon = btn.querySelector('.icon');
      const tooltip = btn.querySelector('.tooltip');

      if (btn.classList.contains('addwishlist')) {
        icon?.classList.remove('icon-heart2');
        icon?.classList.add('icon-trash');
        if (tooltip) tooltip.textContent = 'Remove Wishlist';
      } else {
        icon?.classList.remove('icon-trash');
        icon?.classList.add('icon-heart2');
        if (tooltip) tooltip.textContent = 'Add to Wishlist';
      }
    });
  });
};

/* Copy Text
-------------------------------------------------------------------------*/
const copyText = () => {
  const copyBtn = document.getElementById('btn-coppy-text');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const text = document.getElementById('coppyText');
    if (!text) return;

    try {
      // Use modern Clipboard API
      await navigator.clipboard.writeText(text.innerText);

      // Show success feedback
      const originalText = copyBtn.textContent || copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="icon-check"></i> Copied!';
      copyBtn.style.pointerEvents = 'none'; // Prevent multiple clicks

      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.pointerEvents = 'auto'; // Re-enable clicks
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text.innerText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        // Show success feedback
        const originalText = copyBtn.textContent || copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="icon-check"></i> Copied!';
        copyBtn.style.pointerEvents = 'none'; // Prevent multiple clicks

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.pointerEvents = 'auto'; // Re-enable clicks
        }, 2000);
      } catch (fallbackErr) {
        alert('Failed to copy text. Please copy manually: ' + text.innerText);
      }
    }
  });
};

/* Tab Slide
-------------------------------------------------------------------------*/
const tabSlide = () => {
  const tabSlides = document.querySelectorAll('.tab-slide');
  if (tabSlides.length === 0) return;

  const updateTabSlide = () => {
    tabSlides.forEach((tabSlide) => {
      const activeTab = tabSlide.querySelector('li.active');
      if (!activeTab) return;

      const width = activeTab.offsetWidth;
      const left = activeTab.offsetLeft;
      const sideEffect = tabSlide.querySelector('.item-slide-effect');

      if (sideEffect) {
        sideEffect.style.width = `${width}px`;
        sideEffect.style.transform = `translateX(${left}px)`;
      }
    });
  };

  // Handle tab clicks
  tabSlides.forEach((tabSlide) => {
    const tabs = tabSlide.querySelectorAll('li');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach((t) => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');

        const width = tab.offsetWidth;
        const left = tab.offsetLeft;
        const sideEffect = tabSlide.querySelector('.item-slide-effect');

        if (sideEffect) {
          sideEffect.style.width = `${width}px`;
          sideEffect.style.transform = `translateX(${left}px)`;
        }
      });
    });
  });

  // Update on window resize
  window.addEventListener('resize', updateTabSlide);

  // Initial update
  updateTabSlide();
};

/* Click Control
-------------------------------------------------------------------------*/
const clickControl = () => {
  // Add Address
  document.querySelectorAll('.btn-add-address').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('.show-form-address')?.classList.toggle('show');
    });
  });

  document.querySelectorAll('.btn-hide-address').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('.show-form-address')?.classList.remove('show');
    });
  });

  // Delete Address
  document.querySelectorAll('.btn-delete-address').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.account-address-item');
      item?.remove();

      if (item?.classList.contains('editing')) {
        const editForm = document.querySelector('.edit-form-address');
        editForm?.classList.toggle('show');
      }
    });
  });

  // Edit Address
  document.querySelectorAll('.btn-edit-address').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.account-address-item');
      const editForm = document.querySelector('.edit-form-address');

      if (editForm?.classList.contains('show')) {
        if (item?.classList.contains('editing')) {
          editForm.classList.toggle('show');
          item.classList.remove('editing');
        } else {
          document.querySelectorAll('.account-address-item').forEach((addr) => {
            addr.classList.remove('editing');
          });
          item?.classList.add('editing');
        }
      } else {
        editForm?.classList.toggle('show');
        item?.classList.toggle('editing');
      }
    });
  });

  document.querySelectorAll('.btn-hide-edit-address').forEach((btn) => {
    btn.addEventListener('click', () => {
      const editForm = document.querySelector('.edit-form-address');
      editForm?.classList.remove('show');
      document.querySelectorAll('.account-address-item').forEach((item) => {
        item.classList.remove('editing');
      });
    });
  });
};

/* Delete Item
----------------------------------------------------------------------------*/
const deleteItem = () => {
  document.querySelectorAll('.remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.closest('.file-delete')?.remove();
    });
  });

  document.querySelectorAll('.clear-file-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn
        .closest('.list-file-delete')
        ?.querySelectorAll('.file-delete')
        .forEach((item) => {
          item.remove();
        });
    });
  });
};

/* Button Quantity
----------------------------------------------------------------------------*/
const buttonQuantity = () => {
  document.querySelectorAll('.minus-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = btn.closest('div').querySelector('input');
      let value = parseInt(input.value, 10);

      if (value > 1) {
        value = value - 1;
      }
      input.value = value;
    });
  });

  // Add input validation for quantity inputs
  document.querySelectorAll('input[name="quantity"]').forEach((input) => {
    input.addEventListener('change', (e) => {
      let value = parseInt(e.target.value, 10);
      if (isNaN(value) || value < 1) {
        value = 1;
      }
      e.target.value = value;
    });
  });

  document.querySelectorAll('.plus-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = btn.closest('div').querySelector('input');
      let value = parseInt(input.value, 10);

      if (value >= 1) {
        value = value + 1;
      }
      input.value = value;
    });
  });
};

/* Infinite Slide
----------------------------------------------------------------------------*/
const infiniteSlide = () => {
  const slides = document.querySelectorAll('.infiniteslide');
  if (slides.length === 0) return;

  slides.forEach((slide) => {
    const style = slide.dataset.style || 'left';
    const clone = parseInt(slide.dataset.clone) || 2;
    const speed = parseInt(slide.dataset.speed) || 100;

    // Create a wrapper for the infinite slide
    const wrapper = document.createElement('div');
    wrapper.style.overflow = 'hidden';
    wrapper.style.position = 'relative';
    slide.parentNode.insertBefore(wrapper, slide);
    wrapper.appendChild(slide);

    // Clone the items
    const items = Array.from(slide.children);
    for (let i = 0; i < clone; i++) {
      items.forEach((item) => {
        const clonedItem = item.cloneNode(true);
        slide.appendChild(clonedItem);
      });
    }

    // Set up animation
    let position = 0;
    const totalWidth = slide.scrollWidth;
    const animate = () => {
      if (style === 'left') {
        position -= 1;
        if (Math.abs(position) >= totalWidth / (clone + 1)) {
          position = 0;
        }
        slide.style.transform = `translateX(${position}px)`;
      } else if (style === 'right') {
        position += 1;
        if (position >= totalWidth / (clone + 1)) {
          position = 0;
        }
        slide.style.transform = `translateX(${position}px)`;
      }
      requestAnimationFrame(animate);
    };

    // Start animation
    slide.style.display = 'flex';
    animate();
  });
};

/* Predictive Search
----------------------------------------------------------------------------*/
const predictiveSearch = () => {
  // Check if predictive search is enabled
  const predictiveSearchEnabled = document.querySelector('meta[name="predictive-search-enabled"]')?.content !== 'false';
  if (!predictiveSearchEnabled) return;

  const searchInput = document.querySelector('.form-search input[name="q"]');
  const searchForm = document.querySelector('.form-search');

  if (!searchInput || !searchForm) return;

  // Create search results container (but don't insert yet)
  const searchResults = document.createElement('div');
  searchResults.className = 'search-suggests-results';
  searchResults.id = 'search-results';
  searchResults.style.display = 'none';

  // Create inner container
  const searchResultsInner = document.createElement('div');
  searchResultsInner.className = 'search-suggests-results-inner';

  // Create suggestions list
  const searchSuggestions = document.createElement('ul');
  searchSuggestions.id = 'search-suggestions';

  // Assemble the structure
  searchResultsInner.appendChild(searchSuggestions);
  searchResults.appendChild(searchResultsInner);

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Search state
  let isSearching = false;

  // Format price function
  const formatPrice = (price, comparePrice) => {
    const priceNum = parseFloat(price);
    const comparePriceNum = comparePrice ? parseFloat(comparePrice) : 0;

    if (comparePriceNum && comparePriceNum > priceNum) {
      return `
        <span class="new-price">$${priceNum.toFixed(2)}</span>
        <span class="old-price">$${comparePriceNum.toFixed(2)}</span>
      `;
    }
    return `<span class="price">$${priceNum.toFixed(2)}</span>`;
  };

  // Create search result item
  const createSearchResultItem = (product) => {
    const imageUrl = product.featured_image?.url || product.image || '';
    const imageAlt =
      product.featured_image?.alt ||
      product.title ||
      window.ShopifyTranslations?.search?.product_image ||
      'Product image';

    if (!imageUrl) return '';

    // Check if prices should be shown
    const showPrices = document.querySelector('meta[name="predictive-search-show-price"]')?.content !== 'false';

    return `
      <li>
        <a class="search-result-item" href="${product.url}">
          <div class="img-box">
            <img src="${imageUrl}" alt="${imageAlt}">
          </div>
          <div class="box-content">
            <p class="title link">${product.title}</p>
            ${
              showPrices
                ? `<div class="price">
              ${formatPrice(product.price, product.compare_at_price_max || product.compare_at_price_min)}
            </div>`
                : ''
            }
          </div>
        </a>
      </li>
    `;
  };

  // Perform search
  const performSearch = async (query) => {
    if (!query || query.length < 2) {
      if (searchResults.parentNode) {
        searchResults.style.display = 'none';
      }
      return;
    }
    if (isSearching) return;
    isSearching = true;

    // Insert container into DOM if not already there
    if (!searchResults.parentNode) {
      searchForm.parentNode.insertBefore(searchResults, searchForm.nextSibling);
    }

    try {
      searchSuggestions.innerHTML = `<li class="search-loading">${
        window.ShopifyTranslations?.search?.searching || 'Searching...'
      }</li>`;
      searchResults.style.display = 'block';
      const response = await fetch(
        `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6`
      );
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      const data = await response.json();
      const products = data.resources?.results?.products || [];
      if (products.length === 0) {
        searchSuggestions.innerHTML = `<li class="no-results">${
          window.ShopifyTranslations?.search?.no_products_found || 'No products found'
        }</li>`;
      } else {
        const resultsHTML = products
          .map((product) => createSearchResultItem(product))
          .filter((html) => html)
          .join('');
        searchSuggestions.innerHTML =
          resultsHTML ||
          `<li class="no-results">${window.ShopifyTranslations?.search?.no_products_found || 'No products found'}</li>`;
      }
    } catch (error) {
      console.error('Search error:', error);
      searchSuggestions.innerHTML = `<li class="search-error">${
        window.ShopifyTranslations?.search?.search_failed || 'Search failed. Please try again.'
      }</li>`;
    } finally {
      isSearching = false;
    }
  };

  // Debounced search
  const debouncedSearch = debounce(performSearch, 300);

  // Event listeners
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    // Hide static suggestion products when user types
    const staticSuggestions = document.querySelector('.search-suggests-results:not(#search-results)');
    if (staticSuggestions) {
      staticSuggestions.style.display = query.length > 0 ? 'none' : 'block';
    }

    if (query.length >= 2) {
      debouncedSearch(query);
    } else {
      // Hide search results when query is too short
      if (searchResults.parentNode) {
        searchResults.style.display = 'none';
      }
    }
  });

  // Handle form submission
  searchForm.addEventListener('submit', (e) => {
    const query = searchInput.value.trim();
    if (!query) {
      e.preventDefault();
    }
  });

  // Show static suggestions when input is cleared
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      const query = searchInput.value.trim();
      const staticSuggestions = document.querySelector('.search-suggests-results:not(#search-results)');
      if (staticSuggestions && query.length === 0) {
        staticSuggestions.style.display = 'block';
      }
    }, 150);
  });
};
