// https://minify-js.com/
// Functions are available globally from global.js

// WISHLIST
var $wishlist_list = document.getElementById('hdt_wishlist_list'),
  $compare_list = document.getElementById('hdt_compare_list'),
  nameCachedWishlist = 'theme4:wishlist:id',
  nameCachedCompare = 'theme4:compare:id';
// if exit $wishlist_list is use app wishlist the4
if ($wishlist_list) {
  var arr_wishlist_list = $wishlist_list.textContent ? $wishlist_list.textContent.split(' ') : [];
}
else {
  var arr_wishlist_list = (!localStorage.getItem(nameCachedWishlist)) ? [] : localStorage.getItem(nameCachedWishlist).split(',');  // remove id: and conver array
}
if ($compare_list){
  var arr_compare_list = $compare_list.textContent ? $compare_list.textContent.split(' ') : [];
}
else {
  // Try to get compare list from localStorage, handle both old and new formats
  const storedCompare = localStorage.getItem(nameCachedCompare);
  if (storedCompare) {
    try {
      // Try to parse as JSON (new format)
      arr_compare_list = JSON.parse(storedCompare);
    } catch (e) {
      // Fall back to old format (comma-separated string)
      arr_compare_list = storedCompare.split(',');
    }
  } else {
    arr_compare_list = [];
  }
}
// arr_wishlist_list = [1234, 5678, 9011]
// arr_compare_list = [1234, 5678, 9011]

var linkWishlistApp = '/apps/ecomrise/wishlist',
  linkCompareApp = '/apps/ecomrise/compare',
  actionAfterWishlistAdded = (window.themeHDN && themeHDN.extras && themeHDN.extras.AddedWishlistRemove) ? 'remove' : 'added',
  actionAfterCompareAdded = (window.themeHDN && themeHDN.extras && themeHDN.extras.AddedCompareRemove) ? 'remove' : 'added',
  limitWishlist = $wishlist_list ? 100 : 50,
  limitCompare = 6,
  conver_to_link_fn = function (prefix = this.textFn, array = this.array) {
    const searchUrl = (window.themeHDN && themeHDN.routes && themeHDN.routes.search_url) ? themeHDN.routes.search_url : '/search';
    const x = searchUrl + `/?view=${prefix}`,
      y = x + '&type=product&options[unavailable_products]=last&q=';
    
    if (array.length) {
      // Handle both old format (array of strings) and new format (array of objects)
      const ids = array.map(item => typeof item === 'object' ? item.id : item);
      return y + encodeURI(`id:${ids.join(' OR id:')}`);
    }
    return x;
  };

// Initialize wishlist functionality for existing buttons
function initializeWishlistButtons() {
  // Find all wishlist buttons (including main product page button)
  const wishlistButtons = document.querySelectorAll('.wishlist a[data-product-id], .btn-add-wishlist[data-product-id]');
  
  wishlistButtons.forEach(button => {
    const productId = button.getAttribute('data-product-id');
    const productHandle = button.getAttribute('data-product-handle');
    const icon = button.querySelector('.icon');
    const tooltip = button.querySelector('.tooltip');
    

    
    // Check if product is already in wishlist
    const isInWishlist = arr_wishlist_list.includes(productId);
    
    // Update button state
    if (isInWishlist) {
      // Handle different icon classes for main product button vs regular wishlist buttons
      if (button.classList.contains('btn-add-wishlist')) {
        icon.classList.remove('icon-heart');
        icon.classList.add('icon-trash');
        const addSpan = button.querySelector('span.add');
        const addedSpan = button.querySelector('span.added');
        if (addSpan) addSpan.style.display = 'none';
        if (addedSpan) addedSpan.style.display = 'inline';
      } else {
        icon.classList.remove('icon-heart2');
        icon.classList.add('icon-trash');
      }
      // Only update tooltip if it exists
      if (tooltip) {
        tooltip.textContent = 'Remove from Wishlist';
      }
      button.setAttribute('data-action', 'remove');
    } else {
      // Handle different icon classes for main product button vs regular wishlist buttons
      if (button.classList.contains('btn-add-wishlist')) {
        icon.classList.remove('icon-trash');
        icon.classList.add('icon-heart');
        const addSpan = button.querySelector('span.add');
        const addedSpan = button.querySelector('span.added');
        if (addSpan) addSpan.style.display = 'inline';
        if (addedSpan) addedSpan.style.display = 'none';
      } else {
        icon.classList.remove('icon-trash');
        icon.classList.add('icon-heart2');
      }
      // Only update tooltip if it exists
      if (tooltip) {
        tooltip.textContent = 'Add to Wishlist';
      }
      button.setAttribute('data-action', 'add');
    }
    
    // Add click event listener
    button.addEventListener('click', function(e) {
      e.preventDefault();
      handleWishlistClick(this, productId, productHandle);
    });
  });
}

