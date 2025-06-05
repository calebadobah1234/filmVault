"use client";
import React, { useEffect } from 'react';

const ExternalScriptInjector = () => {
  useEffect(() => {
    // Check if the script already exists to avoid adding it multiple times
    // This is a simple check based on the src. For more robust solutions,
    // you might want to assign an ID to the script.
    if (document.querySelector("script[src='//attendedlickhorizontally.com/8f/7a/9a/8f7a9a55b09d6490561d79ed8264dd5c.js']")) {
      return; // Script already added
    }

    // Create the script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//attendedlickhorizontally.com/8f/7a/9a/8f7a9a55b09d6490561d79ed8264dd5c.js';
    script.async = true; // It's good practice to load external scripts asynchronously

    // Append the script to the document head
    document.head.appendChild(script);

    // Optional: Cleanup function to remove the script when the component unmounts
    // This might be useful in some scenarios, but often for global scripts like this,
    // you want them to remain for the lifetime of the page.
    return () => {
      // Check if the script is still in the head before trying to remove it
      const existingScript = document.querySelector("script[src='//attendedlickhorizontally.com/8f/7a/9a/8f7a9a55b09d6490561d79ed8264dd5c.js']");
      if (existingScript && existingScript.parentNode === document.head) {
        document.head.removeChild(existingScript);
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount and cleanup on unmount

  return null; // This component doesn't render anything itself
};

export default ExternalScriptInjector;