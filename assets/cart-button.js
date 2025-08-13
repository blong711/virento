if (!customElements.get('product-cart-button')) {
  customElements.define(
    'product-cart-button',
    class ProductCartButton extends HTMLElement {
      constructor() {
        super();
        this.init();
      }

      init() {
        // Find all cart buttons with the specific class
        this.cartButtons = document.querySelectorAll('.product-cart-button');
        
        this.cartButtons.forEach(button => {
          button.addEventListener('click', this.onCartButtonClick.bind(this));
        });
      }

      onCartButtonClick(evt) {
        evt.preventDefault();
        
        const button = evt.currentTarget;
        let variantId, productId, quantity = 1;

        // Try to get variant ID from different possible sources
        if (button.hasAttribute('data-variant-id')) {
          variantId = button.getAttribute('data-variant-id');
        } else if (button.hasAttribute('data-product-id')) {
          // If no variant ID, use the product's first available variant
          productId = button.getAttribute('data-product-id');
          // This would need to be handled by getting the first variant from the product
        } else if (button.closest('form')) {
          // If it's a form, get the variant ID from the form
          const form = button.closest('form');
          const variantInput = form.querySelector('input[name="id"]');
          if (variantInput) {
            variantId = variantInput.value;
          }
        }

        if (!variantId) {
          return;
        }

        // Get quantity if available
        let quantityInput = button.closest('form')?.querySelector('input[name="quantity"]');
        
        // If no quantity input in form, check if we're in a quickview modal
        if (!quantityInput) {
          const quickviewModal = document.getElementById('quickView');
          if (quickviewModal && quickviewModal.classList.contains('show')) {
            quantityInput = quickviewModal.querySelector('input[name="quantity"]');
          }
        }
        
        // Check if quantity is set as data attribute on the button
        if (!quantityInput && button.hasAttribute('data-quantity')) {
          quantity = parseInt(button.getAttribute('data-quantity')) || 1;
        } else if (quantityInput) {
          quantity = parseInt(quantityInput.value) || 1;
        }

        // Disable button during request
        button.style.pointerEvents = 'none';
        const originalText = this.getButtonText(button);
        const originalHTML = button.innerHTML;
        
        // Add spinner to button
        this.addSpinner(button);

        // Get cart type setting
        const cartType = (window.themeSettings?.cartType || 'drawer').trim();

        // Get cart element based on cart type
        let cartElement = null;
        if (cartType === 'drawer') {
          cartElement = document.querySelector('cart-notification') || 
                       document.querySelector('cart-drawer') || 
                       document.querySelector('[data-cart-drawer]');
        }

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData();
        formData.append('id', variantId);
        formData.append('quantity', quantity);

        // Only add sections if we have a cart element and cart type is drawer
        if (cartElement && cartType === 'drawer') {
          const sections = ['cart-drawer', 'cart-live-region-text'];
          formData.append('sections', sections);
          formData.append('sections_url', window.location.pathname);
          cartElement.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              // Handle error
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-cart-button',
                productVariantId: variantId,
                errors: response.errors || response.description,
                message: response.message,
              });
              
              this.setButtonText(button, 'Error');
              setTimeout(() => {
                this.setButtonText(button, originalText);
              }, 2000);
              return;
            }

            // Success - handle based on cart type
            if (cartType === 'none') {
              // No action - just show success message
              this.setButtonText(button, 'Added!');
              setTimeout(() => {
                this.setButtonText(button, originalText);
              }, 1500);
              
              // Still trigger cart update event for other components
              const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-cart-button',
                productVariantId: variantId,
                cartData: response,
              }).then(() => {
                CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
              });
              
              // Trigger cart count update event
              document.dispatchEvent(new CustomEvent('cart:updated'));
              
            } else if (cartType === 'cart-page') {
              // Redirect to cart page
              window.location = window.routes.cart_url;
              
            } else if (cartType === 'checkout-page') {
              // Redirect to checkout page
              const checkoutUrl = window.routes.checkout_url || '/checkout';
              window.location.href = checkoutUrl;
              return; // Stop execution here
              
            } else if (cartType === 'drawer' && cartElement) {
              // Update cart drawer
              const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-cart-button',
                productVariantId: variantId,
                cartData: response,
              }).then(() => {
                CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
              });

              // Update cart display
              CartPerformance.measure("add:paint-updated-sections", () => {
                cartElement.renderContents(response);
              });

              // Trigger cart count update event
              document.dispatchEvent(new CustomEvent('cart:updated'));

              // Show success feedback
              this.setButtonText(button, 'Added!');
              setTimeout(() => {
                this.setButtonText(button, originalText);
              }, 1500);
            }
          })
          .catch((e) => {
            console.error(e);
            this.setButtonText(button, 'Error');
            setTimeout(() => {
              this.setButtonText(button, originalText);
            }, 2000);
          })
          .finally(() => {
            button.style.pointerEvents = 'auto';
            this.removeSpinner(button, originalHTML);
            CartPerformance.measureFromEvent("add:user-action", evt);
          });
      }

      getButtonText(button) {
        // Try different ways to get button text
        const tooltip = button.querySelector('.tooltip');
        if (tooltip) return tooltip.textContent;
        
        const span = button.querySelector('span');
        if (span) return span.textContent;
        
        return button.textContent || button.innerText;
      }

      setButtonText(button, text) {
        // Try different ways to set button text
        const tooltip = button.querySelector('.tooltip');
        if (tooltip) {
          tooltip.textContent = text;
          return;
        }
        
        const span = button.querySelector('span');
        if (span) {
          span.textContent = text;
          return;
        }
        
        button.textContent = text;
      }

      addSpinner(button) {
        // Create spinner element
        const spinner = document.createElement('div');
        spinner.className = 'cart-spinner';
        spinner.innerHTML = `
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        `;
        
        // Store original content and add spinner
        button.setAttribute('data-original-content', button.innerHTML);
        button.innerHTML = '';
        button.appendChild(spinner);
        
        // Add loading class
        button.classList.add('loading');
      }

      removeSpinner(button, originalHTML) {
        // Remove spinner and restore original content
        const spinner = button.querySelector('.cart-spinner');
        if (spinner) {
          spinner.remove();
        }
        
        // Restore original content
        if (originalHTML) {
          button.innerHTML = originalHTML;
        } else {
          const originalContent = button.getAttribute('data-original-content');
          if (originalContent) {
            button.innerHTML = originalContent;
          }
        }
        
        // Remove loading class
        button.classList.remove('loading');
      }
    }
  );
}

