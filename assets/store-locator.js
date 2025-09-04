/**
 * Store Locator Interactive Map
 * Handles switching between different store maps when clicking on store items
 */

(function () {
  'use strict';

  function StoreLocator() {
    this.mapContainer = document.getElementById('store-map');
    this.storeItems = document.querySelectorAll('.box-store');
    this.init();
  }

  StoreLocator.prototype.init = function () {
    if (!this.mapContainer || this.storeItems.length === 0) {
      return;
    }
    this.bindEvents();
  };

  StoreLocator.prototype.bindEvents = function () {
    var self = this;

    this.storeItems.forEach(function (item, index) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        self.handleStoreItemClick(item);
      });

      item.addEventListener('mouseenter', function () {
        if (!item.classList.contains('active')) {
          item.style.transform = 'translateY(-2px)';
        }
      });

      item.addEventListener('mouseleave', function () {
        if (!item.classList.contains('active')) {
          item.style.transform = 'translateY(0)';
        }
      });
    });
  };

  StoreLocator.prototype.handleStoreItemClick = function (clickedItem) {
    // Remove active class from all items
    this.storeItems.forEach(function (item) {
      item.classList.remove('active');
      item.style.transform = 'translateY(0)';
    });

    // Add active class to clicked item
    clickedItem.classList.add('active');

    // Get the map iframe from the clicked item
    var mapIframe = clickedItem.dataset.mapIframe;

    if (mapIframe && mapIframe.trim() !== '') {
      this.updateMap(mapIframe);
    } else {
      this.showNoMapMessage();
    }
  };

  StoreLocator.prototype.updateMap = function (mapIframe) {
    var self = this;

    // Show loading state
    this.showLoading();

    // Decode HTML entities if needed
    var decodedIframe = this.decodeHtml(mapIframe);

    // Update map container content with a slight delay for better UX
    setTimeout(function () {
      self.mapContainer.innerHTML = decodedIframe;
    }, 300);
  };

  StoreLocator.prototype.showLoading = function () {
    this.mapContainer.innerHTML = `
      <div class="map-loading" style="height: 400px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
        <div style="text-align: center;">
          <div style="border: 3px solid #f3f3f3; border-top: 3px solid #007bff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
          <p style="color: #666; margin: 0;">${window.translations?.store_locator?.loading_map || 'Loading map...'}</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  };

  StoreLocator.prototype.showNoMapMessage = function () {
    this.mapContainer.innerHTML = `
      <div class="placeholder-map" style="height: 400px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
        <p style="color: #666; font-size: 16px;">${window.translations?.store_locator?.no_map_available || 'No map available for this store'}</p>
      </div>
    `;
  };

  StoreLocator.prototype.decodeHtml = function (html) {
    var txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Initialize when DOM is ready
  function initStoreLocator() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        new StoreLocator();
      });
    } else {
      new StoreLocator();
    }
  }

  // Auto-initialize
  initStoreLocator();
})();
