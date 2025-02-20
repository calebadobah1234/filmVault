// app/page.js
'use client'
import dynamic from 'next/dynamic';

// Import the CSS for Plyr
import 'plyr/dist/plyr.css';

// Dynamically import the DualVideoPlayer with no SSR
const DualVideoPlayer = dynamic(
  () => import('../components/UniversalStremingComponent'),
  { ssr: false }
);

export default function Page() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold my-4">Video Player Test</h1>
      <DualVideoPlayer 
        videoUrl="https://filmvault3.b-cdn.net/Spider-Man.Into.The.Spider-Verse.2018.BluRay.480p.x264.30NAMACHI.mp4"
      />
    </div>
  );
}