// Initialize cart buttons when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.product-cart-button')) {
    const cartButtonElement = document.createElement('product-cart-button');
    document.body.appendChild(cartButtonElement);
  }
  
  // Clean up any existing offcanvas instances to prevent duplicate backdrops
  cleanupExistingOffcanvasInstances();
  
  // Initialize cart type handling for all cart-related elements
  initializeCartTypeHandling();
});

// Function to safely open cart drawer without creating duplicate instances
function safelyOpenCartDrawer() {
  const cartDrawer = document.getElementById('shoppingCart');
  if (cartDrawer) {
    // Check if it's already open
    const existingOffcanvas = bootstrap.Offcanvas.getInstance(cartDrawer);
    if (existingOffcanvas) {
      // If already open, just show it (no duplicate)
      existingOffcanvas.show();
    } else {
      // Create new instance only if none exists
      const offcanvas = new bootstrap.Offcanvas(cartDrawer);
      offcanvas.show();
    }
  }
}

// Function to clean up existing offcanvas instances
function cleanupExistingOffcanvasInstances() {
  // Remove any existing offcanvas instances for the shopping cart
  const cartDrawer = document.getElementById('shoppingCart');
  if (cartDrawer) {
    const existingOffcanvas = bootstrap.Offcanvas.getInstance(cartDrawer);
    if (existingOffcanvas) {
      existingOffcanvas.dispose();
    }
  }
  
  // Remove any duplicate backdrop elements
  const backdrops = document.querySelectorAll('.offcanvas-backdrop');
  if (backdrops.length > 1) {
    // Keep only the first backdrop, remove the rest
    for (let i = 1; i < backdrops.length; i++) {
      backdrops[i].remove();
    }
  }
}

