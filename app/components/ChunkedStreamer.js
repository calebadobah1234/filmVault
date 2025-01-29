import React, { useRef, useEffect } from "react";

export class ChunkedStreamer {
  constructor(url, chunkSize = 256 * 1024) { // Reduced chunk size for more frequent updates
    this.url = url;
    this.chunkSize = chunkSize;
    this.downloadedChunks = new Map();
    this.contentLength = null;
    this.contentType = null;
    this.abortController = new AbortController();
    this.retryLimit = 3;
    this.retryDelay = 1000;
  }

  async initialize() {
    for (let attempt = 0; attempt < this.retryLimit; attempt++) {
      try {
        const response = await fetch(this.url, { 
          method: 'HEAD',
          signal: this.abortController.signal 
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        this.contentLength = parseInt(response.headers.get('content-length'));
        this.contentType = response.headers.get('content-type');
        
        if (!this.contentLength) {
          throw new Error('Could not determine content length');
        }
        return this.contentLength;
      } catch (error) {
        if (attempt === this.retryLimit - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }

  async getChunk(start, end, attempt = 0) {
    const headers = { 
      Range: `bytes=${start}-${end}`,
      'Cache-Control': 'no-cache'
    };

    try {
      const response = await fetch(this.url, {
        headers,
        signal: this.abortController.signal
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const chunk = await response.arrayBuffer();
      return new Uint8Array(chunk);
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      if (attempt < this.retryLimit) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.getChunk(start, end, attempt + 1);
      }
      throw error;
    }
  }

  createStream() {
    if (!this.contentLength) throw new Error('Streamer not initialized');

    let currentPosition = 0;
    const prefetchSize = 3 * this.chunkSize; // Reduced prefetch size
    const maxConcurrent = 3; // Reduced concurrent downloads
    const streamer = this;

    return new ReadableStream({
      start(controller) {
        this.controller = controller;
      },

      async pull(controller) {
        try {
          const neededChunks = [];
          let endPosition = currentPosition + prefetchSize;
          endPosition = Math.min(endPosition, streamer.contentLength);

          for (let pos = currentPosition; pos < endPosition; pos += streamer.chunkSize) {
            const chunkEnd = Math.min(pos + streamer.chunkSize - 1, streamer.contentLength - 1);
            if (!streamer.downloadedChunks.has(pos)) {
              neededChunks.push({ start: pos, end: chunkEnd });
            }
          }

          if (neededChunks.length > 0) {
            const batch = neededChunks.slice(0, maxConcurrent);
            const fetchPromises = batch.map(({ start, end }) => 
              streamer.getChunk(start, end)
                .then(chunk => ({ start, chunk }))
            );

            const chunks = await Promise.allSettled(fetchPromises);
            
            for (const result of chunks) {
              if (result.status === 'fulfilled') {
                const { start, chunk } = result.value;
                streamer.downloadedChunks.set(start, chunk);
              }
            }
          }

          if (streamer.downloadedChunks.has(currentPosition)) {
            const chunk = streamer.downloadedChunks.get(currentPosition);
            controller.enqueue(chunk);
            streamer.downloadedChunks.delete(currentPosition);
            currentPosition += chunk.length;

            if (currentPosition >= streamer.contentLength) {
              controller.close();
            }
          }
        } catch (error) {
          controller.error(error);
        }
      },

      cancel() {
        streamer.abortController.abort();
      }
    }, { highWaterMark: 3 }); // Reduced buffer size
  }

  destroy() {
    this.abortController.abort();
    this.downloadedChunks.clear();
  }
}

const VideoPlayer = ({ url }) => {
  const videoRef = useRef(null);
  const streamerRef = useRef(null);
  const mediaSourceRef = useRef(null);

  const getSourceBufferType = (url, contentType) => {
    const ext = url.split('.').pop()?.toLowerCase();
    const mimeType = contentType?.toLowerCase() || '';
    
    const codecMap = {
      'mp4': 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"',
      'webm': 'video/webm; codecs="vp8,vorbis"',
      'mkv': 'video/webm; codecs="vp8,vorbis"'
    };

    return codecMap[ext] || 
           (mimeType.includes('mp4') ? codecMap.mp4 : 
           (mimeType.includes('webm') ? codecMap.webm : codecMap.mp4));
  };

  useEffect(() => {
    let sourceBuffer;
    
    const initializeStream = async () => {
      try {
        const streamer = new ChunkedStreamer(url);
        await streamer.initialize();
        streamerRef.current = streamer;

        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        videoRef.current.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener('sourceopen', async () => {
          try {
            const mimeType = getSourceBufferType(url, streamer.contentType);
            sourceBuffer = mediaSource.addSourceBuffer(mimeType);

            const stream = streamer.createStream();
            const reader = stream.getReader();

            const processChunk = async () => {
              try {
                const { done, value } = await reader.read();
                if (done) {
                  mediaSource.endOfStream();
                  return;
                }

                if (sourceBuffer.buffered.length > 0) {
                  const buffered = sourceBuffer.buffered.end(0) - sourceBuffer.buffered.start(0);
                  if (buffered > 15) { // Reduced buffer threshold
                    await new Promise(resolve => setTimeout(resolve, 500));
                    processChunk();
                    return;
                  }
                }

                if (!sourceBuffer.updating) {
                  sourceBuffer.appendBuffer(value);
                  sourceBuffer.addEventListener('updateend', () => {
                    processChunk();
                  }, { once: true });
                } else {
                  sourceBuffer.addEventListener('updateend', () => {
                    sourceBuffer.appendBuffer(value);
                    processChunk();
                  }, { once: true });
                }
              } catch (error) {
                console.error('Chunk processing error:', error);
                mediaSource.endOfStream('error');
              }
            };

            processChunk();
          } catch (error) {
            console.error('Source buffer error:', error);
            mediaSource.endOfStream('error');
          }
        });
      } catch (error) {
        console.error('Stream initialization error:', error);
      }
    };

    initializeStream();

    return () => {
      if (streamerRef.current) {
        streamerRef.current.destroy();
      }
      if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
        mediaSourceRef.current.endOfStream();
      }
    };
  }, [url]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        onError={(e) => console.error('Video error:', e)}
      />
    </div>
  );
};

export default VideoPlayer;