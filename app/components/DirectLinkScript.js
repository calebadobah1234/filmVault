"use client";

import React, { useEffect } from 'react';

const DirectLinkScript = ({ directLinkUrl }) => {
  useEffect(() => {
    // Create a flag in sessionStorage to track if redirect has happened recently
    const hasRedirected = sessionStorage.getItem('adsterraRedirectOccurred');
    
    if (!hasRedirected) {
      // Set up click handlers for all download links
      const downloadLinks = document.querySelectorAll('a[download]');
      
      const handleDownloadClick = (e) => {
        // Only proceed if we haven't already set up a redirect
        if (!sessionStorage.getItem('adsterraRedirectOccurred')) {
          // Set flag to prevent multiple redirects in a short time period
          sessionStorage.setItem('adsterraRedirectOccurred', 'true');
          
          console.log("Download clicked, opening ad link immediately");
          
          // Open the ad link in a new tab
          const newWindow = window.open(directLinkUrl, '_blank');
          
          // Reset the flag after some time to allow future redirects
          setTimeout(() => {
            sessionStorage.removeItem('adsterraRedirectOccurred');
          }, 1 * 60 * 1000); // Reset after 1 minute
          
          // Don't prevent default - let the download proceed normally
          // The original click will continue for the download
        }
      };
      
      // Track all download links
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
          href.includes('.mkv') ||
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
  }, [directLinkUrl]);

  return null;
};

export default DirectLinkScript;