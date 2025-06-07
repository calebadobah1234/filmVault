"use client";

import React, { useState } from 'react';
import { Download, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ComicDownloadButton = ({ 
  comicId, 
  chapterNumber = null, 
  comicTitle, 
  isComplete = false,
  className = "",
  children 
}) => {
  const [downloadState, setDownloadState] = useState('idle'); // idle, generating, downloading, complete, error
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const generatePDF = async () => {
    try {
      const endpoint = isComplete 
        ? `https://izd7iug376rxb6q42x3hfipzle0trkau.lambda-url.us-east-1.on.aws/download-comic-pdf/${comicId}`
        : `https://izd7iug376rxb6q42x3hfipzle0trkau.lambda-url.us-east-1.on.aws/download-chapter-pdf/${comicId}/${chapterNumber}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate PDF: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.downloadUrl) {
        throw new Error(data.message || 'Failed to generate PDF');
      }
      
      return data;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadState('generating');
      setErrorMessage('');
      setProgress(0);

      // Show progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Generate PDF and get download URL
      const pdfData = await generatePDF();
      
      clearInterval(progressInterval);
      setProgress(100);
      setDownloadUrl(pdfData.downloadUrl);
      
      // Start download
      setDownloadState('downloading');
      
      // Small delay to show completion state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      initiateDownload(pdfData.downloadUrl, pdfData.filename);
      
    } catch (error) {
      console.error('Download error:', error);
      setDownloadState('error');
      setErrorMessage(error.message);
    }
  };

  const initiateDownload = (url, filename) => {
    // Use the provided filename or create a fallback
    const downloadFilename = filename || (isComplete 
      ? `${comicTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Complete.pdf`
      : `${comicTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Chapter_${chapterNumber}.pdf`);

    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFilename;
    // Removed target="_blank" and rel attributes to prevent popup blocking
    
    // Some browsers require the link to be in the DOM
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Set to complete state briefly, then back to idle
    setDownloadState('complete');
    setTimeout(() => {
      setDownloadState('idle');
      setProgress(0);
      setDownloadUrl('');
    }, 2000);
  };

  const resetDownload = () => {
    setDownloadState('idle');
    setProgress(0);
    setErrorMessage('');
    setDownloadUrl('');
  };

  const getButtonContent = () => {
    switch (downloadState) {
      case 'generating':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating PDF... {Math.round(progress)}%
          </>
        );
      case 'downloading':
        return (
          <>
            <Download className="w-4 h-4 mr-2" />
            Starting Download...
          </>
        );
      case 'complete':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Download Started!
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Try Again
          </>
        );
      default:
        return children || (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </>
        );
    }
  };

  const getButtonClass = () => {
    const baseClass = `inline-flex items-center justify-center px-4 py-2 rounded-lg shadow transition-all duration-200 ${className}`;
    
    switch (downloadState) {
      case 'generating':
        return `${baseClass} bg-yellow-600 text-white cursor-wait`;
      case 'downloading':
        return `${baseClass} bg-blue-600 text-white cursor-wait`;
      case 'complete':
        return `${baseClass} bg-green-600 text-white`;
      case 'error':
        return `${baseClass} bg-red-600 text-white hover:bg-red-700`;
      default:
        return `${baseClass} bg-red-600 text-white hover:bg-red-700 hover:scale-105`;
    }
  };

  const isDisabled = ['generating', 'downloading', 'complete'].includes(downloadState);

  return (
    <div className="flex flex-col">
      <button
        onClick={downloadState === 'error' ? resetDownload : handleDownload}
        disabled={isDisabled}
        className={getButtonClass()}
      >
        {getButtonContent()}
      </button>
      
      {/* Progress bar for generating state */}
      {downloadState === 'generating' && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Error message */}
      {downloadState === 'error' && errorMessage && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {errorMessage}
        </div>
      )}
      
      {/* Status message for generating */}
      {downloadState === 'generating' && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          Generating your PDF. This may take a moment...
        </div>
      )}
      
      {/* Success message with download link as backup */}
      {downloadState === 'complete' && downloadUrl && (
        <div className="mt-2 text-sm text-green-600 text-center">
          Download started! If it doesn&apos;t start automatically, 
          <a 
            href={downloadUrl} 
            download
            className="ml-1 underline hover:text-green-800"
          >
            click here
          </a>
        </div>
      )}
    </div>
  );
};

// Export the ComicDownloadButton for use in other components
export { ComicDownloadButton };
export default ComicDownloadButton;