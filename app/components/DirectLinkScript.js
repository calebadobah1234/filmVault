"use client";

import React, { useEffect } from 'react';

const DirectLinkScript = ({ directLinkUrl }) => {
  useEffect(() => {
    console.log("🚀 DirectLinkScript component mounted");
    console.log("🔗 directLinkUrl provided:", directLinkUrl);
    
    // Check if download was initiated on page load
    const checkForPendingAd = () => {
      console.log("🔍 Checking for pending ad...");
      
      const downloadInitiated = sessionStorage.getItem('downloadInitiated');
      console.log("📦 downloadInitiated flag value:", downloadInitiated);
      console.log("📦 downloadInitiated type:", typeof downloadInitiated);
      
      if (downloadInitiated === 'true') {
        console.log("✅ Download was initiated! Setting up ad to open in 10 seconds...");
        
        // Clear the flag immediately to prevent multiple ads
        sessionStorage.setItem('downloadInitiated', 'false');
        console.log("🚫 Flag cleared to prevent multiple ads");
        
        // Add countdown logs
        let countdown = 10;
        const countdownInterval = setInterval(() => {
          console.log(`⏰ Ad opening in ${countdown} seconds...`);
          countdown--;
          if (countdown < 0) {
            clearInterval(countdownInterval);
          }
        }, 1000);
        
        // Open ad after 10 seconds
        setTimeout(() => {
          console.log("🎯 10 seconds elapsed! Redirecting to ad...");
          console.log("🔗 Ad URL:", directLinkUrl);
          console.log("🔄 Redirecting current page to ad...");
          
          // Direct redirect to the ad page
          window.location.href = directLinkUrl;
        }, 10000);
      } else {
        console.log("❌ No download flag found or flag is false - no ad will be shown");
        console.log("💡 Current sessionStorage contents:");
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          console.log(`   ${key}: ${sessionStorage.getItem(key)}`);
        }
      }
    };
    
    // Check for pending ad when page loads
    checkForPendingAd();
    
    // Set up download link handlers
    const handleDownloadClick = (e) => {
      console.log("🖱️ Download/External link clicked!");
      console.log("🖱️ Clicked element:", e.target);
      console.log("🖱️ Clicked element href:", e.target.href);
      
      // Set the flag that download was initiated (for page refresh scenarios)
      console.log("💾 Setting downloadInitiated flag to true...");
      sessionStorage.setItem('downloadInitiated', 'true');
      
      // Verify it was set
      const verification = sessionStorage.getItem('downloadInitiated');
      console.log("✅ Flag verification - downloadInitiated is now:", verification);
      
      // ALSO start the ad timer immediately (for non-refresh scenarios)
      console.log("⏰ Starting immediate ad timer for non-refresh scenario...");
      
      // Add countdown logs
      let countdown = 10;
      const countdownInterval = setInterval(() => {
        console.log(`⏰ Ad opening in ${countdown} seconds... (immediate timer)`);
        countdown--;
        if (countdown < 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
      
      setTimeout(() => {
        // Check if we should still show the ad (page might have refreshed and already shown it)
        const currentFlag = sessionStorage.getItem('downloadInitiated');
        console.log("🎯 10 seconds elapsed! Checking if ad should still show...");
        console.log("🚩 Current flag value:", currentFlag);
        
        if (currentFlag === 'true') {
          // Clear the flag to prevent duplicate ads
          sessionStorage.setItem('downloadInitiated', 'false');
          console.log("🚫 Flag cleared, showing ad now");
          
          console.log("🔄 Redirecting current page to ad...");
          console.log("🔗 Ad URL:", directLinkUrl);
          window.location.href = directLinkUrl;
        } else {
          console.log("⏭️ Flag was already cleared (likely by page refresh handler), skipping ad");
        }
      }, 10000);
      
      // Let the download proceed normally
      console.log("⬇️ Allowing download/external link to proceed normally...");
    };
    
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
    
    // Helper function to check if link is a download
    const isDownloadLink = (link) => {
      const href = link.getAttribute('href');
      
      // Has download attribute
      if (link.hasAttribute('download')) {
        return true;
      }
      
      // Check file extensions that indicate downloads
      if (href && (
        href.includes('.zip') || 
        href.includes('.rar') ||
        href.includes('.7z') ||
        href.includes('.tar') ||
        href.includes('.exe') ||
        href.includes('.msi') ||
        href.includes('.dmg') ||
        href.includes('.pkg') ||
        href.includes('.apk') ||
        href.includes('.ipa') ||
        href.includes('.deb') ||
        href.includes('.rpm') ||
        href.includes('.mp3') || 
        href.includes('.mp4') ||
        href.includes('.mkv') ||
        href.includes('.avi') ||
        href.includes('.mov') ||
        href.includes('.wmv') ||
        href.includes('.flv') ||
        href.includes('.webm') ||
        href.includes('.pdf') ||
        href.includes('.doc') ||
        href.includes('.docx') ||
        href.includes('.xls') ||
        href.includes('.xlsx') ||
        href.includes('.ppt') ||
        href.includes('.pptx') ||
        href.includes('blob:') ||
        href.includes('/download/') ||
        href.includes('?download=') ||
        href.includes('&download=')
      )) {
        return true;
      }
      
      return false;
    };
    
    // Find and attach listeners to download links
    const downloadLinks = document.querySelectorAll('a[download]');
    console.log(`🔗 Found ${downloadLinks.length} links with [download] attribute`);
    
    downloadLinks.forEach((link, index) => {
      console.log(`🔗 Download link ${index + 1}:`, link.href, link.download);
      link.addEventListener('click', handleDownloadClick);
    });
    
    // Find all links and filter for downloads and external links
    const allLinks = document.querySelectorAll('a[href]');
    console.log(`🔗 Total links found on page: ${allLinks.length}`);
    
    let externalLinks = 0;
    let downloadLikeLinks = 0;
    let internalLinks = 0;
    
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Skip if no href or already has download attribute (handled above)
      if (!href || link.hasAttribute('download')) {
        return;
      }
      
      const isInternal = isInternalLink(href);
      const isDownload = isDownloadLink(link);
      
      if (isInternal) {
        internalLinks++;
        console.log(`🏠 Internal link (ignored): ${href}`);
      } else if (isDownload) {
        downloadLikeLinks++;
        console.log(`⬇️ Adding listener to download-like link ${downloadLikeLinks}: ${href}`);
        link.addEventListener('click', handleDownloadClick);
      } else {
        externalLinks++;
        console.log(`🌐 Adding listener to external link ${externalLinks}: ${href}`);
        link.addEventListener('click', handleDownloadClick);
      }
    });
    
    console.log(`📊 Summary:`);
    console.log(`   🏠 Internal links (ignored): ${internalLinks}`);
    console.log(`   🌐 External links (monitored): ${externalLinks}`);
    console.log(`   ⬇️ Download links (monitored): ${downloadLinks.length + downloadLikeLinks}`);
    console.log(`   📊 Total monitored: ${downloadLinks.length + downloadLikeLinks + externalLinks}`);
    
    // Cleanup function
    return () => {
      downloadLinks.forEach(link => {
        link.removeEventListener('click', handleDownloadClick);
      });
      
      allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (
          href.includes('.zip') || 
          href.includes('.pdf') || 
          href.includes('.mp3') || 
          href.includes('.mp4') ||
          href.includes('.mkv') ||
          href.includes('.exe') ||
          href.includes('.dmg') ||
          href.includes('.apk') ||
          href.includes('download') ||
          href.includes('blob:')
        )) {
          link.removeEventListener('click', handleDownloadClick);
        }
      });
    };
  }, [directLinkUrl]);

  return null;
};

export default DirectLinkScript;