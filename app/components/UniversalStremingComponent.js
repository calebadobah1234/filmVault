'use client'
import { useEffect, useRef } from 'react';

const IOSVideoPlayer = () => {
  return (
    <div className="w-full">
      <video
        className="w-full aspect-video"
        controls
        playsInline
        webkit-playsinline="true"
        preload="auto"
        src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      >
        <source 
          src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default IOSVideoPlayer;