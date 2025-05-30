"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaExpand, FaSpinner, FaClosedCaptioning, FaVolumeMute, FaForward, FaBackward, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaRotate } from 'react-icons/fa6';
import screenfull from 'screenfull';

// Hoisted Domain Mappings (from movies component)
const GLOBAL_DOMAIN_MAPPINGS = {
  "https://ds10.30namachi.com": "https://namachi10.b-cdn.net",
  "https://ds11.30namachi.com": "https://namachi11.b-cdn.net",
  "https://ds12.30namachi.com": "https://namachi12.b-cdn.net",
  "https://ds14.30namachi.com": "https://namachi14.b-cdn.net",
  "https://ds15.30namachi.com": "https://namachi15.b-cdn.net",
  "https://ds16.30namachi.com": "https://namachi16.b-cdn.net",
  "https://ds17.30namachi.com": "https://namachi17.b-cdn.net",
  "https://storage.googleapis.com/fvmoviesbucket":"https://fvsrv1.b-cdn.net",
  "https://ds3.30namachi.co": "https://namachi3.b-cdn.net",
  "https://dl4.30namachi.com": "https://namachi4.b-cdn.net",
  "https://ds5.30namachi.com": "https://namachi5.b-cdn.net",
  "https://ds7.30namachi.com": "https://namachi7.b-cdn.net",
  "https://d10.30namachi.com": "https://namachid10.b-cdn.net",
  "https://dl11.sermoviedown.pw": "https://sermovie11.b-cdn.net",
  "https://dl12.sermoviedown.pw": "https://sermovie12.b-cdn.net",
  "https://dl3.sermoviedown.pw": "https://sermovie3.b-cdn.net",
  "https://dl4.sermoviedown.pw": "https://sermovie4.b-cdn.net", // Special handling for this domain (blocked)
  "https://dl5.sermoviedown.pw": "https://sermovie5.b-cdn.net",
  "https://dl2.sermoviedown.pw": "https://servmovie2.b-cdn.net",
  "http://dl.vinadl.xyz": "https://vinadl1.b-cdn.net",
  "http://dl2.vinadl.xyz": "https://vinadl2.b-cdn.net",
  "http://dl3.vinadl.xyz": "https://vinadl3.b-cdn.net",
  "http://dl8.vinadl.xyz": "https://vinadl8.b-cdn.net",
  "http://dl9.vinadl.xyz": "https://vinadl9.b-cdn.net",
  "https://dl1.dl-bcmovie1.xyz": "https://bcmovie1.b-cdn.net",
  "https://dl.vinadl.xyz":"https://vinadl0.b-cdn.net",
  "https://silverangel.000f.fastbytes.org":"https://silverangel.b-cdn.net"
};

// replaceDomainWithCDN function (from movies component)
const replaceDomainWithCDN = (url) => {
  if (!url) return url;
  for (const [oldDomain, newDomain] of Object.entries(GLOBAL_DOMAIN_MAPPINGS)) {
    if (url.startsWith(oldDomain)) {
      return url.replace(oldDomain, newDomain);
    }
  }
  return url;
};

// sanitizeFilename function (from movies component)
const sanitizeFilename = (filename) => {
  if (!filename) return '';
  let cleanedFilename = filename.split('?')[0];
  let decodedSegment;
  try {
      decodedSegment = decodeURIComponent(cleanedFilename);
  } catch (e) {
      decodedSegment = cleanedFilename;
      console.warn("sanitizeFilename: decodeURIComponent failed for", cleanedFilename, e);
  }
  const pathSegment = decodedSegment
      .replace(/ /g, '.')
      .replace(/[^A-Za-z0-9_.\-%~]/g, char => encodeURIComponent(char));
  return pathSegment;
};


