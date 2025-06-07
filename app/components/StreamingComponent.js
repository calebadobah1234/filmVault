"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaExpand, FaSpinner,FaClosedCaptioning,FaVolumeMute,FaForward, FaBackward,FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import screenfull from 'screenfull';
import { FaRotate } from 'react-icons/fa6';

// Hoisted Domain Mappings
const GLOBAL_DOMAIN_MAPPINGS = {
  "https://ds10.30namachi.com": "https://namachi10.b-cdn.net",
  "https://ds11.30namachi.com": "https://namachi11.b-cdn.net",
  "https://ds12.30namachi.com": "https://namachi12.b-cdn.net",
  "https://ds14.30namachi.com": "https://namachi14.b-cdn.net",
  "https://ds15.30namachi.com": "https://namachi15.b-cdn.net",
  "https://ds16.30namachi.com": "https://namachi16.b-cdn.net",
  "https://ds17.30namachi.com": "https://namachi17.b-cdn.net",
  "https://ds3.30namachi.co": "https://namachi3.b-cdn.net",
  "https://dl4.30namachi.com": "https://namachi4.b-cdn.net", // Note: Typo in original "30namcahi.com"?
  "https://ds5.30namachi.com": "https://namachi5.b-cdn.net",
  "https://ds7.30namachi.com": "https://namachi7.b-cdn.net",
  "https://d10.30namachi.com": "https://namachid10.b-cdn.net",
  "https://dl11.sermoviedown.pw": "https://sermovie11.b-cdn.net",
  "https://dl12.sermoviedown.pw": "https://sermovie12.b-cdn.net",
  "https://dl3.sermoviedown.pw": "https://sermovie3.b-cdn.net",
  "https://dl4.sermoviedown.pw": "https://sermovie4.b-cdn.net",
  "https://dl5.sermoviedown.pw": "https://sermovie5.b-cdn.net",
  "https://dl2.sermoviedown.pw": "https://servmovie2.b-cdn.net",
  "http://dl.vinadl.xyz": "https://vinadl1.b-cdn.net", // This will be checked first for "http://dl.vinadl.xyz"
  "http://dl2.vinadl.xyz": "https://vinadl2.b-cdn.net",
  "http://dl3.vinadl.xyz": "https://vinadl3.b-cdn.net",
  "https://storage.googleapis.com/fvmoviesbucket":"https://fvsrv1.b-cdn.net",
  "http://dl8.vinadl.xyz": "https://vinadl8.b-cdn.net",
  "http://dl9.vinadl.xyz": "https://vinadl9.b-cdn.net",
  "https://dl1.dl-bcmovie1.xyz": "https://bcmovie1.b-cdn.net",
  "https://dl.vinadl.xyz":"https://vinadl0.b-cdn.net", // This will be checked if the URL starts with "https://dl.vinadl.xyz"
  "https://silverangel.000f.fastbytes.org":"https://silverangel.b-cdn.net"
};

// Updated replaceDomainWithCDN function
const replaceDomainWithCDN = (url) => {
  if (!url) return url;
  for (const [oldDomain, newDomain] of Object.entries(GLOBAL_DOMAIN_MAPPINGS)) {
    if (url.startsWith(oldDomain)) {
      return url.replace(oldDomain, newDomain);
    }
  }
  return url; // Return original URL if no mapping is found
};


