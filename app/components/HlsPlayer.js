"use client"

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const HlsPlayer = ({ url, playing, volume, muted, onPlay, onPause, onProgress, onDuration, onBuffer, onBufferEnd, onError, onReady, config }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls(config?.hlsOptions || {});
      hlsRef.current = hls;

      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(url);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        onReady();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        onError(data);
      });

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support
      videoRef.current.src = url;
      videoRef.current.addEventListener('loadedmetadata', onReady);
    }
  }, [url]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.play().catch(onError);
    } else {
      videoRef.current.pause();
    }
  }, [playing]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <video
      ref={videoRef}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        backgroundColor: 'black'
      }}
      playsInline
      onPlay={onPlay}
      onPause={onPause}
      onTimeUpdate={(e) => {
        const video = e.target;
        onProgress({
          played: video.currentTime / video.duration,
          playedSeconds: video.currentTime
        });
      }}
      onDurationChange={(e) => onDuration(e.target.duration)}
      onWaiting={onBuffer}
      onPlaying={onBufferEnd}
      onError={(e) => onError(e.target.error)}
    />
  );
};

export default HlsPlayer