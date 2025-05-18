"use client";

import React, { useEffect } from 'react';

const DirectLinkScript = ({ directLinkUrl }) => {
  useEffect(() => {
    // Create a flag in sessionStorage to track if redirect has happened on this page
    const hasRedirected = sessionStorage.getItem('adsterraRedirectOccurred');
    
    if (!hasRedirected) {
      // Function to create and open the pop-under ad
      const createPopUnder = () => {
        // First focus the current window (main window)
        window.focus();
        
        // Create the popup window with minimal features - this will be our pop-under
        const adWindow = window.open(
          directLinkUrl,
          '_blank',
          'width=1,height=1,left=200,top=200,menubar=0,toolbar=0,location=0,status=0'
        );
        
        // If popup was successfully created
        if (adWindow) {
          // Move it behind the current window
          adWindow.blur();
          window.focus();
          
          // Resize it to full size after it's behind the main window
          setTimeout(() => {
            if (!adWindow.closed) {
              adWindow.resizeTo(screen.availWidth, screen.availHeight);
            }
          }, 500);
        }
        
        // Set flag to prevent multiple pop-unders
        sessionStorage.setItem('adsterraRedirectOccurred', 'true');
        
        // Reset the flag after 30 minutes to allow future pop-unders
        setTimeout(() => {
          sessionStorage.removeItem('adsterraRedirectOccurred');
        }, 0 * 60 * 1000);
      };
      
      // Delayed pop-under function - wait 10 seconds then show ad
      const delayedPopUnder = () => {
        setTimeout(() => {
          createPopUnder();
        }, 10000); // 10 seconds
      };
      
      // Set up click handlers for all download links
      const downloadLinks = document.querySelectorAll('a[download]');
      
      const handleDownloadClick = (e) => {
        // Only proceed if we haven't already set up a redirect
        if (!sessionStorage.getItem('adsterraRedirectOccurred')) {
          // Important: Don't prevent default behavior
          // Let the download start or new tab open normally
          
          // Initialize the delayed pop-under
          delayedPopUnder();
        }
      };
      
      // Track all download links, including those that might open in new tabs
      downloadLinks.forEach(link => {
        link.addEventListener('click', handleDownloadClick);
      });
      
      // Also handle non-download links that might trigger downloads via JS
      const allLinks = document.querySelectorAll('a:not([download])');
      allLinks.forEach(link => {
        // Check if link has href that likely points to downloadable content
        const href = link.getAttribute('href');
        if (href && (
          href.includes('.zip') || 
          href.includes('.pdf') || 
          href.includes('.mp3') || 
          href.includes('.mp4') ||
          href.includes('download') ||
          href.includes('blob:')
        )) {
          link.addEventListener('click', handleDownloadClick);
        }
      });
      
      // Clean up function to remove event listeners
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
            href.includes('download') ||
            href.includes('blob:')
          )) {
            link.removeEventListener('click', handleDownloadClick);
          }
        });
      };
    }
  }, [directLinkUrl]); // Don't forget the dependency array and closing bracket for useEffect

  return null;
};

export default DirectLinkScript;