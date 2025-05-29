"use client";
import { useEffect, useState } from 'react';

const SocialBarScript = ({ 
  delay = 30000, // Default 30 seconds
  sessionKey = 'socialBarShown', // Default session storage key
  className = '', // Custom CSS classes
  scriptSrc = '//attendedlickhorizontally.com/63/0a/a3/630aa3d42a5d5aa6eb0fb23904bc6f85.js'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return;

    // Check if social bar has already been shown/interacted with this session
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    // Set up the delay timer
    const timer = setTimeout(() => {
      loadSocialBar();
    }, delay);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [delay, sessionKey]);

  const loadSocialBar = () => {
    // Mark as shown for this session immediately when script loads
    sessionStorage.setItem(sessionKey, 'true');

    // Create and inject the script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptSrc;
    script.async = true;

    // Add custom classes if provided
    if (className) {
      script.className = className;
    }

    // Handle successful load
    script.onload = () => {
      setIsLoaded(true);
      console.log('Social bar script loaded successfully');
      
      // Set up listeners for social bar interactions
      setupSocialBarListeners();
    };

    // Add error handling
    script.onerror = () => {
      console.warn('Social bar script failed to load');
    };

    // Append to head
    document.head.appendChild(script);
  };

  const setupSocialBarListeners = () => {
    // Wait a bit for the social bar to be created by the external script
    setTimeout(() => {
      // Look for common social bar close button selectors
      const closeSelectors = [
        '.social-bar-close',
        '.close-social-bar',
        '[data-close="social-bar"]',
        '.social-close',
        '.close-btn',
        // Add more selectors based on the actual social bar structure
      ];

      closeSelectors.forEach(selector => {
        const closeButton = document.querySelector(selector);
        if (closeButton) {
          closeButton.addEventListener('click', handleSocialBarClose);
        }
      });

      // Also listen for any clicks on elements with common close attributes
      document.addEventListener('click', (event) => {
        const target = event.target;
        if (target.matches('[data-action="close"]') || 
            target.matches('.close') || 
            target.classList.contains('social-bar-close')) {
          handleSocialBarClose();
        }
      });

      // Listen for ESC key to close (if social bar supports it)
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          // Check if social bar is currently visible
          const socialBarElements = document.querySelectorAll('[class*="social"], [id*="social"]');
          if (socialBarElements.length > 0) {
            handleSocialBarClose();
          }
        }
      });

    }, 1000); // Wait 1 second for the social bar to initialize
  };

  const handleSocialBarClose = () => {
    console.log('Social bar closed by user');
    // The sessionStorage item is already set, so it won't show again this session
  };

  // This component doesn't render anything visible
  return null;
};

export default SocialBarScript;