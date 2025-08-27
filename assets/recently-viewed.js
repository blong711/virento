/**
 * Recently Viewed Products Functionality
 * Handles tracking and displaying recently viewed products
 */

class RecentlyViewedProducts {
    constructor(sectionId, productsToShow) {
        this.sectionId = sectionId;
        this.productsToShow = productsToShow;
        this.init();
    }

    init() {
        // Initialize recently viewed tracking on product pages
        if (document.querySelector('[data-product-json]')) {
            try {
                const productData = JSON.parse(document.querySelector('[data-product-json]').textContent);
                // Add product to recently viewed
                if (productData && productData.id) {
                    this.addToRecentlyViewed(productData);
                }
            } catch (e) {
            }
        }
        
        // Update section on page load
        this.updateRecentlyViewedSection();
    }

    // Function to get recently viewed products from localStorage
    getRecentlyViewedProducts() {
        const recentlyViewed = localStorage.getItem('recentlyViewedProducts');
        const parsed = recentlyViewed ? JSON.parse(recentlyViewed) : [];
        return parsed;
    }
    
    // Function to add product to recently viewed
    addToRecentlyViewed(product) {
        const recentlyViewed = this.getRecentlyViewedProducts();
        const productIndex = recentlyViewed.findIndex(p => p.id === product.id);
        
        if (productIndex > -1) {
            // Remove existing product
            recentlyViewed.splice(productIndex, 1);
        }
        
        // Add product to beginning
        recentlyViewed.unshift(product);
        
        // Keep only last 20 products
        if (recentlyViewed.length > 20) {
            recentlyViewed.splice(20);
        }
        
        localStorage.setItem('recentlyViewedProducts', JSON.stringify(recentlyViewed));
    }
    
    // Function to update recently viewed section
    updateRecentlyViewedSection() {
        const recentlyViewed = this.getRecentlyViewedProducts();
        if (recentlyViewed.length === 0) return;
        
        const section = document.getElementById(this.sectionId);
        if (!section) return;
        
        const swiperWrapper = section.querySelector('.swiper-wrapper');
        if (!swiperWrapper) return;
        
        // Clear existing slides
        swiperWrapper.innerHTML = '';
        
        // Add product slides
        recentlyViewed.slice(0, this.productsToShow).forEach(product => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = this.generateProductCardHTML(product);
            swiperWrapper.appendChild(slide);
        });
        
