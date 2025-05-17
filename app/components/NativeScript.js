'use client';
import { useEffect, useRef } from 'react';

export default function BannerAdScript({ className = '' }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create a sandbox iframe to contain the ad
    const iframe = document.createElement('iframe');
    iframe.style.width = '300px';
    iframe.style.height = '250px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.margin = '0 auto';
    iframe.style.display = 'block';
    
    // Add sandbox attribute to restrict behaviors that could trigger pop-ups
    iframe.sandbox = 'allow-scripts allow-same-origin allow-popups-to-escape-sandbox';
    
    // Clear any existing content in the container
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(iframe);
    
    // Write content to the iframe that will safely load the ad
    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              overflow: hidden; 
              display: flex;
              justify-content: center;
            }
          </style>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <!-- Add anti-popup script -->
          <script>
            // Block attempts to open new windows
            window.open = function() { 
              console.log('Popup blocked');
              return null; 
            };
            
            // Prevent other ways of opening popups
            window.addEventListener('DOMContentLoaded', function() {
              // Override any attempts to modify window.open after load
              Object.defineProperty(window, 'open', {
                writable: false,
                value: function() { 
                  console.log('Popup blocked');
                  return null; 
                }
              });
            });
          </script>
        </head>
        <body>
          <div id="container-a2ec5d29f1060455d67da23054ccb38b"></div>
          <script>
            // Add configuration to prevent popups if possible
            var atOptions = {
              'format': 'iframe',
              'height': 250,
              'width': 300,
              'params': { 
                'popunder': false, 
                'popups': false 
              }
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
      style={{ minWidth: '300px', minHeight: '250px' }}
    ></div>
  );
}