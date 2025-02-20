'use client'
import { useEffect, useState, useRef } from 'react';

const TripleVideoPlayer = ({ videoUrl }) => {
  const plyrVideoRef = useRef(null);
  const videojsRef = useRef(null);
  const [plyrPlayer, setPlyrPlayer] = useState(null);
  const [videojsPlayer, setVideojsPlayer] = useState(null);

  useEffect(() => {
    let plyr;
    let videojs;

    const initializePlayers = async () => {
      try {
        // Initialize Plyr
        const { default: Plyr } = await import('plyr');
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
        });
        setPlyrPlayer(plyr);

        // Initialize Video.js
        const videojsModule = await import('video.js');
        const videojs = videojsModule.default;

        const player = videojs(videojsRef.current, {
          controls: true,
          fluid: true,
          html5: {
            hls: {
              enableLowInitialPlaylist: true,
              smoothQualityChange: true,
              overrideNative: !videojs.browser.IS_SAFARI
            },
            nativeVideoTracks: true,
            nativeAudioTracks: true,
            nativeTextTracks: true
          },
          sources: [{
            src: videoUrl,
            type: videoUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
          }]
        });

        setVideojsPlayer(player);

        // Important for iOS touch events
        player.on('touchend', function() {
          if (player.paused()) {
            player.play();
          } else {
            player.pause();
          }
        });

      } catch (error) {
        console.error('Error initializing players:', error);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializePlayers();
    }

    // Cleanup
    return () => {
      if (plyr) {
        plyr.destroy();
      }
      if (videojs) {
        videojs.dispose();
      }
    };
  }, [videoUrl]);

  return (
    <div className="grid grid-cols-1 gap-8 p-4">
      <div className="w-full">
        <h2 className="text-xl font-bold mb-2">Plyr Player</h2>
        <video
          ref={plyrVideoRef}
          className="plyr-react plyr w-full aspect-video"
          playsInline
          webkit-playsinline="true"
          controls
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>

      <div className="w-full">
        <h2 className="text-xl font-bold mb-2">Video.js Player</h2>
        <div data-vjs-player>
          <video
            ref={videojsRef}
            className="video-js vjs-big-play-centered w-full aspect-video"
            playsInline
            webkit-playsinline="true"
            controls
          />
        </div>
      </div>

      <div className="w-full">
        <h2 className="text-xl font-bold mb-2">Native HTML5 Player</h2>
        <video
          className="w-full aspect-video"
          controls
          playsInline
          webkit-playsinline="true"
          preload="auto"
          src={videoUrl}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default TripleVideoPlayer;