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

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#shoppingCart',
      },
      {
        id: 'cart-icon-bubble',
      },
    ];
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
          }
        }
      })
      .catch(error => {
        console.error('Error updating cart:', error);
      });
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends HTMLElement {
  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        section: 'cart-drawer',
        selector: '#shoppingCart',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
    ];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);
