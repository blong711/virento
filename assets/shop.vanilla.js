/**
 * Shop functionality in vanilla JavaScript
 * Includes price range, filtering, sorting, layout switching, and loading
 */
//collection

// Initialize all shop functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize global layout state based on theme settings
    if (window.collectionData && window.collectionData.defaultLayoutType === 'list') {
        isListActive = true;
    } else {
        isListActive = false;
    }
    
    // Initialize total products count from DOM data attribute
    const totalProductsElement = document.querySelector('section[data-total-products]');
    if (totalProductsElement) {
        window.totalProducts = parseInt(totalProductsElement.getAttribute('data-total-products')) || 0;
    } else {
        window.totalProducts = 0;
    }
    
    // Initialize filters from URL parameters first (this will override defaults)
    initializeFiltersFromURL();
    
    // Then initialize other components
    initializeFilters(); // Initialize filter values
    initPriceRange();
    initProductFilters();
    initSortFunctionality();
    initLayoutSwitching();
    // Skip load more if using Shopify pagination
    if (document.querySelector('.loadmore')) {
        initLoadMore();
    }
    bindProductEvents(); // Initialize product events
    initBrowserNavigation(); // Initialize browser navigation handler
    
    // Ensure product count visibility is correct on initial page load
    setTimeout(() => {
        updateProductCountVisibility();
    }, 100);
    
    // Also ensure it's correct after a longer delay to handle theme customization
    setTimeout(() => {
        updateProductCountVisibility();
    }, 1000);
    
    // Handle theme customizer changes
    if (window.Shopify && window.Shopify.designMode) {
        // Listen for theme customizer events
        document.addEventListener('shopify:section:load', () => {
            setTimeout(() => {
                // Reinitialize price slider if it exists
                reinitializePriceSlider();
                // Update layout based on current settings
                updateLayoutFromSettings();
                updateProductCountVisibility();
            }, 100);
        });
        
        document.addEventListener('shopify:section:reorder', () => {
            setTimeout(() => {
                // Reinitialize price slider if it exists
                reinitializePriceSlider();
                // Update layout based on current settings
                updateLayoutFromSettings();
                updateProductCountVisibility();
            }, 100);
        });
        
        // Listen for section setting changes
        document.addEventListener('shopify:section:select', () => {
            setTimeout(() => {
                // Update layout based on current settings when section is selected
                updateLayoutFromSettings();
            }, 100);
        });
        
        // Watch for changes in the collectionData script tag
        const collectionDataScript = document.querySelector('script');
        if (collectionDataScript && collectionDataScript.textContent.includes('collectionData')) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        // Check if the script content has changed
                        if (mutation.target.textContent && mutation.target.textContent.includes('collectionData')) {
                            // Parse the new collectionData
                            try {
                                const scriptContent = mutation.target.textContent;
                                const match = scriptContent.match(/window\.collectionData\s*=\s*({[^}]+})/);
                                if (match) {
                                    const newCollectionData = JSON.parse(match[1]);
                                    window.collectionData = newCollectionData;
                                    
                                    // Update layout based on new settings
                                    setTimeout(() => {
                                        updateLayoutFromSettings();
                                    }, 50);
                                }
                            } catch (e) {
                                // Ignore parsing errors
                            }
                        }
                    }
                });
            });
            
            observer.observe(collectionDataScript, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }
        
        // Also listen for window resize events in theme customizer
        let customizerResizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(customizerResizeTimeout);
            customizerResizeTimeout = setTimeout(() => {
                // Reinitialize price slider if it exists
                reinitializePriceSlider();
                // Update layout based on current settings
                updateLayoutFromSettings();
                updateProductCountVisibility();
            }, 200);
        });
    }
});

// Price Range Slider
function initPriceRange() {
    const priceSlider = document.getElementById('price-value-range');
    if (!priceSlider) return;

    const minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
    const maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;

    // Initialize global filters with correct values
    filters.minPrice = minPrice;
    filters.maxPrice = maxPrice;

    noUiSlider.create(priceSlider, {
        start: [minPrice, maxPrice],
        connect: true,
        step: 1,
        range: {
            'min': minPrice,
            'max': maxPrice
        },
        format: {
            from: value => parseInt(value, 10),
            to: value => parseInt(value, 10)
        }
    });

    const minValueDisplay = document.getElementById('price-min-value');
    const maxValueDisplay = document.getElementById('price-max-value');
    
    // Initialize display with currency symbol
    if (minValueDisplay && maxValueDisplay) {
        const currency = minValueDisplay.dataset.currency || '$';
        minValueDisplay.textContent = currency + minPrice;
        maxValueDisplay.textContent = currency + maxPrice;
    }

    priceSlider.noUiSlider.on('change', (values, handle) => {
        const displays = [minValueDisplay, maxValueDisplay];
        const currency = displays[handle].dataset.currency || '$';
        displays[handle].textContent = currency + values[handle];
        
        // Update global filters
        filters.minPrice = parseInt(values[0], 10);
        filters.maxPrice = parseInt(values[1], 10);
        
        // Apply filters after user stops dragging (debounced)
        clearTimeout(priceSlider.debounceTimer);
        priceSlider.debounceTimer = setTimeout(() => {
            applyServerSideFilters();
        }, 500);
    });
    
    // Update display values during drag
    priceSlider.noUiSlider.on('update', (values, handle) => {
        const displays = [minValueDisplay, maxValueDisplay];
        const currency = displays[handle].dataset.currency || '$';
        displays[handle].textContent = currency + values[handle];
    });
}

// Function to reinitialize price slider (useful for theme customizer changes)
function reinitializePriceSlider() {
    const priceSlider = document.getElementById('price-value-range');
    if (!priceSlider) return;

    // Destroy existing slider if it exists
    if (priceSlider.noUiSlider) {
        priceSlider.noUiSlider.destroy();
    }

    // Get fresh values from dataset
    const minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
    const maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;

    // Update global filters with fresh values
    filters.minPrice = minPrice;
    filters.maxPrice = maxPrice;

    // Create new slider instance
    noUiSlider.create(priceSlider, {
        start: [minPrice, maxPrice],
        connect: true,
        step: 1,
        range: {
            'min': minPrice,
            'max': maxPrice
        },
        format: {
            from: value => parseInt(value, 10),
            to: value => parseInt(value, 10)
        }
    });

    const minValueDisplay = document.getElementById('price-min-value');
    const maxValueDisplay = document.getElementById('price-max-value');
    
    // Update display with fresh values and currency symbol
    if (minValueDisplay && maxValueDisplay) {
        const currency = minValueDisplay.dataset.currency || '$';
        minValueDisplay.textContent = currency + minPrice;
        maxValueDisplay.textContent = currency + maxPrice;
    }

    // Reattach event listeners
    priceSlider.noUiSlider.on('change', (values, handle) => {
        const displays = [minValueDisplay, maxValueDisplay];
        const currency = displays[handle].dataset.currency || '$';
        displays[handle].textContent = currency + values[handle];
        
        // Update global filters
        filters.minPrice = parseInt(values[0], 10);
        filters.maxPrice = parseInt(values[1], 10);
        
        // Apply filters after user stops dragging (debounced)
        clearTimeout(priceSlider.debounceTimer);
        priceSlider.debounceTimer = setTimeout(() => {
            applyServerSideFilters();
        }, 500);
    });
    
    // Update display values during drag
    priceSlider.noUiSlider.on('update', (values, handle) => {
        const displays = [minValueDisplay, maxValueDisplay];
        const currency = displays[handle].dataset.currency || '$';
        displays[handle].textContent = currency + values[handle];
    });
}

// Function to update layout based on current theme settings
function updateLayoutFromSettings() {
    // Check if collectionData is available and has been updated
    if (!window.collectionData) return;
    
    const newDefaultLayoutType = window.collectionData.defaultLayoutType;
    const newDefaultGridLayout = window.collectionData.defaultGridLayout;
    
    // Update global layout state
    if (newDefaultLayoutType === 'list') {
        isListActive = true;
    } else {
        isListActive = false;
    }
    
    // Update wrapper classes
    const wrapper = document.querySelector('.wrapper-control-shop');
    if (wrapper) {
        if (isListActive) {
            wrapper.classList.add('listLayout-wrapper');
            wrapper.classList.remove('gridLayout-wrapper');
        } else {
            wrapper.classList.add('gridLayout-wrapper');
            wrapper.classList.remove('listLayout-wrapper');
        }
    }
    
    // Update layout display
    const gridLayout = document.getElementById('gridLayout');
    const listLayout = document.getElementById('listLayout');
    
    if (isListActive) {
        // Show list layout, hide grid layout
        if (gridLayout) gridLayout.style.display = 'none';
        if (listLayout) listLayout.style.display = '';
        
        // Update active state for layout buttons
        document.querySelectorAll('.tf-view-layout-switch').forEach(btn => btn.classList.remove('active'));
        const listLayoutBtn = document.querySelector('.tf-view-layout-switch[data-value-layout="list"]');
        if (listLayoutBtn) listLayoutBtn.classList.add('active');
    } else {
        // Show grid layout, hide list layout
        if (listLayout) listLayout.style.display = 'none';
        if (gridLayout) {
            gridLayout.style.display = '';
        }
        
        // Update active state for layout buttons
        document.querySelectorAll('.tf-view-layout-switch').forEach(btn => btn.classList.remove('active'));
        if (newDefaultGridLayout) {
            const defaultLayoutBtn = document.querySelector(`.tf-view-layout-switch[data-value-layout="${newDefaultGridLayout}"]`);
            if (defaultLayoutBtn) defaultLayoutBtn.classList.add('active');
        }
        
        // Call updateLayoutDisplay to ensure responsive behavior is applied
        // Only call updateLayoutDisplay if not on mobile to prevent overriding mobile layout
        if (!isMobileDevice()) {
            updateLayoutDisplay();
        }
    }
    
    // Update product count visibility
    updateProductCountVisibility();
}

// Product Filtering System
const filters = {
    minPrice: 0,
    maxPrice: 500,
    size: null,
    color: null,
    availability: null,
    brands: null,
    sale: false
};

// Global layout state
let isListActive = false;

// Better mobile detection function
function isMobileDevice() {
    // Check if we're in theme customizer mobile preview
    if (window.Shopify && window.Shopify.designMode) {
        // In theme customizer, check if the preview is in mobile mode
        // This can be detected by checking if the body has mobile-specific classes
        // or by checking the actual preview container width
        const previewContainer = document.querySelector('.shopify-section-group-header-group') || 
                                document.querySelector('.shopify-section-group') ||
                                document.body;
        
        if (previewContainer) {
            const computedStyle = window.getComputedStyle(previewContainer);
            const maxWidth = computedStyle.maxWidth;
            const width = previewContainer.offsetWidth;
            
            // If the container is constrained to mobile width, we're in mobile preview
            if (maxWidth && (maxWidth.includes('375px') || maxWidth.includes('414px') || maxWidth.includes('480px'))) {
                return true;
            }
            
            // If the actual width is mobile-sized
            if (width <= 480) {
                return true;
            }
        }
    }
    
    // Fallback to window width check
    return window.innerWidth <= 767;
}

// Initialize filters with price slider values
function initializeFilters() {
    const priceSlider = document.getElementById('price-value-range');
    if (priceSlider) {
        filters.minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
        filters.maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;
    }
    
    // Use collection data if available
    if (window.collectionData) {
        filters.minPrice = window.collectionData.priceMin || filters.minPrice;
        filters.maxPrice = window.collectionData.priceMax || filters.maxPrice;
    }
    

}

function initProductFilters() {
    // Size filter
    document.querySelectorAll('.size-check').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all size buttons
            document.querySelectorAll('.size-check').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            filters.size = this.querySelector('.size').textContent.trim();

            applyServerSideFilters();
            updateMetaFilter();
        });
    });

    // Color filter
    document.querySelectorAll('.color-check').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all color buttons
            document.querySelectorAll('.color-check').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            filters.color = this.querySelector('.color-text').textContent.trim();

            applyServerSideFilters();
            updateMetaFilter();
        });
    });

    // Availability filter
    document.querySelectorAll('input[name="availability"]').forEach(input => {
        input.addEventListener('change', function() {
            filters.availability = this.id === 'inStock' ? (window.translations?.shop?.in_stock || 'In stock') : (window.translations?.shop?.out_of_stock || 'Out of stock');
            applyServerSideFilters();
            updateMetaFilter();
        });
    });

    // Brand filter
    document.querySelectorAll('input[name="brand"]').forEach(input => {
        input.addEventListener('change', function() {
            filters.brands = this.id;
            applyServerSideFilters();
            updateMetaFilter();
        });
    });

    // Sale filter
    const saleText = document.querySelector('.shop-sale-text');
    if (saleText) {
        saleText.addEventListener('click', function() {
            filters.sale = !filters.sale;
            this.classList.toggle('active', filters.sale);
            applyServerSideFilters();
            updateMetaFilter();
        });
    }

    // Remove filter tags
    document.getElementById('applied-filters')?.addEventListener('click', e => {
        if (e.target.classList.contains('remove-tag')) {
            const filterType = e.target.dataset.filter;
            removeFilter(filterType);
        }
    });

    // Reset all filters
    ['remove-all', 'reset-filter'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => {
            // Reset filters and reload products without page reload
            resetAllFilters();
        });
    });

    // Reset price
    document.querySelector('.reset-price')?.addEventListener('click', () => {
        const priceSlider = document.getElementById('price-value-range');
        if (priceSlider) {
            const minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
            const maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;
            priceSlider.noUiSlider.set([minPrice, maxPrice]);
            filters.minPrice = minPrice;
            filters.maxPrice = maxPrice;
            // Apply the reset price filter to clear any active price filtering
            applyServerSideFilters();
        }
    });
}

function removeFilter(filterType) {
    if (filterType === "size") {
        filters.size = null;
        document.querySelectorAll('.size-check').forEach(btn => btn.classList.remove('active'));
    }
    if (filterType === "color") {
        filters.color = null;
        document.querySelectorAll('.color-check').forEach(btn => btn.classList.remove('active'));
    }
    if (filterType === "availability") {
        filters.availability = null;
        document.querySelectorAll('input[name="availability"]').forEach(input => input.checked = false);
    }
    if (filterType === "brands") {
        filters.brands = null;
        document.querySelectorAll('input[name="brand"]').forEach(input => input.checked = false);
    }
    if (filterType === "price") {
        const priceSlider = document.getElementById('price-value-range');
        if (priceSlider) {
            const minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
            const maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;
            priceSlider.noUiSlider.set([minPrice, maxPrice]);
            filters.minPrice = minPrice;
            filters.maxPrice = maxPrice;
        }
    }
    if (filterType === "sale") {
        filters.sale = false;
        document.querySelector('.shop-sale-text')?.classList.remove('active');
    }
    
    applyServerSideFilters();
    updateMetaFilter();
}

function resetAllFilters() {
    filters.size = null;
    filters.color = null;
    filters.availability = null;
    filters.brands = null;
    
    const priceSlider = document.getElementById('price-value-range');
    if (priceSlider) {
        const minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
        const maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;
        priceSlider.noUiSlider.set([minPrice, maxPrice]);
        filters.minPrice = minPrice;
        filters.maxPrice = maxPrice;
    }
    
    filters.sale = false;
    
    // Reset UI elements
    document.querySelector('.shop-sale-text')?.classList.remove('active');
    document.querySelectorAll('input[name="brand"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[name="availability"]').forEach(input => input.checked = false);
    document.querySelectorAll('.size-check, .color-check').forEach(btn => btn.classList.remove('active'));
    
    // Update URL to base collection without filters but preserve search query
    const currentUrl = new URL(window.location);
    const searchQuery = currentUrl.searchParams.get('q'); // Preserve search query
    
    // Clear all filter parameters but keep the search query
    currentUrl.searchParams.delete('filter.v.option.size');
    currentUrl.searchParams.delete('filter.v.option.color');
    currentUrl.searchParams.delete('filter.v.availability');
    currentUrl.searchParams.delete('filter.p.vendor');
    currentUrl.searchParams.delete('filter.v.price.gte');
    currentUrl.searchParams.delete('filter.v.price.lte');
    currentUrl.searchParams.delete('filter.v.compare_at_price.gt');
    currentUrl.searchParams.delete('tag');
    
    // Re-add the search query if it exists
    if (searchQuery) {
        currentUrl.searchParams.set('q', searchQuery);
    }
    
    const baseUrl = currentUrl.toString();
    updateURLWithoutReload(baseUrl);
    
    // Fetch products without filters using AJAX
    fetchFilteredProducts(baseUrl);
    updateMetaFilter();
}

