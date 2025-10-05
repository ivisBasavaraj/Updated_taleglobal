// Modal utility functions for Bootstrap modal management

export const initializeModal = (modalElement) => {
    if (!modalElement) return null;
    
    try {
        // Check if Bootstrap is available
        if (typeof window !== 'undefined' && window.bootstrap && window.bootstrap.Modal) {
            return new window.bootstrap.Modal(modalElement);
        } else if (typeof window !== 'undefined' && window.$ && window.$.fn.modal) {
            // Fallback to jQuery Bootstrap if available
            return window.$(modalElement);
        }
    } catch (error) {
        console.error('Error initializing modal:', error);
    }
    
    return null;
};

export const showModal = (modalId) => {
    try {
        const modalElement = document.getElementById(modalId);
        if (!modalElement || !modalElement.classList) return;

        // Use jQuery if available (more reliable with existing Bootstrap setup)
        if (window.$ && window.$.fn.modal) {
            window.$(modalElement).modal('show');
            return;
        }

        // Fallback to Bootstrap 5 if jQuery not available
        if (window.bootstrap && window.bootstrap.Modal) {
            const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
            modal.show();
        }
    } catch (error) {
        console.error('Error showing modal:', error);
    }
};

export const hideModal = (modalId) => {
    try {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;

        if (window.bootstrap && window.bootstrap.Modal) {
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        } else if (window.$ && window.$.fn.modal) {
            window.$(modalElement).modal('hide');
        }
    } catch (error) {
        console.error('Error hiding modal:', error);
    }
};

// Force initialize all modals on page load
export const initializeAllModals = () => {
    try {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (window.bootstrap && window.bootstrap.Modal) {
                new window.bootstrap.Modal(modal);
            }
        });
    } catch (error) {
        console.error('Error initializing all modals:', error);
    }
};