        // Reinitialize swiper if it exists
        if (window.recentlyViewedSwiper) {
            window.recentlyViewedSwiper.update();
        }
    }

    // Function to reinitialize the swiper
    reinitializeSwiper() {
        const section = document.getElementById(this.sectionId);
        if (!section) return;
        
        // Destroy existing swiper if it exists
        if (window.recentlyViewedSwiper) {
            window.recentlyViewedSwiper.destroy(true, true);
        }
        
        // Find the swiper container
        const swiperContainer = section.querySelector('.tf-swiper');
        if (swiperContainer) {
            // Get the swiper options from data attribute
            const swiperOptions = swiperContainer.getAttribute('data-swiper');
            if (swiperOptions) {
                try {
                    const options = JSON.parse(swiperOptions);
                    // Initialize new swiper
                    window.recentlyViewedSwiper = new Swiper(swiperContainer, options);
                } catch (e) {
                    console.warn('Failed to parse swiper options:', e);
                }
            }
        }
    }

    // Generate product card HTML
    generateProductCardHTML(product) {
        return `
            <div class="card-product style-2 style-border-2" 
                 style="
                    --card-border-thickness: 1px;
                    --card-border-opacity: 0.1;
                    --card-corner-radius: 16px;
                 ">
                <div class="card-product-wrapper asp-ratio-0">
                    <a href="${product.url}" class="product-img">
                        <img class="img-product lazyload"
                            width="460" height="460"
                            data-src="${this.getFeaturedImage(product)}" 
                            src="${this.getFeaturedImage(product)}" 
                            alt="${product.title}">
                        <img class="img-hover lazyload"
                            width="460" height="460"
                            data-src="${product.images && product.images[1] ? product.images[1].src : this.getFeaturedImage(product)}" 
                            src="${product.images && product.images[1] ? product.images[1].src : this.getFeaturedImage(product)}"
                            alt="${product.title}">
                    </a>
                    ${this.generateSaleBadgeHTML(product)}
                    ${this.generateProductButtonsHTML(product)}
                </div>
                <div class="card-product-info text-center">
                    <a href="${product.url}" class="name-product link fw-medium text-md">${product.title}</a>
                    ${this.generatePriceHTML(product)}
                </div>
            </div>
        `;
    }

    // Generate sale badge HTML
    generateSaleBadgeHTML(product) {
        if (product.compare_at_price && product.compare_at_price > product.price) {
            const savePercentage = Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100);
            return `
                <div class="on-sale-wrap">
                    <span class="on-sale-item">${savePercentage}% Off</span>
                </div>
            `;
        }
        return '';
    }

    // Generate product buttons HTML
    generateProductButtonsHTML(product) {
        return `
            <ul class="list-product-btn">
                <li>
                    <a data-bs-toggle="offcanvas"
                         class="hover-tooltip box-icon product-cart-button"
                         data-product-id="${product.id}"
                         data-product-handle="${product.handle}"
                         data-variant-id="${this.getVariantId(product)}">
                        <span class="icon icon-cart2"></span>
                        <span class="tooltip">Add to Cart</span>
                    </a>
                </li>
                <li class="wishlist">
                    <a href="#" class="hover-tooltip box-icon"
                        data-product-id="${product.id}"
                        data-product-handle="${product.handle}">
                        <span class="icon icon-heart2"></span>
                        <span class="tooltip">Add to Wishlist</span>
                    </a>
                </li>
                <li>
                    <a href="#" 
                    class="hover-tooltip box-icon quickview btn-quickview" 
                    data-product-id="${product.id}"
                    data-product-handle="${product.handle}"
                    data-product-title="${product.title || ''}"
                    data-product-price="${this.formatPriceForQuickview(product.price) || ''}"
                    data-product-compare-price="${this.formatPriceForQuickview(product.compare_at_price) || ''}"
                    data-product-description="${this.cleanDescription(product.description)}"
                    data-product-url="${product.url || ''}"
                    data-product-images="${this.formatImagesForQuickview(product.images)}"
                    data-product-variants="${product.variants ? this.escapeHtml(JSON.stringify(product.variants)) : ''}"
                    data-product-options="${this.escapeHtml(this.formatOptionsForQuickview(product.variants))}">
                        <span class="icon icon-view"></span>
                        <span class="tooltip">Quick View</span>
                    </a>
                </li>
                <li class="compare">
                    <a href="#compare" class="hover-tooltip box-icon"
                        data-product-id="${product.id}"
                        data-product-handle="${product.handle}">
                        <span class="icon icon-compare"></span>
                        <span class="tooltip">Add to Compare</span>
                    </a>
                </li>
            </ul>
        `;
    }

    // Helper method to format price
    formatPrice(price) {
        if (typeof price === 'number') {
            return (price / 100).toFixed(2);
        }
        return price;
    }

    // Helper method to format price for quickview (matching snippet's | money filter)
    formatPriceForQuickview(price) {
        if (typeof price === 'number') {
            // Format as currency string like Shopify's money filter
            return `$${(price / 100).toFixed(2)}`;
        }
        return price;
    }

    // Generate price HTML
    generatePriceHTML(product) {
        const price = this.getProductPrice(product);
        const comparePrice = this.getProductComparePrice(product);
        
        return `
            <p class="price-wrap fw-medium">
                <span class="price-new text-xl-2">$${this.formatPrice(price)}</span>
                ${comparePrice && comparePrice > price ? 
                    `<span class="price-old text-sm old-line">$${this.formatPrice(comparePrice)}</span>` : ''}
            </p>
        `;
    }



    // Helper method to get variant ID
    getVariantId(product) {
        return product.selected_or_first_available_variant ? 
            product.selected_or_first_available_variant.id : 
            (product.variant && product.variant.length > 0 ? product.variant[0].id : '');
    }

    // Helper method to get first available variant
    getFirstAvailableVariant(product) {
        if (product.variant && product.variant.length > 0) {
            return product.variant.find(v => v.available) || product.variant[0];
        }
        return null;
    }

    // Helper method to clean description
    cleanDescription(description) {
        if (!description) return '';
        // Clean HTML and truncate to 150 chars like snippet's | truncate: 150
        const cleanDesc = description.replace(/<[^>]*>/g, '');
        if (cleanDesc.length <= 150) return cleanDesc;
        return cleanDesc.substring(0, 147) + '...';
    }

    // Helper method to get featured image
    getFeaturedImage(product) {
        if (product.featured_image) {
            return product.featured_image;
        }
        if (product.variant && product.variant.length > 0 && product.variant[0].featured_image) {
            return product.variant[0].featured_image.src;
        }
        return '';
    }

    // Helper method to get product price
    getProductPrice(product) {
        if (product.price !== undefined) {
            return product.price;
        }
        if (product.variant && product.variant.length > 0) {
            return product.variant[0].price;
        }
        return 0;
    }

    // Helper method to get product compare price
    getProductComparePrice(product) {
        if (product.compare_at_price !== undefined) {
            return product.compare_at_price;
        }
        if (product.variant && product.variant.length > 0) {
            return product.variant[0].compare_at_price;
        }
        return null;
    }

    // Helper method to format images
    formatImages(images) {
        if (!images) return '';
        return images.map(img => img.src || img).join(',');
    }

    // Helper method to format images for quickview (matching snippet format)
    formatImagesForQuickview(images) {
        if (!images) return '';
        // Format images as comma-separated URLs (matching snippet format exactly)
        return images.map(img => {
            let url = img.src || img;
            // Extract just the path part starting with /cdn/shop/ (like snippet)
            if (url.includes('/cdn/shop/')) {
                const cdnIndex = url.indexOf('/cdn/shop/');
                url = url.substring(cdnIndex);
            }
            return url;
        }).join(',');
    }

    // Helper method to format options for quickview (matching snippet format)
    formatOptionsForQuickview(variants) {
        if (!variants || variants.length === 0) return '';
        
        // Create options structure exactly like product.options_with_values
        const options = [];
        
        // Extract unique option names from variants
        if (variants[0] && variants[0].options) {
            variants[0].options.forEach((optionValue, index) => {
                const optionName = this.getOptionName(index);
                const optionValues = [...new Set(variants.map(v => v.options[index]))];
                
                options.push({
                    name: optionName,
                    position: index + 1,
                    values: optionValues
                });
            });
        }
        
        return JSON.stringify(options);
    }

    // Helper method to get option name by index
    getOptionName(index) {
        const optionNames = ['Color', 'Size', 'Material', 'Style'];
        return optionNames[index] || `Option ${index + 1}`;
    }

    // Helper method to escape HTML for data attributes
    escapeHtml(text) {
        if (!text) return '';
        // Use a more robust HTML escaping method
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Find all recently viewed sections and initialize them
    const recentlyViewedSections = document.querySelectorAll('[id^="recently-viewed-"]');
    recentlyViewedSections.forEach(section => {
        const sectionId = section.id;
        // Find the div with data-products-to-show attribute within this section
        const productsToShowElement = section.querySelector('[data-products-to-show]');
        const productsToShow = productsToShowElement ? 
                              parseInt(productsToShowElement.getAttribute('data-products-to-show')) : 8;
        const recentlyViewed = new RecentlyViewedProducts(sectionId, productsToShow);
        
        // Watch for changes in the section content and reinitialize if needed
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if the swiper-wrapper was modified and is empty
                    const swiperWrapper = section.querySelector('.swiper-wrapper');
                    if (swiperWrapper && swiperWrapper.children.length === 0) {
                        // Reinitialize the products
                        recentlyViewed.updateRecentlyViewedSection();
                    }
                }
            });
        });
        
        // Start observing the section for changes
        observer.observe(section, {
            childList: true,
            subtree: true
        });
    });
});

