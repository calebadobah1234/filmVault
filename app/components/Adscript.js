'use client';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function AdScript({
  type = 'banner',
  className = '',
  position = 'default',
  adFormat = 'standard'
}) {
  const [uniqueId] = useState(() => uuidv4().substring(0, 8));
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const hasInitializedRef = useRef(false);
 
  const [dimensions] = useState(() => ({
    banner: { width: 300, height: 250 },
    native: { width: 468, height: 60 },
    custom: { width: 300, height: 250 },
    'custom-2': { width: 320, height: 50 }
  }[type]));

  useEffect(() => {
    // Only initialize once
    if (!containerRef.current || hasInitializedRef.current) return;
   
    hasInitializedRef.current = true;
   
    // Create iframe only once
    const iframe = document.createElement('iframe');
    iframeRef.current = iframe;
   
    iframe.style.width = `${dimensions.width}px`;
    iframe.style.height = `${dimensions.height}px`;
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.margin = '0 auto';
    iframe.style.display = 'block';
    
    // Add sandbox attribute to restrict behaviors that could trigger pop-ups
    iframe.sandbox = 'allow-scripts allow-same-origin allow-popups-to-escape-sandbox';
   
    // Determine which ad content to use
    const adContent =
      type === 'banner' ? bannerAdMarkup() :
      type === 'native' ? nativeAdMarkup() :
      type === 'custom' ? customAdMarkup() :
      custom2AdMarkup();
   
    // Write content directly when creating the iframe
    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>body { margin: 0; padding: 0; overflow: hidden; }</style>
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
          ${adContent}
        </body>
      </html>
    `;

    containerRef.current.appendChild(iframe);

    return () => {
      // Clean up on unmount
      hasInitializedRef.current = false;
      if (iframeRef.current && containerRef.current) {
        containerRef.current.removeChild(iframeRef.current);
      }
    };
  }, [type, uniqueId, dimensions]);

  // Modified to return HTML instead of including scripts directly
  const bannerAdMarkup = () => `
    <div id="container-${uniqueId}"></div>
    <script data-cfasync="false" async src="//pl25046019.profitableratecpm.com/a2ec5d29f1060455d67da23054ccb38b/invoke.js"></script>
  `;

  const nativeAdMarkup = () => `
    <script type="text/javascript">
      atOptions = {
        'key': '5a9384d1525384473dd0becafd870903',
        'format': 'iframe',
        'height': ${dimensions.height},
        'width': ${dimensions.width},
        'params': {}
      };
      
      // Add popup blocker
      if (atOptions.params) {
        atOptions.params.popunder = false;
        atOptions.params.popups = false;
      } else {
        atOptions.params = { popunder: false, popups: false };
      }
    </script>
    <script data-cfasync="false" async src="//www.highperformanceformat.com/5a9384d1525384473dd0becafd870903/invoke.js"></script>
  `;

  const customAdMarkup = () => `
    <script type="text/javascript">
      atOptions = {
        'key': 'db2206c1070f56974805612fc96f6ba4',
        'format': 'iframe',
        'height': 250,
        'width': 300,
        'params': { popunder: false, popups: false }
      };
    </script>
    <script type="text/javascript" src="//attendedlickhorizontally.com/db2206c1070f56974805612fc96f6ba4/invoke.js"></script>
  `;

  const custom2AdMarkup = () => `
    <script type="text/javascript">
      atOptions = {
        'key': '5b248f388dd1725b2d078a9ea603f96f',
        'format': 'iframe',
        'height': 50,
        'width': 320,
        'params': { popunder: false, popups: false }
      };
    </script>
    <script type="text/javascript" src="//attendedlickhorizontally.com/5b248f388dd1725b2d078a9ea603f96f/invoke.js"></script>
  `;

  return (
    <div
      ref={containerRef}
      className={`ad-container ${className}`}
      style={{
        margin: '1rem auto'
      }}
    />
  );
}