// Handle wishlist button click
function handleWishlistClick(button, productId, productHandle) {
  const action = button.getAttribute('data-action');
  const icon = button.querySelector('.icon');
  const tooltip = button.querySelector('.tooltip');
  

  
  if (action === 'add') {
    // Add to wishlist
    if (arr_wishlist_list.length >= limitWishlist) {
      // Remove oldest item if at limit
      arr_wishlist_list.splice(limitWishlist - 1, 1);
    }
    
    // Add to beginning of array
    arr_wishlist_list.unshift(productId);
    localStorage.setItem(nameCachedWishlist, arr_wishlist_list.toString());
    
    // Update button state
    if (button.classList.contains('btn-add-wishlist')) {
      icon.classList.remove('icon-heart');
      icon.classList.add('icon-trash');
      const addSpan = button.querySelector('span.add');
      const addedSpan = button.querySelector('span.added');
      if (addSpan) addSpan.style.display = 'none';
      if (addedSpan) addedSpan.style.display = 'inline';
    } else {
      icon.classList.remove('icon-heart2');
      icon.classList.add('icon-trash');
    }
    // Only update tooltip if it exists
    if (tooltip) {
      tooltip.textContent = 'Remove from Wishlist';
    }
    button.setAttribute('data-action', 'remove');
    
    // Update all buttons for this product
    updateAllWishlistButtons(productId, 'remove');
    

    
  } else {
    // Remove from wishlist
    const index = arr_wishlist_list.indexOf(productId);
    if (index > -1) {
      arr_wishlist_list.splice(index, 1);
      localStorage.setItem(nameCachedWishlist, arr_wishlist_list.toString());
    }
    
    // Update button state
    if (button.classList.contains('btn-add-wishlist')) {
      icon.classList.remove('icon-trash');
      icon.classList.add('icon-heart');
      const addSpan = button.querySelector('span.add');
      const addedSpan = button.querySelector('span.added');
      if (addSpan) addSpan.style.display = 'inline';
      if (addedSpan) addedSpan.style.display = 'none';
    } else {
      icon.classList.remove('icon-trash');
      icon.classList.add('icon-heart2');
    }
    // Only update tooltip if it exists
    if (tooltip) {
      tooltip.textContent = 'Add to Wishlist';
    }
    button.setAttribute('data-action', 'add');
    
    // Update all buttons for this product
    updateAllWishlistButtons(productId, 'add');
    

  }
  
  // Dispatch custom event for other components
  document.dispatchEvent(new CustomEvent('theme4:wishlist:update', {
    bubbles: true,
    detail: arr_wishlist_list
  }));
  
  // Update wishlist count in mobile toolbar
  updateWishlistCount();
}

