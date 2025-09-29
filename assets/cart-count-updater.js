class CartCountUpdater {
  constructor() {
    this.cartCountElements = document.querySelectorAll('.toolbar-count.cart-count');
    this.init();
    // Initialize the cart count on first load
    this.forceUpdate();
  }

  init() {
    // Listen for cart updates
    document.addEventListener('cart:updated', this.updateCartCount.bind(this));
    document.addEventListener('cart:added', this.updateCartCount.bind(this));
    document.addEventListener('cart:removed', this.updateCartCount.bind(this));
  }

  updateCartCount(event) {
    // Fetch current cart data
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        this.updateCartCountDisplay(cart.item_count);
      })
      .catch(error => {
        console.error('Error fetching cart data:', error);
      });
  }

  updateCartCountDisplay(itemCount) {
    this.cartCountElements.forEach(element => {
      element.textContent = itemCount;
      
      // Add visual feedback
      element.style.transform = 'scale(1.2)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 200);
    });
  }

  // Method to manually update cart count
  forceUpdate() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        this.updateCartCountDisplay(cart.item_count);
      })
      .catch(error => {
        console.error('Error fetching cart data:', error);
      });
  }
}

// Initialize once (supports both already-loaded and loading states)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CartCountUpdater();
  });
} else {
  new CartCountUpdater();
}
