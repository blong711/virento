document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings from Liquid template
    window.enableVariantByImage = window.enableVariantByImage || false;

    
    // Initialize button states based on initial variant and pick mode
    const initializeButtonStates = () => {
      if (window.initialVariant) {
        // Update main section buttons (all main buttons get initial variant)
        updateVariantSelection(window.initialVariant, false, null, true); // Update UI for main section
        
        // Update sticky button separately with initial variant
        const stickyButton = document.querySelector('.tf-sticky-btn-atc .product-cart-button');
        if (stickyButton) {
          updateVariantSelection(window.initialVariant, false, stickyButton, false); // Don't update UI for sticky
        }
        
        // If pick mode is "user_select", don't automatically select any variant options
        // Let the user make their own selection
        if (window.variantPickerSettings && window.variantPickerSettings.pickMode === 'user_select') {
          // Clear any active states and let user choose
          document.querySelectorAll('.color-btn.active, .btn-scroll-target.active, .size-btn.active, .select-item.active').forEach(btn => {
            btn.classList.remove('active');
          });
        }
      }
    };
    
    // Call initialization after a short delay to ensure DOM is fully ready
    setTimeout(initializeButtonStates, 100);
    
    // Video Consent Handling
    // Handle video consent
    const handleVideoConsent = (consent) => {
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
            video.play().catch(e => console.log(e));
          }
        }
      }
    };

    // Initialize consent handlers
    const initVideoConsent = () => {      
      // Set up button handlers
      document.getElementById('acceptAutoplay')?.addEventListener('click', () => {
        handleVideoConsent(true);
      });

      document.getElementById('declineAutoplay')?.addEventListener('click', () => {
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
                  video.play().catch(e => console.log(e));
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
                console.log(e);
              });

              // Observe the video for viewport visibility
              videoObserver.observe(video);
            }
          });
          
          // Check if first slide is video and show consent modal if needed
          if (this.slides.length > 0) {
            const firstSlide = this.slides[0];
            const mediaType = firstSlide.getAttribute('data-media-type');
            
            if (mediaType === 'video' && window.enableVideoAutoplay && localStorage.getItem('videoAutoplayConsent') === null) {
              const consentModal = document.getElementById('videoAutoplayConsent');
              if (consentModal) {
                const modal = new bootstrap.Modal(consentModal);
                // Small delay to ensure modal is properly initialized
                setTimeout(() => {
                  modal.show();
                }, 200);
              }
            }
          }
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
                activeVideo.play().catch(e => console.log(e));
              }
            }
          }

          // Handle variant and media updates (only when setting is enabled and not in user_select mode)
          if (window.enableVariantByImage && (!window.variantPickerSettings || window.variantPickerSettings.pickMode !== 'user_select')) {
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
              // Find the main add-to-cart button in the main product section
              const mainSection = document.querySelector('.tf-product-info, .product-info, .product-details');
              const targetButton = mainSection ? mainSection.querySelector('.product-cart-button:not(.tf-sticky-btn-atc .product-cart-button)') : null;
              
              updateVariantSelection(matchedVariant, false, targetButton);
              
              // Update color swatch active state
              if (matchedVariant.option1) {
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
          } else {
            console.log('Debug: slideChange: Setting disabled or user_select mode, NOT updating variant selection');
          }
        }
      }
    });
    
    if (window.enableVariantByImage && (!window.variantPickerSettings || window.variantPickerSettings.pickMode !== 'user_select')) {
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
              // Find the main add-to-cart button in the same section as the clicked image
              const mainSection = this.closest('.tf-product-info, .product-info, .product-details');
              const targetButton = mainSection ? mainSection.querySelector('.product-cart-button:not(.tf-sticky-btn-atc .product-cart-button)') : null;
              
              updateVariantSelection(matchedVariant, false, targetButton);
            } else {
              console.log('Debug: No matching variant found for media:', media);
            }
          }
        });
      });
    } else {
      console.log('Debug: Setting is disabled or user_select mode, NOT adding click handlers for Swiper slides');
    }

    // Add click handler for grid/stacked layout images to select variants (only when setting is enabled and not in user_select mode)
    if (window.enableVariantByImage && (!window.variantPickerSettings || window.variantPickerSettings.pickMode !== 'user_select')) {
      document.querySelectorAll('.item-scroll-target').forEach(item => {
        item.addEventListener('click', function() {
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
              // Find the main add-to-cart button in the same section as the clicked image
              const mainSection = this.closest('.tf-product-info, .product-info, .product-details');
              const targetButton = mainSection ? mainSection.querySelector('.product-cart-button:not(.tf-sticky-btn-atc .product-cart-button)') : null;
              
              updateVariantSelection(matchedVariant, false, targetButton);
            } else {
              console.log('Debug: No matching variant found for grid media:', media);
            }
          }
        });
      });
    } else {
      console.log('Debug: Setting is disabled or user_select mode, NOT adding click handlers for grid/stacked images');
    }

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
          return null;
        }
  
        const variants = window.productVariants || [];
                if (!Array.isArray(variants) || variants.length === 0) {
          return null;
        }

        const options = window.productOptions || [];
        if (!Array.isArray(options)) {
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
              return variant;
            }
          }
        }
        
        return null;
      } catch (error) {
        console.error(error);
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
    function updateVariantSelection(variant, updateSticky = false, targetButton = null, updateUI = true) {
      try {
        if (!variant || typeof variant !== 'object') {
          return;
        }
  
        // If a specific button is targeted, only update that one
        if (targetButton) {
          targetButton.dataset.variantId = variant.id;
          targetButton.dataset.selectedVariant = variant.id;
          
          // Update quantity in the targeted button
          const quantityInput = targetButton.closest('form, .tf-product-info')?.querySelector('.quantity-product');
          if (quantityInput) {
            const quantity = parseInt(quantityInput.value) || 1;
            targetButton.dataset.quantity = quantity;
          }
          
          // Check if variant is available and update button state
          if (variant.available === false) {
            targetButton.textContent = 'Out of Stock';
            targetButton.classList.add('disabled', 'btn-out-stock');
            targetButton.style.pointerEvents = 'none';
            targetButton.style.opacity = '0.6';
          } else {
            targetButton.textContent = window.translations?.addToCart || 'Add to Cart';
            targetButton.classList.remove('disabled', 'btn-out-stock');
            targetButton.style.pointerEvents = 'auto';
            targetButton.style.opacity = '1';
          }
        } else {
          // Update main add to cart buttons (excludes sticky section and other sections) - only when no specific button is targeted
          const mainAddToCartBtns = document.querySelectorAll('.product-cart-button:not(.tf-sticky-btn-atc .product-cart-button):not([data-product-handle])');
          mainAddToCartBtns.forEach(addToCartBtn => {
            addToCartBtn.dataset.variantId = variant.id;
            addToCartBtn.dataset.selectedVariant = variant.id;
            
            // Update quantity in add to cart button
            const quantityInput = addToCartBtn.closest('form, .tf-product-info')?.querySelector('.quantity-product');
            if (quantityInput) {
              const quantity = parseInt(quantityInput.value) || 1;
              addToCartBtn.dataset.quantity = quantity;
            }
            
            // Check if variant is available and update button state
            if (variant.available === false) {
              addToCartBtn.textContent = 'Out of Stock';
              addToCartBtn.classList.add('disabled', 'btn-out-stock');
              addToCartBtn.style.pointerEvents = 'none';
              addToCartBtn.style.opacity = '0.6';
            } else {
              addToCartBtn.textContent = window.translations?.addToCart || 'Add to Cart';
              addToCartBtn.classList.remove('disabled', 'btn-out-stock');
              addToCartBtn.style.pointerEvents = 'auto';
              addToCartBtn.style.opacity = '1';
            }
          });
        }
        
        // Only update sticky cart button if explicitly requested or if it's the initial variant
        if (updateSticky || (window.initialVariant && variant.id === window.initialVariant.id)) {
          const stickyAddToCartBtn = document.querySelector('.tf-sticky-btn-atc .product-cart-button');
          if (stickyAddToCartBtn) {
            stickyAddToCartBtn.dataset.variantId = variant.id;
            stickyAddToCartBtn.dataset.selectedVariant = variant.id;
            
            // Update quantity in sticky add to cart button
            const stickyQuantityInput = stickyAddToCartBtn.closest('form')?.querySelector('.quantity-product');
            if (stickyQuantityInput) {
              const quantity = parseInt(stickyQuantityInput.value) || 1;
              stickyAddToCartBtn.dataset.quantity = quantity;
            }
            
            // Check if variant is available and update sticky button state
            if (variant.available === false) {
              stickyAddToCartBtn.textContent = 'Out of Stock';
              stickyAddToCartBtn.classList.add('disabled', 'btn-out-stock');
              stickyAddToCartBtn.style.pointerEvents = 'none';
              stickyAddToCartBtn.style.opacity = '0.6';
            } else {
              stickyAddToCartBtn.textContent = window.translations?.addToCart || 'Add to Cart';
              stickyAddToCartBtn.classList.remove('disabled', 'btn-out-stock');
              stickyAddToCartBtn.style.pointerEvents = 'auto';
              stickyAddToCartBtn.style.opacity = '1';
            }
          }
        }
        

  
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
  
        // Only update UI elements if updateUI is true
        if (updateUI) {
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
          console.error(error);
        }
  
        // Check if we're in grid or stacked layout
        const isGridOrStacked = document.querySelector('.flat-single-grid') !== null;
        
        // Only handle image switching if not in user_select mode
        if (!window.variantPickerSettings || window.variantPickerSettings.pickMode !== 'user_select') {
          try {
            // Handle image switching based on layout
            if (isGridOrStacked) {
              // For grid and stacked layouts, scroll to the matching image
              const productMedia = window.productMedia || [];
              if (!Array.isArray(productMedia)) {
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
                // Find the gallery item with the matching media ID
                const galleryItems = document.querySelectorAll('.item-scroll-target');
                for (let item of galleryItems) {
                  const mediaId = parseInt(item.getAttribute('data-media-id'));
                  if (mediaId === targetImage.id) {
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
            console.error(error);
          }
        } else {
          console.log('Debug: user_select mode - NOT automatically switching images');
        }
  
        // Set the active color swatch based on the selected color (only if not user_select mode)
        if (variant.option1 && (!window.variantPickerSettings || window.variantPickerSettings.pickMode !== 'user_select')) {
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
                    btn.classList.add('active');
                  }
                }, 50);
              } else {
                btn.classList.remove('active');
              }
            } catch (error) {
              console.error(error);
            }
          });
        }
  
        // Set the active size button based on the selected size (only if not user_select mode)
        if (variant.option2 && (!window.variantPickerSettings || window.variantPickerSettings.pickMode !== 'user_select')) {
          const size = variant.option2.toLowerCase();
          document.querySelectorAll('.size-btn, .select-item[data-option="size"]').forEach(btn => {
            try {
              if (btn.getAttribute('data-value') && btn.getAttribute('data-value').toLowerCase() === size) {
                btn.classList.add('active');
              } else {
                btn.classList.remove('active');
              }
            } catch (error) {
              console.error(error);
            }
          });
        }
        
          // Handle hiding sold out variants after updating selection
          handleSoldOutVariants();
        }

      } catch (error) {
        console.error(error);
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
          return;
        }
  
        const variant = findVariantByColor(color);
        if (variant) {
          // Find the main add-to-cart button in the same section as the clicked color swatch
          const mainSection = btn.closest('.tf-product-info, .product-info, .product-details');
          const targetButton = mainSection ? mainSection.querySelector('.product-cart-button:not(.tf-sticky-btn-atc .product-cart-button)') : null;
          
          updateVariantSelection(variant, false, targetButton);
        } else {
          const selectedSize = getSelectedSize();
          alert(selectedSize ? translations.variantNotAvailable : translations.colorNotAvailable);
        }
      } catch (error) {
        alert(translations.variantError);
      }
    });
  
    // Helper function to get selected size
    function getSelectedSize() {
      try {
        const activeSizeBtn = document.querySelector('.size-btn.active, .select-item[data-option="size"].active');
        return activeSizeBtn ? activeSizeBtn.getAttribute('data-value') : null;
      } catch (error) {
        return null;
      }
    }
  
    // Handle size variant selection
    document.querySelectorAll('.size-btn, .select-item[data-option="size"]').forEach(button => {
      button.addEventListener('click', function(e) {
        try {
          const size = this.getAttribute('data-value');
          if (!size) {
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
            // Find the main add-to-cart button in the same section as the clicked size button
            const mainSection = this.closest('.tf-product-info, .product-info, .product-details');
            const targetButton = mainSection ? mainSection.querySelector('.product-cart-button:not(.tf-sticky-btn-atc .product-cart-button)') : null;
            
            updateVariantSelection(variant, false, targetButton);
          } else {
            alert(translations.sizeNotAvailable);
          }
        } catch (error) {
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
          // Find the sticky add-to-cart button and only update that one
          const stickyButton = document.querySelector('.tf-sticky-btn-atc .product-cart-button');
          updateVariantSelection(variant, false, stickyButton, false); // Don't update UI elements
          
          // Update sticky variant selector dropdown
          const stickyVariantSelect = document.querySelector('.tf-sticky-btn-atc .sticky-variant-select');
          if (stickyVariantSelect) {
            stickyVariantSelect.value = variant.id;
          }
        }
      }
    });
  
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
          // Find the main add-to-cart button in the same section as the dropdown
          const mainSection = this.closest('.tf-product-info, .product-info, .product-details');
          const targetButton = mainSection ? mainSection.querySelector('.product-cart-button:not(.tf-sticky-btn-atc .product-cart-button)') : null;
          
          updateVariantSelection(matchingVariant, false, targetButton);
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
            // Find the main add-to-cart button in the same section as the dropdown
            const mainSection = btn.closest('.tf-product-info, .product-info, .product-details');
            const targetButton = mainSection ? mainSection.querySelector('.product-cart-button:not(.tf-sticky-btn-atc .product-cart-button)') : null;
            
            updateVariantSelection(variant, false, targetButton);
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
          console.error(err);
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
      localStorage.setItem('videoAutoplayConsent', consent);
      
      // Close modal using Bootstrap
      const consentModal = document.getElementById('videoAutoplayConsent');
      if (consentModal) {
        const bsModal = bootstrap.Modal.getInstance(consentModal);
        if (bsModal) {
          bsModal.hide();
        } else {
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
              video.play().catch(e => console.log(e));
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
      
      // Set up consent button handlers
      const acceptBtn = document.getElementById('acceptAutoplay');
      const declineBtn = document.getElementById('declineAutoplay');
      
      if (acceptBtn) {
        acceptBtn.addEventListener('click', function(e) {
          e.preventDefault();
          window.setVideoAutoplayConsent(true);
        });
      } else {
      }
      
      if (declineBtn) {
        declineBtn.addEventListener('click', function(e) {
          e.preventDefault();
          window.setVideoAutoplayConsent(false);
        });
      } else {
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
            // Initialize Intersection Observer for videos
            const videoObserver = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                  if (window.enableVideoAutoplay && window.getVideoAutoplayConsent()) {
                    video.play().catch(e => console.log(e));
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
                  console.log(e);
                });

                // Observe the video for viewport visibility
                videoObserver.observe(video);
              }
            });
            
            // Check if first slide is video and show consent modal if needed
            if (this.slides.length > 0) {
              const firstSlide = this.slides[0];
              const mediaType = firstSlide.getAttribute('data-media-type');
              
              if (mediaType === 'video' && window.enableVideoAutoplay && localStorage.getItem('videoAutoplayConsent') === null) {
                const consentModal = document.getElementById('videoAutoplayConsent');
                if (consentModal) {
                  const modal = new bootstrap.Modal(consentModal);
                  // Small delay to ensure modal is properly initialized
                  setTimeout(() => {
                    modal.show();
                  }, 200);
                }
              }
            }
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
              if (window.enableVideoAutoplay && localStorage.getItem('videoAutoplayConsent') === null) {
                const consentModal = document.getElementById('videoAutoplayConsent');
                if (consentModal) {
                  const modal = new bootstrap.Modal(consentModal);
                  modal.show();
                }
              }
  
              if (activeVideo) {
                activeVideo.currentTime = 0;
                if (window.enableVideoAutoplay && window.getVideoAutoplayConsent()) {
                  activeVideo.play().catch(e => console.log(e));
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
              video.play().catch(e => console.log(e));
            }
          }
        });
      }
    }
  
    // Initialize consent check when gallery is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Check for existing consent
      const existingConsent = localStorage.getItem('videoAutoplayConsent');
      
      // Initialize Bootstrap modal
      const consentModal = document.getElementById('videoAutoplayConsent');
      if (!consentModal) {
        return;
      }
      
      // Check if first slide is video and show modal if needed
      const checkFirstSlideAndShowModal = () => {
        // Check if autoplay is enabled and no consent is stored
        if (window.enableVideoAutoplay && existingConsent === null) {
          // Check if first slide is a video (for Swiper layout)
          const firstSwiperSlide = document.querySelector('.tf-product-media-main .swiper-slide:first-child');
          if (firstSwiperSlide && firstSwiperSlide.getAttribute('data-media-type') === 'video') {
            const modal = new bootstrap.Modal(consentModal);
            // Small delay to ensure modal is properly initialized
            setTimeout(() => {
              modal.show();
            }, 100);
            return;
          }
          
          // Check if first item is a video (for grid/stacked layout)
          const firstGridItem = document.querySelector('.item-scroll-target:first-child');
          if (firstGridItem && firstGridItem.getAttribute('data-media-type') === 'video') {
            const modal = new bootstrap.Modal(consentModal);
            // Small delay to ensure modal is properly initialized
            setTimeout(() => {
              modal.show();
            }, 100);
            return;
          }
        }
      };
      
      // Try to check immediately
      checkFirstSlideAndShowModal();
      
      // Also check after a short delay to ensure Swiper is initialized
      setTimeout(checkFirstSlideAndShowModal, 500);
    });
  
  });
    
  // Helper function to format money
  function formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: window.shopCurrency
    }).format(cents / 100);
  }

  // Bundle functionality
  // Handle variant selector changes to update checkbox variant ID
  document.querySelectorAll('[data-variant-selector]').forEach(select => {
    select.addEventListener('change', function() {
      const bundleItem = this.closest('.tf-bundle-product-item');
      const checkbox = bundleItem.querySelector('.tf-check');
      const quantityInput = bundleItem.querySelector('.quantity-input');
      const selectedVariantId = this.value;
      
      // Update checkbox variant ID
      checkbox.setAttribute('data-variant-id', selectedVariantId);
      
      // Update quantity input variant ID
      if (quantityInput) {
        quantityInput.setAttribute('data-variant-id', selectedVariantId);
      }
    });
  });

  // Handle checkbox changes to update total price
  document.querySelectorAll('.tf-check').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const bundleItem = this.closest('.tf-bundle-product-item');
      
      // Add/remove 'check' class based on checkbox state
      if (this.checked) {
        bundleItem.classList.add('check');
      } else {
        bundleItem.classList.remove('check');
      }
      
      updateBundleTotal();
    });
  });

  // Function to update bundle total price
  function updateBundleTotal() {
    let total = 0;
    let oldTotal = 0;
    let hasOldPrice = false;
    
    // Only process checked products
    document.querySelectorAll('.tf-check:checked').forEach(checkbox => {
      // Verify the checkbox is actually checked
      if (!checkbox.checked) return;
      
      const bundleItem = checkbox.closest('.tf-bundle-product-item');
      const priceElement = bundleItem.querySelector('.new-price');
      const oldPriceElement = bundleItem.querySelector('.old-price');
      
      if (priceElement) {
        const price = parseFloat(priceElement.textContent.replace(/[^0-9.]/g, ''));
        const quantity = 1; // Fixed quantity of 1
        
        // Check if product has old price
        if (oldPriceElement && oldPriceElement.style.display !== 'none') {
          // Product has old price - add old price to oldTotal
          const oldPrice = parseFloat(oldPriceElement.textContent.replace(/[^0-9.]/g, ''));
          oldTotal += oldPrice * quantity;
          hasOldPrice = true;
        } else {
          // Product doesn't have old price - add regular price to oldTotal
          oldTotal += price * quantity;
        }
        
        // Always add regular price to total
        total += price * quantity;
      }
    });
    
    // Update total display
    const totalPriceElement = document.querySelector('.bundle-total-submit .total-price');
    const oldTotalPriceElement = document.querySelector('.bundle-total-submit .total-price-old');
    
    if (totalPriceElement) {
      totalPriceElement.textContent = '$' + total.toFixed(2);
    }
    
    // Only show old price if at least one product has an old price
    if (oldTotalPriceElement && hasOldPrice) {
      oldTotalPriceElement.textContent = '$' + oldTotal.toFixed(2);
      oldTotalPriceElement.style.display = 'inline';
    } else if (oldTotalPriceElement) {
      oldTotalPriceElement.style.display = 'none';
    }
  }

  // Initialize bundle total on page load
  updateBundleTotal();

  // Special Deal Functionality
  // Function to update special deal button variants when selectors change
  function updateSpecialDealVariants() {
    const formBuyXGetY = document.querySelector('.form-buyX-getY');
    if (!formBuyXGetY) return;
    
    const buyVariantSelector = formBuyXGetY.querySelector('select[name="buy_variant"]');
    const getVariantSelector = formBuyXGetY.querySelector('select[name="get_variant"]');
    const cartButton = formBuyXGetY.querySelector('.product-cart-button');
    
    if (!buyVariantSelector || !getVariantSelector || !cartButton) return;
    
    // Get selected variants
    const buyVariantId = buyVariantSelector.value;
    const getVariantId = getVariantSelector.value;
    
    // Get quantities from data attributes
    const buyProduct = formBuyXGetY.querySelector('.item-product[data-variant-id]');
    const buyQuantity = buyProduct ? parseInt(buyProduct.getAttribute('data-quantity')) : 1;
    
    // Create the multiple variants data
    const multipleVariants = [
      {"variantId": buyVariantId, "quantity": buyQuantity},
      {"variantId": getVariantId, "quantity": 1}
    ];
    
    // Update the button's data attribute
    cartButton.setAttribute('data-multiple-variants', JSON.stringify(multipleVariants));
  }
  
  // Add event listeners to variant selectors for special deals
  const buyVariantSelectors = document.querySelectorAll('select[name="buy_variant"]');
  const getVariantSelectors = document.querySelectorAll('select[name="get_variant"]');
  
  buyVariantSelectors.forEach(selector => {
    selector.addEventListener('change', updateSpecialDealVariants);
  });
  
  getVariantSelectors.forEach(selector => {
    selector.addEventListener('change', updateSpecialDealVariants);
  });

