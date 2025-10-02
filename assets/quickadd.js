// Quick Add Modal JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('quickAdd');
    if (!modal) return;

    // Listen for quick add button clicks (ignore clicks inside the modal)
    document.addEventListener('click', function(e) {
        const quickAddBtn = e.target.closest('[data-quick-add="true"], .product-quick-add-button');
        if (!quickAddBtn) return;
        // Do not react to clicks originating inside this modal
        if (modal.contains(quickAddBtn)) return;

        const data = quickAddBtn.dataset || {};
        if (!data.productId || !data.productHandle) return;

        e.preventDefault();
        loadProductIntoModal(data);
    });

    // Load product data into modal
    function loadProductIntoModal(productData) {
        // Update basic product info
        const productImage = modal.querySelector('#modal-product-image');
        const productTitle = modal.querySelector('#modal-product-title');
        const productPrice = modal.querySelector('#modal-product-price');
        const productComparePrice = modal.querySelector('#modal-product-compare-price');
        const productDiscount = modal.querySelector('#modal-product-discount');
        
        if (productImage) {
            productImage.src = productData.productImage;
            productImage.alt = productData.productTitle;
        }
        
        if (productTitle) {
            productTitle.textContent = productData.productTitle;
            productTitle.href = productData.productUrl;
        }
        
        if (productPrice && productData.productPrice) {
            productPrice.textContent = formatMoney(productData.productPrice);
        }
        
        // Handle compare price and discount
        const comparePrice = parseInt(productData.productComparePrice || 0);
        const price = parseInt(productData.productPrice || 0);
        
        if (comparePrice > price) {
            if (productComparePrice) {
                productComparePrice.textContent = formatMoney(comparePrice);
                productComparePrice.style.display = 'inline';
            }
            if (productDiscount) {
                const discount = Math.round(((comparePrice - price) / comparePrice) * 100);
                const T = (window.ShopifyTranslations && window.ShopifyTranslations.quickadd) || {};
                const PERCENT_OFF = T.percent_off || '% Off';
                productDiscount.textContent = `${discount} ${PERCENT_OFF}`.trim();
                productDiscount.style.display = 'inline';
            }
        } else {
            if (productComparePrice) productComparePrice.style.display = 'none';
            if (productDiscount) productDiscount.style.display = 'none';
        }
        
        // Update links
        const buyNowLink = modal.querySelector('#modal-buy-now');
        const paymentLink = modal.querySelector('#modal-payment-link');
        const wishlistButton = modal.querySelector('#modal-wishlist-button');
        const compareButton = modal.querySelector('#modal-compare-button');
        
        if (buyNowLink) buyNowLink.href = productData.productUrl;
        if (paymentLink) paymentLink.href = productData.productUrl;
        
        // Update wishlist button with product data
        if (wishlistButton) {
            wishlistButton.dataset.productId = productData.productId;
            wishlistButton.dataset.productHandle = productData.productHandle;
            const T = (window.ShopifyTranslations && window.ShopifyTranslations.wishlist) || {};
            const ADD_TO_WISHLIST = T.add_to_wishlist || 'Add to Wishlist';
            wishlistButton.setAttribute('aria-label', `${ADD_TO_WISHLIST.replace('Add to ', 'Add ')} ${productData.productTitle}`);
        }
        
        // Update compare button with product data
        if (compareButton) {
            compareButton.dataset.productId = productData.productId;
            compareButton.dataset.productHandle = productData.productHandle;
            const T = (window.ShopifyTranslations && window.ShopifyTranslations.products && window.ShopifyTranslations.products.product) || {};
            const ADD_TO_COMPARE = T.add_to_compare || 'Add to Compare';
            compareButton.setAttribute('aria-label', `${ADD_TO_COMPARE.replace('Add to ', 'Add ')} ${productData.productTitle}`);
        }
        
        // Re-initialize wishlist and compare buttons after updating data attributes
        if (typeof initializeWishlistButtons === 'function') {
            initializeWishlistButtons();
        }
        if (typeof initializeCompareButtons === 'function') {
            initializeCompareButtons();
        }
        
        // Also manually initialize the modal buttons as a fallback
        initializeModalButtons();
        
        // Load product variants
        loadProductVariants(productData.productHandle);
        
        // Close search modal if it's open
        const searchModal = bootstrap.Offcanvas.getInstance(document.getElementById('search'));
        if (searchModal) {
            searchModal.hide();
        }
        
        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    // Load product variants
    function loadProductVariants(productHandle) {
        fetch(`/products/${productHandle}.js`)
            .then(response => response.json())
            .then(product => {
                const variantsContainer = modal.querySelector('#modal-product-variants');
                if (!variantsContainer) return;
                
                if (product.variants.length > 1) {
                    variantsContainer.style.display = 'block';
                    variantsContainer.innerHTML = generateVariantsHTML(product);
                    setupVariantHandlers(product);
                } else {
                    variantsContainer.style.display = 'none';
                }
                
                // Update add to cart button
                const addToCartBtn = modal.querySelector('#modal-add-to-cart');
                if (addToCartBtn) {
                    addToCartBtn.dataset.productId = product.id;
                    addToCartBtn.dataset.variantId = product.variants[0].id;
                    addToCartBtn.dataset.selectedVariant = product.variants[0].id;
                    addToCartBtn.disabled = !product.variants[0].available;
                    const T = (window.ShopifyTranslations && window.ShopifyTranslations.quickadd) || {};
                    const ADD_TO_CART = T.add_to_cart || 'Add to cart';
                    const SOLD_OUT = T.sold_out || 'Sold Out';
                    addToCartBtn.textContent = product.variants[0].available ? ADD_TO_CART : SOLD_OUT;
                }
            })
            .catch(error => console.error('Error loading product:', error));
    }

    // Generate variants HTML using same structure as main product
    function generateVariantsHTML(product) {
        let html = '';
        
        product.options.forEach((option, optionIndex) => {
            if (option.name === 'Color' || option.name === 'Colour') {
                html += `
                    <div class="quickadd-variant-color">
                        <div class="variant-label text-md">${option.name}: <span class="variant-value">${option.values[0]}</span></div>
                        <div class="variant-picker-values">
                `;
                
                option.values.forEach(value => {
                    const variant = product.variants.find(v => v.options[optionIndex] === value);
                    const isActive = value === option.values[0];
                    const isSoldOut = !variant.available;
                    
                    html += `
                        <div class="hover-tooltip tooltip-bot color-btn${isActive ? ' active' : ''}${isSoldOut ? ' out-of-stock' : ''}" 
                            data-option="${option.name | handle}"
                            data-value="${value | handle}">
                            <span class="check-color bg-${value.toLowerCase().replace(/\s+/g, '-')}"></span>
                            <span class="tooltip">${value}${isSoldOut ? ` (${((window.ShopifyTranslations && window.ShopifyTranslations.quickadd) || {}).out_of_stock || 'Out of stock'})` : ''}</span>
                            ${isSoldOut ? '<div class="out-of-stock-overlay"><span class="slash">/</span></div>' : ''}
                        </div>
                    `;
                });
                
                html += '</div></div>';
            } else {
                html += `
                    <div class="quickadd-variant-option">
                        <div class="variant-label text-md">${option.name}: <span class="variant-value">${option.values[0]}</span></div>
                        <select class="form-select variant-select" data-option="${option.name}">
                `;
                
                option.values.forEach(value => {
                    const variant = product.variants.find(v => v.options[optionIndex] === value);
                    const isSelected = value === option.values[0];
                    const isSoldOut = !variant.available;
                    
                    html += `
                        <option value="${value}" data-variant-id="${variant.id}"${isSelected ? ' selected' : ''}${isSoldOut ? ' disabled' : ''}>
                            ${value}${isSoldOut ? ` - ${((window.ShopifyTranslations && window.ShopifyTranslations.quickadd) || {}).sold_out || 'Sold Out'}` : ''}
                        </option>
                    `;
                });
                
                html += '</select></div>';
            }
        });
        
        return html;
    }

    // Setup variant handlers
    function setupVariantHandlers(product) {
        const colorButtons = modal.querySelectorAll('.color-btn');
        const variantSelects = modal.querySelectorAll('.variant-select');
        const addToCartBtn = modal.querySelector('#modal-add-to-cart');

        // Color button handlers
        colorButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                if (this.classList.contains('out-of-stock')) return;
                
                // Remove active class from siblings
                const siblings = this.parentNode.querySelectorAll('.color-btn');
                siblings.forEach(function(sibling) {
                    sibling.classList.remove('active');
                });
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update variant selection
                updateVariantSelection();
            });
        });

        // Select dropdown handlers
        variantSelects.forEach(function(select) {
            select.addEventListener('change', function() {
                updateVariantSelection();
            });
        });

        function updateVariantSelection() {
            // Check active color button
            const activeColorBtn = modal.querySelector('.color-btn.active');
            if (activeColorBtn) {
                const value = activeColorBtn.dataset.value;
                
                // Find variant that matches this option
                const variant = product.variants.find(v => {
                    return v.options.some(option => 
                        option.toLowerCase().replace(/\s+/g, '-') === value
                    );
                });
                
                if (variant) {
                    addToCartBtn.dataset.variantId = variant.id;
                    addToCartBtn.dataset.selectedVariant = variant.id;
                    addToCartBtn.disabled = !variant.available;
                    const T = (window.ShopifyTranslations && window.ShopifyTranslations.quickadd) || {};
                    const ADD_TO_CART = T.add_to_cart || 'Add to cart';
                    const SOLD_OUT = T.sold_out || 'Sold Out';
                    addToCartBtn.textContent = variant.available ? ADD_TO_CART : SOLD_OUT;
                }
            }
        }
    }

    // Quantity controls for modal
    modal.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-decrease')) {
            e.preventDefault();
            const quantityInput = e.target.nextElementSibling;
            let value = parseInt(quantityInput.value) || 1;
            if (value > 1) {
                value--;
                quantityInput.value = value;
                updateCartButtonQuantity(value);
            }
        }
        
        if (e.target.classList.contains('btn-increase')) {
            e.preventDefault();
            const quantityInput = e.target.previousElementSibling;
            let value = parseInt(quantityInput.value) || 1;
            value++;
            quantityInput.value = value;
            updateCartButtonQuantity(value);
        }
    });

    // Update cart button quantity attribute
    function updateCartButtonQuantity(quantity) {
        const addToCartBtn = modal.querySelector('#modal-add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.setAttribute('data-quantity', quantity);
        }
    }

    // Helper function to format money
    function formatMoney(cents) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(cents / 100);
    }
    
    // Manual initialization for modal buttons
    function initializeModalButtons() {
        // Initialize wishlist button
        const wishlistButton = modal.querySelector('#modal-wishlist-button');
        if (wishlistButton) {
            const productId = wishlistButton.getAttribute('data-product-id');
            const productHandle = wishlistButton.getAttribute('data-product-handle');
            
            // Remove existing event listeners
            wishlistButton.replaceWith(wishlistButton.cloneNode(true));
            const newWishlistButton = modal.querySelector('#modal-wishlist-button');
            
            // Add click event
            newWishlistButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Check if product is in wishlist
                const isInWishlist = window.arr_wishlist_list && window.arr_wishlist_list.includes(productId);
                
                if (isInWishlist) {
                    // Remove from wishlist
                    const index = window.arr_wishlist_list.indexOf(productId);
                    if (index > -1) {
                        window.arr_wishlist_list.splice(index, 1);
                        localStorage.setItem('gravio:wishlist:id', window.arr_wishlist_list.toString());
                    }
                    
                    // Update button state
                    const icon = newWishlistButton.querySelector('.icon');
                    if (icon) {
                        icon.classList.remove('icon-trash');
                        icon.classList.add('icon-heart2');
                    }
                    const tooltip = newWishlistButton.querySelector('.tooltip');
                    if (tooltip) {
                        const T = (window.ShopifyTranslations && window.ShopifyTranslations.products && window.ShopifyTranslations.products.product) || {};
                        tooltip.textContent = T.add_to_wishlist || 'Add to Wishlist';
                    }
                } else {
                    // Add to wishlist
                    if (!window.arr_wishlist_list) window.arr_wishlist_list = [];
                    if (window.arr_wishlist_list.length >= 50) {
                        window.arr_wishlist_list.splice(49, 1);
                    }
                    window.arr_wishlist_list.unshift(productId);
                    localStorage.setItem('gravio:wishlist:id', window.arr_wishlist_list.toString());
                    
                    // Update button state
                    const icon = newWishlistButton.querySelector('.icon');
                    if (icon) {
                        icon.classList.remove('icon-heart2');
                        icon.classList.add('icon-trash');
                    }
                    const tooltip = newWishlistButton.querySelector('.tooltip');
                    if (tooltip) {
                        const T = (window.ShopifyTranslations && window.ShopifyTranslations.products && window.ShopifyTranslations.products.product) || {};
                        tooltip.textContent = T.remove_from_wishlist || 'Remove from Wishlist';
                    }
                }
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('gravio:wishlist:update', {
                    bubbles: true,
                    detail: window.arr_wishlist_list
                }));
            });
        }
        
        // Initialize compare button
        const compareButton = modal.querySelector('#modal-compare-button');
        if (compareButton) {
            const productId = compareButton.getAttribute('data-product-id');
            const productHandle = compareButton.getAttribute('data-product-handle');
            
            // Remove existing event listeners
            compareButton.replaceWith(compareButton.cloneNode(true));
            const newCompareButton = modal.querySelector('#modal-compare-button');
            
            // Add click event
            newCompareButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Use the global compare functions if available
                if (typeof handleCompareClick === 'function') {
                    // Make sure the button has the right classes for the global function
                    newCompareButton.classList.add('compare');
                    handleCompareClick(newCompareButton, productId, productHandle);
                } else {
                    
                    // Check if product is in compare
                    const isInCompare = window.arr_compare_list && window.arr_compare_list.some(item => 
                        (typeof item === 'object' ? item.id : item) === productId
                    );
                    
                    if (isInCompare) {
                        // Open compare modal using global function
                        if (typeof openCompareModal === 'function') {
                            openCompareModal();
                        } else {
                            // Fallback: open modal manually
                            const compareModal = document.getElementById('compare');
                            if (compareModal) {
                                const bootstrapModal = new bootstrap.Modal(compareModal);
                                bootstrapModal.show();
                            }
                        }
                    } else {
                        // Add to compare
                        if (!window.arr_compare_list) window.arr_compare_list = [];
                        if (window.arr_compare_list.length >= 6) {
                            window.arr_compare_list.splice(5, 1);
                        }
                        window.arr_compare_list.unshift({ id: productId, handle: productHandle });
                        localStorage.setItem('gravio:compare:id', JSON.stringify(window.arr_compare_list));
                        
                        // Update button state
                        const icon = newCompareButton.querySelector('.icon');
                        if (icon) {
                            icon.classList.remove('icon-compare');
                            icon.classList.add('icon-check');
                        }
                        const tooltip = newCompareButton.querySelector('.tooltip');
                        if (tooltip) {
                            const T = (window.ShopifyTranslations && window.ShopifyTranslations.products && window.ShopifyTranslations.products.product) || {};
                            tooltip.textContent = T.browse_compare || 'Browse Compare';
                        }
                        
                        // Open compare modal using global function
                        if (typeof openCompareModal === 'function') {
                            openCompareModal();
                        } else {
                            // Fallback: open modal manually
                            const compareModal = document.getElementById('compare');
                            if (compareModal) {
                                const bootstrapModal = new bootstrap.Modal(compareModal);
                                bootstrapModal.show();
                            }
                        }
                    }
                    
                    // Dispatch event
                    document.dispatchEvent(new CustomEvent('gravio:compare:update', {
                        bubbles: true,
                        detail: window.arr_compare_list
                    }));
                }
            });
        }
    }
});