const EnhancedSeriesStreamingComponent = ({ seasons, movieTitle, seasons2 }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [hasStarted, setHasStarted] = useState(false); // User has interacted
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle, checking, downloading, ready, error, blocked
  const [streamingUrl, setStreamingUrl] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [lastPlayedTime, setLastPlayedTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [screenOrientation, setScreenOrientation] = useState('portrait');

  const [videoMetadataLoaded, setVideoMetadataLoaded] = useState(false);
  const [showSubtitleTooltip, setShowSubtitleTooltip] = useState(false);
  const [subtitleChangeMessage, setSubtitleChangeMessage] = useState('');
  const [showSubtitleChangeMessage, setShowSubtitleChangeMessage] = useState(false);
  const [showNextEpisodeTooltip, setShowNextEpisodeTooltip] = useState(false);
  const [showEpisodeStartTooltip, setShowEpisodeStartTooltip] = useState(false);
  const [showFullscreenTooltip, setShowFullscreenTooltip] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);

  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState('');
  const [selectedQuality, setSelectedQuality] = useState(''); // e.g., "720", "smooth"
  const [availableQualities, setAvailableQualities] = useState([]);
  const [episodes, setEpisodes] = useState([]); // Episodes for the current season & quality

  const [isSubtitleLoading, setIsSubtitleLoading] = useState(false);
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [prevVolume, setPrevVolume] = useState(1);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [originalFilenameForSubtitle, setOriginalFilenameForSubtitle] = useState('');

  const [mergedSeasons, setMergedSeasons] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxRetries = 3;
  const retryDelay = 2000; // ms

  const [showInitialPlayButton, setShowInitialPlayButton] = useState(true);
  const [processingInitiated, setProcessingInitiated] = useState(false);

  const [isTelegram, setIsTelegram] = useState(false);
  const [showTelegramTooltip, setShowTelegramTooltip] = useState(false);
  const [showIosTooltip, setShowIosTooltip] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  const playerRef = useRef(null);
  const controlsRef = useRef(null);
  const containerRef = useRef(null);
  const bufferingTimeoutRef = useRef(null);
  const nextEpisodeTooltipTimeoutRef = useRef(null);
  const episodeStartTooltipTimeoutRef = useRef(null);
  const fullscreenTooltipTimeoutRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const processingTimeoutRef = useRef(null);
  const activeRequestRef = useRef(null); // For aborting fetches


  const getResolutionNumber = (quality) => {
    if (!quality) return 0;
    let match = String(quality).match(/(\d+)[pP]/);
    if (match) return parseInt(match[1]);
    match = String(quality).match(/(\d{3,4})/);
    return match ? parseInt(match[1]) : 0;
  };

  const hideControls = useCallback(() => {
    if (!seeking && !isBuffering && playing && !isMobile) {
      setShowControls(false);
    }
  }, [seeking, isBuffering, playing, isMobile]);

  const handleBackward = () => {
    const player = playerRef.current;
    if (player && duration > 0 && isPlayerReady) {
      const newTime = Math.max(currentTime - 10, 0);
      player.seekTo(newTime);
      setCurrentTime(newTime);
      showControlsWithTimeout();
    }
  };

  const handleForward = () => {
    const player = playerRef.current;
    if (player && duration > 0 && isPlayerReady) {
      const newTime = Math.min(currentTime + 10, duration);
      player.seekTo(newTime);
      setCurrentTime(newTime);
      showControlsWithTimeout();
    }
  };

  const showControlsWithTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    if (playing) {
      setControlsTimeout(setTimeout(hideControls, 3000));
    }
  }, [controlsTimeout, hideControls, playing]);

  const handleInitialPlay = () => {
    setShowInitialPlayButton(false);
    setProcessingInitiated(true);
    setHasStarted(true);
    if (processingStatus === 'ready' && streamingUrl) {
        setPlaying(true);
    }
  };

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTgWebView = typeof window.TelegramWebViewProxy !== 'undefined';
    const isTgUserAgent = userAgent.includes('telegram');
    setIsTelegram(isTgWebView || isTgUserAgent);

    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) ||
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || isIOSDevice;
    setIsMobile(isMobileDevice);
    setIsAndroid(/android/i.test(userAgent));

  }, []);

  useEffect(() => {
    if (isTelegram && hasStarted) {
      setShowTelegramTooltip(true);
      const timer = setTimeout(() => setShowTelegramTooltip(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isTelegram, hasStarted]);

  useEffect(() => {
    if (hasStarted && isIOS) {
      setShowIosTooltip(true);
      const timer = setTimeout(() => setShowIosTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, isIOS]);


  const cleanSeriesTitle = (title) => {
    if (!title) return '';
    return title
      .replace(/\s*\(\d{4}\)\s*/gi, '')
      .replace(/\s*S\d{1,2}(-S\d{1,2})?\s*$/gi, '')
      .trim();
  };

  const fetchActualUrl = async (url) => {
    console.log('DEBUG: Fetching actual URL for (series smooth type):', url);
    try {
      const response = await fetch(`https://api5.mp3vault.xyz/getDownloadUrl?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch actual URL, status: ${response.status}`);
      }
      const data = await response.json();
      console.log('DEBUG: Received actual URL (series smooth type):', data.downloadUrl);
      return data.downloadUrl;
    } catch (error) {
      console.error('DEBUG: Error fetching actual URL (series smooth type):', error);
      return null;
    }
  };

  const cancelActiveRequest = () => {
    if (activeRequestRef.current) {
      console.log("DEBUG: Cancelling active request", activeRequestRef.current);
      activeRequestRef.current.abort("User changed quality or initiated new action");
      activeRequestRef.current = null;
    }
  };

  const checkFileExists = async (filenameToCheck, signal) => {
    const encodedFilename = filenameToCheck;
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
        throw error;
      }
      return false;
    }
  };

  const processVideo = async (urlToProcessInitially, signal, isSeasons2Source = false) => {
    let currentUrlForProcessing = urlToProcessInitially;
    let filenameForApiAndCdnCheck = "";
    let sanitizedFilenameForCdnPath = "";

    try {
        console.log(`DEBUG processVideo (Series): Started. Initial URL: ${urlToProcessInitially}, IsSeasons2Source: ${isSeasons2Source}`);
        setProcessingStatus('checking');
        setErrorMessage('');

        if (!urlToProcessInitially) {
            throw new Error('No URL provided to processVideo');
        }

        filenameForApiAndCdnCheck = currentUrlForProcessing.split('/').pop().split('?')[0] || `series_video_unknown_${Date.now()}`;
        setOriginalFilenameForSubtitle(filenameForApiAndCdnCheck);

        sanitizedFilenameForCdnPath = sanitizeFilename(filenameForApiAndCdnCheck);

        console.log(`DEBUG processVideo (Series): Filename for API/CDN Check: ${filenameForApiAndCdnCheck}`);
        console.log(`DEBUG processVideo (Series): Sanitized filename for CDN Path: ${sanitizedFilenameForCdnPath}`);

        if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = setTimeout(() => {
            if (processingStatus !== 'ready' && processingStatus !== 'error' && !(signal && signal.aborted)) {
                console.error('DEBUG processVideo (Series): Processing timed out.');
                if (activeRequestRef.current && activeRequestRef.current.signal === signal) {
                    activeRequestRef.current.abort("Processing timeout");
                }
                setProcessingStatus('error');
                setErrorMessage('Processing timed out. Please try again or select a different quality.');
            }
        }, 240000);

        console.log(`DEBUG processVideo (Series): Performing initial file check on fvsrv1 for: ${sanitizedFilenameForCdnPath}`);
        const initialFileExists = await checkFileExists(sanitizedFilenameForCdnPath, signal);
        console.log(`DEBUG processVideo (Series): Initial file check result for ${sanitizedFilenameForCdnPath} on fvsrv1: ${initialFileExists}`);

        if (initialFileExists) {
            const cdnUrl = `https://fvsrv1.b-cdn.net/${sanitizedFilenameForCdnPath}`;
            console.log(`DEBUG processVideo (Series): File found on fvsrv1 CDN. Setting streaming URL: ${cdnUrl}`);
            setStreamingUrl(cdnUrl);
            setProcessingStatus('ready');
            setRetryCount(0); setIsRetrying(false);
            return;
        }

        if (!isSeasons2Source) {
            console.error(`DEBUG processVideo (Series): File not found on fvsrv1 CDN for non-seasons2 source. URL: ${currentUrlForProcessing}, Sanitized: ${sanitizedFilenameForCdnPath}`);
            throw new Error(`File for selected quality not found on CDN. URL: ${currentUrlForProcessing.substring(0,100)}...`);
        }

        if (isSeasons2Source) {
            console.log(`DEBUG processVideo (Series): File not on fvsrv1 CDN for seasons2 source. Initiating download for URL: ${currentUrlForProcessing}`);
            setProcessingStatus('downloading');

            const filenameForApiParameter = filenameForApiAndCdnCheck;
            const encodedUrlForApi = encodeURIComponent(currentUrlForProcessing);
            const encodedFilenameForApi = encodeURIComponent(filenameForApiParameter);
            const apiUrlForDownload = `https://api4.mp3vault.xyz/download?url=${encodedUrlForApi}&filename=${encodedFilenameForApi}`;

            console.log('DEBUG processVideo (Series): Download API URL:', apiUrlForDownload);

            if (signal && signal.aborted) {
                console.error('DEBUG processVideo (Series): API4 Download NOT ATTEMPTED - Signal aborted.');
                throw new Error('Request aborted before download initiation.');
            } else {
                fetch(apiUrlForDownload, { method: 'GET', headers: { 'Accept': 'application/json' }, signal })
                    .then(response => {
                        if (signal && signal.aborted) return null;
                        console.log('DEBUG processVideo (Series): API4 fetch response status:', response.status, response.statusText);
                        if (!response.ok) {
                            console.error('DEBUG processVideo (Series): API4 fetch response NOT OK. Status:', response.status);
                        }
                        return response.json().catch(e => {
                            console.error("DEBUG processVideo (Series): API4 response.json() error", e);
                            return { message: "API4 call made, but response parsing failed or was not JSON."};
                        });
                    })
                    .then(data => {
                        if (signal && signal.aborted) return;
                        console.log('DEBUG processVideo (Series): API4 Download initiation data:', data);
                    })
                    .catch(apiError => {
                        if (apiError.name === 'AbortError') {
                            console.warn('DEBUG processVideo (Series): API4 Download fetch aborted.');
                        } else {
                            console.error('DEBUG processVideo (Series): API4 Download initiation error:', apiError);
                        }
                    });
            }

            const checkInterval = 7000;
            const maxCheckAttempts = Math.floor(230000 / checkInterval);
            let currentAttempt = 0;

            const pollForFile = async () => {
                while (currentAttempt < maxCheckAttempts) {
                    if (signal && signal.aborted) throw new Error('Request aborted during polling.');
                    console.log(`DEBUG processVideo (Series): Polling attempt ${currentAttempt + 1}/${maxCheckAttempts} for: ${sanitizedFilenameForCdnPath} on fvsrv1`);
                    try {
                        const fileNowExists = await checkFileExists(sanitizedFilenameForCdnPath, signal);
                        if (fileNowExists) {
                            const cdnUrl = `https://fvsrv1.b-cdn.net/${sanitizedFilenameForCdnPath}`;
                            console.log(`DEBUG processVideo (Series): File found after polling on fvsrv1! URL: ${cdnUrl}`);
                            setStreamingUrl(cdnUrl);
                            setProcessingStatus('ready');
                            setRetryCount(0); setIsRetrying(false);
                            return true;
                        }
                    } catch (checkError) {
                        console.error(`DEBUG processVideo (Series): Error in polling check attempt ${currentAttempt + 1}:`, checkError);
                        if (checkError.name === 'AbortError') throw checkError;
                    }
                    currentAttempt++;
                    if (currentAttempt < maxCheckAttempts && !(signal && signal.aborted)) {
                        await new Promise(resolve => setTimeout(resolve, checkInterval));
                    }
                }
                return false;
            };

            const fileFoundAfterPolling = await pollForFile();
            if (!fileFoundAfterPolling && !(signal && signal.aborted) ) {
                throw new Error(`Content is taking longer than usual to prepare after ${maxCheckAttempts} attempts (seasons2 source).`);
            }
             if (signal && signal.aborted) {
                console.log("DEBUG processVideo (Series): Polling aborted (seasons2 source).");
            }
        }

    } catch (error) {
        console.error('DEBUG processVideo (Series): Error in main try block ->', error.name, error.message, error);
        if (error.name === 'AbortError' || (error.message && error.message.toLowerCase().includes('aborted'))) {
            console.log('DEBUG processVideo (Series): Processing was aborted.');
            if (processingStatus !== 'error') setProcessingStatus('idle');
            setErrorMessage('Video loading cancelled.');
            return;
        }

        setProcessingStatus('error');
        setErrorMessage(error.message || 'Failed to process video. Please try again.');

        if (isSeasons2Source && retryCount < maxRetries && !isRetrying) {
            console.log(`DEBUG processVideo (Series): Retrying... (Attempt ${retryCount + 1}/${maxRetries}) for URL: ${urlToProcessInitially}`);
            setIsRetrying(true);
            setRetryCount(prev => prev + 1);
            await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1) ));

            const newAbortController = new AbortController();
            activeRequestRef.current = newAbortController;
            setStreamingUrl(null);
            setPlaying(false);
            await processVideo(urlToProcessInitially, newAbortController.signal, isSeasons2Source);
        } else {
            console.log("DEBUG processVideo (Series): Max retries reached or not a seasons2 source for retry, or already retrying.");
            setIsRetrying(false);
        }
    } finally {
        if (processingTimeoutRef.current) {
            clearTimeout(processingTimeoutRef.current);
            processingTimeoutRef.current = null;
        }
        if (processingStatus === 'ready' || (processingStatus === 'error' && retryCount >= maxRetries)) {
            setIsRetrying(false);
        }
    }
  };

  const handleRetry = async () => {
    console.log("DEBUG (Series): Manual Retry Initiated for quality:", selectedQuality, "S:", selectedSeason, "E:", selectedEpisode);
    setRetryCount(0);
    setIsRetrying(false);
    setErrorMessage('');

    if (!processingInitiated) setProcessingInitiated(true);

    if (playerRef.current) {
        const internalPlayer = playerRef.current.getInternalPlayer();
        if (internalPlayer && typeof internalPlayer.pause === 'function') {
            internalPlayer.pause();
        }
    }
    setPlaying(false);
    setStreamingUrl(null);
    setProcessingStatus('idle');
  };


  // Merging seasons from both sources
  useEffect(() => {
    const seasonMap = new Map();
    if (seasons2 && seasons2.length > 0) {
      seasons2.forEach(season => {
        seasonMap.set(season.seasonNumber.toString(), { ...season, source: 'seasons2' });
      });
    }
    if (seasons && seasons.length > 0) {
      seasons.forEach(season => {
        if (!seasonMap.has(season.seasonNumber.toString())) {
          seasonMap.set(season.seasonNumber.toString(), { ...season, source: 'seasons' });
        }
      });
    }
    const sorted = Array.from(seasonMap.values()).sort((a, b) => parseInt(a.seasonNumber) - parseInt(b.seasonNumber));
    setMergedSeasons(sorted);

    if (sorted.length > 0 && !selectedSeason) {
        setSelectedSeason(sorted[0].seasonNumber.toString());
    }
  }, [seasons, seasons2, selectedSeason]);


  // Update available qualities when selectedSeason changes
  useEffect(() => {
    if (!selectedSeason || mergedSeasons.length === 0) return;

    const currentSeasonData = mergedSeasons.find(s => s.seasonNumber.toString() === selectedSeason);
    const qualities = new Set();
    const allowedResolutions = [480, 720, 1080];

    if (currentSeasonData) {
        if (currentSeasonData.source === 'seasons2') {
            qualities.add('smooth');
        } else if (currentSeasonData.source === 'seasons') {
            if (currentSeasonData.resolutions) {
                currentSeasonData.resolutions.forEach(res => {
                    const qualityNum = getResolutionNumber(res.resolution);
                    if (qualityNum && allowedResolutions.includes(qualityNum)) {
                        qualities.add(qualityNum.toString());
                    }
                    res.episodes?.forEach(ep => {
                        const epQualityNum = getResolutionNumber(detectQualityFromUrl(ep.downloadLink));
                        if (epQualityNum && allowedResolutions.includes(epQualityNum)) {
                            qualities.add(epQualityNum.toString());
                        }
                    });
                });
            } else if (currentSeasonData.episodes) {
                currentSeasonData.episodes.forEach(episode => {
                    episode.downloadLinks?.forEach(link => {
                        const qualityNum = getResolutionNumber(link.quality);
                         if (qualityNum && allowedResolutions.includes(qualityNum)) {
                            qualities.add(qualityNum.toString());
                        }
                    });
                });
            }
        }
    }

    const sortedQualities = Array.from(qualities).sort((a, b) => {
        if (a === 'smooth') return -1;
        if (b === 'smooth') return 1;
        return parseInt(b) - parseInt(a);
    });

    setAvailableQualities(sortedQualities);

    if (sortedQualities.length > 0) {
        if (!selectedQuality || !sortedQualities.includes(selectedQuality)) {
             setSelectedQuality(sortedQualities[0]);
        }
    } else {
        setSelectedQuality('');
    }
  }, [selectedSeason, mergedSeasons, selectedQuality]);


  const detectQualityFromUrl = (url) => {
    if (!url) return null;
    const folderQualityMatch = url.match(/\/(\d+)p\//i);
    if (folderQualityMatch) return folderQualityMatch[1];
    const filenameQualityMatch = url.match(/[._](\d{3,4})[pP]?([._]|$)/i);
    if (filenameQualityMatch) return filenameQualityMatch[1];
    return null;
  };

  const detectEpisodeFromUrl = (filename) => {
    if (!filename) return null;
    const patterns = [
        /S\d{1,2}E(\d{1,3})/i,
        /-s\d{1,2}e(\d{1,3})-/i,
        /[._][Ee](\d{1,3})([._]|$)/i,
        /\[(\d{1,3})\]/,
        /\s-\s(\d{1,3})\s?([\[\(]|$)/,
        /\sepisode\s(\d+)/i,
        /\s(\d+)\s?\(.+\)/i,
    ];
    for (const pattern of patterns) {
        const match = filename.match(pattern);
        if (match && match[1]) return parseInt(match[1]);
    }
    const simpleNumMatch = filename.match(/(?<!\d)\d{1,3}(?!\d|p|P)/);
    if (simpleNumMatch) return parseInt(simpleNumMatch[0]);

    return null;
  };


useEffect(() => {
  if (!selectedSeason || !selectedQuality || mergedSeasons.length === 0) {
    setEpisodes([]);
    return;
  }

  const currentSeasonData = mergedSeasons.find(s => s.seasonNumber.toString() === selectedSeason);
  if (!currentSeasonData) {
    setEpisodes([]);
    return;
  }

  let rawEpisodes = [];

  if (selectedQuality === 'smooth' && currentSeasonData.source === 'seasons2') {
    currentSeasonData.resolutions?.forEach(resolution => {
      resolution.episodes?.forEach(episode => {
        rawEpisodes.push({
          ...episode,
          detectedQuality: 'smooth'
        });
      });
    });
  } else if (currentSeasonData.source === 'seasons') {
    if (currentSeasonData.resolutions) {
      currentSeasonData.resolutions.forEach(res => {
        if (getResolutionNumber(res.resolution)?.toString() === selectedQuality) {
          res.episodes?.forEach(ep => {
            rawEpisodes.push({...ep, detectedQuality: selectedQuality});
          });
        } else {
          res.episodes?.forEach(ep => {
            const epQuality = detectQualityFromUrl(ep.downloadLink);
            if (epQuality?.toString() === selectedQuality) {
              rawEpisodes.push({...ep, detectedQuality: selectedQuality});
            }
          });
        }
      });
    } else if (currentSeasonData.episodes) {
      currentSeasonData.episodes.forEach(episode => {
        episode.downloadLinks?.forEach(link => {
          if (getResolutionNumber(link.quality)?.toString() === selectedQuality) {
            rawEpisodes.push({
              ...episode,
              downloadLink: link.downloadLink,
              detectedQuality: selectedQuality
            });
          }
        });
      });
    }
  }

  const processedEpisodes = rawEpisodes.map((ep, index) => {
    const filename = ep.downloadLink?.split('/').pop();
    let episodeNumber = ep.episodeNumber || detectEpisodeFromUrl(filename) || (index + 1);
    return {
      ...ep,
      episodeNumber: episodeNumber,
      title: ep.episodeTitle || ep.title || `Episode ${episodeNumber}`
    };
  }).sort((a, b) => a.episodeNumber - b.episodeNumber);

  const uniqueEpisodes = [];
  const seenEpisodeNumbers = new Set();

  processedEpisodes.forEach(ep => {
    if (!seenEpisodeNumbers.has(ep.episodeNumber)) {
      uniqueEpisodes.push(ep);
      seenEpisodeNumbers.add(ep.episodeNumber);
    } else {
      const existingIndex = uniqueEpisodes.findIndex(u => u.episodeNumber === ep.episodeNumber);
      if (existingIndex !== -1 && ep.detectedQuality === selectedQuality) {
        uniqueEpisodes[existingIndex] = ep;
      }
    }
  });

  setEpisodes(uniqueEpisodes);

  if (uniqueEpisodes.length > 0) {
    if (!selectedEpisode || !uniqueEpisodes.some(e => e.episodeNumber.toString() === selectedEpisode)) {
      setSelectedEpisode(uniqueEpisodes[0].episodeNumber.toString());
    }
  } else {
    setSelectedEpisode('');
  }
}, [selectedSeason, selectedQuality, mergedSeasons, selectedEpisode]);

  // --- MODIFIED --- Main processing logic
  useEffect(() => {
    const processSelectedContent = async () => {
        if (!processingInitiated || !selectedQuality || !selectedSeason || !selectedEpisode || episodes.length === 0) {
            console.log("DEBUG (Series) processSelectedContent: Skipped - conditions not met.",
                {processingInitiated, selectedQuality, selectedSeason, selectedEpisode, numEpisodes: episodes.length});
            return;
        }
        console.log("DEBUG (Series) processSelectedContent: Starting for S", selectedSeason, "E", selectedEpisode, "Q", selectedQuality);

        if (playerRef.current) {
            const internalPlayer = playerRef.current.getInternalPlayer();
            if (internalPlayer && typeof internalPlayer.pause === 'function') {
                console.log("DEBUG (Series): Explicitly pausing player for new content.");
                internalPlayer.pause();
            }
        }
        setPlaying(false); // Crucial: ensure playing is false before URL changes

        cancelActiveRequest();
        const controller = new AbortController();
        activeRequestRef.current = controller;

        setStreamingUrl(null);
        setVideoMetadataLoaded(false);
        setIsPlayerReady(false);
        setPlayed(0);
        setCurrentTime(0);
        setDuration(0);
        setErrorMessage('');
        setSubtitleTracks([]);

        const targetEpisode = episodes.find(e => e.episodeNumber?.toString() === selectedEpisode);

        if (!targetEpisode || !targetEpisode.downloadLink) {
            setProcessingStatus('error');
            setErrorMessage(`Episode S${selectedSeason}E${selectedEpisode} not found for quality ${selectedQuality}.`);
            activeRequestRef.current = null;
            return;
        }

        const urlToProcess = targetEpisode.downloadLink;
        const isSeasons2 = selectedQuality === 'smooth' && mergedSeasons.find(s => s.seasonNumber.toString() === selectedSeason)?.source === 'seasons2';

        if (isSeasons2) {
            setProcessingStatus('checking');
            const actualUrl = await fetchActualUrl(urlToProcess);
            if (controller.signal.aborted) return;
            if (actualUrl) {
                setOriginalFilenameForSubtitle(actualUrl.split('/').pop().split('?')[0] || `series_s2_${Date.now()}`);
                await processVideo(actualUrl, controller.signal, true);
            } else {
                setProcessingStatus('error');
                setErrorMessage('Failed to fetch actual URL for smooth quality.');
                activeRequestRef.current = null;
            }
        } else {
            setOriginalFilenameForSubtitle(urlToProcess.split('/').pop().split('?')[0] || `series_s1_${Date.now()}`);

            const transformedCdnUrl = replaceDomainWithCDN(urlToProcess);
            let playDirectly = false;
            let urlToPlayDirectly = '';

            if (transformedCdnUrl !== urlToProcess) {
                urlToPlayDirectly = transformedCdnUrl;
                playDirectly = true;
            } else {
                const targetCdnDomains = Object.values(GLOBAL_DOMAIN_MAPPINGS);
                if (targetCdnDomains.some(cdnDomain => urlToProcess.startsWith(cdnDomain))) {
                    urlToPlayDirectly = urlToProcess;
                    playDirectly = true;
                }
            }

            if (playDirectly) {
                setStreamingUrl(urlToPlayDirectly);
                setProcessingStatus('ready');
                activeRequestRef.current = null;
            } else if (urlToProcess.includes('dl4.sermoviedown.pw')) {
                setProcessingStatus('blocked');
                setErrorMessage('Video will soon be available for streaming (dl4.sermoviedown.pw)');
                activeRequestRef.current = null;
            } else {
                await processVideo(urlToProcess, controller.signal, false);
            }
        }
    };

    if (processingInitiated) {
        processSelectedContent();
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processingInitiated, selectedQuality, selectedSeason, selectedEpisode, episodes]); // episodes is crucial here


  useEffect(() => {
    const fetchSubtitlesForSeries = async () => {
        console.log('DEBUG SUB (Series): Starting subtitle fetch process');
        const cleanedMovieTitle = cleanSeriesTitle(movieTitle);
        console.log('DEBUG SUB (Series): Cleaned Movie Title:', cleanedMovieTitle);
        console.log('DEBUG SUB (Series): Original Filename for Subtitle:', originalFilenameForSubtitle);

        if (!cleanedMovieTitle || !originalFilenameForSubtitle || !selectedSeason || !selectedEpisode) {
            console.log('DEBUG SUB (Series): Missing required data for subtitle fetch.');
            setSubtitleTracks([]);
            return;
        }
        setIsSubtitleLoading(true);
        setSubtitleTracks([]);

        try {
            const baseFilenameForSub = originalFilenameForSubtitle.replace(/\.(mp4|mkv|avi|webm)$/i, '');
            const primarySubFilenameOnCDN = `${baseFilenameForSub}.vtt`;
            const cdnSubUrl = `https://filmvaultsub.b-cdn.net/${encodeURIComponent(primarySubFilenameOnCDN)}`;
            console.log('DEBUG SUB (Series): Checking for primary subtitle at CDN URL:', cdnSubUrl);

            let mainSubTrack = null;
            const checkResponse = await fetch(cdnSubUrl, { method: 'HEAD' });

            if (checkResponse.ok) {
                console.log('DEBUG SUB (Series): Primary subtitle found in CDN.');
                mainSubTrack = { kind: 'subtitles', src: cdnSubUrl, srcLang: 'en', label: `English S${selectedSeason}E${selectedEpisode}`, default: true, type: 'text/vtt' };
            } else {
                console.log('DEBUG SUB (Series): Primary subtitle not in CDN, initiating download.');
                const encodedApiMovie = encodeURIComponent(cleanedMovieTitle);
                const filenameForApi = `${cleanedMovieTitle} S${selectedSeason}E${selectedEpisode}`;
                const encodedApiFilename = encodeURIComponent(baseFilenameForSub);

                const downloadUrl = `https://subtitles-production.up.railway.app/nodejs/download-subtitle-subsource?movie=${encodedApiMovie}&type=tv&filename=${encodedApiFilename}&season=${selectedSeason}&episode=${selectedEpisode}`;
                console.log('DEBUG SUB (Series): Making subtitle download request to:', downloadUrl);

                const downloadResponse = await fetch(downloadUrl);
                if (!downloadResponse.ok) throw new Error(`Subtitle download failed: ${downloadResponse.status}`);
                const responseData = await downloadResponse.json();
                console.log('DEBUG SUB (Series): Download Response Data:', responseData);

                console.log('DEBUG SUB (Series): Waiting for subtitle processing/CDN propagation...');
                await new Promise(resolve => setTimeout(resolve, 3000));

                const finalCheckResponse = await fetch(cdnSubUrl, { method: 'HEAD' });
                if (finalCheckResponse.ok) {
                    console.log('DEBUG SUB (Series): Subtitle now available in CDN after processing.');
                    mainSubTrack = { kind: 'subtitles', src: cdnSubUrl, srcLang: 'en', label: `English S${selectedSeason}E${selectedEpisode} (Processed)`, default: true, type: 'text/vtt' };
                } else if (responseData && responseData.s3Path) {
                    const s3Url = responseData.s3Path.startsWith('http') ? responseData.s3Path : `https://${responseData.s3Path}`;
                    console.log('DEBUG SUB (Series): Using Wasabi/S3 URL as fallback:', s3Url);
                    mainSubTrack = { kind: 'subtitles', src: s3Url, srcLang: 'en', label: `English S${selectedSeason}E${selectedEpisode} (S3)`, default: true, type: 'text/vtt' };
                } else {
                    throw new Error('No subtitle data available after download attempt and CDN check.');
                }
            }

            const allTracks = mainSubTrack ? [mainSubTrack] : [];
            console.log('DEBUG SUB (Series): Checking for additional subtitle versions (v2, v3, etc.)...');
            let version = 2;
            let versionExists = true;
            while (versionExists && version <= 10) {
                const versionedFilename = `v${version}_${baseFilenameForSub}.vtt`;
                const versionedUrl = `https://fvsubtitles.b-cdn.net/${encodeURIComponent(versionedFilename)}`;
                try {
                    const verCheckResponse = await fetch(versionedUrl, { method: 'HEAD' });
                    if (verCheckResponse.ok) {
                        console.log(`DEBUG SUB (Series): Version ${version} subtitle found.`);
                        allTracks.push({ kind: 'subtitles', src: versionedUrl, srcLang: 'en', label: `English v${version}`, default: false, type: 'text/vtt' });
                        version++;
                    } else {
                        versionExists = false;
                    }
                } catch (error) {
                    console.error(`DEBUG SUB (Series): Error checking version ${version} subtitle:`, error);
                    versionExists = false;
                }
            }
            setSubtitleTracks(allTracks);
            if (allTracks.length > 0) {
                setCurrentSubtitleIndex(0);
            }

        } catch (error) {
            console.error('DEBUG SUB (Series): Error in subtitle process:', error);
            setSubtitleTracks([]);
        } finally {
            setIsSubtitleLoading(false);
            console.log('DEBUG SUB (Series): Subtitle process completed.');
        }
    };

    if (movieTitle && originalFilenameForSubtitle && selectedSeason && selectedEpisode && processingInitiated && hasStarted) {
        fetchSubtitlesForSeries();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieTitle, originalFilenameForSubtitle, selectedSeason, selectedEpisode, processingInitiated, hasStarted]);


  const onFullscreenChange = useCallback(() => {
    const isNowFullscreen = screenfull.isFullscreen;
    setIsFullscreen(isNowFullscreen);
    if (isNowFullscreen) {
        setShowControls(true);
        if (controlsTimeout) clearTimeout(controlsTimeout);
        setControlsTimeout(setTimeout(hideControls, 5000));
    } else {
        setShowControls(true);
    }
  }, [playing, hideControls, controlsTimeout]);

  useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on('change', onFullscreenChange);
    }
    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', onFullscreenChange);
      }
    };
  }, [onFullscreenChange]);

  const handlePlayPause = useCallback(() => {
    if (!hasStarted) {
        setHasStarted(true);
        setProcessingInitiated(true);
        setShowInitialPlayButton(false);
    }

    if (processingStatus === 'ready' && streamingUrl && isPlayerReady) {
        setPlaying(prevPlaying => !prevPlaying);
    } else if (!playing && (processingStatus === 'idle' || processingStatus === 'error') && !streamingUrl && hasStarted && !processingInitiated) {
        setShowInitialPlayButton(false);
        setProcessingInitiated(true);
    } else if (playing && (!streamingUrl || processingStatus !== 'ready')) {
        setPlaying(false);
    }
    showControlsWithTimeout();
  }, [playing, hasStarted, processingStatus, streamingUrl, processingInitiated, showControlsWithTimeout, isPlayerReady]);


  const handleReactPlayerReady = () => {
    console.log("DEBUG (Series): ReactPlayer component is ready. Streaming URL:", streamingUrl);
    setIsPlayerReady(true);
    const internalPlayer = playerRef.current?.getInternalPlayer();

    if (internalPlayer) {
        if (!document.getElementById('custom-subtitle-styles-series')) {
            const style = document.createElement('style');
            style.id = 'custom-subtitle-styles-series';
            style.textContent = `
                .enhanced-series-player video::cue {
                    bottom: ${isMobile ? '55px' : '65px'} !important;
                    position: relative !important;
                    background-color: rgba(0, 0, 0, 0.7);
                    color: white;
                    text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black;
                    font-size: ${isMobile ? '0.9em' : '1.1em'};
                    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
                    line-height: 1.35;
                    white-space: pre-line;
                    padding: 0.25em 0.45em;
                    border-radius: 4px;
                }
                .enhanced-series-player video::-webkit-media-text-track-container {
                    bottom: ${isMobile ? '55px' : '65px'} !important;
                }
                .enhanced-series-player video::-webkit-media-text-track-display-backdrop {
                    background-color: transparent !important;
                }
            `;
            document.head.appendChild(style);
        }

        const setMeta = () => {
            if (internalPlayer.duration > 0 && !videoMetadataLoaded) {
                 console.log("DEBUG (Series): Video metadata loaded/duration available via onReady/event listener.");
                setVideoMetadataLoaded(true);
                setDuration(internalPlayer.duration);
                setIsBuffering(false);
            }
        };

        if (internalPlayer.readyState >= 1 || internalPlayer.duration > 0) {
            setMeta();
        } else {
            internalPlayer.addEventListener('loadedmetadata', setMeta, { once: true });
            internalPlayer.addEventListener('durationchange', setMeta, { once: true });
            setTimeout(() => {
                if (!videoMetadataLoaded && internalPlayer.duration > 0) {
                    console.log("DEBUG (Series): Video metadata loaded via onReady timeout fallback.");
                    setMeta();
                }
            }, 1000);
        }
    } else {
        console.warn("DEBUG (Series): Player ready called, but internal player not found immediately.");
    }
  };


  useEffect(() => {
    const videoElement = playerRef.current?.getInternalPlayer();
    if (videoElement && isPlayerReady) {
        const existingTrackElements = videoElement.querySelectorAll('track');
        existingTrackElements.forEach(trackEl => trackEl.remove());

        if (subtitleTracks.length > 0 && currentSubtitleIndex >= 0 && currentSubtitleIndex < subtitleTracks.length) {
            const currentTrackInfo = subtitleTracks[currentSubtitleIndex];
            if (currentTrackInfo && currentTrackInfo.src) {
                const trackElement = document.createElement('track');
                trackElement.kind = currentTrackInfo.kind || 'subtitles';
                trackElement.label = currentTrackInfo.label || `Track ${currentSubtitleIndex + 1}`;
                trackElement.srclang = currentTrackInfo.srcLang || 'en';
                trackElement.src = currentTrackInfo.src;
                trackElement.default = true;
                videoElement.appendChild(trackElement);

                setTimeout(() => {
                    if (videoElement.textTracks && videoElement.textTracks.length > 0) {
                        let addedTextTrack = videoElement.textTracks[videoElement.textTracks.length -1];
                        if (addedTextTrack) {
                            addedTextTrack.mode = subtitlesEnabled ? 'showing' : 'hidden';
                        }
                    }
                }, 250);
            }
        }
    }
  }, [subtitleTracks, currentSubtitleIndex, subtitlesEnabled, isPlayerReady]);


  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
      setCurrentTime(state.playedSeconds);
      if (isBuffering && state.playedSeconds > lastPlayedTime) {
        setIsBuffering(false);
        if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
      }
      setLastPlayedTime(state.playedSeconds);
    }
    if (duration > 0) {
        if (state.played > 0.95 && !showNextEpisodeTooltip) {
            setShowNextEpisodeTooltip(true);
            if (nextEpisodeTooltipTimeoutRef.current) clearTimeout(nextEpisodeTooltipTimeoutRef.current);
            nextEpisodeTooltipTimeoutRef.current = setTimeout(() => setShowNextEpisodeTooltip(false), 5000);
        } else if (state.played <= 0.95 && showNextEpisodeTooltip) {
            setShowNextEpisodeTooltip(false);
        }
    }
  };

  useEffect(() => {
    if (playing && streamingUrl && processingStatus === 'ready' && videoMetadataLoaded) {
        setShowEpisodeStartTooltip(true);
        if (episodeStartTooltipTimeoutRef.current) clearTimeout(episodeStartTooltipTimeoutRef.current);
        episodeStartTooltipTimeoutRef.current = setTimeout(() => setShowEpisodeStartTooltip(false), 4000);
    } else {
        setShowEpisodeStartTooltip(false);
    }
    return () => clearTimeout(episodeStartTooltipTimeoutRef.current);
  }, [playing, streamingUrl, selectedSeason, selectedEpisode, processingStatus, videoMetadataLoaded]);


  const handleBuffer = () => {
    if (isPlayerReady && videoMetadataLoaded && playing) {
      setIsBuffering(true);
      if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
      bufferingTimeoutRef.current = setTimeout(() => {
        if(isBuffering) console.warn("DEBUG (Series): Buffering seems persistent.");
      }, 10000);
    }
  };
  const handleBufferEnd = () => {
    setIsBuffering(false);
    if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
  };
  const handleError = (e) => {
    console.error('ReactPlayer Error (Series):', e, "URL:", streamingUrl);
    setIsBuffering(false);
    setErrorMessage("Video playback error. Try a different quality or episode.");
    setPlaying(false);
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (newMutedState) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume > 0 ? prevVolume : 1);
    }
    showControlsWithTimeout();
  };
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (newVolume > 0) setPrevVolume(newVolume);
    showControlsWithTimeout();
  };
  const handleSeekMouseDown = () => setSeeking(true);
  const handleSeekChange = (e) => setPlayed(parseFloat(e.target.value));
  const handleSeekMouseUp = (e) => {
    if (playerRef.current && isPlayerReady) playerRef.current.seekTo(parseFloat(e.target.value));
    setSeeking(false);
    showControlsWithTimeout();
  };
  const handleSeekTouchStart = (e) => setSeeking(true);
  const handleSeekTouchMove = (e) => {
    if (!seeking) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const position = (touch.clientX - rect.left) / rect.width;
    setPlayed(Math.max(0, Math.min(1, position)));
  };
  const handleSeekTouchEnd = (e) => {
    if (playerRef.current && isPlayerReady) playerRef.current.seekTo(played);
    setSeeking(false);
    showControlsWithTimeout();
  };

  const handleVideoClick = (e) => {
    if (seeking || (controlsRef.current && controlsRef.current.contains(e.target))) return;
    const currentTimeVal = new Date().getTime();
    const timeDiff = currentTimeVal - lastClickTime;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    if (timeDiff < 300 && timeDiff > 0) {
      handleFullscreen();
      setLastClickTime(0);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        if (playing) {
          setShowControls(prev => !prev);
          if (!showControls) showControlsWithTimeout();
        } else if (hasStarted && streamingUrl && processingStatus === 'ready' && isPlayerReady) {
          handlePlayPause();
        }
        clickTimeoutRef.current = null;
      }, 250);
      setLastClickTime(currentTimeVal);
    }
  };

  const handleTouchStart = (e) => {
    if (e.target.type === 'range' || e.target.tagName === 'SELECT' || e.target.closest('button') || controlsRef.current?.contains(e.target)) return;
    const currentTimeVal = new Date().getTime();
    const timeDiff = currentTimeVal - lastTapTime;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    if (timeDiff < 300 && timeDiff > 0) {
      handleFullscreen();
      setLastTapTime(0);
    } else {
      setLastTapTime(currentTimeVal);
      clickTimeoutRef.current = setTimeout(() => {
        if (playing) {
          setShowControls(prev => {
            if (!prev) showControlsWithTimeout();
            return !prev;
          });
        } else if (hasStarted && streamingUrl && processingStatus === 'ready' && isPlayerReady) {
          handlePlayPause();
        }
        clickTimeoutRef.current = null;
      }, 250);
    }
  };

  const handleFullscreen = () => {
    if (screenfull.isEnabled && containerRef.current) {
      screenfull.toggle(containerRef.current).catch(err => console.warn("Screenfull toggle failed:", err));
    } else {
        const videoElement = playerRef.current?.getInternalPlayer();
        if (videoElement) {
            if (document.fullscreenElement === videoElement || document.webkitFullscreenElement === videoElement) {
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            } else {
                if (videoElement.requestFullscreen) videoElement.requestFullscreen({ navigationUI: "hide" });
                else if (videoElement.webkitRequestFullscreen) videoElement.webkitRequestFullscreen();
            }
        }
    }
    showControlsWithTimeout();
  };

  const handleRotate = async () => {
    if (isFullscreen && isMobile) {
      try {
        const newOrientation = screenOrientation === 'portrait' ? 'landscape' : 'portrait';
        if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock(newOrientation);
            setScreenOrientation(newOrientation);
        } else {
            const videoWrapper = containerRef.current?.querySelector('.video-wrapper');
            if(videoWrapper) {
                if (newOrientation === 'landscape') videoWrapper.style.transform = 'rotate(90deg)';
                else videoWrapper.style.transform = 'rotate(0deg)';
                setScreenOrientation(newOrientation);
            }
        }
      } catch (error) {
        console.error('Orientation change failed:', error);
      }
    }
  };

  useEffect(() => {
    const updateOrientation = () => {
        if (screen.orientation) {
            setScreenOrientation(screen.orientation.type.includes('landscape') ? 'landscape' : 'portrait');
        }
    };
    screen.orientation?.addEventListener('change', updateOrientation);
    return () => screen.orientation?.removeEventListener('change', updateOrientation);
  }, []);

  useEffect(() => {
    if (!isFullscreen) {
        if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
        const videoWrapper = containerRef.current?.querySelector('.video-wrapper');
        if (videoWrapper && videoWrapper.style.transform.includes('rotate')) {
            videoWrapper.style.transform = 'none';
        }
        setScreenOrientation('portrait');
    }
  }, [isFullscreen]);


  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity || seconds < 0) return '00:00';
    const date = new Date(0);
    date.setSeconds(seconds);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return hh ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  const toggleSubtitles = () => {
    setSubtitlesEnabled(!subtitlesEnabled);
  };

  const showSubtitleChangeNotification = (message) => {
    setSubtitleChangeMessage(message);
    setShowSubtitleChangeMessage(true);
    setTimeout(() => {
      setShowSubtitleChangeMessage(false);
      setSubtitleChangeMessage('');
    }, 3000);
  };

  useEffect(() => {
    if (subtitleTracks.length > 1 && hasStarted) {
      setShowSubtitleTooltip(true);
      const timer = setTimeout(() => setShowSubtitleTooltip(false), 7000);
      return () => clearTimeout(timer);
    } else {
      setShowSubtitleTooltip(false);
    }
  }, [subtitleTracks, hasStarted]);

  useEffect(() => {
    if (isMobile && hasStarted && playing && !isFullscreen && !showControls) {
      if (fullscreenTooltipTimeoutRef.current) clearTimeout(fullscreenTooltipTimeoutRef.current);
      setShowFullscreenTooltip(true);
      fullscreenTooltipTimeoutRef.current = setTimeout(() => setShowFullscreenTooltip(false), 4000);
    } else {
      setShowFullscreenTooltip(false);
      if (fullscreenTooltipTimeoutRef.current) clearTimeout(fullscreenTooltipTimeoutRef.current);
    }
    return () => clearTimeout(fullscreenTooltipTimeoutRef.current);
  }, [isMobile, hasStarted, playing, isFullscreen, showControls]);

  useEffect(() => {
    return () => {
      cancelActiveRequest();
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
      if (fullscreenTooltipTimeoutRef.current) clearTimeout(fullscreenTooltipTimeoutRef.current);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (controlsTimeout) clearTimeout(controlsTimeout);
      if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
      if (nextEpisodeTooltipTimeoutRef.current) clearTimeout(nextEpisodeTooltipTimeoutRef.current);
      if (episodeStartTooltipTimeoutRef.current) clearTimeout(episodeStartTooltipTimeoutRef.current);
      if (screenfull.isEnabled) screenfull.off('change', onFullscreenChange);
      screen.orientation?.removeEventListener('change', ()=>{/*native handler*/});
      const customStyles = document.getElementById('custom-subtitle-styles-series');
      if (customStyles) customStyles.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const showProcessingSpinner = (processingStatus === 'checking' || processingStatus === 'downloading') && !showInitialPlayButton && processingInitiated;
  const showLoadingIndicator = isBuffering || (processingStatus === 'ready' && !videoMetadataLoaded && hasStarted && !showInitialPlayButton && streamingUrl && !isPlayerReady);
  const showPausedPlayButton = (!playing && hasStarted && processingStatus === 'ready' && streamingUrl && !showInitialPlayButton && !isBuffering && videoMetadataLoaded && isPlayerReady);
  const showErrorDisplay = processingStatus === 'error' && !showInitialPlayButton && (errorMessage || (selectedQuality && !streamingUrl));


  return (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold p-4 text-center">{movieTitle ? cleanSeriesTitle(movieTitle) : "Series Stream"}</h2>
      <div className="flex flex-wrap gap-2 md:gap-4 mb-4 mt-2 px-2 md:px-0 justify-center">
        <select
          value={selectedSeason}
          onChange={(e) => {setSelectedSeason(e.target.value); setSelectedEpisode('');}}
          className="bg-gray-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Select Season"
        >
          <option value="" disabled>Select Season</option>
          {mergedSeasons.map(season => (
            <option key={`season-select-${season.seasonNumber}`} value={season.seasonNumber}>
              Season {season.seasonNumber}
            </option>
          ))}
        </select>

        <select
          value={selectedQuality}
          onChange={(e) => setSelectedQuality(e.target.value)}
          disabled={!selectedSeason || availableQualities.length === 0}
          className="bg-gray-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          aria-label="Select Quality"
        >
          <option value="" disabled>Quality</option>
          {availableQualities.map(quality => (
            <option key={`quality-select-${quality}`} value={quality}>
              {quality === 'smooth' ? 'Smooth (S2)' : `${quality}p`}
            </option>
          ))}
        </select>

        <select
          value={selectedEpisode}
          onChange={(e) => setSelectedEpisode(e.target.value)}
          disabled={!selectedQuality || episodes.length === 0}
          className="bg-gray-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          aria-label="Select Episode"
        >
          <option value="" disabled>Select Episode</option>
          {episodes.map(episode => (
            <option key={`ep-select-${episode.episodeNumber}-s${selectedSeason}`} value={episode.episodeNumber}>
              {episode.title || `Episode ${episode.episodeNumber}`}
            </option>
          ))}
        </select>
      </div>

      <div
        ref={containerRef}
        className="bg-black rounded-xl overflow-hidden shadow-xl relative group lg:max-w-4xl mx-auto enhanced-series-player"
        onMouseMove={isMobile ? undefined : showControlsWithTimeout}
        onMouseLeave={isMobile ? undefined : () => { if (!isFullscreen && playing && !seeking) hideControls();}}
        onTouchStart={handleTouchStart}
        onClick={isMobile ? undefined : handleVideoClick}
        style={{ paddingBottom: (isAndroid && !isFullscreen) ? '50px' : '0px', WebkitTapHighlightColor: 'transparent' }}
      >
        <div className={`flex items-center justify-center bg-black ${isFullscreen ? 'h-screen w-screen fixed top-0 left-0 z-[2147483647]' : 'aspect-video'}`}>
            {isFullscreen && (
                <div
                    className="absolute inset-0 z-20"
                    onMouseMove={isMobile ? undefined : showControlsWithTimeout}
                    onMouseLeave={isMobile ? undefined : () => { if (playing && !seeking) hideControls(); }}
                    onClick={isMobile ? undefined : handleVideoClick}
                    style={{pointerEvents: 'auto'}}
                />
            )}

            {showInitialPlayButton && (processingStatus === 'idle' || processingStatus === 'error' || !streamingUrl) && (
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer z-20 bg-black/30" onClick={handleInitialPlay}>
                    <button className="group relative" aria-label="Start video">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform scale-110 group-hover:scale-125 rounded-full bg-blue-500 opacity-75 animate-pulse-fast" style={{ padding: 'calc(48px * 0.6)' }}></div>
                        <div className="relative bg-black/50 rounded-full p-4 transition-transform group-hover:scale-110">
                            <FaPlay className="text-white text-4xl" />
                        </div>
                    </button>
                </div>
            )}

            {processingStatus === 'blocked' && !showInitialPlayButton && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-4">
                    <div className="text-white text-lg text-center">
                        {errorMessage || 'This video source is temporarily unavailable.'}
                    </div>
                </div>
            )}

            {showProcessingSpinner && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                    <FaSpinner className="animate-spin text-white text-4xl mb-4" />
                    <span className="text-white">
                        {processingStatus === 'downloading' ? 'Preparing video...' : 'Checking source...'}
                    </span>
                </div>
            )}

            {streamingUrl && (
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

                    {showPausedPlayButton && (
                        // MODIFICATION: Added e.stopPropagation() to the onClick handler here
                        <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent click from bubbling to parent container
                                handlePlayPause();
                            }}
                        >
                            <button className="group relative bg-black/40 rounded-full p-3 hover:bg-black/60 transition-colors" aria-label="Play video" >
                                <FaPlay className="text-white text-3xl md:text-4xl group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    )}

                    {playing && showControls && isMobile && !isIOS && (
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
                        className={`video-wrapper w-full h-full ${isFullscreen ? '' : ''}`}
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'black', transition: 'transform 0.3s ease' }}
                    >
                        <ReactPlayer
                            ref={playerRef}
                            url={streamingUrl}
                            key={`player-${selectedSeason}-${selectedEpisode}-${selectedQuality}-${streamingUrl}`}
                            playing={playing}
                            volume={volume}
                            muted={isMuted}
                            width="100%"
                            height="100%"
                            style={{ maxWidth: '100%', maxHeight: '100%', margin: 'auto', objectFit: 'contain', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'black' }}
                            className={`react-player ${isFullscreen ? 'fullscreen' : ''}`}
                            onProgress={handleProgress}
                            onBuffer={handleBuffer}
                            onBufferEnd={handleBufferEnd}
                            onReady={handleReactPlayerReady}
                            onError={handleError}
                            onPlay={() => {
                                console.log("DEBUG (Series): Player started playing (onPlay event)");
                                setPlaying(true);
                                setIsBuffering(false);
                            }}
                            onPause={() => {
                                console.log("DEBUG (Series): Player paused (onPause event)");
                                setPlaying(false);
                            }}
                            onEnded={() => {
                                console.log("DEBUG (Series): Player ended (onEnded event)");
                                setPlaying(false);
                            }}
                            config={{
                                file: {
                                    attributes: { controlsList: 'nodownload', crossOrigin: 'anonymous', playsInline: true, 'webkit-playsinline': true, muted: false, style: { width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'black' } },
                                    forceVideo: true,
                                    hlsOptions: { maxMaxBufferLength: 600, maxBufferLength: 30, startPosition: -1, backBufferLength: 30, liveSyncDurationCount: 3, maxLoadingDelay: 4, manifestLoadingTimeOut: 10000, manifestLoadingMaxRetry: 3, fragLoadingTimeOut: 15000, fragLoadingMaxRetry: 3, levelLoadingTimeOut: 10000, levelLoadingMaxRetry: 3, abrEwmaDefaultEstimate: 500000, abrBandWidthFactor: 0.9, abrBandWidthUpFactor: 0.7, abrMaxWithRealBitrate: true, enableWorker: true, autoStartLoad: true }
                                },
                            }}
                        />
                    </div>
                </>
            )}

            {showLoadingIndicator && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
                    <FaSpinner className="animate-spin text-white text-4xl" />
                </div>
            )}

            {isSubtitleLoading && !showInitialPlayButton && processingStatus !== 'downloading' && processingStatus !== 'checking' && (
                <div className="absolute bottom-20 left-4 text-white text-xs md:text-sm bg-black/50 px-2 py-1 rounded z-20 shadow">
                    Loading subtitles...
                </div>
            )}

            {showErrorDisplay && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 z-10 text-center">
                    <div className="text-red-400 mb-3 text-sm md:text-base">
                        Error: {errorMessage}
                    </div>
                    {(selectedQuality) && (
                        <button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm md:text-base shadow hover:shadow-lg transition-all" >
                            <FaRotate className={`mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                            Retry {isRetrying ? `(${retryCount}/${maxRetries})` : ''}
                        </button>
                    )}
                </div>
            )}

            {showFullscreenTooltip && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs p-2 rounded-md z-30 whitespace-nowrap shadow">
                    Double tap video for fullscreen
                </div>
            )}
            {isIOS && showIosTooltip && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm p-2 rounded-md z-30 whitespace-nowrap shadow">
                    Playback issues on iOS? Try downloading.
                </div>
            )}
             {showEpisodeStartTooltip && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm p-2 rounded-md z-30 shadow-lg whitespace-nowrap">
                    Playing: {movieTitle ? cleanSeriesTitle(movieTitle) : ''} S{selectedSeason} E{selectedEpisode}
                </div>
            )}
            {showNextEpisodeTooltip && (
                 <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm p-2 rounded-md z-30 shadow-lg">
                    Episode ending. Select next episode from dropdown.
                </div>
            )}


            {((hasStarted && (streamingUrl || processingStatus === 'ready')) && !showInitialPlayButton) && (
                <div
                    ref={controlsRef}
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent p-2 md:p-3 transition-opacity duration-300 ${showControls ? 'opacity-100 z-20' : 'opacity-0 z-0 pointer-events-none'}`}
                    onClick={(e) => e.stopPropagation()} // Prevent clicks on controls from bubbling to video click/tap
                    onTouchStart={(e) => e.stopPropagation()} // Prevent touches on controls from bubbling
                >
                    <div className="flex items-center space-x-2 mb-1.5 md:mb-2.5">
                        <input
                            type="range" min={0} max={1} step="any" value={played}
                            onMouseDown={handleSeekMouseDown} onChange={handleSeekChange} onMouseUp={handleSeekMouseUp}
                            onTouchStart={handleSeekTouchStart} onTouchMove={handleSeekTouchMove} onTouchEnd={handleSeekTouchEnd}
                            className="w-full h-1.5 md:h-2 bg-gray-500/70 rounded-lg appearance-none cursor-pointer range-thumb-blue transition-opacity hover:opacity-90"
                            style={{ background: `linear-gradient(to right, #3b82f6 ${played * 100}%, rgba(75, 85, 99, 0.7) ${played * 100}%)` }}
                            aria-label="Video progress"
                            disabled={!isPlayerReady || duration === 0}
                        />
                    </div>
                    <div className="flex items-center justify-between text-xs md:text-sm text-white">
                        <div className="flex items-center space-x-2 md:space-x-3">
                            <button onClick={handlePlayPause} disabled={!isPlayerReady} className="text-white hover:text-gray-300 transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded disabled:opacity-50" aria-label={playing ? "Pause" : "Play"}>
                                {playing ? <FaPause size={isMobile ? 16 : 18} /> : <FaPlay size={isMobile ? 16 : 18} />}
                            </button>
                            <button onClick={toggleMute} disabled={!isPlayerReady} className="text-white hover:text-gray-300 transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded disabled:opacity-50" aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}>
                                {isMuted || volume === 0 ? <FaVolumeMute size={isMobile ? 16 : 18} /> : <FaVolumeUp size={isMobile ? 16 : 18} />}
                            </button>
                            {(!isMuted && !isMobile) && (
                                <input type="range" min={0} max={1} step="any" value={volume} onChange={handleVolumeChange}
                                    disabled={!isPlayerReady}
                                    className="w-14 md:w-20 h-1 bg-gray-600/80 rounded-lg appearance-none cursor-pointer range-thumb-sm-white disabled:opacity-50"
                                    style={{ background: `linear-gradient(to right, white ${volume * 100}%, rgba(107, 114, 128, 0.8) ${volume * 100}%)`}}
                                    aria-label="Volume"
                                />
                            )}
                            <div className="text-gray-300 tabular-nums">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        </div>
                        <div className="flex items-center space-x-1.5 md:space-x-2.5">
                            {subtitleTracks.length > 0 && (
                                <div className="flex items-center space-x-0.5 md:space-x-1">
                                    {subtitleTracks.length > 1 && (
                                        <button onClick={() => { const newIndex = Math.max(currentSubtitleIndex - 1, 0); if (newIndex !== currentSubtitleIndex) {setCurrentSubtitleIndex(newIndex); showSubtitleChangeNotification(`Subtitles: ${subtitleTracks[newIndex]?.label || `Track ${newIndex + 1}`}`);} }}
                                            disabled={currentSubtitleIndex === 0 || !isPlayerReady} className="text-white hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded" aria-label="Previous subtitle version">
                                            <FaChevronLeft size={isMobile ? 12 : 14} />
                                        </button>
                                    )}
                                    <button onClick={toggleSubtitles} disabled={!isPlayerReady} className={`hover:text-gray-300 transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded disabled:opacity-50 ${subtitlesEnabled ? 'text-blue-400 hover:text-blue-300' : 'text-white'}`} title={subtitlesEnabled ? 'Disable subtitles' : 'Enable subtitles'}>
                                        <FaClosedCaptioning size={isMobile ? 16 : 18} />
                                    </button>
                                    {subtitleTracks.length > 1 && (
                                        <button onClick={() => { const newIndex = Math.min(currentSubtitleIndex + 1, subtitleTracks.length - 1); if (newIndex !== currentSubtitleIndex) {setCurrentSubtitleIndex(newIndex); showSubtitleChangeNotification(`Subtitles: ${subtitleTracks[newIndex]?.label || `Track ${newIndex + 1}`}`);} }}
                                            disabled={currentSubtitleIndex === subtitleTracks.length - 1 || !isPlayerReady} className="text-white hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded" aria-label="Next subtitle version">
                                            <FaChevronRight size={isMobile ? 12 : 14} />
                                        </button>
                                    )}
                                </div>
                            )}
                             <select value={selectedQuality}
                                     onChange={(e) => setSelectedQuality(e.target.value)}
                                     disabled={!selectedSeason || availableQualities.length === 0 || !isPlayerReady}
                                     className="bg-gray-700/80 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/80 appearance-none cursor-pointer disabled:opacity-50"
                                     style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', paddingRight: isMobile ? '1.25rem' : '1.5rem' }}
                                     aria-label="Select video quality from controls"
                            >
                                {availableQualities.map(quality => (
                                    <option key={`quality-control-${quality}`} value={quality}>
                                    {quality === 'smooth' ? 'Auto' : `${quality}p`}
                                    </option>
                                ))}
                            </select>
                            {isMobile && isFullscreen && (
                                <button onClick={handleRotate} disabled={!isPlayerReady} className="text-white hover:text-gray-300 transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded disabled:opacity-50" aria-label="Rotate screen">
                                    <FaRotate size={isMobile ? 16 : 18} />
                                </button>
                            )}
                            <button onClick={handleFullscreen} disabled={!isPlayerReady} className="text-white hover:text-gray-300 transition p-1 focus:outline-none focus:ring-1 focus:ring-white/50 rounded disabled:opacity-50" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                                <FaExpand size={isMobile ? 16 : 18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSeriesStreamingComponent;
