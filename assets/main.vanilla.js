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
  parallax();
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
    new CustomSelect(select);
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

  handleProgress('scroll', 'DOMContentLoaded', '.progress-bar');
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