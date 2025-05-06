'use client';
import { useEffect, useRef } from 'react';

export default function BannerAdScript({ className = '' }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear any existing content in the container
    containerRef.current.innerHTML = '';
    
    // Create the invoke script element
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//pl25046019.profitableratecpm.com/a2ec5d29f1060455d67da23054ccb38b/invoke.js';
    
    // Create the container div with the specific ID required by the ad network
    const adContainer = document.createElement('div');
    adContainer.id = 'container-a2ec5d29f1060455d67da23054ccb38b';
    
    // Add the elements to the ref container
    containerRef.current.appendChild(script);
    containerRef.current.appendChild(adContainer);
    
    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`banner-ad-container ${className} my-4 flex justify-center`}
      style={{ minWidth: '300px', minHeight: '250px' }}
    ></div>
  );
}