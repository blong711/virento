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
  autoPopup();
});

// Reinitialize components when sections are updated
document.addEventListener('shopify:section:load', (event) => {
  if (event.target.id.includes('back-to-top')) {
    goTop();
  }
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
      behavior: 'smooth'
    });
  });
};

/* Check Click
-------------------------------------------------------------------------*/
const checkClick = () => {
  const checkItems = document.querySelectorAll('.flat-check-list .check-item');
  checkItems.forEach(item => {
    item.addEventListener('click', () => {
      const list = item.closest('.flat-check-list');
      list.querySelectorAll('.check-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
};

/* Swatch Color
-------------------------------------------------------------------------*/
const swatchColor = () => {
  const products = document.querySelectorAll('.card-product');
  if (products.length === 0) return;

  products.forEach(product => {
    const swatches = product.querySelectorAll('.color-swatch');
    swatches.forEach(swatch => {
      ['click', 'mouseover'].forEach(event => {
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
  // Using Bootstrap 5 Modal API
  document.querySelectorAll('.btn-quickview').forEach(btn => {
    btn.addEventListener('click', () => {
      const quickViewModal = new bootstrap.Modal(document.getElementById('quickView'));
      quickViewModal.show();
    });
  });

  document.querySelectorAll('.btn-addtocart').forEach(btn => {
    btn.addEventListener('click', () => {
      const cartModal = new bootstrap.Modal(document.getElementById('shoppingCart'));
      cartModal.show();
    });
  });

  document.querySelectorAll('.btn-add-gift').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.add-gift')?.classList.add('open');
    });
  });

  document.querySelectorAll('.btn-add-note').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.add-note')?.classList.add('open');
    });
  });

  document.querySelectorAll('.btn-coupon').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.coupon')?.classList.add('open');
    });
  });

  document.querySelectorAll('.btn-estimate-shipping').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.estimate-shipping')?.classList.add('open');
    });
  });

  document.querySelectorAll('.tf-mini-cart-tool-close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf-mini-cart-tool-openable').forEach(tool => {
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
    sessionStorage.setItem(pageKey, true);
  });
};

/* Parallax Effects
-------------------------------------------------------------------------*/
const efectParalax = () => {
  const parallaxElements = document.querySelectorAll('.effect-paralax');
  if (parallaxElements.length === 0) return;

  parallaxElements.forEach(element => {
    new SimpleParallax(element, {
      delay: 0.5,
      orientation: 'up',
      scale: 1.3,
      transition: 'cubic-bezier(0.2, 0.8, 1, 1)'
    });
  });
};

/* Handle Sidebar Filter
-------------------------------------------------------------------------*/
const handleSidebarFilter = () => {
  // Filter shop button click handlers
  document.querySelectorAll('#filterShop, .sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 1200) {
        document.querySelector('.sidebar-filter')?.classList.add('show');
        document.querySelector('.overlay-filter')?.classList.add('show');
      }
    });
  });

  // Close filter handlers
  document.querySelectorAll('.close-filter, .overlay-filter').forEach(btn => {
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
  document.querySelectorAll('.btn-add-wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('added-wishlist');
    });
  });

  // Handle product card wishlist buttons
  document.querySelectorAll('.card-product .wishlist').forEach(btn => {
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

  copyBtn.addEventListener('click', () => {
    const text = document.getElementById('coppyText');
    if (!text) return;

    try {
      // Create a temporary textarea to handle multi-line text
      const textarea = document.createElement('textarea');
      textarea.value = text.innerText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      alert('Text copied: ' + text.innerText);
    } catch (err) {
      alert('Failed to copy text: ' + err);
    }
  });
};

/* Tab Slide
-------------------------------------------------------------------------*/
const tabSlide = () => {
  const tabSlides = document.querySelectorAll('.tab-slide');
  if (tabSlides.length === 0) return;

  const updateTabSlide = () => {
    tabSlides.forEach(tabSlide => {
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
  tabSlides.forEach(tabSlide => {
    const tabs = tabSlide.querySelectorAll('li');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
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
  document.querySelectorAll('.btn-add-address').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.show-form-address')?.classList.toggle('show');
    });
  });

  document.querySelectorAll('.btn-hide-address').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.show-form-address')?.classList.remove('show');
    });
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

  document.querySelectorAll('.btn-hide-edit-address').forEach(btn => {
    btn.addEventListener('click', () => {
      const editForm = document.querySelector('.edit-form-address');
      editForm?.classList.remove('show');
      document.querySelectorAll('.account-address-item').forEach(item => {
        item.classList.remove('editing');
      });
    });
  });
};

/* Delete Item
----------------------------------------------------------------------------*/
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
      btn.closest('.list-file-delete')?.querySelectorAll('.file-delete').forEach(item => {
        item.remove();
      });
    });
  });
};

/* Button Quantity
----------------------------------------------------------------------------*/
const buttonQuantity = () => {
  document.querySelectorAll('.minus-btn').forEach(btn => {
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

  document.querySelectorAll('.plus-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = btn.closest('div').querySelector('input');
      let value = parseInt(input.value, 10);

      if (value > -1) {
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

  slides.forEach(slide => {
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
      items.forEach(item => {
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