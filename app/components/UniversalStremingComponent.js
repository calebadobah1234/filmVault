'use client'
import { useEffect, useState, useRef } from 'react';

const DualVideoPlayer = ({ videoUrl }) => {
  const hlsVideoRef = useRef(null);
  const plyrVideoRef = useRef(null);
  const [hlsPlayer, setHlsPlayer] = useState(null);
  const [plyrPlayer, setPlyrPlayer] = useState(null);

  useEffect(() => {
    let hls;
    let plyr;

    const initializePlayers = async () => {
      // Dynamically import Hls.js and Plyr
      const [{ default: Hls }, { default: Plyr }] = await Promise.all([
        import('hls.js'),
        import('plyr')
      ]);

      // Initialize HLS player
      if (Hls.isSupported()) {
        hls = new Hls({
          debug: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(hlsVideoRef.current);
        
        // Handle HLS events
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          hlsVideoRef.current.play().catch(error => {
            console.log('Playback was prevented:', error);
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.log('Fatal error, destroying HLS instance:', data);
                hls.destroy();
                break;
            }
          }
        });

        setHlsPlayer(hls);
      } else if (hlsVideoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        // For Safari on iOS, use native HLS support
        hlsVideoRef.current.src = videoUrl;
      } else {
        // Fallback for non-HLS support
        hlsVideoRef.current.src = videoUrl;
      }

      // Initialize Plyr with source
      plyr = new Plyr(plyrVideoRef.current, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'captions',
          'settings',
          'fullscreen'
        ],
        sources: [{
          src: videoUrl,
          type: 'video/mp4'
        }]
      });
      setPlyrPlayer(plyr);
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializePlayers();
    }

    // Cleanup
    return () => {
      if (hls) {
        hls.destroy();
      }
      if (plyr) {
        plyr.destroy();
      }
    };
  }, [videoUrl]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div className="w-full">
        <h2 className="text-xl font-bold mb-2">HLS.js Player</h2>
        <video
          ref={hlsVideoRef}
          controls
          className="w-full aspect-video"
          playsInline
        />
      </div>
      
      <div className="w-full">
        <h2 className="text-xl font-bold mb-2">Plyr Player</h2>
        <video
          ref={plyrVideoRef}
          className="plyr-react plyr w-full aspect-video"
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default DualVideoPlayer;