// Update all wishlist buttons for a specific product
function updateAllWishlistButtons(productId, action) {
  const buttons = document.querySelectorAll(`.wishlist a[data-product-id="${productId}"], .btn-add-wishlist[data-product-id="${productId}"]`);
  
  buttons.forEach(button => {
    const icon = button.querySelector('.icon');
    const tooltip = button.querySelector('.tooltip');
    
    if (action === 'remove') {
      if (button.classList.contains('btn-add-wishlist')) {
        icon.classList.remove('icon-heart');
        icon.classList.add('icon-trash');
        const addSpan = button.querySelector('span.add');
        const addedSpan = button.querySelector('span.added');
        if (addSpan) addSpan.style.display = 'none';
        if (addedSpan) addedSpan.style.display = 'inline';
      } else {
        icon.classList.remove('icon-heart2');
        icon.classList.add('icon-trash');
      }
      // Only update tooltip if it exists
      if (tooltip) {
        tooltip.textContent = 'Remove from Wishlist';
      }
      button.setAttribute('data-action', 'remove');
    } else {
      if (button.classList.contains('btn-add-wishlist')) {
        icon.classList.remove('icon-trash');
        icon.classList.add('icon-heart');
        const addSpan = button.querySelector('span.add');
        const addedSpan = button.querySelector('span.added');
        if (addSpan) addSpan.style.display = 'inline';
        if (addedSpan) addedSpan.style.display = 'none';
      } else {
        icon.classList.remove('icon-trash');
        icon.classList.add('icon-heart2');
      }
      // Only update tooltip if it exists
      if (tooltip) {
        tooltip.textContent = 'Add to Wishlist';
      }
      button.setAttribute('data-action', 'add');
    }
  });
}

// Initialize wishlist buttons when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeWishlistButtons();
  initializeCompareButtons();
  
  // Update wishlist count on page load
  updateWishlistCount();
});

// Also initialize for dynamically loaded content
document.addEventListener('shopify:section:load', function() {
  initializeWishlistButtons();
  initializeCompareButtons();
});

// Reset if limit change
if (arr_wishlist_list.length > limitWishlist) {
  arr_wishlist_list.splice(limitWishlist - 1, arr_wishlist_list.length - 1);
  localStorage.setItem(nameCachedWishlist, arr_wishlist_list.toString());
}
// Check is page has item but not show reload page
if (window.isPageWishlist) {
  if (arr_wishlist_list.length && !window.isWishlistPerformed) {
    window.location.href = conver_to_link_fn('wishlist', arr_wishlist_list)
  } else {
    window.history.replaceState({}, document.title, conver_to_link_fn('wishlist', []));
  }
  if (window.themeHDN) themeHDN.wisHref = conver_to_link_fn('wishlist', arr_wishlist_list);
}

// Reset if limit change
if (arr_compare_list.length > limitCompare) {
  arr_compare_list.splice(limitCompare - 1, arr_compare_list.length - 1);
  localStorage.setItem(nameCachedCompare, JSON.stringify(arr_compare_list));
}
// Check is page has item but not show reload page
if (window.isPageCompare) {
  if (arr_compare_list.length && !window.isComparePerformed) {
    window.location.href = conver_to_link_fn('compare', arr_compare_list)
  } else {
    window.history.replaceState({}, document.title, conver_to_link_fn('compare', []));
  }
}

// Update wishlist count in mobile toolbar
function updateWishlistCount() {
  const wishlistCountElements = document.querySelectorAll('.toolbar-count.wishlist-count');
  const count = arr_wishlist_list.length;
  
  wishlistCountElements.forEach(element => {
    element.textContent = count;
    
    // Add visual feedback
    element.style.transform = 'scale(1.2)';
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 200);
  });
}

// Update count
class WishlistCount extends HTMLElement {
  constructor() {
    super();
    this.textContent = arr_wishlist_list.length;
    document.addEventListener(`theme4:wishlist:update`, (e) => {
      this.textContent = arr_wishlist_list.length;
    });
  }
}
// Update link page
class WishlistLink extends HTMLElement {
  constructor() {
    super();
    const link = this.querySelector('a');
    if (link) {
      link.href = conver_to_link_fn('wishlist', arr_wishlist_list);
    }
    document.addEventListener(`theme4:wishlist:update`, (e) => {
      if (link) {
        link.href = conver_to_link_fn('wishlist', arr_wishlist_list);
      }
    });
  }
}
customElements.define("hdt-wishlist-count", WishlistCount);
customElements.define("hdt-wishlist-a", WishlistLink);

