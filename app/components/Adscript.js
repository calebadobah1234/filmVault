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
  const [dimensions] = useState(() => ({
    banner: { width: 300, height: 250 },
    native: { width: 468, height: 60 },
    custom: { width: 300, height: 250 },
    'custom-2': { width: 320, height: 50 }
  }[type]));

  useEffect(() => {
    if (!containerRef.current) return;

    const iframe = document.createElement('iframe');
    iframe.style.width = `${dimensions.width}px`;
    iframe.style.height = `${dimensions.height}px`;
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.margin = '0 auto';
    iframe.style.display = 'block';

    const cleanup = () => {
      if (iframe.parentNode === containerRef.current) {
        containerRef.current.removeChild(iframe);
      }
    };

    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(`
          <html>
            <head>
              <style>body { margin: 0; }</style>
            </head>
            <body>
              ${
                type === 'banner' ? bannerAdMarkup() : 
                type === 'native' ? nativeAdMarkup() : 
                type === 'custom' ? customAdMarkup() :
                custom2AdMarkup()
              }
            </body>
          </html>
        `);
        doc.close();
      } catch (error) {
        console.error('Error loading ad iframe:', error);
        cleanup();
      }
    };

    containerRef.current.appendChild(iframe);

    return cleanup;
  }, [type, uniqueId, dimensions]);

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
        'params': {}
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
        'params': {}
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