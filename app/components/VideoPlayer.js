// app/video-player/page.tsx
"use client";
// app/video-player/page.tsx

export default function VideoPlayer() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <video
            className="w-full h-auto"
            controls
            poster="/placeholder-image.jpg" // optional poster image
          >
            <source
              src="https://dl12.sermoviedown.pw/Movies/2024/Inside.Out.2/Inside.Out.2.2024.720p.BluRay.x264.AAC-YTS.SoftSub.Sermovie.mkv"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent">
            <h2 className="text-white font-semibold text-lg">
              Sample Video Title
            </h2>
          </div>
        </div>
        <div className="p-4 bg-gray-700">
          <p className="text-gray-300">
            This is a description of the video. Make sure to provide some
            additional details about the video content here.
          </p>
        </div>
      </div>
    </div>
  );
}