// COMPARE
// Note: Compare functionality is handled separately from wishlist
// Store both product ID and handle for compare items
var arr_compare_list = (!localStorage.getItem(nameCachedCompare)) ? [] : JSON.parse(localStorage.getItem(nameCachedCompare)) || [];

// Update count
class CompareCount extends HTMLElement {
  constructor() {
    super();
    this.textContent = arr_compare_list.length;
    document.addEventListener(`theme4:compare:update`, (e) => {
      this.textContent = arr_compare_list.length;
    });
  }
}
// Update link page
class CompareLink extends HTMLElement {
  constructor() {
    super();
    const link = this.querySelector('a');
    if (link) {
      link.href = conver_to_link_fn('compare', arr_compare_list);
    }
    document.addEventListener(`theme4:compare:update`, (e) => {
      if (link) {
        link.href = conver_to_link_fn('compare', arr_compare_list);
      }
    });
  }
}

customElements.define("hdt-compare-count", CompareCount);
customElements.define("hdt-compare-a", CompareLink); 

// Initialize compare functionality for existing buttons
function initializeCompareButtons() {
  // Find all compare buttons (including main product page button)
  const compareButtons = document.querySelectorAll('.compare a[data-product-id], .btn-add-compare[data-product-id]');
  
  compareButtons.forEach(button => {
    const productId = button.getAttribute('data-product-id');
    const productHandle = button.getAttribute('data-product-handle');
    const icon = button.querySelector('.icon');
    const tooltip = button.querySelector('.tooltip');
    
    // Check if product is already in compare
    const isInCompare = arr_compare_list.some(item => (typeof item === 'object' ? item.id : item) === productId);
    
    // Update button state
    if (isInCompare) {
      if (button.classList.contains('btn-add-compare')) {
        icon.classList.remove('icon-compare2');
        icon.classList.add('icon-check');
        button.setAttribute('data-action', 'browse');
        // Handle text switching with JavaScript
        const compareText = button.querySelector('span.compare-text');
        const browseText = button.querySelector('span.browse-text');
        if (compareText) compareText.style.display = 'none';
        if (browseText) browseText.style.display = 'inline';
      } else {
        icon.classList.remove('icon-compare');
        icon.classList.add('icon-check');
        if (tooltip) tooltip.textContent = 'Browse Compare';
        button.setAttribute('data-action', 'browse');
      }
    } else {
      if (button.classList.contains('btn-add-compare')) {
        icon.classList.remove('icon-check');
        icon.classList.add('icon-compare2');
        button.setAttribute('data-action', 'add');
        // Handle text switching with JavaScript
        const compareText = button.querySelector('span.compare-text');
        const browseText = button.querySelector('span.browse-text');
        if (compareText) compareText.style.display = 'inline';
        if (browseText) browseText.style.display = 'none';
      } else {
        icon.classList.remove('icon-check', 'icon-trash');
        icon.classList.add('icon-compare');
        if (tooltip) tooltip.textContent = 'Add to Compare';
        button.setAttribute('data-action', 'add');
      }
    }
    
    // Add click event listener
    button.addEventListener('click', function(e) {
      e.preventDefault();
      handleCompareClick(this, productId, productHandle);
    });
  });
  
  // Initialize compare modal buttons (buttons that open the modal directly)
  const compareModalButtons = document.querySelectorAll('a[href="#compare"], .compare-modal-btn');
  compareModalButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      openCompareModalFromButton();
    });
  });
  
  // Initialize clear compare button
  const clearCompareButton = document.querySelector('.clear-file-delete');
  if (clearCompareButton) {
    clearCompareButton.addEventListener('click', function(e) {
      e.preventDefault();
      clearCompare();
    });
  }
  
  // Initialize modal close button
  const modalCloseButton = document.querySelector('.btn-hide-popup');
  if (modalCloseButton) {
    modalCloseButton.addEventListener('click', function(e) {
      // Let Bootstrap handle the modal closing, then clean up
      setTimeout(() => {
        cleanupModal();
      }, 100);
    });
  }
  
  // Also listen for modal hidden event to ensure cleanup
  const modal = document.getElementById('compare');
  if (modal) {
    modal.addEventListener('hidden.bs.modal', function() {
      cleanupModal();
    });
  }
}

