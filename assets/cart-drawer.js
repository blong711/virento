class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  // Check if the current page is the cart page
  isOnCartPage() {
    // Check if we're on the cart page by looking for cart-specific elements
    const cartPageIndicator = document.querySelector('.main-cart, [data-section-type="main-cart"]');
    if (cartPageIndicator) {
      return true;
    }
    
    // Check URL path
    const currentPath = window.location.pathname;
    if (currentPath === '/cart' || currentPath.includes('/cart')) {
      return true;
    }
    
    // Check if the current template is cart
    if (document.body.classList.contains('template-cart') || 
        document.documentElement.classList.contains('template-cart')) {
      return true;
    }
    
    return false;
  }

  init() {
    // Set up close button functionality
    const closeButton = this.querySelector('.icon-close-popup');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });
    }

    // Set up remove item buttons
    this.setupRemoveButtons();
    
    // Set up quantity buttons
    this.setupQuantityButtons();
    
    // Set up variant selection
    this.setupVariantSelection();
    
    // Set up all tool functionality
    this.setupTools();
    
    // Set up terms checkbox functionality
    this.setupTermsCheckbox();
    
    // Check empty cart state on initialization
    this.checkEmptyCart();
    
    // Check gift wrap status on initialization
    this.checkGiftWrapInCart();
  }

  reinitWithoutSwiper() {
    // Set up close button functionality
    const closeButton = this.querySelector('.icon-close-popup');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });
    }

    // Set up remove item buttons
    this.setupRemoveButtons();
    
    // Set up quantity buttons
    this.setupQuantityButtons();
    
    // Set up variant selection
    this.setupVariantSelection();
    
    // Set up all tool functionality (excluding swiper-related)
    this.setupToolsWithoutSwiper();
    
    // Set up terms checkbox functionality
    this.setupTermsCheckbox();
    
    // Check empty cart state on initialization
    this.checkEmptyCart();
    
    // Check gift wrap status after reinitialization
    this.checkGiftWrapInCart();
  }

  setupRemoveButtons() {
    const removeButtons = this.querySelectorAll('.remove');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const cartItem = button.closest('[data-cart-item]');
        if (cartItem) {
          const itemKey = cartItem.getAttribute('data-cart-item-key');
          this.removeItem(itemKey);
        }
      });
    });
  }

  setupQuantityButtons() {
    const quantityContainers = this.querySelectorAll('[data-cart-quantity]');
    quantityContainers.forEach(container => {
      const minusBtn = container.querySelector('[data-cart-quantity-minus]');
      const plusBtn = container.querySelector('[data-cart-quantity-plus]');
      const quantityInput = container.querySelector('[data-cart-quantity-input]');
      
      if (minusBtn && plusBtn && quantityInput) {
        // Minus button
        minusBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const currentValue = parseInt(quantityInput.value);
          if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            this.updateItemQuantity(quantityInput);
          } else if (currentValue === 1) {
            // Remove item if quantity becomes 0
            const cartItem = container.closest('[data-cart-item]');
            if (cartItem) {
              const itemKey = cartItem.getAttribute('data-cart-item-key');
              this.removeItem(itemKey);
            }
          }
        });

        // Plus button
        plusBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const currentValue = parseInt(quantityInput.value);
          quantityInput.value = currentValue + 1;
          this.updateItemQuantity(quantityInput);
        });

        // Input change
        quantityInput.addEventListener('change', (e) => {
          this.updateItemQuantity(quantityInput);
        });
      }
    });
  }

  updateItemQuantity(quantityInput) {
    const cartItem = quantityInput.closest('[data-cart-item]');
    if (!cartItem) return;

    const itemKey = cartItem.getAttribute('data-cart-item-key');
    const newQuantity = parseInt(quantityInput.value);

    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      this.removeItem(itemKey);
      return;
    }

    const formData = new FormData();
    formData.append('id', itemKey);
    formData.append('quantity', newQuantity);

    fetch('/cart/change.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(cart => {
      this.updateCart(cart);
      // Check complementary products after quantity update
      this.checkComplementaryProducts();
      
      // Check gift wrap status after quantity update
      this.checkGiftWrapInCart();
    })
    .catch(error => {
      console.error('Error updating quantity:', error);
    });
  }

  setupVariantSelection() {
    const variantSelects = this.querySelectorAll('.info-variant select');
    variantSelects.forEach(select => {
      select.addEventListener('change', (e) => {
        this.updateItemVariant(e.target);
      });
    });

    // Set up edit buttons for variant selection
    const editButtons = this.querySelectorAll('.info-variant .edit');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const variantSelect = button.closest('.info-variant').querySelector('select');
        if (variantSelect) {
          variantSelect.focus();
        }
      });
    });
  }

  setupTools() {
    // Set up gift wrap functionality
    this.setupGiftWrap();
    
    // Set up note functionality
    this.setupNote();
    
    // Set up discount/coupon functionality
    this.setupDiscount();
    
    // Set up shipping calculator functionality
    this.setupShippingCalculator();
    
    // Set up toolbox button click handlers
    this.setupToolboxButtons();
    
    // Set up add to cart buttons in recommendations
    this.setupRecommendationAddToCart();
    
    // Check and hide complementary products already in cart
    this.checkComplementaryProducts();
  }

  setupToolsWithoutSwiper() {
    // Set up gift wrap functionality
    this.setupGiftWrap();
    
    // Set up note functionality
    this.setupNote();
    
    // Set up discount/coupon functionality
    this.setupDiscount();
    
    // Set up shipping calculator functionality
    this.setupShippingCalculator();
    
    // Set up toolbox button click handlers
    this.setupToolboxButtons();
    
    // Check and hide complementary products already in cart
    this.checkComplementaryProducts();
    
    // Note: Excluding setupRecommendationAddToCart() to avoid swiper re-initialization
    // The swiper functionality should remain intact from the original initialization
  }

  setupToolboxButtons() {
    // Gift wrap button
    const giftWrapBtn = this.querySelector('.btn-add-gift');
    if (giftWrapBtn) {
      giftWrapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openTool('add-gift');
      });
    }

    // Note button
    const noteBtn = this.querySelector('.btn-add-note');
    if (noteBtn) {
      noteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openTool('add-note');
      });
    }

    // Coupon button
    const couponBtn = this.querySelector('.btn-coupon');
    if (couponBtn) {
      couponBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openTool('coupon');
      });
    }

    // Shipping button
    const shippingBtn = this.querySelector('.btn-estimate-shipping');
    if (shippingBtn) {
      shippingBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openTool('estimate-shipping');
      });
    }

    // Close buttons for all tools
    const closeButtons = this.querySelectorAll('.tf-mini-cart-tool-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeAllTools();
      });
    });
  }

  openTool(toolClass) {
    // Close all tools first
    this.closeAllTools();
    
    // Open the specific tool
    const tool = this.querySelector(`.${toolClass}`);
    if (tool) {
      tool.classList.add('open');
    }
  }

  closeAllTools() {
    const allTools = this.querySelectorAll('.tf-mini-cart-tool-openable');
    allTools.forEach(tool => {
      tool.classList.remove('open');
    });
  }

  setupNote() {
    const noteForm = this.querySelector('[data-cart-note]');
    if (noteForm) {
      noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.updateCartNote(noteForm);
      });
    }
  }

  updateCartNote(noteForm) {
    const noteTextarea = noteForm.querySelector('textarea[name="note"]');
    const note = noteTextarea ? noteTextarea.value : '';
    
    const formData = new FormData();
    formData.append('note', note);

    fetch('/cart/update.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(cart => {
      // Successfully updated note
      this.updateCart(cart);
      
      // Close the note tool
      this.closeAllTools();
    })
    .catch(error => {
      console.error('Error updating note:', error);
      alert('Error updating note. Please try again.');
    });
  }

  setupDiscount() {
    const discountForm = this.querySelector('[data-cart-discount]');
    if (discountForm) {
      discountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.applyDiscount(discountForm);
      });
    }
  }

  applyDiscount(discountForm) {
    const discountInput = discountForm.querySelector('[data-cart-discount-input]');
    const discountCode = discountInput ? discountInput.value.trim() : '';
    
    if (!discountCode) {
      alert('Please enter a discount code.');
      return;
    }

    const formData = new FormData();
    formData.append('discount', discountCode);

    // Show loading state
    const submitButton = discountForm.querySelector('[data-cart-discount-add]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Applying...';
    submitButton.disabled = true;

    fetch('/cart/update.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(cart => {
      if (cart.token) {
        // Successfully applied discount
        this.updateCart(cart);
        this.closeAllTools();
        alert('Discount code applied successfully!');
      } else {
        alert('Invalid discount code. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error applying discount:', error);
      alert('Error applying discount. Please try again.');
    })
    .finally(() => {
      // Reset button state
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
  }

  setupShippingCalculator() {
    const shippingForm = this.querySelector('[data-shipping-calculator]');
    if (shippingForm) {
      shippingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculateShipping(shippingForm);
      });

      // Set up country/province dependency
      const countrySelect = shippingForm.querySelector('[data-shipping-country]');
      const provinceField = shippingForm.querySelector('#shipping-province-field');
      const provinceSelect = shippingForm.querySelector('[data-shipping-province]');
      
      if (countrySelect && provinceField && provinceSelect) {
        // Initial check for province field visibility
        this.toggleProvinceField(countrySelect.value, provinceField, provinceSelect);
        
        // Listen for country changes
        countrySelect.addEventListener('change', () => {
          this.toggleProvinceField(countrySelect.value, provinceField, provinceSelect);
        });
      }
    }
  }

  updateProvinces(countryCode, provinceSelect) {
    // Clear current provinces
    provinceSelect.innerHTML = '<option value="">Select Province/State</option>';
    
    if (!countryCode) return;

    // Fetch provinces for the selected country
    fetch(`/services/javascripts/countries.js?country=${countryCode}`)
      .then(response => response.json())
      .then(data => {
        if (data && data[countryCode]) {
          const provinces = data[countryCode];
          provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province[0];
            option.textContent = province[1];
            provinceSelect.appendChild(option);
          });
        }
      })
      .catch(error => {
        console.error('Error fetching provinces:', error);
      });
  }

  toggleProvinceField(countryCode, provinceField, provinceSelect) {
    if (!countryCode) {
      provinceField.style.display = 'none';
      return;
    }

    // Try to get provinces from Shopify data
    let provinces = null;
    
    // Check if Shopify countries data is available
    if (window.Shopify && window.Shopify.countries && window.Shopify.countries[countryCode]) {
      provinces = window.Shopify.countries[countryCode].provinces;
    }
    
    // If no Shopify data, try to get from the select options (fallback)
    if (!provinces) {
      const countrySelect = provinceSelect.closest('form').querySelector('[data-shipping-country]');
      const countryOption = countrySelect.querySelector(`option[value="${countryCode}"]`);
      if (countryOption && countryOption.dataset.provinces) {
        try {
          provinces = JSON.parse(countryOption.dataset.provinces);
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
    
    if (provinces && Object.keys(provinces).length > 0) {
      // Country has provinces, show the field and populate options
      provinceField.style.display = 'block';
      
      // Clear existing options
      provinceSelect.innerHTML = '';
      
      // Add province options
      Object.keys(provinces).forEach(function(provinceCode) {
        const option = document.createElement('option');
        option.value = provinceCode;
        option.textContent = provinces[provinceCode];
        provinceSelect.appendChild(option);
      });
    } else {
      // Country has no provinces, hide the field
      provinceField.style.display = 'none';
      provinceSelect.value = '';
    }
  }

  calculateShipping(shippingForm) {
    const countrySelect = shippingForm.querySelector('[data-shipping-country]');
    const provinceSelect = shippingForm.querySelector('[data-shipping-province]');
    const zipInput = shippingForm.querySelector('[data-shipping-zip]');
    const ratesContainer = shippingForm.querySelector('[data-shipping-rates]');
    
    const country = countrySelect ? countrySelect.value : '';
    const province = provinceSelect ? provinceSelect.value : '';
    const zip = zipInput ? zipInput.value : '';
    
    if (!country || !province || !zip) {
      alert('Please fill in all shipping fields.');
      return;
    }

    // Show loading state
    const submitButton = shippingForm.querySelector('[data-shipping-calculator-submit]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Calculating...';
    submitButton.disabled = true;

    const formData = new FormData();
    formData.append('shipping_address[country]', country);
    formData.append('shipping_address[province]', province);
    formData.append('shipping_address[zip]', zip);

    fetch('/cart/shipping_rates.json', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      this.displayShippingRates(data.shipping_rates, ratesContainer);
    })
    .catch(error => {
      console.error('Error calculating shipping:', error);
      alert('Error calculating shipping rates. Please try again.');
    })
    .finally(() => {
      // Reset button state
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
  }

  displayShippingRates(rates, container) {
    if (!container) return;
    
    const heading = container.querySelector('.shipping-rates__heading');
    const list = container.querySelector('.shipping-rates__list');
    
    if (rates && rates.length > 0) {
      heading.textContent = 'Available Shipping Rates:';
      
      list.innerHTML = '';
      rates.forEach(rate => {
        const li = document.createElement('li');
        li.className = 'shipping-rates__item';
        li.innerHTML = `
          <span class="shipping-rates__name">${rate.name}</span>
          <span class="shipping-rates__price">${rate.price}</span>
        `;
        list.appendChild(li);
      });
      
      container.style.display = 'block';
    } else {
      heading.textContent = 'No shipping rates available for this location.';
      list.innerHTML = '';
      container.style.display = 'block';
    }
  }

  setupRecommendationAddToCart() {
    const addToCartButtons = this.querySelectorAll('[data-cart-add]');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.addRecommendationToCart(button);
      });
    });
  }

  addRecommendationToCart(button) {
    const form = button.closest('form');
    if (!form) return;

    const formData = new FormData(form);
    
    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Adding...';
    button.disabled = true;

    fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(result => {
      if (result.status) {
        console.error('Error adding product:', result.description);
        alert('Error adding product: ' + result.description);
      } else {
        // Successfully added product
        this.updateCart(result);
        // Check complementary products after adding recommendation
        this.checkComplementaryProducts();
      }
    })
    .catch(error => {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    })
    .finally(() => {
      // Reset button state
      button.textContent = originalText;
      button.disabled = false;
    });
  }

  setupGiftWrap() {
    const giftWrapForm = this.querySelector('[data-cart-gift-wrap]');
    if (giftWrapForm) {
      giftWrapForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addGiftWrap();
      });
    }
    
    // Check if gift wrap is already in cart and hide button if needed
    this.checkGiftWrapInCart();
  }

  checkGiftWrapInCart() {
    const giftWrapButton = this.querySelector('.btn-add-gift');
    if (!giftWrapButton) return;

    // Check if gift wrap product is already in cart
    const cartItems = this.querySelectorAll('[data-cart-item]');
    let giftWrapInCart = false;

    // Get gift wrap product ID from the form or settings
    let giftWrapProductId = null;
    
    // Try to get from the gift wrap form first
    const giftWrapForm = this.querySelector('[data-cart-gift-wrap]');
    if (giftWrapForm) {
      const giftWrapInput = giftWrapForm.querySelector('input[name="gift_wrap_product_id"]');
      if (giftWrapInput && giftWrapInput.value) {
        giftWrapProductId = giftWrapInput.value;
      }
    }
    
    // If no gift wrap product ID found, try to get from Shopify settings
    if (!giftWrapProductId && window.Shopify && window.Shopify.settings && window.Shopify.settings.gift_wrap_product) {
      giftWrapProductId = window.Shopify.settings.gift_wrap_product;
    }

    if (giftWrapProductId) {
      cartItems.forEach(cartItem => {
        // Check if this cart item is gift wrap by looking for gift wrap product ID
        const variantSelect = cartItem.querySelector('select[id^="variant-"]');
        if (variantSelect) {
          const currentVariantId = variantSelect.getAttribute('data-current-variant');
          if (currentVariantId && currentVariantId.toString() === giftWrapProductId.toString()) {
            giftWrapInCart = true;
          }
        }
      });
    }

    // Hide gift wrap button if gift wrap is already in cart
    if (giftWrapInCart) {
      giftWrapButton.style.display = 'none';
    } else {
      giftWrapButton.style.display = 'block';
    }
  }

  updateItemVariant(selectElement) {
    const cartItem = selectElement.closest('[data-cart-item]');
    if (!cartItem) return;

    const itemKey = cartItem.getAttribute('data-cart-item-key');
    const selectedVariant = selectElement.value;
    const currentQuantity = parseInt(cartItem.querySelector('[data-cart-quantity-input]').value);

    // Find the variant ID from the selected option
    const selectedOption = selectElement.querySelector(`option[value="${selectedVariant}"]`);
    const variantId = selectedOption ? selectedOption.getAttribute('data-variant-id') : null;

    if (!variantId) {
      console.error('No variant ID found for selected option');
      return;
    }

    // Remove the current item and add the new variant
    const formData = new FormData();
    formData.append('id', itemKey);
    formData.append('quantity', 0); // Remove current item

    fetch('/cart/change.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(cart => {
      // Now add the new variant
      const addFormData = new FormData();
      addFormData.append('id', variantId);
      addFormData.append('quantity', currentQuantity);

      return fetch('/cart/add.js', {
        method: 'POST',
        body: addFormData
      });
    })
    .then(response => response.json())
    .then(result => {
      if (result.status) {
        console.error('Error adding new variant:', result.description);
      } else {
        // Update cart display
        this.updateCart(result);
        // Check complementary products after variant update
        this.checkComplementaryProducts();
        
        // Check gift wrap status after variant update
        this.checkGiftWrapInCart();
      }
    })
    .catch(error => {
      console.error('Error updating variant:', error);
    });
  }

  removeItem(itemKey) {
    const formData = new FormData();
    formData.append('id', itemKey);
    formData.append('quantity', 0);

    fetch('/cart/change.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(cart => {
      this.updateCart(cart);
      // Check complementary products after item removal
      this.checkComplementaryProducts();
      
      // Check gift wrap status after item removal
      this.checkGiftWrapInCart();
    })
    .catch(error => {
      console.error('Error removing item:', error);
    });
  }

  addGiftWrap() {
    const giftWrapForm = this.querySelector('[data-cart-gift-wrap]');
    if (!giftWrapForm) return;

    const giftWrapProductId = giftWrapForm.querySelector('input[name="gift_wrap_product_id"]');
    if (!giftWrapProductId || !giftWrapProductId.value) {
      console.error('No gift wrap product ID found');
      return;
    }

    const formData = new FormData();
    formData.append('id', giftWrapProductId.value);
    formData.append('quantity', 1);

    // Show loading state
    const submitButton = giftWrapForm.querySelector('[data-cart-gift-wrap-add]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Adding...';
    submitButton.disabled = true;

    fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(result => {
      if (result.status) {
        console.error('Error adding gift wrap:', result.description);
        // Show error message to user
        alert('Error adding gift wrap: ' + result.description);
      } else {
        // Successfully added gift wrap
        this.updateCart(result);
        
        // Hide the gift wrap button after adding
        const giftWrapButton = this.querySelector('.btn-add-gift');
        if (giftWrapButton) {
          giftWrapButton.style.display = 'none';
        }
        
        // Check complementary products after adding gift wrap
        this.checkComplementaryProducts();
        
        // Close the gift wrap tool
        const closeButton = giftWrapForm.querySelector('.tf-mini-cart-tool-close');
        if (closeButton) {
          closeButton.click();
        }
      }
    })
    .catch(error => {
      console.error('Error adding gift wrap:', error);
      alert('Error adding gift wrap. Please try again.');
    })
    .finally(() => {
      // Reset button state
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
  }

  setupTermsCheckbox() {
    const termsCheckbox = this.querySelector('#CartDrawer-Form_agree');
    const checkoutButton = this.querySelector('[data-checkout-button]');
    
    if (termsCheckbox && checkoutButton) {
      // Initially disable checkout button if checkbox exists
      this.updateCheckoutButtonState(termsCheckbox, checkoutButton);
      
      // Add event listener to checkbox
      termsCheckbox.addEventListener('change', () => {
        this.updateCheckoutButtonState(termsCheckbox, checkoutButton);
      });
    }
  }

  updateCheckoutButtonState(checkbox, checkoutButton) {
    if (checkbox.checked) {
      // Enable checkout button
      checkoutButton.classList.remove('disabled');
      checkoutButton.style.pointerEvents = 'auto';
      checkoutButton.style.opacity = '1';
      checkoutButton.removeAttribute('disabled');
    } else {
      // Disable checkout button
      checkoutButton.classList.add('disabled');
      checkoutButton.style.pointerEvents = 'none';
      checkoutButton.style.opacity = '0.5';
      checkoutButton.setAttribute('disabled', 'disabled');
    }
  }


  open(triggeredBy) {
    // Don't open the cart drawer if we're on the cart page
    if (this.isOnCartPage()) {
      return;
    }
    
    if (triggeredBy) this.setActiveElement(triggeredBy);
    
    // Safely open the cart drawer without creating duplicate instances
    const existingOffcanvas = bootstrap.Offcanvas.getInstance(this);
    if (existingOffcanvas) {
      // If already open, just show it (no duplicate)
      existingOffcanvas.show();
    } else {
      // Create new instance only if none exists
      const offcanvas = new bootstrap.Offcanvas(this);
      offcanvas.show();
    }
  }

  close() {
    // Use Bootstrap's offcanvas API to close the cart drawer
    const offcanvas = bootstrap.Offcanvas.getInstance(this);
    if (offcanvas) {
      offcanvas.hide();
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }

  renderContents(parsedState) {
    // Update cart contents based on the response
    if (parsedState.sections && parsedState.sections['cart-drawer']) {
      const cartDrawerContent = this.getSectionInnerHTML(parsedState.sections['cart-drawer'], '#shoppingCart');
      if (cartDrawerContent) {
        // Parse the new content to extract only cart items
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(cartDrawerContent, 'text/html');
        
        // Update only the cart items section, not the entire content
        const newCartItems = newDoc.querySelector('.tf-mini-cart-items');
        const currentCartItems = this.querySelector('.tf-mini-cart-items');
        
        if (newCartItems && currentCartItems) {
          currentCartItems.innerHTML = newCartItems.innerHTML;
        }
        
        // Update cart totals and other non-swiper content
        const newCartBottom = newDoc.querySelector('.tf-mini-cart-bottom');
        const currentCartBottom = this.querySelector('.tf-mini-cart-bottom');
        
        if (newCartBottom && currentCartBottom) {
          currentCartBottom.innerHTML = newCartBottom.innerHTML;
        }
        
        // Update free shipping progress
        const newFreeShipping = newDoc.querySelector('.tf-mini-cart-threshold');
        const currentFreeShipping = this.querySelector('.tf-mini-cart-threshold');
        
        if (newFreeShipping && currentFreeShipping) {
          currentFreeShipping.innerHTML = newFreeShipping.innerHTML;
        }
        
                    // Re-initialize all functionality after content update (except swiper)
            this.reinitWithoutSwiper();
            
            // Ensure all tools are closed after content update
            this.closeAllTools();
            
            // Re-setup terms checkbox functionality after content update
            this.setupTermsCheckbox();
            
            // Check complementary products after content update
            this.checkComplementaryProducts();
            
            // Check gift wrap status after content update
            this.checkGiftWrapInCart();
      }
    }

    // Open the cart drawer after update (but not on cart page)
    setTimeout(() => {
      if (!this.isOnCartPage()) {
        this.open();
      }
    }, 100);
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const element = doc.querySelector(selector);
    return element ? element.innerHTML : '';
  }



  updateCart(cartData) {
    // Update cart contents without full page reload
    fetch('/?sections=cart-drawer')
      .then(response => response.json())
      .then(sections => {
        if (sections['cart-drawer']) {
          const cartDrawerContent = this.getSectionInnerHTML(sections['cart-drawer'], '#shoppingCart');
          if (cartDrawerContent) {
            // Parse the new content to extract only cart items
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(cartDrawerContent, 'text/html');
            
            // Update only the cart items section, not the entire content
            const newCartItems = newDoc.querySelector('.tf-mini-cart-items');
            const currentCartItems = this.querySelector('.tf-mini-cart-items');
            
            if (newCartItems && currentCartItems) {
              currentCartItems.innerHTML = newCartItems.innerHTML;
            }
            
            // Update cart totals and other non-swiper content
            const newCartBottom = newDoc.querySelector('.tf-mini-cart-bottom');
            const currentCartBottom = this.querySelector('.tf-mini-cart-bottom');
            
            if (newCartBottom && currentCartBottom) {
              currentCartBottom.innerHTML = newCartBottom.innerHTML;
            }
            
            // Update free shipping progress
            const newFreeShipping = newDoc.querySelector('.tf-mini-cart-threshold');
            const currentFreeShipping = this.querySelector('.tf-mini-cart-threshold');
            
            if (newFreeShipping && currentFreeShipping) {
              currentFreeShipping.innerHTML = newFreeShipping.innerHTML;
            }
            
            // Re-initialize all functionality after content update (except swiper)
            this.reinitWithoutSwiper();
            
            // Check if cart is empty and show appropriate message
            this.checkEmptyCart();
            
            // Ensure all tools are closed after cart update
            this.closeAllTools();
            
            // Re-setup terms checkbox functionality after cart update
            this.setupTermsCheckbox();
            
            // Check complementary products after cart update
            this.checkComplementaryProducts();
            
            // Check gift wrap status after cart update
            this.checkGiftWrapInCart();
          }
        }
      })
      .catch(error => {
        console.error('Error updating cart:', error);
      });
    
    // Trigger cart count update event
    document.dispatchEvent(new CustomEvent('cart:updated'));
  }

  checkEmptyCart() {
    const cartItems = this.querySelectorAll('[data-cart-item]');
    const emptyCartMessage = this.querySelector('.tf-mini-cart-empty');
    const cartBottom = this.querySelector('.tf-mini-cart-bottom');
    const recommendations = this.querySelector('.tf-minicart-recommendations');
    const freeShippingProgress = this.querySelector('.tf-mini-cart-threshold');
    
    if (cartItems.length === 0) {
      // Show empty cart message
      if (emptyCartMessage) {
        emptyCartMessage.style.display = 'block';
      }
      // Hide cart bottom section (totals, checkout buttons)
      if (cartBottom) {
        cartBottom.style.display = 'none';
      }
      // Hide recommendations
      if (recommendations) {
        recommendations.style.display = 'none';
      }
      // Hide free shipping progress
      if (freeShippingProgress) {
        freeShippingProgress.style.display = 'none';
      }
    } else {
      // Hide empty cart message
      if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
      }
      // Show cart bottom section
      if (cartBottom) {
        cartBottom.style.display = 'block';
      }
      // Show recommendations if they exist
      if (recommendations) {
        recommendations.style.display = 'block';
      }
      // Show free shipping progress
      if (freeShippingProgress) {
        freeShippingProgress.style.display = 'block';
      }
    }
  }

  checkComplementaryProducts() {
    // Get all complementary products
    const complementaryProducts = this.querySelectorAll('[data-complementary-product]');
    if (complementaryProducts.length === 0) return;

    // Get all cart items
    const cartItems = this.querySelectorAll('[data-cart-item]');
    
    // Create a set of product IDs and variant IDs that are already in the cart
    const cartProductIds = new Set();
    const cartVariantIds = new Set();
    
    cartItems.forEach(cartItem => {
      // Get the product ID from the cart item
      const productLink = cartItem.querySelector('a[href*="/products/"]');
      if (productLink) {
        const productUrl = productLink.getAttribute('href');
        const productIdMatch = productUrl.match(/\/products\/([^\/\?]+)/);
        if (productIdMatch) {
          cartProductIds.add(productIdMatch[1]);
        }
      }
      
      // Get the variant ID from the cart item
      const variantSelect = cartItem.querySelector('select[id^="variant-"]');
      if (variantSelect) {
        const currentVariantId = variantSelect.getAttribute('data-current-variant');
        if (currentVariantId) {
          cartVariantIds.add(currentVariantId);
        }
      }
    });

    // Hide complementary products that are already in the cart
    complementaryProducts.forEach(complementaryProduct => {
      const productId = complementaryProduct.getAttribute('data-product-id');
      const variantId = complementaryProduct.getAttribute('data-variant-id');
      
      // Check if this product or variant is already in the cart
      let shouldHide = false;
      
      // Check by product ID
      if (cartProductIds.has(productId.toString())) {
        shouldHide = true;
      }
      
      // Check by variant ID for more precise matching
      if (cartVariantIds.has(variantId)) {
        shouldHide = true;
      }
      
      if (shouldHide) {
        complementaryProduct.style.display = 'none';
      } else {
        complementaryProduct.style.display = 'block';
      }
    });
  }
}

customElements.define('cart-drawer', CartDrawer);

// Theme customizer functionality
if (Shopify.designMode) {
  document.addEventListener('shopify:section:select', function(event) {
    // Check if the selected section is a cart-drawer section
    // The ID pattern is: sections--{section_id}__cart-drawer
    if (event.target.id && event.target.id.includes('__cart-drawer')) {
      // Get the cart drawer element and open it (but not on cart page)
      const cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && !cartDrawer.isOnCartPage()) {
        cartDrawer.open();
      }
    } else {
      // Force close the drawer by triggering the close button
      const closeButton = document.querySelector('#shoppingCart .icon-close-popup');
      if (closeButton) {
        closeButton.click();
      }
    }
  });
}