// Server-side filtering using AJAX to avoid page reloads
function applyServerSideFilters() {
    // Build the filter URL using the enhanced function
    const filterUrl = buildFilterURL();
    

    
    // Use AJAX to fetch filtered products instead of navigating
    fetchFilteredProducts(filterUrl);
}

// AJAX function to fetch filtered products
function fetchFilteredProducts(filterUrl) {
    // Show loading state
    showFilterLoadingState(true);
    
    // Use the filter URL directly without adding ajax view parameters
    // This prevents 404 errors when the ajax view doesn't exist
    const ajaxUrl = filterUrl;
    
    // Check if fetch is available, otherwise fallback to XMLHttpRequest
    if (window.fetch) {
        fetch(ajaxUrl, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'text/html, application/xhtml+xml'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            handleFilterResponse(html, filterUrl);
        })
        .catch(error => {
            handleFilterError(error, filterUrl);
        })
        .finally(() => {
            // Hide loading state
            showFilterLoadingState(false);
        });
    } else {
        // Fallback for older browsers
        const xhr = new XMLHttpRequest();
        xhr.open('GET', ajaxUrl, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Accept', 'text/html, application/xhtml+xml');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    handleFilterResponse(xhr.responseText, filterUrl);
                } else {
                    handleFilterError(new Error(`HTTP ${xhr.status}`), filterUrl);
                }
                // Hide loading state
                showFilterLoadingState(false);
            }
        };
        
        xhr.onerror = function() {
            handleFilterError(new Error(window.translations?.shop?.network_error || 'Network error occurred'), filterUrl);
            showFilterLoadingState(false);
        };
        
        xhr.send();
    }
}

// Handle the filter response
function handleFilterResponse(html, filterUrl) {
    try {
        // Parse the HTML response
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract products from the response
        const newGridProducts = doc.querySelector('#gridLayout');
        const newListProducts = doc.querySelector('#listLayout');
        
        // Get total products from the response HTML
        const totalProducts = getTotalProductsFromResponse(doc);
        
            updateProductsWithoutReload(newGridProducts, newListProducts);
            
            // Update URL without reloading (for bookmarking/sharing)
            updateURLWithoutReload(filterUrl);
            
            // Rebind product events for new products
            bindProductEvents();
            
            // Update meta filter display
            updateMetaFilter(); 
            
            // Scroll to top of products section
            scrollToProducts();

            // Update product count
            updateProductCount(totalProducts);
            
            // Ensure product count visibility is correct after filtering
            updateProductCountVisibility();
            
            // Trigger custom event for other scripts
            document.dispatchEvent(new CustomEvent('productsFiltered', {
                detail: { productCount: totalProducts, filters: filters }
            }));
            
            // Reset AJAX failure counter on success
            resetAjaxFailureCount();
    } catch (error) {
        // Trigger error event
        document.dispatchEvent(new CustomEvent('filterParseError', {
            detail: { error: error.message, html: html.substring(0, 200) }
        }));
    }
}

// Update products without page reload
function updateProductsWithoutReload(newGridProducts, newListProducts) {
    const currentGridLayout = document.getElementById('gridLayout');
    const currentListLayout = document.getElementById('listLayout');
    
    // Add transition class for smooth updates
    if (currentGridLayout) currentGridLayout.classList.add('filter-transition');
    if (currentListLayout) currentListLayout.classList.add('filter-transition');
    
    // Fade out current products
    setTimeout(() => {
        if (currentGridLayout) currentGridLayout.classList.add('fade-out');
        if (currentListLayout) currentListLayout.classList.add('fade-out');
        
        // Update content after fade out
        setTimeout(() => {
            if (newGridProducts && currentGridLayout) {
                // Preserve current layout classes and data attributes
                const currentClasses = currentGridLayout.className.replace('filter-transition fade-out', '');
                const currentDataAttrs = {};
                
                // Preserve important data attributes
                ['data-current-page', 'data-total-pages', 'data-products-per-page'].forEach(attr => {
                    if (currentGridLayout.hasAttribute(attr)) {
                        currentDataAttrs[attr] = currentGridLayout.getAttribute(attr);
                    }
                });
                
                currentGridLayout.innerHTML = newGridProducts.innerHTML;
                currentGridLayout.className = currentClasses;
                
                // Restore data attributes
                Object.keys(currentDataAttrs).forEach(attr => {
                    currentGridLayout.setAttribute(attr, currentDataAttrs[attr]);
                });
            }
            
            if (newListProducts && currentListLayout) {
                currentListLayout.innerHTML = newListProducts.innerHTML;
            }
            
            // Update pagination if it exists
            updatePaginationFromResponse(newGridProducts, newListProducts);
            
            // Fade in new products
            setTimeout(() => {
                if (currentGridLayout) {
                    currentGridLayout.classList.remove('fade-out');
                    currentGridLayout.classList.add('fade-in');
                }
                if (currentListLayout) {
                    currentListLayout.classList.remove('fade-out');
                    currentListLayout.classList.add('fade-in');
                }
                
                // Remove transition classes after animation
                setTimeout(() => {
                    if (currentGridLayout) {
                        currentGridLayout.classList.remove('filter-transition', 'fade-in');
                    }
                    if (currentListLayout) {
                        currentListLayout.classList.remove('filter-transition', 'fade-in');
                    }
                }, 300);
            }, 50);
        }, 150);
    }, 50);
}

// Update pagination elements from AJAX response
function updatePaginationFromResponse(newGridProducts, newListProducts) {
    // Update grid pagination
    if (newGridProducts) {
        const newGridPagination = newGridProducts.querySelector('.wg-pagination');
        const currentGridPagination = document.querySelector('#gridLayout .wg-pagination');
        
        if (newGridPagination && currentGridPagination) {
            currentGridPagination.innerHTML = newGridPagination.innerHTML;
        } else if (newGridPagination && !currentGridPagination) {
            document.getElementById('gridLayout').appendChild(newGridPagination.cloneNode(true));
        }
    }
    
    // Update list pagination
    if (newListProducts) {
        const newListPagination = newListProducts.querySelector('.wg-pagination');
        const currentListPagination = document.querySelector('#listLayout .wg-pagination');
        
        if (newListPagination && currentListPagination) {
            currentListPagination.innerHTML = newListPagination.innerHTML;
        } else if (newListPagination && !currentListPagination) {
            document.getElementById('listLayout').appendChild(newListPagination.cloneNode(true));
        }
    }
}

// Update URL without page reload
function updateURLWithoutReload(newUrl) {
    if (window.history && window.history.pushState) {
        window.history.pushState({ path: newUrl }, '', newUrl);
    }
}

// Handle browser back/forward navigation
function handlePopState(event) {
    if (event.state && event.state.path) {
        // Re-apply filters from URL when navigating back/forward
        initializeFiltersFromURL();
        
        // Fetch products for the URL we navigated to
        fetchFilteredProducts(event.state.path);
    }
}

// Initialize popstate handler for browser navigation
function initBrowserNavigation() {
    window.addEventListener('popstate', handlePopState);
}

// Enhanced URL parameter handling
function buildFilterURL() {
    const currentUrl = new URL(window.location);
    const searchParams = currentUrl.searchParams;
    const searchQuery = searchParams.get('q'); // Preserve search query
    
    // Clear existing filter parameters
    searchParams.delete('filter.v.option.size');
    searchParams.delete('filter.v.option.color');
    searchParams.delete('filter.v.availability');
    searchParams.delete('filter.p.vendor');
    searchParams.delete('filter.v.price.gte');
    searchParams.delete('filter.v.price.lte');
    searchParams.delete('filter.v.compare_at_price.gt');
    searchParams.delete('tag');
    
    // Re-add the search query if it exists
    if (searchQuery) {
        searchParams.set('q', searchQuery);
    }
    
    // Add active filters
    if (filters.size) {
        searchParams.set('filter.v.option1', filters.size);
    }
    
    if (filters.color) {
        searchParams.set('filter.v.option.color', filters.color);
    }
    
    if (filters.availability) {
        if (filters.availability === (window.translations?.shop?.in_stock || 'In stock')) {
            searchParams.set('filter.v.availability', '1');
        } else {
            searchParams.set('filter.v.availability', '0');
        }
    }
    
    if (filters.brands) {
        searchParams.set('filter.p.vendor', filters.brands);
    }
    
    const priceSlider = document.getElementById('price-value-range');
    if (priceSlider) {
        const defaultMin = parseInt(priceSlider.dataset.min, 10) || 0;
        const defaultMax = parseInt(priceSlider.dataset.max, 10) || 500;
        
        if (filters.minPrice > defaultMin) {
            searchParams.set('filter.v.price.gte', filters.minPrice.toString());
        }
        if (filters.maxPrice < defaultMax) {
            searchParams.set('filter.v.price.lte', filters.maxPrice.toString());
        }
    }
    
    if (filters.sale) {
        searchParams.set('filter.v.compare_at_price.gt', '0');
    }
    
    return currentUrl.toString();
}

// Get total products from response HTML
function getTotalProductsFromResponse(doc) {
    // Look for the section with data-total-products attribute in the response
    const collectionSection = doc.querySelector('section[data-total-products]');
    if (collectionSection) {
        const totalProducts = parseInt(collectionSection.getAttribute('data-total-products'));
        return isNaN(totalProducts) ? 0 : totalProducts;
    }
    
    // Fallback: try to find any element with data-total-products
    const fallbackElement = doc.querySelector('[data-total-products]');
    if (fallbackElement) {
        const totalProducts = parseInt(fallbackElement.getAttribute('data-total-products'));
        return isNaN(totalProducts) ? 0 : totalProducts;
    }
        return 0;
}

// Update product count display
function updateProductCount(count) {
    // Update any product count displays
    const countElements = document.querySelectorAll('#product-count-grid, #product-count-list, .product-count, .total-products');
    countElements.forEach(el => {
        if (el.textContent.includes(window.translations?.shop?.products_found || 'Products found') || el.textContent.includes(window.translations?.shop?.products || 'products')) {
            // Update the span with class 'count' specifically
            const countSpan = el.querySelector('.count');
            if (countSpan) {
                countSpan.textContent = count;
            } else {
                // Fallback to the old method if no count span is found
                el.innerHTML = el.innerHTML.replace(/\d+/, count);
            }
        }
    });
}

// Show loading state during filtering
function showFilterLoadingState(show) {
    const wrapper = document.querySelector('.wrapper-control-shop');
    if (wrapper) {
        if (show) {
            wrapper.classList.add('filtering');
            // Add loading indicator
            if (!document.querySelector('.filter-loading')) {
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'filter-loading';
                loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
                wrapper.appendChild(loadingDiv);
            }
        } else {
            wrapper.classList.remove('filtering');
            const loadingDiv = document.querySelector('.filter-loading');
            if (loadingDiv) {
                loadingDiv.remove();
            }
        }
    }
}

// Show no products message
function showNoProductsMessage() {
    const gridLayout = document.getElementById('gridLayout');
    const listLayout = document.getElementById('listLayout');
    
    const noProductsMessage = `
        <div class="no-products-found">
            <div class="no-products-content">
                <h3>${window.translations?.shop?.no_products_found || 'No products found'}</h3>
                <p>${window.translations?.shop?.try_adjusting_filters || 'Try adjusting your filters or search criteria.'}</p>
                <button class="btn-reset-filters" onclick="resetAllFilters()">${window.translations?.shop?.reset_all_filters || 'Reset All Filters'}</button>
            </div>
        </div>
    `;
    
    if (gridLayout) {
        gridLayout.innerHTML = noProductsMessage;
    }
    if (listLayout) {
        listLayout.innerHTML = noProductsMessage;
    }
}



// Global counter for AJAX failures
let ajaxFailureCount = 0;
const MAX_AJAX_FAILURES = 3;

// Enhanced error handling for AJAX requests
function handleFilterError(error, filterUrl) {
    // Increment failure counter
    ajaxFailureCount++;
    
    // If we've had too many failures, fallback to traditional navigation
    if (ajaxFailureCount >= MAX_AJAX_FAILURES) {
        showFilterLoadingState(false);
        
        // Reset counter and use traditional navigation
        ajaxFailureCount = 0;
        window.location.href = filterUrl;
        return;
    }
    
    // Optionally send error to analytics service
    if (window.gtag) {
        window.gtag('event', 'filter_error', {
            'event_category': 'shop_filtering',
            'event_label': error.message || 'unknown_error',
            'value': ajaxFailureCount
        });
    }
}

// Reset failure counter on successful requests
function resetAjaxFailureCount() {
    ajaxFailureCount = 0;
}



// Scroll to products section
function scrollToProducts() {
    const productsSection = document.querySelector('.wrapper-shop');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Initialize filters from URL parameters when page loads
function initializeFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Initialize size filter
    const sizeFilter = urlParams.get('filter.v.option1') || urlParams.get('filter.v.option2');
    if (sizeFilter) {
        filters.size = sizeFilter;
        // Update UI to show active state
        document.querySelectorAll('.size-check').forEach(btn => {
            if (btn.querySelector('.size').textContent.trim() === sizeFilter) {
                btn.classList.add('active');
            }
        });
    }
    
    // Initialize color filter
    const colorFilter = urlParams.get('filter.v.option.color');
    if (colorFilter) {
        filters.color = colorFilter;
        // Update UI to show active state
        document.querySelectorAll('.color-check').forEach(btn => {
            if (btn.querySelector('.color-text').textContent.trim() === colorFilter) {
                btn.classList.add('active');
            }
        });
    }
    
    // Initialize availability filter
    const availabilityFilter = urlParams.get('filter.v.availability');
    if (availabilityFilter) {
        if (availabilityFilter === '1') {
            filters.availability = window.translations?.shop?.in_stock || 'In stock';
            document.getElementById('inStock').checked = true;
        } else if (availabilityFilter === '0') {
            filters.availability = window.translations?.shop?.out_of_stock || 'Out of stock';
            document.getElementById('outStock').checked = true;
        }
    }
    
    // Initialize brand filter
    const brandFilter = urlParams.get('filter.p.vendor');
    if (brandFilter) {
        filters.brands = brandFilter;
        // Update UI to show active state
        document.querySelectorAll('input[name="brand"]').forEach(input => {
            if (input.id === brandFilter) {
                input.checked = true;
            }
        });
    }
    
    // Initialize price filter
    const minPriceFilter = urlParams.get('filter.v.price.gte');
    const maxPriceFilter = urlParams.get('filter.v.price.lte');
    if (minPriceFilter || maxPriceFilter) {
        if (minPriceFilter) {
            filters.minPrice = parseInt(minPriceFilter); // Keep in dollars
        }
        if (maxPriceFilter) {
            filters.maxPrice = parseInt(maxPriceFilter); // Keep in dollars
        }
        

        
        // Update price slider
        const priceSlider = document.getElementById('price-value-range');
        if (priceSlider && priceSlider.noUiSlider) {
            priceSlider.noUiSlider.set([filters.minPrice, filters.maxPrice]);
        }
    }
    

    
    // Initialize sale filter
    const saleFilter = urlParams.get('filter.v.compare_at_price.gt');
    if (saleFilter && saleFilter === '0') {
        filters.sale = true;
        document.querySelector('.shop-sale-text')?.classList.add('active');
    }
    
    // Update meta filter display
    updateMetaFilter();
}

