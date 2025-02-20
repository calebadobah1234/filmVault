"use client"
import { useEffect, useState, useRef } from 'react'
import Hls from 'hls.js'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import ReactPlayer from 'react-player'

const IOSVideoPlayer = ({ src, subtitleTracks }) => {
  const videoRef = useRef(null)
  const playerRef = useRef(null)

  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(videoRef.current)
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src
    }

    // Initialize Plyr
    playerRef.current = new Plyr(videoRef.current, {
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
    })

    return () => {
      if (playerRef.current) playerRef.current.destroy()
    }
  }, [src])

  return (
    <video ref={videoRef} controls crossOrigin="anonymous" playsInline>
      {subtitleTracks.map((track, index) => (
        <track
          key={index}
          kind="subtitles"
          srcLang={track.srcLang}
          src={track.src}
          label={track.label}
          default={index === 0}
        />
      ))}
    </video>
  )
}

const UniversalVideoPlayer = ({ sources, isIOS }) => {
  if (isIOS) {
    return <IOSVideoPlayer src={sources[0].src} subtitleTracks={sources[0].subtitleTracks} />
  }

  return (
    <ReactPlayer 
      url={sources[0].src}
      controls
      playsinline
      config={{
        file: {
          attributes: {
            crossOrigin: 'anonymous',
            playsInline: true,
          }
        }
      }}
    />
  )
}

const EnhancedStreamingComponent = ({ sources }) => {
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const iosDevices = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    setIsIOS(iosDevices || (isSafari && !window.MSStream))
  }, [])

  const formattedSources = sources.map(source => ({
    src: source.url,
    type: source.type || 'video/mp4',
    subtitleTracks: source.subtitleTracks || []
  }))

  return (
    <div className="player-container">
      <UniversalVideoPlayer 
        sources={formattedSources}
        isIOS={isIOS}
      />
    </div>
  )
}

export default EnhancedStreamingComponent