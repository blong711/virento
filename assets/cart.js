(function() {
  'use strict';
  
  class MainCart {
    constructor() {
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
        this.updateCartDisplay(result);
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
    // Find gift wrap item in cart and remove it
    const cartItems = document.querySelectorAll('.tf-cart-item');
    cartItems.forEach(item => {
      const productTitle = item.querySelector('.name');
      if (productTitle && productTitle.textContent.toLowerCase().includes('gift wrap')) {
        const itemKey = this.getItemKey(item);
        if (itemKey) {
          this.removeCartItem(itemKey);
        }

      }
    });
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
      console.log('Cart note updated');
    })
    .catch(error => {
      console.error('Error updating note:', error);
    });
  }

  updateCartDisplay(cartData) {
    console.log('Updating cart display with:', cartData);
    
    // Update cart contents without full page reload
    fetch('/?sections=main-cart')
      .then(response => response.json())
      .then(sections => {
        console.log('Fetched sections:', sections);
        if (sections['main-cart']) {
          const cartContent = this.getSectionInnerHTML(sections['main-cart'], '.tf-page-cart-main');
          console.log('Cart content:', cartContent);
          if (cartContent) {
            // Update the cart content
            const cartMain = document.querySelector('.tf-page-cart-main');
            if (cartMain) {
              cartMain.innerHTML = cartContent;
              
              // Re-initialize functionality after content update
              this.init();
            }
          }
        }
      })
      .catch(error => {
        console.error('Error updating cart display:', error);
        // Fallback to page reload if section update fails
        window.location.reload();
      });
    
    // Trigger cart count update event
    document.dispatchEvent(new CustomEvent('cart:updated'));
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const element = doc.querySelector(selector);
    return element ? element.innerHTML : '';
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
    const cartContent = document.querySelector('.tf-page-cart-main');
    
    if (cartItems.length === 0) {
      // Show empty cart message
      if (emptyCartMessage) {
        emptyCartMessage.style.display = 'block';
      }
      // Hide cart content
      if (cartContent) {
        cartContent.style.display = 'none';
      }
    } else {
      // Hide empty cart message
      if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
      }
      // Show cart content
      if (cartContent) {
        cartContent.style.display = 'block';
      }
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

