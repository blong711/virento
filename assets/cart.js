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
      // Force checkbox to be unchecked and ensure button state matches
      termsCheckbox.checked = false;
      termsCheckbox.removeAttribute('checked');
      
      // Set initial state to disabled
      this.updateCheckoutButtonState(false);
      
      // Add event listener for checkbox changes
      termsCheckbox.addEventListener('change', (e) => {
        this.updateCheckoutButtonState(e.target.checked);
      });
      
      // Handle browser back/forward navigation
      window.addEventListener('pageshow', (event) => {
        if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
          // User navigated back to this page
          termsCheckbox.checked = false;
          termsCheckbox.removeAttribute('checked');
          this.updateCheckoutButtonState(false);
        }
      });
      
      // Also handle focus events to catch when user returns to the page
      window.addEventListener('focus', () => {
        // Check if we're on the cart page and reset checkbox if needed
        if (document.querySelector('.tf-page-cart-main')) {
          termsCheckbox.checked = false;
          termsCheckbox.removeAttribute('checked');
          this.updateCheckoutButtonState(false);
        }
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

    // Check if this is a gift wrap item before removing
    const itemElement = document.querySelector(`[data-item-key="${itemKey}"]`);
    const isGiftWrap = itemElement && itemElement.querySelector('.name') && 
                       itemElement.querySelector('.name').textContent.toLowerCase().includes('gift wrap');

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
      if (itemElement) {
        itemElement.remove();
      }
      
      // If this was a gift wrap item, immediately uncheck the checkbox
      if (isGiftWrap) {
        const giftWrapCheckbox = document.querySelector('#checkGift');
        if (giftWrapCheckbox) {
          giftWrapCheckbox.checked = false;
        }
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
      // Immediately uncheck the gift wrap checkbox
      const giftWrapCheckbox = document.querySelector('#checkGift');
      if (giftWrapCheckbox) {
        giftWrapCheckbox.checked = false;
      }
      
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
      // Check if discount was actually applied by comparing total_discounts
      const previousTotalDiscounts = parseFloat(document.querySelector('[data-cart-total-discounts]')?.getAttribute('data-cart-total-discounts') || '0');
      const currentTotalDiscounts = cart.total_discounts || 0;
      
      // Check if the discount code was actually applied
      const hasDiscountApplied = cart.total_discounts > 0 && 
                                (cart.discount_applications && cart.discount_applications.length > 0);
      
      // Check if this is a new discount application (total discounts increased)
      const isNewDiscount = currentTotalDiscounts > previousTotalDiscounts;
      
      // Also check if the discount code exists in discount applications
      const discountCodeExists = cart.discount_applications && 
                                cart.discount_applications.some(app => 
                                  app.type === 'discount_code' && 
                                  app.code && 
                                  app.code.toLowerCase() === discountCode.toLowerCase()
                                );
      
      if (hasDiscountApplied && (isNewDiscount || discountCodeExists)) {
        // Successfully applied discount
        this.updateCartDisplay(cart);
        alert('Discount code applied successfully!');
        
        // Clear the input
        const discountInput = document.querySelector('.box-ip-discount input[name="discount"]');
        if (discountInput) discountInput.value = '';
        
        // Update the data attribute for future comparisons
        const discountElement = document.querySelector('[data-cart-total-discounts]');
        if (discountElement) {
          discountElement.setAttribute('data-cart-total-discounts', currentTotalDiscounts.toString());
        }
      } else {
        // Check if there's an error message in the response
        if (cart.errors && cart.errors.discount) {
          alert('Discount code error: ' + cart.errors.discount);
        } else if (cart.errors && cart.errors.discount_code) {
          alert('Discount code error: ' + cart.errors.discount_code);
        } else {
          alert('Invalid discount code. Please try again.');
        }
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
    
    // Check if cart was previously empty and now has items
    const wasEmpty = document.querySelector('.empty-cart')?.style.display !== 'none';
    const nowHasItems = cartData && cartData.item_count > 0;
    
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
    
    // If cart was empty and now has items, we need to restore the full cart structure
    if (wasEmpty && nowHasItems) {
      console.log('Cart transitioned from empty to non-empty - restoring full structure');
      
      // Try to fetch the complete cart page content to restore proper structure
      this.refreshCartPageContent();
      
      // Also ensure cart elements are visible
      setTimeout(() => {
        this.ensureCartElementsVisible();
      }, 100);
    } else {
      // Normal update - try to update via sections API
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
    }
    
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
        giftWrapSection.style.display = 'flex';
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
    
    // Log the current state for debugging
    console.log(`Cart state: ${cartItems.length} items, empty message visible: ${emptyCartMessage?.style.display !== 'none'}, cart content visible: ${cartContent?.style.display !== 'none'}`);
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
        element.textContent = this.formatMoney(cart.total_price) + ' ' + document.querySelector('[data-currency-code]')?.getAttribute('data-currency-code');
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
          // Add data attribute to track discount changes
          element.setAttribute('data-cart-total-discounts', cart.total_discounts.toString());
          discountUpdated = true;
          break;
        }
      }
      
      // If no discount element found, create a hidden one to track discount changes
      if (!discountUpdated) {
        let hiddenDiscountTracker = document.querySelector('[data-cart-total-discounts]');
        if (!hiddenDiscountTracker) {
          hiddenDiscountTracker = document.createElement('div');
          hiddenDiscountTracker.setAttribute('data-cart-total-discounts', '0');
          hiddenDiscountTracker.style.display = 'none';
          document.body.appendChild(hiddenDiscountTracker);
        }
        hiddenDiscountTracker.setAttribute('data-cart-total-discounts', cart.total_discounts.toString());
      }
    } else {
      // Reset discount tracker when no discounts
      const discountTracker = document.querySelector('[data-cart-total-discounts]');
      if (discountTracker) {
        discountTracker.setAttribute('data-cart-total-discounts', '0');
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
    // Format money as simple dollar amount
    return '$' + (cents / 100).toFixed(2);
  }

  updateFreeShippingProgress(cartTotal) {
    // Update free shipping progress bar
    const progressBar = document.querySelector('.tf-progress-ship .value');
    if (progressBar) {
      const threshold = window.themeSettings?.free_shipping_threshold; // Default $100
      const percentage = Math.min((cartTotal / threshold) * 100, 100);
      progressBar.style.width = percentage + '%';
      progressBar.setAttribute('data-progress', percentage);
    }
    
    // Update free shipping text
    const freeShippingText = document.querySelector('.tf-cart-head .title');
    if (freeShippingText) {
      const threshold = window.themeSettings?.free_shipping_threshold; // Default $100
      
      if (cartTotal >= threshold) {
        // Qualified for free shipping - update the entire paragraph
        freeShippingText.innerHTML = window.ShopifyTranslations?.cart.free_shipping_qualified;
      } else {
        // Need to spend more - update the entire paragraph
        const remaining = threshold - cartTotal;
        freeShippingText.innerHTML = window.ShopifyTranslations?.cart.free_shipping_remaining.replace('{remainingFormatted}', this.formatMoney(remaining));
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
        // Check if cart was previously empty and now has items
        const wasEmpty = document.querySelector('.empty-cart')?.style.display !== 'none';
        const nowHasItems = cart.item_count > 0;
        
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
        
        // If cart was empty and now has items, ensure all elements are visible
        if (wasEmpty && nowHasItems) {
          // Force a small delay to ensure DOM updates are complete
          setTimeout(() => {
            this.ensureCartElementsVisible();
          }, 50);
        }
        
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

  // Ensure cart elements are visible after transitioning from empty to non-empty
  ensureCartElementsVisible() {
    // Show cart content container
    const cartContent = document.querySelector('.tf-page-cart-main');
    if (cartContent) {
      cartContent.style.display = 'block';
    }
    
    // Show cart sidebar
    const cartSidebar = document.querySelector('.tf-page-cart-sidebar');
    if (cartSidebar) {
      cartSidebar.style.display = 'block';
    }
    
    // Show free shipping progress
    const freeShippingProgress = document.querySelector('.tf-cart-head');
    if (freeShippingProgress) {
      freeShippingProgress.style.display = 'block';
    }
    
    // Show cart table
    const cartTable = document.querySelector('.table-page-cart');
    if (cartTable) {
      cartTable.style.display = 'table';
    }
    
    // Show gift wrap section
    const giftWrapSection = document.querySelector('.check-gift');
    if (giftWrapSection) {
      giftWrapSection.style.display = 'block';
    }
    
    // Show discount section
    const discountSection = document.querySelector('.box-ip-discount');
    if (discountSection) {
      discountSection.style.display = 'flex';
    }
    
    // Show cart note section
    const cartNoteSection = document.querySelector('.cart-note');
    if (cartNoteSection) {
      cartNoteSection.style.display = 'block';
    }
    
    // Show features section
    const featuresSection = document.querySelector('.fl-iconbox');
    if (featuresSection) {
      featuresSection.style.display = 'block';
    }
    
    // Hide empty cart message
    const emptyCartMessage = document.querySelector('.empty-cart');
    if (emptyCartMessage) {
      emptyCartMessage.style.display = 'none';
    }
    
    // Hide empty cart column
    const emptyCartColumn = document.querySelector('.col-12:has(.empty-cart)') || emptyCartMessage?.closest('.col-12');
    if (emptyCartColumn) {
      emptyCartColumn.style.display = 'none';
    }
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
    
    // Update checkbox state to match cart state
    if (giftWrapCheckbox.checked !== hasGiftWrap) {
      giftWrapCheckbox.checked = hasGiftWrap;
    }
  }

  createCartItemElement(cartItem) {
    // The issue is that we need the proper cart table structure
    // Instead of trying to create elements, let's trigger a full cart refresh
    // This ensures we get the complete cart page structure from Shopify
    
    console.log('Creating cart item element - triggering full cart refresh for proper structure');
    
    // Force a complete cart refresh to get the proper table structure
    this.forceCartRefresh();
    
    // Alternative approach: try to fetch the cart page content and update it
    this.refreshCartPageContent();
  }

  // Refresh cart page content to get proper structure
  refreshCartPageContent() {
    console.log('Refreshing cart page content for proper structure');
    
    // Fetch the updated cart page content
    fetch(window.location.href)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        
        // Look for the main cart section - use dynamic selector
        const newCartSection = newDoc.querySelector('[id*="main-cart"]');
        const currentCartSection = document.querySelector('[id*="main-cart"]');
        
        if (newCartSection && currentCartSection) {
          // Update the entire cart section to get proper structure
          currentCartSection.innerHTML = newCartSection.innerHTML;
          
          // Re-initialize cart functionality
          this.reinitAfterUpdate();
          
          console.log('Cart page content refreshed successfully');
        } else {
          console.warn('Could not find cart section for refresh');
        }
      })
      .catch(error => {
        console.error('Error refreshing cart page content:', error);
        // Fallback: force cart refresh
        this.forceCartRefresh();
      });
  }

  // Alternative method: refresh specific cart sections
  refreshCartSections() {
    console.log('Refreshing cart sections for proper structure');
    
    // Try to refresh the main cart section
    fetch('/?sections=main-cart')
      .then(response => response.json())
      .then(sections => {
        if (sections['main-cart']) {
          const parser = new DOMParser();
          const newDoc = parser.parseFromString(sections['main-cart'], 'text/html');
          
          // Update cart main content
          const newCartMain = newDoc.querySelector('.tf-page-cart-main');
          const currentCartMain = document.querySelector('.tf-page-cart-main');
          if (newCartMain && currentCartMain) {
            currentCartMain.innerHTML = newCartMain.innerHTML;
          }
          
          // Update cart sidebar
          const newCartSidebar = newDoc.querySelector('.tf-page-cart-sidebar');
          const currentCartSidebar = document.querySelector('.tf-page-cart-sidebar');
          if (newCartSidebar && currentCartSidebar) {
            currentCartSidebar.innerHTML = newCartSidebar.innerHTML;
          }
          
          // Update free shipping progress
          const newFreeShipping = newDoc.querySelector('.tf-cart-head');
          const currentFreeShipping = document.querySelector('.tf-cart-head');
          if (newFreeShipping && currentFreeShipping) {
            currentFreeShipping.innerHTML = newFreeShipping.innerHTML;
          }
          
          // Re-initialize functionality
          this.reinitAfterUpdate();
          
          console.log('Cart sections refreshed successfully');
        } else {
          console.warn('No main-cart section found in response');
        }
      })
      .catch(error => {
        console.error('Error refreshing cart sections:', error);
        // Fallback: force cart refresh
        this.forceCartRefresh();
      });
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