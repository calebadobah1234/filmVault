"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaExpand, FaSpinner } from 'react-icons/fa';
import screenfull from 'screenfull';
import { FaRotate } from 'react-icons/fa6';

const EnhancedStreamingComponent = ({ sources }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
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
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxRetries = 3;
  const retryDelay = 2000;
  const processingTimeoutRef = useRef(null);
  const activeRequestRef = useRef(null);
  const [videoMetadataLoaded, setVideoMetadataLoaded] = useState(false);
  

  

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
    return () => {
      cancelActiveRequest();
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

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
  const checkFileExists = async (filename, signal) => {
    const encodedFilename = sanitizeFilename(filename);
    const url = `https://filmvault.b-cdn.net/${encodedFilename}`;
    
    console.log('Checking existence with URL:', url);
    console.log('URL components:', {
      protocol: url.split('://')[0],
      domain: url.split('://')[1].split('/')[0],
      path: '/' + url.split('://')[1].split('/').slice(1).join('/')
    });
    
    try {
      // Try HEAD request first
      const headResponse = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: signal
      });
      
      console.log('HEAD request status:', headResponse.status);
      console.log('HEAD request headers:', Object.fromEntries(headResponse.headers.entries()));
      
      if (headResponse.status === 200) {
        return true;
      }
      
      // If HEAD fails, try GET
      const getResponse = await fetch(url, {
        method: 'GET',
        cache: 'no-cache',
        signal: signal
      });
      
      console.log('GET request status:', getResponse.status);
      console.log('GET request headers:', Object.fromEntries(getResponse.headers.entries()));
      
      return getResponse.status === 200;
      
    } catch (error) {
      console.error('File check error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'AbortError') {
        throw new Error('Request aborted');
      }
      throw error;
    }
  };

  const cancelActiveRequest = () => {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
    }
  };

  const sanitizeFilename = (filename) => {
    console.log('Original filename:', filename);
    
    // Check if the filename already contains encoded brackets
    const hasEncodedBrackets = filename.includes('%5B') || filename.includes('%5D');
    
    // First decode only if there are no encoded brackets
    const decodedFilename = hasEncodedBrackets ? filename : decodeURIComponent(filename);
    console.log('Decoded filename:', decodedFilename);
    
    // Remove any existing URL encoding (except for brackets if they're already encoded)
    const cleanFilename = hasEncodedBrackets ? 
      decodedFilename : 
      decodedFilename
        .replace(/%5B/g, '[')
        .replace(/%5D/g, ']')
        .replace(/%20/g, ' ');
    console.log('Cleaned filename:', cleanFilename);
    
    // If brackets are already encoded, keep them as is
    // If not, encode them as %5B and %5D
    const encodedFilename = hasEncodedBrackets ?
      cleanFilename :
      cleanFilename
        .replace(/\[/g, '%5B')
        .replace(/\]/g, '%5D')
        .replace(/ /g, '.');
    
    // Encode the rest of the string, but preserve our encoded brackets
    const finalEncodedFilename = encodedFilename
      .replace(/[^A-Za-z0-9%._-]/g, char => encodeURIComponent(char));
    
    console.log('Final encoded filename:', finalEncodedFilename);
    
    return finalEncodedFilename;
  };

  // Function to process video through backend
  const processVideo = async (url, signal) => {
    try {
      console.log('Processing video with URL:', url);
      console.log('URL parts:', {
        base: url.split('?')[0],
        query: url.split('?')[1] || 'none'
      });
      
      setProcessingStatus('checking');
      setErrorMessage('');
      
      if (!url) {
        throw new Error('No URL provided for processing');
      }
  
      const originalFilename = url.split('/').pop() || 'video';
      console.log('Extracted original filename:', originalFilename);
      
      const sanitizedFilename = sanitizeFilename(originalFilename);
      console.log('Sanitized filename:', sanitizedFilename);
  
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
  
      processingTimeoutRef.current = setTimeout(() => {
        setProcessingStatus('error');
        setErrorMessage('Processing timed out. Please try again.');
      }, 240000);
  
      // Initial file check with detailed logging
      try {
        console.log('Performing initial file check...');
        const initialFileCheck = await checkFileExists(originalFilename, signal);
        console.log('Initial file check result:', initialFileCheck);
        
        if (initialFileCheck) {
          const cdnUrl = `https://filmvault.b-cdn.net/${sanitizedFilename}`;
          console.log('File found, setting CDN URL:', cdnUrl);
          setStreamingUrl(cdnUrl);
          setProcessingStatus('ready');
          return;
        }
      } catch (cdnError) {
        console.error('Initial CDN check error:', cdnError);
        if (cdnError.message === 'Request aborted') {
          throw cdnError;
        }
      }
  
      console.log('Initiating download process...');
      setProcessingStatus('downloading');
  
      const encodedUrl = encodeURIComponent(url);
      const encodedFilename = encodeURIComponent(originalFilename);
      const apiUrl = `https://api4.mp3vault.xyz/download?url=${encodedUrl}&filename=${encodedFilename}`;
      
      console.log('Download API URL:', apiUrl);
  
      // Initiate download
      fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }).then(response => {
        console.log('Download initiation response:', response.status);
        return response.json();
      }).then(data => {
        console.log('Download initiation data:', data);
      }).catch(error => {
        console.error('Download initiation error:', error);
      });
  
      // File checking loop
      const checkInterval = 5000;
      const maxAttempts = Math.floor(240000 / checkInterval);
      let attempts = 0;
  
      const checkForFile = async () => {
        while (attempts < maxAttempts) {
          try {
            console.log(`File check attempt ${attempts + 1}/${maxAttempts}`);
            const fileExists = await checkFileExists(originalFilename, signal);
            console.log(`File check result for attempt ${attempts + 1}:`, fileExists);
            
            if (fileExists) {
              const cdnUrl = `https://filmvault.b-cdn.net/${sanitizedFilename}`;
              console.log('File found, setting final CDN URL:', cdnUrl);
              setStreamingUrl(cdnUrl);
              setProcessingStatus('ready');
              setRetryCount(0);
              setIsRetrying(false);
              return true;
            }
          } catch (error) {
            console.error(`Error in check attempt ${attempts + 1}:`, error);
            if (error.message === 'Request aborted') {
              throw error;
            }
          }
  
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, checkInterval));
          }
        }
        return false;
      };
  
      const fileFound = await checkForFile();
      if (!fileFound) {
        throw new Error('Content is taking longer than usual to prepare');
      }
  
    } catch (error) {
      console.error('Final error in processVideo:', error);
      if (error.message === 'Request aborted') {
        return;
      }
  
      setProcessingStatus('error');
      setErrorMessage(error.message || 'Failed to process video');
  
      if (retryCount < maxRetries) {
        setIsRetrying(true);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        setRetryCount(prev => prev + 1);
        await processVideo(url, signal);
      }
    } finally {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
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
        // Cancel any existing requests before starting new ones
        cancelActiveRequest();

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
          
          const controller = new AbortController();
          activeRequestRef.current = controller;
          
          try {
            await processVideo(source.downloadLink, controller.signal);
          } catch (error) {
            if (error.message !== 'Request aborted') {
              console.error('Error processing video:', error);
            }
          }
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
    // Check if the video element is available and metadata is loaded
    const videoElement = playerRef.current?.getInternalPlayer();
    if (videoElement) {
      if (videoElement.readyState >= 1) {
        setVideoMetadataLoaded(true);
        setIsPlayerReady(true);
        setIsBuffering(false);
      } else {
        // Add metadata loading listener if metadata isn't loaded yet
        const handleLoadedMetadata = () => {
          setVideoMetadataLoaded(true);
          setIsPlayerReady(true);
          setIsBuffering(false);
          videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      }
    }
  };


  const handleBuffer = () => {
    if (isPlayerReady && videoMetadataLoaded) {
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
    setVideoMetadataLoaded(false);
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
      className="bg-black rounded-xl overflow-hidden shadow-xl relative group" // Changed bg-gray-800 to bg-black
      onMouseMove={showControlsWithTimeout}
      onMouseLeave={() => !isFullscreen && hideControls()}
    >
      <div className={`relative flex items-center justify-center bg-black ${isFullscreen ? 'h-screen w-screen' : 'aspect-video'}`}> // Added bg-black here too
        {/* Rest of the component remains exactly the same */}
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
            {(!playing || !hasStarted) && (
              <div 
                className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer z-10"
                onClick={handlePlayPause}
              >
                <button
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
                transition: 'transform 0.3s ease',
                backgroundColor: 'black' // Added black background here
              }}
            >
              <ReactPlayer
                ref={playerRef}
                url={streamingUrl}
                playing={playing}
                volume={volume}
                muted={false}
                width="100%"
                height="100%"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  margin: 'auto',
                  objectFit: 'contain',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'black' // Added black background here
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
                      muted:false,
                      style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        backgroundColor: 'black' // Added black background here
                      }
                    },
                    forceVideo: true,
                    hlsOptions: {
                      maxBufferSize: 80 * 1024 * 1024,
                      maxBufferLength: 200,
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

        {(isBuffering || (processingStatus === 'ready' && !videoMetadataLoaded)) && (
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