function updateMetaFilter() {
    const appliedFilters = document.getElementById('applied-filters');
    const metaFilterShop = document.querySelector('.meta-filter-shop');
    if (!appliedFilters || !metaFilterShop) return;

    appliedFilters.innerHTML = '';
    const tags = [];

    if (filters.availability) {
        tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="availability"></span> ${window.translations?.shop?.availability || 'Availability'}: ${filters.availability}</span>`);
    }
    if (filters.brands) {
        tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="brands"></span> ${window.translations?.shop?.brand || 'Brand'}: ${filters.brands}</span>`);
    }
    
    const priceSlider = document.getElementById('price-value-range');
    if (priceSlider) {
        const minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
        const maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;
        if (filters.minPrice > minPrice || filters.maxPrice < maxPrice) {
            // Ensure price values are in dollars, not cents
            const displayMinPrice = typeof filters.minPrice === 'number' ? filters.minPrice : 0;
            const displayMaxPrice = typeof filters.maxPrice === 'number' ? filters.maxPrice : 500;
            tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="price"></span> ${window.translations?.shop?.price || 'Price'}: $${displayMinPrice} - $${displayMaxPrice}</span>`);
        }
    }
    
    if (filters.color) {
        tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="color"></span> ${window.translations?.shop?.color || 'Color'}: ${filters.color}</span>`);
    }
    if (filters.size) {
        tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="size"></span> ${window.translations?.shop?.size || 'Size'}: ${filters.size}</span>`);
    }
    if (filters.sale) {
        tags.push(`<span class="filter-tag on-sale">${window.translations?.shop?.on_sale || 'On Sale'} <span class="remove-tag icon-close" data-filter="sale"></span></span>`);
    }

    appliedFilters.innerHTML = tags.join('');
    metaFilterShop.style.display = tags.length > 0 ? '' : 'none';
    
    const removeAllBtn = document.getElementById('remove-all');
    if (removeAllBtn) {
        removeAllBtn.style.display = tags.length > 0 ? '' : 'none';
    }
}

function updatePaginationVisibility(visibleProductCountGrid, visibleProductCountList) {
    const paginationElements = document.querySelectorAll('.wrapper-shop .wg-pagination, .wrapper-shop .tf-loading');
    
    // Always show pagination elements as Shopify handles pagination logic
    // The original logic was for load-more functionality, but we're using Shopify pagination
    paginationElements.forEach(el => el.style.display = '');
}

function updateLastVisibleItem() {
    setTimeout(() => {
        document.querySelectorAll('.card-product.style-list').forEach(item => item.classList.remove('last'));
        const lastVisible = Array.from(document.querySelectorAll('.card-product.style-list')).filter(item => item.style.display !== 'none').pop();
        if (lastVisible) {
            lastVisible.classList.add('last');
        }
    }, 50);
}

// Sort Functionality
function initSortFunctionality() {
    // Initialize global layout state
    isListActive = document.querySelector('.sw-layout-list')?.classList.contains('active');
    let originalProductsList = Array.from(document.querySelectorAll('#listLayout .card-product')).map(p => p.cloneNode(true));
    let originalProductsGrid = Array.from(document.querySelectorAll('#gridLayout .card-product')).map(p => p.cloneNode(true));
    let paginationList = document.querySelector('#listLayout .wg-pagination')?.cloneNode(true);
    let paginationGrid = document.querySelector('#gridLayout .wg-pagination')?.cloneNode(true);

    document.querySelectorAll('.select-item').forEach(item => {
        item.addEventListener('click', function() {
            const sortValue = this.dataset.sortValue;
            document.querySelectorAll('.select-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const textSortValue = document.querySelector('.text-sort-value');
            if (textSortValue) {
                textSortValue.textContent = this.querySelector('.text-value-item').textContent;
            }

            applySorting(sortValue, isListActive, originalProductsList, originalProductsGrid, paginationList, paginationGrid);
        });
    });

    // Layout switch handling for sort
    document.querySelectorAll('.tf-view-layout-switch').forEach(btn => {
        btn.addEventListener('click', function() {
            const layout = this.dataset.valueLayout;
            
            if (layout === 'list') {
                isListActive = true;
                document.getElementById('gridLayout').style.display = 'none';
                document.getElementById('listLayout').style.display = '';
            } else {
                isListActive = false;
                // Only set grid layout directly if not on mobile
                if (!isMobileDevice()) {
                    setGridLayout(layout);
                } else {
                    // On mobile, just call updateLayoutDisplay which will handle mobile layout
                    updateLayoutDisplay();
                }
            }
        });
    });
}

function applySorting(sortValue, isListActive, originalProductsList, originalProductsGrid, paginationList, paginationGrid) {
    let products;
    let container;

    if (isListActive) {
        products = Array.from(document.querySelectorAll('#listLayout .card-product'));
        container = '#listLayout';
    } else {
        products = Array.from(document.querySelectorAll('#gridLayout .card-product'));
        container = '#gridLayout';
    }

    if (sortValue === 'best-selling') {
        // Reset to original order
        const originalProducts = isListActive ? originalProductsList : originalProductsGrid;
        const containerEl = document.querySelector(container);
        if (containerEl) {
            containerEl.innerHTML = '';
            originalProducts.forEach(product => {
                containerEl.appendChild(product.cloneNode(true));
            });
        }
        bindProductEvents();
        displayPagination(products.length, isListActive, container, paginationList, paginationGrid);
        return;
    }

    if (sortValue === 'price-low-high') {
        products.sort((a, b) => getPriceValue(a) - getPriceValue(b));
    } else if (sortValue === 'price-high-low') {
        products.sort((a, b) => getPriceValue(b) - getPriceValue(a));
    } else if (sortValue === 'a-z') {
        products.sort((a, b) => getProductName(a).localeCompare(getProductName(b)));
    } else if (sortValue === 'z-a') {
        products.sort((a, b) => getProductName(b).localeCompare(getProductName(a)));
    }

    const containerEl = document.querySelector(container);
    if (containerEl) {
        containerEl.innerHTML = '';
        products.forEach(product => containerEl.appendChild(product));
    }
    
    bindProductEvents();
    displayPagination(products.length, isListActive, container, paginationList, paginationGrid);
}

function displayPagination(products, isListActive, container, paginationList, paginationGrid) {
    // Always show pagination if it exists, as Shopify handles pagination logic
    // The original logic was for load-more functionality, but we're using Shopify pagination
    const containerEl = document.querySelector(container);
    if (containerEl) {
        if (isListActive && paginationList) {
            containerEl.appendChild(paginationList.cloneNode(true));
        } else if (!isListActive && paginationGrid) {
            containerEl.appendChild(paginationGrid.cloneNode(true));
        }
    }
}

// Layout Switching
function initLayoutSwitching() {
    // Initialize global layout state based on theme settings
    if (window.collectionData && window.collectionData.defaultLayoutType === 'list') {
        isListActive = true;
    } else {
        isListActive = false;
    }
    let userSelectedLayout = null;
    
    // Ensure wrapper classes are set correctly on page load
    const wrapper = document.querySelector('.wrapper-control-shop');
    if (wrapper) {
        if (isListActive) {
            wrapper.classList.add('listLayout-wrapper');
            wrapper.classList.remove('gridLayout-wrapper');
        } else {
            wrapper.classList.add('gridLayout-wrapper');
            wrapper.classList.remove('listLayout-wrapper');
        }
    }

    function hasValidLayout() {
        const gridLayout = document.getElementById('gridLayout');
        if (!gridLayout) return false;
        
        return (
            gridLayout.classList.contains('tf-col-2') ||
            gridLayout.classList.contains('tf-col-3') ||
            gridLayout.classList.contains('tf-col-4') ||
            gridLayout.classList.contains('tf-col-5') ||
            gridLayout.classList.contains('tf-col-6') ||
            gridLayout.classList.contains('tf-col-7')
        );
    }

    function updateLayoutDisplay() {
        const windowWidth = window.innerWidth;
        const gridLayout = document.getElementById('gridLayout');
        const currentLayout = gridLayout?.className || '';

        if (!hasValidLayout()) {
            return;
        }

        if (isListActive) {
            gridLayout.style.display = 'none';
            const listLayout = document.getElementById('listLayout');
            if (listLayout) listLayout.style.display = '';
            document.querySelector('.wrapper-control-shop')?.classList.add('listLayout-wrapper');
            document.querySelector('.wrapper-control-shop')?.classList.remove('gridLayout-wrapper');
            return;
        }

        // On mobile, always use 2 columns regardless of selected layout
        if (isMobileDevice()) {
            if (!currentLayout.includes('tf-col-2')) {
                setGridLayout('tf-col-2');
            }
            return; // Exit early on mobile to prevent further layout changes
        }

        // Check for user selected layout or default grid layout from settings
        const selectedLayout = userSelectedLayout || (window.collectionData && window.collectionData.defaultGridLayout);
        
        if (selectedLayout) {
            if (windowWidth <= 1200 && selectedLayout !== 'tf-col-2') {
                setGridLayout('tf-col-3');
            } else if (windowWidth <= 1400 && ['tf-col-5', 'tf-col-6', 'tf-col-7'].includes(selectedLayout)) {
                setGridLayout('tf-col-4');
            } else {
                setGridLayout(selectedLayout);
            }
            return;
        }

        if (windowWidth <= 1200) {
            if (!currentLayout.includes('tf-col-3')) {
                setGridLayout('tf-col-3');
            }
        } else if (windowWidth <= 1400) {
            if (currentLayout.includes('tf-col-5') || currentLayout.includes('tf-col-6') || currentLayout.includes('tf-col-7')) {
                setGridLayout('tf-col-4');
            }
        } else {
            const listLayout = document.getElementById('listLayout');
            if (listLayout) listLayout.style.display = 'none';
            gridLayout.style.display = '';
            document.querySelector('.wrapper-control-shop')?.classList.add('gridLayout-wrapper');
            document.querySelector('.wrapper-control-shop')?.classList.remove('listLayout-wrapper');
        }
    }

    // Layout switch buttons
    document.querySelectorAll('.tf-view-layout-switch').forEach(btn => {
        btn.addEventListener('click', function() {
            const layout = this.dataset.valueLayout;
            document.querySelectorAll('.tf-view-layout-switch').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const wrapper = document.querySelector('.wrapper-control-shop');
            if (wrapper) {
                wrapper.classList.add('loading-shop');
            }

            setTimeout(() => {
                if (wrapper) {
                    wrapper.classList.remove('loading-shop');
                }
                
                if (isListActive) {
                    const gridLayout = document.getElementById('gridLayout');
                    const listLayout = document.getElementById('listLayout');
                    if (gridLayout) gridLayout.style.display = 'none';
                    if (listLayout) listLayout.style.display = '';
                } else {
                    const gridLayout = document.getElementById('gridLayout');
                    const listLayout = document.getElementById('listLayout');
                    if (listLayout) listLayout.style.display = 'none';
                    if (gridLayout) gridLayout.style.display = '';
                }
            }, 500);

            if (layout === 'list') {
                isListActive = true;
                userSelectedLayout = null;
                const gridLayout = document.getElementById('gridLayout');
                const listLayout = document.getElementById('listLayout');
                if (gridLayout) gridLayout.style.display = 'none';
                if (listLayout) listLayout.style.display = '';
                document.querySelector('.wrapper-control-shop')?.classList.add('listLayout-wrapper');
                document.querySelector('.wrapper-control-shop')?.classList.remove('gridLayout-wrapper');
                
                // Ensure product count elements are properly shown/hidden
                updateProductCountVisibility();
            } else {
                isListActive = false;
                userSelectedLayout = layout;
                // Only set grid layout directly if not on mobile
                if (!isMobileDevice()) {
                    setGridLayout(layout);
                } else {
                    // On mobile, just call updateLayoutDisplay which will handle mobile layout
                    updateLayoutDisplay();
                }
            }
        });
    });

    // Initial layout setup
    if (window.collectionData && window.collectionData.defaultLayoutType === 'list') {
        // Start with list layout
        isListActive = true;
        const gridLayout = document.getElementById('gridLayout');
        const listLayout = document.getElementById('listLayout');
        
        if (gridLayout) gridLayout.style.display = 'none';
        if (listLayout) listLayout.style.display = '';
        
        document.querySelector('.wrapper-control-shop')?.classList.add('listLayout-wrapper');
        document.querySelector('.wrapper-control-shop')?.classList.remove('gridLayout-wrapper');
        
        // Set active state for list layout button
        const listLayoutBtn = document.querySelector('.tf-view-layout-switch[data-value-layout="list"]');
        if (listLayoutBtn) {
            listLayoutBtn.classList.add('active');
        }
    } else {
        // Start with grid layout (default)
        isListActive = false;
        const gridLayout = document.getElementById('gridLayout');
        const listLayout = document.getElementById('listLayout');
        
        if (listLayout) listLayout.style.display = 'none';
        if (gridLayout) gridLayout.style.display = '';
        
        // Ensure wrapper classes are set correctly for grid layout
        const wrapper = document.querySelector('.wrapper-control-shop');
        if (wrapper) {
            wrapper.classList.add('gridLayout-wrapper');
            wrapper.classList.remove('listLayout-wrapper');
        }
        
        // Set default grid layout from theme settings
        if (window.collectionData && window.collectionData.defaultGridLayout) {
            // Only set grid layout directly if not on mobile
            if (!isMobileDevice()) {
                setGridLayout(window.collectionData.defaultGridLayout);
            }
            // Call updateLayoutDisplay to ensure responsive behavior is applied on initial load
            updateLayoutDisplay();
        } else {
            updateLayoutDisplay();
        }
        
        // Set active state for default grid layout button
        if (window.collectionData && window.collectionData.defaultGridLayout) {
            const defaultLayoutBtn = document.querySelector(`.tf-view-layout-switch[data-value-layout="${window.collectionData.defaultGridLayout}"]`);
            if (defaultLayoutBtn) {
                defaultLayoutBtn.classList.add('active');
            }
        } else {
            // Set default active state for grid layout
            const defaultGridBtn = document.querySelector('.tf-view-layout-switch[data-value-layout="tf-col-3"]') || 
                                  document.querySelector('.tf-view-layout-switch[data-value-layout="tf-col-4"]');
            if (defaultGridBtn) {
                defaultGridBtn.classList.add('active');
            }
        }
    }

    window.addEventListener('resize', updateLayoutDisplay);
    
    // Ensure product count visibility is correct on initial load
    updateProductCountVisibility();
}

// Load More / Infinite Scroll
function initLoadMore() {
    // Get products per page from Shopify collection data or use default
    let productsPerPage = 8; // Default fallback
    
    // Try to get from Shopify collection data
    if (window.collectionData && window.collectionData.maxProductsPerPage) {
        productsPerPage = window.collectionData.maxProductsPerPage;
    }
    // Try to get from theme settings if available
    else if (window.theme && window.theme.maxProductsPerPage) {
        productsPerPage = window.theme.maxProductsPerPage;
    }
    // Try to get from meta tag if available
    else {
        const metaTag = document.querySelector('meta[name="products-per-page"]');
        if (metaTag) {
            productsPerPage = parseInt(metaTag.getAttribute('content'), 10) || 8;
        }
    }
    
    // Use the same value for both initial display and load more
    const gridInitialItems = productsPerPage;
    const listInitialItems = productsPerPage;
    const gridItemsPerPage = productsPerPage;
    const listItemsPerPage = productsPerPage;

    let listItemsDisplayed = listInitialItems;
    let gridItemsDisplayed = gridInitialItems;
    let scrollTimeout;

    function hideExtraItems(layout, itemsDisplayed) {
        const items = layout.querySelectorAll('.card-product');
        
        // If we have more products than the initial display amount, hide the extra ones
        if (items.length > itemsDisplayed) {
            items.forEach((item, index) => {
                if (index >= itemsDisplayed) {
                    item.style.display = 'none';
                } else {
                    item.style.display = '';
                }
            });
        } else {
            // If we don't have enough products to hide, show all of them
            items.forEach(item => item.style.display = '');
        }
        
        if (layout.id === 'listLayout') updateLastVisible(layout);
    }

    function showMoreItems(layout, itemsPerPage, itemsDisplayed) {
        const hiddenItems = layout.querySelectorAll('.card-product[style*="display: none"]');

        setTimeout(function() {
            const itemsToShow = Array.from(hiddenItems).slice(0, itemsPerPage);
            itemsToShow.forEach(item => item.style.display = '');
            
            if (layout.id === 'listLayout') updateLastVisible(layout);
            checkLoadMoreButton(layout);
        }, 600);

        return itemsDisplayed + itemsPerPage;
    }

    function updateLastVisible(layout) {
        layout.querySelectorAll('.card-product').forEach(item => item.classList.remove('last-visible'));
        const visibleItems = layout.querySelectorAll('.card-product:not([style*="display: none"])');
        const lastVisible = visibleItems[visibleItems.length - 1];
        if (lastVisible) {
            lastVisible.classList.add('last-visible');
        }
    }

    function checkLoadMoreButton(layout) {
        const hiddenCount = layout.querySelectorAll('.card-product[style*="display: none"]').length;
        
        if (hiddenCount === 0) {
            if (layout.id === 'listLayout') {
                const loadMoreBtn = document.getElementById('loadMoreListBtn');
                const infiniteScroll = document.getElementById('infiniteScrollList');
                if (loadMoreBtn) {
                    loadMoreBtn.style.display = 'none';
                }
                if (infiniteScroll) infiniteScroll.style.display = 'none';
            } else if (layout.id === 'gridLayout') {
                const loadMoreBtn = document.getElementById('loadMoreGridBtn');
                const infiniteScroll = document.getElementById('infiniteScrollGrid');
                if (loadMoreBtn) {
                    loadMoreBtn.style.display = 'none';
                }
                if (infiniteScroll) infiniteScroll.style.display = 'none';
            }
        }
    }

    // Hide initial items
    hideExtraItems(document.getElementById('listLayout'), listItemsDisplayed);
    hideExtraItems(document.getElementById('gridLayout'), gridItemsDisplayed);
    
    // Show load more buttons if there are hidden items
    checkLoadMoreButton(document.getElementById('listLayout'));
    checkLoadMoreButton(document.getElementById('gridLayout'));
    
    // Ensure grid load more button is visible if there are hidden products
    const gridLayout = document.getElementById('gridLayout');
    const gridLoadMoreBtn = document.getElementById('loadMoreGridBtn');
    if (gridLayout && gridLoadMoreBtn) {
        const hiddenProducts = gridLayout.querySelectorAll('.card-product[style*="display: none"]');
        if (hiddenProducts.length > 0) {
            gridLoadMoreBtn.style.display = '';
        }
    }
    
    // Initialize infinity scroll if enabled
    if (window.collectionData && window.collectionData.paginationType === 'infinity_scroll') {
        initInfinityScroll();
    }
    
    // Handle initial visibility of infinity scroll elements
    if (window.collectionData && window.collectionData.paginationType === 'infinity_scroll') {
        const infiniteScrollList = document.getElementById('infiniteScrollList');
        const infiniteScrollGrid = document.getElementById('infiniteScrollGrid');
        
        // Hide load more buttons
        const loadMoreListBtn = document.getElementById('loadMoreListBtn');
        const loadMoreGridBtn = document.getElementById('loadMoreGridBtn');
        
        if (loadMoreListBtn) loadMoreListBtn.style.display = 'none';
        if (loadMoreGridBtn) loadMoreGridBtn.style.display = 'none';
        
        // Show infinity scroll elements
        if (infiniteScrollList) infiniteScrollList.style.display = '';
        if (infiniteScrollGrid) infiniteScrollGrid.style.display = '';
    }

    // Load More button handlers
    const loadMoreListBtn = document.getElementById('loadMoreListBtn');
    if (loadMoreListBtn) {
        loadMoreListBtn.addEventListener('click', function() {
            listItemsDisplayed = showMoreItems(
                document.getElementById('listLayout'),
                listItemsPerPage,
                listItemsDisplayed
            );
        });
    }

    const loadMoreGridBtn = document.getElementById('loadMoreGridBtn');
    if (loadMoreGridBtn) {
        loadMoreGridBtn.addEventListener('click', function() {
            gridItemsDisplayed = showMoreItems(
                document.getElementById('gridLayout'),
                gridItemsPerPage,
                gridItemsDisplayed
            );
        });
    }

    // Infinite Scrolling
    function onScroll() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            const infiniteScrollList = document.getElementById('infiniteScrollList');
            const infiniteScrollGrid = document.getElementById('infiniteScrollGrid');

            if (infiniteScrollList && infiniteScrollList.style.display !== 'none' && isElementInViewport(infiniteScrollList)) {
                listItemsDisplayed = showMoreItems(
                    document.getElementById('listLayout'),
                    listItemsPerPage,
                    listItemsDisplayed
                );
            }

            if (infiniteScrollGrid && infiniteScrollGrid.style.display !== 'none' && isElementInViewport(infiniteScrollGrid)) {
                gridItemsDisplayed = showMoreItems(
                    document.getElementById('gridLayout'),
                    gridItemsPerPage,
                    gridItemsDisplayed
                );
            }
        }, 300);
    }

    window.addEventListener('scroll', onScroll);
}

function initInfinityScroll() {
    const infiniteScrollList = document.getElementById('infiniteScrollList');
    const infiniteScrollGrid = document.getElementById('infiniteScrollGrid');
    
    // Hide load more buttons when infinity scroll is enabled
    const loadMoreListBtn = document.getElementById('loadMoreListBtn');
    const loadMoreGridBtn = document.getElementById('loadMoreGridBtn');
    
    if (loadMoreListBtn) loadMoreListBtn.style.display = 'none';
    if (loadMoreGridBtn) loadMoreGridBtn.style.display = 'none';
    
    // Show infinity scroll elements
    if (infiniteScrollList) infiniteScrollList.style.display = '';
    if (infiniteScrollGrid) infiniteScrollGrid.style.display = '';
    
    // Initialize scroll event for infinity scroll
    let scrollTimeout;
    
    function onScroll() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            // Check if user is near bottom of page
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // If user is within 200px of bottom, trigger load more
            if (scrollTop + windowHeight >= documentHeight - 200) {
                // Determine which layout is active
                if (isListActive && infiniteScrollList) {
                    loadMoreProducts('list');
                } else if (!isListActive && infiniteScrollGrid) {
                    loadMoreProducts('grid');
                }
            }
        }, 300);
    }
    
    function loadMoreProducts(layout) {
        const layoutEl = layout === 'list' ? document.getElementById('listLayout') : document.getElementById('gridLayout');
        const hiddenProducts = layoutEl.querySelectorAll('.card-product[style*="display: none"]');
        
        if (hiddenProducts.length > 0) {
            // Show next batch of products
            const productsPerPage = window.collectionData?.maxProductsPerPage || 8;
            const productsToShow = Array.from(hiddenProducts).slice(0, productsPerPage);
            
            productsToShow.forEach(product => {
                product.style.display = '';
            });
            
            // Hide infinity scroll if no more products
            if (layoutEl.querySelectorAll('.card-product[style*="display: none"]').length === 0) {
                const infiniteScroll = layout === 'list' ? infiniteScrollList : infiniteScrollGrid;
                if (infiniteScroll) infiniteScroll.style.display = 'none';
            }
        }
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', onScroll);
}

// Load More Functionality
function initLoadMoreFunctionality() {
    const loadMoreListBtn = document.getElementById('loadMoreListBtn');
    const loadMoreGridBtn = document.getElementById('loadMoreGridBtn');
    
    if (loadMoreListBtn) {
        loadMoreListBtn.addEventListener('click', function() {
            handleLoadMore('list');
        });
    }
    
    if (loadMoreGridBtn) {
        loadMoreGridBtn.addEventListener('click', function() {
            handleLoadMore('grid');
        });
    }
}

function handleLoadMore(layout) {
    const button = layout === 'list' ? document.getElementById('loadMoreListBtn') : document.getElementById('loadMoreGridBtn');
    const currentPage = parseInt(button.dataset.currentPage) || 1;
    
    // Get products per page from the same sources as initLoadMore
    let maxPerPage = 8; // Default fallback
    
    // Try to get from Shopify collection data
    if (window.collectionData && window.collectionData.maxProductsPerPage) {
        maxPerPage = window.collectionData.maxProductsPerPage;
    }
    // Try to get from theme settings if available
    else if (window.theme && window.theme.maxProductsPerPage) {
        maxPerPage = window.theme.maxProductsPerPage;
    }
    // Try to get from meta tag if available
    else {
        const metaTag = document.querySelector('meta[name="products-per-page"]');
        if (metaTag) {
            maxPerPage = parseInt(metaTag.getAttribute('content'), 10) || 8;
        }
    }
    
    // Use button data attribute as fallback if available
    if (button.dataset.maxPerPage) {
        maxPerPage = parseInt(button.dataset.maxPerPage, 10) || maxPerPage;
    }
    
    const totalProducts = parseInt(button.dataset.totalProducts) || 0;
    
    // Calculate next page
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * maxPerPage;
    const endIndex = Math.min(startIndex + maxPerPage, totalProducts);
    
    // Show loading state
    button.classList.add('loading');
    button.querySelector('.text').textContent = window.translations?.shop?.loading || 'Loading...';
    
    // Simulate loading (in real implementation, this would be an AJAX call)
    setTimeout(() => {
        // Update button state
        button.dataset.currentPage = nextPage;
        
        // Check if we've loaded all products
        if (endIndex >= totalProducts) {
            button.style.display = 'none';
        } else {
            button.querySelector('.text').textContent = window.translations?.shop?.load_more || 'Load more';
        }
        
        button.classList.remove('loading');
        
        // In a real implementation, you would:
        // 1. Make an AJAX call to get more products
        // 2. Append new products to the layout
        // 3. Update the product count
        // 4. Handle any additional logic
        

    }, 1000);
}

// Initialize load more functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're using load more pagination type
    if (window.collectionData && window.collectionData.paginationType === 'load_more') {
        initLoadMoreFunctionality();
    }
});

// Product Event Binding
function bindProductEvents() {
    // Color swatch functionality
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', function() {
            const swatchColor = this.querySelector('img')?.src;
            if (!swatchColor) return;
            
            const product = this.closest('.card-product');
            const imgProduct = product?.querySelector('.img-product');
            
            if (imgProduct) {
                imgProduct.src = swatchColor;
                product.querySelector('.color-swatch.active')?.classList.remove('active');
                this.classList.add('active');
            }
        });
        
        // Mouseover functionality
        swatch.addEventListener('mouseover', function() {
            const swatchColor = this.querySelector('img')?.src;
            if (!swatchColor) return;
            
            const product = this.closest('.card-product');
            const imgProduct = product?.querySelector('.img-product');
            
            if (imgProduct) {
                imgProduct.src = swatchColor;
            }
        });
    });

    // Size selection functionality
    document.querySelectorAll('.size-box').forEach(box => {
        box.addEventListener('click', function(e) {
            if (e.target.classList.contains('size-item')) {
                this.querySelectorAll('.size-item').forEach(item => item.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    });
}

// Utility Functions
function isElementInViewport(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function getPriceValue(element) {
    const priceElement = element.querySelector('.price-new');
    if (!priceElement) return 0;
    return parseFloat(priceElement.textContent.replace('$', '')) || 0;
}

function getProductName(element) {
    const nameElement = element.querySelector('.name-product');
    return nameElement ? nameElement.textContent : '';
}

function setListLayout() {
    const gridLayout = document.getElementById('gridLayout');
    const listLayout = document.getElementById('listLayout');
    const wrapper = document.querySelector('.wrapper-control-shop');
    
    if (gridLayout) gridLayout.style.display = 'none';
    if (listLayout) listLayout.style.display = '';
    if (wrapper) {
        wrapper.classList.add('listLayout-wrapper');
        wrapper.classList.remove('gridLayout-wrapper');
    }
    
    // Ensure product count elements are properly shown/hidden
    updateProductCountVisibility();
}

function setGridLayout(layoutClass) {
    const gridLayout = document.getElementById('gridLayout');
    const listLayout = document.getElementById('listLayout');
    const wrapper = document.querySelector('.wrapper-control-shop');
    
    if (listLayout) listLayout.style.display = 'none';
    if (gridLayout) {
        gridLayout.style.display = '';
        gridLayout.className = `wrapper-shop tf-grid-layout ${layoutClass}`;
    }
    
    if (wrapper) {
        wrapper.classList.add('gridLayout-wrapper');
        wrapper.classList.remove('listLayout-wrapper');
    }
    
    // Update active state
    document.querySelectorAll('.tf-view-layout-switch').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.tf-view-layout-switch[data-value-layout="${layoutClass}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Ensure product count elements are properly shown/hidden
    updateProductCountVisibility();
}

// Helper function to check if any filters are currently applied
function hasActiveFilters() {
    // Check price filter by comparing current slider values with default values
    const priceSlider = document.getElementById('price-value-range');
    if (priceSlider && priceSlider.noUiSlider) {
        const currentValues = priceSlider.noUiSlider.get();
        const minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
        const maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;
        if (parseInt(currentValues[0]) > minPrice || parseInt(currentValues[1]) < maxPrice) {
            return true;
        }
    } else if (priceSlider) {
        // Fallback: check if price slider exists but noUiSlider is not initialized
        // This can happen during theme customizer changes
        const minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
        const maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;
        // If the global filters object has different values than the dataset, consider it active
        if (filters.minPrice > minPrice || filters.maxPrice < maxPrice) {
            return true;
        }
    }
    
    // Check UI state for other filters
    const hasActiveSize = document.querySelector('.size-check.active') !== null;
    const hasActiveColor = document.querySelector('.color-check.active') !== null;
    const hasActiveAvailability = document.querySelector('input[name="availability"]:checked') !== null;
    const hasActiveBrand = document.querySelector('input[name="brand"]:checked') !== null;
    const hasActiveSale = document.querySelector('.shop-sale-text.active') !== null;
    
    // Also check URL parameters for server-side filters
    const urlParams = new URLSearchParams(window.location.search);
    const hasUrlFilters = urlParams.has('filter.v.option1') || 
                         urlParams.has('filter.v.option.color') || 
                         urlParams.has('filter.v.availability') || 
                         urlParams.has('filter.p.vendor') || 
                         urlParams.has('filter.v.price.gte') || 
                         urlParams.has('filter.v.price.lte') || 
                         urlParams.has('filter.v.compare_at_price.gt');
    
    return hasActiveSize || hasActiveColor || hasActiveAvailability || hasActiveBrand || hasActiveSale || hasUrlFilters;
}

// Function to ensure product count elements are properly shown/hidden based on current layout
function updateProductCountVisibility() {
    const wrapper = document.querySelector('.wrapper-control-shop');
    const productCountGrid = document.getElementById('product-count-grid');
    const productCountList = document.getElementById('product-count-list');
    
    if (!wrapper || !productCountGrid || !productCountList) return;
    
    // Only show product count elements if filters are applied
    if (!hasActiveFilters()) {
        productCountGrid.style.display = 'none';
        productCountList.style.display = 'none';
        return;
    }
    
    // Check if we're in list or grid layout mode
    if (wrapper.classList.contains('listLayout-wrapper')) {
        // List layout: show list count, hide grid count
        productCountGrid.style.display = 'none';
        productCountList.style.display = 'block';
    } else if (wrapper.classList.contains('gridLayout-wrapper')) {
        // Grid layout: show grid count, hide list count
        productCountGrid.style.display = 'block';
        productCountList.style.display = 'none';
    } else {
        // Fallback: if no wrapper class is set, default to grid layout
        wrapper.classList.add('gridLayout-wrapper');
        wrapper.classList.remove('listLayout-wrapper');
        productCountGrid.style.display = 'block';
        productCountList.style.display = 'none';
    }
}