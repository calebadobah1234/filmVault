"use client";

import React, { useEffect, useState } from 'react';

const DirectLinkScript = ({ directLinkUrl }) => {
  const [adLinkReady, setAdLinkReady] = useState(false);
  
  useEffect(() => {
    // Create a flag in sessionStorage to track if redirect has happened on this page
    const hasRedirected = sessionStorage.getItem('adsterraRedirectOccurred');
    
    if (!hasRedirected) {
      // Set up click handlers for all download links
      const downloadLinks = document.querySelectorAll('a[download]');
      
      const handleDownloadClick = () => {
        // Only proceed if we haven't already set up a redirect
        if (!sessionStorage.getItem('adsterraRedirectOccurred')) {
          // Set flag to prevent multiple redirects
          sessionStorage.setItem('adsterraRedirectOccurred', 'true');
          
          // Set state to render the link after timeout
          console.log("Download clicked, waiting 10 seconds...");
          setTimeout(() => {
            console.log("10 seconds passed, setting adLinkReady to true");
            setAdLinkReady(true);
          }, 10000); // 10 seconds
          
          // Reset the flag after some time to allow future redirects
          setTimeout(() => {
            sessionStorage.removeItem('adsterraRedirectOccurred');
          }, 30 * 60 * 1000); // 30 minutes
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

  // When the ad is ready to show, we create an invisible link and click it
  useEffect(() => {
    if (adLinkReady) {
      console.log("adLinkReady is true, creating and clicking link");
      const clickElement = document.createElement('a');
      clickElement.href = directLinkUrl;
      clickElement.target = '_blank';
      clickElement.rel = 'noopener noreferrer';
      clickElement.style.display = 'none';
      document.body.appendChild(clickElement);
      
      // This simulates a user click, which browsers allow
      clickElement.click();
      
      // Clean up the element
      document.body.removeChild(clickElement);
      
      // Reset state
      setAdLinkReady(false);
    }
  }, [adLinkReady, directLinkUrl]);

  return null;
};

export default DirectLinkScript;