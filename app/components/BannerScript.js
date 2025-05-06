'use client';
import { useEffect } from 'react';
import Script from 'next/script';

export default function AdsScript() {
  // Load Adsterra script dynamically
  useEffect(() => {
    // Create a script element for the Adsterra config
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `
      atOptions = {
        'key': 'db2206c1070f56974805612fc96f6ba4',
        'format': 'iframe',
        'height': 250,
        'width': 300,
        'params': {}
      };
    `;
    document.head.appendChild(configScript);
  }, []);

  return (
    <div className="adsterra-container">
      {/* Use Next.js Script component for the main script */}
      <Script
        src="//www.highperformanceformat.com/db2206c1070f56974805612fc96f6ba4/invoke.js"
        strategy="lazyOnload"
        onError={(e) => console.error('Script failed to load', e)}
      />
      {/* Fallback/placeholder with the same dimensions as your ad */}
      <div className="ad-placeholder h-[250px] w-[300px]"></div>
    </div>
  );
}