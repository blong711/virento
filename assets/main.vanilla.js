/**
 * Modern Vanilla JavaScript implementation
 * Replacing jQuery dependencies with native JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  selectImages();
  variantPicker();
  customDropdown();
  checkClick();
  swatchColor();
  sidebarMobile();
  staggerWrap();
  clickModalSecond();
  estimateShipping();
  headerSticky();
  autoPopup();
  handleProgressBar();
  totalPriceVariant();
  scrollGridProduct();
  hoverVideo();
  changeValueDropdown();
  buttonLoading();
  itemCheckbox();
  handleFooter();
  parallaxEffect();
  infiniteSlide();
  buttonQuantity();
  deleteItem();
  clickControl();
  tabSlide();
  copyText();
  wishList();
  bottomSticky();
  handleSidebarFilter();
  cookieSetting();
  preloader();
  goTop();
});

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
        
        optionElement.innerHTML = `
          <div class="custom-select-option-content">
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
        document.querySelectorAll('.custom-select-container.open').forEach(openSelect => {
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
        this.optionsContainer.querySelectorAll('.custom-select-option').forEach(opt => {
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
  imageSelects.forEach(select => {
    if (!select.customSelectInitialized) {
      new CustomSelect(select);
      select.customSelectInitialized = true;
    }
  });

  // Watch for changes to reinitialize
  const observer = new MutationObserver(() => {
    const newSelects = document.querySelectorAll('.image-select');
    newSelects.forEach(select => {
      if (!select.customSelectInitialized) {
        new CustomSelect(select);
        select.customSelectInitialized = true;
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

/* Variant Picker
---------------------------------------------------------------------------*/
const variantPicker = () => {
  const variantPickers = document.querySelectorAll('.variant-picker-item');
  if (variantPickers.length === 0) return;

  // Color variant
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = btn.dataset.scroll;
      document.querySelectorAll('.value-currentColor').forEach(el => {
        el.textContent = value;
      });

      // Remove active class from all buttons in the same group
      const parentValues = btn.closest('.variant-picker-values');
      if (parentValues) {
        parentValues.querySelectorAll('.color-btn').forEach(b => {
          b.classList.remove('active');
        });
      }
      btn.classList.add('active');
    });
  });

  // Size variant
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = btn.dataset.size;
      document.querySelectorAll('.value-currentSize').forEach(el => {
        el.textContent = value;
      });

      const parentValues = btn.closest('.variant-picker-values');
      if (parentValues) {
        parentValues.querySelectorAll('.size-btn').forEach(b => {
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
    
    dropdowns.forEach(dropdown => {
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
    totalPriceElements.forEach(el => {
      el.textContent = price;
    });
  };

  document.querySelectorAll('.variant-price').forEach(variant => {
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

  document.querySelectorAll('.grid-product').forEach(grid => {
    const scrollContainer = grid.querySelector('.grid-product-content');
    if (!scrollContainer) return;

    let isScrolling = false;
    let startPosition = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    scrollContainer.addEventListener('mousedown', (e) => {
      isScrolling = true;
      scrollContainer.classList.add('active');
      startPosition = isHorizontalMode() ? 
        e.pageX - scrollContainer.offsetLeft :
        e.pageY - scrollContainer.offsetTop;
      scrollLeft = scrollContainer.scrollLeft;
      scrollTop = scrollContainer.scrollTop;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isScrolling) return;
      e.preventDefault();
      
      const position = isHorizontalMode() ?
        e.pageX - scrollContainer.offsetLeft :
        e.pageY - scrollContainer.offsetTop;
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
  document.querySelectorAll('.video-hover').forEach(video => {
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
  document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(item => {
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
  document.querySelectorAll('.btn-loading').forEach(btn => {
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
  document.querySelectorAll('.item-checkbox').forEach(item => {
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
  const handleAccordion = () => {
    if (window.innerWidth <= 991) {
      document.querySelectorAll('.footer-widget .widget-title').forEach(title => {
        title.addEventListener('click', () => {
          const content = title.nextElementSibling;
          if (content) {
            content.style.display = 
              content.style.display === 'none' ? 'block' : 'none';
          }
        });
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
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
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
    const cookieConsent = getCookie('cookie_consent');
    const cookiePopup = document.querySelector('.cookie-popup');
    
    if (!cookieConsent && cookiePopup) {
      cookiePopup.classList.add('show');
      
      cookiePopup.querySelector('.accept-btn')?.addEventListener('click', () => {
        setCookie('cookie_consent', 'accepted', 30);
        cookiePopup.classList.remove('show');
      });
    }
  };

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
  if (!goTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 200) {
      goTopBtn.classList.add('active');
    } else {
      goTopBtn.classList.remove('active');
    }
  });

  goTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
};

/* Check Click
-------------------------------------------------------------------------*/
const checkClick = () => {
  document.querySelectorAll('.flat-check-list').forEach(list => {
    list.addEventListener('click', (e) => {
      const checkItem = e.target.closest('.check-item');
      if (!checkItem) return;

      list.querySelectorAll('.check-item').forEach(item => {
        item.classList.remove('active');
      });
      checkItem.classList.add('active');
    });
  });
};

/* Color Swatch Product
-------------------------------------------------------------------------*/
const swatchColor = () => {
  document.querySelectorAll('.card-product').forEach(product => {
    const swatches = product.querySelectorAll('.color-swatch');
    swatches.forEach(swatch => {
      ['click', 'mouseover'].forEach(event => {
        swatch.addEventListener(event, () => {
          const swatchImg = swatch.querySelector('img');
          if (!swatchImg) return;
          
          const imgProduct = product.querySelector('.img-product');
          if (!imgProduct) return;

          imgProduct.src = swatchImg.src;
          product.querySelectorAll('.color-swatch.active').forEach(active => {
            active.classList.remove('active');
          });
          swatch.classList.add('active');
        });
      });
    });
  });
};

/* Sidebar Mobile
-------------------------------------------------------------------------*/
const sidebarMobile = () => {
  const sidebarContent = document.querySelector('.sidebar-content-wrap');
  const sidebarMobileAppend = document.querySelector('.sidebar-mobile-append');
  
  if (sidebarContent && sidebarMobileAppend) {
    sidebarMobileAppend.innerHTML = sidebarContent.innerHTML;
  }
};

/* Stagger Wrap
-------------------------------------------------------------------------*/
const staggerWrap = () => {
  document.querySelectorAll('.stagger-wrap').forEach(wrap => {
    const items = wrap.querySelectorAll('.stagger-item');
    items.forEach((item, index) => {
      const delay = (index + 1) * 0.2;
      item.style.transitionDelay = delay + 's';
      item.classList.add('stagger-finished');
    });
  });
};

/* Modal Second
-------------------------------------------------------------------------*/
const clickModalSecond = () => {
  // Using Bootstrap 5 Modal API
  const setupModalTrigger = (selector, modalId) => {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
      });
    });
  };

  setupModalTrigger('.btn-quickview', 'quickView');
  setupModalTrigger('.btn-addtocart', 'shoppingCart');

  // Handle other toggleable elements
  const setupToggle = (btnSelector, targetClass) => {
    document.querySelectorAll(btnSelector).forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelector(targetClass)?.classList.add('open');
      });
    });
  };

  setupToggle('.btn-add-gift', '.add-gift');
  setupToggle('.btn-add-note', '.add-note');
  setupToggle('.btn-coupon', '.coupon');
  setupToggle('.btn-estimate-shipping', '.estimate-shipping');

  // Close button handler
  document.querySelectorAll('.tf-mini-cart-tool-close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf-mini-cart-tool-openable').forEach(el => {
        el.classList.remove('open');
      });
    });
  });
};

/* Estimate Shipping
-------------------------------------------------------------------------*/
const estimateShipping = () => {
  const form = document.getElementById('shipping-form');
  if (!form) return;

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
      'Australia': /^\d{4}$/,
      'Austria': /^\d{4}$/,
      'Belgium': /^\d{4}$/,
      'Canada': /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      'Czech Republic': /^\d{5}$/,
      'Denmark': /^\d{4}$/,
      'Finland': /^\d{5}$/,
      'France': /^\d{5}$/,
      'Germany': /^\d{5}$/,
      'United States': /^\d{5}(-\d{4})?$/,
      'United Kingdom': /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/,
      'India': /^\d{6}$/,
      'Japan': /^\d{3}-\d{4}$/,
      'Mexico': /^\d{5}$/,
      'South Korea': /^\d{5}$/,
      'Spain': /^\d{5}$/,
      'Italy': /^\d{5}$/,
      'Vietnam': /^\d{6}$/
    };

    return patterns[country] ? patterns[country].test(zipcode) : true;
  };

  if (countrySelect) {
    countrySelect.addEventListener('change', updateProvinces);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const zipcode = zipcodeInput?.value.trim();
      const country = countrySelect?.value;

      if (zipcode && country && zipcodeMessage && zipcodeSuccess) {
        if (!validateZipcode(zipcode, country)) {
          zipcodeMessage.style.display = 'block';
          zipcodeSuccess.style.display = 'none';
        } else {
          zipcodeMessage.style.display = 'none';
          zipcodeSuccess.style.display = 'block';
        }
      }
    });
  }

  // Initialize provinces on load
  window.addEventListener('load', updateProvinces);
};

/* Header Sticky
-------------------------------------------------------------------------*/
const headerSticky = () => {
  let lastScrollTop = 0;
  const delta = 5;
  let didScroll = false;
  let isSticky = false;

  const header = document.getElementById('header');
  if (!header) return;

  // Add necessary CSS classes for transition
  header.classList.add('header-sticky-ready');
  
  const getScrollTop = () => window.pageYOffset || document.documentElement.scrollTop;
  
  const hasScrolled = () => {
    const st = getScrollTop();
    const navbarHeight = header.offsetHeight;
    const windowWidth = window.innerWidth;

    // Only apply sticky behavior for desktop
    if (windowWidth < 1200) {
      header.classList.remove('is-sticky', 'header-bg', 'header-show', 'header-hide');
      header.style.top = '';
      return;
    }

    // If we're at the top, remove sticky
    if (st <= 0) {
      header.classList.remove('is-sticky', 'header-bg', 'header-show', 'header-hide');
      header.style.top = '';
      isSticky = false;
      return;
    }

    // Start sticky behavior after scrolling past header height
    if (st > navbarHeight) {
      if (!isSticky) {
        header.classList.add('is-sticky');
        isSticky = true;
      }

      // Scrolling down
      if (st > lastScrollTop && st > navbarHeight) {
        header.classList.remove('header-show');
        header.classList.add('header-hide');
        header.style.top = `-${navbarHeight}px`;
      } 
      // Scrolling up
      else if (st + window.innerHeight < document.documentElement.scrollHeight) {
        header.classList.remove('header-hide');
        header.classList.add('header-show', 'header-bg');
        header.style.top = '0';
      }
    } else {
      header.classList.remove('is-sticky', 'header-bg', 'header-show', 'header-hide');
      header.style.top = '';
      isSticky = false;
    }

    lastScrollTop = st;
  };

  // Throttle scroll events
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        hasScrolled();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Handle resize events
  window.addEventListener('resize', () => {
    if (window.innerWidth < 1200) {
      header.classList.remove('is-sticky', 'header-bg', 'header-show', 'header-hide');
      header.style.top = '';
    } else {
      hasScrolled();
    }
  });

  // Initial check
  hasScrolled();
};

/* Auto Popup
-------------------------------------------------------------------------*/
const autoPopup = () => {
  const popup = document.querySelector('.auto-popup');
  if (!popup) return;

  const pageKey = 'showPopup_' + window.location.pathname;
  const showPopup = sessionStorage.getItem(pageKey);

  if (!JSON.parse(showPopup)) {
    setTimeout(() => {
      const modal = new bootstrap.Modal(popup);
      modal.show();
    }, 3000);
  }

  document.querySelector('.btn-hide-popup')?.addEventListener('click', () => {
    sessionStorage.setItem(pageKey, 'true');
  });
};

/* Parallax Effect
-------------------------------------------------------------------------*/
const parallaxEffect = () => {
  document.querySelectorAll('.effect-paralax').forEach(element => {
    let offset = 0;
    
    const updateParallax = () => {
      const rect = element.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      
      if (rect.top < viewHeight && rect.bottom > 0) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3; // Adjust this value to control parallax intensity
        element.style.transform = `translate3d(0, ${rate}px, 0)`;
      }
    };

    window.addEventListener('scroll', updateParallax);
    window.addEventListener('resize', updateParallax);
    updateParallax();
  });
};

