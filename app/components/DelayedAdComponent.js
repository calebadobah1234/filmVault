'use client';  // Mark as client component

import React from "react";

/**
 * TabSwapAdLink - Enhances download links to swap tabs with direct ad link after a delay
 * 
 * The behavior is:
 * 1. User clicks download link
 * 2. Download starts
 * 3. After specified delay:
 *    - Current tab navigates to the ad link
 *    - A new tab opens with the original website URL
 * 
 * @param {Object} props
 * @param {string} props.href - Original download URL
 * @param {string} props.adLink - Direct ad link URL to show in current tab
 * @param {number} props.delay - Delay in milliseconds before opening ad (default: 10000ms)
 * @param {string} props.className - CSS classes for the link
 * @param {string} props.downloadFileName - Name of the file to download
 * @param {React.ReactNode} props.children - Link content
 */
const TabSwapAdLink = ({
  href,
  adLink = "https://attendedlickhorizontally.com/jth75j6j5?key=1cc239cea6ecf5e6b20d0a992ab044c4",
  delay = 10000,
  className,
  downloadFileName,
  children
}) => {
  const handleClick = (e) => {
    // Don't prevent default - allow the normal download to happen

    // After specified delay, do the tab swap
    setTimeout(() => {
      // Get current URL to reopen in new tab
      const currentUrl = window.location.href;
      
      // Open current page in new tab
      const newTab = window.open(currentUrl, '_blank');

      // Navigate current tab to ad URL
      window.location.href = adLink;
    }, delay);
  };

  return (
    <a
      href={href}
      download={downloadFileName}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

export default TabSwapAdLink;