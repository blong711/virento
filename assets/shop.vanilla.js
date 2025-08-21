/**
 * Shop functionality in vanilla JavaScript
 * Includes price range, filtering, sorting, layout switching, and loading
 */

// Initialize all shop functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize global layout state
    isListActive = document.querySelector('.sw-layout-list')?.classList.contains('active') || false;
    
    initializeFilters(); // Initialize filter values
    initPriceRange();
    initProductFilters();
    initSortFunctionality();
    initLayoutSwitching();
    initLoadMore();
    bindProductEvents(); // Initialize product events
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

    priceSlider.noUiSlider.on('update', (values, handle) => {
        const displays = [minValueDisplay, maxValueDisplay];
        displays[handle].textContent = values[handle];
        
        // Update global filters
        filters.minPrice = parseInt(values[0], 10);
        filters.maxPrice = parseInt(values[1], 10);
        
        applyFilters();
        updateMetaFilter();
    });
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

// Initialize filters with price slider values
function initializeFilters() {
    const priceSlider = document.getElementById('price-value-range');
    if (priceSlider) {
        filters.minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
        filters.maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;
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
            applyFilters();
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
            applyFilters();
            updateMetaFilter();
        });
    });

    // Availability filter
    document.querySelectorAll('input[name="availability"]').forEach(input => {
        input.addEventListener('change', function() {
            filters.availability = this.id === 'inStock' ? 'In stock' : 'Out of stock';
            applyFilters();
            updateMetaFilter();
        });
    });

    // Brand filter
    document.querySelectorAll('input[name="brand"]').forEach(input => {
        input.addEventListener('change', function() {
            filters.brands = this.id;
            applyFilters();
            updateMetaFilter();
        });
    });

    // Sale filter
    const saleText = document.querySelector('.shop-sale-text');
    if (saleText) {
        saleText.addEventListener('click', function() {
            filters.sale = !filters.sale;
            this.classList.toggle('active', filters.sale);
            applyFilters();
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
        document.getElementById(id)?.addEventListener('click', resetAllFilters);
    });

    // Reset price
    document.querySelector('.reset-price')?.addEventListener('click', () => {
        const priceSlider = document.getElementById('price-value-range');
        if (priceSlider) {
            const minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
            const maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;
            priceSlider.noUiSlider.set([minPrice, maxPrice]);
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
    if (filterType === "brand") {
        filters.brands = null;
        document.querySelectorAll('input[name="brand"]').forEach(input => input.checked = false);
    }
    if (filterType === "price") {
        const priceSlider = document.getElementById('price-value-range');
        if (priceSlider) {
            const minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
            const maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;
            priceSlider.noUiSlider.set([minPrice, maxPrice]);
        }
    }
    if (filterType === "sale") {
        filters.sale = false;
        document.querySelector('.shop-sale-text')?.classList.remove('active');
    }
    
    applyFilters();
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
    }
    
    filters.sale = false;
    
    // Reset UI elements
    document.querySelector('.shop-sale-text')?.classList.remove('active');
    document.querySelectorAll('input[name="brand"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[name="availability"]').forEach(input => input.checked = false);
    document.querySelectorAll('.size-check, .color-check').forEach(btn => btn.classList.remove('active'));
    
    applyFilters();
    updateMetaFilter();
}

function applyFilters() {
    let visibleProductCountGrid = 0;
    let visibleProductCountList = 0;

    document.querySelectorAll('.wrapper-shop .card-product').forEach(product => {
        let showProduct = true;

        // Price filter
        const priceText = product.querySelector('.price-new')?.textContent.replace('$', '');
        const price = parseFloat(priceText);
        if (price < filters.minPrice || price > filters.maxPrice) {
            showProduct = false;
        }

        // Size filter
        if (filters.size && !product.querySelector(`.size-item:contains('${filters.size}')`)) {
            // Fallback to text content search if :contains selector doesn't work
            const sizeItems = Array.from(product.querySelectorAll('.size-item'));
            const hasSize = sizeItems.some(item => item.textContent.includes(filters.size));
            if (!hasSize) {
                showProduct = false;
            }
        }

        // Color filter
        if (filters.color && !product.querySelector(`.color-swatch:contains('${filters.color}')`)) {
            // Fallback to text content search if :contains selector doesn't work
            const colorSwatches = Array.from(product.querySelectorAll('.color-swatch'));
            const hasColor = colorSwatches.some(swatch => swatch.textContent.includes(filters.color));
            if (!hasColor) {
                showProduct = false;
            }
        }

        // Availability filter
        if (filters.availability && product.dataset.availability !== filters.availability) {
            showProduct = false;
        }

        // Sale filter
        if (filters.sale && !product.querySelector('.on-sale-wrap')) {
            showProduct = false;
        }

        // Brand filter
        if (filters.brands && product.dataset.brand !== filters.brands) {
            showProduct = false;
        }

        product.style.display = showProduct ? '' : 'none';

        if (showProduct) {
            if (product.classList.contains('grid')) visibleProductCountGrid++;
            else if (product.classList.contains('style-list')) visibleProductCountList++;
        }
    });

    // Update product counts
    const gridCountEl = document.getElementById('product-count-grid');
    const listCountEl = document.getElementById('product-count-list');
    
    if (gridCountEl) {
        gridCountEl.innerHTML = `<span class="count">${visibleProductCountGrid}</span>Products found`;
    }
    if (listCountEl) {
        listCountEl.innerHTML = `<span class="count">${visibleProductCountList}</span>Products found`;
    }

    updateLastVisibleItem();
    updatePaginationVisibility(visibleProductCountGrid, visibleProductCountList);
}

function updateMetaFilter() {
    const appliedFilters = document.getElementById('applied-filters');
    const metaFilterShop = document.querySelector('.meta-filter-shop');
    if (!appliedFilters || !metaFilterShop) return;

    appliedFilters.innerHTML = '';
    const tags = [];

    if (filters.availability) {
        tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="availability"></span> Availability: ${filters.availability}</span>`);
    }
    if (filters.brands) {
        tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="brand"></span>Brand: ${filters.brands}</span>`);
    }
    
    const priceSlider = document.getElementById('price-value-range');
    if (priceSlider) {
        const minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
        const maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;
        if (filters.minPrice > minPrice || filters.maxPrice < maxPrice) {
            tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="price"></span>Price: $${filters.minPrice} - $${filters.maxPrice}</span>`);
        }
    }
    
    if (filters.color) {
        tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="color"></span>Color: ${filters.color}</span>`);
    }
    if (filters.size) {
        tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="size"></span>Size: ${filters.size}</span>`);
    }
    if (filters.sale) {
        tags.push(`<span class="filter-tag on-sale d-none">On Sale <span class="remove-tag icon-close" data-filter="sale"></span></span>`);
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
    
    if (visibleProductCountGrid >= 12 || visibleProductCountList >= 12) {
        paginationElements.forEach(el => el.style.display = '');
    } else {
        paginationElements.forEach(el => el.style.display = 'none');
    }
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
                setGridLayout(layout);
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
    if (products >= 12) {
        const containerEl = document.querySelector(container);
        if (containerEl) {
            if (isListActive && paginationList) {
                containerEl.appendChild(paginationList.cloneNode(true));
            } else if (!isListActive && paginationGrid) {
                containerEl.appendChild(paginationGrid.cloneNode(true));
            }
        }
    }
}

// Layout Switching
function initLayoutSwitching() {
    // Initialize global layout state
    isListActive = document.querySelector('.sw-layout-list')?.classList.contains('active');
    let userSelectedLayout = null;

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
            console.warn('Page does not contain a valid layout (2-7 columns), skipping layout adjustments.');
            return;
        }

        if (isListActive) {
            gridLayout.style.display = 'none';
            document.getElementById('listLayout').style.display = '';
            document.querySelector('.wrapper-control-shop')?.classList.add('listLayout-wrapper');
            document.querySelector('.wrapper-control-shop')?.classList.remove('gridLayout-wrapper');
            return;
        }

        if (userSelectedLayout) {
            if (windowWidth <= 767) {
                setGridLayout('tf-col-2');
            } else if (windowWidth <= 1200 && userSelectedLayout !== 'tf-col-2') {
                setGridLayout('tf-col-3');
            } else if (windowWidth <= 1400 && ['tf-col-5', 'tf-col-6', 'tf-col-7'].includes(userSelectedLayout)) {
                setGridLayout('tf-col-4');
            } else {
                setGridLayout(userSelectedLayout);
            }
            return;
        }

        if (windowWidth <= 767) {
            if (!currentLayout.includes('tf-col-2')) {
                setGridLayout('tf-col-2');
            }
        } else if (windowWidth <= 1200) {
            if (!currentLayout.includes('tf-col-3')) {
                setGridLayout('tf-col-3');
            }
        } else if (windowWidth <= 1400) {
            if (currentLayout.includes('tf-col-5') || currentLayout.includes('tf-col-6') || currentLayout.includes('tf-col-7')) {
                setGridLayout('tf-col-4');
            }
        } else {
            document.getElementById('listLayout').style.display = 'none';
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
                    document.getElementById('gridLayout').style.display = 'none';
                    document.getElementById('listLayout').style.display = '';
                } else {
                    document.getElementById('listLayout').style.display = 'none';
                    document.getElementById('gridLayout').style.display = '';
                }
            }, 500);

            if (layout === 'list') {
                isListActive = true;
                userSelectedLayout = null;
                document.getElementById('gridLayout').style.display = 'none';
                document.getElementById('listLayout').style.display = '';
                document.querySelector('.wrapper-control-shop')?.classList.add('listLayout-wrapper');
                document.querySelector('.wrapper-control-shop')?.classList.remove('gridLayout-wrapper');
            } else {
                isListActive = false;
                userSelectedLayout = layout;
                setGridLayout(layout);
            }
        });
    });

    // Initial layout setup
    if (isListActive) {
        document.getElementById('gridLayout').style.display = 'none';
        document.getElementById('listLayout').style.display = '';
        document.querySelector('.wrapper-control-shop')?.classList.add('listLayout-wrapper');
        document.querySelector('.wrapper-control-shop')?.classList.remove('gridLayout-wrapper');
    } else {
        document.getElementById('listLayout').style.display = 'none';
        document.getElementById('gridLayout').style.display = '';
        updateLayoutDisplay();
    }

    window.addEventListener('resize', updateLayoutDisplay);
}

// Load More / Infinite Scroll
function initLoadMore() {
    const gridInitialItems = 8;
    const listInitialItems = 4;
    const gridItemsPerPage = 4;
    const listItemsPerPage = 2;

    let listItemsDisplayed = listInitialItems;
    let gridItemsDisplayed = gridInitialItems;
    let scrollTimeout;

    function hideExtraItems(layout, itemsDisplayed) {
        const items = layout.querySelectorAll('.loadItem');
        items.forEach((item, index) => {
            if (index >= itemsDisplayed) {
                item.classList.add('hidden');
            }
        });
        if (layout.id === 'listLayout') updateLastVisible(layout);
    }

    function showMoreItems(layout, itemsPerPage, itemsDisplayed) {
        const hiddenItems = layout.querySelectorAll('.loadItem.hidden');

        setTimeout(function() {
            const itemsToShow = Array.from(hiddenItems).slice(0, itemsPerPage);
            itemsToShow.forEach(item => item.classList.remove('hidden'));
            
            if (layout.id === 'listLayout') updateLastVisible(layout);
            checkLoadMoreButton(layout);
        }, 600);

        return itemsDisplayed + itemsPerPage;
    }

    function updateLastVisible(layout) {
        layout.querySelectorAll('.loadItem').forEach(item => item.classList.remove('last-visible'));
        const visibleItems = layout.querySelectorAll('.loadItem:not(.hidden)');
        const lastVisible = visibleItems[visibleItems.length - 1];
        if (lastVisible) {
            lastVisible.classList.add('last-visible');
        }
    }

    function checkLoadMoreButton(layout) {
        if (layout.querySelectorAll('.loadItem.hidden').length === 0) {
            if (layout.id === 'listLayout') {
                const loadMoreBtn = document.getElementById('loadMoreListBtn');
                const infiniteScroll = document.getElementById('infiniteScrollList');
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                if (infiniteScroll) infiniteScroll.style.display = 'none';
            } else if (layout.id === 'gridLayout') {
                const loadMoreBtn = document.getElementById('loadMoreGridBtn');
                const infiniteScroll = document.getElementById('infiniteScrollGrid');
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                if (infiniteScroll) infiniteScroll.style.display = 'none';
            }
        }
    }

    // Hide initial items
    hideExtraItems(document.getElementById('listLayout'), listItemsDisplayed);
    hideExtraItems(document.getElementById('gridLayout'), gridItemsDisplayed);

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
}