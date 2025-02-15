"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaExpand, FaSpinner, FaClosedCaptioning, FaVolumeMute, FaForward, FaBackward, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaRotate } from 'react-icons/fa6';
import screenfull from 'screenfull';

const EnhancedSeriesStreamingComponent = ({ seasons, movieTitle }) => {

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
  const [showSubtitleTooltip, setShowSubtitleTooltip] = useState(false);
  const [subtitleChangeMessage, setSubtitleChangeMessage] = useState('');
  const [showSubtitleChangeMessage, setShowSubtitleChangeMessage] = useState(false);


  const [selectedSeason, setSelectedSeason] = useState('1');
  const [selectedEpisode, setSelectedEpisode] = useState('1');
  const [selectedQuality, setSelectedQuality] = useState('');
  const [availableQualities, setAvailableQualities] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [subtitleUrl, setSubtitleUrl] = useState(null);
  const [originalFilename, setOriginalFilename] = useState('');
  const [isSubtitleLoading, setIsSubtitleLoading] = useState(false);
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const subtitleTrackRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [prevVolume, setPrevVolume] = useState(1);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);


  const playerRef = useRef(null);
  const controlsRef = useRef(null);
  const containerRef = useRef(null);
  const bufferingTimeoutRef = useRef(null);

  const cleanSeriesTitle = (title) => {
    return title
      .replace(/\s*\(\d{4}\)\s*/gi, '') // Remove year in parentheses
      .replace(/\s*S\d{1,2}(-S\d{1,2})?\s*$/gi, '') // Remove season range at end
      .trim();
  };


  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
    showControlsWithTimeout();
  };

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
      const allowedQualities = [480, 720, 1080]; // Allowed resolutions

      // Handle both season formats
      if (initialSeason.resolutions) {
        initialSeason.resolutions.forEach(res => {

          const folderQuality = res.resolution.match(/(\d+)[pP]/)?.[1];
          if (folderQuality && allowedQualities.includes(parseInt(folderQuality))) { // Check if quality is allowed
            qualities.add(parseInt(folderQuality));
          }


          res.episodes.forEach(episode => {
            const filenameQuality = detectQualityFromUrl(episode.downloadLink);
            if (filenameQuality && allowedQualities.includes(parseInt(filenameQuality))) { // Check if quality is allowed
              qualities.add(parseInt(filenameQuality));
            }
          });
        });
      } else if (initialSeason.episodes) {
        initialSeason.episodes.forEach(episode => {
          episode.downloadLinks.forEach(link => {
            const quality = link.quality.replace('دانلود ', '').replace('P', ''); // Remove persian and P
            const qualityNum = parseInt(quality);
            if (allowedQualities.includes(qualityNum)) { // Check if quality is allowed
              qualities.add(qualityNum);
            }
          })
        })
      }


      const sortedQualities = Array.from(qualities).sort((a, b) => a - b);
      setAvailableQualities(sortedQualities);

      if (sortedQualities.length > 0) {
        setSelectedQuality(sortedQualities[0].toString());
      }

      // Handle initial episodes based on season format
      if (initialSeason.resolutions && initialSeason.resolutions.length > 0) {
        const initialEpisodes = initialSeason.resolutions[0].episodes;
        setEpisodes(initialEpisodes);
        if (initialEpisodes.length > 0) {
          setSelectedEpisode(initialEpisodes[0].episodeNumber?.toString());
        }
      } else if (initialSeason.episodes && initialSeason.episodes.length > 0) {
        // For the first document format, episodes are directly under season.episodes
        const initialEpisodes = initialSeason.episodes;
        setEpisodes(initialEpisodes);
        if (initialEpisodes.length > 0) {
            // need to determine episode number, lets assume its based on index for now, will refine in updateEpisodes
            setSelectedEpisode('1'); // default to episode 1
        }
      }
    }
  }, [seasons]);

  const toggleSubtitles = () => {
    setSubtitlesEnabled(!subtitlesEnabled);
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

  useEffect(() => {
    const fetchSubtitle = async () => {
      console.log('=== Starting series subtitle fetch ===');
      if (!movieTitle || !originalFilename) return;

      // Reset subtitles when starting a new fetch
      setSubtitleTracks([]);
      setSubtitleUrl(null);
      setSubtitlesEnabled(true);
      setCurrentSubtitleIndex(0);

      const cleanedTitle = cleanSeriesTitle(movieTitle);
      setIsSubtitleLoading(true);

      try {
        // First, check if the original subtitle exists in CDN
        const originalSubtitleFilename = `${originalFilename}.vtt`;
        const cdnSubtitleUrl = `https://fvsubtitles.b-cdn.net/${encodeURIComponent(originalSubtitleFilename)}`;

        // Try to verify if the original subtitle exists
        const checkResponse = await fetch(cdnSubtitleUrl, { method: 'HEAD' });

        if (checkResponse.ok) {
          setSubtitleUrl(cdnSubtitleUrl);
          setSubtitleTracks([{
            kind: 'subtitles',
            src: cdnSubtitleUrl,
            srcLang: 'en',
            label: 'English',
            type: 'text/vtt'
          }]);
        } else {
          // If the original subtitle doesn't exist, proceed with download
          const encodedMovie = encodeURIComponent(cleanedTitle);
          const encodedFilename = encodeURIComponent(originalFilename);
          const downloadUrl = `https://subtitles-production.up.railway.app/nodejs/download-subtitle-series-subsource?movie=${encodedMovie}&type=tv&filename=${encodedFilename}&season=${selectedSeason}`;

          await fetch(downloadUrl);

          // Wait for processing
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Check again for the file in CDN after processing
          const finalCheckResponse = await fetch(cdnSubtitleUrl, { method: 'HEAD' });

          if (finalCheckResponse.ok) {
            setSubtitleUrl(cdnSubtitleUrl);
            setSubtitleTracks([{
              kind: 'subtitles',
              src: cdnSubtitleUrl,
              srcLang: 'en',
              label: 'English',
              type: 'text/vtt'
            }]);
          }
        }


        // Check for additional subtitle versions (v2, v3, etc.)
        const additionalTracks = [];
        let version = 2;
        let versionExists = true;

        while (versionExists && version <= 10) { // Limit to 10 versions
          const versionedFilename = `v${version}_${originalFilename}.vtt`;
          const versionedUrl = `https://fvsubtitles.b-cdn.net/${encodeURIComponent(versionedFilename)}`;

          try {
            const checkResponse = await fetch(versionedUrl, { method: 'HEAD' });
            if (checkResponse.ok) {
              additionalTracks.push({
                kind: 'subtitles',
                src: versionedUrl,
                srcLang: 'en',
                label: `English v${version}`,
                type: 'text/vtt'
              });
              version++;
            } else {
              versionExists = false;
            }
          } catch (error) {
            console.error(`🚫 Error checking version ${version} subtitle:`, error);
            versionExists = false;
          }
        }

        if (additionalTracks.length > 0) {
          setSubtitleTracks(prev => [...prev, ...additionalTracks]);
        }


      } catch (error) {
        console.error('Subtitle error:', error);
        setSubtitleTracks([]);
      } finally {
        setIsSubtitleLoading(false);
      }
    };

    fetchSubtitle();
  }, [movieTitle, originalFilename, selectedSeason, selectedEpisode]);


  useEffect(() => {
    if (playerRef.current) {
      const videoElement = playerRef.current.getInternalPlayer();
      if (videoElement) {
        // Remove existing tracks
        while (videoElement.textTracks.length > 0) {
          const track = videoElement.getElementsByTagName('track')[0];
          if (track) {
            track.remove();
          }
        }

        // Add new track if we have subtitles
        if (subtitleTracks.length > 0) {
          const currentTrack = subtitleTracks[currentSubtitleIndex];
          if (currentTrack) {
            const track = document.createElement('track');
            track.kind = currentTrack.kind;
            track.label = currentTrack.label;
            track.srclang = currentTrack.srcLang;
            track.src = currentTrack.src;
            track.default = true;

            videoElement.appendChild(track);

            // Force track mode to showing
            setTimeout(() => {
              const textTrack = videoElement.textTracks[0];
              if (textTrack) {
                textTrack.mode = subtitlesEnabled ? 'showing' : 'hidden';
              }
            }, 100);
          }
        }
      }
    }
  }, [subtitleTracks, currentSubtitleIndex, subtitlesEnabled]);

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


  const detectEpisodeFromUrl = (filename) => {
    if (!filename) return null;

    // First check if it has the form S01E01
    const sPattern = /S\d{1,2}E(\d{1,3})/i;
    const sMatch = filename.match(sPattern);
    if (sMatch) {
      const num = parseInt(sMatch[1]);
      if (num > 0 && num < 1000) return num;
    }

    // Then check for dashPattern
    const dashPattern = /[-\s](\d{1,3})[\.\s\]]/;
    const dashMatch = filename.match(dashPattern);
    if (dashMatch) {
      const num = parseInt(dashMatch[1]);
      if (num > 0 && num < 1000) return num;
    }

    // Check for ePattern
    const ePattern = /[Ee](\d{1,3})/i;
    const eMatch = filename.match(ePattern);
    if (eMatch) {
      const num = parseInt(eMatch[1]);
      if (num > 0 && num < 1000) return num;
    }

    // Lastly check for bracketPattern
    const bracketPattern = /\[(\d{1,3})\]/;
    const bracketMatch = filename.match(bracketPattern);
    if (bracketMatch) {
      const num = parseInt(bracketMatch[1]);
      if (num > 0 && num < 1000) return num;
    }

    return null;
  };
  useEffect(() => {
    const updateEpisodes = () => {
      console.log('Updating episodes for season:', selectedSeason, 'quality:', selectedQuality);
      if (!selectedSeason || !seasons) return;

      // Reset subtitle state when season changes
      setSubtitleTracks([]);
      setSubtitleUrl(null);
      setSubtitlesEnabled(true);
      setCurrentSubtitleIndex(0);

      const season = seasons.find(s => s.seasonNumber.toString() === selectedSeason);
      if (!season) return;

      const collectedEpisodes = [];
      let hasExplicitEpisodeNumbers = false;

      // Handle both season formats to collect episodes
      if (season.resolutions) {
        season.resolutions.forEach(resolution => {
          resolution.episodes.forEach(episode => {
            const quality = detectQualityFromUrl(episode.downloadLink);
            console.log(`Resolution based episode ${episode.downloadLink} quality: ${quality}`);

            if (quality === selectedQuality) {
              const filename = episode.downloadLink.split('/').pop();

              // Check if episodeNumber is explicitly provided
              if (episode.episodeNumber) {
                hasExplicitEpisodeNumbers = true;
                collectedEpisodes.push({...episode});
              } else {
                // Try to detect episode from filename if episodeNumber is not provided
                const detectedEpisode = detectEpisodeFromUrl(filename);

                if (detectedEpisode) {
                   collectedEpisodes.push({...episode, episodeNumber: detectedEpisode});
                } else {
                  // If the episode is not set, then set it later with index
                  collectedEpisodes.push({...episode});
                }
              }
            }
          });
        });
      } else if (season.episodes) {
        season.episodes.forEach((episode, index) => { // Index here is important for format 1
          episode.downloadLinks.forEach(link => {
            const quality = link.quality.replace('دانلود ', '').replace('P', ''); // Remove persian and P
            console.log(`DownloadLinks based episode ${link.downloadLink} quality: ${quality}`);

            if (quality === selectedQuality) {
              const filename = link.downloadLink.split('/').pop();

              // For format 1, episode numbers are less explicit, try detection or use index
              const detectedEpisode = detectEpisodeFromUrl(filename);

              collectedEpisodes.push({
                ...episode,
                downloadLink: link.downloadLink, // Use the correct downloadLink
                episodeNumber: detectedEpisode || (index + 1) // Fallback to index if not detected
              });
              hasExplicitEpisodeNumbers = hasExplicitEpisodeNumbers || !!detectedEpisode; // if any detected episode number, then consider explicit numbers present
            }
          });
        });
      }


      // Fallback: If no matches, collect all episodes (adjust based on your needs)
      if (collectedEpisodes.length === 0) {
        console.log('No quality matches, falling back to all episodes');
        if (season.resolutions) {
          season.resolutions.forEach(resolution => {
            resolution.episodes.forEach(episode => {
              collectedEpisodes.push({...episode});
            });
          });
        } else if (season.episodes) {
           season.episodes.forEach((episode, index) => {
             episode.downloadLinks.forEach(link => {
                collectedEpisodes.push({...episode, downloadLink: link.downloadLink, episodeNumber: index + 1});
             });
          });
        }
      }

      // If no explicit episode numbers were provided, assign them sequentially based on order
      if (!hasExplicitEpisodeNumbers) {
        collectedEpisodes.forEach((episode, index) => {
          if (!episode.episodeNumber) {
            const filename = episode.downloadLink.split('/').pop();
            const detectedEpisode = detectEpisodeFromUrl(filename);
            episode.episodeNumber = detectedEpisode ?? (index + 1);
          }
        });
      }

      // Sort and update episodes
      collectedEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

      // Remove duplicates based on episodeNumber
      const uniqueEpisodes = [];
      const seenEpisodeNumbers = new Set();
      for (const episode of collectedEpisodes) {
        if (!seenEpisodeNumbers.has(episode.episodeNumber)) {
          uniqueEpisodes.push(episode);
          seenEpisodeNumbers.add(episode.episodeNumber);
        }
      }

      console.log('Processed episodes:', uniqueEpisodes);
      setEpisodes(uniqueEpisodes);

      // Update selected episode if needed
      if (uniqueEpisodes.length > 0 && !uniqueEpisodes.some(e => e.episodeNumber.toString() === selectedEpisode)) {
        const newEpisode = uniqueEpisodes[0].episodeNumber.toString();
        console.log(`Updating selected episode to ${newEpisode}`);
        setSelectedEpisode(newEpisode);
      }
    };

    updateEpisodes();
  }, [selectedSeason, selectedQuality, seasons, selectedEpisode]);


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

    // If not in folder, check filename - more flexible pattern to catch various formats like 480P, 480p, 480
    const filenameQualityMatch = url.match(/[._](\d{3,4})[pP]?([._]|$)/i);
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
    const url = `https://filmvault3.b-cdn.net/${filename}`;
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

  useEffect(() => {
    setSubtitleTracks([]);
    setSubtitleUrl(null);
    setCurrentSubtitleIndex(0);
  }, [selectedEpisode]);

  // Function to process video through backend
  const processVideo = async (url) => {
    try {
      const cleanedTitle = cleanSeriesTitle(movieTitle);
      console.log("Starting video processing for URL:", url);
      setProcessingStatus('checking');
      setStreamingUrl(null);

      if (!url) throw new Error('No URL provided for processing');

      const originalFilename = url.split('/').pop() || 'video';
      setOriginalFilename(originalFilename);

      const sanitizedFilename = sanitizeFilename(originalFilename);

      // File existence check
      const initialFileCheck = await checkFileExists(sanitizedFilename);
      if (initialFileCheck) {
        const cdnUrl = `https://filmvault3.b-cdn.net/${sanitizedFilename}`;
        setStreamingUrl(cdnUrl);
        setProcessingStatus('ready');
        return;
      }

      setProcessingStatus('downloading');
      const encodedUrl = encodeURIComponent(url);
      const encodedFilename = encodeURIComponent(originalFilename);

      // Use cleaned title in API call
      const apiUrl = `https://api4.mp3vault.xyz/download?url=${encodedUrl}&filename=${encodedFilename}&movie=${encodeURIComponent(cleanedTitle)}`;

      await fetch(apiUrl, { method: 'GET', headers: { 'Accept': 'application/json' } , mode: 'no-cors'});

      // Retry logic with cleaned title
      let retryCount = 0;
      while (retryCount < 24) {
        const fileExists = await checkFileExists(sanitizedFilename);
        if (fileExists) {
          setStreamingUrl(`https://filmvault3.b-cdn.net/${sanitizedFilename}`);
          setProcessingStatus('ready');
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
        retryCount++;
      }

      throw new Error('File not available after maximum retries');
    } catch (error) {
      console.error('Video processing error:', error);
      setProcessingStatus('error');
      alert(`Error processing video: ${error.message}`);
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
        const currentTrack = subtitleTracks[currentSubtitleIndex];
        if (currentTrack) {
          const track = document.createElement('track');
          track.kind = currentTrack.kind;
          track.label = currentTrack.label;
          track.srclang = currentTrack.srcLang;
          track.src = currentTrack.src;
          track.default = true;

          videoElement.appendChild(track);

          // Force track mode to showing
          setTimeout(() => {
            const textTrack = videoElement.textTracks[0];
            if (textTrack) {
              textTrack.mode = subtitlesEnabled ? 'showing' : 'hidden';
            }
          }, 100);
        }
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

  useEffect(() => {
    // Check if subtitles are loaded and there are multiple tracks for tooltip
    if (subtitleTracks.length > 1) {
      setShowSubtitleTooltip(true);
      // Hide tooltip after 5 seconds (adjust as needed)
      const timer = setTimeout(() => {
        setShowSubtitleTooltip(false);
      }, 10000); // 5000 milliseconds = 5 seconds

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
      <div className="flex flex-wrap gap-4 mb-4 mt-5">
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="bg-gray-700 text-white px-4 py-2 rounded-md"
        >
          {seasons.map(season => (
            <option key={`season-select-top-${season.seasonNumber}`} value={season.seasonNumber}>
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
            <option key={`episode-select-top-${episode.episodeNumber}-${selectedSeason}`} value={episode.episodeNumber}>
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
        style={isAndroid ? { paddingBottom: '50px' } : {}} // Conditionally apply padding for Android
      >
        <div className={`flex items-center justify-center bg-gray-900 ${isFullscreen ? 'h-screen w-screen' : 'aspect-video'}`}> {/* Removed relative class here */}
          {processingStatus === 'downloading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <FaSpinner className="animate-spin text-white text-4xl mb-4" />
              <span className="text-white">Processing video...</span>
            </div>
          )}

          {processingStatus === 'ready' && streamingUrl && (
            <>
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
                  key={`player-${selectedSeason}-${selectedEpisode}`}
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
                  onError={(err) => {
                    console.error('ReactPlayer error:', err);
                    handleError();
                  }}
                  config={{
                    file: {
                      attributes: {
                        controlsList: 'nodownload',
                        crossOrigin: 'anonymous',
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
                        maxBufferSize: 200 * 1024 * 1024,
                        maxBufferLength: 200,
                        startPosition: -1,
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
        </div>

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
              <div className="relative flex items-center space-x-2">


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

              <span className='max-md:hidden'>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md mr-1"
                >
                  {seasons.map(season => (
                    <option key={`season-select-control-${season.seasonNumber}`} value={season.seasonNumber}>
                      Season {season.seasonNumber}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedEpisode}
                  onChange={(e) => setSelectedEpisode(e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md mr-1"
                >
                  {episodes.map(episode => (
                    <option key={`episode-select-control-${episode.episodeNumber}-${selectedSeason}`} value={episode.episodeNumber}>
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
                    <option key={`quality-select-control-${quality}`} value={quality}>
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