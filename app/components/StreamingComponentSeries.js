"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaExpand, FaSpinner,FaClosedCaptioning } from 'react-icons/fa';
import { FaRotate } from 'react-icons/fa6';
import screenfull from 'screenfull';

const EnhancedSeriesStreamingComponent = ({ seasons }) => {

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [streamingUrl, setStreamingUrl] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [lastPlayedTime, setLastPlayedTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [screenOrientation, setScreenOrientation] = useState('portrait');
  const [subtitles, setSubtitles] = useState([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState(null);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [subtitlesLoaded, setSubtitlesLoaded] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [videoMetadataLoaded, setVideoMetadataLoaded] = useState(false);


  const [selectedSeason, setSelectedSeason] = useState('1');
  const [selectedEpisode, setSelectedEpisode] = useState('1');
  const [selectedQuality, setSelectedQuality] = useState('');
  const [availableQualities, setAvailableQualities] = useState([]);
  const [episodes, setEpisodes] = useState([]);

  const playerRef = useRef(null);
  const controlsRef = useRef(null);
  const containerRef = useRef(null);
  const bufferingTimeoutRef = useRef(null);


  useEffect(() => {
    const checkAndroid = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsAndroid(/android/.test(userAgent));
    };
    checkAndroid();
  }, []);

  useEffect(() => {
    if (seasons && seasons.length > 0) {
      const initialSeason = seasons[0];
      setSelectedSeason(initialSeason.seasonNumber.toString());

     
      const qualities = new Set();

      initialSeason.resolutions.forEach(res => {
      
        const folderQuality = res.resolution.match(/(\d+)[pP]/)?.[1];
        if (folderQuality) {
          qualities.add(parseInt(folderQuality));
        }

     
        res.episodes.forEach(episode => {
          const filenameQuality = detectQualityFromUrl(episode.downloadLink);
          if (filenameQuality) {
            qualities.add(parseInt(filenameQuality));
          }
        });
      });

      const sortedQualities = Array.from(qualities).sort((a, b) => a - b);
      setAvailableQualities(sortedQualities);

      if (sortedQualities.length > 0) {
        setSelectedQuality(sortedQualities[0].toString());
      }

    
      if (initialSeason.resolutions.length > 0) {
        const initialEpisodes = initialSeason.resolutions[0].episodes;
        setEpisodes(initialEpisodes);
        if (initialEpisodes.length > 0) {
          setSelectedEpisode(initialEpisodes[0].episodeNumber?.toString());
        }
      }
    }
  }, [seasons]);

  const detectEpisodeFromUrl = (filename) => {
    if (!filename) return null;
  
    
    const dashPattern = /[-\s](\d{1,3})[\.\s\]]/;
    const dashMatch = filename.match(dashPattern);
    if (dashMatch) {
      const num = parseInt(dashMatch[1]);
      if (num > 0 && num < 1000) return num;
    }
  
  
    const ePattern = /[Ee](\d{1,3})/i;
    const eMatch = filename.match(ePattern);
    if (eMatch) {
      const num = parseInt(eMatch[1]);
      if (num > 0 && num < 1000) return num;
    }
  
   
    const bracketPattern = /\[(\d{1,3})\]/;
    const bracketMatch = filename.match(bracketPattern);
    if (bracketMatch) {
      const num = parseInt(bracketMatch[1]);
      if (num > 0 && num < 1000) return num;
    }
  
   
    const sPattern = /S\d{1,2}E(\d{1,3})/i;
    const sMatch = filename.match(sPattern);
    if (sMatch) {
      const num = parseInt(sMatch[1]);
      if (num > 0 && num < 1000) return num;
    }
  
    return null;
  };

  useEffect(() => {
    const updateEpisodes = () => {
      console.log('Updating episodes for season:', selectedSeason, 'quality:', selectedQuality);
      if (!selectedSeason || !seasons) return;

      const season = seasons.find(s => s.seasonNumber.toString() === selectedSeason);
      if (!season) return;

      const collectedEpisodes = [];

      // First pass: Collect episodes matching selected quality
      season.resolutions.forEach(resolution => {
        resolution.episodes.forEach(episode => {
          const quality = detectQualityFromUrl(episode.downloadLink);
          console.log(`Episode ${episode.downloadLink} quality: ${quality}`);
          
          if (quality === selectedQuality) {
            const filename = episode.downloadLink.split('/').pop();
            const detectedEpisode = detectEpisodeFromUrl(filename);
            
            const processedEpisode = {
              ...episode,
              // Preserve existing episodeNumber if available
              episodeNumber: episode.episodeNumber ?? detectedEpisode ?? (collectedEpisodes.length + 1)
            };

            // Check for duplicates
            if (!collectedEpisodes.some(e => e.episodeNumber === processedEpisode.episodeNumber)) {
              collectedEpisodes.push(processedEpisode);
            }
          }
        });
      });

      // Fallback: If no matches, collect all episodes
      if (collectedEpisodes.length === 0) {
        console.log('No quality matches, falling back to all episodes');
        season.resolutions.forEach(resolution => {
          resolution.episodes.forEach(episode => {
            const processedEpisode = {
              ...episode,
              episodeNumber: episode.episodeNumber ?? (collectedEpisodes.length + 1)
            };
            collectedEpisodes.push(processedEpisode);
          });
        });
      }

      // Sort and update episodes
      collectedEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
      console.log('Processed episodes:', collectedEpisodes);
      setEpisodes(collectedEpisodes);

      // Update selected episode if needed
      if (collectedEpisodes.length > 0 && !collectedEpisodes.some(e => e.episodeNumber.toString() === selectedEpisode)) {
        const newEpisode = collectedEpisodes[0].episodeNumber.toString();
        console.log(`Updating selected episode to ${newEpisode}`);
        setSelectedEpisode(newEpisode);
      }
    };

    updateEpisodes();
  }, [selectedSeason, selectedQuality, seasons]);


  // Process video when quality, season, or episode changes
  useEffect(() => {
    const processSelectedContent = async () => {
      console.log('Processing content - Season:', selectedSeason, 
        'Episode:', selectedEpisode, 
        'Quality:', selectedQuality,
        'Episodes count:', episodes.length);

      if (!selectedEpisode || !episodes.length) return;

      const targetEpisode = episodes.find(e => 
        e.episodeNumber?.toString() === selectedEpisode
      );

      console.log('Found target episode:', targetEpisode);

      if (targetEpisode?.downloadLink) {
        console.log('Starting video processing for:', targetEpisode.downloadLink);
        setProcessingStatus('checking');
        await processVideo(targetEpisode.downloadLink);
      }
    };

    processSelectedContent();
  }, [selectedSeason, selectedEpisode, episodes, selectedQuality]);

  const detectQualityFromUrl = (url) => {
    // First check if quality is in folder structure
    const folderQualityMatch = url.match(/\/(\d+)p\//);
    if (folderQualityMatch) {
      return folderQualityMatch[1];
    }

    // If not in folder, check filename
    const filenameQualityMatch = url.match(/[._](\d+)p[._]/i);
    if (filenameQualityMatch) {
      return filenameQualityMatch[1];
    }

    // Return null if no quality found
    return null;
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

  

  const extractSubtitles = async (videoUrl) => {
    try {
      const subtitleTracks = [];
      
      for (let trackIndex = 2; trackIndex <= 36; trackIndex++) {
        subtitleTracks.push({
          id: trackIndex,
          label: `Subtitle ${trackIndex - 1}`,
          src: `${videoUrl}#${trackIndex}`, 
          srcLang: 'en',
          kind: 'subtitles'
        });
      }
      setSubtitles(subtitleTracks);
      setSelectedSubtitle(2); 
      setSubtitlesLoaded(true);
    } catch (error) {
      console.error('Error generating subtitle tracks:', error);
      setSubtitlesLoaded(true);
    }
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
      handleFallbackRotation();
    }
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
    
    // Replace specific patterns before general encoding
    let sanitized = decodedFilename
      .replace(/\.-\./g, ' - ')  // Replace ".-." with " - "
      .replace(/\./g, ' ')       // Replace all remaining dots with spaces
      .replace(/\s+/g, ' ')      // Normalize multiple spaces to single space
      .trim();                   // Remove leading/trailing spaces
    
    // Now encode while preserving certain characters
    return encodeURIComponent(sanitized)
      .replace(/%20/g, '.')      // Replace encoded spaces with dots
      .replace(/%5B/g, '[')      // Keep square brackets
      .replace(/%5D/g, ']');     // Keep square brackets
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
        await extractSubtitles(cdnUrl);
        return;
      }
  
      console.log("File not found in CDN, initiating download");
      setProcessingStatus('downloading');
  
      // Initiate download without waiting for completion
      const encodedUrl = encodeURIComponent(url);
      const encodedFilename = encodeURIComponent(originalFilename);
      const apiUrl = `https://api4.mp3vault.xyz/download?url=${encodedUrl}&filename=${encodedFilename}`;
  
      // Fire and forget download request
      fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }).catch(error => {
        console.error('Download initiation error:', error);
        // Continue checking anyway as the download might have started
      });
  
      // Start checking for file existence
      const maxRetries = 24; // 4 minutes (24 tries * 10 seconds)
      let retryCount = 0;
  
      while (retryCount < maxRetries) {
        console.log(`Checking for file existence, attempt ${retryCount + 1}/${maxRetries}`);
        
        const fileExists = await checkFileExists(sanitizedFilename);
        
        if (fileExists) {
          console.log("File found in CDN!");
          const cdnUrl = `https://filmvault.b-cdn.net/${sanitizedFilename}`;
          setStreamingUrl(cdnUrl);
          setProcessingStatus('ready');
          return;
        }
  
        // Wait 10 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 10000));
        retryCount++;
      }
  
      throw new Error('File not available after maximum retries (4 minutes timeout)');
  
    } catch (error) {
      console.error('Video processing error:', error);
      setProcessingStatus('error');
      alert(`Error processing video: ${error.message}`);
    }
  };

  // Initialize qualities on component mount

  // Process video when quality is selected

  const handleSubtitleToggle = () => {
    setShowSubtitleMenu(!showSubtitleMenu);
    showControlsWithTimeout();
  };

  const handleSubtitleSelect = (subtitleId) => {
    const videoElement = playerRef.current?.getInternalPlayer();
    if (videoElement) {
      const tracks = Array.from(videoElement.textTracks);
      tracks.forEach(track => {
        track.mode = track.kind === 'subtitles' 
          ? (track.id === subtitleId ? 'showing' : 'disabled')
          : 'disabled';
      });
      setSelectedSubtitle(subtitleId);
      setShowSubtitleMenu(false);
      showControlsWithTimeout();
    }
  };

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
  // Update the handlePlayerReady function to include better audio handling
