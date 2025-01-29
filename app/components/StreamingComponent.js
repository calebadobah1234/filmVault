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
        if (screenOrientation === 'portrait') {
          await requestOrientationChange('landscape');
        } else {
          await requestOrientationChange('portrait');
        }
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
      const container = containerRef.current;
      const videoWrapper = container.querySelector('.video-wrapper');
      
      if (videoWrapper) {
        const currentRotation = getComputedStyle(videoWrapper).transform;
        const newRotation = currentRotation === 'none' ? 90 : 0;
        
        if (newRotation === 90) {
          videoWrapper.style.transform = 'rotate(90deg)';
          videoWrapper.style.width = '100vh';
          videoWrapper.style.height = '100vw';
          videoWrapper.style.position = 'fixed';
          videoWrapper.style.top = '50%';
          videoWrapper.style.left = '50%';
          videoWrapper.style.transform = 'rotate(90deg) translate(-50%, -50%)';
          videoWrapper.style.transformOrigin = 'center';
        } else {
          videoWrapper.style.transform = 'none';
          videoWrapper.style.width = '100%';
          videoWrapper.style.height = '100%';
          videoWrapper.style.position = 'relative';
          videoWrapper.style.top = 'auto';
          videoWrapper.style.left = 'auto';
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
    return encodeURIComponent(filename)
      .replace(/%5B/g, '[')
      .replace(/%5D/g, ']')
      .replace(/%20/g, '.')
      .replace(/%2E/g, '.');
  };

  // Function to process video through backend
  const processVideo = async (url) => {
    try {
      console.log("Starting video processing for URL:", url);
      setProcessingStatus('checking');
      setStreamingUrl(null);
  
      if (!url) {
        throw new Error('No URL provided for processing');
      }
  
      const originalFilename = url.split('/').pop() || 'video';
      const sanitizedFilename = sanitizeFilename(originalFilename);
  
      // First check if file exists
      const initialFileCheck = await checkFileExists(sanitizedFilename);
  
      if (initialFileCheck) {
        console.log("File already exists in Bunny CDN");
        const cdnUrl = `https://filmvault.b-cdn.net/${sanitizedFilename}`;
        setStreamingUrl(cdnUrl);
        setProcessingStatus('ready');
        return;
      }
  
      console.log("File not found in CDN, proceeding with download");
      setProcessingStatus('downloading');
  
      const encodedUrl = encodeURIComponent(url);
      const encodedFilename = encodeURIComponent(originalFilename);
      const apiUrl = `https://api4.mp3vault.xyz/download?url=${encodedUrl}&filename=${encodedFilename}`;
  
      const downloadResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
  
      if (!downloadResponse.ok) {
        const errorText = await downloadResponse.text();
        throw new Error(`Download failed with status ${downloadResponse.status}: ${errorText}`);
      }
  
      const responseData = await downloadResponse.json();
      console.log("Download response:", responseData);
  
      if (!responseData.wasabi_url) {
        throw new Error('No Wasabi URL received in response');
      }
  
      // Generate CDN URL from Wasabi URL
      let objectKey;
      try {
        const wasabiUrl = new URL(responseData.wasabi_url);
        const pathParts = wasabiUrl.pathname.split('/');
        const bucketIndex = pathParts.findIndex(part => part === 'filmvault.xyz');
        if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
          const rawFilename = pathParts.slice(bucketIndex + 1).join('/');
          objectKey = sanitizeFilename(rawFilename);
        } else {
          objectKey = sanitizedFilename;
        }
      } catch (error) {
        console.error('Error parsing Wasabi URL:', error);
        objectKey = sanitizedFilename;
      }
  
      const cdnUrl = `https://filmvault.b-cdn.net/${objectKey}`;
      console.log("Generated CDN URL:", cdnUrl);
  
      // Wait for file to be available in CDN
      let retryCount = 0;
      const maxRetries = 5;
      const retryDelay = 2000; // 2 seconds
  
      const waitForFile = async () => {
        while (retryCount < maxRetries) {
          const fileExists = await checkFileExists(objectKey);
          if (fileExists) {
            console.log("File confirmed available in CDN");
            setStreamingUrl(cdnUrl);
            setProcessingStatus('ready');
            return true;
          }
          console.log(`File not yet available in CDN, retry ${retryCount + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryCount++;
        }
        return false;
      };
  
      const fileAvailable = await waitForFile();
      if (!fileAvailable) {
        throw new Error('File not available in CDN after maximum retries');
      }
  
    } catch (error) {
      console.error('Video processing error:', error);
      setProcessingStatus('error');
      alert(`Error processing video: ${error.message}`);
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
        console.log("Processing quality:", selectedQuality);
        const source = sources.find(s => {
          const resolution = getResolutionNumber(s.quality);
          return resolution.toString() === selectedQuality;
        });

        if (source?.downloadLink) {
          console.log("Found source URL:", source.downloadLink);
          await processVideo(source.downloadLink);
        } else {
          console.error("No download URL found for selected quality:", selectedQuality);
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
      <div className={`relative ${isFullscreen ? 'h-screen flex items-center justify-center' : 'aspect-video'}`}>
        {processingStatus === 'downloading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <FaSpinner className="animate-spin text-white text-4xl mb-4" />
            <span className="text-white">Processing video...</span>
          </div>
        )}

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
            <div className={`video-wrapper ${isFullscreen ? 'w-full h-full flex items-center justify-center' : ''}`}>
              <ReactPlayer
  ref={playerRef}
  url={streamingUrl}
  playing={playing}
  volume={volume}
  width={isFullscreen ? 'auto' : '100%'}
  height={isFullscreen ? '100%' : '100%'}
  className={`${isFullscreen ? 'max-w-full max-h-full m-auto' : 'absolute top-0 left-0'}`}
  style={{
    margin: isFullscreen ? 'auto' : undefined,
    maxHeight: isFullscreen ? '100vh' : undefined,
    display: isFullscreen ? 'block' : undefined
  }}
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
        crossOrigin: 'anonymous' // Ensure CORS headers are set correctly
      },
      forceVideo: true,
      hlsOptions: {
        maxBufferSize: 600 * 1024 * 1024,
        maxBufferLength: 600,
        startPosition: -1,
        debug: true, // Enable debugging for HLS
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
/></div>
          </>
        )}

{isBuffering && isPlayerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <FaSpinner className="animate-spin text-white text-4xl" />
          </div>
        )}
      </div>

      <div
        ref={controlsRef}
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
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

            {isMobile && isFullscreen && (
            <button
              onClick={handleRotate}
              className="text-white hover:text-gray-300 transition"
              aria-label="Rotate screen"
            >
              <FaRotate size={20} />
            </button>
          )}

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
  );
};

export default EnhancedStreamingComponent;