// Handle compare button click
function handleCompareClick(button, productId, productHandle) {
  const action = button.getAttribute('data-action');
  const icon = button.querySelector('.icon');
  const tooltip = button.querySelector('.tooltip');
  
  if (action === 'add') {
    // Add to compare
    if (arr_compare_list.length >= limitCompare) {
      // Remove oldest item if at limit
      arr_compare_list.splice(limitCompare - 1, 1);
    }
    
    // Add to beginning of array with both ID and handle
    arr_compare_list.unshift({ id: productId, handle: productHandle });
    localStorage.setItem(nameCachedCompare, JSON.stringify(arr_compare_list));
    
    // Update button state
    if (button.classList.contains('btn-add-compare')) {
      icon.classList.remove('icon-compare2');
      icon.classList.add('icon-check');
      // Handle text switching with JavaScript
      const compareText = button.querySelector('span.compare-text');
      const browseText = button.querySelector('span.browse-text');
      if (compareText) compareText.style.display = 'none';
      if (browseText) browseText.style.display = 'inline';
    } else {
      icon.classList.remove('icon-compare');
      icon.classList.add('icon-check');
    }
    if (tooltip) tooltip.textContent = 'Browse Compare';
    button.setAttribute('data-action', 'browse');
    
    // Update all buttons for this product
    updateAllCompareButtons(productId, 'browse');
    
    // Open compare modal
    openCompareModal();
    
  } else if (action === 'browse') {
    // Open compare modal without removing product
    openCompareModal();
    
  } else {
    // Remove from compare
    const index = arr_compare_list.findIndex(item => item.id === productId || item === productId);
    if (index > -1) {
      arr_compare_list.splice(index, 1);
      localStorage.setItem(nameCachedCompare, JSON.stringify(arr_compare_list));
    }
    
    // Update button state
    if (button.classList.contains('btn-add-compare')) {
      icon.classList.remove('icon-check');
      icon.classList.add('icon-compare2');
      // Handle text switching with JavaScript
      const compareText = button.querySelector('span.compare-text');
      const browseText = button.querySelector('span.browse-text');
      if (compareText) compareText.style.display = 'inline';
      if (browseText) browseText.style.display = 'none';
    } else {
      icon.classList.remove('icon-check');
      icon.classList.add('icon-compare');
    }
    if (tooltip) tooltip.textContent = 'Add to Compare';
    button.setAttribute('data-action', 'add');
    
    // Update all buttons for this product
    updateAllCompareButtons(productId, 'add');
  }
  
  // Dispatch custom event for other components
  document.dispatchEvent(new CustomEvent('theme4:compare:update', {
    bubbles: true,
    detail: arr_compare_list
  }));
}

