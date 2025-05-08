'use client';
import { useEffect, useRef } from 'react';

export default function AdportScript({ className = '' }) {
  const adContainerRef = useRef(null);
  
  useEffect(() => {
    if (!adContainerRef.current) return;
    
    // Create and add the Adport script
    const adportScript = document.createElement('script');
    adportScript.type = 'text/javascript';
    adportScript.src = 'https://cdn.diclotrans.com/sdk/v1/50439/09048bf12d0299e91638b4b9233cef636225384f/lib.js';
    adportScript.async = true;
    
    // Clear any existing content in the container
    adContainerRef.current.innerHTML = '';
    
    // Add script to the container
    adContainerRef.current.appendChild(adportScript);
    
    // Cleanup function to remove script when component unmounts
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={adContainerRef} 
      className={`adport-container ${className}`}
    ></div>
  );
}