(function() {
  'use strict';
  
  // Configuration
  var SELESTIAL_URL = 'https://access.selestial.io';
  
  // Initialize when DOM is ready
  function init() {
    var containers = document.querySelectorAll('[data-selestial-booking]');
    
    containers.forEach(function(container) {
      var businessId = container.dataset.selestialBooking;
      var width = container.dataset.width || '100%';
      var height = container.dataset.height || '800px';
      var theme = container.dataset.theme || 'light';
      
      if (!businessId) {
        console.error('Selestial: Missing business ID');
        return;
      }
      
      // Create iframe
      var iframe = document.createElement('iframe');
      iframe.src = SELESTIAL_URL + '/embed/' + businessId + '/book?theme=' + theme;
      iframe.style.width = width;
      iframe.style.height = height;
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';
      iframe.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      iframe.allow = 'payment';
      iframe.loading = 'lazy';
      iframe.title = 'Book a Cleaning';
      
      // Add responsive handling
      iframe.onload = function() {
        // Listen for height updates from iframe
        window.addEventListener('message', function(event) {
          if (event.origin !== SELESTIAL_URL) return;
          
          if (event.data.type === 'selestial-resize' && event.data.businessId === businessId) {
            iframe.style.height = event.data.height + 'px';
          }
          
          if (event.data.type === 'selestial-booking-complete' && event.data.businessId === businessId) {
            // Dispatch custom event
            var customEvent = new CustomEvent('selestial:booking-complete', {
              detail: event.data.booking
            });
            container.dispatchEvent(customEvent);
          }
        });
      };
      
      // Clear container and add iframe
      container.innerHTML = '';
      container.appendChild(iframe);
    });
  }
  
  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose API for manual initialization
  window.Selestial = {
    init: init,
    version: '1.0.0'
  };
})();