/* Infinite Slide
-------------------------------------------------------------------------*/
const infiniteSlide = () => {
  document.querySelectorAll('.infiniteslide').forEach(slider => {
    const style = slider.dataset.style || 'left';
    const clone = parseInt(slider.dataset.clone) || 2;
    const speed = parseInt(slider.dataset.speed) || 100;

    const container = slider.querySelector('.slide-container');
    if (!container) return;

    const items = [...container.children];
    
    // Clone items
    for (let i = 0; i < clone; i++) {
      items.forEach(item => {
        container.appendChild(item.cloneNode(true));
      });
    }

    // Animation
    const animate = () => {
      if (style === 'left') {
        if (container.scrollLeft >= (container.scrollWidth - container.clientWidth)) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += 1;
        }
      } else {
        if (container.scrollLeft <= 0) {
          container.scrollLeft = container.scrollWidth - container.clientWidth;
        } else {
          container.scrollLeft -= 1;
        }
      }
    };

    setInterval(animate, speed);
  });
};

/* Button Quantity
-------------------------------------------------------------------------*/
const buttonQuantity = () => {
  document.querySelectorAll('.quantity-wrapper').forEach(wrapper => {
    const input = wrapper.querySelector('input');
    if (!input) return;

    wrapper.querySelector('.minus-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      const value = parseInt(input.value, 10);
      if (value > 1) {
        input.value = value - 1;
        input.dispatchEvent(new Event('change'));
      }
    });

    wrapper.querySelector('.plus-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      const value = parseInt(input.value, 10);
      input.value = value + 1;
      input.dispatchEvent(new Event('change'));
    });
  });
};

