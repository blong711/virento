// Bootstrap availability is handled by the cart-drawer.js component

// fetchConfig utility function
function fetchConfig(type = 'json') {
  const config = {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': type === 'json' ? 'application/json' : 'text/html',
    },
  };
  
  if (type === 'json') {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
}

// PUB_SUB_EVENTS constants
const PUB_SUB_EVENTS = {
  cartUpdate: 'cart:update',
  cartError: 'cart:error',
  variantChange: 'variant:change'
};

// publish function (if not already defined)
if (typeof window.publish === 'undefined') {
  window.publish = function(eventName, data) {
    // Check if we have a proper pubsub system
    if (typeof subscribe === 'function' && window.subscribers && window.subscribers[eventName]) {
      // Use the existing pubsub system
      const promises = window.subscribers[eventName].map(callback => callback(data));
      return Promise.all(promises);
    } else {
      // Fallback to custom events
      document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
      return Promise.resolve();
    }
  };
}

// CartPerformance utility (if not already defined)
if (typeof window.CartPerformance === 'undefined') {
  window.CartPerformance = {
    createStartingMarker: function(name) {
      return performance.now();
    },
    measureFromMarker: function(name, startMarker) {
      const duration = performance.now() - startMarker;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
    },
    measure: function(name, callback) {
      const start = performance.now();
      if (callback) callback();
      const duration = performance.now() - start;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
    },
    measureFromEvent: function(name, event) {
      console.log(`${name}: triggered from event`, event);
    }
  };
}

// Ensure themeSettings are available
if (typeof window.themeSettings === 'undefined') {
  window.themeSettings = {
    cartType: 'drawer'
  };
} else if (!window.themeSettings.cartType) {
  window.themeSettings.cartType = 'drawer';
}

// Ensure subscribe function is available for pubsub system
if (typeof window.subscribe === 'undefined') {
  window.subscribe = function(eventName, callback) {
    if (window.subscribers === undefined) {
      window.subscribers = {};
    }
    if (window.subscribers[eventName] === undefined) {
      window.subscribers[eventName] = [];
    }
    window.subscribers[eventName] = [...window.subscribers[eventName], callback];
    
    return function unsubscribe() {
      window.subscribers[eventName] = window.subscribers[eventName].filter((cb) => {
        return cb !== callback;
      });
    };
  };
}

