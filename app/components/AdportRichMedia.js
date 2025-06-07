'use client';
import { useEffect, useRef } from 'react';

export default function AdportRichMedia({ className = '' }) {
  const adContainerRef = useRef(null);
  
  useEffect(() => {
    if (!adContainerRef.current) return;
    
    // Create and add the Adport rich media script
    const adportScript = document.createElement('script');
    adportScript.type = 'text/javascript';
    adportScript.src = 'https://cdn.diclotrans.com/sdk/v1/50458/b9a6883adb042814d5285de5989bff5e6ae16733/lib.js';
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
      className={`adport-rich-media ${className}`}
    ></div>
  );
}