"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaExpand, FaSpinner,FaClosedCaptioning,FaVolumeMute,FaForward, FaBackward,FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import screenfull from 'screenfull';
import { FaRotate } from 'react-icons/fa6';
import { act } from 'react';


const EnhancedStreamingComponent = ({ sources,movieTitle,sources2,mainSource,naijaRocks }) => {
console.log(`mainsuu`,mainSource)
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
  const [subtitleUrl, setSubtitleUrl] = useState(null);
  const [originalFilename, setOriginalFilename] = useState('');
  const [isSubtitleLoading, setIsSubtitleLoading] = useState(false);
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const subtitleTrackRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [prevVolume, setPrevVolume] = useState(1);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [currentSourcesType, setCurrentSourcesType] = useState('sources');
  const [showSubtitleTooltip, setShowSubtitleTooltip] = useState(false);
  const [subtitleChangeMessage, setSubtitleChangeMessage] = useState('');
  const [showSubtitleChangeMessage, setShowSubtitleChangeMessage] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false); // New state to detect Android
  const [showFullscreenTooltip, setShowFullscreenTooltip] = useState(false); // State for fullscreen tooltip
  const [fullscreenTooltipTimeoutRef] = useState(useRef(null));
  const [lastTapTime, setLastTapTime] = useState(0); // For double tap detection
  const [showInitialPlayButton, setShowInitialPlayButton] = useState(true);
  const [processingInitiated, setProcessingInitiated] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
