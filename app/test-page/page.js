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
        videoUrl="https://filmvault3.b-cdn.net/The_Vampire_Diaries_S08E13_-_The_Lies_Will_Catch_Up_With_You_(Awafim.tv).mp4"
      />
     
    </div>
  );
}