const EnhancedStreamingComponent = ({ sources,movieTitle,sources2,mainSource,naijaRocks }) => {
  console.log(`DEBUG: Initial mainSource prop:`,mainSource);
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
  const [screenOrientation, setScreenOrientation] = useState('portrait');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxRetries = 3;
  const retryDelay = 2000;
  const processingTimeoutRef = useRef(null);
  const activeRequestRef = useRef(null);
  const [videoMetadataLoaded, setVideoMetadataLoaded] = useState(false);
  const [subtitleUrl, setSubtitleUrl] = useState(null);
  const [originalFilenameForSubtitle, setOriginalFilenameForSubtitle] = useState('');
  const [isSubtitleLoading, setIsSubtitleLoading] = useState(false);
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [prevVolume, setPrevVolume] = useState(1);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [currentSourcesType, setCurrentSourcesType] = useState('sources');
  const [showSubtitleTooltip, setShowSubtitleTooltip] = useState(false);
  const [subtitleChangeMessage, setSubtitleChangeMessage] = useState('');
  const [showSubtitleChangeMessage, setShowSubtitleChangeMessage] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showFullscreenTooltip, setShowFullscreenTooltip] = useState(false);
  const fullscreenTooltipTimeoutRef = useRef(null);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showInitialPlayButton, setShowInitialPlayButton] = useState(true);
  const [processingInitiated, setProcessingInitiated] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const clickTimeoutRef = useRef(null);

  const [isTelegram, setIsTelegram] = useState(false);
  const [showTelegramTooltip, setShowTelegramTooltip] = useState(false);
  const [showIosTooltip, setShowIosTooltip] = useState(false);

  const playerRef = useRef(null);
  const controlsRef = useRef(null);
  const containerRef = useRef(null);
  const [isIOS, setIsIOS] = useState(false);

 const hideControls = useCallback(() => {
    // Added !isFullscreen check to the condition for hiding on mobile
    // For desktop, existing logic is fine. For mobile, controls usually hide unless interacting.
    // Let's keep original logic: if (!seeking && !isBuffering && playing && !isMobile )
    // The problem is about them *reappearing* on mouse move on desktop fullscreen.
    if (!seeking && !isBuffering && playing && !isMobile) {
      setShowControls(false);
    }
  }, [seeking, isBuffering, playing, isMobile]);

  const showControlsWithTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    if (playing) { // Only set timeout if playing
      setControlsTimeout(setTimeout(hideControls, 3000));
    }
  }, [controlsTimeout, hideControls, playing]);


  const handleInitialPlay = () => {
    setShowInitialPlayButton(false);
    setProcessingInitiated(true); // This will trigger the quality processing useEffect
    setHasStarted(true); // Indicate user interaction
  };

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTgWebView = typeof window.TelegramWebViewProxy !== 'undefined';
    const isTgUserAgent = userAgent.includes('telegram');
    setIsTelegram(isTgWebView || isTgUserAgent);
  }, []);

  useEffect(() => {
    if (isTelegram && hasStarted) {
      setShowTelegramTooltip(true);
      const timer = setTimeout(() => {
        setShowTelegramTooltip(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isTelegram, hasStarted]);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  const fetchActualUrl = async (url) => {
    console.log('DEBUG: Fetching actual URL for (mainSource type):', url);
    try {
      const response = await fetch(`https://api5.mp3vault.xyz/getDownloadUrl?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch actual URL, status: ${response.status}`);
      }
      const data = await response.json();
      console.log('DEBUG: Received actual URL (mainSource type):', data.downloadUrl);
      return data.downloadUrl;
    } catch (error) {
      console.error('DEBUG: Error fetching actual URL (mainSource type):', error);
      return null;
    }
  };

  const fetchActualUrlNaija = async (url) => {
    console.log('DEBUG: Fetching actual URL for (naijaRocks type):', url);
    try {
      const response = await fetch(`https://api5.mp3vault.xyz/getNaijaDownloadUrl?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch actual Naija URL, status: ${response.status}`);
      }
      const data = await response.json();
      console.log('DEBUG: Received actual URL (naijaRocks type):', data.downloadUrl);
      return data.downloadUrl;
    } catch (error) {
      console.error('DEBUG: Error fetching actual URL (naijaRocks type):', error);
      return null;
    }
  };

  useEffect(() => {
    if (hasStarted && isIOS) {
      setShowIosTooltip(true);
      const timer = setTimeout(() => {
        setShowIosTooltip(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, isIOS]);

  const getResolutionNumber = (quality) => {
    if (!quality) return 0;
    let match = quality.match(/(\d+)[pP]/);
    if (match) return parseInt(match[1]);
    match = quality.match(/(\d{3,4})/); // Fallback for numbers like 720, 1080 without 'p'
    return match ? parseInt(match[1]) : 0;
  };
  
  const requestOrientationChange = async (orientation) => {
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock(orientation);
      } else if (screen.lockOrientation) { // Older browsers
        screen.lockOrientation(orientation);
      } else if (screen.webkitLockOrientation) { // Safari
        screen.webkitLockOrientation(orientation);
      } else if (screen.mozLockOrientation) { // Firefox
        screen.mozLockOrientation(orientation);
      } else if (screen.msLockOrientation) { // IE/Edge
        screen.msLockOrientation(orientation);
      }
      setScreenOrientation(orientation);
    } catch (error) {
      console.error('Failed to change orientation:', error);
      handleFallbackRotation(); // Call fallback if official API fails
    }
  };

  const handleFallbackRotation = () => {
    if (containerRef.current) {
        const videoWrapper = containerRef.current.querySelector('.video-wrapper');
        if (videoWrapper) {
            if (screenOrientation === 'portrait') {
                // Rotate to landscape
                videoWrapper.style.transform = 'rotate(90deg)';
                videoWrapper.style.width = '100vh'; // viewport height becomes width
                videoWrapper.style.height = '100vw'; // viewport width becomes height
                videoWrapper.style.position = 'absolute';
                videoWrapper.style.top = '50%';
                videoWrapper.style.left = '50%';
                // Adjust margins or use transform translate to center it correctly
                // This part might need fine-tuning based on your layout
                // A common approach for centering after rotation:
                videoWrapper.style.transformOrigin = 'center center'; // Ensure rotation is around the center
                // Recalculate translation based on new dimensions
                // videoWrapper.style.left = `calc(50% - ${videoWrapper.offsetHeight / 2}px)`;
                // videoWrapper.style.top = `calc(50% - ${videoWrapper.offsetWidth / 2}px)`;
                // Simpler for now, assuming centering is mostly handled:
                videoWrapper.style.transform = 'translate(-50%, -50%) rotate(90deg)';
                // If using absolute, top/left 50% and translate -50%,-50% is common for centering.
                // With rotation, width/height swap. We might need to adjust.
                // For simplicity, the original calculation was likely trying to fill space
                // This is complex; screen.orientation.lock is much preferred.
                // Let's use a simpler centering for the fallback for now.
                videoWrapper.style.top = '0'; videoWrapper.style.left = '0';
                videoWrapper.style.transformOrigin = 'top left';
                videoWrapper.style.transform = `rotate(90deg) translate(0, -100vw)`; // Example adjustment


                setScreenOrientation('landscape');
            } else {
                // Rotate back to portrait
                videoWrapper.style.transform = 'none';
                videoWrapper.style.width = '100%';
                videoWrapper.style.height = '100%';
                videoWrapper.style.position = 'relative';
                videoWrapper.style.top = 'auto';
                videoWrapper.style.left = 'auto';
                videoWrapper.style.margin = 'auto'; // Reset margin
                setScreenOrientation('portrait');
            }
        }
    }
  };


  const handleRotate = async () => {
    if (isFullscreen && isMobile) { // Only allow rotate when in fullscreen on mobile
      try {
        const newOrientation = screenOrientation === 'portrait' ? 'landscape' : 'portrait';
        await requestOrientationChange(newOrientation);
      } catch (error) {
        console.error('Orientation change failed:', error);
        handleFallbackRotation(); // Use CSS transform as a fallback
      }
    }
  };

  const toggleSubtitles = () => {
    const videoElement = playerRef.current?.getInternalPlayer();
    if (videoElement && videoElement.textTracks && videoElement.textTracks.length > 0) {
        // Iterate through tracks to find the one being managed by currentSubtitleIndex or the first one
        let trackToToggle = null;
        if (videoElement.textTracks[currentSubtitleIndex]) { // If multiple tracks loaded and one is active
            trackToToggle = videoElement.textTracks[currentSubtitleIndex];
        } else if (videoElement.textTracks[0]) { // Fallback to the first track if currentSubtitleIndex is out of bounds
            trackToToggle = videoElement.textTracks[0];
        }

        if (trackToToggle) {
            trackToToggle.mode = subtitlesEnabled ? 'hidden' : 'showing';
            setSubtitlesEnabled(!subtitlesEnabled);
            console.log(`DEBUG SUB: Toggled subtitle track "${trackToToggle.label}" to ${trackToToggle.mode}`);
        } else {
            console.log("DEBUG SUB: No suitable text track found to toggle.");
        }
    } else {
        console.log("DEBUG SUB: No text tracks available or video element not ready.");
    }
  };


  const handleForward = () => {
    const player = playerRef.current;
    if (player) {
      const newTime = Math.min(currentTime + 10, duration);
      player.seekTo(newTime);
      setCurrentTime(newTime); // Optimistically update currentTime
      showControlsWithTimeout();
    }
  };

  const handleBackward = () => {
    const player = playerRef.current;
    if (player) {
      const newTime = Math.max(currentTime - 10, 0);
      player.seekTo(newTime);
      setCurrentTime(newTime); // Optimistically update currentTime
      showControlsWithTimeout();
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (newMutedState) { // Muting
      setPrevVolume(volume); // Save current volume
      setVolume(0);
    } else { // Unmuting
      setVolume(prevVolume > 0 ? prevVolume : 1); // Restore previous volume or set to full if prevVolume was 0
    }
    showControlsWithTimeout();
  };

  const handleSeekTouchStart = (e) => {
    setSeeking(true);
    // Potentially update played value immediately for responsiveness if needed
    // const input = e.target;
    // const touch = e.touches[0];
    // const rect = input.getBoundingClientRect();
    // const position = (touch.clientX - rect.left) / rect.width;
    // setPlayed(Math.max(0, Math.min(1, position)));
  };

  const handleSeekTouchMove = (e) => {
    if (!seeking) return; // Ensure seeking is true
    const input = e.target;
    const touch = e.touches[0];
    const rect = input.getBoundingClientRect();
    const position = (touch.clientX - rect.left) / rect.width;
    const clampedPosition = Math.max(0, Math.min(1, position));
    setPlayed(clampedPosition);
    // Optionally seek live:
    // if (playerRef.current) {
    //   playerRef.current.seekTo(clampedPosition * duration, 'seconds');
    // }
  };

  const handleSeekTouchEnd = (e) => {
    // The `played` state is already updated by handleSeekTouchMove or handleSeekChange
    // We just need to finalize the seek action on the player
    if (playerRef.current) {
        playerRef.current.seekTo(played); // `played` is a fraction (0 to 1)
    }
    setSeeking(false);
    showControlsWithTimeout();
  };

  const cancelActiveRequest = () => {
    if (activeRequestRef.current) {
      console.log("DEBUG: Cancelling active request", activeRequestRef.current);
      activeRequestRef.current.abort("User changed quality or initiated new action");
      activeRequestRef.current = null;
    }
  };
  
  useEffect(() => {
    // ComponentWillUnmount cleanup
    return () => {
      cancelActiveRequest();
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if (fullscreenTooltipTimeoutRef.current) {
        clearTimeout(fullscreenTooltipTimeoutRef.current);
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
      }
       // Detach screenfull listener
       if (screenfull.isEnabled) {
        screenfull.off('change', onFullscreenChange); // Ensure onFullscreenChange is defined or use the handler directly
      }
      // Detach orientation change listeners
      if (typeof window !== 'undefined') {
        window.removeEventListener('orientationchange', handleNativeOrientationChange);
        screen.orientation?.removeEventListener('change', handleNativeOrientationChange);
      }
       // Remove custom subtitle styles
      const customStyles = document.getElementById('custom-subtitle-styles');
      if (customStyles) customStyles.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array means this runs on mount and unmount only


  useEffect(() => {
    const fetchSubtitle = async () => {
      console.log('DEBUG SUB: Starting subtitle fetch process');
      console.log('DEBUG SUB: Movie Title:', movieTitle);
      console.log('DEBUG SUB: Original Filename for Subtitle:', originalFilenameForSubtitle);

      if (!movieTitle || !originalFilenameForSubtitle) {
        console.log('DEBUG SUB: Missing required data for subtitle fetch:', { movieTitle, originalFilenameForSubtitle });
        setSubtitleTracks([]); // Reset tracks if data is missing
        setSubtitleUrl(null);
        return;
      }
      setIsSubtitleLoading(true);
      setSubtitleTracks([]); // Clear previous tracks
      setSubtitleUrl(null); // Clear previous subtitle URL

      try {
        const baseFilenameForSub = originalFilenameForSubtitle.split('?')[0]; // Remove query params
        const originalSubFilename = `${baseFilenameForSub}.vtt`; // Assuming .vtt
        const cdnSubUrl = `https://filmvaultsub.b-cdn.net/${encodeURIComponent(originalSubFilename)}`;
        console.log('DEBUG SUB: Checking for original subtitle at CDN URL:', cdnSubUrl);

        const checkResponse = await fetch(cdnSubUrl, { method: 'HEAD' });
        let mainSubTrack = null;

        if (checkResponse.ok) {
          console.log('DEBUG SUB: Original subtitle found in CDN.');
          mainSubTrack = { kind: 'subtitles', src: cdnSubUrl, srcLang: 'en', label: 'English (CDN)', default: true, type: 'text/vtt' };
        } else {
          console.log('DEBUG SUB: Original subtitle not in CDN, initiating download.');
          const encodedMovie = encodeURIComponent(movieTitle);
          // Ensure filename for download doesn't have extensions like .mp4.vtt if baseFilenameForSub already includes .mp4
          const filenameForDownloadApi = baseFilenameForSub.replace(/\.(mp4|mkv|avi|webm)$/i, ''); // Remove common video extensions
          const encodedFilenameForDownload = encodeURIComponent(filenameForDownloadApi);

          const downloadUrl = `https://subtitles-production.up.railway.app/nodejs/download-subtitle-subsource?movie=${encodedMovie}&type=movie&filename=${encodedFilenameForDownload}`;
          console.log('DEBUG SUB: Making subtitle download request to:', downloadUrl);

          const downloadResponse = await fetch(downloadUrl);
          if (!downloadResponse.ok) throw new Error(`Subtitle download failed: ${downloadResponse.status}`);
          const responseData = await downloadResponse.json();
          console.log('DEBUG SUB: Download Response Data:', responseData);

          console.log('DEBUG SUB: Waiting for subtitle processing...');
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for CDN propagation

          const finalCheckResponse = await fetch(cdnSubUrl, { method: 'HEAD' });
          if (finalCheckResponse.ok) {
            console.log('DEBUG SUB: Subtitle now available in CDN after processing.');
            mainSubTrack = { kind: 'subtitles', src: cdnSubUrl, srcLang: 'en', label: 'English (Processed)', default: true, type: 'text/vtt' };
          } else if (responseData && responseData.s3Path) {
            // Ensure s3Path is a valid URL
            const s3Url = responseData.s3Path.startsWith('http') ? responseData.s3Path : `https://${responseData.s3Path}`;
            console.log('DEBUG SUB: Using Wasabi/S3 URL as fallback:', s3Url);
            mainSubTrack = { kind: 'subtitles', src: s3Url, srcLang: 'en', label: 'English (S3)', default: true, type: 'text/vtt' };
          } else {
            throw new Error('No subtitle data available after download attempt and CDN check.');
          }
        }

        const allTracks = mainSubTrack ? [mainSubTrack] : [];
        console.log('DEBUG SUB: Checking for additional subtitle versions (v2, v3, etc.)...');
        let version = 2;
        let versionExists = true;
        while (versionExists && version <= 10) { // Limit to 10 versions
          const versionedFilename = `v${version}_${baseFilenameForSub}.vtt`; // Assuming .vtt
          const versionedUrl = `https://fvsubtitles.b-cdn.net/${encodeURIComponent(versionedFilename)}`;
          try {
            const verCheckResponse = await fetch(versionedUrl, { method: 'HEAD' });
            if (verCheckResponse.ok) {
              console.log(`DEBUG SUB: Version ${version} subtitle found.`);
              allTracks.push({ kind: 'subtitles', src: versionedUrl, srcLang: 'en', label: `English v${version}`, default: false, type: 'text/vtt' });
              version++;
            } else {
              versionExists = false;
            }
          } catch (error) {
            console.error(`DEBUG SUB: Error checking version ${version} subtitle:`, error);
            versionExists = false;
          }
        }
        setSubtitleTracks(allTracks);
        if (allTracks.length > 0) {
            setSubtitleUrl(allTracks[0].src); // Set the first track as the one to load initially
            setCurrentSubtitleIndex(0); // Default to the first track
        }

      } catch (error) {
        console.error('DEBUG SUB: Error in subtitle process:', error);
        setSubtitleUrl(null);
        setSubtitleTracks([]);
      } finally {
        setIsSubtitleLoading(false);
        console.log('DEBUG SUB: Subtitle process completed.');
      }
    };

    if (movieTitle && originalFilenameForSubtitle && hasStarted) { // Fetch subtitles only after user starts interaction
        fetchSubtitle();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieTitle, originalFilenameForSubtitle, hasStarted]); // Re-fetch if these change and player has started


  useEffect(() => {
    console.log('DEBUG: Current subtitle tracks state:', subtitleTracks);
  }, [subtitleTracks]);

  useEffect(() => {
    console.log('DEBUG: Current subtitle URL state:', subtitleUrl);
  }, [subtitleUrl]);


  const handleNativeOrientationChange = () => { // Renamed to avoid conflict
    if (screen.orientation) {
        setScreenOrientation(screen.orientation.type.includes('landscape') ? 'landscape' : 'portrait');
    } else { // Fallback for older browsers that might only have window.orientation
        const newOrientation = (window.orientation === 90 || window.orientation === -90) ? 'landscape' : 'portrait';
        setScreenOrientation(newOrientation);
    }
  };

  useEffect(() => {
    if (!isFullscreen) {
      // Attempt to unlock orientation when exiting fullscreen
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
      // Reset CSS rotation if applied by fallback
      if (containerRef.current) {
        const videoWrapper = containerRef.current.querySelector('.video-wrapper');
        if (videoWrapper && videoWrapper.style.transform.includes('rotate')) {
          videoWrapper.style.transform = 'none';
          videoWrapper.style.width = '100%';
          videoWrapper.style.height = '100%';
          videoWrapper.style.position = 'relative'; // Or initial position
          videoWrapper.style.top = 'auto';
          videoWrapper.style.left = 'auto';
          videoWrapper.style.margin = 'auto';
        }
      }
      setScreenOrientation('portrait'); // Default back to portrait assumption
    }
  }, [isFullscreen]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('orientationchange', handleNativeOrientationChange); // For older browsers
        if (screen.orientation) { // For modern browsers
            screen.orientation.addEventListener('change', handleNativeOrientationChange);
        }
    }
    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('orientationchange', handleNativeOrientationChange);
            if (screen.orientation) {
                screen.orientation.removeEventListener('change', handleNativeOrientationChange);
            }
        }
    };
  }, []);

  const handleVideoClick = (e) => {
    if (seeking) return; // Don't do anything if currently seeking via progress bar
    // Prevent click-through if clicking on controls
    if (controlsRef.current && controlsRef.current.contains(e.target)) {
        return;
    }

    const currentTimeVal = new Date().getTime();
    const timeDiff = currentTimeVal - lastClickTime;

    if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
    }

    if (timeDiff < 300 && timeDiff > 0) { // Double click/tap
        handleFullscreen();
        setLastClickTime(0); // Reset last click time to prevent immediate triple click issues
    } else { // Single click/tap
        clickTimeoutRef.current = setTimeout(() => {
            // Single click action: Toggle controls or play/pause if appropriate
            // setShowControls(prev => !prev); // Or handlePlayPause()
            // The requirements changed to remove single-click play/pause.
            // So a single click on video area (not controls) should toggle controls visibility
             if (playing) { // Only toggle controls if playing, otherwise play/pause might be more intuitive
                setShowControls(prevShowControls => !prevShowControls);
                if (!showControls) { // If controls were hidden and are now shown by click
                    showControlsWithTimeout(); // Start timer to hide them again
                }
            } else if (hasStarted && streamingUrl && processingStatus === 'ready') {
                 // If paused and ready, single click can mean play
                 handlePlayPause();
            }

            clickTimeoutRef.current = null;
        }, 250); // Adjust delay as needed, 250-300ms is common for double click
        setLastClickTime(currentTimeVal);
    }
  };

  const sanitizeFilename = (filename) => {
    if (!filename) return '';
    // Get the part before '?'
    let cleanedFilename = filename.split('?')[0];
    // Decode URI component first to handle %20 etc.
    let decodedSegment;
    try {
        decodedSegment = decodeURIComponent(cleanedFilename);
    } catch (e) {
        // If decoding fails (e.g., malformed URI), use the cleaned segment as is
        decodedSegment = cleanedFilename;
        console.warn("sanitizeFilename: decodeURIComponent failed for", cleanedFilename, e);
    }
    // Replace spaces with dots, then encode any remaining special characters for a URL path segment
    // Allow A-Z, a-z, 0-9, underscore, dot, hyphen, percent (for existing encodings), tilde
    const pathSegment = decodedSegment
        .replace(/ /g, '.') // Replace spaces with dots
        .replace(/[^A-Za-z0-9_.\-%~]/g, char => encodeURIComponent(char)); // Encode other special chars

    return pathSegment;
  };


  const checkFileExists = async (filenameToCheck, signal) => {
    // The filenameToCheck should be the base filename, not a full URL here.
    // The sanitizeFilename function should be applied BEFORE calling checkFileExists if it's part of the path.
    // Assuming filenameToCheck is already the sanitized segment for the CDN path.
    const encodedFilename = filenameToCheck; // Assuming sanitizeFilename was called prior if needed for the path segment
    const url = `https://fvsrv1.b-cdn.net/${encodedFilename}`;
    console.log(`DEBUG: checkFileExists: Checking URL: ${url}`);
    try {
      const headResponse = await fetch(url, { method: 'HEAD', cache: 'no-cache', signal: signal });
      if (headResponse.status === 200) {
        console.log(`DEBUG: checkFileExists: File exists (200 OK) at ${url}`);
        return true;
      }
      console.log(`DEBUG: checkFileExists: File does not exist or not accessible (Status: ${headResponse.status}) at ${url}`);
      return false;
    } catch (error) {
      console.error(`DEBUG: checkFileExists: Error for ${url}:`, error.name, error.message);
      if (error.name === 'AbortError') {
        console.log(`DEBUG: checkFileExists: Request aborted for ${url}`);
        throw error; // Re-throw AbortError to be caught by the caller
      }
      return false; // Other errors mean file likely doesn't exist or network issue
    }
  };


  const processVideo = async (urlToProcessInitially, signal, isAutoQualitySource = false) => {
    let currentUrlForProcessing = urlToProcessInitially;
    let filenameForApiAndCdnCheck = ""; // Filename extracted from URL, used for API calls and CDN checks
    let sanitizedFilenameForCdnPath = ""; // Filename after sanitization, used for constructing CDN paths

    try {
        console.log(`DEBUG processVideo: Started. Initial URL: ${urlToProcessInitially}, IsAuto: ${isAutoQualitySource}`);
        setProcessingStatus('checking');
        setErrorMessage('');
        setStreamingUrl(null); // Clear previous stream

        if (!urlToProcessInitially) {
            throw new Error('No URL provided to processVideo');
        }

        // If it's an "auto" quality source, it might be an indirect link that needs resolving
        if (isAutoQualitySource) {
            console.log(`DEBUG processVideo: Auto quality source. Attempting to get actual URL for: ${urlToProcessInitially}`);
            // Determine if it's mainSource or naijaRocks to call the correct fetch function
            // This logic assumes urlToProcessInitially is the original mainSource or naijaRocks prop value for auto
            let actualPlayableUrl = null;
            if (mainSource && urlToProcessInitially === mainSource) { // Check if it's the mainSource URL itself
                actualPlayableUrl = await fetchActualUrl(mainSource);
            } else if (naijaRocks && urlToProcessInitially === naijaRocks) { // Check if it's the naijaRocks URL
                actualPlayableUrl = await fetchActualUrlNaija(naijaRocks);
            } else {
                 // If it's an auto source but not matching mainSource/naijaRocks directly,
                 // it might have already been resolved, or it's a direct playable URL marked as 'auto'
                 // This case needs clarification on how 'auto' URLs not matching mainSource/naijaRocks are handled
                 console.warn("DEBUG processVideo: Auto source does not match mainSource or naijaRocks. Using URL as is or needs specific fetch logic.");
                 actualPlayableUrl = urlToProcessInitially; // Fallback: assume it's already playable or needs generic fetch
            }


            if (!actualPlayableUrl) {
                throw new Error(`Failed to fetch actual URL for auto source: ${urlToProcessInitially}`);
            }
            currentUrlForProcessing = actualPlayableUrl;
            console.log(`DEBUG processVideo: Actual URL for processing (auto source): ${currentUrlForProcessing}`);
        }

        // Extract filename from the (potentially resolved) URL
        // This filename is used for subtitle fetching and as a basis for CDN checks/downloads
        filenameForApiAndCdnCheck = currentUrlForProcessing.split('/').pop().split('?')[0] || `video_unknown_${Date.now()}`;
        setOriginalFilenameForSubtitle(filenameForApiAndCdnCheck); // Used by subtitle useEffect

        // Sanitize the extracted filename for use in CDN paths (e.g., fvsrv1.b-cdn.net/SANITIZED_FILENAME)
        sanitizedFilenameForCdnPath = sanitizeFilename(filenameForApiAndCdnCheck);

        console.log(`DEBUG processVideo: Filename for API/CDN Check (from URL): ${filenameForApiAndCdnCheck}`);
        console.log(`DEBUG processVideo: Sanitized filename for CDN Path: ${sanitizedFilenameForCdnPath}`);


        if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = setTimeout(() => {
            if (processingStatus !== 'ready' && processingStatus !== 'error' && !(signal && signal.aborted)) {
                console.error('DEBUG processVideo: Processing timed out.');
                // cancelActiveRequest(); // Already handled by signal, but good for other timeouts
                if (activeRequestRef.current && activeRequestRef.current.signal === signal) {
                    activeRequestRef.current.abort("Processing timeout");
                }
                setProcessingStatus('error');
                setErrorMessage('Processing timed out. Please try again or select a different quality.');
            }
        }, 240000); // 4 minutes timeout

        // Perform initial check on CDN (fvsrv1.b-cdn.net) using the sanitized filename
        console.log(`DEBUG processVideo: Performing initial file check on fvsrv1 for: ${sanitizedFilenameForCdnPath}`);
        const initialFileExists = await checkFileExists(sanitizedFilenameForCdnPath, signal); // Pass sanitized filename
        console.log(`DEBUG processVideo: Initial file check result for ${sanitizedFilenameForCdnPath} on fvsrv1: ${initialFileExists}`);

        if (initialFileExists) {
            const cdnUrl = `https://fvsrv1.b-cdn.net/${sanitizedFilenameForCdnPath}`;
            console.log(`DEBUG processVideo: File found on fvsrv1 CDN (initial check). Setting streaming URL: ${cdnUrl}`);
            setStreamingUrl(cdnUrl);
            setProcessingStatus('ready');
            if(playing === false && hasStarted === true) setPlaying(true);
            setRetryCount(0); setIsRetrying(false); // Reset retry state on success
            return;
        }

        // If not an auto-quality source AND file not found on fvsrv1, it's an error for specific quality links.
        // This implies specific quality links (non-auto) are expected to be on fvsrv1 if not directly playable via replaceDomainWithCDN.
        if (!isAutoQualitySource) {
            // This logic path is hit if a specific quality was selected, it wasn't a direct CDN mapping via replaceDomainWithCDN,
            // AND it wasn't found on fvsrv1.b-cdn.net.
            console.error(`DEBUG processVideo: File not found on fvsrv1 CDN for non-auto source. URL: ${currentUrlForProcessing}, Sanitized Filename: ${sanitizedFilenameForCdnPath}`);
            throw new Error(`File for selected quality not immediately available on CDN. URL: ${currentUrlForProcessing.substring(0,100)}...`);
        }

        // --- Download process for AUTO sources if not found on fvsrv1 CDN initially ---
        if (isAutoQualitySource) { // This block should only run for auto sources that need downloading
            console.log(`DEBUG processVideo: File not on fvsrv1 CDN for auto source. Initiating download process for URL: ${currentUrlForProcessing}`);
            setProcessingStatus('downloading');

            // Use the original filename (before sanitization but after ? removal) for the API 'filename' parameter
            const filenameForApiParameter = filenameForApiAndCdnCheck;
            const encodedUrlForApi = encodeURIComponent(currentUrlForProcessing); // The actual video source URL
            const encodedFilenameForApi = encodeURIComponent(filenameForApiParameter); // The desired filename on CDN
            const apiUrlForDownload = `https://api4.mp3vault.xyz/download?url=${encodedUrlForApi}&filename=${encodedFilenameForApi}`;

            console.log('DEBUG processVideo: Download API URL:', apiUrlForDownload);
            console.log('DEBUG processVideo: AbortSignal for API4 fetch:', signal ? signal.aborted : 'null signal');

            if (signal && signal.aborted) {
                console.error('DEBUG processVideo: API4 Download NOT ATTEMPTED - Signal was already aborted before fetch.');
                throw new Error('Request aborted before download initiation.');
            } else {
                console.log('DEBUG processVideo: ATTEMPTING fetch to api4 now...');
                // Fire-and-forget the download request, then poll
                fetch(apiUrlForDownload, { method: 'GET', headers: { 'Accept': 'application/json' }, signal })
                    .then(response => {
                        if (signal && signal.aborted) return null; // Don't process if aborted during fetch
                        console.log('DEBUG processVideo: API4 fetch response status:', response.status, response.statusText);
                        if (!response.ok) {
                            console.error('DEBUG processVideo: API4 fetch response NOT OK. Status:', response.status);
                            // Convert to JSON only if OK, otherwise it might be non-JSON error response
                            // throw new Error(`API4 download initiation failed: ${response.status} ${response.statusText}`);
                        }
                        return response.json().catch(e => {
                            console.error("DEBUG processVideo: API4 response.json() error", e);
                            // throw new Error("API4 download initiation returned non-JSON response.");
                            return { message: "API4 call made, but response parsing failed or was not JSON."}; // Proceed to polling anyway
                        });
                    })
                    .then(data => {
                        if (signal && signal.aborted) return;
                        console.log('DEBUG processVideo: API4 Download initiation data:', data);
                        // No specific action needed from 'data' here, success is determined by polling
                    })
                    .catch(apiError => {
                        if (apiError.name === 'AbortError') {
                            console.warn('DEBUG processVideo: API4 Download fetch aborted via signal.');
                        } else {
                            console.error('DEBUG processVideo: API4 Download initiation error:', apiError);
                            // Don't throw here to allow polling to potentially still find the file if API call failed but download started
                        }
                    });
            }

            // Polling logic
            const checkInterval = 7000;
            const maxCheckAttempts = Math.floor(230000 / checkInterval); // Approx 3.8 mins of polling
            let currentAttempt = 0;

            const pollForFile = async () => {
                while (currentAttempt < maxCheckAttempts) {
                    if (signal && signal.aborted) throw new Error('Request aborted during polling.');
                    console.log(`DEBUG processVideo: Polling attempt ${currentAttempt + 1}/${maxCheckAttempts} for: ${sanitizedFilenameForCdnPath} on fvsrv1`);
                    try {
                        // Check using the sanitized filename
                        const fileNowExists = await checkFileExists(sanitizedFilenameForCdnPath, signal);
                        if (fileNowExists) {
                            const cdnUrl = `https://fvsrv1.b-cdn.net/${sanitizedFilenameForCdnPath}`;
                            console.log(`DEBUG processVideo: File found after polling on fvsrv1! Setting streaming URL: ${cdnUrl}`);
                            setStreamingUrl(cdnUrl);
                            setProcessingStatus('ready');
                            if(playing === false && hasStarted === true) setPlaying(true);
                            setRetryCount(0); setIsRetrying(false);
                            return true; // File found
                        }
                    } catch (checkError) {
                        console.error(`DEBUG processVideo: Error in polling check attempt ${currentAttempt + 1}:`, checkError);
                        if (checkError.name === 'AbortError') throw checkError; // Propagate abort
                        // Other errors (network, etc.) continue polling up to max attempts
                    }
                    currentAttempt++;
                    if (currentAttempt < maxCheckAttempts && !(signal && signal.aborted)) {
                        await new Promise(resolve => setTimeout(resolve, checkInterval));
                    }
                }
                return false; // File not found after all attempts
            };

            const fileFoundAfterPolling = await pollForFile();
            if (!fileFoundAfterPolling && !(signal && signal.aborted) ) {
                throw new Error(`Content is taking longer than usual to prepare after ${maxCheckAttempts} attempts (auto source).`);
            }
            if (signal && signal.aborted) {
                console.log("DEBUG processVideo: Polling aborted by signal (auto source).");
                // Error will be new Error('Request aborted during polling.')
            }
        } // End of if (isAutoQualitySource) for download block

    } catch (error) {
        console.error('DEBUG processVideo: Error in main try block ->', error.name, error.message, error);
        if (error.name === 'AbortError' || (error.message && error.message.toLowerCase().includes('aborted'))) {
            console.log('DEBUG processVideo: Processing was aborted.');
            if (processingStatus !== 'error') { // Don't overwrite an existing error state with idle if aborted from error
                setProcessingStatus('idle'); // Or 'aborted' if you want a specific state
            }
            setErrorMessage('Video loading cancelled.'); // Set a user-friendly message for abort
            // Do not retry if aborted by user action (e.g., quality change)
            return; // Stop further processing or retries
        }

        // For other errors
        setProcessingStatus('error');
        setErrorMessage(error.message || 'Failed to process video. Please try again.');

        // Retry logic specifically for auto sources or if enabled for specific sources
        if (isAutoQualitySource && retryCount < maxRetries && !isRetrying) { // Added !isRetrying to prevent parallel retries
            console.log(`DEBUG processVideo: Retrying... (Attempt ${retryCount + 1}/${maxRetries}) for URL: ${urlToProcessInitially}`);
            setIsRetrying(true); // Mark as retrying
            setRetryCount(prev => prev + 1);
            await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1) )); // Exponential backoff can be added

            const newAbortController = new AbortController(); // New controller for the retry attempt
            activeRequestRef.current = newAbortController; // Update the active request ref
            // Call processVideo again with the original URL for the auto source
            await processVideo(urlToProcessInitially, newAbortController.signal, isAutoQualitySource);
            // setIsRetrying(false); // This should be set inside processVideo on success/final failure or here if it returns
        } else {
            console.log("DEBUG processVideo: Max retries reached or not an auto source for retry, or already retrying.");
            setIsRetrying(false); // Ensure isRetrying is reset if retries exhausted or not applicable
        }
    } finally {
        if (processingTimeoutRef.current) {
            clearTimeout(processingTimeoutRef.current);
            processingTimeoutRef.current = null;
        }
        // If the process finishes (success or final error) and it was a retry, reset isRetrying
        // This might be better placed at the start of a successful path or end of error path if not retrying further.
        // For simplicity, if it's no longer retrying (max retries or success), isRetrying will be false.
        // If retrying, the recursive call will manage its own state.
        if (processingStatus === 'ready' || (processingStatus === 'error' && retryCount >= maxRetries)) {
            setIsRetrying(false);
        }
    }
  };


  const handleRetry = async () => {
    console.log("DEBUG: Manual Retry Initiated for quality:", selectedQuality);
    setRetryCount(0);       // Reset retry count for manual retry
    setIsRetrying(false);   // Ensure isRetrying is false before starting
    setErrorMessage('');
    setProcessingStatus('idle'); // Reset status
    setStreamingUrl(null);   // Clear current stream

    if (!processingInitiated) setProcessingInitiated(true); // Ensure processing is marked as initiated

    // To re-trigger the useEffect for processSelectedQuality, we can briefly change selectedQuality
    // This is a common pattern to force re-evaluation.
    const currentQuality = selectedQuality;
    // setSelectedQuality(''); // Clear it momentarily - this can cause issues if "" is not a valid intermediate state
    // A better way might be to directly call the processing logic if selectedQuality itself doesn't need to change
    // For now, let's assume the original method of re-setting selectedQuality is preferred.
    // However, directly calling the logic might be cleaner:

    // Option 1: Re-set selectedQuality (original approach)
    // setSelectedQuality('');
    // setTimeout(() => setSelectedQuality(currentQuality), 0);

    // Option 2: Directly re-invoke the core logic of processSelectedQuality
    // This avoids issues with intermediate state changes of selectedQuality if "" is not handled well by other useEffects.
    // We need a new AbortController for this manual retry.
    cancelActiveRequest(); // Cancel any existing request
    const controller = new AbortController();
    activeRequestRef.current = controller;

    setVideoMetadataLoaded(false);
    setIsPlayerReady(false);
    setPlayed(0);
    setCurrentTime(0);
    setDuration(0);

    // Re-run the logic based on `currentQuality`
    if (currentQuality === 'auto') {
        setProcessingStatus('checking');
        if (mainSource) {
            await processVideo(mainSource, controller.signal, true);
        } else if (naijaRocks) {
            await processVideo(naijaRocks, controller.signal, true); // Or with fetchActualUrlNaija logic
        } else {
            // ... logic if no mainSource/naijaRocks for auto ...
             const bestQualityFromList = qualities.find(q => q !== 'auto');
            if (bestQualityFromList) {
                setSelectedQuality(bestQualityFromList); // This will trigger naturally
            } else {
                setProcessingStatus('error');
                setErrorMessage('No sources available to retry for auto quality.');
                activeRequestRef.current = null;
            }
        }
    } else {
        // Logic for specific quality retry
        let sourceToPlay = null;
        let sourceType = '';
        if (sources2 && sources2.length > 0) {
            sourceToPlay = sources2.find(s => getResolutionNumber(s.quality).toString() === currentQuality);
            if (sourceToPlay) sourceType = 'sources2';
        }
        if (!sourceToPlay && sources && sources.length > 0) {
            sourceToPlay = sources.find(s => getResolutionNumber(s.quality).toString() === currentQuality);
            if (sourceToPlay) sourceType = 'sources';
        }

        if (sourceToPlay?.downloadLink) {
            // Re-apply the direct CDN / processVideo logic
            const originalUrl = sourceToPlay.downloadLink;
            const transformedCdnUrl = replaceDomainWithCDN(originalUrl);
            let playDirectly = false;
            let urlToPlayDirectly = '';

            if (transformedCdnUrl !== originalUrl) {
                urlToPlayDirectly = transformedCdnUrl;
                playDirectly = true;
            } else {
                const targetCdnDomains = Object.values(GLOBAL_DOMAIN_MAPPINGS);
                if (targetCdnDomains.some(cdnDomain => originalUrl.startsWith(cdnDomain))) {
                    urlToPlayDirectly = originalUrl;
                    playDirectly = true;
                }
            }

            if (playDirectly) {
                setStreamingUrl(urlToPlayDirectly);
                setProcessingStatus('ready');
                setOriginalFilenameForSubtitle(urlToPlayDirectly.split('/').pop() || `cdn_video_${Date.now()}`);
                setCurrentSourcesType(sourceType);
                if(playing === false && hasStarted === true) setPlaying(true);
                activeRequestRef.current = null;
            } else if (originalUrl.includes('dl4.sermovie')) {
                setProcessingStatus('blocked');
                setErrorMessage('Video will soon be available for streaming (dl4.sermovie)');
                activeRequestRef.current = null;
            } else {
                setCurrentSourcesType(sourceType);
                await processVideo(originalUrl, controller.signal, false);
            }
        } else {
            setProcessingStatus('error');
            setErrorMessage(`No source link available to retry for quality: ${currentQuality}p`);
            activeRequestRef.current = null;
        }
    }
  };


  useEffect(() => {
    const availableQualitiesSet = new Set();
    if (mainSource || naijaRocks) {
      availableQualitiesSet.add('auto');
    }
    const qualitiesFromSources2 = sources2?.map(source => {
      const resolution = getResolutionNumber(source.quality);
      return resolution ? resolution.toString() : null;
    }).filter(Boolean) || [];
    qualitiesFromSources2.forEach(q => availableQualitiesSet.add(q));

    const qualitiesFromSources1 = sources?.map(source => {
      const resolution = getResolutionNumber(source.quality);
      return resolution ? resolution.toString() : null;
    }).filter(Boolean) || [];
    qualitiesFromSources1.forEach(q => availableQualitiesSet.add(q));

    const availableQualities = Array.from(availableQualitiesSet).sort((a, b) => {
      if (a === 'auto') return -1; // 'auto' always first
      if (b === 'auto') return 1;
      return parseInt(b) - parseInt(a); // Sort numerically, descending (e.g., 1080, 720, 480)
    });

    console.log("DEBUG: Available qualities set:", availableQualities);
    setQualities(availableQualities);

    if (availableQualities.length > 0) {
      // If selectedQuality is not set, or not in the new list, set a default.
      // Prioritize 'auto' if available from mainSource/naijaRocks, else highest quality.
      if (!selectedQuality || !availableQualities.includes(selectedQuality)) {
        const initialQuality = (mainSource || naijaRocks) ? 'auto' : availableQualities[0];
        console.log("DEBUG: Setting initial quality (or resetting due to source change):", initialQuality);
        setSelectedQuality(initialQuality);
      }
    } else {
      setSelectedQuality(''); // No qualities available
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources, sources2, mainSource, naijaRocks]); // Only re-run if actual sources change. selectedQuality changes are handled by the next useEffect.

  // Main useEffect for processing selected quality
  useEffect(() => {
    const processSelectedQuality = async () => {
      if (!processingInitiated || !selectedQuality) {
        console.log("DEBUG processSelectedQuality: Skipped - processing not initiated or no quality selected.", {processingInitiated, selectedQuality});
        return;
      }
      console.log("DEBUG processSelectedQuality: Starting for quality -", selectedQuality);

      cancelActiveRequest(); // Cancel any previous request
      const controller = new AbortController();
      activeRequestRef.current = controller; // Set the new active controller

      setStreamingUrl(null);
      setVideoMetadataLoaded(false);
      setIsPlayerReady(false);
      setPlayed(0);
      setCurrentTime(0);
      setDuration(0);
      setErrorMessage(''); // Clear previous errors for the new attempt

      if (selectedQuality === 'auto') {
        setProcessingStatus('checking');
        let autoSourceUrl = null;
        if (mainSource) {
            autoSourceUrl = mainSource;
            console.log("DEBUG processSelectedQuality: Processing mainSource for auto:", mainSource);
        } else if (naijaRocks) {
            autoSourceUrl = naijaRocks; // The processVideo will handle fetching actual URL for naijaRocks if it's an auto source
            console.log("DEBUG processSelectedQuality: Processing naijaRocks for auto (actual URL to be fetched by processVideo):", naijaRocks);
        }

        if (autoSourceUrl) {
             // Pass the original mainSource/naijaRocks URL to processVideo, it will resolve if needed (isAutoQualitySource = true)
            await processVideo(autoSourceUrl, controller.signal, true);
        } else {
          // Auto selected, but no mainSource or naijaRocks. Try best from list.
          const bestQualityFromList = qualities.find(q => q !== 'auto');
          if (bestQualityFromList) {
            console.log("DEBUG processSelectedQuality: Auto selected, no main/naija. Switching to best from list:", bestQualityFromList);
            setSelectedQuality(bestQualityFromList); // This will re-trigger this useEffect
          } else {
            setProcessingStatus('error');
            setErrorMessage('No sources available for auto quality and no direct sources found.');
            activeRequestRef.current = null; // Clear controller as no processVideo call
          }
        }
        return; // Exit after handling 'auto'
      }

      // Handle specific quality selection (non-auto)
      setProcessingStatus('checking');
      let sourceToPlay = null;
      let sourceType = '';

      if (sources2 && sources2.length > 0) {
        sourceToPlay = sources2.find(s => getResolutionNumber(s.quality).toString() === selectedQuality);
        if (sourceToPlay) sourceType = 'sources2';
      }
      if (!sourceToPlay && sources && sources.length > 0) {
        sourceToPlay = sources.find(s => getResolutionNumber(s.quality).toString() === selectedQuality);
        if (sourceToPlay) sourceType = 'sources';
      }

      if (sourceToPlay?.downloadLink) {
        const originalUrl = sourceToPlay.downloadLink;
        const transformedCdnUrl = replaceDomainWithCDN(originalUrl);

        let playDirectly = false;
        let urlToPlayDirectly = '';

        if (transformedCdnUrl !== originalUrl) {
          console.log(`DEBUG processSelectedQuality: CDN domain applied via replacement. Original: ${originalUrl}, New: ${transformedCdnUrl}`);
          urlToPlayDirectly = transformedCdnUrl;
          playDirectly = true;
        } else {
          const targetCdnDomains = Object.values(GLOBAL_DOMAIN_MAPPINGS);
          const isOriginalUrlAKnownCdnTarget = targetCdnDomains.some(cdnDomain => originalUrl.startsWith(cdnDomain));
          if (isOriginalUrlAKnownCdnTarget) {
            console.log(`DEBUG processSelectedQuality: Original URL (${originalUrl}) is already a known CDN target. Playing directly.`);
            urlToPlayDirectly = originalUrl;
            playDirectly = true;
          }
        }

        if (playDirectly) {
          setStreamingUrl(urlToPlayDirectly);
          setProcessingStatus('ready');
          const filenameForSubtitle = urlToPlayDirectly.split('/').pop().split('?')[0] || `cdn_video_${Date.now()}`;
          setOriginalFilenameForSubtitle(filenameForSubtitle);
          setCurrentSourcesType(sourceType);
          if(playing === false && hasStarted === true) setPlaying(true);

          activeRequestRef.current = null; // Clear controller as processVideo is skipped
          return;
        }

        // If not playing directly, proceed with dl4 check or processVideo
        console.log(`DEBUG processSelectedQuality: No direct CDN path. Processing specific quality ${selectedQuality} from ${sourceType}: ${originalUrl}`);
        if (originalUrl.includes('dl4.sermovie')) {
          setProcessingStatus('blocked');
          setErrorMessage('Video will soon be available for streaming (dl4.sermovie)');
          activeRequestRef.current = null; // Clear controller
          return;
        }
        setCurrentSourcesType(sourceType);
        await processVideo(originalUrl, controller.signal, false); // isAutoQualitySource is false for specific qualities

      } else {
        console.error(`DEBUG processSelectedQuality: No download link found for selected quality ${selectedQuality}`);
        setStreamingUrl(null);
        setProcessingStatus('error');
        setErrorMessage(`No source link available for selected quality: ${selectedQuality}p`);
        activeRequestRef.current = null; // Clear controller
      }
    };

    processSelectedQuality();

    // Cleanup for this effect: if the effect re-runs (e.g., selectedQuality changes),
    // cancelActiveRequest() at the start of processSelectedQuality handles the previous controller.
    // No explicit return () => cancelActiveRequest() here, as it's done at the beginning.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuality, processingInitiated, mainSource, naijaRocks, sources, sources2, qualities]); // `qualities` added as per original


const onFullscreenChange = useCallback(() => {
  const isNowFullscreen = screenfull.isFullscreen;
  setIsFullscreen(isNowFullscreen);

  if (isNowFullscreen) {
    setShowControls(true);
    // Force show controls for longer in fullscreen
    if (controlsTimeout) clearTimeout(controlsTimeout);
    setControlsTimeout(setTimeout(hideControls, 5000)); // Show for 5 seconds
  } else {
    setShowControls(true); // Always show controls when exiting fullscreen
  }
}, [playing, showControlsWithTimeout]);


  useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on('change', onFullscreenChange);
    }
    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', onFullscreenChange);
      }
    };
  }, [onFullscreenChange]);// Re-bind if onFullscreenChange itself changes


  useEffect(() => {
    if (subtitleTracks.length > 1 && hasStarted) {
      setShowSubtitleTooltip(true);
      const timer = setTimeout(() => {
        setShowSubtitleTooltip(false);
      }, 7000);
      return () => clearTimeout(timer);
    } else {
      setShowSubtitleTooltip(false); // Ensure it's hidden if conditions aren't met
    }
  }, [subtitleTracks, hasStarted]);

  const showSubtitleChangeNotification = (message) => {
    setSubtitleChangeMessage(message);
    setShowSubtitleChangeMessage(true);
    setTimeout(() => {
      setShowSubtitleChangeMessage(false);
      setSubtitleChangeMessage('');
    }, 3000);
  };

  useEffect(() => {
    const videoElement = playerRef.current?.getInternalPlayer();
    if (videoElement && isPlayerReady) { // Ensure player is ready before manipulating tracks
        // Clear existing track elements to avoid duplicates if this runs multiple times
        const existingTrackElements = videoElement.querySelectorAll('track');
        existingTrackElements.forEach(trackEl => trackEl.remove());
        console.log('DEBUG SUB: Cleared existing <track> elements.');

        if (subtitleTracks.length > 0 && currentSubtitleIndex >= 0 && currentSubtitleIndex < subtitleTracks.length) {
            const currentTrackInfo = subtitleTracks[currentSubtitleIndex];
            if (currentTrackInfo && currentTrackInfo.src) {
                console.log(`DEBUG SUB: Attempting to add track: ${currentTrackInfo.label}, src: ${currentTrackInfo.src}`);
                const trackElement = document.createElement('track');
                trackElement.kind = currentTrackInfo.kind || 'subtitles';
                trackElement.label = currentTrackInfo.label || `Track ${currentSubtitleIndex + 1}`;
                trackElement.srclang = currentTrackInfo.srcLang || 'en';
                trackElement.src = currentTrackInfo.src;
                trackElement.default = true; // Set as default to encourage loading

                videoElement.appendChild(trackElement);
                console.log('DEBUG SUB: Appended new <track> element.');

                // Force update of TextTrackList and set mode after a short delay
                // This helps ensure the track is registered before its mode is set.
                setTimeout(() => {
                    if (videoElement.textTracks && videoElement.textTracks.length > 0) {
                        // Find the newly added track, usually the last one
                        // Or better, find by src if possible, but label/srclang might not be unique immediately
                        let addedTextTrack = null;
                        for (let i = 0; i < videoElement.textTracks.length; i++) {
                            if (videoElement.textTracks[i].label === currentTrackInfo.label && videoElement.textTracks[i].language === currentTrackInfo.srclang) {
                                addedTextTrack = videoElement.textTracks[i];
                                break;
                            }
                        }
                        if(!addedTextTrack && videoElement.textTracks.length > 0) { // Fallback to last track if not found by label/lang
                            addedTextTrack = videoElement.textTracks[videoElement.textTracks.length-1];
                        }


                        if (addedTextTrack) {
                            console.log(`DEBUG SUB: Setting mode for track: "${addedTextTrack.label}" (mode: ${addedTextTrack.mode}) to ${subtitlesEnabled ? 'showing' : 'hidden'}`);
                            addedTextTrack.mode = subtitlesEnabled ? 'showing' : 'hidden';
                             // Forcibly re-render cues if needed, though usually mode change is enough
                            if (subtitlesEnabled && addedTextTrack.cues) {
                                // console.log("DEBUG SUB: Cues found:", addedTextTrack.cues.length);
                            }
                        } else {
                            console.warn("DEBUG SUB: Added text track not found in videoElement.textTracks immediately.");
                        }
                    } else {
                        console.warn("DEBUG SUB: videoElement.textTracks is empty or not available after appending track.");
                    }
                }, 250); // Increased delay slightly
            } else {
                console.log('DEBUG SUB: Current track info or src is missing.');
            }
        } else {
            console.log('DEBUG SUB: No subtitle tracks available or currentSubtitleIndex is out of bounds.');
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitleTracks, currentSubtitleIndex, subtitlesEnabled, isPlayerReady]); // Rerun when these change


  const handlePlayerReady = () => {
    console.log("DEBUG: Player ready. Streaming URL:", streamingUrl);
    const videoElement = playerRef.current?.getInternalPlayer();
    if (videoElement) {
      if (!document.getElementById('custom-subtitle-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-subtitle-styles';
        // Apply more specific selectors if needed
        style.textContent = `
          video::cue {
            bottom: ${isMobile ? '50px' : '60px'} !important; /* Adjust based on controls height */
            position: relative !important; /* May not be needed if bottom works well */
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black;
            font-size: ${isMobile ? '0.9em' : '1.1em'};
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
            line-height: 1.35;
            white-space: pre-line; /* Respect newlines in VTT */
            padding: 0.25em 0.45em;
            border-radius: 4px;
          }
          /* For browsers that use ::-webkit-media-text-track-container */
          .react-player video::-webkit-media-text-track-container {
            bottom: ${isMobile ? '50px' : '60px'} !important;
          }
          .react-player video::-webkit-media-text-track-display-backdrop {
            background-color: transparent !important; /* Remove default backdrop */
          }
        `;
        document.head.appendChild(style);
      }

      videoElement.textTracks.onaddtrack = (e) => {
        console.log('DEBUG SUB: TextTrackList onaddtrack event. Track added:', e.track?.label, e.track?.src, e.track?.mode);
        // The mode setting is handled by the useEffect [subtitleTracks, currentSubtitleIndex, ...]
        // but we can ensure it here too if needed for tracks added by ReactPlayer internally
        // if (e.track && subtitlesEnabled && e.track.mode !== 'showing') {
        //   e.track.mode = 'showing';
        // } else if (e.track && !subtitlesEnabled && e.track.mode !== 'hidden') {
        //   e.track.mode = 'hidden';
        // }
      };
      videoElement.textTracks.onremovetrack = (e) => {
        console.log('DEBUG SUB: TextTrackList onremovetrack event. Track removed:', e.track?.label);
      };


      if (videoElement.readyState >= 1 /* HAVE_METADATA */ || videoElement.duration > 0) {
        console.log("DEBUG: Player ready - metadata already loaded or duration available.");
        setVideoMetadataLoaded(true);
        setIsPlayerReady(true); // Mark player as fully ready
        setIsBuffering(false); // Ensure buffering is false
        if(duration === 0 && videoElement.duration) setDuration(videoElement.duration); // Sync duration if needed

        if(playing === false && hasStarted === true && processingStatus === 'ready' && streamingUrl) {
            console.log("DEBUG: Player ready, attempting to play due to hasStarted and ready status.");
            setPlaying(true);
        }
      } else {
        console.log("DEBUG: Player ready - waiting for loadedmetadata event.");
        const handleLoadedMetadata = () => {
          console.log("DEBUG: loadedmetadata event fired.");
          setVideoMetadataLoaded(true);
          setIsPlayerReady(true); // Mark player as fully ready
          setIsBuffering(false); // Ensure buffering is false
          if(duration === 0 && videoElement.duration) setDuration(videoElement.duration);

          if(playing === false && hasStarted === true && processingStatus === 'ready' && streamingUrl) {
            console.log("DEBUG: loadedmetadata, attempting to play.");
            setPlaying(true);
          }
          videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
          videoElement.removeEventListener('durationchange', handleLoadedMetadata); // Also listen for durationchange
        };
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('durationchange', handleLoadedMetadata); // Sometimes duration comes slightly later
      }
    } else {
        console.warn("DEBUG: Player ready called, but internal player not found.");
    }
  };


  const handleBuffer = () => {
    // Only set buffering if player is ready, metadata loaded, and supposed to be playing
    if (isPlayerReady && videoMetadataLoaded && playing) {
      console.log("DEBUG: Video buffering started...");
      setIsBuffering(true);
      if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
      bufferingTimeoutRef.current = setTimeout(() => {
          if(isBuffering) { // Check if still buffering after 10s
             console.warn("DEBUG: Buffering seems persistent after 10s. Potential network issue or stream problem.");
             // Optionally, you could try to nudge the player or show a message here
          }
      }, 10000); // 10 seconds timeout for persistent buffering warning
    }
  };

  const handleBufferEnd = () => {
    // console.log("DEBUG: Video buffering ended.");
    setIsBuffering(false);
    if (bufferingTimeoutRef.current) {
      clearTimeout(bufferingTimeoutRef.current);
      bufferingTimeoutRef.current = null;
    }
  };

  const handleProgress = (state) => {
    if (!seeking) { // Only update if not currently seeking via slider
      setPlayed(state.played); // played is 0-1 fraction
      setCurrentTime(state.playedSeconds);

      // If progress is made and we were in buffering state, clear it.
      if (isBuffering && state.playedSeconds > lastPlayedTime) {
        setIsBuffering(false);
        if (bufferingTimeoutRef.current) {
            clearTimeout(bufferingTimeoutRef.current);
            bufferingTimeoutRef.current = null;
        }
      }
      setLastPlayedTime(state.playedSeconds);
    }
  };

  const handlePlayPause = useCallback(() => {
    console.log("DEBUG: handlePlayPause called. Current playing state:", playing, "Has started:", hasStarted, "Processing status:", processingStatus, "Streaming URL:", !!streamingUrl);

    if (!hasStarted) {
        console.log("DEBUG: First play action, setting hasStarted to true.");
        setHasStarted(true); // Mark that user interaction has begun
        setShowInitialPlayButton(false); // Hide the big play button
        if (!processingInitiated) {
            console.log("DEBUG: First play & processing not yet initiated. Triggering processing.");
            setProcessingInitiated(true); // This will trigger quality selection useEffect
        }
        // If already processing or ready, this will just toggle play state below
    }

    const videoElement = playerRef.current?.getInternalPlayer();

    if (isIOS && videoElement) { // Special handling for iOS programmatic play/pause
        if (!playing) {
            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setPlaying(true);
                    console.log("iOS: Play initiated successfully via promise.");
                }).catch(error => {
                    console.error("iOS play() failed:", error);
                    // Common error: NotAllowedError if not user-initiated or other restrictions
                    if (error.name === 'NotAllowedError') {
                        // Show initial play button again or a message if auto-play failed
                        setShowInitialPlayButton(true);
                        setHasStarted(false); // Reset hasStarted if play was disallowed
                        setErrorMessage("Playback was not allowed by the browser. Please click play again.");
                    }
                    setPlaying(false); // Ensure playing state is false
                });
            } else { // Fallback if promise is not returned (older iOS versions might not)
                setPlaying(true);
            }
        } else {
            videoElement.pause();
            setPlaying(false);
            console.log("iOS: Pause initiated.");
        }
    } else { // Non-iOS or no direct video element access needed
        if (processingStatus === 'ready' && streamingUrl) {
            // If ready to play, toggle playing state
            setPlaying(!playing);
        } else if (!playing && (processingStatus === 'idle' || processingStatus === 'error') && !streamingUrl && hasStarted && !processingInitiated) {
            // If trying to play, but not ready and processing hasn't started (e.g. after an error and manual play click)
            console.log("DEBUG: Play action, but no stream URL and processing not active. Re-initiating processing.");
            setShowInitialPlayButton(false); // Ensure big play button is hidden
            setProcessingInitiated(true); // Trigger quality selection
        } else if (playing && (!streamingUrl || processingStatus !== 'ready')) {
            // If it was playing but became not ready (e.g. URL became null), set playing to false
            console.log("DEBUG: Was playing, but stream became unavailable. Setting playing to false.");
            setPlaying(false);
        }
    }
    showControlsWithTimeout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, hasStarted, isIOS, showControlsWithTimeout, processingInitiated, processingStatus, streamingUrl, qualities]);


  const handleError = (e) => {
    console.error('ReactPlayer Error:', e, "URL:", streamingUrl);
    setIsBuffering(false); // Stop buffering indicator on error
    // Don't set processingStatus to 'error' here directly as it might conflict with processVideo's error handling.
    // Instead, set a general playback error message. `processVideo` handles errors related to fetching/preparing.
    // This handleError is for playback errors from ReactPlayer itself.
    setErrorMessage("Video playback error. The video format might not be supported or there was a network issue. Try a different quality or refreshing.");
    // Consider if playing should be set to false
    setPlaying(false);
    // Optionally, you could try to re-trigger processVideo for the current quality if it's a recoverable error,
    // but that can lead to loops. For now, just display error and let user retry/change quality.
  };

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    // More robust mobile detection
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && !window.MSStream); // iPadOS 13+
    const isAndroidDevice = /android/i.test(userAgent);
    const isTelegramEnv = userAgent.includes('telegram');

    setIsMobile(isMobileDevice || isTelegramEnv); // Consider Telegram webview as mobile-like
    setIsAndroid(isAndroidDevice || (isTelegramEnv && isAndroidDevice)); // Android within Telegram

    console.log("DEBUG: Mobile detection:", {isMobileDevice, isAndroidDevice, isTelegramEnv, finalIsMobile: isMobile || isTelegramEnv, finalIsAndroid: isAndroid || (isTelegramEnv && isAndroidDevice)});

  }, []);


  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (newVolume > 0) setPrevVolume(newVolume); // Store last non-zero volume
    showControlsWithTimeout();
  };

  const handleSeekMouseDown = () => {
      setSeeking(true);
  };
  const handleSeekChange = (e) => {
      setPlayed(parseFloat(e.target.value));
      // Optional: For live seeking display, update currentTime based on new played value
      // setCurrentTime(parseFloat(e.target.value) * duration);
  };
  const handleSeekMouseUp = (e) => {
    if (playerRef.current) {
        playerRef.current.seekTo(parseFloat(e.target.value)); // Seek to fraction
    }
    setSeeking(false);
    showControlsWithTimeout();
  };


  const handleFullscreen = () => {
    if (screenfull.isEnabled && containerRef.current) {
      screenfull.toggle(containerRef.current).catch(err => {
        console.warn("Screenfull toggle on container failed, trying video element directly or other fallbacks:", err);
        const videoElement = playerRef.current?.getInternalPlayer();
        if (videoElement) {
          if (document.fullscreenElement === videoElement) { // Already fullscreen using video element
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
          } else { // Request fullscreen on video element
            if (videoElement.requestFullscreen) videoElement.requestFullscreen({ navigationUI: "hide" });
            else if (videoElement.mozRequestFullScreen) videoElement.mozRequestFullScreen({ navigationUI: "hide" });
            else if (videoElement.webkitRequestFullscreen) videoElement.webkitRequestFullscreen(); // Might not support options
            else if (videoElement.msRequestFullscreen) videoElement.msRequestFullscreen();
          }
        }
      });
    } else { // Screenfull not enabled or containerRef not available, try direct video element methods
      const videoElement = playerRef.current?.getInternalPlayer();
      if (videoElement) {
        if (document.fullscreenElement === videoElement || document.webkitFullscreenElement === videoElement || document.mozFullScreenElement === videoElement || document.msFullscreenElement === videoElement) {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
          else if (document.msExitFullscreen) document.msExitFullscreen();
        } else {
          if (videoElement.requestFullscreen) videoElement.requestFullscreen({ navigationUI: "hide" });
          else if (videoElement.webkitRequestFullscreen) videoElement.webkitRequestFullscreen();
          else if (videoElement.mozRequestFullScreen) videoElement.mozRequestFullScreen({ navigationUI: "hide" });
          else if (videoElement.msRequestFullscreen) videoElement.msRequestFullscreen();
        }
      } else {
          console.warn("Fullscreen not supported or player element not found.");
      }
    }
    showControlsWithTimeout(); // Show controls briefly after toggling fullscreen
  };


  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity || seconds < 0) return '00:00';
    const date = new Date(0);
    date.setSeconds(seconds);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const handleDoubleTap = () => { // For mobile, double tap on video area could toggle fullscreen
    if (isMobile) { // Only for mobile UX
        handleFullscreen();
        // Additional logic for Telegram/Android if needed for objectFit (as per original)
        const videoElement = playerRef.current?.getInternalPlayer();
        if (videoElement && window.TelegramWebViewProxy && !screenfull.isFullscreen) { // When entering fullscreen-like state
            // videoElement.style.objectFit = 'contain';
            // videoElement.style.backgroundColor = 'black';
        }
    }
  };

  const handleTouchStart = (e) => { // On the main container
    // Ignore if touch is on interactive elements like range slider, select, button
    if (e.target.type === 'range' || e.target.tagName === 'SELECT' || e.target.closest('button') || controlsRef.current?.contains(e.target)) {
        return;
    }

    const currentTimeVal = new Date().getTime();
    const timeDiff = currentTimeVal - lastTapTime;

    if (timeDiff < 300 && timeDiff > 0) { // Double tap
      clearTimeout(clickTimeoutRef.current); // Prevent single tap action
      clickTimeoutRef.current = null;
      handleDoubleTap(); // Toggle fullscreen on double tap (mobile)
      setLastTapTime(0); // Reset tap time
    } else { // Single tap
      setLastTapTime(currentTimeVal);
      // For single tap, if controls are shown, a tap outside controls could hide them
      // If controls are hidden, a tap could show them
      // This is similar to handleVideoClick's single click logic
      clickTimeoutRef.current = setTimeout(() => {
            if (playing) {
                setShowControls(prevShowControls => {
                    if (!prevShowControls) showControlsWithTimeout(); // If showing, start timer to hide
                    return !prevShowControls;
                });
            } else if (hasStarted && streamingUrl && processingStatus === 'ready') {
                 handlePlayPause();
            }
            clickTimeoutRef.current = null;
      }, 250);
    }
  };


  // Derived states for rendering logic
  const showProcessingOverlay = (processingStatus === 'checking' || processingStatus === 'downloading') && !showInitialPlayButton && processingInitiated;
  const showLoadingSpinner = isBuffering || (processingStatus === 'ready' && !videoMetadataLoaded && hasStarted && !showInitialPlayButton && streamingUrl);
  const showPlayButtonOverlay = (!playing && hasStarted && processingStatus === 'ready' && streamingUrl && !showInitialPlayButton && !isBuffering && videoMetadataLoaded);
  const showErrorOverlay = processingStatus === 'error' && !showInitialPlayButton && (errorMessage || (selectedQuality && !streamingUrl));


  useEffect(() => {
    // Logic for fullscreen tooltip (double tap hint)
    if (isMobile && hasStarted && playing && !isFullscreen && !showControls) { // Show when playing, not fullscreen, controls hidden
        if (fullscreenTooltipTimeoutRef.current) clearTimeout(fullscreenTooltipTimeoutRef.current);
        setShowFullscreenTooltip(true);
        fullscreenTooltipTimeoutRef.current = setTimeout(() => {
            setShowFullscreenTooltip(false);
        }, 4000); // Show for 4 seconds
    } else {
        setShowFullscreenTooltip(false);
        if (fullscreenTooltipTimeoutRef.current) clearTimeout(fullscreenTooltipTimeoutRef.current);
    }
    return () => {
        if (fullscreenTooltipTimeoutRef.current) clearTimeout(fullscreenTooltipTimeoutRef.current);
    };
  }, [isMobile, hasStarted, playing, isFullscreen, showControls]);


  return (<>
    <h2 className="text-2xl font-bold p-4 text-center">Stream Now</h2>
     <div
      ref={containerRef}
      className="bg-black rounded-xl overflow-hidden shadow-xl relative group lg:max-w-4xl mx-auto"
      onMouseMove={isMobile ? undefined : showControlsWithTimeout} // This is correct for desktop
      onMouseLeave={isMobile ? undefined : () => { if (!isFullscreen && playing && !seeking) hideControls();}}
      onTouchStart={handleTouchStart}
      onClick={isMobile ? undefined : handleVideoClick}
      style={{
        paddingBottom: (isAndroid && !isFullscreen) ? '50px' : '0px',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <div className={`flex items-center justify-center bg-black ${isFullscreen ? 'h-screen w-screen fixed top-0 left-0 z-[2147483647]' : 'aspect-video'}`} style={{backgroundColor: 'black'}}>
      {isFullscreen && (
    <div 
      className="absolute inset-0 z-20"
      onMouseMove={isMobile ? undefined : showControlsWithTimeout}
      onMouseLeave={isMobile ? undefined : () => { if (playing && !seeking) hideControls(); }}
      onClick={isMobile ? undefined : handleVideoClick}
      style={{pointerEvents: 'auto'}}
    />
  )}
        {/* Initial Big Play Button */}
        {showInitialPlayButton && (processingStatus === 'idle' || processingStatus === 'error' || !streamingUrl) && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer z-20 bg-black/30" onClick={handleInitialPlay}>
            <button className="group relative" aria-label="Start video">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform scale-110 group-hover:scale-125 rounded-full bg-blue-500 opacity-75 animate-pulse-fast"
                style={{ padding: 'calc(48px * 0.6)' }} ></div>
              <div className="relative bg-black/50 rounded-full p-4 transition-transform group-hover:scale-110">
                <FaPlay className="text-white text-4xl" />
              </div>
            </button>
          </div>
        )}

        {/* Blocked Status Overlay */}
        {processingStatus === 'blocked' && !showInitialPlayButton && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-4">
            <div className="text-white text-lg text-center">
              {errorMessage || 'Video will soon be available for streaming'}
            </div>
          </div>
        )}

        {/* Processing Overlay (Checking/Downloading) */}
        {showProcessingOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
            <FaSpinner className="animate-spin text-white text-4xl mb-4" />
            <span className="text-white">
              {processingStatus === 'downloading' ? 'Preparing video...' :
               processingStatus === 'checking' ? 'Checking source...' :
               'Loading...'}
            </span>
          </div>
        )}

        {/* Video Player Area */}
        {((processingStatus === 'ready' && streamingUrl) || (hasStarted && streamingUrl && !showInitialPlayButton) ) && (
          <>
            {showSubtitleChangeMessage && subtitleChangeMessage && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm p-2 rounded-md z-30 shadow-lg">
                {subtitleChangeMessage}
              </div>
            )}
            {showSubtitleTooltip && subtitleTracks.length > 1 && (
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-gray-800/80 text-white text-xs p-2 rounded-md z-30 text-center shadow-lg">
                Subtitles out of sync? Use <FaChevronLeft size={10} className="inline align-baseline"/> <FaChevronRight size={10} className="inline align-baseline"/> next to <FaClosedCaptioning size={12} className="inline align-baseline"/> to switch.
              </div>
            )}
            {isTelegram && showTelegramTooltip && (
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs md:text-sm p-2 rounded-md z-30 shadow">
                Fullscreen might not work well in Telegram. For best results, open in a dedicated browser.
              </div>
            )}

            {/* Play button overlay (when paused but ready) */}
            {showPlayButtonOverlay && (
              <div className="absolute inset-0 flex items-center justify-center cursor-pointer z-20" onClick={handlePlayPause} >
                <button className="group relative bg-black/40 rounded-full p-3 hover:bg-black/60 transition-colors" aria-label="Play video" >
                    <FaPlay className="text-white text-3xl md:text-4xl group-hover:scale-110 transition-transform" />
                </button>
              </div>
            )}

            {/* Mobile Mid-Screen Controls (when playing and controls are shown) */}
            {playing && showControls && isMobile && !isIOS && ( // !isIOS condition from original
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="flex items-center justify-around space-x-4 md:space-x-8 pointer-events-auto bg-black/40 p-2 md:p-3 rounded-lg shadow-xl">
                  <button onClick={handleBackward} className="text-white/85 hover:text-white hover:scale-110 transition-transform p-2 md:p-3 flex items-center justify-center rounded-full text-xs md:text-sm" aria-label="Backward 10 seconds">
                    <FaBackward size={isMobile ? 18 : 20} className="mr-1" /> -10s
                  </button>
                  <button onClick={handlePlayPause} className="text-white/85 hover:text-white hover:scale-125 transition-transform p-2 md:p-3 rounded-full" aria-label={playing ? "Pause video" : "Play video"}>
                    {playing ? <FaPause size={isMobile ? 24 : 28} /> : <FaPlay size={isMobile ? 24 : 28} />}
                  </button>
                  <button onClick={handleForward} className="text-white/85 hover:text-white hover:scale-110 transition-transform p-2 md:p-3 flex items-center justify-center rounded-full text-xs md:text-sm" aria-label="Forward 10 seconds">
                    +10s <FaForward size={isMobile ? 18 : 20} className="ml-1" />
                  </button>
                </div>
              </div>
            )}

            <div
              className={`video-wrapper w-full h-full ${isFullscreen ? '' : ''}`} // Ensure w-full h-full
              style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'black', transition: 'transform 0.3s ease' }}
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

        {/* Loading Spinner (Buffering or initial load after ready) */}
        {showLoadingSpinner && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
            <FaSpinner className="animate-spin text-white text-4xl" />
          </div>
        )}

        {/* Subtitle Loading Indicator */}
        {isSubtitleLoading && !showInitialPlayButton && processingStatus !== 'downloading' && processingStatus !== 'checking' && (
          <div className="absolute bottom-20 left-4 text-white text-xs md:text-sm bg-black/50 px-2 py-1 rounded z-20 shadow">
            Loading subtitles...
          </div>
        )}

        {/* Error Overlay */}
        {showErrorOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 z-10 text-center">
            <div className="text-red-400 mb-3 text-sm md:text-base">
              Error: {errorMessage}
            </div>
            {/* Retry button shown if it's an auto source or was a specific source that could be retried */}
            {(selectedQuality === 'auto' || currentSourcesType !== '' || (sources && sources.length > 0) || (sources2 && sources2.length >0)) && (
                 <button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm md:text-base shadow hover:shadow-lg transition-all" >
                    <FaRotate className={`mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                    Retry {isRetrying ? `(${retryCount}/${maxRetries})` : ''}
                </button>
            )}
          </div>
        )}

        {/* Fullscreen Tooltip */}
        {showFullscreenTooltip && ( // Conditions managed by useEffect
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs p-2 rounded-md z-30 whitespace-nowrap shadow">
            Double tap video for fullscreen
          </div>
        )}
        {/* iOS Playback Tip */}
        {isIOS && showIosTooltip && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm p-2 rounded-md z-30 whitespace-nowrap shadow">
            Playback issues on iOS? Try downloading the video.
          </div>
        )}

        {/* Controls Bar */}
        {((hasStarted && streamingUrl && !showInitialPlayButton) || (showControls && !showInitialPlayButton)) && ( // Show controls if video started or explicitly shown, and not initial play button
          <div
            ref={controlsRef}
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent p-2 md:p-3 transition-opacity duration-300 ${
              showControls ? 'opacity-100 z-20' : 'opacity-0 z-0 pointer-events-none'
            }`}
            onClick={(e) => e.stopPropagation()} // Prevent clicks on controls from bubbling to video area
            onTouchStart={(e) => e.stopPropagation()} // Prevent touches on controls from bubbling
          >
            {/* Progress Bar */}
            <div className="flex items-center space-x-2 mb-1.5 md:mb-2.5">
              <input
                type="range" min={0} max={1} step="any" value={played}
                onMouseDown={handleSeekMouseDown}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
                onTouchStart={handleSeekTouchStart}
                onTouchMove={handleSeekTouchMove}
                onTouchEnd={handleSeekTouchEnd}
                className="w-full h-1.5 md:h-2 bg-gray-500/70 rounded-lg appearance-none cursor-pointer range-thumb-blue transition-opacity hover:opacity-90"
                style={{
                    '--thumb-color': '#2563eb', // Blue-600
                    '--track-color': 'rgba(75, 85, 99, 0.7)', // Gray-500 with opacity
                    '--progress-color': '#3b82f6', // Blue-500
                    background: `linear-gradient(to right, var(--progress-color) 0%, var(--progress-color) ${played * 100}%, var(--track-color) ${played * 100}%, var(--track-color) 100%)`
                }}
                aria-label="Video progress"
              />
            </div>
            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between text-xs md:text-sm text-white">
              {/* Left Controls */}
              <div className="flex items-center space-x-2 md:space-x-3">
                <button onClick={handlePlayPause} className="text-white hover:text-gray-300 transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded" aria-label={playing ? "Pause" : "Play"}>
                  {playing ? <FaPause size={isMobile ? 16 : 18} /> : <FaPlay size={isMobile ? 16 : 18} />}
                </button>
                <button onClick={toggleMute} className="text-white hover:text-gray-300 transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded" aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}>
                  {isMuted || volume === 0 ? <FaVolumeMute size={isMobile ? 16 : 18} /> : <FaVolumeUp size={isMobile ? 16 : 18} />}
                </button>
                {/* Volume Slider (Desktop only for simplicity) */}
                {(!isMuted && !isMobile) && (
                  <input type="range" min={0} max={1} step="any" value={volume} onChange={handleVolumeChange}
                    className="w-14 md:w-20 h-1 bg-gray-600/80 rounded-lg appearance-none cursor-pointer range-thumb-sm-white"
                    style={{
                        background: `linear-gradient(to right, white 0%, white ${volume * 100}%, rgba(107, 114, 128, 0.8) ${volume * 100}%, rgba(107, 114, 128, 0.8) 100%)`
                    }}
                    aria-label="Volume"
                  />
                )}
                <div className="text-gray-300 tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-1.5 md:space-x-2.5">
                {/* Subtitle Controls */}
                {subtitleTracks.length > 0 && (
                  <div className="flex items-center space-x-0.5 md:space-x-1">
                    {subtitleTracks.length > 1 && (
                      <button onClick={() => { const newIndex = Math.max(currentSubtitleIndex - 1, 0); if (newIndex !== currentSubtitleIndex) {setCurrentSubtitleIndex(newIndex); showSubtitleChangeNotification(`Subtitles: ${subtitleTracks[newIndex]?.label || `Track ${newIndex + 1}`}`);} }}
                        disabled={currentSubtitleIndex === 0} className="text-white hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded" aria-label="Previous subtitle version">
                        <FaChevronLeft size={isMobile ? 12 : 14} />
                      </button>
                    )}
                    <button onClick={toggleSubtitles} className={`hover:text-gray-300 transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded ${subtitlesEnabled ? 'text-blue-400 hover:text-blue-300' : 'text-white'}`} title={subtitlesEnabled ? 'Disable subtitles' : 'Enable subtitles'}>
                      <FaClosedCaptioning size={isMobile ? 16 : 18} />
                    </button>
                    {subtitleTracks.length > 1 && (
                      <button onClick={() => { const newIndex = Math.min(currentSubtitleIndex + 1, subtitleTracks.length - 1); if (newIndex !== currentSubtitleIndex) {setCurrentSubtitleIndex(newIndex); showSubtitleChangeNotification(`Subtitles: ${subtitleTracks[newIndex]?.label || `Track ${newIndex + 1}`}`);} }}
                        disabled={currentSubtitleIndex === subtitleTracks.length - 1} className="text-white hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded" aria-label="Next subtitle version">
                        <FaChevronRight size={isMobile ? 12 : 14} />
                      </button>
                    )}
                  </div>
                )}
                {/* Quality Selector */}
                {qualities.length > 0 && (
                  <select value={selectedQuality} onChange={(e) => setSelectedQuality(e.target.value)}
                    className="bg-gray-700/80 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/80 appearance-none cursor-pointer"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', paddingRight: isMobile ? '1.25rem' : '1.5rem' }} // Add padding for custom arrow if any
                    aria-label="Select video quality"
                  >
                    {qualities.map(quality => (
                      <option key={quality} value={quality}>
                        {quality === 'auto' ? 'Auto' : `${quality}p`}
                      </option>
                    ))}
                  </select>
                )}
                {/* Rotate Button (Mobile Fullscreen) */}
                {isMobile && isFullscreen && (
                  <button onClick={handleRotate} className="text-white hover:text-gray-300 transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded" aria-label="Rotate screen">
                    <FaRotate size={isMobile ? 16 : 18} />
                  </button>
                )}
                {/* Fullscreen Button */}
                <button onClick={handleFullscreen} className="text-white hover:text-gray-300 transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                  <FaExpand size={isMobile ? 16 : 18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div></>
  );
};
export default EnhancedStreamingComponent;