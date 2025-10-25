// Modal Fix - Prevent dark screen issues
(function() {
    'use strict';
    
    // Override Bootstrap modal backdrop behavior
    document.addEventListener('DOMContentLoaded', function() {
        // Remove any existing modal backdrops
        function removeBackdrops() {
            const backdrops = document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop');
            backdrops.forEach(backdrop => {
                backdrop.remove();
            });
        }
        
        // Monitor for modal events
        document.addEventListener('show.bs.modal', function(e) {
            // Remove backdrop immediately
            setTimeout(removeBackdrops, 0);
        });
        
        document.addEventListener('shown.bs.modal', function(e) {
            // Remove backdrop after modal is shown
            setTimeout(removeBackdrops, 10);
        });
        
        // Periodic cleanup
        setInterval(removeBackdrops, 1000);
        
        // Initial cleanup
        removeBackdrops();
    });
    
    // Override Bootstrap's backdrop creation
    if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Modal) {
        const originalShow = window.bootstrap.Modal.prototype.show;
        window.bootstrap.Modal.prototype.show = function() {
            this._config.backdrop = false;
            return originalShow.apply(this, arguments);
        };
    }
})();