// Function to handle cart type behavior for all cart-related interactions
function initializeCartTypeHandling() {
  const cartType = window.themeSettings?.cartType || 'drawer';
  
  // Handle cart drawer toggle buttons
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-bs-toggle="offcanvas"]');
    if (target && target.getAttribute('href') === '#shoppingCart') {
      // Prevent default Bootstrap behavior when we want to handle it manually
      if (cartType !== 'drawer') {
        event.preventDefault();
        event.stopPropagation();
      }
      
      if (cartType === 'drawer') {
        // Let Bootstrap handle it normally - don't create another instance
        return;
      } else if (cartType === 'cart-page') {
        // Redirect to cart page
        window.location = window.routes?.cart_url || '/cart';
      } else if (cartType === 'checkout-page') {
        // Redirect directly to Shopify checkout
        window.location = `${window.routes?.checkout_url || '/checkout'}`;
      }
      // For 'none' type, do nothing
    }
  });
  
  // Handle cart icon clicks in header
  document.addEventListener('click', (event) => {
    const target = event.target.closest('.nav-cart a, .cart-icon, [data-cart-toggle]');
    if (target) {
      event.preventDefault();
      event.stopPropagation();
      
      if (cartType === 'drawer') {
        // Safely open cart drawer without creating duplicate instances
        safelyOpenCartDrawer();
      } else if (cartType === 'cart-page') {
        // Redirect to cart page
        window.location = window.routes?.cart_url || '/cart';
      } else if (cartType === 'checkout-page') {
        // Redirect directly to Shopify checkout
        window.location = `${window.routes?.checkout_url || '/checkout'}`;
      }
      // For 'none' type, do nothing
    }
  });
  
  // Handle any other cart-related buttons that might not use the standard classes
  document.addEventListener('click', (event) => {
    const target = event.target.closest('a[href*="cart"], button[onclick*="cart"], .cart-button, .view-cart');
    if (target && !target.classList.contains('product-cart-button')) {
      const href = target.getAttribute('href');
      const onclick = target.getAttribute('onclick');
      
      // Check if this is a cart-related action
      if (href && (href.includes('cart') || href.includes('checkout')) || 
          onclick && (onclick.includes('cart') || onclick.includes('checkout'))) {
        
        // Only intercept if it's not already handled by our cart button logic
        if (!target.hasAttribute('data-cart-handled')) {
          event.preventDefault();
          event.stopPropagation();
          target.setAttribute('data-cart-handled', 'true');
          
          if (cartType === 'drawer') {
            // Safely open cart drawer without creating duplicate instances
            safelyOpenCartDrawer();
          } else if (cartType === 'cart-page') {
            // Redirect to cart page
            window.location = window.routes?.cart_url || '/cart';
          } else if (cartType === 'checkout-page') {
            // Redirect directly to Shopify checkout
            window.location = `${window.routes?.checkout_url || '/checkout'}`;
          }
          // For 'none' type, do nothing
        }
      }
    }
  });
}

// Also handle dynamically added buttons
if (!window.cartButtonObserver) {
  window.cartButtonObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const cartButtons = node.querySelectorAll ? node.querySelectorAll('.product-cart-button') : [];
          if (node.matches && node.matches('.product-cart-button')) {
            cartButtons.push(node);
          }
          
          cartButtons.forEach(button => {
            if (!button.hasAttribute('data-cart-initialized')) {
              button.setAttribute('data-cart-initialized', 'true');
              button.addEventListener('click', (evt) => {
                evt.preventDefault();
                const productCartButton = document.querySelector('product-cart-button');
                if (productCartButton) {
                  productCartButton.onCartButtonClick(evt);
                }
              });
            }
          });
        }
      });
    });
  });

  window.cartButtonObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Global event listener to prevent duplicate cart drawer instances
document.addEventListener('show.bs.offcanvas', (event) => {
  if (event.target.id === 'shoppingCart') {
    // Remove any duplicate backdrop elements when cart drawer opens
    const backdrops = document.querySelectorAll('.offcanvas-backdrop');
    if (backdrops.length > 1) {
      // Keep only the first backdrop, remove the rest
      for (let i = 1; i < backdrops.length; i++) {
        backdrops[i].remove();
      }
    }
  }
});

// Global event listener to clean up when cart drawer closes
document.addEventListener('hidden.bs.offcanvas', (event) => {
  if (event.target.id === 'shoppingCart') {
    // Clean up any remaining backdrop elements
    const backdrops = document.querySelectorAll('.offcanvas-backdrop');
    if (backdrops.length > 0) {
      backdrops.forEach(backdrop => backdrop.remove());
    }
  }
}); 