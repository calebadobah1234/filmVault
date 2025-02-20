import React, { useEffect, useRef, useState, useCallback } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import {
  FaPlay,
  FaPause,
  FaSpinner,
  FaVolumeMute,
  FaVolumeUp,
  FaExpand,
  FaClosedCaptioning,
  FaChevronLeft,
  FaChevronRight,
 
  FaBackward,
  FaForward
} from 'react-icons/fa';

import { FaRotate } from 'react-icons/fa6';

const VideoPlayer = ({
  streamingUrl,
  processingStatus,
  subtitleTracks,
  qualities,
  onReady,
  errorMessage,
  handleRetry,
  isFullscreen,
  handleFullscreen,
  handleRotate,
  isMobile,
  isAndroid
}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [showSubtitleChangeMessage, setShowSubtitleChangeMessage] = useState(false);
  const [subtitleChangeMessage, setSubtitleChangeMessage] = useState('');
  const [isSubtitleLoading, setIsSubtitleLoading] = useState(false);
  const [videoMetadataLoaded, setVideoMetadataLoaded] = useState(false);
  const [showInitialPlayButton, setShowInitialPlayButton] = useState(true);
  const [showFullscreenTooltip, setShowFullscreenTooltip] = useState(false);
  const [showSubtitleTooltip, setShowSubtitleTooltip] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const playerInitializedRef = useRef(false);

  const hideControls = useCallback(() => {
    if (playing && hasStarted) {
      setShowControls(false);
    }
  }, [playing, hasStarted]);

  const showControlsWithTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      hideControls();
    }, 3000);
  }, [hideControls]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Only initialize player when video element is ready and URL is available
    if (!playerInitializedRef.current && videoRef.current && streamingUrl) {
      const videoElement = videoRef.current;

      // Make sure VideoJS can find the element
      videoElement.className = 'video-js';

      const player = videojs(videoElement, {
        controls: false,
        fluid: true,
        responsive: true,
        html5: {
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            overrideNative: true
          },
        },
        playbackRates: [0.5, 1, 1.5, 2],
      }, () => {
        // Player is ready
        playerRef.current = player;
        playerInitializedRef.current = true;
        onReady && onReady(player);
      });

      // Event listeners
      player.on('play', () => {
        setPlaying(true);
        setHasStarted(true);
        setShowInitialPlayButton(false);
      });

      player.on('pause', () => {
        setPlaying(false);
      });

      player.on('timeupdate', () => {
        if (!seeking) {
          setCurrentTime(player.currentTime());
          setPlayed(player.currentTime() / player.duration());
        }
      });

      player.on('loadedmetadata', () => {
        setDuration(player.duration());
        setVideoMetadataLoaded(true);
      });

      player.on('waiting', () => {
        setIsBuffering(true);
      });

      player.on('canplay', () => {
        setIsBuffering(false);
      });

      // Clean up
      return () => {
        if (player) {
          player.dispose();
          playerRef.current = null;
          playerInitializedRef.current = false;
        }
      };
    }
  }, [streamingUrl, onReady, seeking]);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = videoRef.current;

      const player = videojs(videoElement, {
        controls: false,
        fluid: true,
        responsive: true,
        html5: {
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            overrideNative: true
          },
        },
        playbackRates: [0.5, 1, 1.5, 2],
      });

      player.on('ready', () => {
        playerRef.current = player;
        onReady && onReady(player);
      });

      player.on('play', () => {
        setPlaying(true);
        setHasStarted(true);
        setShowInitialPlayButton(false);
      });

      player.on('pause', () => {
        setPlaying(false);
      });

      player.on('timeupdate', () => {
        if (!seeking) {
          setCurrentTime(player.currentTime());
          setPlayed(player.currentTime() / player.duration());
        }
      });

      player.on('loadedmetadata', () => {
        setDuration(player.duration());
        setVideoMetadataLoaded(true);
      });

      player.on('waiting', () => {
        setIsBuffering(true);
      });

      player.on('canplay', () => {
        setIsBuffering(false);
      });

      player.hlsQualitySelector && player.hlsQualitySelector();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [streamingUrl, onReady, seeking]);

  const handlePlayPause = useCallback(() => {
    if (playerRef.current) {
      if (playing) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  }, [playing]);

  const handleInitialPlay = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.play();
      setHasStarted(true);
      setShowInitialPlayButton(false);
    }
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.volume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      const newMutedState = !isMuted;
      playerRef.current.muted(newMutedState);
      setIsMuted(newMutedState);
    }
  }, [isMuted]);

  const handleSeekMouseDown = useCallback(() => {
    setSeeking(true);
  }, []);

  const handleSeekChange = useCallback((e) => {
    const newTime = parseFloat(e.target.value) * duration;
    setPlayed(parseFloat(e.target.value));
    if (playerRef.current) {
      playerRef.current.currentTime(newTime);
    }
  }, [duration]);

  const handleSeekMouseUp = useCallback(() => {
    setSeeking(false);
  }, []);

  const handleSeekTouchStart = useCallback((e) => {
    setSeeking(true);
    handleSeekChange(e);
  }, [handleSeekChange]);

  const handleSeekTouchMove = useCallback((e) => {
    if (seeking) {
      handleSeekChange(e);
    }
  }, [seeking, handleSeekChange]);

  const handleSeekTouchEnd = useCallback(() => {
    setSeeking(false);
  }, []);

  const handleForward = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.currentTime(playerRef.current.currentTime() + 10);
    }
  }, []);

  const handleBackward = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.currentTime(playerRef.current.currentTime() - 10);
    }
  }, []);

  const toggleSubtitles = useCallback(() => {
    if (playerRef.current) {
      const tracks = playerRef.current.textTracks();
      const newState = !subtitlesEnabled;
      setSubtitlesEnabled(newState);

      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = newState && i === currentSubtitleIndex ? 'showing' : 'hidden';
      }
      playerRef.current.textTracks().dispatchEvent(new Event('change'));
    }
  }, [subtitlesEnabled, currentSubtitleIndex]);

  const showSubtitleChangeNotification = useCallback((message) => {
    setSubtitleChangeMessage(message);
    setShowSubtitleChangeMessage(true);
    setTimeout(() => setShowSubtitleChangeMessage(false), 2000);
  }, []);

  const handleTouchStart = useCallback(() => {
    showControlsWithTimeout();
  }, [showControlsWithTimeout]);

  const handleVideoClick = useCallback((e) => {
    if (e.target.classList.contains('video-wrapper')) {
      handlePlayPause();
    }
    showControlsWithTimeout();
  }, [handlePlayPause, showControlsWithTimeout]);

  const formatTime = useCallback((seconds) => {
    const pad = (n) => n.toString().padStart(2, '0');
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hours > 0
      ? `${hours}:${pad(minutes)}:${pad(secs)}`
      : `${minutes}:${pad(secs)}`;
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-black rounded-xl overflow-hidden shadow-xl relative group"
      onMouseMove={showControlsWithTimeout}
      onMouseLeave={() => !isFullscreen && hideControls()}
      onTouchStart={handleTouchStart}
      onClick={handleVideoClick}
      style={isAndroid ? { paddingBottom: '50px' } : {}}
    >
      <div className={`flex items-center justify-center bg-black ${isFullscreen ? 'h-screen w-screen' : 'aspect-video'}`}>
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

        {processingStatus === 'downloading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <FaSpinner className="animate-spin text-white text-4xl mb-4" />
            <span className="text-white">Processing video...</span>
          </div>
        )}

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

            <div className="video-wrapper w-full h-full relative">
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered w-full h-full"
                playsInline
                crossOrigin="anonymous"
              >
                <source src={streamingUrl} type="application/x-mpegURL" />
                {subtitleTracks.map((track, index) => (
                  <track
                    key={index}
                    kind="subtitles"
                    src={track.src}
                    srcLang={track.srcLang}
                    label={track.label}
                    default={index === 0}
                  />
                ))}
              </video>

              {(!playing || !hasStarted) && (
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer z-10">
                  <button
                    onClick={handlePlayPause}
                    className="group relative"
                    aria-label="Play video"
                  >
                    {!hasStarted && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -scale-110 group-hover:scale-125 rounded-full bg-blue-500 opacity-75 animate-pulse-fast"
                        style={{ padding: 'calc(48px * 0.6)' }}
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
                      {playing ? <FaPause size={32} /> : <FaPlay size={32} />}
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
            </div>
          </>
        )}

        {/* Loading states */}
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

        {/* Error state */}
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

        {/* Fullscreen tooltip */}
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
          {/* Progress bar */}
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

          {/* Control buttons */}
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
              {/* Subtitle controls */}
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

              {/* Quality selector */}
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

              {/* Mobile rotation button */}
              {isMobile && isFullscreen && (
                <button
                  onClick={handleRotate}
                  className="text-white hover:text-gray-300 transition"
                  aria-label="Rotate screen"
                >
                  <FaRotate size={20} />
                </button>
              )}

              {/* Fullscreen button */}
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

export default VideoPlayer;