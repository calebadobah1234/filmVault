'use client';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function AdScript({
  type = 'banner',
  className = '',
  position = 'default', // position and adFormat are not currently used in the logic but kept for potential future use
  adFormat = 'standard'
}) {
  const [uniqueId] = useState(() => uuidv4().substring(0, 8));
  const containerRef = useRef(null);
  const iframeRef = useRef(null); // To keep a reference to the iframe for cleanup
  const hasInitializedRef = useRef(false);

  const [dimensions] = useState(() => ({
    banner: { width: 300, height: 250 },
    native: { width: 468, height: 60 },
    custom: { width: 300, height: 250 },
    'custom-2': { width: 320, height: 50 }
  }[type]));

  useEffect(() => {
    if (!containerRef.current || hasInitializedRef.current || !dimensions) return;

    hasInitializedRef.current = true;

    const iframe = document.createElement('iframe');
    iframeRef.current = iframe; // Store iframe reference

    iframe.style.width = `${dimensions.width}px`;
    iframe.style.height = `${dimensions.height}px`;
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.margin = '0 auto'; // For centering if the container is wider
    iframe.style.display = 'block';

    // Modify sandbox attributes:
    // 'allow-scripts': Lets the ad scripts execute.
    // 'allow-same-origin': Allows the content to be treated as from its "real" origin (needed for some ad functionalities).
    // 'allow-popups': Allows popups (like new tabs on click) but ONLY if triggered by user activation (e.g., a click).
    // 'allow-popups-to-escape-sandbox': Allows the opened popup to not be sandboxed itself.
    // 'allow-forms': If your ads have forms.
    // 'allow-modals': Allows modal dialogs like alert(), confirm(), prompt().
    // 'allow-pointer-lock': If needed by any ad interactions.
    // You can be more restrictive or more permissive based on ad network requirements and testing.
    iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms';

    const adContent =
      type === 'banner' ? bannerAdMarkup() :
      type === 'native' ? nativeAdMarkup(dimensions) : // Pass dimensions
      type === 'custom' ? customAdMarkup() :
      custom2AdMarkup();

    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>body { margin: 0; padding: 0; overflow: hidden; }</style>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
        <body>
          ${adContent}
        </body>
      </html>
    `;

    containerRef.current.appendChild(iframe);

    return () => {
      hasInitializedRef.current = false;
      if (iframeRef.current && iframeRef.current.parentElement) {
        iframeRef.current.parentElement.removeChild(iframeRef.current);
        iframeRef.current = null; // Clear the ref
      }
    };
  }, [type, uniqueId, dimensions]); // Ensure dimensions is in dependency array

  // Ensure dimensions are passed if needed, or use the ones from the component's scope
  const bannerAdMarkup = () => `
    <div id="container-${uniqueId}"></div>
    <script data-cfasync="false" async src="//pl25046019.profitableratecpm.com/a2ec5d29f1060455d67da23054ccb38b/invoke.js"></script>
  `;

  const nativeAdMarkup = (dims) => `
    <script type="text/javascript">
      atOptions = {
        'key': '5a9384d1525384473dd0becafd870903',
        'format': 'iframe',
        'height': ${dims.height},
        'width': ${dims.width},
        'params': {} // Ad networks might interpret empty params to disable popups
      };
      // The ad network scripts should ideally respect these params
      // For some networks, explicitly setting popunder: false, popups: false can help.
      // However, some aggressive ad scripts might ignore these.
      // The sandbox attribute is your stronger defense.
      if (atOptions.params) {
        atOptions.params.popunder = false; // Attempt to tell ad network
        atOptions.params.popups = false;   // Attempt to tell ad network
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
        'height': 250, // Assuming these are fixed for this type
        'width': 300,
        'params': { popunder: false, popups: false } // Explicitly try to disable
      };
    </script>
    <script type="text/javascript" src="//attendedlickhorizontally.com/db2206c1070f56974805612fc96f6ba4/invoke.js"></script>
  `;

  const custom2AdMarkup = () => `
    <script type="text/javascript">
      atOptions = {
        'key': '5b248f388dd1725b2d078a9ea603f96f',
        'format': 'iframe',
        'height': 50, // Assuming these are fixed for this type
        'width': 320,
        'params': { popunder: false, popups: false } // Explicitly try to disable
      };
    </script>
    <script type="text/javascript" src="//attendedlickhorizontally.com/5b248f388dd1725b2d078a9ea603f96f/invoke.js"></script>
  `;

  return (
    <div
      ref={containerRef}
      className={`ad-container ${className}`}
      style={{
        width: dimensions ? `${dimensions.width}px` : 'auto', // Set container width
        height: dimensions ? `${dimensions.height}px` : 'auto', // Set container height
        margin: '1rem auto',
        // overflow: 'hidden' // Potentially useful on the container too
      }}
    />
  );
}