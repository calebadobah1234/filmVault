// Create a separate VideoPlayer.jsx component
import { useEffect, useRef,useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = (props) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const { options, onReady } = props;

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted || !videoRef.current) return;

    const initializePlayer = () => {
      if (!playerRef.current && document.body.contains(videoRef.current)) {
        const player = playerRef.current = videojs(
          videoRef.current,
          {
            ...options,
            html5: {
              vhs: {
                overrideNative: true,
                enableLowInitialPlaylist: true,
                useDevicePixelRatio: true
              }
            }
          },
          () => {
            onReady?.(player);
            // iOS specific configuration
            if (videojs.browser.IS_IOS) {
              player.tech_.setPlaysinline(true);
              player.tech_.overrideNativeAudioTracks(true);
            }
          }
        );
      }
    };

    // Delay initialization to ensure DOM attachment
    const timeoutId = setTimeout(initializePlayer, 50);
    
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
      clearTimeout(timeoutId);
    };
  }, [isMounted, options, onReady]);

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        playsInline
        webkit-playsinline="true"
      />
    </div>
  );
};

export default VideoPlayer;


