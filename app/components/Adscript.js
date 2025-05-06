'use client';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package

export default function AdScript({ 
  type = 'banner', // 'banner' or 'native'
  className = '',
  position = 'default'
}) {
  // Generate a unique ID for each ad instance
  const [uniqueId] = useState(() => uuidv4().substring(0, 8));
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear any existing content in the container
    containerRef.current.innerHTML = '';
    
    // Configure the ad based on type
    if (type === 'banner') {
      // Banner ad setup
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//pl25046019.profitableratecpm.com/a2ec5d29f1060455d67da23054ccb38b/invoke.js';
      
      // Create container with dynamic ID
      const adContainer = document.createElement('div');
      const containerId = `container-a2ec5d29f1060455d67da23054ccb38b-${uniqueId}`;
      adContainer.id = containerId;
      
      // Modify the script to target the specific container
      // This is the key part - we need to tell the ad script which container to use
      const targetScript = document.createElement('script');
      targetScript.innerHTML = `
        document.addEventListener('DOMContentLoaded', function() {
          window.adsbygoogle = window.adsbygoogle || [];
          var adInit = function() {
            try {
              // This redirects the original script to use our specific container
              var originalAppendChild = document.body.appendChild;
              document.body.appendChild = function(element) {
                if (element.tagName === 'DIV' && element.id && element.id.startsWith('container-a2ec5d29f1060455d67da23054ccb38b')) {
                  document.getElementById('${containerId}').innerHTML = element.innerHTML;
                  return element;
                }
                return originalAppendChild.call(this, element);
              };
              
              // Execute the original script in our context
              setTimeout(() => {
                document.body.appendChild = originalAppendChild;
              }, 1000);
            } catch (e) {
              console.error('Ad init error:', e);
            }
          };
          adInit();
        });
      `;
      
      // Add the elements to the ref container
      containerRef.current.appendChild(targetScript);
      containerRef.current.appendChild(script);
      containerRef.current.appendChild(adContainer);
    } else if (type === 'native') {
      // Native ad setup (for your other ad type)
      // Similar approach but with different script/container IDs
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//www.highperformanceformat.com/5a9384d1525384473dd0becafd870903/invoke.js';
      
      // Create atOptions script
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
      
      // Create container with dynamic ID
      const adContainer = document.createElement('div');
      const containerId = `native-ad-container-${uniqueId}`;
      adContainer.id = containerId;
      
      // Add the elements to the ref container
      containerRef.current.appendChild(configScript);
      containerRef.current.appendChild(script);
      containerRef.current.appendChild(adContainer);
    }
    
    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [type, uniqueId]);

  // Determine appropriate dimensions based on ad type
  const adStyle = type === 'banner' 
    ? { minWidth: '300px', minHeight: '250px' }
    : { minWidth: '468px', minHeight: '60px' };

  return (
    <div 
      ref={containerRef} 
      className={`ad-container ${className} my-4 flex justify-center`}
      style={adStyle}
      data-position={position}
      data-ad-type={type}
    ></div>
  );
}