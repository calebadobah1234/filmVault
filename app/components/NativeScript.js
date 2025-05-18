'use client';
import { useEffect, useRef } from 'react';

export default function BannerAdScript({ className = '' }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create an iframe with more permissive settings
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '280px'; // Slightly taller to accommodate multiple ads
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.margin = '0 auto';
    iframe.style.display = 'block';
    
    // Allow scripts and pop-ups but in a controlled way
    iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation';
    
    // Clear container and add iframe
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(iframe);
    
    // Write content to the iframe
    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              overflow: hidden;
            }
            #container-a2ec5d29f1060455d67da23054ccb38b {
              width: 100%;
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 10px;
            }
          </style>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script>
            // Controlled popup handling - only allow one popup per user click
            let lastClickTime = 0;
            let popupCount = 0;
            
            // Override window.open with a more nuanced version
            const originalWindowOpen = window.open;
            window.open = function(url, name, specs) {
              const now = Date.now();
              
              // Allow popup if it's within 1 second of a user click and less than 2 popups per click
              if (now - lastClickTime < 1000 && popupCount < 1) {
                popupCount++;
                return originalWindowOpen.call(window, url, name, specs);
              }
              
              console.log('Excessive popup blocked');
              return null;
            };
            
            // Track user clicks
            document.addEventListener('click', function() {
              lastClickTime = Date.now();
              popupCount = 0;
            }, true);
          </script>
        </head>
        <body>
          <div id="container-a2ec5d29f1060455d67da23054ccb38b"></div>
          <script>
            // Allow the ad to format multiple units
            var atOptions = {
              'key': 'a2ec5d29f1060455d67da23054ccb38b',
              'format': 'iframe',
              'height': 250,
              'width': 300,
              'params': {}
            };
          </script>
          <script data-cfasync="false" async src="//pl25046019.profitableratecpm.com/a2ec5d29f1060455d67da23054ccb38b/invoke.js"></script>
        </body>
      </html>
    `;
    
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
      style={{ minWidth: '300px', minHeight: '280px' }}
    ></div>
  );
}