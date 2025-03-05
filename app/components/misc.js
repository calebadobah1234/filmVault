"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaExpand, FaSpinner,FaClosedCaptioning,FaVolumeMute,FaForward, FaBackward,FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import screenfull from 'screenfull';
import { FaRotate } from 'react-icons/fa6';
import { act } from 'react';


const EnhancedStreamingComponent = ({ sources,movieTitle,sources2,mainSource,naijaRocks }) => {
//states removed to not exeed chat limit on claude

 


  useEffect(() => {
    // Method 1: Check for Telegram's specific WebView proxy
    const isTgWebView = typeof window.TelegramWebViewProxy !== 'undefined';
    // Method 2: Check user agent as fallback
    const isTgUserAgent = navigator.userAgent.toLowerCase().includes('telegram');
    
    setIsTelegram(isTgWebView || isTgUserAgent);
  }, []);
 
  useEffect(() => {
    if (hasStarted && isIOS) {
      setShowIosTooltip(true);
      const timer = setTimeout(() => {
        setShowIosTooltip(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, isIOS]);


  // Function to extract resolution number from quality string
  


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
  
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
  
    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
  
    if (timeDiff < 300) { // 300ms threshold for double click
      // Handle double click
      handleFullscreen();
      setLastClickTime(0);
    } else {
      // Set new timeout for single click
      clickTimeoutRef.current = setTimeout(() => {
        // handlePlayPause();
      }, 200); // Wait 200ms before triggering single click action
      setLastClickTime(currentTime);
    }
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


  const hideControls = useCallback(() => {

    if (!seeking && !isBuffering) {
      setShowControls(false);
    }
  }, [seeking, isBuffering]);

  const showControlsWithTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);

    setControlsTimeout(setTimeout(hideControls, 3000));
  }, [controlsTimeout, hideControls]);

    useEffect(() => {
    // Check if subtitles are loaded and there are multiple tracks for tooltip
    if (subtitleTracks.length > 1) {
      setShowSubtitleTooltip(true);
      // Hide tooltip after 5 seconds (adjust as needed)
      const timer = setTimeout(() => {
        setShowSubtitleTooltip(false);
      }, 5000); // 5000 milliseconds = 5 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount or re-render
    } else {
      setShowSubtitleTooltip(false); // Ensure tooltip is hidden if no multiple tracks
    }
  }, [subtitleTracks]);

  const showSubtitleChangeNotification = (message) => {
    setSubtitleChangeMessage(message);
    setShowSubtitleChangeMessage(true);
    setTimeout(() => {
      setShowSubtitleChangeMessage(false);
      setSubtitleChangeMessage(''); // Clear the message after timeout
    }, 3000); // 3 seconds duration - adjust as needed
  };






  const handleError = () => {
    setIsBuffering(false);
    setIsPlayerReady(false);
    setVideoMetadataLoaded(false);
  };


  useEffect(() => {
    // Detect Android on mount
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(userAgent.includes("android"));
  }, []);


  const handleSeekMouseDown = () => setSeeking(true);

  const handleSeekChange = (e) => setPlayed(parseFloat(e.target.value));

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    playerRef.current?.seekTo(parseFloat(e.target.value));
    showControlsWithTimeout();
  };

  const handleFullscreen = () => {
    // Try standard screenfull first
    if (screenfull.isEnabled && containerRef.current) {
      screenfull.toggle(containerRef.current);
      showControlsWithTimeout();
    } else {
      // Fallback for mobile browsers that block fullscreen API
      const videoElement = playerRef.current?.getInternalPlayer();
      if (videoElement) {
        try {
          // For Android browsers that require video element fullscreen
          if (videoElement.requestFullscreen) {
            videoElement.requestFullscreen();
          } else if (videoElement.mozRequestFullScreen) { /* Firefox */
            videoElement.mozRequestFullScreen();
          } else if (videoElement.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            videoElement.webkitRequestFullscreen();
          } else if (videoElement.msRequestFullscreen) { /* IE/Edge */
            videoElement.msRequestFullscreen();
          }
          
          // Special handling for Telegram in-app browser
          if (isAndroid && window.TelegramWebViewProxy) {
            videoElement.style.position = 'fixed';
            videoElement.style.top = '0';
            videoElement.style.left = '0';
            videoElement.style.width = '100vw';
            videoElement.style.height = '100vh';
            videoElement.style.zIndex = '9999';
          }
        } catch (error) {
          console.error('Fullscreen failed:', error);
          // Fallback to fullscreen styles
          if (containerRef.current) {
            containerRef.current.style.position = 'fixed';
            containerRef.current.style.top = '0';
            containerRef.current.style.left = '0';
            containerRef.current.style.width = '100vw';
            containerRef.current.style.height = '100vh';
            containerRef.current.style.zIndex = '9999';
            setIsFullscreen(true);
          }
        }
      }
    }
  };



  return (
    <div
      ref={containerRef}
      className="bg-black rounded-xl overflow-hidden shadow-xl relative group"
      onMouseMove={showControlsWithTimeout}
      onMouseLeave={() => !isFullscreen && hideControls()}
      onTouchStart={handleTouchStart} // Add touch start for double tap and controls
      onClick={handleVideoClick}
      style={isAndroid ? { paddingBottom: '50px' } : {}} // Add bottom padding for Android
    >
      <div className={`flex items-center justify-center bg-black ${isFullscreen ? 'h-screen w-screen' : 'aspect-video'}`}> {/* Removed relative class here */}
        {/* Processing status: blocked */}
        {showInitialPlayButton && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer z-10">
            <button
              onClick={handleInitialPlay}
              className="group relative"
              aria-label="Start video"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -scale-110 group-hover:scale-125 rounded-full bg-blue-500 opacity-75 animate-pulse-fast"
                style={{ padding: 'calc(48px * 0.6)' }}
              ></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-4 transition-transform group-hover:scale-110">
                <FaPlay className="text-white text-4xl" />
              </div>
            </button>
          </div>
        )}
        {processingStatus === 'blocked' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="text-white text-lg text-center p-4">
              Video will soon be available for streaming
            </div>
          </div>
        )}

        {/* Processing status: downloading */}
        {processingStatus === 'downloading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <FaSpinner className="animate-spin text-white text-4xl mb-4" />
            <span className="text-white">Processing video...</span>
          </div>
        )}

        {/* Video player */}
        {processingStatus === 'ready' && streamingUrl && (
          <>
           {showSubtitleChangeMessage && subtitleChangeMessage && (
              <div className="absolute top-2 left-2 bg-black/60 text-white text-sm p-2 rounded-md z-20">
                {subtitleChangeMessage}
              </div>
            )}

            {showSubtitleTooltip && subtitleTracks.length > 1 && (
              <div className="absolute top-2 right-2 bg-gray-800 text-white text-sm p-2 rounded-md z-20">
                Subtitles out of sync? Use arrow buttons to switch versions.
              </div>
            )}

            {/* Always Show Play Button when not playing or not started */}
            {(!playing || !hasStarted) && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                onClick={handlePlayPause}
              >
                {/* Enhanced Play Button Design with Pulsating Outline */}
                <button
                  className="group relative"
                  aria-label="Play video"
                >
                  {/* Pulsating Outline */}
                  {!hasStarted && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -scale-110 group-hover:scale-125 rounded-full bg-blue-500 opacity-75 animate-pulse-fast"
                    style={{ padding: 'calc(48px * 0.6)' }} // Adjust padding to match icon size
                    ></div>
                  )}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-4 transition-transform group-hover:scale-110">
                    <FaPlay className="text-white text-4xl" />
                  </div>
                </button>
              </div>
            )}

