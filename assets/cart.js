(function() {
  'use strict';
  
  class MainCart {
      constructor() {
    this.isRemovingGiftWrap = false; // Flag to prevent checkbox updates during removal
    this.init();
  }

  init() {
    // Set up quantity increase/decrease functionality
    this.setupQuantityButtons();
    
    // Set up remove item functionality
    this.setupRemoveButtons();
    
    // Set up gift wrap functionality
    this.setupGiftWrap();
    
    // Set up discount code functionality
    this.setupDiscountCode();
    
    // Set up cart note functionality
    this.setupCartNote();
    
    // Set up terms checkbox functionality
    this.setupTermsCheckbox();
    
    // Set up shipping calculator functionality
    this.setupShippingCalculator();
    
    // Check empty cart state on initialization
    this.checkEmptyCart();
  }

  setupQuantityButtons() {
    // Quantity increase/decrease functionality
    document.querySelectorAll('.btn-increase').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const itemKey = this.getItemKey(btn);
        const input = this.getQuantityInput(btn);
        if (input) {
          input.value = parseInt(input.value) + 1;
          this.updateCartItem(itemKey, input.value);
        }
      });
    });
    
    document.querySelectorAll('.btn-decrease').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const itemKey = this.getItemKey(btn);
        const input = this.getQuantityInput(btn);
        if (input && parseInt(input.value) > 1) {
          input.value = parseInt(input.value) - 1;
          this.updateCartItem(itemKey, input.value);
        } else if (input && parseInt(input.value) === 1) {
          // Remove item if quantity becomes 0
          this.removeCartItem(itemKey);
        }
      });
    });

    // Handle direct input changes
    document.querySelectorAll('.quantity-product').forEach(input => {
      input.addEventListener('change', (e) => {
        const itemKey = this.getItemKey(input);
        const quantity = parseInt(input.value);
        if (quantity <= 0) {
          this.removeCartItem(itemKey);
        } else {
          this.updateCartItem(itemKey, quantity);
        }
      });
    });
  }

  setupRemoveButtons() {
    document.querySelectorAll('.remove-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const itemKey = this.getItemKey(btn);
        this.removeCartItem(itemKey);
      });
    });
  }

  setupGiftWrap() {
    const giftWrapCheckbox = document.querySelector('#checkGift');
    if (giftWrapCheckbox) {
      giftWrapCheckbox.addEventListener('change', (e) => {
        this.handleGiftWrapChange(e.target.checked);
      });
      
      // Check if gift wrap already exists in cart and update checkbox state
      this.updateGiftWrapCheckboxState();
    }
  }

  setupDiscountCode() {
    const discountForm = document.querySelector('.box-ip-discount');
    if (discountForm) {
      const applyButton = discountForm.querySelector('.tf-btn');
      const discountInput = discountForm.querySelector('input[name="discount"]');
      
      if (applyButton && discountInput) {
        applyButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.applyDiscount(discountInput.value.trim());
        });
      }
    }
  }

  setupCartNote() {
    const noteTextarea = document.querySelector('#note');
    if (noteTextarea) {
      noteTextarea.addEventListener('blur', (e) => {
        this.updateCartNote(e.target.value);
      });
    }
  }

  setupTermsCheckbox() {
    const termsCheckbox = document.querySelector('#check-agree');
    const checkoutButton = document.querySelector('button[name="checkout"]');
    
    if (termsCheckbox && checkoutButton) {
      // Set initial state
      this.updateCheckoutButtonState(termsCheckbox.checked);
      
      // Add event listener for checkbox changes
      termsCheckbox.addEventListener('change', (e) => {
        this.updateCheckoutButtonState(e.target.checked);
      });
    }
  }

  updateCheckoutButtonState(isChecked) {
    const checkoutButton = document.querySelector('button[name="checkout"]');
    if (checkoutButton) {
      if (isChecked) {
        checkoutButton.disabled = false;
        checkoutButton.classList.remove('btn-disabled');
        checkoutButton.classList.add('btn-dark2');
      } else {
        checkoutButton.disabled = true;
        checkoutButton.classList.remove('btn-dark2');
        checkoutButton.classList.add('btn-disabled');
      }
    }
  }

  getItemKey(element) {
    return element.getAttribute('data-item-key');
  }

  getQuantityInput(element) {
    const cartItem = element.closest('.tf-cart-item');
    if (cartItem) {
      return cartItem.querySelector('.quantity-product');
    }
    return null;
  }

  updateCartItem(itemKey, quantity) {
    if (!itemKey) return;

    const formData = new FormData();
    formData.append('id', itemKey);
    formData.append('quantity', quantity);

    // Show loading state
    this.showLoadingState(itemKey);

    fetch('/cart/change.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(cart => {
      this.updateCartDisplay(cart);
    })
    .catch(error => {
      console.error('Error updating cart:', error);
      this.hideLoadingState(itemKey);
    });
  }

  removeCartItem(itemKey) {
    if (!itemKey) return;

    const formData = new FormData();
    formData.append('id', itemKey);
    formData.append('quantity', 0);

    // Show loading state
    this.showLoadingState(itemKey);

    fetch('/cart/change.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(cart => {
      // Immediately remove the item from display
      const itemElement = document.querySelector(`[data-item-key="${itemKey}"]`);
      if (itemElement) {
        itemElement.remove();
      }
      
      // Update the rest of the cart display
      this.updateCartDisplay(cart);
    })
    .catch(error => {
      console.error('Error removing item:', error);
      this.hideLoadingState(itemKey);
    });
  }

  handleGiftWrapChange(isChecked) {
    if (isChecked) {
      // Add gift wrap to cart
      this.addGiftWrap();
    } else {
      // Remove gift wrap from cart
      this.removeGiftWrap();
    }
  }

  addGiftWrap() {
    const giftWrapProductId = document.querySelector('input[name="gift_wrap_product_id"]');
    if (!giftWrapProductId || !giftWrapProductId.value) {
      console.error('No gift wrap product ID found');
      return;
    }

    const formData = new FormData();
    formData.append('id', giftWrapProductId.value);
    formData.append('quantity', 1);

    fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(result => {
      if (result.status) {
        console.error('Error adding gift wrap:', result.description);
        // Uncheck the checkbox if there was an error
        const checkbox = document.querySelector('#checkGift');
        if (checkbox) checkbox.checked = false;
      } else {
        // Force a complete cart refresh to show the new gift wrap item
        this.forceCartRefresh();
      }
    })
    .catch(error => {
      console.error('Error adding gift wrap:', error);
      // Uncheck the checkbox if there was an error
      const checkbox = document.querySelector('#checkGift');
      if (checkbox) checkbox.checked = false;
    });
  }

  removeGiftWrap() {
    // Set flag to prevent checkbox updates during removal
    this.isRemovingGiftWrap = true;
    
    // Find gift wrap item in cart and remove it
    const cartItems = document.querySelectorAll('.tf-cart-item');
    let giftWrapRemoved = false;
    
    cartItems.forEach(item => {
      const productTitle = item.querySelector('.name');
      if (productTitle && productTitle.textContent.toLowerCase().includes('gift wrap')) {
        const itemKey = this.getItemKey(item);
        if (itemKey) {
          // Use the existing removeCartItem method which already handles comprehensive updates
          this.removeCartItem(itemKey);
          giftWrapRemoved = true;
        }
      }
    });
    
    if (giftWrapRemoved) {
      // Force a complete cart refresh to ensure the gift wrap item is removed from display
      this.forceCartRefresh();
    } else {
      // If no gift wrap was found, just update the checkbox state
      this.updateGiftWrapCheckboxState();
      // Reset the flag
      this.isRemovingGiftWrap = false;
    }
  }

  applyDiscount(discountCode) {
    if (!discountCode) {
      alert('Please enter a discount code.');
      return;
    }

    const formData = new FormData();
    formData.append('discount', discountCode);

    // Show loading state
    const applyButton = document.querySelector('.box-ip-discount .tf-btn');
    const originalText = applyButton.textContent;
    applyButton.textContent = 'Applying...';
    applyButton.disabled = true;

    fetch('/cart/update.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(cart => {
      if (cart.token) {
        // Successfully applied discount
        this.updateCartDisplay(cart);
        alert('Discount code applied successfully!');
        
        // Clear the input
        const discountInput = document.querySelector('.box-ip-discount input[name="discount"]');
        if (discountInput) discountInput.value = '';
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
      applyButton.textContent = originalText;
      applyButton.disabled = false;
    });
  }

  updateCartNote(note) {
    const formData = new FormData();
    formData.append('note', note);

    fetch('/cart/update.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(cart => {
      // Note updated successfully
    })
    .catch(error => {
      console.error('Error updating note:', error);
    });
  }

  updateCartDisplay(cartData) {
    // Set a timeout to hide loading states if update takes too long
    const loadingTimeout = setTimeout(() => {
      this.hideAllLoadingStates();
    }, 10000); // 10 second timeout
    
    // First, try to update cart totals directly from the cart data
    if (cartData && cartData.token) {
      this.updateCartTotals(cartData);
      this.updateCartCount(cartData.item_count);
      this.updateFreeShippingProgress(cartData.total_price);
      
      // Also update cart items display if we have items
      if (cartData.items && cartData.items.length > 0) {
        this.updateCartItemsDisplay(cartData.items);
      }
    }
    
    // Then try to update the full cart display via sections API
    fetch('/?sections=main-cart')
      .then(response => response.json())
      .then(sections => {
        if (sections['main-cart']) {
          try {
            // Get the full section HTML
            const fullSectionHTML = sections['main-cart'];
            
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(fullSectionHTML, 'text/html');
            
            // Check if the sections API returned meaningful content
            const newCartMain = newDoc.querySelector('.tf-page-cart-main');
            const newCartSidebar = newDoc.querySelector('.tf-page-cart-sidebar');
            const newCartItems = newDoc.querySelectorAll('.tf-cart-item');
            const newFreeShipping = newDoc.querySelector('.tf-cart-head');
            
            // Check if sections API returned actual cart content
            const hasCartContent = newCartItems.length > 0 || 
                                 (newCartMain && newCartMain.innerHTML.trim() && newCartMain.innerHTML.trim() !== '') ||
                                 (newCartSidebar && newCartSidebar.innerHTML.trim() && newCartSidebar.innerHTML.trim() !== '');
            
            if (hasCartContent) {
              // Update cart main content if it exists and has content
              if (newCartMain && newCartMain.innerHTML.trim()) {
                const currentCartMain = document.querySelector('.tf-page-cart-main');
                if (currentCartMain) {
                  currentCartMain.innerHTML = newCartMain.innerHTML;
                }
              }
              
              // Update cart sidebar if it exists and has content
              if (newCartSidebar && newCartSidebar.innerHTML.trim()) {
                const currentCartSidebar = document.querySelector('.tf-page-cart-sidebar');
                if (currentCartSidebar) {
                  currentCartSidebar.innerHTML = newCartSidebar.innerHTML;
                }
              }
              
              // Update free shipping progress if it exists
              if (newFreeShipping) {
                const currentFreeShipping = document.querySelector('.tf-cart-head');
                if (currentFreeShipping) {
                  currentFreeShipping.innerHTML = newFreeShipping.innerHTML;
                }
              }
              
              // Re-initialize functionality after content update
              this.reinitAfterUpdate();
            }
            
            // Check empty cart state after update
            this.checkEmptyCart();
            
            // Clear the loading timeout and hide loading states
            clearTimeout(loadingTimeout);
            this.hideAllLoadingStates();
            
          } catch (error) {
            console.error('Error parsing or updating cart content:', error);
            // Clear timeout and hide loading states even if update failed
            clearTimeout(loadingTimeout);
            this.hideAllLoadingStates();
          }
        } else {
          // Clear timeout and hide loading states
          clearTimeout(loadingTimeout);
          this.hideAllLoadingStates();
        }
      })
      .catch(error => {
        console.error('Error updating cart display via sections API:', error);
        // Clear timeout and hide loading states on error
        clearTimeout(loadingTimeout);
        this.hideAllLoadingStates();
      });
    
    // Trigger cart count update event
    document.dispatchEvent(new CustomEvent('cart:updated'));
  }



  showLoadingState(itemKey) {
    const cartItem = document.querySelector(`[data-item-key="${itemKey}"]`);
    if (cartItem) {
      cartItem.style.opacity = '0.6';
      cartItem.style.pointerEvents = 'none';
    }
  }

  hideLoadingState(itemKey) {
    const cartItem = document.querySelector(`[data-item-key="${itemKey}"]`);
    if (cartItem) {
      cartItem.style.opacity = '1';
      cartItem.style.pointerEvents = 'auto';
    }
  }

  checkEmptyCart() {
    const cartItems = document.querySelectorAll('.tf-cart-item');
    const emptyCartMessage = document.querySelector('.empty-cart');
    const emptyCartColumn = document.querySelector('.col-12:has(.empty-cart)') || emptyCartMessage?.closest('.col-12');
    const cartContent = document.querySelector('.tf-page-cart-main');
    const cartSidebar = document.querySelector('.tf-page-cart-sidebar');
    const freeShippingProgress = document.querySelector('.tf-cart-head');
    
    // Get all cart-related elements that should be hidden when cart is empty
    const cartTable = document.querySelector('.table-page-cart');
    const giftWrapSection = document.querySelector('.check-gift');
    const discountSection = document.querySelector('.box-ip-discount');
    const cartNoteSection = document.querySelector('.cart-note');
    const featuresSection = document.querySelector('.fl-iconbox');
    
    if (cartItems.length === 0) {
      // Show empty cart message (it's already in the HTML structure)
      if (emptyCartMessage) {
        emptyCartMessage.style.display = 'block';
      }
      
      // Show the empty cart column by removing display: none
      if (emptyCartColumn) {
        emptyCartColumn.style.removeProperty('display');
      }
      
      // Hide all cart-related elements when cart is empty
      if (cartSidebar) {
        cartSidebar.style.display = 'none';
      }
      if (freeShippingProgress) {
        freeShippingProgress.style.display = 'none';
      }
      if (cartTable) {
        cartTable.style.display = 'none';
      }
      if (giftWrapSection) {
        giftWrapSection.style.display = 'none';
      }
      if (discountSection) {
        discountSection.style.display = 'none';
      }
      if (cartNoteSection) {
        cartNoteSection.style.display = 'none';
      }
      if (featuresSection) {
        featuresSection.style.display = 'none';
      }
      
      // Hide the main cart content container to show only the empty cart message
      if (cartContent) {
        cartContent.style.display = 'none';
      }
    } else {
      // Hide empty cart message
      if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
      }
      
      // Hide the empty cart column by setting display: none
      if (emptyCartColumn) {
        emptyCartColumn.style.display = 'none';
      }
      
      // Show all cart-related elements when cart has items
      if (cartContent) {
        cartContent.style.display = 'block';
      }
      if (cartSidebar) {
        cartSidebar.style.display = 'block';
      }
      if (freeShippingProgress) {
        freeShippingProgress.style.display = 'block';
      }
      if (cartTable) {
        cartTable.style.display = 'table';
      }
      if (giftWrapSection) {
        giftWrapSection.style.display = 'block';
      }
      if (discountSection) {
        discountSection.style.display = 'flex';
      }
      if (cartNoteSection) {
        cartNoteSection.style.display = 'block';
      }
      if (featuresSection) {
        featuresSection.style.display = 'block';
      }
    }
  }



  reinitAfterUpdate() {
    // Only re-initialize the essential functionality after content update
    // Don't call the full init() method as it might interfere with existing elements
    
    // Re-setup quantity buttons for new cart items
    this.setupQuantityButtons();
    
    // Re-setup remove buttons for new cart items
    this.setupRemoveButtons();
    
    // Re-setup gift wrap functionality
    this.setupGiftWrap();
    
    // Re-setup discount code functionality
    this.setupDiscountCode();
    
    // Re-setup cart note functionality
    this.setupCartNote();
    
    // Re-setup terms checkbox functionality
    this.setupTermsCheckbox();
    
    // Check empty cart state after re-initialization
    this.checkEmptyCart();
  }

  updateCartCount(itemCount) {
    // Update cart count in header if it exists
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = itemCount;
    }
  }

  updateCartTotals(cart) {
    // Update cart totals if they exist - try multiple selectors
    const subtotalSelectors = ['.total', '.cart-subtotal', '.subtotal', '[data-cart-subtotal]'];
    let subtotalUpdated = false;
    
    for (const selector of subtotalSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = this.formatMoney(cart.total_price);
        subtotalUpdated = true;
        break;
      }
    }
    
    // Update discounts if they exist
    if (cart.total_discounts > 0) {
      const discountSelectors = ['.discounts span:last-child', '.cart-discounts', '.discount-amount'];
      let discountUpdated = false;
      
      for (const selector of discountSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          element.textContent = '-' + this.formatMoney(cart.total_discounts);
          discountUpdated = true;
          break;
        }
      }
    }
    
    // Update cart item quantities if they exist
    this.updateCartItemQuantities(cart);
    
    // Update free shipping progress
    this.updateFreeShippingProgress(cart.total_price);
    
    // Check empty cart state after updating totals
    this.checkEmptyCart();
  }

  updateCartItemQuantities(cart) {
    // Update individual cart item quantities and prices
    if (cart.items && cart.items.length > 0) {
      cart.items.forEach(cartItem => {
        // Find the cart item element by product ID or variant ID
        const itemElement = document.querySelector(`[data-item-key="${cartItem.key}"]`);
        if (itemElement) {
          // Update quantity display
          const quantityElement = itemElement.querySelector('.quantity-product');
          if (quantityElement) {
            quantityElement.value = cartItem.quantity;
          }
          
          // Update item price - try multiple selectors
          const priceSelectors = ['.price', '.item-price', '.cart-item-price', '.total-price', '.cart-total', '.total-price.text-md.fw-medium'];
          let priceUpdated = false;
          
          for (const selector of priceSelectors) {
            const priceElement = itemElement.querySelector(selector);
            if (priceElement) {
              priceElement.textContent = this.formatMoney(cartItem.final_line_price);
              priceUpdated = true;
              break;
            }
          }
        }
      });
    }
  }

  updateCartItemsDisplay(cartItems) {
    // Update the visual display of cart items
    
    // Get all current cart item elements
    const currentCartItems = document.querySelectorAll('.tf-cart-item');
    const currentItemKeys = Array.from(currentCartItems).map(item => this.getItemKey(item));
    
    // Remove cart items that are no longer in the cart
    currentItemKeys.forEach(itemKey => {
      if (itemKey && !cartItems.find(item => item.key === itemKey)) {
        const itemElement = document.querySelector(`[data-item-key="${itemKey}"]`);
        if (itemElement) {
          itemElement.remove();
        }
      }
    });
    
    // Update existing items and add new ones
    cartItems.forEach(cartItem => {
      // Find the cart item element by product ID or variant ID
      const itemElement = document.querySelector(`[data-item-key="${cartItem.key}"]`);
      if (itemElement) {
        // Update quantity display
        const quantityElement = itemElement.querySelector('.quantity-product');
        if (quantityElement) {
          quantityElement.value = cartItem.quantity;
        }
        
        // Update variant title visibility/text
        const variantEl = itemElement.querySelector('.variant-title, .variant, .variants');
        if (variantEl) {
          if (cartItem.variant_title && cartItem.variant_title !== 'Default Title' && !(cartItem.product_title || '').toLowerCase().includes('gift wrap')) {
            variantEl.textContent = cartItem.variant_title;
            variantEl.style.display = 'block';
          } else {
            variantEl.style.display = 'none';
          }
        }
        
        // Update item price - try multiple selectors
        const priceSelectors = ['.price', '.item-price', '.cart-item-price', '.total-price', '.cart-total', '.total-price.text-md.fw-medium'];
        let priceUpdated = false;
        
        for (const selector of priceSelectors) {
          const priceElement = itemElement.querySelector(selector);
          if (priceElement) {
            priceElement.textContent = this.formatMoney(cartItem.final_line_price);
            priceUpdated = true;
            break;
          }
        }
        
        // Update item total
        const totalElement = itemElement.querySelector('.item-total, .line-total');
        if (totalElement) {
          totalElement.textContent = this.formatMoney(cartItem.final_line_price);
        }
        
        // Update item image if it exists
        if (cartItem.image) {
          const imageElement = itemElement.querySelector('.cart-item-image img');
          if (imageElement) {
            imageElement.src = cartItem.image;
            imageElement.alt = cartItem.product_title;
          }
        }
      } else {
        // For new items (like gift wrap), create the HTML element dynamically
        this.createCartItemElement(cartItem);
      }
    });
    
    // Check empty cart state after updating cart items
    this.checkEmptyCart();
  }

  formatMoney(cents) {
    // Format money with currency code if enabled
    const amount = '$' + (cents / 100).toFixed(2);
    
    // Check if currency code should be displayed
    // Look for the currency setting in the page
    const currencyEnabled = document.querySelector('[data-currency-enabled]')?.getAttribute('data-currency-enabled') === 'true';
    const currencyCode = document.querySelector('[data-currency-code]')?.getAttribute('data-currency-code');
    
    if (currencyEnabled && currencyCode) {
      return amount + ' ' + currencyCode;
    }
    
    return amount;
  }

  updateFreeShippingProgress(cartTotal) {
    // Update free shipping progress bar
    const progressBar = document.querySelector('.tf-progress-ship .value');
    if (progressBar) {
      const threshold = window.themeSettings?.free_shipping_threshold || 10000; // Default $100
      const percentage = Math.min((cartTotal / threshold) * 100, 100);
      progressBar.style.width = percentage + '%';
      progressBar.setAttribute('data-progress', percentage);
    }
    
    // Update free shipping text
    const freeShippingText = document.querySelector('.tf-cart-head .title');
    if (freeShippingText) {
      const threshold = window.themeSettings?.free_shipping_threshold || 10000; // Default $100
      
      if (cartTotal >= threshold) {
        // Qualified for free shipping - update the entire paragraph
        freeShippingText.innerHTML = 'You\'ve qualified for <span class="fw-medium">Free Shipping!</span>';
      } else {
        // Need to spend more - update the entire paragraph
        const remaining = threshold - cartTotal;
        freeShippingText.innerHTML = `Spend <span class="fw-medium">${this.formatMoney(remaining)}</span> more to get <span class="fw-medium">Free Shipping</span>`;
      }
    }
  }



  hideAllLoadingStates() {
    // Hide loading states for all cart items
    const cartItems = document.querySelectorAll('.tf-cart-item');
    cartItems.forEach(item => {
      const itemKey = this.getItemKey(item);
      if (itemKey) {
        this.hideLoadingState(itemKey);
      }
    });
  }

  forceCartRefresh() {
    // Fetch the current cart data
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        // Update cart totals and counts
        this.updateCartTotals(cart);
        this.updateCartCount(cart.item_count);
        this.updateFreeShippingProgress(cart.total_price);
        
        // Update cart items display with the new cart data
        if (cart.items && cart.items.length > 0) {
          this.updateCartItemsDisplay(cart.items);
        }
        
        // Check empty cart state
        this.checkEmptyCart();
        
        // Update gift wrap checkbox state with a small delay to ensure cart is fully updated
        setTimeout(() => {
          this.updateGiftWrapCheckboxState();
          // Reset the removal flag after checkbox state update
          this.isRemovingGiftWrap = false;
        }, 100);
        
        // Trigger cart update event
        document.dispatchEvent(new CustomEvent('cart:updated'));
      })
      .catch(error => {
        console.error('Error during cart refresh:', error);
        
        // Don't reload the page, just continue with the cart data update
        this.checkEmptyCart();
        document.dispatchEvent(new CustomEvent('cart:updated'));
      });
  }

  updateGiftWrapCheckboxState() {
    // Check if gift wrap already exists in cart and update checkbox state
    const giftWrapCheckbox = document.querySelector('#checkGift');
    if (!giftWrapCheckbox) return;
    
    // Don't update checkbox if we're in the middle of removing gift wrap
    if (this.isRemovingGiftWrap) {
      return;
    }
    
    // Check if there's a gift wrap product in the cart
    const cartItems = document.querySelectorAll('.tf-cart-item');
    let hasGiftWrap = false;
    
    cartItems.forEach(item => {
      const productTitle = item.querySelector('.name');
      if (productTitle && productTitle.textContent.toLowerCase().includes('gift wrap')) {
        hasGiftWrap = true;
      }
    });
    
    // Only update checkbox if the state is different to avoid interfering with user interactions
    if (giftWrapCheckbox.checked !== hasGiftWrap) {
      // Add a small delay to prevent immediate re-checking during removal operations
      setTimeout(() => {
        if (giftWrapCheckbox.checked !== hasGiftWrap && !this.isRemovingGiftWrap) {
          giftWrapCheckbox.checked = hasGiftWrap;
        }
      }, 50);
    }
  }

  createCartItemElement(cartItem) {
    
    // Find the cart items container - look for the actual container that holds cart items
    let cartItemsContainer = document.querySelector('.tf-cart-items') || 
                            document.querySelector('.cart-items') ||
                            document.querySelector('.tf-page-cart-main .cart-items') ||
                            document.querySelector('.tf-page-cart-main');
    
    // If still not found, try to find any element that contains cart items
    if (!cartItemsContainer) {
      const cartItems = document.querySelectorAll('.tf-cart-item');
      if (cartItems.length > 0) {
        cartItemsContainer = cartItems[0].parentElement;
      }
    }
    
    // Since cart items are <tr> elements, we need to find the <tbody> or <table> container
    if (cartItemsContainer && cartItemsContainer.tagName === 'DIV') {
      // Look for the table that contains the cart items
      const tableContainer = cartItemsContainer.querySelector('table') || 
                            cartItemsContainer.querySelector('tbody') ||
                            cartItemsContainer.querySelector('thead');
      
      if (tableContainer) {
        cartItemsContainer = tableContainer;
      } else {
        // If no table found, look for tbody specifically
        const tbody = document.querySelector('tbody');
        if (tbody) {
          cartItemsContainer = tbody;
        }
      }
    }
    
    if (!cartItemsContainer) {
      return;
    }
    
    // Try to clone an existing cart item to maintain the exact structure
    const existingCartItem = document.querySelector('.tf-cart-item');
    
    if (existingCartItem) {
      const newCartItem = existingCartItem.cloneNode(true);
      
      // Update the cloned item with new data
      newCartItem.setAttribute('data-item-key', cartItem.key);
      
      // Clear any existing variant information that might have been copied
      const variantElements = newCartItem.querySelectorAll('.variant-title, .variant, .variants');
      variantElements.forEach(element => {
        element.style.display = 'none';
      });
      
      // Update image
      const imgElement = newCartItem.querySelector('img');
      if (imgElement) {
        imgElement.src = cartItem.image || '/assets/no-image.png';
        imgElement.alt = cartItem.product_title;
      }
      
      // Update product name
      const nameElement = newCartItem.querySelector('.name');
      if (nameElement) {
        nameElement.textContent = cartItem.product_title;
      }
      
      // Update variant title if it exists - only show for actual product variants, not gift wrap
      const variantElement = newCartItem.querySelector('.variant-title, .variant, .variants');
      if (variantElement) {
        if (cartItem.variant_title && cartItem.variant_title !== 'Default Title' && !(cartItem.product_title || '').toLowerCase().includes('gift wrap')) {
          variantElement.textContent = cartItem.variant_title;
          variantElement.style.display = 'block';
        } else {
          // Hide variant info for gift wrap or products without variants
          variantElement.style.display = 'none';
        }
      }
      
      // Update price - ensure it's wrapped in span with class "cart-price text-md fw-medium"
      const priceSelectors = [
        '.tf-cart-item_price', '.price', '.item-price', '.cart-item-price', '.product-price', '.variant-price',
        '.price-regular', '.price-sale', '.price-compare', '.price-current',
        '[data-price]', '[data-item-price]', '.cart-item-price'
      ];
      
      let priceUpdated = false;
      for (const selector of priceSelectors) {
        const priceElements = newCartItem.querySelectorAll(selector);
        if (priceElements.length > 0) {
          priceElements.forEach((element, index) => {
            // Always replace the content with properly wrapped price span
            const priceSpan = document.createElement('span');
            priceSpan.className = 'cart-price text-md fw-medium';
            priceSpan.textContent = this.formatMoney(cartItem.final_price);
            
            // Clear the element and add the new span
            element.innerHTML = '';
            element.appendChild(priceSpan);
          });
          priceUpdated = true;
        }
      }
      
      if (!priceUpdated) {
        // Search for any element that might contain price information
        const allElements = newCartItem.querySelectorAll('*');
        const potentialPriceElements = Array.from(allElements).filter(el => {
          const text = el.textContent.trim();
          return text.includes('$') || text.includes('€') || text.includes('£') || 
                 el.className.toLowerCase().includes('price') ||
                 el.getAttribute('data-price') !== null;
        });
        
        potentialPriceElements.forEach((element, index) => {
          if (element.textContent.trim().match(/[\$€£]\d+\.?\d*/)) {
            // Replace with properly wrapped price span
            const priceSpan = document.createElement('span');
            priceSpan.className = 'cart-price text-md fw-medium';
            priceSpan.textContent = this.formatMoney(cartItem.final_price);
            
            // Clear the element and add the new span
            element.innerHTML = '';
            element.appendChild(priceSpan);
          }
        });
      }
      
      // Special handling for the price cell - ensure it has the proper span wrapper
      const priceCell = newCartItem.querySelector('.tf-cart-item_price');
      if (priceCell) {
        // Check if it already has the cart-price span
        const existingPriceSpan = priceCell.querySelector('.cart-price.text-md.fw-medium');
        if (!existingPriceSpan) {
          // Create the proper price span wrapper
          const priceSpan = document.createElement('span');
          priceSpan.className = 'cart-price text-md fw-medium';
          priceSpan.textContent = this.formatMoney(cartItem.final_price);
          
          // Clear the cell and add the new span
          priceCell.innerHTML = '';
          priceCell.appendChild(priceSpan);
        } else {
          existingPriceSpan.textContent = this.formatMoney(cartItem.final_price);
        }
      }
      
      // Update quantity
      const quantityElement = newCartItem.querySelector('.quantity-product');
      if (quantityElement) {
        quantityElement.value = cartItem.quantity;
        quantityElement.setAttribute('data-item-key', cartItem.key);
      }
      
      // Update total price - be more thorough in finding and updating ALL total-related elements
      const totalSelectors = [
        '.total-price', '.cart-total', '.item-total', '.line-total', '.subtotal',
        '.cart-item-total', '.product-total', '.variant-total',
        '[data-total]', '[data-line-total]', '.cart-total-price'
      ];
      
      let totalUpdated = false;
      for (const selector of totalSelectors) {
        const totalElements = newCartItem.querySelectorAll(selector);
        if (totalElements.length > 0) {
          totalElements.forEach(element => {
            element.textContent = this.formatMoney(cartItem.final_line_price);
          });
          totalUpdated = true;
        }
      }
      
      if (!totalUpdated) {
        // Search for any element that might contain total information
        const allElements = newCartItem.querySelectorAll('*');
        const potentialTotalElements = Array.from(allElements).filter(el => {
          const text = el.textContent.trim();
          return text.includes('$') || text.includes('€') || text.includes('£') ||
                 el.className.toLowerCase().includes('total') ||
                 el.getAttribute('data-total') !== null;
        });
        
        potentialTotalElements.forEach(element => {
          if (element.textContent.trim().match(/[\$€£]\d+\.?\d*/)) {
            element.textContent = this.formatMoney(cartItem.final_line_price);
          }
        });
      }
      
      // Update data attributes for buttons
      const buttons = newCartItem.querySelectorAll('.btn-increase, .btn-decrease, .remove-cart');
      buttons.forEach(button => {
        button.setAttribute('data-item-key', cartItem.key);
      });
      
      // Add the new item to the top of the cart table
      // Insert at the beginning (top) instead of appending at the end
      if (cartItemsContainer.firstChild) {
        cartItemsContainer.insertBefore(newCartItem, cartItemsContainer.firstChild);
      } else {
        cartItemsContainer.appendChild(newCartItem);
      }
      
      // Re-initialize functionality for the new item
      this.setupQuantityButtons();
      this.setupRemoveButtons();
    } else {
      // Fallback: create a basic cart item HTML structure
      const cartItemHTML = `
        <div class="tf-cart-item" data-item-key="${cartItem.key}">
          <div class="cart-item-image">
            <img src="${cartItem.image || '/assets/no-image.png'}" alt="${cartItem.product_title}" />
          </div>
          <div class="cart-item-details">
            <div class="name">${cartItem.product_title}</div>
            <div class="variant-title">${cartItem.variant_title || ''}</div>
            <div class="price">
              <span class="cart-price text-md fw-medium">${this.formatMoney(cartItem.final_price)}</span>
            </div>
          </div>
          <div class="cart-item-quantity">
            <button class="btn-decrease" data-item-key="${cartItem.key}">-</button>
            <input type="number" class="quantity-product" value="${cartItem.quantity}" min="1" data-item-key="${cartItem.key}" />
            <button class="btn-increase" data-item-key="${cartItem.key}">+</button>
          </div>
          <div class="cart-item-total">
            <span class="total-price">${this.formatMoney(cartItem.final_line_price)}</span>
          </div>
          <div class="cart-item-remove">
            <button class="remove-cart" data-item-key="${cartItem.key}">×</button>
          </div>
        </div>
      `;
      
      // Create the DOM element
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cartItemHTML.trim();
      const newCartItem = tempDiv.firstChild;
      
      // Add the new item to the top of the cart table
      if (cartItemsContainer.firstChild) {
        cartItemsContainer.insertBefore(newCartItem, cartItemsContainer.firstChild);
      } else {
        cartItemsContainer.appendChild(newCartItem);
      }
      
      // Re-initialize functionality for the new item
      this.setupQuantityButtons();
      this.setupRemoveButtons();
    }
  }

  setupShippingCalculator() {
    const shippingForm = document.querySelector('[data-shipping-calculator]');
    if (shippingForm) {
      shippingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculateShipping(shippingForm);
      });

      // Set up country/province dependency
      const countrySelect = shippingForm.querySelector('[data-shipping-country]');
      const provinceField = shippingForm.querySelector('#shipping-province-field-main');
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

  toggleProvinceField(countryCode, provinceField, provinceSelect) {
    if (!countryCode || countryCode === '') {
      provinceField.style.display = 'none';
      return;
    }

    // Get the selected country option to access its data-provinces attribute
    const countryOption = provinceSelect.closest('form').querySelector('[data-shipping-country] option[value="' + countryCode + '"]');
    if (!countryOption) return;

    const provincesData = countryOption.getAttribute('data-provinces');
    if (!provincesData) {
      provinceField.style.display = 'none';
      return;
    }

    try {
      const provinces = JSON.parse(provincesData);
      if (provinces && provinces.length > 0) {
        // Clear existing options
        provinceSelect.innerHTML = '';
        
        // Add new options
        provinces.forEach(([value, text]) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = text;
          provinceSelect.appendChild(option);
        });
        
        provinceField.style.display = 'block';
      } else {
        provinceField.style.display = 'none';
      }
    } catch (error) {
      console.error('Error parsing provinces data:', error);
      provinceField.style.display = 'none';
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

    // Fetch shipping rates
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


}

// Initialize cart functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the cart page
  if (document.querySelector('.tf-page-cart-main')) {
    // Create and initialize the cart
    const cart = new window.MainCart();
    
    // Make it available globally for debugging
    window.mainCart = cart;
    
    // Force an immediate check of the empty cart state
    setTimeout(() => {
      cart.checkEmptyCart();
    }, 100);
  }
});

// Handle cart updates from other parts of the site
document.addEventListener('cart:updated', function() {
  // Update cart count in header if it exists
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    // Fetch updated cart count
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        cartCount.textContent = cart.item_count;
      })
      .catch(error => {
        console.error('Error updating cart count:', error);
      });
  }
});

  // Export for use in other scripts if needed
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainCart;
  }
  
  // Make MainCart available globally
  window.MainCart = MainCart;
})();