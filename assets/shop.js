(function ($) {
  "use strict";

  /* Range Two Price
  -------------------------------------------------------------------------------------*/
  var rangeTwoPrice = function () {
    if ($("#price-value-range").length > 0) {
      var skipSlider = document.getElementById("price-value-range");
      var skipValues = [
        document.getElementById("price-min-value"),
        document.getElementById("price-max-value"),
      ];

      var min = parseInt(skipSlider.getAttribute("data-min"), 10) || 0;
      var max = parseInt(skipSlider.getAttribute("data-max"), 10) || 500;

      noUiSlider.create(skipSlider, {
        start: [min, max],
        connect: true,
        step: 1,
        range: {
          min: min,
          max: max,
        },
        format: {
          from: function (value) {
            return parseInt(value, 10);
          },
          to: function (value) {
            return parseInt(value, 10);
          },
        },
      });

      skipSlider.noUiSlider.on("update", function (val, e) {
        skipValues[e].innerText = val[e];
      });
    }
  };

  /* Filter Products
  -------------------------------------------------------------------------------------*/
  var filterProducts = function () {
    // ... rest of the filterProducts function
  };

  /* Filter Sort
  -------------------------------------------------------------------------------------*/
  var filterSort = function () {
    // ... rest of the filterSort function
  };

  /* Switch Layout 
  -------------------------------------------------------------------------------------*/  
  var swLayoutShop = function () {
    // ... rest of the swLayoutShop function
  };

  /* Loading product 
  -------------------------------------------------------------------------------------*/ 
  var loadProduct = function () {
    // ... rest of the loadProduct function
  };

  $(function () {
    rangeTwoPrice();
    filterProducts();
    filterSort();
    swLayoutShop();
    loadProduct();
  });
})(jQuery);