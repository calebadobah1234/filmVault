"use client"

import React from 'react'
import UniversalVideoPlayer from '../components/UniversalStremingComponent'

const page = () => {
  return (
    <div>
      <UniversalVideoPlayer
  sources={[{
    url: 'https://filmvault3.b-cdn.net/Spider-Man.Into.The.Spider-Verse.2018.BluRay.480p.x264.30NAMACHI.mp4',
    type: 'video/mp4',
    subtitleTracks: [] // Add your subtitle tracks here
  }]}
/>
    </div>
  )
}

export default page