{showTelegramTooltip && (
  <div className="absolute top-2 left-2 bg-black/60 text-white text-sm p-2 rounded-md z-20">
  Fullscreen might not work if using Telegram browser. Switch to another browser if going fullscreen does not work.
</div>
)}

            {/* Center controls while playing */}
            {playing && showControls && isMobile && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="flex items-center justify-center space-x-8 pointer-events-auto">
                  <button
                    onClick={handleBackward}
                    className="text-white/75 hover:text-white hover:scale-110 transition-transform bg-black/30 rounded-full p-4 flex items-center"
                    aria-label="Backward 10 seconds"
                  >
                    <FaBackward className="mr-1" /> -10s
                  </button>

                  <button
                    onClick={handlePlayPause}
                    className="text-white/75 hover:text-white hover:scale-110 transition-transform bg-black/30 rounded-full p-4"
                  >
                    <FaPause size={32} />
                  </button>

                  <button
                    onClick={handleForward}
                    className="text-white/75 hover:text-white hover:scale-110 transition-transform bg-black/30 rounded-full p-4 flex items-center"
                    aria-label="Forward 10 seconds"
                  >
                    +10s <FaForward className="ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Video wrapper */}
            <div
              className={`video-wrapper ${isFullscreen ? 'w-full h-full' : 'w-full h-full'}`}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease',
                backgroundColor: 'black'
              }}
            >
              <ReactPlayer
                ref={playerRef}
                url={streamingUrl}
                playing={playing}
                volume={volume}
                muted={isMuted}
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
                  backgroundColor: 'black'
                }}
                className={`react-player ${isFullscreen ? 'fullscreen' : ''}`}
                onProgress={handleProgress}
                onClick={handleVideoClick}
                onDuration={setDuration}
                onBuffer={handleBuffer}
                onBufferEnd={handleBufferEnd}
                onReady={handlePlayerReady}
                onError={handleError} // Use the enhanced error handler
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                      crossOrigin: 'anonymous',
                      playsInline: true,
                      'webkit-playsinline': true,
                      muted: false,
                      style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        backgroundColor: 'black'
                      }
                    },
                    forceVideo: true,
                    hlsOptions: {
                      // More robust HLS.js configuration for wider compatibility
                      maxMaxBufferLength: 600, // Increased max buffer
                      maxBufferLength: 30,      // Reduced buffer length to start playback faster
                      startPosition: -1,
                      backBufferLength: 30,
                      liveSyncDurationCount: 3, // Reduced for potentially lower latency
                      maxLoadingDelay: 4,
                      manifestLoadingTimeOut: 10000, // Reduced timeouts for faster error detection
                      manifestLoadingMaxRetry: 3,   // Reduced retries
                      fragLoadingTimeOut: 15000,
                      fragLoadingMaxRetry: 3,
                      levelLoadingTimeOut: 10000,
                      levelLoadingMaxRetry: 3,
                      abrEwmaDefaultEstimate: 500000, // Reduced default bitrate estimate
                      abrBandWidthFactor: 0.9,     // Slightly more conservative ABR
                      abrBandWidthUpFactor: 0.7,
                      abrMaxWithRealBitrate: true,
                      enableWorker: true, // Keep worker enabled for performance, but monitor if issues arise
                      autoStartLoad: true,
                      startPosition: -1,
                      // Experimental settings - use with caution and testing
                      // lowLatencyMode: true, // Consider for low latency streams if applicable
                      // liveDurationInfinity: true, // If stream is truly live and infinite
                    }
                  },
                }}
              />
            </div>
          </>
        )}

        {isSubtitleLoading && (
          <div className="absolute bottom-20 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
            Loading subtitles...
          </div>
        )}

        {(isBuffering || (processingStatus === 'ready' && !videoMetadataLoaded)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <FaSpinner className="animate-spin text-white text-4xl" />
          </div>
        )}

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

