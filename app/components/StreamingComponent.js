"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaExpand, FaSpinner } from 'react-icons/fa';
import screenfull from 'screenfull';
import { FaRotate } from 'react-icons/fa6';

const EnhancedStreamingComponent = ({ sources }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [qualities, setQualities] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [streamingUrl, setStreamingUrl] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [lastPlayedTime, setLastPlayedTime] = useState(0);
  const bufferingTimeoutRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [screenOrientation, setScreenOrientation] = useState('portrait');
  const [errorMessage, setErrorMessage] = useState('');
  const abortControllerRef = useRef(null);

  

  const playerRef = useRef(null);
  const controlsRef = useRef(null);
  const containerRef = useRef(null);

  // Function to extract resolution number from quality string
  const getResolutionNumber = (quality) => {
    const match = quality.match(/(\d+)[pP]/);
    return match ? parseInt(match[1]) : 0;
  };

  const handleRotate = async () => {
    if (isFullscreen && isMobile) {
      try {
        const newOrientation = screenOrientation === 'portrait' ? 'landscape' : 'portrait';
        await requestOrientationChange(newOrientation);
      } catch (error) {
        console.error('Orientation change failed:', error);
        handleFallbackRotation();
      }
    }
  };


  const handleSeekTouchStart = (e) => {
    setSeeking(true);
  };

  useEffect(() => {
    if (!isFullscreen) {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
      setScreenOrientation('portrait');
      
      if (containerRef.current) {
        const videoWrapper = containerRef.current.querySelector('.video-wrapper');
        if (videoWrapper) {
          videoWrapper.style.transform = 'none';
          videoWrapper.style.width = '100%';
          videoWrapper.style.height = '100%';
          videoWrapper.style.position = 'relative';
          videoWrapper.style.top = 'auto';
          videoWrapper.style.left = 'auto';
        }
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleOrientationChange = () => {
      if (screen.orientation) {
        setScreenOrientation(screen.orientation.type.includes('landscape') ? 'landscape' : 'portrait');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('orientationchange', handleOrientationChange);
      screen.orientation?.addEventListener('change', handleOrientationChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('orientationchange', handleOrientationChange);
        screen.orientation?.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  const videoContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transition: 'transform 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const handleSeekTouchMove = (e) => {
    const input = e.target;
    const touch = e.touches[0];
    const rect = input.getBoundingClientRect();
    const position = (touch.clientX - rect.left) / rect.width;
    const clampedPosition = Math.max(0, Math.min(1, position));
    setPlayed(clampedPosition);
  };

  const handleSeekTouchEnd = (e) => {
    setSeeking(false);
    playerRef.current?.seekTo(played);
    showControlsWithTimeout();
  };

  const requestOrientationChange = async (orientation) => {
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock(orientation);
        setScreenOrientation(orientation);
      } else if (screen.lockOrientation) {
        screen.lockOrientation(orientation);
        setScreenOrientation(orientation);
      } else if (screen.webkitLockOrientation) {
        screen.webkitLockOrientation(orientation);
        setScreenOrientation(orientation);
      } else if (screen.mozLockOrientation) {
        screen.mozLockOrientation(orientation);
        setScreenOrientation(orientation);
      } else if (screen.msLockOrientation) {
        screen.msLockOrientation(orientation);
        setScreenOrientation(orientation);
      }
    } catch (error) {
      console.error('Failed to change orientation:', error);
      // Fallback to CSS transform if orientation lock fails
      handleFallbackRotation();
    }
  };
  const handleVideoClick = (e) => {
    // Prevent click from triggering if user was dragging/seeking
    if (seeking) return;
    
    // Don't trigger if click was on a control element
    if (controlsRef.current && controlsRef.current.contains(e.target)) return;
    
    handlePlayPause();
  };

  

  const handleFallbackRotation = () => {
    if (containerRef.current) {
      const videoWrapper = containerRef.current.querySelector('.video-wrapper');
      
      if (videoWrapper) {
        if (screenOrientation === 'portrait') {
          // Rotating to landscape
          videoWrapper.style.transform = 'rotate(90deg)';
          videoWrapper.style.width = '100vh';
          videoWrapper.style.height = '100vw';
          videoWrapper.style.position = 'absolute';
          videoWrapper.style.top = '50%';
          videoWrapper.style.left = '50%';
          videoWrapper.style.transformOrigin = '0 0';
          videoWrapper.style.margin = '0';
          setScreenOrientation('landscape');
        } else {
          // Rotating back to portrait
          videoWrapper.style.transform = 'none';
          videoWrapper.style.width = '100%';
          videoWrapper.style.height = '100%';
          videoWrapper.style.position = 'relative';
          videoWrapper.style.top = 'auto';
          videoWrapper.style.left = 'auto';
          videoWrapper.style.margin = 'auto';
          setScreenOrientation('portrait');
        }
      }
    }
  };



  // Function to check if file exists in Wasabi using a range request
  const checkFileExists = async (filename) => {
    const url = `https://filmvault.b-cdn.net/${filename}`;
    console.log('Checking file existence for:', url);
    
    try {
      // Using fetch with regular cors mode first
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      // If we get here, we can check the status
      console.log('Response status:', response.status);
      return response.status === 200;
    } catch (corsError) {
      console.log('CORS request failed, trying alternative check');
      
      // Fallback to checking with regular GET request
      try {
        const response = await fetch(url, {
          method: 'GET',
          cache: 'no-cache'
        });
        
        return response.status === 200;
      } catch (error) {
        console.error('Error checking file:', {
          message: error.message,
          name: error.name
        });
        return false;
      }
    }
  };

  const sanitizeFilename = (filename) => {
    // First decode any existing encoded characters to avoid double encoding
    const decodedFilename = decodeURIComponent(filename);
    
    // Now properly encode the filename while preserving square brackets
    return encodeURIComponent(decodedFilename)
      .replace(/%5B/g, '[')  // Only replace %5B with [
      .replace(/%5D/g, ']')  // Only replace %5D with ]
      .replace(/%20/g, '.'); // Replace spaces with dots if needed
  };

  // Function to process video through backend
  const processVideo = async (url, signal) => {
    try {
      console.log("Starting video processing for URL:", url);
      setProcessingStatus('checking');
      setStreamingUrl(null);
      setErrorMessage('');
  
      if (!url) {
        throw new Error('No URL provided for processing');
      }
  
      const originalFilename = url.split('/').pop() || 'video';
      const sanitizedFilename = sanitizeFilename(originalFilename);
  
      // First check if file exists in CDN
      try {
        const initialFileCheck = await checkFileExists(sanitizedFilename);
        if (initialFileCheck) {
          console.log("File already exists in Bunny CDN");
          const cdnUrl = `https://filmvault.b-cdn.net/${sanitizedFilename}`;
          setStreamingUrl(cdnUrl);
          setProcessingStatus('ready');
          return;
        }
      } catch (cdnError) {
        console.log("Initial CDN check failed, proceeding with download:", cdnError);
      }
  
      console.log("File not found in CDN, proceeding with download");
      setProcessingStatus('downloading');
  
      const encodedUrl = encodeURIComponent(url);
      const encodedFilename = encodeURIComponent(originalFilename);
      const apiUrl = `https://api4.mp3vault.xyz/download?url=${encodedUrl}&filename=${encodedFilename}`;
  
      // Setup abort controller with timeout
      const requestController = new AbortController();
      const timeoutId = setTimeout(() => {
        requestController.abort();
        console.log("API request timed out");
      }, 240000); // 2 minute timeout
  
      let downloadResponse;
      try {
        downloadResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: requestController.signal
        });
        clearTimeout(timeoutId);
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Server response timed out. Please try again.');
        }
        throw new Error(`Network error: ${error.message}`);
      }
  
      if (!downloadResponse.ok) {
        const errorText = await downloadResponse.text();
        throw new Error(`Server error (${downloadResponse.status}): ${errorText}`);
      }
  
      const responseData = await downloadResponse.json();
      console.log("Download response:", responseData);
  
      if (!responseData.wasabi_url) {
        throw new Error('No valid Streaming URL received from server');
      }
  
      // Parse object key from Wasabi URL
      let objectKey;
      try {
        const wasabiUrl = new URL(responseData.wasabi_url);
        const pathParts = wasabiUrl.pathname.split('/');
        const bucketIndex = pathParts.findIndex(part => part === 'filmvault.xyz');
        objectKey = bucketIndex !== -1 && bucketIndex + 1 < pathParts.length
          ? pathParts.slice(bucketIndex + 1).join('/')
          : sanitizedFilename;
        objectKey = sanitizeFilename(objectKey);
      } catch (error) {
        console.error('Error parsing Wasabi URL:', error);
        objectKey = sanitizedFilename;
      }
  
      const cdnUrl = `https://filmvault.b-cdn.net/${objectKey}`;
      console.log("Generated CDN URL:", cdnUrl);
  
      // Wait for file to be available in CDN with retries
      let retryCount = 0;
      const maxRetries = 10;
      const retryDelay = 3000; // 3 seconds
      let fileAvailable = false;
  
      while (retryCount < maxRetries && !fileAvailable) {
        try {
          console.log(`CDN availability check attempt ${retryCount + 1}/${maxRetries}`);
          fileAvailable = await checkFileExists(objectKey);
          
          if (!fileAvailable) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            retryCount++;
          }
        } catch (checkError) {
          console.log(`CDN check failed attempt ${retryCount + 1}:`, checkError);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryCount++;
        }
      }
  
      if (!fileAvailable) {
        throw new Error('Content is taking longer than usual to prepare. Please try again in a few minutes.');
      }
  
      console.log("File confirmed available in CDN");
      setStreamingUrl(cdnUrl);
      setProcessingStatus('ready');
  
    } catch (error) {
      console.error('Video processing error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      setProcessingStatus('error');
      setErrorMessage(error.message || 'Failed to process video');
      
      // Auto-retry for specific errors
      if (error.message.includes('timed out') || error.message.includes('try again')) {
        setTimeout(() => {
          setProcessingStatus('checking');
          processVideo(url, signal);
        }, 5000);
      }
    }
  };

  const handleRetry = async () => {
    if (selectedQuality && sources?.length > 0) {
      const source = sources.find(s => {
        const resolution = getResolutionNumber(s.quality);
        return resolution.toString() === selectedQuality;
      });

      if (source?.downloadLink) {
        if (source.downloadLink.includes('dl4.sermovie')) {
          setProcessingStatus('blocked');
          setErrorMessage('Video will soon be available for streaming');
          return;
        }
        await processVideo(source.downloadLink);
      }
    }
  };

  // Initialize qualities on component mount
  useEffect(() => {
    if (sources && sources.length > 0) {
      const availableQualities = Array.from(new Set(
        sources.map(source => {
          const resolution = getResolutionNumber(source.quality);
          return resolution ? resolution.toString() : null;
        }).filter(Boolean)
      )).sort((a, b) => parseInt(a) - parseInt(b));

      console.log("Available qualities:", availableQualities);
      setQualities(availableQualities);

      if (availableQualities.length > 0) {
        const initialQuality = availableQualities[0];
        console.log("Setting initial quality:", initialQuality);
        setSelectedQuality(initialQuality);
      }
    }
  }, [sources]);

  // Process video when quality is selected
  useEffect(() => {
    const processSelectedQuality = async () => {
      if (selectedQuality && sources?.length > 0) {
        const source = sources.find(s => {
          const resolution = getResolutionNumber(s.quality);
          return resolution.toString() === selectedQuality;
        });

        if (source?.downloadLink) {
          // Check if URL contains dl4.sermovie
          if (source.downloadLink.includes('dl4.sermovie')) {
            setProcessingStatus('blocked');
            setErrorMessage('Video will soon be available for streaming');
            return;
          }
          
          console.log("Found source URL:", source.downloadLink);
          await processVideo(source.downloadLink);
        }
      }
    };

    processSelectedQuality();
  }, [selectedQuality, sources]);

  // Handle fullscreen
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(screenfull.isFullscreen);
      if (screenfull.isFullscreen) setShowControls(true);
    };

    if (screenfull.isEnabled) {
      screenfull.on('change', handler);
    }
    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handler);
      }
    };
  }, []);

  // Controls visibility
  const hideControls = useCallback(() => {
    // Only hide controls if we're not seeking or buffering
    if (!seeking && !isBuffering) {
      setShowControls(false);
    }
  }, [seeking, isBuffering]);

  const showControlsWithTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    
    // Always hide controls after timeout, even in fullscreen
    setControlsTimeout(setTimeout(hideControls, 3000));
  }, [controlsTimeout]);

  // Add an onReady handler to ReactPlayer
  const handlePlayerReady = () => {
    setIsPlayerReady(true);
    setIsBuffering(false);
  };

  const handleBuffer = () => {
    if (isPlayerReady) {
      setIsBuffering(true);
    }
  };

  const handleBufferEnd = () => {
    setIsBuffering(false);
  };
  // Player event handlers
  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
      setCurrentTime(state.playedSeconds);
      
      // Clear any existing buffering timeout
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
      }

      // Check if playback is actually progressing
      if (state.playedSeconds !== lastPlayedTime) {
        setIsBuffering(false);
        setLastPlayedTime(state.playedSeconds);
      } else if (playing && isPlayerReady) {
        // If playback time hasn't changed but video should be playing,
        // wait a short delay before showing buffer indicator
        bufferingTimeoutRef.current = setTimeout(() => {
          setIsBuffering(true);
        }, 500);
      }
    }
  };

  const handlePlayPause = () => {
    if (!hasStarted) setHasStarted(true);
    setPlaying(!playing);
    showControlsWithTimeout();
  };

  const handleError = () => {
    setIsBuffering(false);
    setIsPlayerReady(false);
  };

  useEffect(() => {
    return () => {
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
    showControlsWithTimeout();
  };

  const handleSeekMouseDown = () => setSeeking(true);

  const handleSeekChange = (e) => setPlayed(parseFloat(e.target.value));

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    playerRef.current?.seekTo(parseFloat(e.target.value));
    showControlsWithTimeout();
  };

  const handleFullscreen = () => {
    if (screenfull.isEnabled && containerRef.current) {
      screenfull.toggle(containerRef.current);
      showControlsWithTimeout();
    }
  };

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return hh ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  return (
    <div
      ref={containerRef}
      className="bg-gray-900 rounded-xl overflow-hidden shadow-xl relative group"
      onMouseMove={showControlsWithTimeout}
      onMouseLeave={() => !isFullscreen && hideControls()}
    >
      <div className={`relative flex items-center justify-center ${isFullscreen ? 'h-screen w-screen' : 'aspect-video'}`}>
        {/* Blocked status display */}
        {processingStatus === 'blocked' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="text-white text-lg text-center p-4">
              Video will soon be available for streaming
            </div>
          </div>
        )}
  
        {/* Downloading status display */}
        {processingStatus === 'downloading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <FaSpinner className="animate-spin text-white text-4xl mb-4" />
            <span className="text-white">Processing video...</span>
          </div>
        )}
  
        {/* Ready status display */}
        {processingStatus === 'ready' && streamingUrl && (
          <>
            {!hasStarted && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <button
                  onClick={handlePlayPause}
                  className="text-white text-4xl hover:scale-110 transition-transform"
                >
                  <FaPlay />
                </button>
              </div>
            )}
            <div 
              className={`video-wrapper ${isFullscreen ? 'w-full h-full' : 'w-full h-full'}`}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease'
              }}
            >
              <ReactPlayer
                ref={playerRef}
                url={streamingUrl}
                playing={playing}
                volume={volume}
                width="100%"
                height="100%"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  margin: 'auto',
                  objectFit: 'contain',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                className={`react-player ${isFullscreen ? 'fullscreen' : ''}`}
                onProgress={handleProgress}
                onClick={handleVideoClick}
                onDuration={setDuration}
                onBuffer={handleBuffer}
                onBufferEnd={handleBufferEnd}
                onReady={handlePlayerReady}
                onError={(err) => {
                  console.error('ReactPlayer error:', err);
                  handleError();
                }}
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                      crossOrigin: 'anonymous',
                      style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }
                    },
                    forceVideo: true,
                    hlsOptions: {
                      maxBufferSize: 600 * 1024 * 1024,
                      maxBufferLength: 600,
                      startPosition: -1,
                      debug: true,
                      backBufferLength: 300,
                      liveSyncDurationCount: 10,
                      maxMaxBufferLength: 600,
                      maxLoadingDelay: 4,
                      manifestLoadingTimeOut: 20000,
                      manifestLoadingMaxRetry: 5,
                      fragLoadingTimeOut: 30000,
                      fragLoadingMaxRetry: 5,
                      levelLoadingTimeOut: 20000,
                      levelLoadingMaxRetry: 5,
                      abrEwmaDefaultEstimate: 5000000,
                      abrBandWidthFactor: 0.95,
                      abrBandWidthUpFactor: 0.7,
                      abrMaxWithRealBitrate: true,
                    }
                  }
                }}
              />
            </div>
          </>
        )}
  
        {/* Buffering indicator */}
        {isBuffering && isPlayerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <FaSpinner className="animate-spin text-white text-4xl" />
          </div>
        )}
  
        {/* Error status display */}
        {processingStatus === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4">
            <div className="text-red-500 mb-4 text-center">
              Error: {errorMessage}
            </div>
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaRotate className="mr-2" />
              Retry
            </button>
          </div>
        )}
  
        {/* Controls */}
        <div
          ref={controlsRef}
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              onTouchStart={handleSeekTouchStart}
              onTouchMove={handleSeekTouchMove}
              onTouchEnd={handleSeekTouchEnd}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
  
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-gray-300 transition"
              >
                {playing ? <FaPause size={20} /> : <FaPlay size={20} />}
              </button>
  
              <div className="text-gray-400 text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
  
            <div className="flex items-center space-x-4">
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded-md"
              >
                {qualities.map(quality => (
                  <option key={quality} value={quality}>
                    {quality}p
                  </option>
                ))}
              </select>
  
              {isMobile && isFullscreen && (
                <button
                  onClick={handleRotate}
                  className="text-white hover:text-gray-300 transition"
                  aria-label="Rotate screen"
                >
                  <FaRotate size={20} />
                </button>
              )}
  
              <button
                onClick={handleFullscreen}
                className="text-white hover:text-gray-300 transition"
              >
                <FaExpand size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStreamingComponent;