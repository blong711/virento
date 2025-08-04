/**
 * Shop functionality in vanilla JavaScript
 * Includes price range, filtering, sorting, layout switching, and loading
 */

// Initialize all shop functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initPriceRange();
    initProductFilters();
    initSortFunctionality();
    initLayoutSwitching();
    initLoadMore();
});

// Price Range Slider
function initPriceRange() {
    const priceSlider = document.getElementById('price-value-range');
    if (!priceSlider) return;

    const minPrice = parseInt(priceSlider.dataset.min, 10) || 0;
    const maxPrice = parseInt(priceSlider.dataset.max, 10) || 500;

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

function initProductFilters() {
    // Size filter
    document.querySelectorAll('.size-check').forEach(btn => {
        btn.addEventListener('click', function() {
            filters.size = this.querySelector('.size').textContent.trim();
            applyFilters();
            updateMetaFilter();
        });
    });

    // Color filter
    document.querySelectorAll('.color-check').forEach(btn => {
        btn.addEventListener('click', function() {
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
        if (filters.size && !product.querySelector(`.size-item[data-size="${filters.size}"]`)) {
            showProduct = false;
        }

        // Color filter
        if (filters.color && !product.querySelector(`.color-swatch[data-color="${filters.color}"]`)) {
            showProduct = false;
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
    document.getElementById('product-count-grid').innerHTML = 
        `<span class="count">${visibleProductCountGrid}</span>Products found`;
    document.getElementById('product-count-list').innerHTML = 
        `<span class="count">${visibleProductCountList}</span>Products found`;

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
    if (filters.minPrice > 0 || filters.maxPrice < 500) {
        tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="price"></span>Price: $${filters.minPrice} - $${filters.maxPrice}</span>`);
    }
    if (filters.color) {
        tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="color"></span>Color: ${filters.color}</span>`);
    }
    if (filters.size) {
        tags.push(`<span class="filter-tag"><span class="remove-tag icon-close" data-filter="size"></span>Size: ${filters.size}</span>`);
    }
    if (filters.sale) {
        tags.push(`<span class="filter-tag on-sale">On Sale <span class="remove-tag icon-close" data-filter="sale"></span></span>`);
    }

    appliedFilters.innerHTML = tags.join('');
    metaFilterShop.style.display = tags.length > 0 ? '' : 'none';
    document.getElementById('remove-all').style.display = tags.length > 0 ? '' : 'none';
}

// Sort Functionality
function initSortFunctionality() {
    let isListActive = document.querySelector('.sw-layout-list')?.classList.contains('active');
    const originalProducts = {
        list: Array.from(document.querySelectorAll('#listLayout .card-product')),
        grid: Array.from(document.querySelectorAll('#gridLayout .card-product'))
    };

    document.querySelectorAll('.select-item').forEach(item => {
        item.addEventListener('click', function() {
            const sortValue = this.dataset.sortValue;
            document.querySelectorAll('.select-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            document.querySelector('.text-sort-value').textContent = 
                this.querySelector('.text-value-item').textContent;

            applySorting(sortValue, isListActive);
        });
    });
}

function applySorting(sortValue, isListActive) {
    const container = isListActive ? '#listLayout' : '#gridLayout';
    const products = Array.from(document.querySelectorAll(`${container} .card-product`));

    if (sortValue === 'best-selling') {
        // Reset to original order
        const originalProducts = isListActive ? originalProductsList : originalProductsGrid;
        document.querySelector(container).innerHTML = '';
        originalProducts.forEach(product => {
            document.querySelector(container).appendChild(product.cloneNode(true));
        });
    } else {
        products.sort((a, b) => {
            switch(sortValue) {
                case 'price-low-high':
                    return getPriceValue(a) - getPriceValue(b);
                case 'price-high-low':
                    return getPriceValue(b) - getPriceValue(a);
                case 'a-z':
                    return getProductName(a).localeCompare(getProductName(b));
                case 'z-a':
                    return getProductName(b).localeCompare(getProductName(a));
                default:
                    return 0;
            }
        });

        const parent = document.querySelector(container);
        parent.innerHTML = '';
        products.forEach(product => parent.appendChild(product));
    }

    bindProductEvents();
    displayPagination(products.length, isListActive);
}

// Layout Switching
function initLayoutSwitching() {
    let isListActive = false;
    let userSelectedLayout = null;

    function updateLayout() {
        const windowWidth = window.innerWidth;
        
        if (isListActive) {
            setListLayout();
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
        } else {
            // Default responsive behavior
            if (windowWidth <= 767) setGridLayout('tf-col-2');
            else if (windowWidth <= 1200) setGridLayout('tf-col-3');
            else if (windowWidth <= 1400) setGridLayout('tf-col-4');
        }
    }

    // Layout switch buttons
    document.querySelectorAll('.tf-view-layout-switch').forEach(btn => {
        btn.addEventListener('click', function() {
            const layout = this.dataset.valueLayout;
            document.querySelectorAll('.tf-view-layout-switch').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const wrapper = document.querySelector('.wrapper-control-shop');
            wrapper.classList.add('loading-shop');

            setTimeout(() => {
                wrapper.classList.remove('loading-shop');
                if (layout === 'list') {
                    isListActive = true;
                    userSelectedLayout = null;
                    setListLayout();
                } else {
                    isListActive = false;
                    userSelectedLayout = layout;
                    setGridLayout(layout);
                }
            }, 500);
        });
    });

    window.addEventListener('resize', updateLayout);
    updateLayout(); // Initial layout
}

// Load More / Infinite Scroll
function initLoadMore() {
    const config = {
        grid: {
            initial: 8,
            perPage: 4
        },
        list: {
            initial: 4,
            perPage: 2
        }
    };

    let displayed = {
        grid: config.grid.initial,
        list: config.list.initial
    };

    // Hide initial items
    ['grid', 'list'].forEach(type => {
        const items = document.querySelectorAll(`#${type}Layout .loadItem`);
        items.forEach((item, index) => {
            if (index >= config[type].initial) {
                item.classList.add('hidden');
            }
        });
    });

    // Load More button handlers
    ['grid', 'list'].forEach(type => {
        document.getElementById(`loadMore${type.charAt(0).toUpperCase() + type.slice(1)}Btn`)
            ?.addEventListener('click', () => loadMore(type));
    });

    // Infinite scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            ['grid', 'list'].forEach(type => {
                const trigger = document.getElementById(`infiniteScroll${type.charAt(0).toUpperCase() + type.slice(1)}`);
                if (trigger?.style.display !== 'none' && isElementInViewport(trigger)) {
                    loadMore(type);
                }
            });
        }, 300);
    });

    function loadMore(type) {
        const container = document.getElementById(`${type}Layout`);
        const hiddenItems = container.querySelectorAll('.loadItem.hidden');
        
        setTimeout(() => {
            const itemsToShow = Array.from(hiddenItems).slice(0, config[type].perPage);
            itemsToShow.forEach(item => item.classList.remove('hidden'));
            
            displayed[type] += itemsToShow.length;
            updateLastVisible(type);
            checkLoadMoreButton(type);
        }, 600);
    }
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

function updateLastVisible(type) {
    const container = document.getElementById(`${type}Layout`);
    container.querySelectorAll('.loadItem').forEach(item => item.classList.remove('last-visible'));
    const visibleItems = container.querySelectorAll('.loadItem:not(.hidden)');
    visibleItems[visibleItems.length - 1]?.classList.add('last-visible');
}

function checkLoadMoreButton(type) {
    const container = document.getElementById(`${type}Layout`);
    const hasHiddenItems = container.querySelector('.loadItem.hidden');
    
    document.getElementById(`loadMore${type.charAt(0).toUpperCase() + type.slice(1)}Btn`)
        .style.display = hasHiddenItems ? '' : 'none';
    document.getElementById(`infiniteScroll${type.charAt(0).toUpperCase() + type.slice(1)}`)
        .style.display = hasHiddenItems ? '' : 'none';
}

function getPriceValue(element) {
    return parseFloat(element.querySelector('.price-new').textContent.replace('$', ''));
}

function getProductName(element) {
    return element.querySelector('.name-product').textContent;
}

function setListLayout() {
    document.getElementById('gridLayout').style.display = 'none';
    document.getElementById('listLayout').style.display = '';
    document.querySelector('.wrapper-control-shop').classList.add('listLayout-wrapper');
    document.querySelector('.wrapper-control-shop').classList.remove('gridLayout-wrapper');
}

function setGridLayout(layoutClass) {
    const gridLayout = document.getElementById('gridLayout');
    document.getElementById('listLayout').style.display = 'none';
    gridLayout.style.display = '';
    gridLayout.className = `wrapper-shop tf-grid-layout ${layoutClass}`;
    document.querySelector('.wrapper-control-shop').classList.add('gridLayout-wrapper');
    document.querySelector('.wrapper-control-shop').classList.remove('listLayout-wrapper');
}