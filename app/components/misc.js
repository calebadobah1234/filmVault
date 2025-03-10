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
 <>.....</>
  );
};
export default EnhancedStreamingComponent;