class CountDown {
  constructor(element) {
    this.element = element;
    this.labels = this.element.getAttribute('data-labels') ? this.element.getAttribute('data-labels').split(',') : [];
    this.intervalId = null;

    // Initialize countdown
    this.setVisibleLabels();
    this.createCountDown();

    // Store time elements
    this.days = this.element.querySelector('.js-countdown__value--0');
    this.hours = this.element.querySelector('.js-countdown__value--1');
    this.mins = this.element.querySelector('.js-countdown__value--2');
    this.secs = this.element.querySelector('.js-countdown__value--3');

    this.endTime = this.getEndTime();
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
    } else if (this.element.getAttribute('data-countdown-end')) {
      return Number(new Date(this.element.getAttribute('data-countdown-end')).getTime());
    }
    return null;
  }

  getStartTime() {
    if (this.element.getAttribute('data-countdown-start')) {
      return Number(new Date(this.element.getAttribute('data-countdown-start')).getTime());
    }
    return null;
  }

  isCountdownActive() {
    const startTime = this.getStartTime();
    const currentTime = new Date().getTime();
    
    // If no start time is set, always show the countdown
    if (!startTime) {
      return true;
    }
    
    // Show countdown only if current time is after start time
    return currentTime >= startTime;
  }

  initCountDown() {
    // Check if countdown should be active
    if (!this.isCountdownActive()) {
      this.hideCountdown();
      // Set up a check for when countdown should start
      this.checkStartTime();
      return;
    }

    this.intervalId = setInterval(() => this.updateCountDown(false), 1000);
    this.updateCountDown(true);
  }

  hideCountdown() {
    // Hide the countdown element if it hasn't started yet
    this.element.style.display = 'none';
  }

  showCountdown() {
    // Show the countdown element when it should start
    this.element.style.display = 'flex';
  }

  checkStartTime() {
    // Check every minute if countdown should start
    const checkInterval = setInterval(() => {
      if (this.isCountdownActive()) {
        this.showCountdown();
        this.intervalId = setInterval(() => this.updateCountDown(false), 1000);
        this.updateCountDown(true);
        clearInterval(checkInterval);
      }
    }, 60000); // Check every minute
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
}

// Initialize countdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.js-countdown').forEach((element) => new CountDown(element));
});