// Update all compare buttons for a specific product
function updateAllCompareButtons(productId, action) {
  const buttons = document.querySelectorAll(`.compare a[data-product-id="${productId}"], .btn-add-compare[data-product-id="${productId}"]`);
  
  buttons.forEach(button => {
    const icon = button.querySelector('.icon');
    const tooltip = button.querySelector('.tooltip');
    
    if (action === 'browse') {
      if (button.classList.contains('btn-add-compare')) {
        icon.classList.remove('icon-compare2');
        icon.classList.add('icon-check');
        // Handle text switching with JavaScript
        const compareText = button.querySelector('span.compare-text');
        const browseText = button.querySelector('span.browse-text');
        if (compareText) compareText.style.display = 'none';
        if (browseText) browseText.style.display = 'inline';
      } else {
        icon.classList.remove('icon-compare', 'icon-trash');
        icon.classList.add('icon-check');
      }
      if (tooltip) tooltip.textContent = 'Browse Compare';
      button.setAttribute('data-action', 'browse');
    } else if (action === 'remove') {
      if (button.classList.contains('btn-add-compare')) {
        icon.classList.remove('icon-check');
        icon.classList.add('icon-compare2');
        // Handle text switching with JavaScript
        const compareText = button.querySelector('span.compare-text');
        const browseText = button.querySelector('span.browse-text');
        if (compareText) compareText.style.display = 'inline';
        if (browseText) browseText.style.display = 'none';
      } else {
        icon.classList.remove('icon-compare', 'icon-check');
        icon.classList.add('icon-trash');
      }
      if (tooltip) tooltip.textContent = 'Remove from Compare';
      button.setAttribute('data-action', 'remove');
    } else {
      if (button.classList.contains('btn-add-compare')) {
        icon.classList.remove('icon-check');
        icon.classList.add('icon-compare2');
        // Handle text switching with JavaScript
        const compareText = button.querySelector('span.compare-text');
        const browseText = button.querySelector('span.browse-text');
        if (compareText) compareText.style.display = 'inline';
        if (browseText) browseText.style.display = 'none';
      } else {
        icon.classList.remove('icon-check', 'icon-trash');
        icon.classList.add('icon-compare');
      }
      if (tooltip) tooltip.textContent = 'Add to Compare';
      button.setAttribute('data-action', 'add');
    }
  });
}

// Open compare modal
function openCompareModal() {
  const modal = document.getElementById('compare');
  if (modal) {
    // Update modal content with current compare items
    updateCompareModalContent();
    
    // Show modal using Bootstrap
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
  }
}

// Open compare modal from compare button (when not adding a product)
function openCompareModalFromButton() {
  const modal = document.getElementById('compare');
  if (modal) {
    // Update modal content with current compare items
    updateCompareModalContent();
    
    // Show modal using Bootstrap
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
  }
}

// Update compare modal content
function updateCompareModalContent() {
  const compareList = document.getElementById('compare-list');
  if (!compareList) return;
  
  // Clear existing content
  compareList.innerHTML = '';
  
  // Add current compare items
  arr_compare_list.forEach(item => {
    const productId = typeof item === 'object' ? item.id : item;
    const productHandle = typeof item === 'object' ? item.handle : null;
        
    // Create compare item element
    const compareItem = document.createElement('div');
    compareItem.className = 'tf-compare-item file-delete';
    compareItem.setAttribute('data-product-id', productId);
    
    // Create loading placeholder
    compareItem.innerHTML = `
      <span class="icon-close remove" onclick="removeFromCompare(${productId})"></span>
      <a href="#" class="image">
        <img class="lazyload" 
             data-src="/assets/placeholder-image.png"
             src="/assets/placeholder-image.png" 
             alt="Loading..."
             width="300" height="300">
      </a>
      <div class="content">
        <div class="text-title">
          <a class="link text-line-clamp-2" href="#">Loading...</a>
        </div>
        <p class="price-wrap">
          <span class="new-price">Loading...</span>
        </p>
      </div>
    `;
    compareList.appendChild(compareItem);
    
    // Fetch product data
    fetchProductData(productId, compareItem, productHandle);
  });
}

