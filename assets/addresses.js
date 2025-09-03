// Initialize province/state selectors
document.addEventListener('DOMContentLoaded', function () {
  // Handle add new address form
  const addAddressBtn = document.querySelector('.btn-add-address');
  const addAddressForm = document.getElementById('form-add-address');
  const hideAddressBtn = document.querySelector('.btn-hide-address');
  const submitAddAddressBtn = document.getElementById('submit-add-address');

  // Show form if there are server-side errors
  if (addAddressForm && addAddressForm.querySelector('.form-errors')) {
    addAddressForm.style.display = 'block';
  }

  if (addAddressBtn && addAddressForm) {
    addAddressBtn.addEventListener('click', function (e) {
      e.preventDefault();
      addAddressForm.style.display = 'block';
      // Clear any previous error messages
      clearAllErrors();
    });
  }

  if (hideAddressBtn && addAddressForm) {
    hideAddressBtn.addEventListener('click', function (e) {
      e.preventDefault();
      addAddressForm.style.display = 'none';
      clearAllErrors();
    });
  }

  // Handle form submission with validation
  if (addAddressForm) {
    const actualForm = addAddressForm.querySelector('form');
    const submitBtn = document.getElementById('submit-add-address');

    if (actualForm) {
      actualForm.addEventListener('submit', function (e) {
        // Clear previous errors
        clearAllErrors();

        // Validate form
        const isValid = validateAddAddressForm();

        if (!isValid) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      });
    }

    // Also handle button click as backup
    if (submitBtn) {
      submitBtn.addEventListener('click', function (e) {
        // Clear previous errors
        clearAllErrors();

        // Validate form
        const isValid = validateAddAddressForm();

        if (!isValid) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      });
    }
  }

  // Handle edit address forms
  const editAddressBtns = document.querySelectorAll('.btn-edit-address');
  const hideEditAddressBtns = document.querySelectorAll('.btn-hide-edit-address');

  editAddressBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const formId = this.getAttribute('data-form');
      const form = document.getElementById(formId);
      if (form) {
        form.style.display = 'block';
      }
    });
  });

  hideEditAddressBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const form = this.closest('.edit-form-address');
      if (form) {
        form.style.display = 'none';
      }
    });
  });

  // Validation functions
  function validateAddAddressForm() {
    let isValid = true;
    let errorCount = 0;

    // Required fields validation
    const requiredFields = [
      { id: 'AddressFirstNameNew', errorId: 'error-firstname', name: 'First Name' },
      { id: 'AddressLastNameNew', errorId: 'error-lastname', name: 'Last Name' },
      { id: 'Address1New', errorId: 'error-address1', name: 'Address' },
      { id: 'AddressCityNew', errorId: 'error-city', name: 'City' },
      { id: 'AddressCountryNew', errorId: 'error-country', name: 'Country' },
    ];

    requiredFields.forEach(function (field) {
      const input = document.getElementById(field.id);
      const errorDiv = document.getElementById(field.errorId);

      if (!input.value.trim()) {
        showError(field.errorId, field.name + ' is required');
        isValid = false;
        errorCount++;
      } else {
        hideError(field.errorId);
      }
    });

    // Phone number validation (optional but if provided, validate format)
    const phoneInput = document.getElementById('AddressPhoneNew');
    const phoneErrorDiv = document.getElementById('error-phone');

    if (phoneInput.value.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phoneInput.value.trim().replace(/[\s\-\(\)]/g, ''))) {
        showError('error-phone', 'Please enter a valid phone number');
        isValid = false;
        errorCount++;
      } else {
        hideError('error-phone');
      }
    }

    // Postal code validation (numbers only and required)
    const zipInput = document.getElementById('AddressZipNew');

    if (!zipInput.value.trim()) {
      showError('error-zip', 'Postal code is required');
      isValid = false;
      errorCount++;
    } else {
      const zipRegex = /^\d+$/;
      const zipValue = zipInput.value.trim();
      const isZipValid = zipRegex.test(zipValue);

      if (!isZipValid) {
        showError('error-zip', 'Postal code must contain only numbers');
        isValid = false;
        errorCount++;
      } else {
        hideError('error-zip');
      }
    }

    // Show general error message if there are multiple errors
    if (!isValid && errorCount > 1) {
      showGeneralError('Please correct the errors highlighted below before submitting.');
    }

    return isValid;
  }

  function showError(errorId, message) {
    const errorDiv = document.getElementById(errorId);
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';

      // Add error styling to input
      const inputId = errorId.replace('error-', 'Address');
      const input = document.getElementById(inputId);
      if (input) {
        input.style.borderColor = '#dc3545';

        // Add error class to select container if it's a select
        const selectContainer = input.closest('.select');
        if (selectContainer) {
          selectContainer.classList.add('has-error');
          selectContainer.classList.remove('has-success');
        }
      }
    }
  }

  function hideError(errorId) {
    const errorDiv = document.getElementById(errorId);
    if (errorDiv) {
      errorDiv.style.display = 'none';

      // Remove error styling from input
      const inputId = errorId.replace('error-', 'Address');
      const input = document.getElementById(inputId);
      if (input) {
        input.style.borderColor = '';

        // Remove error class from select container if it's a select
        const selectContainer = input.closest('.select');
        if (selectContainer) {
          selectContainer.classList.remove('has-error');
          selectContainer.classList.remove('has-success');
        }
      }
    }
  }

  function clearAllErrors() {
    const errorDivs = document.querySelectorAll('.error-message');
    errorDivs.forEach(function (errorDiv) {
      errorDiv.style.display = 'none';
    });

    // Clear general error
    const generalError = document.getElementById('general-error');
    if (generalError) {
      generalError.style.display = 'none';
    }

    // Clear error styling from all inputs
    const inputs = addAddressForm.querySelectorAll('input');
    inputs.forEach(function (input) {
      input.style.borderColor = '';
    });
  }

  function showGeneralError(message) {
    const generalError = document.getElementById('general-error');
    const generalErrorText = document.getElementById('general-error-text');
    if (generalError && generalErrorText) {
      generalErrorText.textContent = message;
      generalError.style.display = 'block';
    }
  }

  // Real-time validation on input change
  const addAddressInputs = addAddressForm.querySelectorAll('input[required]');
  addAddressInputs.forEach(function (input) {
    input.addEventListener('blur', function () {
      const fieldName = this.id.replace('Address', '').replace('New', '');
      const errorId = 'error-' + fieldName.toLowerCase();

      if (!this.value.trim()) {
        showError(errorId, this.previousElementSibling.textContent + ' is required');
      } else {
        hideError(errorId);
      }
    });
  });

  // Setup country/province selectors using Shopify's built-in CountryProvinceSelector
  function setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // Setup for new address form
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew',
      });
    }
  }

  // Initialize country/province selectors
  setupCountries();

  // Address pagination variables
  let currentAddressPage = 1;
  const addressesPerPage = 2;
  const addressesList = document.getElementById('addressesList');
  const addressPaginationContainer = document.getElementById('addressPaginationContainer');
  const addressPagination = document.getElementById('addressPagination');
  const addressItems = addressesList ? addressesList.querySelectorAll('.account-address-item') : [];
  const totalAddressPages = Math.ceil(addressItems.length / addressesPerPage);

  // Initialize address pagination
  if (addressItems.length > addressesPerPage) {
    displayAddressesWithPagination();
    updateAddressPagination();
  }

  // Handle validation for country and province selects
  const countrySelect = document.getElementById('AddressCountryNew');
  const provinceSelect = document.getElementById('AddressProvinceNew');

  if (countrySelect) {
    countrySelect.addEventListener('change', function () {
      const errorId = 'error-country';
      if (!this.value) {
        showError(errorId, 'Country is required');
      } else {
        hideError(errorId);
      }
    });
  }

  // Address pagination functions
  function displayAddressesWithPagination() {
    const startIndex = (currentAddressPage - 1) * addressesPerPage;
    const endIndex = startIndex + addressesPerPage - 1;

    addressItems.forEach((item, index) => {
      if (index >= startIndex && index <= endIndex) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  function updateAddressPagination() {
    if (totalAddressPages <= 1) {
      addressPaginationContainer.style.display = 'none';
      return;
    }

    addressPaginationContainer.style.display = 'block';

    let paginationHTML = '';

    // Previous button
    if (currentAddressPage > 1) {
      paginationHTML += `
        <li>
          <a href="#" class="pagination-item" data-page="${currentAddressPage - 1}">
            <i class="icon-arr-left"></i>
          </a>
        </li>
      `;
    }

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentAddressPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalAddressPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i === currentAddressPage) {
        paginationHTML += `
          <li class="active">
            <div class="pagination-item">${i}</div>
          </li>
        `;
      } else {
        paginationHTML += `
          <li>
            <a href="#" class="pagination-item" data-page="${i}">${i}</a>
          </li>
        `;
      }
    }

    // Next button
    if (currentAddressPage < totalAddressPages) {
      paginationHTML += `
        <li>
          <a href="#" class="pagination-item" data-page="${currentAddressPage + 1}">
            <i class="icon-arr-right2"></i>
          </a>
        </li>
      `;
    }

    addressPagination.innerHTML = paginationHTML;

    // Add click event listeners to pagination
    addressPagination.querySelectorAll('[data-page]').forEach((link) => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const page = parseInt(this.dataset.page);
        if (page !== currentAddressPage) {
          currentAddressPage = page;
          displayAddressesWithPagination();
          updateAddressPagination();
          // Scroll to top of addresses list
          addressesList.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
});
