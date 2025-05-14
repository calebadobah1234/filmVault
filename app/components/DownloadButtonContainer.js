'use client';

import React from 'react';

/**
 * DownloadButtonContainer - Client component wrapper for download buttons
 * This component handles the tab swap behavior and renders the download buttons
 * 
 * @param {Object} props
 * @param {Array} props.downloadItems - Array of download items with href, title, quality, size, etc.
 * @param {string} props.mainDownloadUrl - Main download URL if available
 * @param {string} props.mainTitle - Main title for the download
 * @param {string} props.fileSize - File size information if available
 * @param {Array} props.episodesDataBC - Secondary server episodes data if available
 * @param {string} props.adLink - Direct ad link URL
 */
const DownloadButtonContainer = ({
  downloadItems = [],
  mainDownloadUrl = null,
  mainTitle = '',
  fileSize = '',
  episodesDataBC = [],
  adLink = "https://attendedlickhorizontally.com/jth75j6j5?key=1cc239cea6ecf5e6b20d0a992ab044c4"
}) => {
  const handleTabSwapClick = (href, downloadFileName) => (e) => {
    // Don't prevent default - allow the normal download to happen
    
    // After 10 seconds delay, do the tab swap
    setTimeout(() => {
      // Get current URL to reopen in new tab
      const currentUrl = window.location.href;
      
      // Open current page in new tab
      window.open(currentUrl, '_blank');

      // Navigate current tab to ad URL
      window.location.href = adLink;
    }, 10000);
  };

  // Filter out invalid links
  const blockedTerms = ["buy-subscription", "Duble", "Dubbed"];
  const filteredDownloadItems = downloadItems?.filter(item => 
    !blockedTerms.some(term => item.downloadLink?.includes(term))
  ) || [];
  
  const filteredEpisodesBC = episodesDataBC?.filter(item => 
    !blockedTerms.some(term => item.downloadLink?.includes(term))
  ) || [];

  return (
    <>
      {/* Main Downloads Section */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Download Links</h2>
        <div className="flex flex-wrap justify-center mt-6 gap-4">
          {/* Main download link */}
          {mainDownloadUrl && (
            <a
              href={mainDownloadUrl}
              download={`${mainTitle}.mp4`}
              className="max-md:min-w-[100%] bg-gray-800 text-white py-4 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition duration-200"
              onClick={handleTabSwapClick(mainDownloadUrl, `${mainTitle}.mp4`)}
            >
              Download {mainTitle} {fileSize ? `| ${fileSize}` : ""}
            </a>
          )}
          
          {/* Episode download links */}
          {filteredDownloadItems.map((item, index) => (
            <a
              href={item.downloadLink}
              key={index}
              download={`${mainTitle}_${item.quality}.mp4`}
              className="max-md:min-w-[100%] bg-gray-800 text-white py-4 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition duration-200"
              onClick={handleTabSwapClick(item.downloadLink, `${mainTitle}_${item.quality}.mp4`)}
            >
              {item.quality} | {item.size}
            </a>
          ))}
        </div>
      </div>

      {/* Server 2 Section */}
      {filteredEpisodesBC.length > 0 && (
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Server 99 (Fast Download)</h2>
          <div className="flex flex-wrap justify-center mt-6 gap-4">
            {filteredEpisodesBC.map((item, index) => (
              <a
                href={item.downloadLink}
                key={index}
                download={`${mainTitle}_${item.quality}.mp4`}
                className="max-md:min-w-[100%] bg-gray-700 text-white py-4 px-8 rounded-lg shadow-lg hover:bg-gray-600 transition duration-200"
                onClick={handleTabSwapClick(item.downloadLink, `${mainTitle}_${item.quality}.mp4`)}
              >
                {item.quality} | {item.size}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default DownloadButtonContainer;