// Global function to manually refresh recently viewed products
window.refreshRecentlyViewedProducts = function() {
    const recentlyViewedSections = document.querySelectorAll('[id^="recently-viewed-"]');
    recentlyViewedSections.forEach(section => {
        const sectionId = section.id;
        const productsToShowElement = section.querySelector('[data-products-to-show]');
        const productsToShow = productsToShowElement ? 
                              parseInt(productsToShowElement.getAttribute('data-products-to-show')) : 8;
        
        // Create a temporary instance to refresh the section
        const tempRecentlyViewed = new RecentlyViewedProducts(sectionId, productsToShow);
        tempRecentlyViewed.updateRecentlyViewedSection();
    });
};

// Listen for Shopify section rendering events
document.addEventListener('shopify:section:load', function(event) {
    if (event.target.id && event.target.id.startsWith('recently-viewed-')) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            window.refreshRecentlyViewedProducts();
        }, 100);
    }
});

// Periodic check as fallback (every 5 seconds)
setInterval(function() {
    const recentlyViewedSections = document.querySelectorAll('[id^="recently-viewed-"]');
    recentlyViewedSections.forEach(section => {
        const swiperWrapper = section.querySelector('.swiper-wrapper');
        if (swiperWrapper && swiperWrapper.children.length === 0) {
            // Section is empty, refresh it
            const sectionId = section.id;
            const productsToShowElement = section.querySelector('[data-products-to-show]');
            const productsToShow = productsToShowElement ? 
                                  parseInt(productsToShowElement.getAttribute('data-products-to-show')) : 8;
            
            const tempRecentlyViewed = new RecentlyViewedProducts(sectionId, productsToShow);
            tempRecentlyViewed.updateRecentlyViewedSection();
        }
    });
}, 5000);
