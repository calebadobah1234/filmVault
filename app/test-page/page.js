// page.js
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the video player with no SSR
const UniversalVideoPlayer = dynamic(
  () => import('../components/UniversalStremingComponent'),
  { ssr: false }
);

const Page = () => {
  return (
    <div>
      <UniversalVideoPlayer
        sources={[{
          url: 'https://filmvault3.b-cdn.net/Spider-Man.Into.The.Spider-Verse.2018.BluRay.480p.x264.30NAMACHI.mp4',
          type: 'video/mp4',
          subtitleTracks: []
        }]}
      />
    </div>
  );
};

export default Page;