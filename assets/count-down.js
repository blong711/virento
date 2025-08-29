class CountDown {
  constructor(element) {
    this.element = element;
    this.labels = this.element.getAttribute('data-labels') ? this.element.getAttribute('data-labels').split(',') : [];
    this.intervalId = null;

    console.log('CountDown constructor called with:', {
      element: this.element,
      labels: this.labels,
      timer: this.element.getAttribute('data-timer'),
      countdown: this.element.getAttribute('data-countdown')
    });

    // Initialize countdown
    this.setVisibleLabels();
    this.createCountDown();

    // Store time elements
    this.days = this.element.querySelector('.js-countdown__value--0');
    this.hours = this.element.querySelector('.js-countdown__value--1');
    this.mins = this.element.querySelector('.js-countdown__value--2');
    this.secs = this.element.querySelector('.js-countdown__value--3');

    this.endTime = this.getEndTime();
    console.log('End time calculated:', this.endTime);
    this.initCountDown();
  }

  setVisibleLabels() {
    this.visibleLabels = this.element.getAttribute('data-visible-labels')
      ? this.element
          .getAttribute('data-visible-labels')
          .split(',')
          .map((label) => label.trim())
      : [];
  }

  createCountDown() {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.classList.add('countdown__timer');

    for (let i = 0; i < 4; i++) {
      const timeItem = document.createElement('span');
      const timeValue = document.createElement('span');
      const timeLabel = document.createElement('span');

      timeItem.classList.add('countdown__item');
      timeValue.classList.add('countdown__value', `countdown__value--${i}`, `js-countdown__value--${i}`);
      timeItem.appendChild(timeValue);

      if (this.labels?.length > 0) {
        timeLabel.textContent = this.labels[i].trim();
        timeLabel.classList.add('countdown__label');
        timeItem.appendChild(timeLabel);
      }

      wrapper.appendChild(timeItem);
    }

    this.element.insertBefore(wrapper, this.element.firstChild);
  }

  getEndTime() {
    if (this.element.getAttribute('data-timer')) {
      return Number(this.element.getAttribute('data-timer')) * 1000 + new Date().getTime();
    } else if (this.element.getAttribute('data-countdown')) {
      return Number(new Date(this.element.getAttribute('data-countdown')).getTime());
    }
    return null;
  }

  initCountDown() {
    this.intervalId = setInterval(() => this.updateCountDown(false), 1000);
    this.updateCountDown(true);
  }

  updateCountDown(bool) {
    const time = parseInt((this.endTime - new Date().getTime()) / 1000);

    if (isNaN(time) || time < 0) {
      clearInterval(this.intervalId);
      this.emitEndEvent();
      return;
    }

    const days = Math.floor(time / 86400);
    const hours = Math.floor((time % 86400) / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    // Default labels if not provided
    const defaultLabels = ['Days', 'Hours', 'Mins', 'Secs'];
    const labels = [...(this.labels?.length >= 4 ? this.labels : defaultLabels)];

    // Handle singular/plural forms
    if (days === 1) labels[0] = labels[0].replace(/s$/, '');
    if (hours === 1) labels[1] = labels[1].replace(/s$/, '');
    if (mins === 1) labels[2] = labels[2].replace(/s$/, '');
    if (seconds === 1) labels[3] = labels[3].replace(/s$/, '');

    // Update time values
    this.days.textContent = days.toString();
    this.hours.textContent = this.getTimeFormat(hours);
    this.mins.textContent = this.getTimeFormat(mins);
    this.secs.textContent = this.getTimeFormat(seconds);

    // Update labels
    this.element.querySelectorAll('.countdown__item').forEach((item, i) => {
      const labelEl = item.querySelector('.countdown__label');
      if (labelEl) {
        labelEl.textContent = labels[i];
      }
    });
  }

  getTimeFormat(time) {
    return time.toString();
  }

  emitEndEvent() {
    this.element.dispatchEvent(new CustomEvent('countDownFinished'));
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Initialize countdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeCountdowns();
});

// Re-initialize countdowns when Shopify theme customizer updates sections
document.addEventListener('shopify:section:load', () => {
  initializeCountdowns();
});

document.addEventListener('shopify:section:reorder', () => {
  initializeCountdowns();
});

document.addEventListener('shopify:section:select', () => {
  initializeCountdowns();
});

// Function to initialize all countdowns
function initializeCountdowns() {
  console.log('Initializing countdowns...');
  
  // Clean up existing countdowns to prevent memory leaks
  document.querySelectorAll('.js-countdown').forEach((element) => {
    if (element.countdownInstance) {
      element.countdownInstance.destroy();
    }
  });
  
  // Initialize new countdowns
  const countdownElements = document.querySelectorAll('.js-countdown');
  console.log(`Found ${countdownElements.length} countdown elements`);
  
  countdownElements.forEach((element, index) => {
    console.log(`Initializing countdown ${index + 1}:`, {
      timer: element.getAttribute('data-timer'),
      countdown: element.getAttribute('data-countdown'),
      labels: element.getAttribute('data-labels')
    });
    element.countdownInstance = new CountDown(element);
  });
}
