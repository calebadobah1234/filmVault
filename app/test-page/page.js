// app/page.js
'use client'
import dynamic from 'next/dynamic';

// Import required CSS
import 'plyr/dist/plyr.css';
import 'video.js/dist/video-js.css';

// Dynamically import the TripleVideoPlayer with no SSR
const TripleVideoPlayer = dynamic(
  () => import('../components/UniversalStremingComponent'),
  { ssr: false }
);

export default function Page() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold my-4">Video Player Comparison</h1>
      <TripleVideoPlayer 
        videoUrl="https://filmvault3.b-cdn.net/Spider-Man.Into.The.Spider-Verse.2018.BluRay.480p.x264.30NAMACHI.mp4"
      />
      <TripleVideoPlayer 
        videoUrl="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      />
    </div>
  );
}