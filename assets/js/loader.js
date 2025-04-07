/**
 * Loader Module
 * Handles the page loading animation and state
 */
const loaderModule = (function() {
    const loader = document.getElementById('page-loader');
    
    /**
     * Initialize the loader
     */
    function init() {
        // Show loader immediately
        show();
        
        // Hide loader when page is fully loaded
        window.addEventListener('load', hide);
        
        // Fallback to hide loader after 2 seconds in case the load event doesn't fire
        setTimeout(hide, 2000);
    }
    
    /**
     * Show the loader
     */
    function show() {
        if (loader) {
            loader.classList.remove('hidden');
        }
    }
    
    /**
     * Hide the loader
     */
    function hide() {
        if (loader) {
            loader.classList.add('hidden');
        }
    }
    
    // Public API
    return {
        init: init,
        show: show,
        hide: hide
    };
})();

// Initialize loader when DOM is ready
document.addEventListener('DOMContentLoaded', loaderModule.init);

// Make loader available globally
window.loaderModule = loaderModule;