// Fetch product data for compare modal
function fetchProductData(productId, compareItem, productHandle = null) {
  // If productHandle is not provided, try to get it from the compare button
  if (!productHandle) {
    const compareButton = document.querySelector(`.compare a[data-product-id="${productId}"], .btn-add-compare[data-product-id="${productId}"]`);
    productHandle = compareButton ? compareButton.getAttribute('data-product-handle') : null;
  }
  
  if (!productHandle) {
    console.error('No product handle found for product ID:', productId);
    return;
  }
  
  // Fetch specific product by handle using the correct API endpoint
  fetch(`/products/${productHandle}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.product) {
        const product = data.product;
        
        const titleElement = compareItem.querySelector('.text-title a');
        const imageElement = compareItem.querySelector('.image img');
        const priceElement = compareItem.querySelector('.price-wrap');
        
        if (titleElement) {
          titleElement.textContent = product.title;
          titleElement.href = `/products/${product.handle}`;
        }
        
        if (imageElement) {
          // Use the first image from the images array or the main image
          const productImage = product.images && product.images.length > 0 ? product.images[0].src : 
                              product.image ? product.image.src : null;
          
          if (productImage) {
            imageElement.src = productImage;
            imageElement.alt = product.title;
            imageElement.setAttribute('data-src', productImage);
          }
        }
        
        if (priceElement && product.variants && product.variants.length > 0) {
          const variant = product.variants[0];
          const price = variant.price;
          const comparePrice = variant.compare_at_price;
          
          if (comparePrice && comparePrice > variant.price) {
            priceElement.innerHTML = `
              <span class="new-price text-primary">$${price}</span>
              <span class="old-price text-decoration-line-through text-dark-1">$${comparePrice}</span>
            `;
          } else {
            priceElement.innerHTML = `<span class="new-price">$${price}</span>`;
          }
        }
      }
    })
    .catch(error => {
      console.error('Error fetching product data:', error);
      // Keep the loading state if fetch fails
    });
}

// Remove from compare function (called from modal)
function removeFromCompare(productId) {
  const index = arr_compare_list.findIndex(item => (typeof item === 'object' ? item.id : item) === productId.toString());
  if (index > -1) {
    arr_compare_list.splice(index, 1);
    localStorage.setItem(nameCachedCompare, JSON.stringify(arr_compare_list));
    
    // Update all buttons for this product
    updateAllCompareButtons(productId.toString(), 'add');
    
    // Check if compare list is now empty
    if (arr_compare_list.length === 0) {
      // Close modal if no products left
      const modal = document.getElementById('compare');
      if (modal) {
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
          bootstrapModal.hide();
        }
        
        // Clean up modal state
        cleanupModal();
      }
    } else {
      // Update modal content if products remain
      updateCompareModalContent();
    }
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('theme4:compare:update', {
      bubbles: true,
      detail: arr_compare_list
    }));
  }
}

// Clean up modal state
function cleanupModal() {
  // Remove all modal backdrops
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => {
    backdrop.remove();
  });
  
  // Remove modal-open class from body and reset styles
  document.body.classList.remove('modal-open');
  document.body.style.paddingRight = '';
  document.body.style.overflow = '';
  
  // Force scroll restoration
  document.body.style.position = '';
  document.body.style.top = '';
  
  // Additional cleanup for any remaining modal styles
  const modal = document.getElementById('compare');
  if (modal) {
    modal.classList.remove('show');
    modal.style.display = '';
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.removeAttribute('role');
  }
}

// Clear all compare items
function clearCompare() {
  arr_compare_list = [];
  localStorage.setItem(nameCachedCompare, JSON.stringify(arr_compare_list));
  
  // Update all compare buttons
  const compareButtons = document.querySelectorAll('.compare a[data-product-id], .btn-add-compare[data-product-id]');
  compareButtons.forEach(button => {
    const icon = button.querySelector('.icon');
    const tooltip = button.querySelector('.tooltip');
    
    if (button.classList.contains('btn-add-compare')) {
      icon.classList.remove('icon-check');
      icon.classList.add('icon-compare2');
      // Handle text switching with JavaScript
      const compareText = button.querySelector('span.compare-text');
      const browseText = button.querySelector('span.browse-text');
      if (compareText) compareText.style.display = 'inline';
      if (browseText) browseText.style.display = 'none';
    } else {
      icon.classList.remove('icon-trash');
      icon.classList.add('icon-compare');
    }
    if (tooltip) tooltip.textContent = 'Add to Compare';
    button.setAttribute('data-action', 'add');
  });
  
  // Update modal content
  updateCompareModalContent();
  
  // Close modal
  const modal = document.getElementById('compare');
  if (modal) {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    if (bootstrapModal) {
      bootstrapModal.hide();
    }
    
    // Clean up modal state
    cleanupModal();
  }
  
  // Dispatch custom event
  document.dispatchEvent(new CustomEvent('theme4:compare:update', {
    bubbles: true,
    detail: arr_compare_list
  }));
} 