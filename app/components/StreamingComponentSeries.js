"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaExpand, FaSpinner,FaClosedCaptioning } from 'react-icons/fa';
import { FaRotate } from 'react-icons/fa6';
import screenfull from 'screenfull';

const EnhancedSeriesStreamingComponent = ({ seasons }) => {
  // Existing state from movie component
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
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

  // New state for series
  const [selectedSeason, setSelectedSeason] = useState('1');
  const [selectedEpisode, setSelectedEpisode] = useState('1');
  const [selectedQuality, setSelectedQuality] = useState('');
  const [availableQualities, setAvailableQualities] = useState([]);
  const [episodes, setEpisodes] = useState([]);

  const playerRef = useRef(null);
  const controlsRef = useRef(null);
  const containerRef = useRef(null);
  const bufferingTimeoutRef = useRef(null);

  // Initialize seasons and episodes
  useEffect(() => {
    if (seasons && seasons.length > 0) {
      const initialSeason = seasons[0];
      setSelectedSeason(initialSeason.seasonNumber.toString());

      // Get qualities from both folder structure and filenames
      const qualities = new Set();

      initialSeason.resolutions.forEach(res => {
        // Check folder structure qualities
        const folderQuality = res.resolution.match(/(\d+)[pP]/)?.[1];
        if (folderQuality) {
          qualities.add(parseInt(folderQuality));
        }

        // Check filename qualities
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

      // Set initial episodes
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
  
    // Pattern 1: Look for episode number after a dash followed by numbers (e.g., "- 01" or "-01")
    const dashPattern = /[-\s](\d{1,3})[\.\s\]]/;
    const dashMatch = filename.match(dashPattern);
    if (dashMatch) {
      const num = parseInt(dashMatch[1]);
      if (num > 0 && num < 1000) return num;
    }
  
    // Pattern 2: Look for ExXX or EXX pattern
    const ePattern = /[Ee](\d{1,3})/i;
    const eMatch = filename.match(ePattern);
    if (eMatch) {
      const num = parseInt(eMatch[1]);
      if (num > 0 && num < 1000) return num;
    }
  
    // Pattern 3: Look for episode numbers in brackets [XX]
    const bracketPattern = /\[(\d{1,3})\]/;
    const bracketMatch = filename.match(bracketPattern);
    if (bracketMatch) {
      const num = parseInt(bracketMatch[1]);
      if (num > 0 && num < 1000) return num;
    }
  
    // Pattern 4: Look for SXXEXX pattern
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
      // First try to fetch the video headers to check for subtitle tracks
      const response = await fetch(videoUrl, {
        method: 'HEAD',
        credentials: 'same-origin'
      });

      if (response.headers.get('content-type')?.includes('video')) {
        // Check if there are subtitles in common formats
        const subtitleFormats = ['.vtt', '.srt'];
        const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('.'));
        
        const subtitleTracks = [];
        
        for (const format of subtitleFormats) {
          try {
            const subtitleUrl = `${baseUrl}${format}`;
            const subtitleResponse = await fetch(subtitleUrl, { method: 'HEAD' });
            
            if (subtitleResponse.ok) {
              subtitleTracks.push({
                id: subtitleTracks.length,
                label: `Subtitle ${subtitleTracks.length + 1}`,
                src: subtitleUrl,
                language: 'en' // Default to English, modify as needed
              });
            }
          } catch (error) {
            console.log(`No subtitles found with format ${format}`);
          }
        }

        if (subtitleTracks.length > 0) {
          setSubtitles(subtitleTracks);
          setSelectedSubtitle(subtitleTracks[0].id);
        }
      }
    } catch (error) {
      console.error('Error checking for subtitles:', error);
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
      // Fallback to CSS transform if orientation lock fails
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
    setSelectedSubtitle(subtitleId);
    setShowSubtitleMenu(false);
    showControlsWithTimeout();
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

  const playerConfig = {
    file: {
      attributes: {
        controlsList: 'nodownload',
        crossOrigin: 'anonymous'
      },
      tracks: subtitles.map(subtitle => ({
        kind: 'subtitles',
        src: subtitle.src,
        srcLang: subtitle.language,
        label: subtitle.label,
        default: subtitle.id === selectedSubtitle
      })),
      forceVideo: true,
      hlsOptions: {
        maxBufferSize: 600 * 1024 * 1024,
        maxBufferLength: 600,
        startPosition: -1,
        debug: false
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
    // Prevent click from triggering if user was dragging/seeking
    if (seeking) return;
    
    // Don't trigger if click was on a control element
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

  return (
    <div className="space-y-4">
      {/* Season and Episode Selection */}
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

      {/* Video Player Container */}
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
              {!hasStarted && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <button
                    onClick={handlePlayPause}
                    className="text-white text-4xl hover:scale-110 transition-transform"
                  >
                    <FaPlay />
                  </button>
                </div>
              )}
              <div 
                className={`video-wrapper relative w-full h-full ${
                  isFullscreen ? 'fixed inset-0 bg-black' : ''
                }`}
                style={{
                  aspectRatio: isFullscreen ? 'unset' : '16/9'
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
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  className="react-player"
                  onProgress={handleProgress}
                  onDuration={setDuration}
                  onBuffer={handleBuffer}
                  onBufferEnd={handleBufferEnd}
                  onReady={handlePlayerReady}
                  onError={handleError}
                  onClick={handleVideoClick}
                  config={playerConfig}
                />
              </div>
            </>
          )}

          {isBuffering && isPlayerReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
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
            {subtitles.length > 0 && (
            <button
              onClick={handleSubtitleToggle}
              className="text-white hover:text-gray-300 transition"
              title="Subtitles"
            >
              <FaClosedCaptioning size={20} />
            </button>
          )}
{showSubtitleMenu && <SubtitleMenu />}

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