/* Delete Item
-------------------------------------------------------------------------*/
const deleteItem = () => {
  document.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.closest('.file-delete')?.remove();
    });
  });

  document.querySelectorAll('.clear-file-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.closest('.list-file-delete')?.querySelectorAll('.file-delete')
        .forEach(item => item.remove());
    });
  });
};

/* Click Control
-------------------------------------------------------------------------*/
const clickControl = () => {
  // Add Address
  document.querySelector('.btn-add-address')?.addEventListener('click', () => {
    document.querySelector('.show-form-address')?.classList.toggle('show');
  });

  document.querySelector('.btn-hide-address')?.addEventListener('click', () => {
    document.querySelector('.show-form-address')?.classList.remove('show');
  });

  // Delete Address
  document.querySelectorAll('.btn-delete-address').forEach(btn => {
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
  document.querySelectorAll('.btn-edit-address').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.account-address-item');
      const editForm = document.querySelector('.edit-form-address');
      
      if (editForm?.classList.contains('show')) {
        if (item?.classList.contains('editing')) {
          editForm.classList.toggle('show');
          item.classList.remove('editing');
        } else {
          document.querySelectorAll('.account-address-item').forEach(addr => {
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

  document.querySelector('.btn-hide-edit-address')?.addEventListener('click', () => {
    document.querySelector('.edit-form-address')?.classList.remove('show');
    document.querySelectorAll('.account-address-item').forEach(item => {
      item.classList.remove('editing');
    });
  });
};

/* Tab Slide
-------------------------------------------------------------------------*/
const tabSlide = () => {
  const updateTabSlide = () => {
    document.querySelectorAll('.tab-slide').forEach(tabContainer => {
      const activeTab = tabContainer.querySelector('li.active');
      if (!activeTab) return;

      const slideEffect = tabContainer.querySelector('.item-slide-effect');
      if (!slideEffect) return;

      const width = activeTab.offsetWidth;
      const left = activeTab.offsetLeft;

      slideEffect.style.width = width + 'px';
      slideEffect.style.transform = `translateX(${left}px)`;
    });
  };

  document.querySelectorAll('.tab-slide li').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabs = tab.parentElement.querySelectorAll('li');
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updateTabSlide();
    });
  });

  window.addEventListener('resize', updateTabSlide);
  updateTabSlide();
};

/* Copy Text
-------------------------------------------------------------------------*/
const copyText = () => {
  document.getElementById('btn-coppy-text')?.addEventListener('click', () => {
    const text = document.getElementById('coppyText');
    if (!text) return;

    navigator.clipboard.writeText(text.innerText)
      .then(() => alert('Text copied: ' + text.innerText))
      .catch(err => alert('Failed to copy text: ' + err));
  });
};

/* Wish List
-------------------------------------------------------------------------*/
const wishList = () => {
  document.querySelectorAll('.btn-add-wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('added-wishlist');
    });
  });

  document.querySelectorAll('.card-product .wishlist').forEach(wishlist => {
    wishlist.addEventListener('click', () => {
      wishlist.classList.toggle('addwishlist');

      const icon = wishlist.querySelector('.icon');
      const tooltip = wishlist.querySelector('.tooltip');

      if (wishlist.classList.contains('addwishlist')) {
        icon?.classList.replace('icon-heart2', 'icon-trash');
        if (tooltip) tooltip.textContent = 'Remove Wishlist';
      } else {
        icon?.classList.replace('icon-trash', 'icon-heart2');
        if (tooltip) tooltip.textContent = 'Add to Wishlist';
      }
    });
  });
};

/* Bottom Sticky
-------------------------------------------------------------------------*/
const bottomSticky = () => {
  const stickyBtn = document.querySelector('.tf-sticky-btn-atc');
  if (!stickyBtn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset >= 500) {
      stickyBtn.classList.add('show');
    } else {
      stickyBtn.classList.remove('show');
    }
  });
};

/* Handle Sidebar Filter
-------------------------------------------------------------------------*/
const handleSidebarFilter = () => {
  const toggleFilter = (show = true) => {
    const elements = document.querySelectorAll('.sidebar-filter, .overlay-filter');
    elements.forEach(el => {
      el.classList.toggle('show', show);
    });
  };

  ['#filterShop', '.sidebar-btn'].forEach(selector => {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.innerWidth <= 1200) {
          toggleFilter(true);
        }
      });
    });
  });

  ['.close-filter', '.overlay-filter'].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('click', () => {
        toggleFilter(false);
      });
    });
  });
};