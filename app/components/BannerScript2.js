'use client';
import { useEffect, useRef } from 'react';

export default function AdsScript({ position = 'body', className = '' }) {
  const adContainerRef = useRef(null);
  
  useEffect(() => {
    if (!adContainerRef.current) return;
    
    // First, create and add the configuration script
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `
      atOptions = {
        'key': '5a9384d1525384473dd0becafd870903',
        'format': 'iframe',
        'height': 60,
        'width': 468,
        'params': {}
      };
    `;
    
    // Then create and add the invoke script
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = '//www.highperformanceformat.com/5a9384d1525384473dd0becafd870903/invoke.js';
    invokeScript.async = true;
    
    // Clear any existing content in the container
    adContainerRef.current.innerHTML = '';
    
    // Add scripts directly to the container instead of head
    // This ensures the ad renders exactly where we want it
    adContainerRef.current.appendChild(configScript);
    adContainerRef.current.appendChild(invokeScript);
    
    // Cleanup function to remove scripts when component unmounts
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={adContainerRef} 
      className={`adsterra-container ${className} mt-5 flex justify-center`}
      style={{ minHeight: '60px', minWidth: '468px' }}
      data-position={position}
    ></div>
  );
}