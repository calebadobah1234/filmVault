'use client';
import { useEffect, useRef } from 'react';

export default function AdsteraSocialBarScript({ className = '' }) {
  const scriptContainerRef = useRef(null);
  
  useEffect(() => {
    if (!scriptContainerRef.current) return;
    
    // Create the social bar script
    const socialBarScript = document.createElement('script');
    socialBarScript.type = 'text/javascript';
    socialBarScript.src = '//attendedlickhorizontally.com/63/0a/a3/630aa3d42a5d5aa6eb0fb23904bc6f85.js';
    socialBarScript.async = true;
    
    // Clear any existing content in the container
    scriptContainerRef.current.innerHTML = '';
    
    // Add script to the container
    scriptContainerRef.current.appendChild(socialBarScript);
    
    // Cleanup function to remove script when component unmounts
    return () => {
      if (scriptContainerRef.current) {
        scriptContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={scriptContainerRef} 
      className={`adstera-social-bar-container ${className}`}
    ></div>
  );
}