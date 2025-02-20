import { useEffect, useRef, useState } from 'react';

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useNativePlayer, setUseNativePlayer] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const initializeVideo = async () => {
      try {
        // For iOS, we'll use the native player instead of MediaSource
        if (isIOS) {
          setUseNativePlayer(true);
          videoRef.current.src = videoUrl;
          
          // Add event listeners for iOS-specific handling
          videoRef.current.addEventListener('loadedmetadata', () => {
            setIsLoading(false);
          });
          
          videoRef.current.addEventListener('error', (e) => {
            console.error('Video error:', e);
            setError('Failed to load video. Please try again.');
          });

          // Enable inline playback for iOS
          videoRef.current.playsInline = true;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('webkit-playsinline', 'true');
          
          // Preload metadata for faster start
          videoRef.current.preload = 'metadata';
          
          return;
        }

        // For non-iOS devices, continue with MediaSource implementation
        const mediaSource = new MediaSource();
        videoRef.current.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener('sourceopen', async () => {
          try {
            const mimeCodec = 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"';
            if (!MediaSource.isTypeSupported(mimeCodec)) {
              // Fallback to native player if codec not supported
              setUseNativePlayer(true);
              videoRef.current.src = videoUrl;
              return;
            }

            const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
            const response = await fetch(videoUrl);
            const data = await response.arrayBuffer();
            sourceBuffer.addEventListener('updateend', () => {
              if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
                mediaSource.endOfStream();
                setIsLoading(false);
              }
            });
            sourceBuffer.appendBuffer(data);
          } catch (error) {
            console.error('Error setting up MediaSource:', error);
            // Fallback to native player
            setUseNativePlayer(true);
            videoRef.current.src = videoUrl;
          }
        });
      } catch (error) {
        console.error('Video initialization error:', error);
        setError('Failed to initialize video player');
      }
    };

    initializeVideo();

    return () => {
      if (videoRef.current) {
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, [videoUrl]);

  return (
    <div className="w-full relative">
      <video 
        ref={videoRef}
        className="w-full aspect-video bg-black"
        controls
        playsInline
        webkit-playsinline="true"
        preload="metadata"
        controlsList="nodownload"
      >
        Your browser does not support the video tag.
      </video>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">Loading video...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white bg-red-500 p-4 rounded">{error}</div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;