const clickTimeoutRef = useRef(null);


  const playerRef = useRef(null);
  const controlsRef = useRef(null);
  const containerRef = useRef(null);
  const [isIOS, setIsIOS] = useState(false);

  const handleInitialPlay = () => {
    setShowInitialPlayButton(false);
    setProcessingInitiated(true);
    setPlaying(true);
    setHasStarted(true);
  };

  useEffect(() => {
    // Detect iOS device
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  const fetchActualUrl = async (url) => {
    console.log('Fetching actual URL for:', url);
    setIsBuffering(true);
    try {
      const actualUrl = await fetch(`https://api5.mp3vault.xyz/getDownloadUrl?url=${url}`);
      const data = await actualUrl.json();
      console.log('Received actual URL:', data.downloadUrl);
      return data.downloadUrl;
    } catch (error) {
      console.error('Error fetching actual URL:', error);
      return null;
    }
  };

  const fetchActualUrlNaija = async (url) => {
    console.log('Fetching actual URL for:', url);
    try {
      const actualUrl = await fetch(`https://api5.mp3vault.xyz/getNaijaDownloadUrl?url=${url}`);
      const data = await actualUrl.json();
      console.log('Received actual URL:', data.downloadUrl);
      return data.downloadUrl;
    } catch (error) {
      console.error('Error fetching actual URL:', error);
      return null;
    }
  };

 



  // Function to extract resolution number from quality string
  const getResolutionNumber = (quality) => {
    if (!quality) return 0;
    let match = quality.match(/(\d+)[pP]/);
    if (match) return parseInt(match[1]);
    match = quality.match(/(\d{3,4})/); // Fallback to match 3 or 4 digit numbers if 'p' is missing
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

  const toggleSubtitles = () => {
    const videoElement = playerRef.current?.getInternalPlayer();
    if (videoElement && videoElement.textTracks.length > 0) {
      const track = videoElement.textTracks[0];
      if (track) {
        track.mode = subtitlesEnabled ? 'hidden' : 'showing';
        setSubtitlesEnabled(!subtitlesEnabled);
      }
    }
  };


  const handleForward = () => {
    const player = playerRef.current;
    if (player) {
      const newTime = Math.min(currentTime + 10, duration);
      player.seekTo(newTime);
      showControlsWithTimeout();
    }
  };

  const handleBackward = () => {
    const player = playerRef.current;
    if (player) {
      const newTime = Math.max(currentTime - 10, 0);
      player.seekTo(newTime);
      showControlsWithTimeout();
    }
  };

  // Add mute toggle function
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Store the current volume before muting
      setVolume(prevVolume => {
        setPrevVolume(prevVolume);
        return 0;
      });
    } else {
      // Restore the previous volume when unmuting
      setVolume(prevVolume || 1);
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
      if (fullscreenTooltipTimeoutRef.current) {
        clearTimeout(fullscreenTooltipTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchSubtitle = async () => {
      console.log('=== Starting subtitle fetch process ===');
      console.log('Movie Title:', movieTitle);
      console.log('Original Filename:', originalFilename);

      if (!movieTitle || !originalFilename) {
        console.log('❌ Missing required data:', { movieTitle, originalFilename });
        return;
      }

      setIsSubtitleLoading(true);
      console.log('🔄 Set subtitle loading state to true');

      try {
        // First, check if the original subtitle exists in Wasabi/CDN
        const originalSubtitleFilename = `${originalFilename}.vtt`;
        const cdnSubtitleUrl = `https://filmvaultsub.b-cdn.net/${encodeURIComponent(originalSubtitleFilename)}`;

        console.log('🔍 Checking for original subtitle at CDN URL:', cdnSubtitleUrl);

        // Try to verify if the original subtitle exists
        const checkResponse = await fetch(cdnSubtitleUrl, { method: 'HEAD' });
        console.log('CDN Check Response Status:', checkResponse.status);

        if (checkResponse.ok) {
          console.log('✅ Original subtitle found in CDN, using existing file');
          setSubtitleUrl(cdnSubtitleUrl);
          setSubtitleTracks([{
            kind: 'subtitles',
            src: cdnSubtitleUrl,
            srcLang: 'en',
            label: 'English',
            type: 'text/vtt'
          }]);
        } else {
          console.log('❌ Original subtitle not found in CDN, initiating download process');

          // If the original subtitle doesn't exist, proceed with download
          const encodedMovie = encodeURIComponent(movieTitle);
          const encodedFilename = encodeURIComponent(originalFilename);
          const downloadUrl = `https://subtitles-production.up.railway.app/nodejs/download-subtitle-subsource?movie=${encodedMovie}&type=movie&filename=${encodedFilename}`;

          console.log('📡 Making subtitle download request to:', downloadUrl);

          const downloadResponse = await fetch(downloadUrl);
          console.log('Download Response Status:', downloadResponse.status);

          if (!downloadResponse.ok) {
            throw new Error(`Subtitle download failed with status: ${downloadResponse.status}`);
          }

          const responseData = await downloadResponse.json();
          console.log('Download Response Data:', responseData);

          // Wait for processing
          console.log('⏳ Waiting for subtitle processing...');
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Check again for the file in CDN after processing
          const finalCheckResponse = await fetch(cdnSubtitleUrl, { method: 'HEAD' });
          console.log('Final CDN Check Response Status:', finalCheckResponse.status);

          if (finalCheckResponse.ok) {
            console.log('✅ Subtitle now available in CDN');
            setSubtitleUrl(cdnSubtitleUrl);
            setSubtitleTracks([{
              kind: 'subtitles',
              src: cdnSubtitleUrl,
              srcLang: 'en',
              label: 'English',
              type: 'text/vtt'
            }]);
          } else {
            console.log('❌ Subtitle still not available in CDN after processing');
            if (responseData && responseData.s3Path) {
              const wasabiUrl = responseData.s3Path;
              console.log('Using Wasabi URL:', wasabiUrl);
              setSubtitleUrl(wasabiUrl);
              setSubtitleTracks([{
                kind: 'subtitles',
                src: wasabiUrl,
                srcLang: 'en',
                label: 'English',
                type: 'text/vtt'
              }]);
            } else {
              throw new Error('No subtitle data available');
            }
          }
        }

        // Check for additional subtitle versions (v2, v3, etc.)
        console.log('🔍 Checking for additional subtitle versions...');
        const additionalTracks = [];
        let version = 2;
        let versionExists = true;

        while (versionExists && version <= 10) { // Limit to 10 versions
          const versionedFilename = `v${version}_${originalFilename}.vtt`;
          const versionedUrl = `https://fvsubtitles.b-cdn.net/${encodeURIComponent(versionedFilename)}`;

          console.log(`🔍 Checking for version ${version} subtitle at URL:`, versionedUrl);

          try {
            const checkResponse = await fetch(versionedUrl, { method: 'HEAD' });
            console.log(`Version ${version} Check Response Status:`, checkResponse.status);

            if (checkResponse.ok) {
              console.log(`✅ Version ${version} subtitle found`);
              additionalTracks.push({
                kind: 'subtitles',
                src: versionedUrl,
                srcLang: 'en',
                label: `English v${version}`,
                type: 'text/vtt'
              });
              version++;
            } else {
              console.log(`❌ Version ${version} subtitle not found`);
              versionExists = false;
            }
          } catch (error) {
            console.error(`🚫 Error checking version ${version} subtitle:`, error);
            versionExists = false;
          }
        }

        if (additionalTracks.length > 0) {
          console.log('📂 Found additional subtitle versions:', additionalTracks);
          setSubtitleTracks(prev => [...prev, ...additionalTracks]);
        } else {
          console.log('📂 No additional subtitle versions found');
        }

      } catch (error) {
        console.error('🚫 Error in subtitle process:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setSubtitleUrl(null);
        setSubtitleTracks([]);
      } finally {
        console.log('⏹️ Subtitle process completed');
        setIsSubtitleLoading(false);
      }
    };

    fetchSubtitle();
  }, [movieTitle, originalFilename]);

  useEffect(() => {
    console.log('Current subtitle tracks:', subtitleTracks);
  }, [subtitleTracks]);

  useEffect(() => {
    console.log('Current subtitle URL:', subtitleUrl);
  }, [subtitleUrl]);

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



  // Function to check if file exists in Wasabi using a range request
  const checkFileExists = async (filename, signal) => {
    const encodedFilename = sanitizeFilename(filename);
    const url = `https://filmvault3.b-cdn.net/${encodedFilename}`;

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

    // Split off any query parameters, including download_token
    let cleanedFilename = filename.split('?')[0];
    console.log('Filename without query params:', cleanedFilename);

    const hasEncodedBrackets = cleanedFilename.includes('%5B') || cleanedFilename.includes('%5D');

    const decodedFilename = hasEncodedBrackets ? cleanedFilename : decodeURIComponent(cleanedFilename);
    console.log('Decoded filename:', decodedFilename);

    const cleanFilename = hasEncodedBrackets ?
      decodedFilename :
      decodedFilename
        .replace(/%5B/g, '[')
        .replace(/%5D/g, ']')
        .replace(/%20/g, ' ');
    console.log('Cleaned filename:', cleanFilename);

    const encodedFilename = hasEncodedBrackets ?
      cleanFilename :
      cleanFilename
        .replace(/\[/g, '%5B')
        .replace(/\]/g, '%5D')
        .replace(/ /g, '.');

    const finalEncodedFilename = encodedFilename
      .replace(/[^A-Za-z0-9%._-]/g, char => encodeURIComponent(char));

    console.log('Final encoded filename:', finalEncodedFilename);

    return finalEncodedFilename;
  };


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
      setOriginalFilename(originalFilename);

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
          const cdnUrl = `https://filmvault3.b-cdn.net/${sanitizedFilename}`;
          console.log('File found, setting CDN URL:', cdnUrl);
          setStreamingUrl(cdnUrl);
          setProcessingStatus('ready');
          return;
        }

        // If auto quality is selected and file not found, try alternative URL
        if (selectedQuality === 'auto' && mainSource) {
          console.log('Auto quality selected and file not found, fetching alternative URL');
          try {
            const alternativeUrl = await fetchActualUrl(mainSource);

            if (alternativeUrl) {
              console.log('Retrieved alternative URL:', alternativeUrl);
              const altFilename = alternativeUrl.split('/').pop() || 'video';
              const altSanitizedFilename = sanitizeFilename(altFilename);

              // Check if alternative file exists in CDN
              const altFileExists = await checkFileExists(altFilename, signal);
              if (altFileExists) {
                const altCdnUrl = `https://filmvault3.b-cdn.net/${altSanitizedFilename}`;
                console.log('Alternative file found in CDN:', altCdnUrl);
                setStreamingUrl(altCdnUrl);
                setProcessingStatus('ready');
                return;
              }


              // If alternative file doesn't exist, initiate download
              url = alternativeUrl; // Use alternative URL for further processing
              console.log('Using alternative URL for processing:', url);
            }
          } catch (altError) {
            console.error('Error fetching alternative URL:', altError);
            // Continue with original URL if alternative fetch fails
          }
        }  else if (naijaRocks && selectedQuality === 'auto' && !mainSource) {
          console.log('Auto quality selected and file not found, fetching naija URL');
          try {
            const naijaUrl = await fetchActualUrlNaija(naijaRocks);

            if (naijaUrl) {
              console.log('Retrieved naija URL:', naijaUrl);
              const naijaFilename = naijaUrl.split('/').pop() || 'video';
              const naijaSanitizedFilename = sanitizeFilename(naijaFilename);

              // Check if naija file exists in CDN
              const naijaFileExists = await checkFileExists(naijaFilename, signal);
              if (naijaFileExists) {
                const naijaCdnUrl = `https://filmvault3.b-cdn.net/${naijaSanitizedFilename}`;
                console.log('Naija file found in CDN:', naijaCdnUrl);
                setStreamingUrl(naijaCdnUrl);
                setProcessingStatus('ready');
                return;
              }

              // If naija file doesn't exist, use naija URL for further processing
              url = naijaUrl;
              console.log('Using naija URL for processing:', url);
            }
          } catch (naijaError) {
            console.error('Error fetching naija URL:', naijaError);
            // Continue with original URL if naija fetch fails
          }
        }


        console.log('Initiating download process...');
        setProcessingStatus('downloading');
        const urlWithoutQuery = originalFilename.split('?')[0];
        const encodedUrl = encodeURIComponent(url);
        const encodedFilename = encodeURIComponent(urlWithoutQuery);
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
                const cdnUrl = `https://filmvault3.b-cdn.net/${sanitizedFilename}`;
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

      } catch (cdnError) {
        console.error('Initial CDN check error:', cdnError);
        if (cdnError.message === 'Request aborted') {
          throw cdnError;
        }
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
    if (selectedQuality) {
      let currentSources = sources;
      if (currentSourcesType === 'sources2') {
        currentSources = sources2;
      }

      if (currentSources?.length > 0) {
        const source = currentSources.find(s => {
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
    }
  };


  useEffect(() => {
    const availableQualitiesSet = new Set();

    // Add "Auto" as the first option if mainSource or naijaRocks exists
    if (mainSource || naijaRocks) {
      availableQualitiesSet.add('auto');
    }

    // Add qualities from sources2 first (higher priority)
    const qualitiesFromSources2 = sources2?.map(source => {
      const resolution = getResolutionNumber(source.quality);
      return resolution ? resolution.toString() : null;
    }).filter(Boolean) || [];
    qualitiesFromSources2.forEach(q => availableQualitiesSet.add(q));

    // Then add qualities from sources if they don't already exist
    const qualitiesFromSources1 = sources?.map(source => {
      const resolution = getResolutionNumber(source.quality);
      return resolution ? resolution.toString() : null;
    }).filter(Boolean) || [];
    qualitiesFromSources1.forEach(q => availableQualitiesSet.add(q));

    const availableQualities = Array.from(availableQualitiesSet).sort((a, b) => {
      if (a === 'auto') return -1;
      if (b === 'auto') return 1;
      return parseInt(a) - parseInt(b); // Sort in descending order
    });

    console.log("Available qualities:", availableQualities);
    setQualities(availableQualities);

    // Set initial quality to 'auto' if mainSource or naijaRocks exists, otherwise highest available quality
    if (availableQualities.length > 0) {
      const initialQuality = (mainSource || naijaRocks) ? 'auto' : availableQualities[0];
      console.log("Setting initial quality:", initialQuality);
      setSelectedQuality(initialQuality);
    } else {
      setSelectedQuality('');
    }
  }, [sources, sources2, mainSource, naijaRocks]);




  useEffect(() => {
    const processSelectedQuality = async () => {
      if (!processingInitiated || !selectedQuality) return;

      cancelActiveRequest();

      if (selectedQuality === 'auto') {
        if (mainSource) {
          try {
            await processVideo(mainSource, activeRequestRef.current?.signal);
          } catch (error) {
            if (error.message !== 'Request aborted') {
              console.error('Error processing video:', error);
            }
          }
          return;
        } else if (naijaRocks) {
          try {
            const naijaUrl = await fetchActualUrlNaija(naijaRocks);
            if (naijaUrl) {
              await processVideo(naijaUrl, activeRequestRef.current?.signal);
            }
          } catch (error) {
            if (error.message !== 'Request aborted') {
              console.error('Error processing naija video:', error);
            }
          }
          return;
        }
      }

      // Check sources2 first (higher priority)
      let selectedSource = sources2?.find(s => {
        const resolution = getResolutionNumber(s.quality);
        return resolution.toString() === selectedQuality;
      });
      let sourceType = 'sources2';

      // If not found in sources2, check sources
      if (!selectedSource) {
        selectedSource = sources?.find(s => {
          const resolution = getResolutionNumber(s.quality);
          return resolution.toString() === selectedQuality;
        });
        sourceType = 'sources';
      }

      if (selectedSource?.downloadLink) {
        if (selectedSource.downloadLink.includes('dl4.sermovie')) {
          setProcessingStatus('blocked');
          setErrorMessage('Video will soon be available for streaming');
          return;
        }

        setCurrentSourcesType(sourceType);

        const controller = new AbortController();
        activeRequestRef.current = controller;

        try {
          await processVideo(selectedSource.downloadLink, controller.signal);
        } catch (error) {
          if (error.message !== 'Request aborted') {
            console.error('Error processing video:', error);
          }
        }
      } else {
        setStreamingUrl(null);
        setProcessingStatus('error');
        setErrorMessage('No source available for selected quality.');
      }
    };

    processSelectedQuality();
  }, [selectedQuality, processingInitiated, sources, sources2, mainSource, naijaRocks]);



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


  useEffect(() => {
    const videoElement = playerRef.current?.getInternalPlayer();
    if (videoElement && subtitleTracks.length > 0) {
      // Remove existing tracks
      const existingTracks = videoElement.getElementsByTagName('track');
      Array.from(existingTracks).forEach(track => track.remove());

      // Add current track
      const currentTrack = subtitleTracks[currentSubtitleIndex];
      if (currentTrack) {
        const track = document.createElement('track');
        track.kind = currentTrack.kind;
        track.label = currentTrack.label;
        track.srclang = currentTrack.srcLang;
        track.src = currentTrack.src;
        track.default = true;

        videoElement.appendChild(track);

        // Set track visibility
        setTimeout(() => {
          const textTrack = videoElement.textTracks[0];
          if (textTrack) {
            textTrack.mode = subtitlesEnabled ? 'showing' : 'hidden';
          }
        }, 100);
      }
    }
  }, [subtitleTracks, currentSubtitleIndex, subtitlesEnabled]);



  const handlePlayerReady = () => {
    const videoElement = playerRef.current?.getInternalPlayer();
    if (videoElement) {
      // Add custom styles for subtitles
      const style = document.createElement('style');
      style.textContent = `
        video::cue {
          bottom: 50px !important;
          position: relative !important;
          background-color: transparent;
          color: white;
          text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.8);
          font-size: 1.2em;
          font-family: Arial, sans-serif;
          line-height: 1.4;
          white-space: pre-line;
          margin-bottom: 10px;
        }
        .react-player video::-webkit-media-text-track-container {
          bottom: 50px !important;
          position: relative !important;
        }
        .react-player video::-webkit-media-text-track-background {
          background-color: transparent !important;
        }
        .react-player video::-webkit-media-text-track-display {
          bottom: 50px !important;
          position: relative !important;
        }
      `;
      document.head.appendChild(style);

      // Remove existing tracks
      while (videoElement.textTracks.length > 0) {
        const track = videoElement.getElementsByTagName('track')[0];
        if (track) {
          track.remove();
        }
      }

      // Add new track if we have subtitles
      if (subtitleTracks.length > 0) {
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = 'English';
        track.srclang = 'en';
        track.src = subtitleTracks[0].src;
        track.default = true;

        videoElement.appendChild(track);

        // Force track mode to showing
        setTimeout(() => {
          const textTrack = videoElement.textTracks[0];
          if (textTrack) {
            textTrack.mode = 'showing';
          }
        }, 100);
      }

      videoElement.textTracks.addEventListener('addtrack', (e) => {
        console.log('Track added:', e.track);
        if (e.track) {
          e.track.mode = 'showing';
        }
      });

      if (videoElement.readyState >= 1) {
        setVideoMetadataLoaded(true);
        setIsPlayerReady(true);
        setIsBuffering(false);
      } else {
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

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
      setCurrentTime(state.playedSeconds);


      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
      }


      if (state.playedSeconds !== lastPlayedTime) {
        setIsBuffering(false);
        setLastPlayedTime(state.playedSeconds);
      } else if (playing && isPlayerReady) {

        bufferingTimeoutRef.current = setTimeout(() => {
          setIsBuffering(true);
        }, 500);
      }
    }
  };

  const handlePlayPause = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
    }
    
    const videoElement = playerRef.current?.getInternalPlayer();
    if (isIOS && videoElement) {
      if (!playing) {
        // On iOS, we need to explicitly call play()
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setPlaying(true);
          }).catch(error => {
            console.error("iOS play failed:", error);
            // Handle user interaction requirement
            setShowInitialPlayButton(true);
          });
        }
      } else {
        videoElement.pause();
        setPlaying(false);
      }
    } else {
      setPlaying(!playing);
    }
    showControlsWithTimeout();
  }, [playing, hasStarted, isIOS, showControlsWithTimeout]);

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

  // Replace the existing isMobile useEffect with this:
