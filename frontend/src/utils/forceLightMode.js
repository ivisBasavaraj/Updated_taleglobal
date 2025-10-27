// Force Light Mode Utility
// This utility ensures the website always stays in light mode

export const forceLightMode = () => {
  // Override matchMedia to always return false for dark mode queries
  if (window.matchMedia) {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = function(query) {
      if (query.includes('prefers-color-scheme: dark')) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: function() {},
          removeListener: function() {},
          addEventListener: function() {},
          removeEventListener: function() {},
          dispatchEvent: function() { return true; }
        };
      }
      return originalMatchMedia(query);
    };
  }

  // Force light color scheme on document
  const forceStyles = () => {
    document.documentElement.style.setProperty('color-scheme', 'light only', 'important');
    document.body.style.setProperty('background-color', '#ffffff', 'important');
    document.body.style.setProperty('color', '#111827', 'important');
    
    // Add meta tag if not exists
    if (!document.querySelector('meta[name="color-scheme"]')) {
      const meta = document.createElement('meta');
      meta.name = 'color-scheme';
      meta.content = 'light only';
      document.head.appendChild(meta);
    }
  };

  // Apply immediately
  forceStyles();

  // Watch for any changes and reapply
  const observer = new MutationObserver(() => {
    forceStyles();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // Also watch for style changes
  const styleObserver = new MutationObserver(() => {
    forceStyles();
  });

  styleObserver.observe(document.head, {
    childList: true,
    subtree: true
  });

  return () => {
    observer.disconnect();
    styleObserver.disconnect();
  };
};

// Initialize immediately when module loads
if (typeof window !== 'undefined') {
  forceLightMode();
}

export default forceLightMode;