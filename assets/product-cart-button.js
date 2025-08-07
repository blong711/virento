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
          console.error('No variant ID found');
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
        
        if (quantityInput) {
          quantity = parseInt(quantityInput.value) || 1;
        }

        // Disable button during request
        button.style.pointerEvents = 'none';
        const originalText = this.getButtonText(button);
        const originalHTML = button.innerHTML;
        
        // Add spinner to button
        this.addSpinner(button);

        // Get cart element
        this.cart = document.querySelector('cart-notification') || 
                   document.querySelector('cart-drawer') || 
                   document.querySelector('[data-cart-drawer]');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData();
        formData.append('id', variantId);
        formData.append('quantity', quantity);

        if (this.cart) {
          // Add sections that need to be updated
          const sections = ['cart-drawer', 'cart-live-region-text'];
          formData.append('sections', sections);
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
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
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            // Success - update cart
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
              this.cart.renderContents(response);
            });

            // Trigger cart count update event
            document.dispatchEvent(new CustomEvent('cart:updated'));

            // Show success feedback
            this.setButtonText(button, 'Added!');
            setTimeout(() => {
              this.setButtonText(button, originalText);
            }, 1500);
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
});

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