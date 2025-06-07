'use client';
import { useEffect, useRef, useState } from 'react';

export default function BannerAdScript({ className = '' }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if screen is mobile-sized
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    if (!containerRef.current) return;
    
    // Create an iframe with responsive height
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    
    // Set height based on screen size
    iframe.style.height = isMobile ? '600px' : '300px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'visible';
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
              overflow: visible;
            }
            #container-a2ec5d29f1060455d67da23054ccb38b {
              width: 100%;
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 10px;
              min-height: 250px;
            }
            
            /* Responsive styles based on container width */
            @media (min-width: 768px) {
              #container-a2ec5d29f1060455d67da23054ccb38b {
                max-width: 900px;
                margin: 0 auto;
              }
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
            // Remove height and width constraints to allow natural rendering
            var atOptions = {
              'key': 'a2ec5d29f1060455d67da23054ccb38b',
              'format': 'iframe',
              'params': {}
            };
          </script>
          <script data-cfasync="false" async src="//pl25046019.profitableratecpm.com/a2ec5d29f1060455d67da23054ccb38b/invoke.js"></script>
        </body>
      </html>
    `;
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', checkMobile);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [isMobile]);

  return (
    <div 
      ref={containerRef} 
      className={`banner-ad-container ${className} my-4 flex justify-center`}
      style={{ minWidth: '300px' }}
    ></div>
  );
}