if (!customElements.get('product-cart-button')) {
  customElements.define(
    'product-cart-button',
    class ProductCartButton extends HTMLElement {
      constructor() {
        super();
        this.init();
      }

      // Check if the current page is the cart page
      isOnCartPage() {
        // Check if we're on the cart page by looking for cart-specific elements
        const cartPageIndicator = document.querySelector('.main-cart, [data-section-type="main-cart"], .tf-page-cart-main');
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

      async init() {
        // Initialize cart button functionality
        
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
        let multipleProducts = [];

        // Check if this is a bulk add operation
        if (button.hasAttribute('data-bulk-add') || button.classList.contains('bulk-add')) {
          this.handleBulkAdd(button);
          return;
        }

        // Check if we have multiple variants to add FIRST
        if (button.hasAttribute('data-multiple-variants')) {
          const variantsData = button.getAttribute('data-multiple-variants');
          try {
            multipleProducts = JSON.parse(variantsData);
            if (multipleProducts.length > 0) {
              this.addMultipleProducts(multipleProducts, button);
              return; // Exit early for multiple products
            }
          } catch (e) {
            console.error('Error parsing multiple variants data:', e);
          } 
        }

        // Single product logic (only if no multiple products)
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
          console.warn('No variant ID found for single product add');
          return;
        }

        // Enhanced quantity detection for multiple products
        quantity = this.getQuantityForButton(button);

        // Single product add
        this.addSingleProduct(variantId, quantity, button, evt);
      }

      getQuantityForButton(button) {
        let quantity = 1;
        
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

        // Check for quantity selector (common in product forms)
        const quantitySelector = button.closest('form')?.querySelector('.quantity-selector, .quantity-input, [data-quantity-selector]');
        if (quantitySelector) {
          const selectorValue = parseInt(quantitySelector.value) || parseInt(quantitySelector.textContent);
          if (selectorValue && selectorValue > 0) {
            quantity = selectorValue;
          }
        }

        return Math.max(1, quantity); // Ensure minimum quantity of 1
      }

      async addSingleProduct(variantId, quantity, button, evt) {
        // Disable button during request
        button.style.pointerEvents = 'none';
        const originalText = this.getButtonText(button);
        const originalHTML = button.innerHTML;
        
        // Add spinner to button
        this.addSpinner(button);

        try {
          const result = await this.addToCart(variantId, quantity);
          
          if (result.success) {
            this.handleAddSuccess(button, originalText, result.cartData, variantId);
          } else {
            this.handleAddError(button, originalText, result.error);
          }
        } catch (error) {
          console.error('Error adding product to cart:', error);
          this.handleAddError(button, originalText, 'Network error');
        } finally {
          button.style.pointerEvents = 'auto';
          this.removeSpinner(button, originalHTML);
          // Measure performance from the original event
          if (window.CartPerformance?.measureFromEvent) {
            window.CartPerformance.measureFromEvent("add:user-action", evt);
          }
        }
      }

      async addMultipleProducts(products, button) {
        // Disable button during request
        button.style.pointerEvents = 'none';
        const originalText = this.getButtonText(button);
        const originalHTML = button.innerHTML;
        
        // Add spinner to button
        this.addSpinner(button);

        try {
          // Validate products before processing
          const { validProducts, errors: validationErrors } = this.validateProducts(products);
          
          if (validationErrors.length > 0) {
            console.error('Product validation errors:', validationErrors);
            this.handleAddError(button, originalText, validationErrors.join(', '));
            return;
          }

          if (validProducts.length === 0) {
            this.handleAddError(button, originalText, 'No valid products to add');
            return;
          }

          let successCount = 0;
          let errorCount = 0;
          const errors = [];
          let lastSuccessfulVariantId = null;
          let lastCartData = null;

          // Show progress for multiple products
          if (validProducts.length > 1) {
            this.setButtonText(button, `Adding ${validProducts.length} products...`);
          }

          // Add products sequentially to avoid conflicts
          for (let i = 0; i < validProducts.length; i++) {
            const product = validProducts[i];
            
            // Update progress for multiple products
            if (validProducts.length > 1) {
              this.setButtonText(button, `Adding ${i + 1} of ${validProducts.length}...`);
            }

            try {
              const result = await this.addToCart(product.variantId, product.quantity || 1);
              if (result.success) {
                successCount++;
                lastSuccessfulVariantId = product.variantId;
                lastCartData = result.cartData; // Store cart data from response
              } else {
                errorCount++;
                errors.push(`${product.variantId}: ${result.error}`);
              }
            } catch (error) {
              errorCount++;
              errors.push(`${product.variantId}: Network error`);
            }

            // Small delay between requests to avoid overwhelming the server
            if (i < validProducts.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }

          // Handle results
          if (errorCount === 0) {
            // All products added successfully - use cart data from last response
            this.handleMultipleProductsSuccess(button, originalText, successCount, lastSuccessfulVariantId, lastCartData);
          } else if (successCount > 0) {
            // Some products added successfully - use cart data from last successful response
            const message = `${successCount} added, ${errorCount} failed`;
            this.setButtonText(button, message);
            setTimeout(() => {
              this.setButtonText(button, originalText);
            }, 3000);
            
            // Use cart data from last successful response to update drawer
            this.handleMultipleProductsSuccess(button, originalText, successCount, lastSuccessfulVariantId, lastCartData);
            
            // Log detailed errors for debugging
            console.warn('Some products failed to add:', errors);
          } else {
            // All products failed
            this.handleAddError(button, originalText, errors.join(', '));
          }

        } catch (error) {
          console.error('Error adding multiple products:', error);
          this.handleAddError(button, originalText, 'Bulk add failed');
        } finally {
          button.style.pointerEvents = 'auto';
          this.removeSpinner(button, originalHTML);
        }
      }

      async addToCart(variantId, quantity) {
        // Get cart type setting
        const cartType = (window.themeSettings?.cartType || 'drawer').trim();

        // Get cart element based on cart type
        let cartElement = null;
        if (cartType === 'drawer') {
          cartElement = document.querySelector('cart-notification') || 
                       document.querySelector('cart-drawer') || 
                       document.querySelector('[data-cart-drawer]');
        }

        // Create config for form data submission
        const config = {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        };

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

        const response = await fetch(`${'/cart/add.js'}`, config);
        const data = await response.json();

        if (data.status) {
          return {
            success: false,
            error: data.errors || data.description || data.message || 'Unknown error'
          };
        }

        return {
          success: true,
          cartData: data
        };
      }



      handleAddSuccess(button, originalText, cartData, variantId, count = 1) {
        const cartType = (window.themeSettings?.cartType || 'drawer').trim();
        const successText = count > 1 ? `${count} products added!` : 'Added!';
        
        // Show success feedback
        this.setButtonText(button, successText);
        setTimeout(() => {
          this.setButtonText(button, originalText);
        }, 1500);

        // Handle based on cart type
        if (cartType === 'none') {
          // No action - just show success message
          this.triggerCartUpdate();
          
        } else if (cartType === 'cart-page') {
          // Redirect to cart page
          window.location = window.routes?.cart_url || '/cart';
          
        } else if (cartType === 'checkout-page') {
          // Redirect to checkout page
          const checkoutUrl = window.routes?.checkout_url || '/checkout';
          window.location.href = checkoutUrl;
          return; // Stop execution here
          
        } else if (cartType === 'drawer' && cartData) {
          // Update cart drawer
          this.updateCartDrawer(cartData, variantId);
        }
      }

      handleMultipleProductsSuccess(button, originalText, count, lastSuccessfulVariantId, cartData) {
        const cartType = (window.themeSettings?.cartType || 'drawer').trim();
        const successText = `${count} products added!`;
        
        // Show success feedback
        this.setButtonText(button, successText);
        setTimeout(() => {
          this.setButtonText(button, originalText);
        }, 1500);

        // Handle based on cart type
        if (cartType === 'none') {
          // No action - just show success message
          this.triggerCartUpdate();
          
        } else if (cartType === 'cart-page') {
          // Redirect to cart page
          window.location = window.routes?.cart_url || '/cart';
          
        } else if (cartType === 'checkout-page') {
          // Redirect to checkout page
          const checkoutUrl = window.routes?.checkout_url || '/checkout';
          window.location.href = checkoutUrl;
          return; // Stop execution here
          
        } else if (cartType === 'drawer' && cartData) {
          // Update cart drawer with cart data from response (same as single product add)
          this.updateCartDrawer(cartData, lastSuccessfulVariantId);
        } else if (cartType === 'drawer' && !cartData) {
          // Fallback to just triggering cart update if no cart data
          this.triggerCartUpdate();
        }
      }

      handleAddError(button, originalText, error) {
        console.error('Cart add error:', error);
        
        // Handle error
        publish(PUB_SUB_EVENTS.cartError, {
          source: 'product-cart-button',
          productVariantId: null,
          errors: error,
          message: error,
        });
        
        this.setButtonText(button, 'Error');
        setTimeout(() => {
          this.setButtonText(button, originalText);
        }, 2000);
      }

      updateCartDrawer(cartData, variantId) {
        // Check if we're on the cart page - if so, update the cart page display instead
        if (this.isOnCartPage()) {
          // Prefer the cart page's own refresh logic for reliability
          if (window.mainCart && typeof window.mainCart.forceCartRefresh === 'function') {
            window.mainCart.forceCartRefresh();
          } else if (typeof window.MainCart === 'function') {
            try {
              // Instantiate if not already available
              window.mainCart = window.mainCart || new window.MainCart();
              if (window.mainCart && typeof window.mainCart.forceCartRefresh === 'function') {
                window.mainCart.forceCartRefresh();
              }
            } catch (e) {
              // As a fallback, use our lightweight updater
              this.updateCartPageDisplay(cartData);
            }
          } else {
            // Fallback to our lightweight updater
            this.updateCartPageDisplay(cartData);
          }
          // Still update cart count
          this.triggerCartUpdate();
          return;
        }

        const cartElement = document.querySelector('cart-notification') || 
                           document.querySelector('cart-drawer') || 
                           document.querySelector('[data-cart-drawer]');
        
        if (cartElement) {
          const startMarker = window.CartPerformance?.createStartingMarker('add:wait-for-subscribers');
          publish(PUB_SUB_EVENTS.cartUpdate, {
            source: 'product-cart-button',
            productVariantId: variantId,
            cartData: cartData,
          }).then(() => {
            if (window.CartPerformance?.measureFromMarker) {
              window.CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
            }
          });

          // Update cart display
          if (window.CartPerformance?.measure) {
            window.CartPerformance.measure("add:paint-updated-sections", () => {
              if (cartElement.renderContents) {
                cartElement.renderContents(cartData);
              } else {
                console.warn("Cart element does not have renderContents method:", cartElement);
                // Fallback to triggering cart update if renderContents is not available
                this.triggerCartUpdate();
              }
            });
          } else {
            // Fallback if CartPerformance is not available
            if (cartElement.renderContents) {
              cartElement.renderContents(cartData);
            } else {
              console.warn("Cart element does not have renderContents method:", cartElement);
              // Fallback to triggering cart update if renderContents is not available
              this.triggerCartUpdate();
            }
          }
        }

        // Trigger cart count update event
        this.triggerCartUpdate();
      }

      // Update the cart page display when on cart page
      updateCartPageDisplay(cartData) {
        if (!cartData || !cartData.items) return;

        // Update cart items display
        this.updateCartItemsDisplay(cartData.items);
        
        // Update cart totals
        this.updateCartTotals(cartData);
        
        // Update cart count in header
        this.updateHeaderCartCount(cartData.item_count);
        
        // Check and update empty cart state
        this.checkEmptyCartState(cartData);
        
        // Update any cart-related UI elements
        this.updateCartUIElements(cartData);
      }

      // Update cart items display on the cart page
      updateCartItemsDisplay(cartItems) {
        if (!cartItems || !Array.isArray(cartItems)) return;

        cartItems.forEach(cartItem => {
          // Find existing cart item element
          const itemElement = document.querySelector(`[data-item-key="${cartItem.key}"]`);
          
          if (itemElement) {
            // Update existing item
            this.updateCartItemElement(itemElement, cartItem);
          } else {
            // Create new item element
            this.createCartItemElement(cartItem);
          }
        });

        // Remove items that are no longer in cart
        this.removeRemovedCartItems(cartItems);
      }

      // Update an existing cart item element
      updateCartItemElement(itemElement, cartItem) {
        // Update quantity
        const quantityInput = itemElement.querySelector('input[name="quantity"], .quantity-input, [data-quantity]');
        if (quantityInput) {
          quantityInput.value = cartItem.quantity;
        }

        // Update price
        const priceElement = itemElement.querySelector('.price, .item-price, .cart-item-price');
        if (priceElement) {
          priceElement.textContent = this.formatMoney(cartItem.final_line_price);
        }

        // Update total
        const totalElement = itemElement.querySelector('.item-total, .line-total, .total-price');
        if (totalElement) {
          totalElement.textContent = this.formatMoney(cartItem.final_line_price);
        }

        // Update image if available
        if (cartItem.image) {
          const imageElement = itemElement.querySelector('.cart-item-image img, .product-image img');
          if (imageElement) {
            imageElement.src = cartItem.image;
            imageElement.alt = cartItem.product_title;
          }
        }
      }

      // Create a new cart item element
      createCartItemElement(cartItem) {
        // This would need to be implemented based on your cart page HTML structure
        // For now, we'll trigger a page refresh to show the new item
        // In a production environment, you'd want to create the HTML dynamically
        console.log('New cart item added:', cartItem);
        
        // Option 1: Refresh the page to show new items (simple but not ideal)
        // window.location.reload();
        
        // Option 2: Fetch updated cart page content (better UX)
        this.refreshCartPageContent();
      }

      // Refresh cart page content without full page reload
      refreshCartPageContent() {
        // Fetch the updated cart page content
        fetch(window.location.href)
          .then(response => response.text())
          .then(html => {
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');
            
            // Update cart items section
            const newCartItems = newDoc.querySelector('.tf-cart-items, .cart-items, .main-cart');
            const currentCartItems = document.querySelector('.tf-cart-items, .cart-items, .main-cart');
            
            if (newCartItems && currentCartItems) {
              currentCartItems.innerHTML = newCartItems.innerHTML;
            }
            
            // Update cart totals section
            const newCartTotals = newDoc.querySelector('.cart-totals, .cart-summary, .cart-box');
            const currentCartTotals = document.querySelector('.cart-totals, .cart-summary, .cart-box');
            
            if (newCartTotals && currentCartTotals) {
              currentCartTotals.innerHTML = newCartTotals.innerHTML;
            }
            
            // Re-initialize any cart page functionality
            this.reinitializeCartPageFunctionality();
          })
          .catch(error => {
            console.error('Error refreshing cart page:', error);
            // Fallback to page reload
            window.location.reload();
          });
      }

      // Update cart totals
      updateCartTotals(cartData) {
        if (!cartData) return;

        // Update subtotal
        const subtotalElement = document.querySelector('.cart-subtotal, .subtotal, .cart-subtotal .price');
        if (subtotalElement) {
          subtotalElement.textContent = this.formatMoney(cartData.items_subtotal_price);
        }

        // Update total
        const totalElement = document.querySelector('.cart-total, .total, .cart-total .price');
        if (totalElement) {
          totalElement.textContent = this.formatMoney(cartData.total_price);
        }

        // Update item count
        const itemCountElement = document.querySelector('.cart-item-count, .item-count');
        if (itemCountElement) {
          itemCountElement.textContent = cartData.item_count;
        }
      }

      // Update header cart count
      updateHeaderCartCount(itemCount) {
        const cartCountElements = document.querySelectorAll('.cart-count, .toolbar-count.cart-count, [data-cart-count]');
        cartCountElements.forEach(element => {
          element.textContent = itemCount;
        });
      }

      // Check and update empty cart state
      checkEmptyCartState(cartData) {
        const emptyCartElement = document.querySelector('.empty-cart, .cart-empty');
        const cartItemsElement = document.querySelector('.cart-items, .tf-cart-items');
        
        if (cartData.item_count === 0) {
          // Show empty cart message
          if (emptyCartElement) {
            emptyCartElement.style.display = 'block';
          }
          if (cartItemsElement) {
            cartItemsElement.style.display = 'none';
          }
        } else {
          // Hide empty cart message
          if (emptyCartElement) {
            emptyCartElement.style.display = 'none';
          }
          if (cartItemsElement) {
            cartItemsElement.style.display = 'block';
          }
        }
      }

      // Update cart-related UI elements
      updateCartUIElements(cartData) {
        // Update free shipping progress if it exists
        const freeShippingElement = document.querySelector('.free-shipping-progress, .shipping-progress');
        if (freeShippingElement && cartData.total_price) {
          // Update free shipping progress based on cart total
          this.updateFreeShippingProgress(cartData.total_price);
        }

        // Update any other cart-related UI elements
        // This can be extended based on your specific cart page design
      }

      // Update free shipping progress
      updateFreeShippingProgress(cartTotal) {
        // This would need to be implemented based on your free shipping threshold
        // For now, it's a placeholder
        console.log('Updating free shipping progress for total:', cartTotal);
      }

      // Remove cart items that are no longer in the cart
      removeRemovedCartItems(currentCartItems) {
        const existingItemKeys = currentCartItems.map(item => item.key);
        const existingElements = document.querySelectorAll('[data-item-key]');
        
        existingElements.forEach(element => {
          const itemKey = element.getAttribute('data-item-key');
          if (!existingItemKeys.includes(itemKey)) {
            element.remove();
          }
        });
      }

      // Re-initialize cart page functionality after content update
      reinitializeCartPageFunctionality() {
        // Re-initialize any cart page specific functionality
        // This might include quantity inputs, remove buttons, etc.
        
        // Example: Re-setup quantity change handlers
        const quantityInputs = document.querySelectorAll('input[name="quantity"], .quantity-input');
        quantityInputs.forEach(input => {
          input.addEventListener('change', (e) => {
            // Handle quantity change
            this.handleQuantityChange(e);
          });
        });

        // Example: Re-setup remove button handlers
        const removeButtons = document.querySelectorAll('.remove-item, .remove');
        removeButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            // Handle item removal
            this.handleItemRemoval(e);
          });
        });
      }

      // Handle quantity change
      handleQuantityChange(event) {
        const input = event.target;
        const itemKey = input.closest('[data-item-key]')?.getAttribute('data-item-key');
        const newQuantity = parseInt(input.value);
        
        if (itemKey && newQuantity > 0) {
          this.updateItemQuantity(itemKey, newQuantity);
        }
      }

      // Handle item removal
      handleItemRemoval(event) {
        const button = event.target;
        const itemKey = button.closest('[data-item-key]')?.getAttribute('data-item-key');
        
        if (itemKey) {
          this.removeCartItem(itemKey);
        }
      }

      // Update item quantity
      updateItemQuantity(itemKey, quantity) {
        const formData = new FormData();
        formData.append('id', itemKey);
        formData.append('quantity', quantity);

        fetch('/cart/change.js', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(cart => {
          // Update the cart display with new data
          this.updateCartPageDisplay(cart);
        })
        .catch(error => {
          console.error('Error updating item quantity:', error);
        });
      }

      // Remove cart item
      removeCartItem(itemKey) {
        const formData = new FormData();
        formData.append('id', itemKey);
        formData.append('quantity', 0);

        fetch('/cart/change.js', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(cart => {
          // Update the cart display with new data
          this.updateCartPageDisplay(cart);
        })
        .catch(error => {
          console.error('Error removing item:', error);
        });
      }

      // Format money for display
      formatMoney(amount) {
        if (typeof amount === 'string') {
          amount = parseFloat(amount);
        }
        
        if (isNaN(amount)) {
          return '$0.00';
        }
        
        // Basic money formatting - you might want to use Shopify's money format
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount / 100); // Shopify prices are in cents
      }

      triggerCartUpdate() {
        document.dispatchEvent(new CustomEvent('cart:updated'));
      }

      handleBulkAdd(button) {
        // Get all selected products from the page
        const selectedProducts = this.getSelectedProducts();
        
        if (selectedProducts.length === 0) {
          this.setButtonText(button, 'No products selected');
          setTimeout(() => {
            this.setButtonText(button, this.getButtonText(button));
          }, 2000);
          return;
        }

        // Show confirmation for bulk add
        if (selectedProducts.length > 5) {
          const confirmed = confirm(`Add ${selectedProducts.length} products to cart?`);
          if (!confirmed) {
            return;
          }
        }

        // Add all selected products
        this.addMultipleProducts(selectedProducts, button);
      }

      // Method to handle adding products from a product list
      handleProductListAdd(button, productListSelector = '.product-list, .products-grid') {
        const productList = document.querySelector(productListSelector);
        if (!productList) {
          this.setButtonText(button, 'No product list found');
          return;
        }

        const products = this.getProductsFromList(productList);
        if (products.length === 0) {
          this.setButtonText(button, window.ShopifyTranslations?.cart?.no_products_found || 'No products found');
          return;
        }

        this.addMultipleProducts(products, button);
      }

      // Method to get products from a specific product list
      getProductsFromList(productList) {
        const products = [];
        const productItems = productList.querySelectorAll('.product-item, .product-card, [data-product-id]');
        
        productItems.forEach(item => {
          const variantId = item.getAttribute('data-variant-id');
          const quantityInput = item.querySelector('input[name="quantity"], .quantity-input, [data-quantity]');
          const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
          
          if (variantId && quantity > 0) {
            products.push({ variantId, quantity });
          }
        });

        return products;
      }

      // Method to handle adding products with specific quantities
      handleQuantityBasedAdd(button, quantityMap) {
        const products = [];
        
        Object.entries(quantityMap).forEach(([variantId, quantity]) => {
          if (variantId && quantity > 0) {
            products.push({ variantId, quantity });
          }
        });

        if (products.length === 0) {
          this.setButtonText(button, window.ShopifyTranslations?.cart?.no_valid_products || 'No valid products');
          return;
        }

        this.addMultipleProducts(products, button);
      }

      // Method to handle adding products from form data
      handleFormBasedAdd(button, formSelector) {
        const form = document.querySelector(formSelector);
        if (!form) {
          this.setButtonText(button, window.ShopifyTranslations?.cart?.form_not_found || 'Form not found');
          return;
        }

        const formData = new FormData(form);
        const products = [];
        
        // Handle multiple variant inputs
        const variantInputs = form.querySelectorAll('input[name="id"], input[name="variant_id"]');
        variantInputs.forEach(input => {
          const variantId = input.value;
          const quantityInput = input.closest('.product-row, .variant-row')?.querySelector('input[name="quantity"]');
          const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
          
          if (variantId && quantity > 0) {
            products.push({ variantId, quantity });
          }
        });

        if (products.length === 0) {
          this.setButtonText(button, window.ShopifyTranslations?.cart?.no_products_in_form || 'No products in form');
          return;
        }

        this.addMultipleProducts(products, button);
      }

      getSelectedProducts() {
        const products = [];
        
        // Look for checkboxes or other selection indicators
        const checkboxes = document.querySelectorAll('input[type="checkbox"][data-variant-id]:checked');
        checkboxes.forEach(checkbox => {
          const variantId = checkbox.getAttribute('data-variant-id');
          const quantity = parseInt(checkbox.getAttribute('data-quantity')) || 1;
          products.push({ variantId, quantity });
        });

        // Look for selected product cards
        const selectedCards = document.querySelectorAll('.product-card.selected, .product-item.selected');
        selectedCards.forEach(card => {
          const variantId = card.getAttribute('data-variant-id');
          const quantityInput = card.querySelector('input[name="quantity"]');
          const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
          
          if (variantId) {
            products.push({ variantId, quantity });
          }
        });

        // Look for products with selection class
        const selectedItems = document.querySelectorAll('[data-selected="true"]');
        selectedItems.forEach(item => {
          const variantId = item.getAttribute('data-variant-id');
          const quantity = parseInt(item.getAttribute('data-quantity')) || 1;
          
          if (variantId) {
            products.push({ variantId, quantity });
          }
        });

        // Look for products in a product list with quantity inputs
        const productList = document.querySelector('.product-list, .products-grid, .collection-products');
        if (productList) {
          const productItems = productList.querySelectorAll('.product-item, .product-card, [data-product-id]');
          productItems.forEach(item => {
            const variantId = item.getAttribute('data-variant-id');
            const quantityInput = item.querySelector('input[name="quantity"], .quantity-input, [data-quantity]');
            const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
            
            if (variantId && quantity > 0) {
              products.push({ variantId, quantity });
            }
          });
        }

        return products;
      }

      // Method to update quantities for multiple products
      updateProductQuantities(products) {
        products.forEach(product => {
          const productElement = document.querySelector(`[data-variant-id="${product.variantId}"]`);
          if (productElement) {
            const quantityInput = productElement.querySelector('input[name="quantity"], .quantity-input, [data-quantity]');
            if (quantityInput) {
              quantityInput.value = product.quantity;
              // Trigger change event for any listeners
              quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
      }

      // Method to validate products before adding to cart
      validateProducts(products) {
        const validProducts = [];
        const errors = [];

        products.forEach(product => {
          if (!product.variantId) {
            errors.push('Missing variant ID for product');
            return;
          }
          
          if (!product.quantity || product.quantity < 1) {
            errors.push(`Invalid quantity for variant ${product.variantId}`);
            return;
          }

          validProducts.push(product);
        });

        return { validProducts, errors };
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
document.addEventListener('DOMContentLoaded', async () => {
  if (document.querySelector('.product-cart-button')) {
    const cartButtonElement = document.createElement('product-cart-button');
    document.body.appendChild(cartButtonElement);
  }
  
  // Prevent cart drawer from opening on cart page
  preventCartDrawerOnCartPage();
  
  // Initialize cart type handling for all cart-related elements
  initializeCartTypeHandling();
});

// Cart drawer opening is handled by the cart-drawer.js component
// No custom offcanvas handling needed here

// Offcanvas cleanup is handled by Bootstrap and cart-drawer.js
// No custom cleanup needed here

// Function to check if the current page is the cart page
function isOnCartPage() {
  // Check if we're on the cart page by looking for cart-specific elements
  const cartPageIndicator = document.querySelector('.main-cart, [data-section-type="main-cart"], .tf-page-cart-main');
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

// Prevent Bootstrap offcanvas from opening cart drawer on cart page
function preventCartDrawerOnCartPage() {
  // Add a more specific event listener that runs before Bootstrap's handlers
  document.addEventListener('click', function(event) {
    // Check if we're on the cart page
    if (!isOnCartPage()) return;
    
    // Check if the clicked element is trying to open the cart drawer
    const target = event.target.closest('[data-bs-toggle="offcanvas"]');
    if (target && target.getAttribute('href') === '#shoppingCart') {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }, true); // Use capture phase to run before other handlers
  
  // Also prevent any programmatic opening of the cart drawer
  if (isOnCartPage()) {
    // Override the cart drawer's open method temporarily
    const cartDrawer = document.querySelector('cart-drawer');
    if (cartDrawer && cartDrawer.open) {
      const originalOpen = cartDrawer.open;
      cartDrawer.open = function() {
        // Don't open on cart page
        return;
      };
    }
    
    // Also prevent Bootstrap offcanvas from working for cart drawer
    if (typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
      const cartOffcanvas = document.querySelector('#shoppingCart');
      if (cartOffcanvas) {
        // Remove the offcanvas functionality temporarily
        cartOffcanvas.removeAttribute('data-bs-toggle');
        cartOffcanvas.removeAttribute('href');
      }
    }
  }
}

// Add a global prevention mechanism that runs immediately
(function() {
  // Check if we're on the cart page immediately
  if (document.readyState === 'loading') {
    // If DOM is still loading, wait for it
    document.addEventListener('DOMContentLoaded', function() {
      if (isOnCartPage()) {
        // Disable all cart drawer triggers immediately
        disableCartDrawerTriggers();
      }
    });
  } else {
    // DOM is already loaded
    if (isOnCartPage()) {
      // Disable all cart drawer triggers immediately
      disableCartDrawerTriggers();
    }
  }
})();

// Function to disable all cart drawer triggers
function disableCartDrawerTriggers() {
  // Remove all data-bs-toggle attributes from cart drawer elements
  const cartTriggers = document.querySelectorAll('[data-bs-toggle="offcanvas"][href="#shoppingCart"]');
  cartTriggers.forEach(trigger => {
    trigger.removeAttribute('data-bs-toggle');
    trigger.removeAttribute('href');
    // Add a visual indication that it's disabled
    trigger.style.opacity = '0.6';
    trigger.style.pointerEvents = 'none';
  });
  
  // Also prevent any existing Bootstrap offcanvas instances from working
  if (typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
    const cartOffcanvas = document.querySelector('#shoppingCart');
    if (cartOffcanvas) {
      const existingInstance = bootstrap.Offcanvas.getInstance(cartOffcanvas);
      if (existingInstance) {
        existingInstance.hide();
      }
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
      // Check if we're on the cart page - if so, prevent the drawer from opening
      if (isOnCartPage()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
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
  document.addEventListener('click', async (event) => {
    const target = event.target.closest('.nav-cart a, .cart-icon, [data-cart-toggle]');
    if (target) {
      // Check if we're on the cart page - if so, prevent the drawer from opening
      if (isOnCartPage()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
      
      if (cartType === 'drawer') {
        // Let Bootstrap handle the cart drawer opening
        // The cart-drawer.js component will handle the rest
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
  document.addEventListener('click', async (event) => {
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
            // Let Bootstrap handle the cart drawer opening
            // The cart-drawer.js component will handle the rest
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

// Offcanvas event handling is managed by Bootstrap and cart-drawer.js
// No custom event listeners needed here

/*
 * Enhanced Cart Button Usage Examples:
 * 
 * 1. Single Product Add (existing functionality):
 *    <button class="product-cart-button" data-variant-id="123">Add to Cart</button>
 * 
 * 2. Multiple Products with JSON data:
 *    <button class="product-cart-button" data-multiple-variants='[{"variantId":"123","quantity":2},{"variantId":"456","quantity":1}]'>
 *      Add Multiple
 *    </button>
 * 
 * 3. Bulk Add from selected products:
 *    <button class="product-cart-button bulk-add">Add Selected to Cart</button>
 * 
 * 4. Product List Add:
 *    <button class="product-cart-button" onclick="this.closest('product-cart-button').handleProductListAdd(this)">
 *      Add All Products
 *    </button>
 * 
 * 5. Form-based Add:
 *    <button class="product-cart-button" onclick="this.closest('product-cart-button').handleFormBasedAdd(this, '#product-form')">
 *      Add from Form
 *    </button>
 * 
 * 6. Quantity-based Add:
 *    <button class="product-cart-button" onclick="this.closest('product-cart-button').handleQuantityBasedAdd(this, {'123':2,'456':1})">
 *      Add with Quantities
 *    </button>
 * 
 * Supported data attributes:
 * - data-variant-id: Single variant ID
 * - data-product-id: Product ID (will use first variant)
 * - data-quantity: Quantity for single product
 * - data-multiple-variants: JSON array of {variantId, quantity} objects
 * - data-bulk-add: Enable bulk add functionality
 * - class="bulk-add": Alternative way to enable bulk add
 * 
 * The component automatically detects:
 * - Quantity inputs in forms
 * - Selected checkboxes with data-variant-id
 * - Product cards with .selected class
 * - Elements with data-selected="true"
 * - Quantity selectors and inputs
 * 
 * Cart Drawer Updates:
 * - ALL product addition methods now update the cart drawer consistently
 * - Single product add: Updates drawer with cart data from add response
 * - Multiple/Bulk/List: Updates drawer with cart data from last successful add response
 * - All methods use the same updateCartDrawer() function for consistency
 * - No additional cart data fetching required - uses response data directly
 */