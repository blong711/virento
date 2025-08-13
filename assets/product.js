document.addEventListener('DOMContentLoaded', function() {
  
    // Video Consent Handling
    console.log('Video consent script loaded');

    // Handle video consent
    const handleVideoConsent = (consent) => {
      console.log('Handling consent:', consent);
      localStorage.setItem('videoAutoplayConsent', consent);

      // Find and close the modal
      const modal = document.getElementById('videoAutoplayConsent');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        }
      }

      // Handle video playback
      if (consent && window.enableVideoAutoplay) {
        const activeSlide = document.querySelector('.tf-product-media-main .swiper-slide-active');
        if (activeSlide?.getAttribute('data-media-type') === 'video') {
          const video = activeSlide.querySelector('video');
          if (video) {
            console.log('Playing video after consent');
            video.play().catch(e => console.log('Video autoplay failed:', e));
          }
        }
      }
    };

    // Initialize consent handlers
    const initVideoConsent = () => {
      console.log('Initializing video consent handlers');
      
      // Set up button handlers
      document.getElementById('acceptAutoplay')?.addEventListener('click', () => {
        console.log('Accept clicked');
        handleVideoConsent(true);
      });

      document.getElementById('declineAutoplay')?.addEventListener('click', () => {
        console.log('Decline clicked');
        handleVideoConsent(false);
      });
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initVideoConsent);
    } else {
      initVideoConsent();
    }
  
    // Default layout with Swiper
    const galleryThumbs = new Swiper('.tf-product-media-thumbs', {
      direction: 'horizontal',
      slidesPerView: 4,
      spaceBetween: 10,
      navigation: {
        nextEl: '.thumbs-next',
        prevEl: '.thumbs-prev',
      },
      breakpoints: {
        1200: {
          direction: 'vertical',
          slidesPerView: 4,
        }
      }
    });

    const galleryMain = new Swiper('.tf-product-media-main', {
      slidesPerView: 1,
      spaceBetween: 0,
      thumbs: {
        swiper: galleryThumbs
      },
      navigation: {
        nextEl: '.thumbs-next',
        prevEl: '.thumbs-prev',
      },
      on: {
        init: function() {
          // Initialize Intersection Observer for videos
          const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              const video = entry.target;
              if (entry.isIntersecting) {
                // Only autoplay if both setting is enabled and user has given consent
                if (window.enableVideoAutoplay && getVideoAutoplayConsent()) {
                  video.play().catch(e => console.log('Video autoplay failed:', e));
                }
              } else {
                video.pause();
              }
            });
          }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
          });

          // Initialize all videos
          this.slides.forEach(slide => {
            const video = slide.querySelector('video');
            if (video) {
              // Ensure video is paused initially
              video.pause();
              video.currentTime = 0;
              
              // Add error handling
              video.addEventListener('error', function(e) {
                console.log('Video error:', e);
              });

              // Observe the video for viewport visibility
              videoObserver.observe(video);
            }
          });
        },
        slideChange: function() {
          const activeSlide = this.slides[this.activeIndex];
          const mediaType = activeSlide.getAttribute('data-media-type');
          const activeVideo = activeSlide.querySelector('video');
          
          // Pause all videos first
          this.slides.forEach(slide => {
            const video = slide.querySelector('video');
            if (video && video !== activeVideo) {
              video.pause();
            }
          });

          // Handle video in active slide
          if (mediaType === 'video') {
            // Check if consent is needed
            if (window.enableVideoAutoplay && localStorage.getItem('videoAutoplayConsent') === null) {
              const consentModal = document.getElementById('videoAutoplayConsent');
              if (consentModal) {
                const modal = new bootstrap.Modal(consentModal);
                modal.show();
              }
            }

            if (activeVideo) {
              activeVideo.currentTime = 0;
              if (window.enableVideoAutoplay && getVideoAutoplayConsent()) {
                activeVideo.play().catch(e => console.log('Video autoplay failed:', e));
              }
            }
          }

          // Handle variant and media updates
          const mediaId = parseInt(activeSlide.getAttribute('data-media-id'));
          const productMedia = window.productMedia || [];
          const media = productMedia.find(m => m.id === mediaId);

          // Find the variant that matches this media (by variant_ids or src)
          let matchedVariant = null;
          const variants = window.productVariants || [];
          if (media && media.variant_ids && media.variant_ids.length > 0) {
            matchedVariant = variants.find(v => media.variant_ids.includes(v.id));
          }
          if (!matchedVariant && media && media.src) {
            matchedVariant = variants.find(v => v.featured_image && v.featured_image.src === media.src);
          }

          // Update variant selection if a matching variant was found
          if (matchedVariant) {
            updateVariantSelection(matchedVariant);
          }

          // Update color swatch active state
          if (matchedVariant && matchedVariant.option1) {
            const color = matchedVariant.option1.toLowerCase();
            document.querySelectorAll('.color-btn, .btn-scroll-target').forEach(btn => {
              if (btn.getAttribute('data-scroll') && btn.getAttribute('data-scroll').toLowerCase() === color) {
                btn.classList.add('active');
              } else {
                btn.classList.remove('active');
              }
            });
          }
        }
      }
    });

    // Add click handler for images to select variants
    document.querySelectorAll('.tf-product-media-main .swiper-slide').forEach(slide => {
      slide.addEventListener('click', function() {
        const mediaId = parseInt(this.getAttribute('data-media-id'));
        const productMedia = window.productMedia || [];
        const media = productMedia.find(m => m.id === mediaId);

        if (media) {
          const variants = window.productVariants || [];
          let matchedVariant = null;

          // Try to find variant by variant_ids
          if (media.variant_ids && media.variant_ids.length > 0) {
            matchedVariant = variants.find(v => media.variant_ids.includes(v.id));
          }

          // If no match found, try to match by src
          if (!matchedVariant && media.src) {
            matchedVariant = variants.find(v => v.featured_image && v.featured_image.src === media.src);
          }

          if (matchedVariant) {
            updateVariantSelection(matchedVariant);
          }
        }
      });
    });

    // Disable navigation buttons when at start/end
    function updateNavigationButtons() {
      
      const prevButton = document.querySelector('.thumbs-prev');
      const nextButton = document.querySelector('.thumbs-next');
      
      // Only update if buttons exist (they don't exist in grid/stacked layouts)
      if (prevButton && galleryMain.isBeginning) {
        prevButton.classList.add('swiper-button-disabled');
      } else if (prevButton) {
        prevButton.classList.remove('swiper-button-disabled');
      }
      
      if (nextButton && galleryMain.isEnd) {
        nextButton.classList.add('swiper-button-disabled');
      } else if (nextButton) {
        nextButton.classList.remove('swiper-button-disabled');
      }
    }

    galleryMain.on('slideChange', updateNavigationButtons);
    updateNavigationButtons();

    // Show/hide navigation buttons based on setting
    if (window.showSliderNav) {
      document.querySelectorAll('.thumbs-next, .thumbs-prev').forEach(btn => btn.style.display = '');
    } else {
      document.querySelectorAll('.thumbs-next, .thumbs-prev').forEach(btn => btn.style.display = 'none');
    }
  
    // Debug: Track when active classes are removed
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.classList.contains('color-btn') || target.classList.contains('btn-scroll-target')) {
            if (!target.classList.contains('active') && mutation.oldValue && mutation.oldValue.includes('active')) {
  
            }
          }
        }
      });
    });
  
    // Observe all color buttons
    document.querySelectorAll('.color-btn, .btn-scroll-target').forEach(btn => {
      observer.observe(btn, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['class']
      });
    });
  
    // Store selected options
    let selectedOptions = window.selectedOptions || {};
  
    // Function to find variant by color
    function findVariantByColor(color) {
      try {
        if (!color) {
          console.warn('No color provided to findVariantByColor');
          return null;
        }
  
        const variants = window.productVariants || [];
                if (!Array.isArray(variants) || variants.length === 0) {
          console.warn('No variants available');
          return null;
        }

        const options = window.productOptions || [];
        if (!Array.isArray(options)) {
          console.warn('Product options not available');
          return null;
        }
        
        // Get current size selection
        const activeSizeBtn = document.querySelector('.size-btn.active, .select-item[data-option="size"].active');
        const selectedSize = activeSizeBtn ? activeSizeBtn.getAttribute('data-value') : null;
        
        // Find variant that matches both color and size
        for (const variant of variants) {
          if (!variant || typeof variant !== 'object') continue;
          
          const matchesColor = variant.option1 && variant.option1.toLowerCase() === color.toLowerCase();
          const matchesSize = !selectedSize || (variant.option2 && variant.option2.toLowerCase() === selectedSize.toLowerCase());
          
          if (matchesColor && matchesSize) {
            return variant;
          }
        }
        
        // If no size is selected, return the first available variant for the selected color
        if (!selectedSize) {
          for (const variant of variants) {
            if (!variant || typeof variant !== 'object') continue;
            
            const matchesColor = variant.option1 && variant.option1.toLowerCase() === color.toLowerCase();
            if (matchesColor && variant.available) {
              console.log('No size selected, returning first available variant for color:', variant.title);
              return variant;
            }
          }
        }
        
        console.warn(`No variant found for color: ${color}${selectedSize ? ` and size: ${selectedSize}` : ''}`);
        return null;
      } catch (error) {
        console.error('Error in findVariantByColor:', error);
        return null;
      }
    }
  
    // Function to find variant ID based on selected options
    function findVariantId() {
      
      const variants = window.productVariants || [];
      const options = window.productOptions || [];
      
      // Get current selections
      const activeColorBtn = document.querySelector('.color-btn.active, .btn-scroll-target.active, .select-item[data-option="color"].active');
      const activeSizeBtn = document.querySelector('.size-btn.active, .select-item[data-option="size"].active');
      
      // For color, we need to get the display value, not the handle
      let selectedColor = null;
      if (activeColorBtn) {
        if (activeColorBtn.classList.contains('color-btn') || activeColorBtn.classList.contains('btn-scroll-target')) {
          // For color swatches, use data-scroll
          selectedColor = activeColorBtn.getAttribute('data-scroll');
        } else {
          // For color dropdown, use the text content (display value)
          const textElement = activeColorBtn.querySelector('.text-value-item');
          selectedColor = textElement ? textElement.textContent : activeColorBtn.getAttribute('data-value');
        }
      }
      
      const selectedSize = activeSizeBtn ? activeSizeBtn.getAttribute('data-value') : null;
      
      console.log('findVariantId - selectedColor:', selectedColor, 'selectedSize:', selectedSize, 'activeColorBtn:', activeColorBtn, 'activeSizeBtn:', activeSizeBtn);
      
      // Find variant that matches all selected options
      const matchingVariant = variants.find(variant => {
        const matchesColor = !selectedColor || 
          (variant.option1 && variant.option1.toLowerCase() === selectedColor.toLowerCase());
        const matchesSize = !selectedSize || 
          (variant.option2 && variant.option2.toLowerCase() === selectedSize.toLowerCase());
        
        return matchesColor && matchesSize;
      });
      
      return matchingVariant ? matchingVariant.id : null;
    }
  
    // Function to handle hiding sold out variants
    function handleSoldOutVariants() {
      if (!window.variantPickerSettings || !window.variantPickerSettings.hideSoldOut) {
        return;
      }
      
      // Hide sold out variant options
      const variantOptions = document.querySelectorAll('.color-btn, .size-btn, .select-item');
      variantOptions.forEach(option => {
        const optionValue = option.getAttribute('data-value') || option.getAttribute('data-scroll');
        const optionType = option.getAttribute('data-option');
        
        if (optionValue && optionType) {
          // Find if this option has any available variants
          const hasAvailableVariant = window.productVariants.some(variant => {
            if (optionType === 'color' && variant.option1 && variant.option1.toLowerCase() === optionValue.toLowerCase()) {
              return variant.available;
            } else if (optionType === 'size' && variant.option2 && variant.option2.toLowerCase() === optionValue.toLowerCase()) {
              return variant.available;
            }
            return false;
          });
          
          if (!hasAvailableVariant) {
            option.style.display = 'none';
          } else {
            option.style.display = '';
          }
        }
      });
    }

    // Function to update variant selection
    function updateVariantSelection(variant) {
      try {
        if (!variant || typeof variant !== 'object') {
          console.warn('Invalid variant provided to updateVariantSelection');
          return;
        }
  
        // Update main add to cart buttons (excludes sticky section)
        const mainAddToCartBtns = document.querySelectorAll('.product-cart-button:not(.tf-sticky-btn-atc .product-cart-button)');
        mainAddToCartBtns.forEach(addToCartBtn => {
          addToCartBtn.dataset.variantId = variant.id;
          addToCartBtn.dataset.selectedVariant = variant.id;
          
          // Update quantity in add to cart button
          const quantityInput = addToCartBtn.closest('form, .tf-product-info')?.querySelector('.quantity-product');
          if (quantityInput) {
            const quantity = parseInt(quantityInput.value) || 1;
            addToCartBtn.dataset.quantity = quantity;
          }
        });
        

  
        // Update price
        const priceElement = document.querySelector('.price-new');
        const oldPriceElement = document.querySelector('.price-old');
        if (priceElement && typeof variant.price === 'number') {
          priceElement.textContent = formatMoney(variant.price);
        }
        if (oldPriceElement && typeof variant.compare_at_price === 'number') {
          if (variant.compare_at_price > variant.price) {
            oldPriceElement.textContent = formatMoney(variant.compare_at_price);
            oldPriceElement.style.display = 'inline';
          } else {
            oldPriceElement.style.display = 'none';
          }
        }
  
        // Update selected options
        if (variant.option1) {
          selectedOptions['color'] = variant.option1.toLowerCase();
        }
        if (variant.option2) {
          selectedOptions['size'] = variant.option2.toLowerCase();
        }
  
        // Update the label value for each option
        try {
          const options = window.productOptionsWithValues || [];
          if (Array.isArray(options)) {
            options.forEach(function(option, idx) {
              if (!option || !variant.options || !Array.isArray(variant.options)) return;
              
              var value = variant.options[idx];
              var labelClass = '.variant-picker-label-value.value-current' + option.name;
              var labelEl = document.querySelector(labelClass);
              if (labelEl && value) {
                labelEl.textContent = value;
              }
            });
          }
        } catch (error) {
          console.error('Error updating option labels:', error);
        }
  
        // Check if we're in grid or stacked layout
        const isGridOrStacked = document.querySelector('.flat-single-grid') !== null;
        
        try {
          // Handle image switching based on layout
          if (isGridOrStacked) {
            // For grid and stacked layouts, scroll to the matching image
            const productMedia = window.productMedia || [];
            if (!Array.isArray(productMedia)) {
              console.warn('Product media data is not available');
              return;
            }
  
            let targetImage = null;
            
            // First try to find the variant's featured image
            if (variant.featured_image) {
              targetImage = productMedia.find(m => m.id === variant.featured_image.id);
            }
            
            // If no featured image found, try to find any image associated with this variant
            if (!targetImage) {
              targetImage = productMedia.find(m => 
                m.variant_ids && Array.isArray(m.variant_ids) && m.variant_ids.includes(variant.id)
              );
            }
            
            // If still no image found, try to match by src
            if (!targetImage && variant.featured_image && variant.featured_image.src) {
              targetImage = productMedia.find(m => m.src === variant.featured_image.src);
            }
            
            // Scroll to the target image if found
            if (targetImage) {
              console.log('Scrolling to target image:', targetImage.id);
              // Find the gallery item with the matching media ID
              const galleryItems = document.querySelectorAll('.item-scroll-target');
              for (let item of galleryItems) {
                const mediaId = parseInt(item.getAttribute('data-media-id'));
                if (mediaId === targetImage.id) {
                  console.log('Found matching gallery item, scrolling...');
                  item.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                  });
                  break;
                }
              }
            }
          } else {
            // Default layout with Swiper
            const mainSwiper = document.querySelector('.tf-product-media-main')?.swiper;
            
            if (mainSwiper && mainSwiper.slides) {
              const slides = mainSwiper.slides;
              let foundMatchingSlide = false;
              
              // First try to find a slide that matches the variant's featured image
              if (variant.featured_image) {
                for (let i = 0; i < slides.length; i++) {
                  const mediaId = parseInt(slides[i].getAttribute('data-media-id'));
                  
                  if (mediaId === variant.featured_image.id) {
                    mainSwiper.slideTo(i);
                    foundMatchingSlide = true;
                    break;
                  }
                }
              }
              
              // If no exact match found, try to find the first image for this variant
              if (!foundMatchingSlide) {
                const productMedia = window.productMedia || [];
                if (Array.isArray(productMedia)) {
                  for (let i = 0; i < slides.length; i++) {
                    const mediaId = parseInt(slides[i].getAttribute('data-media-id'));
                    const media = productMedia.find(m => m.id === mediaId);
                    
                    if (media && media.variant_ids && media.variant_ids.includes(variant.id)) {
                      mainSwiper.slideTo(i);
                      foundMatchingSlide = true;
                      break;
                    }
                  }
                  
                  // Fallback: try matching by src if variant.featured_image.src exists
                  if (!foundMatchingSlide && variant.featured_image && variant.featured_image.src) {
                    for (let i = 0; i < slides.length; i++) {
                      const mediaId = parseInt(slides[i].getAttribute('data-media-id'));
                      const media = productMedia.find(m => m.id === mediaId);
                      if (media && media.src === variant.featured_image.src) {
                        mainSwiper.slideTo(i);
                        foundMatchingSlide = true;
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error updating product images:', error);
        }
  
        // Set the active color swatch based on the selected color
        if (variant.option1) {
          const color = variant.option1.toLowerCase();
          document.querySelectorAll('.color-btn, .btn-scroll-target, .select-item[data-option="color"]').forEach(btn => {
            try {
              let matches = false;
              
              if (btn.classList.contains('color-btn') || btn.classList.contains('btn-scroll-target')) {
                // For color swatches, check data-scroll
                if (btn.getAttribute('data-scroll') && btn.getAttribute('data-scroll').toLowerCase() === color) {
                  matches = true;
                }
              } else {
                // For color dropdown, check the text content
                const textElement = btn.querySelector('.text-value-item');
                if (textElement && textElement.textContent.toLowerCase() === color) {
                  matches = true;
                }
              }
              
              if (matches) {
                btn.classList.add('active');
                
                // Add a small delay to ensure the active class persists
                setTimeout(() => {
                  if (!btn.classList.contains('active')) {
                    console.log('Active class was removed, re-adding it');
                    btn.classList.add('active');
                  }
                }, 50);
              } else {
                btn.classList.remove('active');
              }
            } catch (error) {
              console.error('Error updating color swatch:', error);
            }
          });
        }
  
        // Set the active size button based on the selected size
        if (variant.option2) {
          const size = variant.option2.toLowerCase();
          document.querySelectorAll('.size-btn, .select-item[data-option="size"]').forEach(btn => {
            try {
              if (btn.getAttribute('data-value') && btn.getAttribute('data-value').toLowerCase() === size) {
                btn.classList.add('active');
              } else {
                btn.classList.remove('active');
              }
            } catch (error) {
              console.error('Error updating size button:', error);
            }
          });
        }
        
        // Handle hiding sold out variants after updating selection
        handleSoldOutVariants();

      } catch (error) {
        console.error('Error in updateVariantSelection:', error);
      }
    }
  
    // Add translations at the start of the script
    const translations = {
      variantNotAvailable: window.translations?.variantNotAvailable || 'This variant is not available',
      colorNotAvailable: window.translations?.colorNotAvailable || 'This color is not available',
      sizeNotAvailable: window.translations?.sizeNotAvailable || 'This size is not available',
      variantError: window.translations?.variantError || 'Error selecting variant'
    };
  
    // Use event delegation for color swatch clicks
    document.addEventListener('click', function(e) {
      try {
        const btn = e.target.closest('.color-btn, .btn-scroll-target');
        if (!btn) return;
        
        const color = btn.getAttribute('data-scroll');
        if (!color) {
          console.warn('Color swatch clicked but no data-scroll attribute found');
          return;
        }
  
        const variant = findVariantByColor(color);
        if (variant) {
          updateVariantSelection(variant);
        } else {
          console.warn('No variant found for color:', color);
          const selectedSize = getSelectedSize();
          alert(selectedSize ? translations.variantNotAvailable : translations.colorNotAvailable);
        }
      } catch (error) {
        console.error('Error handling color swatch click:', error);
        alert(translations.variantError);
      }
    });
  
    // Helper function to get selected size
    function getSelectedSize() {
      try {
        const activeSizeBtn = document.querySelector('.size-btn.active, .select-item[data-option="size"].active');
        return activeSizeBtn ? activeSizeBtn.getAttribute('data-value') : null;
      } catch (error) {
        console.error('Error getting selected size:', error);
        return null;
      }
    }
  
    // Handle size variant selection
    document.querySelectorAll('.size-btn, .select-item[data-option="size"]').forEach(button => {
      button.addEventListener('click', function(e) {
        try {
          const size = this.getAttribute('data-value');
          if (!size) {
            console.warn('Size button clicked but no data-value attribute found');
            return;
          }
  
          // Only remove active class from size-related elements
          document.querySelectorAll('.size-btn, .select-item[data-option="size"]').forEach(btn => btn.classList.remove('active'));
          this.classList.add('active');
  
          // Update selected options
          selectedOptions['size'] = size;
  
          // Get the currently selected color
          let color = null;
          const activeColorBtn = document.querySelector('.color-btn.active, .btn-scroll-target.active, .select-item[data-option="color"].active');
          if (activeColorBtn) {
            if (activeColorBtn.classList.contains('color-btn') || activeColorBtn.classList.contains('btn-scroll-target')) {
              color = activeColorBtn.getAttribute('data-scroll');
            } else {
              const textElement = activeColorBtn.querySelector('.text-value-item');
              color = textElement ? textElement.textContent : activeColorBtn.getAttribute('data-value');
            }
          }
  
          // Find and update variant
          const variants = window.productVariants || [];
          if (!Array.isArray(variants)) {
            console.warn('Variants data is not available');
            alert(translations.variantError);
            return;
          }
  
          let variant = null;
          if (color) {
            variant = variants.find(v =>
              v && v.option1 && v.option1.toLowerCase() === color.toLowerCase() &&
              v.option2 && v.option2.toLowerCase() === size.toLowerCase()
            );
          } else {
            variant = variants.find(v =>
              v && v.option2 && v.option2.toLowerCase() === size.toLowerCase()
            );
          }
  
          if (variant) {
            updateVariantSelection(variant);
          } else {
            console.warn('No variant found for size:', size, 'and color:', color);
            alert(translations.sizeNotAvailable);
          }
        } catch (error) {
          console.error('Error handling size selection:', error);
          alert(translations.variantError);
        }
      });
    });
  
    // Main Quantity Controls (excludes sticky section)
    document.addEventListener('click', function(e) {
      // Handle decrease button clicks - only for main product section
      if (e.target.classList.contains('btn-decrease') && !e.target.closest('.tf-sticky-btn-atc')) {
        e.preventDefault();
        const quantityInput = e.target.nextElementSibling;
        let value = parseInt(quantityInput.value) || 1;
        if (value > 1) {
          value--;
          quantityInput.value = value;
          // Update main button data immediately
          updateQuantityOnButton(value);
        }
      }
      
      // Handle increase button clicks - only for main product section
      if (e.target.classList.contains('btn-increase') && !e.target.closest('.tf-sticky-btn-atc')) {
        e.preventDefault();
        const quantityInput = e.target.previousElementSibling;
        let value = parseInt(quantityInput.value) || 1;
        value++;
        quantityInput.value = value;
        // Update main button data immediately
        updateQuantityOnButton(value);
      }
    });
    
    // Function to update quantity on main add-to-cart buttons (excludes sticky section)
    function updateQuantityOnButton(value) {
      // Update only main add-to-cart buttons, not sticky ones
      const mainAddToCartBtns = document.querySelectorAll('.product-cart-button:not(.tf-sticky-btn-atc .product-cart-button)');
      mainAddToCartBtns.forEach(addToCartBtn => {
        // Always update quantity immediately
        addToCartBtn.dataset.quantity = value;
        
        // If no variant is selected, use the initial variant
        if (!addToCartBtn.dataset.variantId) {
          const initialVariant = window.initialVariant;
          if (initialVariant) {
            addToCartBtn.dataset.variantId = initialVariant.id;
            addToCartBtn.dataset.selectedVariant = initialVariant.id;
          }
        }
      });
      
      // Also update any hidden quantity inputs that the cart might be reading from (exclude sticky)
      const hiddenQuantityInputs = document.querySelectorAll('input[name="quantity"]:not(.tf-sticky-btn-atc input[name="quantity"])');
      hiddenQuantityInputs.forEach(input => {
        input.value = value;
      });
    }
    
    // Separate function for sticky add-to-cart functionality
    function updateStickyQuantity(value) {
      // Update sticky add-to-cart button
      const stickyAddToCartBtn = document.querySelector('.tf-sticky-btn-atc .product-cart-button');
      if (stickyAddToCartBtn) {
        stickyAddToCartBtn.dataset.quantity = value;
        
        // If no variant is selected, use the initial variant
        if (!stickyAddToCartBtn.dataset.variantId) {
          const initialVariant = window.initialVariant;
          if (initialVariant) {
            stickyAddToCartBtn.dataset.variantId = initialVariant.id;
            stickyAddToCartBtn.dataset.selectedVariant = initialVariant.id;
          }
        }
      }
      
      // Update sticky quantity input
      const stickyQuantityInput = document.querySelector('.tf-sticky-btn-atc .quantity-product');
      if (stickyQuantityInput) {
        stickyQuantityInput.value = value;
      }
    }
    
    // Function to update sticky variant selection
    function updateStickyVariant(variant) {
      if (!variant || typeof variant !== 'object') return;
      
      // Update sticky add-to-cart button
      const stickyAddToCartBtn = document.querySelector('.tf-sticky-btn-atc .product-cart-button');
      if (stickyAddToCartBtn) {
        stickyAddToCartBtn.dataset.variantId = variant.id;
        stickyAddToCartBtn.dataset.selectedVariant = variant.id;
        
        // Update quantity in sticky button
        const stickyQuantityInput = document.querySelector('.tf-sticky-btn-atc .quantity-product');
        if (stickyQuantityInput) {
          const quantity = parseInt(stickyQuantityInput.value) || 1;
          stickyAddToCartBtn.dataset.quantity = quantity;
        }
      }
      
      // Update sticky variant selector dropdown
      const stickyVariantSelect = document.querySelector('.tf-sticky-btn-atc .sticky-variant-select');
      if (stickyVariantSelect) {
        stickyVariantSelect.value = variant.id;
      }
    }
    
    // Handle main quantity input changes (excludes sticky section)
    document.addEventListener('change', function(e) {
      if (e.target.classList.contains('quantity-product') && !e.target.closest('.tf-sticky-btn-atc')) {
        let value = parseInt(e.target.value) || 1;
        // Ensure minimum value is 1
        value = Math.max(1, value);
        e.target.value = value;
        
        // Update main button data using the same function
        updateQuantityOnButton(value);
      }
    });
    // Handle main quantity input validation (excludes sticky section)
    document.addEventListener('input', function(e) {
      if (e.target.classList.contains('quantity-product') && !e.target.closest('.tf-sticky-btn-atc')) {
        // Remove non-numeric characters
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
      }
    });
    
    // Sticky quantity controls - separate from main quantity controls
    document.addEventListener('click', function(e) {
      // Handle sticky decrease button clicks
      if (e.target.closest('.tf-sticky-btn-atc') && e.target.classList.contains('btn-decrease')) {
        e.preventDefault();
        const quantityInput = e.target.nextElementSibling;
        let value = parseInt(quantityInput.value) || 1;
        if (value > 1) {
          value--;
          quantityInput.value = value;
          // Update sticky button data immediately
          updateStickyQuantity(value);
        }
      }
      
      // Handle sticky increase button clicks
      if (e.target.closest('.tf-sticky-btn-atc') && e.target.classList.contains('btn-increase')) {
        e.preventDefault();
        const quantityInput = e.target.previousElementSibling;
        let value = parseInt(quantityInput.value) || 1;
        value++;
        quantityInput.value = value;
        // Update sticky button data immediately
        updateStickyQuantity(value);
      }
    });
    
    // Handle sticky quantity input changes
    document.addEventListener('change', function(e) {
      if (e.target.closest('.tf-sticky-btn-atc') && e.target.classList.contains('quantity-product')) {
        let value = parseInt(e.target.value) || 1;
        // Ensure minimum value is 1
        value = Math.max(1, value);
        e.target.value = value;
        
        // Update sticky button data
        updateStickyQuantity(value);
      }
    });
    
    // Handle sticky variant selector changes
    document.addEventListener('change', function(e) {
      if (e.target.classList.contains('sticky-variant-select')) {
        const variantId = parseInt(e.target.value);
        const variants = window.productVariants || [];
        const variant = variants.find(v => v.id === variantId);
        if (variant) {
          updateStickyVariant(variant);
        }
      }
    });

  
    // Only set the active class for initial page load
    const initialVariant = window.initialVariant || null;
  
    // Handle pick mode logic
    if (window.variantPickerSettings && window.variantPickerSettings.pickMode === 'first_available') {
      // Auto-select first available variant if pick mode is set to first_available
      const firstAvailableVariant = window.productVariants.find(variant => variant.available);
      if (firstAvailableVariant && firstAvailableVariant.id !== initialVariant.id) {
        // Update the initial variant to the first available one
        window.initialVariant = firstAvailableVariant;
        updateVariantSelection(firstAvailableVariant);
        
        // Update hidden inputs and form data
        const variantIdInput = document.querySelector('input[name="id"]');
        if (variantIdInput) {
          variantIdInput.value = firstAvailableVariant.id;
        }
        
        // Update buy it now button
        const buyItNowBtn = document.querySelector('.buy-it-now');
        if (buyItNowBtn) {
          buyItNowBtn.dataset.variantId = firstAvailableVariant.id;
        }
      }
    }
  
    if (initialVariant) {
      updateVariantSelection(initialVariant);
      // Set initial color button active state
      const initialColor = initialVariant.option1;
      if (initialColor) {
        const colorBtn = Array.from(document.querySelectorAll('.color-btn, .btn-scroll-target, .select-item[data-option="color"]')).find(btn => {
          if (btn.classList.contains('color-btn') || btn.classList.contains('btn-scroll-target')) {
            // For color swatches, check data-scroll
            return btn.getAttribute('data-scroll') && btn.getAttribute('data-scroll').toLowerCase() === initialColor.toLowerCase();
          } else {
            // For color dropdown, check the text content
            const textElement = btn.querySelector('.text-value-item');
            return textElement && textElement.textContent.toLowerCase() === initialColor.toLowerCase();
          }
        });
        if (colorBtn) {
          colorBtn.classList.add('active');
        }
      }
    }
    
    // Initialize sold out variant handling
    handleSoldOutVariants();
  
    // Initialize image zoom
    const zoomMain = document.querySelector('.tf-zoom-main');
    const zoomImages = document.querySelectorAll('.tf-image-zoom');
    
    zoomImages.forEach(image => {
      image.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = x / rect.width * 100;
        const yPercent = y / rect.height * 100;
        
        zoomMain.style.backgroundImage = `url(${this.getAttribute('data-zoom')})`;
        zoomMain.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
        zoomMain.style.display = 'block';
      });
      
      image.addEventListener('mouseleave', function() {
        zoomMain.style.display = 'none';
      });
    });
  

  
    // Initialize wishlist buttons state
    if (window.wishlistCompare) {
      window.wishlistCompare.updateButtonsState();
    }
  
    // Compare button functionality is handled by global.js
  
    // Remove .tf-zoom-main logic (no longer needed)
    // Add new zoom-at-cursor logic for all .tf-image-zoom and .tf-image-zoom-inner
    if (window.enableImageZoom) {
      document.querySelectorAll('.tf-image-zoom, .tf-image-zoom-inner').forEach(image => {
        image.addEventListener('mousemove', function(e) {
          const rect = this.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          this.style.transformOrigin = `${x}% ${y}%`;
          this.classList.add('zoomed');
        });
        image.addEventListener('mouseleave', function() {
          this.classList.remove('zoomed');
          this.style.transformOrigin = 'center center';
        });
      });
    }
  
    document.querySelectorAll('.tf-model-viewer-ui-button .icon-btn3d').forEach(function(icon) {
      icon.addEventListener('click', function() {
        const item = icon.closest('.item');
        if (!item) return;
        const modelViewer = item.querySelector('model-viewer');
        if (modelViewer) {
          modelViewer.classList.remove('disabled');
        }
        const iconButton = item.querySelector('.tf-model-viewer-ui-button');
        if (iconButton) {
          iconButton.style.display = 'none';
        }
        // Disable swiper drag when 3D is enabled
        let swiperEl = item.closest('.swiper');
        if (swiperEl && swiperEl.swiper) {
          swiperEl.swiper.allowTouchMove = false;
        }
      });
    });
  
    // Handle dropdown changes for variant picker
    document.querySelectorAll('.option-dropdown, .color-dropdown').forEach(function(select) {
      select.addEventListener('change', function() {
        const optionName = this.getAttribute('data-option-name');
        const value = this.value;
        if (optionName) {
          selectedOptions[optionName.toLowerCase()] = value.toLowerCase();
        }
        // Find the matching variant
        const variants = window.productVariants || [];
        const options = window.productOptions || [];
        // Build an array of selected values in order
        const selectedValues = options.map(function(opt) {
          return selectedOptions[opt.toLowerCase()];
        });
        const matchingVariant = variants.find(function(variant) {
          return variant.options.every(function(optValue, idx) {
            return optValue && optValue.toLowerCase() === selectedValues[idx];
          });
        });
        if (matchingVariant) {
          updateVariantSelection(matchingVariant);
        }
      });
    });
  

  
    // Handle custom swatch dropdown for color selection
    document.querySelectorAll('.tf-variant-dropdown .select-item').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        const value = btn.getAttribute('data-value');
        const label = btn.querySelector('.text-value-item').textContent;
        // Update dropdown label
        const dropdown = btn.closest('.tf-variant-dropdown');
        if (dropdown) {
          const labelSpan = dropdown.querySelector('.text-sort-value');
          if (labelSpan) labelSpan.textContent = label;
        }
        // Set active class
        btn.parentElement.querySelectorAll('.select-item').forEach(function(el) {
          el.classList.remove('active');
        });
        btn.classList.add('active');
        // Update the label value for the option
        const pickerItem = btn.closest('.variant-picker-item');
        if (pickerItem) {
          const labelValue = pickerItem.querySelector('.variant-picker-label-value');
          if (labelValue) labelValue.textContent = label;
        }
        // Update selectedOptions
        if (pickerItem) {
          const optionName = pickerItem.className.match(/variant-([\w-]+)/);
          if (optionName && optionName[1]) {
            // Only update the specific option, don't override other options
            if (optionName[1] === 'color') {
              selectedOptions['color'] = label; // Use display value, not handle
            } else if (optionName[1] === 'size') {
              selectedOptions['size'] = label; // Use display value, not handle
            }
          }
          // Also directly update color option if this is a color dropdown
          if (btn.getAttribute('data-option') === 'color') {
            selectedOptions['color'] = label; // Use display value, not handle
          }
        }
        // Trigger variant selection logic
        if (typeof findVariantByColor === 'function') {
          // --- NEW: Get the currently selected size ---
          let size = null;
          const activeSizeBtn = document.querySelector('.size-btn.active, .select-item[data-option="size"].active');
          if (activeSizeBtn) {
            size = activeSizeBtn.getAttribute('data-value');
          }
  
          // Find and update variant
          const variants = window.productVariants || [];
          let variant = null;
          if (size) {
            variant = variants.find(v =>
              v.option1 && v.option1.toLowerCase() === label.toLowerCase() &&
              v.option2 && v.option2.toLowerCase() === size.toLowerCase()
            );
          } else {
            variant = findVariantByColor(label);
          }
          if (variant) {
            updateVariantSelection(variant);
          }
        }
      });
    });
  

  

  

  

  
    const copyButton = document.getElementById('btn-coppy-text');
    const textToCopy = document.getElementById('coppyText');
    
    if (copyButton && textToCopy) {
      copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(textToCopy.textContent).then(() => {
          // Show success state
          const originalText = this.textContent;
          this.textContent = 'Copied!';
          this.classList.add('copied');
          
          // Reset after 2 seconds
          setTimeout(() => {
            this.textContent = originalText;
            this.classList.remove('copied');
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy text:', err);
        });
      });
    }
    
    // Handle social share links
    document.querySelectorAll('.share-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        window.open(this.href, '', 'width=600,height=460,menubar=no,toolbar=no,resizable=yes,scrollbars=yes');
      });
    });
  
    document.querySelectorAll('.sold-count-js').forEach(function(el) {
      var min = parseInt(el.getAttribute('data-min'), 10);
      var max = parseInt(el.getAttribute('data-max'), 10);
      var random = Math.floor(Math.random() * (max - min + 1)) + min;
      el.textContent = el.textContent.replace(/\d+/, random);
    });
  
    // Handle notify stock form submission
    const notifyForm = document.getElementById('notify-stock-form');
    const successMessage = document.getElementById('notify-success-message');
    
    if (notifyForm) {
      notifyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        
        // Hide the form and show success message
        notifyForm.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Optional: Reset the form
        notifyForm.reset();
        
      });
    }
  

  

  
    // Video autoplay consent handling
    window.setVideoAutoplayConsent = function(consent) {
      console.log('Setting video consent to:', consent);
      localStorage.setItem('videoAutoplayConsent', consent);
      
      // Close modal using Bootstrap
      const consentModal = document.getElementById('videoAutoplayConsent');
      if (consentModal) {
        const bsModal = bootstrap.Modal.getInstance(consentModal);
        if (bsModal) {
          bsModal.hide();
        } else {
          console.log('Modal instance not found, trying to create new instance');
          const newModal = new bootstrap.Modal(consentModal);
          newModal.hide();
        }
      }
  
      // If consent was given, play the current video if it's visible
      if (consent && window.enableVideoAutoplay) {
        const mainSwiper = document.querySelector('.tf-product-media-main')?.swiper;
        if (mainSwiper) {
          const activeSlide = mainSwiper.slides[mainSwiper.activeIndex];
          if (activeSlide && activeSlide.getAttribute('data-media-type') === 'video') {
            const video = activeSlide.querySelector('video');
            if (video) {
              console.log('Playing video after consent');
              video.play().catch(e => console.log('Video autoplay failed:', e));
            }
          }
        }
      }
    };
  
    window.getVideoAutoplayConsent = function() {
      return localStorage.getItem('videoAutoplayConsent') === 'true';
    };
  
    // Initialize gallery and consent handlers
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM loaded, initializing consent handlers');
      
      // Set up consent button handlers
      const acceptBtn = document.getElementById('acceptAutoplay');
      const declineBtn = document.getElementById('declineAutoplay');
      
      if (acceptBtn) {
        console.log('Found accept button, attaching handler');
        acceptBtn.addEventListener('click', function(e) {
          console.log('Accept button clicked');
          e.preventDefault();
          window.setVideoAutoplayConsent(true);
        });
      } else {
        console.error('Accept button not found');
      }
      
      if (declineBtn) {
        console.log('Found decline button, attaching handler');
        declineBtn.addEventListener('click', function(e) {
          console.log('Decline button clicked');
          e.preventDefault();
          window.setVideoAutoplayConsent(false);
        });
      } else {
        console.error('Decline button not found');
      }
  
      // Initialize gallery
      const galleryThumbs = new Swiper('.tf-product-media-thumbs', {
        // ... existing swiper config ...
      });
  
      const galleryMain = new Swiper('.tf-product-media-main', {
        slidesPerView: 1,
        spaceBetween: 0,
        thumbs: {
          swiper: galleryThumbs
        },
        navigation: {
          nextEl: '.thumbs-next',
          prevEl: '.thumbs-prev',
        },
        on: {
          init: function() {
            console.log('Gallery initialized');
            // Initialize Intersection Observer for videos
            const videoObserver = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                  console.log('Video intersecting, checking consent');
                  // Only autoplay if both setting is enabled and user has given consent
                  if (window.enableVideoAutoplay && window.getVideoAutoplayConsent()) {
                    console.log('Attempting to play video');
                    video.play().catch(e => console.log('Video autoplay failed:', e));
                  }
                } else {
                  video.pause();
                }
              });
            }, {
              root: null,
              rootMargin: '0px',
              threshold: 0.5
            });
  
            // Initialize all videos
            this.slides.forEach(slide => {
              const video = slide.querySelector('video');
              if (video) {
                // Ensure video is paused initially
                video.pause();
                video.currentTime = 0;
                
                // Add error handling
                video.addEventListener('error', function(e) {
                  console.log('Video error:', e);
                });
  
                // Observe the video for viewport visibility
                videoObserver.observe(video);
              }
            });
          },
          slideChange: function() {
            const activeSlide = this.slides[this.activeIndex];
            const mediaType = activeSlide.getAttribute('data-media-type');
            const activeVideo = activeSlide.querySelector('video');
            
            console.log('Slide changed to:', mediaType);
            
            // Pause all videos first
            this.slides.forEach(slide => {
              const video = slide.querySelector('video');
              if (video && video !== activeVideo) {
                video.pause();
              }
            });
  
            // Handle video in active slide
            if (mediaType === 'video') {
              console.log('Current slide is video');
              // Check if consent is needed
              if (window.enableVideoAutoplay && localStorage.getItem('videoAutoplayConsent') === null) {
                console.log('Showing consent modal');
                const consentModal = document.getElementById('videoAutoplayConsent');
                if (consentModal) {
                  const modal = new bootstrap.Modal(consentModal);
                  modal.show();
                }
              }
  
              if (activeVideo) {
                activeVideo.currentTime = 0;
                if (window.enableVideoAutoplay && window.getVideoAutoplayConsent()) {
                  console.log('Attempting to play video after slide change');
                  activeVideo.play().catch(e => console.log('Video autoplay failed:', e));
                }
              }
            }
  
            // Rest of your existing slideChange code...
          }
        }
      });
    });
  
    function updateVideoObservers() {
      const hasConsent = getVideoAutoplayConsent();
      const mainSwiper = document.querySelector('.tf-product-media-main')?.swiper;
      
      if (mainSwiper && mainSwiper.slides) {
        mainSwiper.slides.forEach(slide => {
          const video = slide.querySelector('video');
          if (video) {
            if (!hasConsent) {
              video.pause();
            } else if (window.enableVideoAutoplay && slide.classList.contains('swiper-slide-active')) {
              video.play().catch(e => console.log('Video autoplay failed:', e));
            }
          }
        });
      }
    }
  
    // Initialize consent check when gallery is loaded
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM Content Loaded');
      console.log('Video autoplay setting:', window.enableVideoAutoplay);
      
      // Check for existing consent
      const existingConsent = localStorage.getItem('videoAutoplayConsent');
      console.log('Existing consent:', existingConsent);
      
      // Initialize Bootstrap modal
      const consentModal = document.getElementById('videoAutoplayConsent');
      if (!consentModal) {
        console.error('Consent modal element not found');
        return;
      }
      
      // Only show modal if autoplay is enabled and no consent is stored
      if (window.enableVideoAutoplay && existingConsent === null) {
        console.log('Showing consent modal');
        const modal = new bootstrap.Modal(consentModal);
        // Small delay to ensure modal is properly initialized
        setTimeout(() => {
          modal.show();
        }, 100);
      }
    });
  
  });
    
  // Helper function to format money
  function formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: window.shopCurrency
    }).format(cents / 100);
  }
  