const handlePlayerReady = () => {
  const videoElement = playerRef.current?.getInternalPlayer();
  if (videoElement) {
    // Initialize audio settings
    const initializeAudio = () => {
      try {
        // Force unmute and set volume
        videoElement.muted = false;
        videoElement.volume = 1;

        // Enable audio output
        if (videoElement.audioTracks && videoElement.audioTracks.length > 0) {
          videoElement.audioTracks[0].enabled = true;
        }

        // Create and resume AudioContext for Android
        if (isAndroid && window.AudioContext || window.webkitAudioContext) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const audioContext = new AudioContext();
          
          if (audioContext.state === 'suspended') {
            audioContext.resume().catch(error => {
              console.warn('AudioContext resume error:', error);
            });
          }

          // Create media element source if it doesn't exist
          if (!videoElement.mediaElementSource) {
            try {
              const source = audioContext.createMediaElementSource(videoElement);
              source.connect(audioContext.destination);
              videoElement.mediaElementSource = source;
            } catch (error) {
              console.warn('MediaElementSource creation error:', error);
            }
          }
        }

        // Remove the initialization listener after successful setup
        document.removeEventListener('touchstart', initializeAudio);
        document.removeEventListener('click', initializeAudio);
      } catch (error) {
        console.error('Audio initialization error:', error);
      }
    };

    // Add initialization listeners for user interaction
    if (isAndroid) {
      document.addEventListener('touchstart', initializeAudio, { once: true });
      document.addEventListener('click', initializeAudio, { once: true });
    }

    // Handle subtitle tracks
    const updateSubtitles = () => {
      try {
        const textTracks = Array.from(videoElement.textTracks).filter(t => t.kind === 'subtitles');
        const newSubtitles = textTracks.map((track, index) => ({
          id: index,
          label: track.label || track.language || `Subtitle ${index + 1}`,
          language: track.language,
          mode: track.mode
        }));

        setSubtitles(newSubtitles);
        
        // Find and set default subtitle track
        const defaultTrack = textTracks.find(t => t.mode === 'showing') || textTracks[0];
        setSelectedSubtitle(defaultTrack ? defaultTrack.id : null);
        setSubtitlesLoaded(true);
      } catch (error) {
        console.error('Subtitle initialization error:', error);
        setSubtitlesLoaded(true); // Set to true even on error to prevent loading state
      }
    };

    // Check video element readiness
    const checkReady = () => {
      if (videoElement.readyState >= 1) {
        updateSubtitles();
        setVideoMetadataLoaded(true);
        setIsPlayerReady(true);
        setIsBuffering(false);

        // Initial play attempt for Android
        if (isAndroid && playing) {
          videoElement.play().catch(error => {
            console.warn('Initial play attempt error:', error);
            // Show play button or user interaction prompt if needed
            setPlaying(false);
          });
        }
      } else {
        // Add metadata listener if not ready
        const handleMetadata = () => {
          updateSubtitles();
          setVideoMetadataLoaded(true);
          setIsPlayerReady(true);
          setIsBuffering(false);
          videoElement.removeEventListener('loadedmetadata', handleMetadata);
        };
        
        videoElement.addEventListener('loadedmetadata', handleMetadata);
      }
    };

    // Add error handling
    const handleVideoError = (error) => {
      console.error('Video element error:', error);
      setIsPlayerReady(false);
      setVideoMetadataLoaded(false);
      setIsBuffering(false);
    };

    videoElement.addEventListener('error', handleVideoError);

    // Monitor audio track changes
    if (videoElement.audioTracks) {
      videoElement.audioTracks.addEventListener('change', () => {
        console.log('Audio tracks changed:', videoElement.audioTracks);
      });
    }

    // Start ready state check
    checkReady();

    // Cleanup function
    return () => {
      videoElement.removeEventListener('error', handleVideoError);
      document.removeEventListener('touchstart', initializeAudio);
      document.removeEventListener('click', initializeAudio);
    };
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

 

  const SubtitleMenu = () => (
    <div className="absolute bottom-20 right-4 bg-black/90 rounded-lg p-2 text-white z-50">
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => handleSubtitleSelect(null)}
          className={`px-4 py-2 hover:bg-gray-700 rounded ${selectedSubtitle === null ? 'bg-blue-600' : ''}`}
        >
          Off
        </button>
        {subtitles.map(subtitle => (
          <button
            key={subtitle.id}
            onClick={() => handleSubtitleSelect(subtitle.id)}
            className={`px-4 py-2 hover:bg-gray-700 rounded ${selectedSubtitle === subtitle.id ? 'bg-blue-600' : ''}`}
          >
            {subtitle.label}
          </button>
        ))}
      </div>
    </div>
  );


  const handleVideoClick = (e) => {
    
    if (seeking) return;
    
    
    if (controlsRef.current && controlsRef.current.contains(e.target)) return;
    
    handlePlayPause();
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

  const getPlayerConfig = () => ({
    file: {
      attributes: {
        controlsList: 'nodownload',
        crossOrigin: 'anonymous',
        muted: false,
        playsInline: true, // Add playsInline
        style: {
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: 'black'
        }
      },
      tracks: subtitles.map(subtitle => ({
        kind: 'subtitles',
        src: subtitle.src,
        srcLang: subtitle.srcLang,
        label: subtitle.label,
        default: subtitle.id === selectedSubtitle
      })),
      forceVideo: true,
      forceAudio: true, // Force audio
      hlsOptions: {
        maxBufferSize: 80 * 1024 * 1024,
        maxBufferLength: 200,
        startPosition: -1,
        debug: isAndroid, // Enable debug for Android
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
        enableWorker: true, // Enable web worker
        lowLatencyMode: false, // Disable low latency mode
        progressive: true, // Enable progressive download
        xhrSetup: (xhr, url) => {
          xhr.withCredentials = false; // Disable credentials
        },
        // Add specific audio configurations for Android
        audioStreamController: {
          bufferSize: 8 * 1024 * 1024, // Increase audio buffer size
          maxBufferSize: 16 * 1024 * 1024,
          maxBufferLength: 300
        }
      }
    }
  });

  return (
    <div className="space-y-4">
     
      <div className="flex flex-wrap gap-4 mb-4 mt-5">
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="bg-gray-700 text-white px-4 py-2 rounded-md"
        >
          {seasons.map(season => (
            <option key={season.seasonNumber} value={season.seasonNumber}>
              Season {season.seasonNumber}
            </option>
          ))}
        </select>

        <select
          value={selectedEpisode}
          onChange={(e) => setSelectedEpisode(e.target.value)}
          className="bg-gray-700 text-white px-4 py-2 rounded-md"
        >
          {episodes.map(episode => (
            <option key={episode.episodeNumber} value={episode.episodeNumber}>
              Episode {episode.episodeNumber}
            </option>
          ))}
        </select>
      </div>

     
      <div
        ref={containerRef}
        className="bg-gray-900 rounded-xl overflow-hidden shadow-xl relative group w-full"
        onMouseMove={showControlsWithTimeout}
        onMouseLeave={() => !isFullscreen && hideControls()}
      >
        <div className={`relative ${isFullscreen ? 'h-screen w-screen' : 'aspect-video'}`}>
          {processingStatus === 'downloading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <FaSpinner className="animate-spin text-white text-4xl mb-4" />
              <span className="text-white">Processing video...</span>
            </div>
          )}

{processingStatus === 'ready' && streamingUrl && (
          <>
            {(!playing || !hasStarted) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
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
        config={getPlayerConfig()}
      />
            </div>
          </>
        )}

{(isBuffering || (processingStatus === 'ready' && !videoMetadataLoaded)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <FaSpinner className="animate-spin text-white text-4xl" />
          </div>
        )}
        </div>
        {/* Player Controls */}
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

              <div className="text-gray-400 text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          

            <div className="flex items-center space-x-4">
            <span className='max-md:hidden'>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md mr-1"
              >
                {seasons.map(season => (
                  <option key={season.seasonNumber} value={season.seasonNumber}>
                    Season {season.seasonNumber}
                  </option>
                ))}
              </select>

              <select
                value={selectedEpisode}
                onChange={(e) => setSelectedEpisode(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md mr-1 "
              >
                {episodes.map(episode => (
                  <option key={episode.episodeNumber} value={episode.episodeNumber}>
                    Episode {episode.episodeNumber}
                  </option>
                ))}
              </select>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                {availableQualities.map(quality => (
                  <option key={quality} value={quality}>
                    {quality}p
                  </option>
                ))}
              </select>
              </span>
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
    </div>
  );
};

export default EnhancedSeriesStreamingComponent;