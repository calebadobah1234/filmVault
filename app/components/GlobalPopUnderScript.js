"use client";

import React, { useEffect } from 'react';

const GlobalPopunderScript = ({ directLinkUrl }) => {
  useEffect(() => {
    console.log("🚀 GlobalPopunderScript component mounted");
    console.log("🔗 directLinkUrl provided:", directLinkUrl);
    
    // Helper function to check if link is internal
    const isInternalLink = (url) => {
      try {
        const linkUrl = new URL(url, window.location.origin);
        const currentDomain = window.location.hostname;
        return linkUrl.hostname === currentDomain;
      } catch (error) {
        // If URL parsing fails, assume it's internal (relative link)
        return true;
      }
    };
    
    // Handle internal link clicks for popunder
    const handleInternalLinkClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      console.log("🖱️ Internal link clicked!");
      console.log("🖱️ Clicked element:", link);
      console.log("🖱️ Link href:", href);
      
      // Prevent default navigation
      e.preventDefault();
      e.stopPropagation();
      
      console.log("🆕 Opening internal link in new tab...");
      
      // Open the internal link in a new tab and focus it
      const newTab = window.open(href, '_blank');
      if (newTab) {
        newTab.focus();
        console.log("✅ New tab opened and focused");
      } else {
        console.log("❌ Failed to open new tab (popup blocked?)");
        // Fallback: navigate normally if popup is blocked
        window.location.href = href;
        return;
      }
      
      console.log("⏰ Setting up popunder redirect in 1 second...");
      
      // Navigate current tab to ad after a short delay
      setTimeout(() => {
        console.log("🎯 Redirecting current tab to ad...");
        console.log("🔗 Ad URL:", directLinkUrl);
        console.log("🔄 Navigating to popunder ad...");
        
        // Navigate current tab to the ad (popunder effect)
        window.location.href = directLinkUrl;
      }, 1000); // Short delay to ensure new tab opens first
    };
    
    // Set up event delegation for all current and future links
    const handleDocumentClick = (e) => {
      const link = e.target.closest('a[href]');
      
      if (!link) return;
      
      const href = link.getAttribute('href');
      
      // Skip if no href
      if (!href) return;
      
      // Skip if link has target="_blank" already (let it behave normally)
      if (link.getAttribute('target') === '_blank') {
        console.log("🔗 Link already has target='_blank', skipping:", href);
        return;
      }
      
      // Skip if link has download attribute
      if (link.hasAttribute('download')) {
        console.log("⬇️ Download link detected, skipping:", href);
        return;
      }
      
      // Skip anchor links on same page
      if (href.startsWith('#')) {
        console.log("⚓ Anchor link detected, skipping:", href);
        return;
      }
      
      // Skip javascript: links
      if (href.startsWith('javascript:')) {
        console.log("🔧 JavaScript link detected, skipping:", href);
        return;
      }
      
      // Skip mailto: and tel: links
      if (href.startsWith('mailto:') || href.startsWith('tel:')) {
        console.log("📧 Mailto/tel link detected, skipping:", href);
        return;
      }
      
      // Check if it's an internal link
      if (isInternalLink(href)) {
        console.log("🏠 Internal link detected:", href);
        handleInternalLinkClick(e);
      } else {
        console.log("🌐 External link detected, allowing normal behavior:", href);
        // Let external links behave normally
      }
    };
    
    // Add event listener to document for event delegation
    document.addEventListener('click', handleDocumentClick, true);
    console.log("👂 Global click listener attached");
    
    // Log initial setup info
    const allLinks = document.querySelectorAll('a[href]');
    let internalCount = 0;
    let externalCount = 0;
    
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        if (isInternalLink(href)) {
          internalCount++;
        } else {
          externalCount++;
        }
      }
    });
    
    console.log(`📊 Initial page analysis:`);
    console.log(`   🏠 Internal links (will trigger popunder): ${internalCount}`);
    console.log(`   🌐 External links (normal behavior): ${externalCount}`);
    console.log(`   📊 Total links monitored: ${allLinks.length}`);
    
    // Cleanup function
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      console.log("🧹 Global click listener removed");
    };
  }, [directLinkUrl]);

  return null;
};

export default GlobalPopunderScript;