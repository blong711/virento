class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.init();
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
    
    // Check empty cart state on initialization
    this.checkEmptyCart();
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
    })
    .catch(error => {
      console.error('Error removing item:', error);
    });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    
    // Use Bootstrap's offcanvas API to open the cart drawer
    const offcanvas = new bootstrap.Offcanvas(this);
    offcanvas.show();
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
        this.innerHTML = cartDrawerContent;
        this.init(); // Re-initialize after content update
      }
    }

    // Open the cart drawer after update
    setTimeout(() => {
      this.open();
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
            this.innerHTML = cartDrawerContent;
            this.init(); // Re-initialize after content update
            
            // Check if cart is empty and show appropriate message
            this.checkEmptyCart();
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
}

customElements.define('cart-drawer', CartDrawer);

// Theme customizer functionality
if (Shopify.designMode) {
  document.addEventListener('shopify:section:select', function(event) {
    if (event.target.id === 'shopify-section-cart-drawer') {
      // Get the cart drawer element and open it
      const cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer) {
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
