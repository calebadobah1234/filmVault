
"use client"

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = ({ 
  src, 
  subtitles = [], 
  onReady, 
  onProgress,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onError,
  onLoadedMetadata 
}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const options = {
      fluid: true,
      responsive: true,
      controls: true,
      controlBar: {
        pictureInPictureToggle: false,
      },
      playbackRates: [0.5, 1, 1.5, 2],
      html5: {
        nativeTextTracks: false,
        hls: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          maxMaxBufferLength: 30,
          maxBufferSize: 60 * 1024 * 1024,
        },
      },
      sources: [{
        src: src,
        type: 'application/x-mpegURL'
      }]
    };

    // Initialize video.js player
    const player = videojs(videoRef.current, options);
    playerRef.current = player;

    // Add subtitles
    subtitles.forEach(track => {
      player.addRemoteTextTrack({
        kind: 'subtitles',
        srclang: track.srcLang,
        label: track.label,
        src: track.src,
        default: track.default
      }, false);
    });

    // Event listeners
    player.on('ready', () => onReady?.(player));
    player.on('timeupdate', () => onTimeUpdate?.(player.currentTime()));
    player.on('play', () => onPlay?.());
    player.on('pause', () => onPause?.());
    player.on('ended', () => onEnded?.());
    player.on('error', () => onError?.());
    player.on('loadedmetadata', () => onLoadedMetadata?.());

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered vjs-theme-city"
        playsInline
        controls={false}
      />
    </div>
  );
};

export default VideoPlayer;
