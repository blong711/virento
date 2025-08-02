class MultiModal {
    static BASE_ZINDEX = 1050;

    constructor() {
        this.modalCount = 0;
        this.initializeEventListeners();
    }

    show(target) {
        const modalIndex = this.modalCount++;
        target.style.zIndex = MultiModal.BASE_ZINDEX + (modalIndex * 20) + 10;

        // Wait for Bootstrap's modal show animation to complete
        setTimeout(() => {
            // Hide extra backdrops, keep only the first one
            if (modalIndex > 0) {
                document.querySelectorAll('.modal-backdrop').forEach((backdrop, index) => {
                    if (index > 0) backdrop.classList.add('hidden');
                });
            }
            this.adjustBackdrop();
        });
    }

    hidden() {
        this.modalCount--;

        if (this.modalCount) {
            this.adjustBackdrop();
            // Ensure modal-open class is present when other modals are still open
            document.body.classList.add('modal-open');
        }
    }

    adjustBackdrop() {
        const modalIndex = this.modalCount - 1;
        const firstBackdrop = document.querySelector('.modal-backdrop');
        if (firstBackdrop) {
            firstBackdrop.style.zIndex = MultiModal.BASE_ZINDEX + (modalIndex * 20);
        }
    }

    initializeEventListeners() {
        // Listen for Bootstrap modal events
        document.addEventListener('show.bs.modal', (event) => {
            this.show(event.target);
        });

        document.addEventListener('hidden.bs.modal', () => {
            this.hidden();
        });
    }
}

// Initialize the MultiModal handler when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.multiModal = new MultiModal();
});