{showTelegramTooltip && (
      <div className="absolute top-2 left-2 bg-black/60 text-white text-sm p-2 rounded-md z-20">
        Fullscreen might not work in Telegram browser. Switch to another browser for the best experience.
      </div>
    )}

        {showFullscreenTooltip && hasStarted && !isFullscreen && playing && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-sm p-2 rounded-md z-20">
            Double tap for fullscreen
          </div>
        )}

{showIosTooltip && (
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-sm p-2 rounded-md z-20 whitespace-nowrap">
        Playback is currently not supported on iOS. Download the video instead.
      </div>
    )}


        {/* Bottom controls */}
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

              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition"
              >
                {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
              </button>

              {(!isMuted && !isMobile) && (
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              )}

              <div className="text-gray-400 text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
  {subtitleTracks.length > 1 && (
    <button
      onClick={() => {
        const newIndex = Math.max(currentSubtitleIndex - 1, 0);
        setCurrentSubtitleIndex(newIndex);
        showSubtitleChangeNotification(`Subtitles: ${subtitleTracks[newIndex]?.label || `Track ${newIndex + 1}`}`);
      }}
      disabled={currentSubtitleIndex === 0}
      className="text-white hover:text-gray-300 disabled:opacity-50 transition"
      aria-label="Previous subtitle version"
    >
      <FaChevronLeft size={16} />
    </button>
  )}

  <button
    onClick={toggleSubtitles}
    className={`text-white hover:text-gray-300 transition ${
      subtitlesEnabled ? 'text-blue-400' : 'text-white'
    }`}
    title={subtitlesEnabled ? 'Disable subtitles' : 'Enable subtitles'}
  >
    <FaClosedCaptioning size={20} />
  </button>

  {subtitleTracks.length > 1 && (
    <button
      onClick={() => {
        const newIndex = Math.min(currentSubtitleIndex + 1, subtitleTracks.length - 1);
        setCurrentSubtitleIndex(newIndex);
        showSubtitleChangeNotification(`Subtitles: ${subtitleTracks[newIndex]?.label || `Track ${newIndex + 1}`}`);
      }}
      disabled={currentSubtitleIndex === subtitleTracks.length - 1}
      className="text-white hover:text-gray-300 disabled:opacity-50 transition"
      aria-label="Next subtitle version"
    >
      <FaChevronRight size={16} />
    </button>
  )}
</div>

<select
      value={selectedQuality}
      onChange={(e) => setSelectedQuality(e.target.value)}
      className="bg-gray-700 text-white px-3 py-1 rounded-md"
    >
      {qualities.map(quality => (
        <option key={quality} value={quality}>
          {quality === 'auto' ? 'Auto' : `${quality}p`}
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