useEffect(() => {
  // Proper mobile detection using user agent
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  setIsMobile(isMobileDevice);

  // Optional: Handle landscape resize for non-mobile devices
  const checkWidth = () => {
    if (!isMobileDevice) {
      setIsMobile(window.innerWidth <= 768);
    }
  };
  
  checkWidth();
  window.addEventListener('resize', checkWidth);
  return () => window.removeEventListener('resize', checkWidth);
}, []);

  useEffect(() => {
    return () => {
      const videoElement = playerRef.current?.getInternalPlayer();
      if (videoElement) {
        const tracks = videoElement.getElementsByTagName('track');
        Array.from(tracks).forEach(track => track.remove());
      }
    };
  }, []);

  useEffect(() => {
    // Detect Android on mount
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(userAgent.includes("android"));
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
    const videoElement = playerRef.current?.getInternalPlayer();
    
    if (isIOS && videoElement) {
      if (videoElement.webkitEnterFullscreen) {
        videoElement.webkitEnterFullscreen();
      } else if (videoElement.webkitSupportsFullscreen) {
        videoElement.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else if (screenfull.isEnabled && containerRef.current) {
      screenfull.toggle(containerRef.current);
    }
    showControlsWithTimeout();
  };

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return hh ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  // Double tap fullscreen
  const handleDoubleTap = () => {
    if ((isAndroid || isMobile) && !isFullscreen) {
      handleFullscreen();
    }
  };

  const handleTouchStart = (e) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastTapTime;

    if (timeDiff < 300 && timeDiff > 0) { // 300ms is the threshold for double tap
      handleDoubleTap();
      setLastTapTime(0); // Reset last tap time after double tap
    } else {
      setLastTapTime(currentTime);
      showControlsWithTimeout(); // Show controls on single tap as well
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

        {showFullscreenTooltip && hasStarted && !isFullscreen && playing && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-sm p-2 rounded-md z-20">
            Double tap for fullscreen
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