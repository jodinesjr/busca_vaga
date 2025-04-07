/**
 * Sidebar Module
 * Handles the sidebar toggle and responsive behavior
 */
const sidebarModule = (function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar');
    const menuItems = document.querySelectorAll('#sidebar .list-group-item');
    
    /**
     * Initialize the sidebar
     */
    function init() {
        // Add event listener to toggle button
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleSidebar);
        }
        
        // Handle responsive behavior
        handleResponsive();
        
        // Listen for window resize events
        window.addEventListener('resize', handleResponsive);
    }
    
    /**
     * Toggle sidebar collapsed state
     */
    function toggleSidebar() {
        // Para dispositivos móveis
        if (window.innerWidth < 768) {
            sidebar.classList.toggle('show');
        } else {
            // Para desktop
            sidebar.classList.toggle('collapsed');
        }
    }
    
    /**
     * Handle responsive behavior
     */
    function handleResponsive() {
        if (window.innerWidth < 768) {
            sidebar.classList.remove('collapsed');
            
            // For mobile, clicking outside sidebar should close it
            document.addEventListener('click', function(event) {
                const isClickInsideSidebar = sidebar.contains(event.target);
                const isClickOnToggleBtn = toggleBtn.contains(event.target);
                
                if (!isClickInsideSidebar && !isClickOnToggleBtn && sidebar.classList.contains('show')) {
                    sidebar.classList.remove('show');
                }
            });
            
            // Toggle button should show/hide sidebar on mobile
            toggleBtn.removeEventListener('click', toggleSidebar);
            toggleBtn.addEventListener('click', function() {
                sidebar.classList.toggle('show');
            });
        } else {
            sidebar.classList.remove('show');
            
            // Restore toggle button behavior for desktop
            toggleBtn.removeEventListener('click', function() {
                sidebar.classList.toggle('show');
            });
            toggleBtn.addEventListener('click', toggleSidebar);
        }
    }
    
    // Public API
    return {
        init: init,
        toggle: toggleSidebar
    };
})();

// Initialize sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', sidebarModule.init);
