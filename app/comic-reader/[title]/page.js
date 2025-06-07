"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ImageWithFallback from "@/app/components/ImageWithFallback";
import ViewCounter from "@/app/components/ViewCounter";
import CommentSection from "@/app/components/CommentSection";
import ClientOnly from '@/app/components/ClientOnly';
import DirectLinkScript from "@/app/components/DirectLinkScript";

const ComicReader = ({ params }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [comicData, setComicData] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState("scroll"); // single, double, scroll
  const [showControls, setShowControls] = useState(true);
  const [preloadedImages, setPreloadedImages] = useState(new Set());
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const pageRefs = useRef([]);

  // Set default zoom based on screen size
  useEffect(() => {
    const setInitialZoom = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint and above
        setZoomLevel(1);
      } else {
        setZoomLevel(1);
      }
    };

    setInitialZoom();
    
    const handleResize = () => {
      setInitialZoom();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchComicData = async () => {
      try {
        const res = await fetch(`https://api3.mp3vault.xyz/get-comic-details/${params.title}`);
        const data = await res.json();
        setComicData(data[0]);
        
        const chapterParam = searchParams?.get('chapter');
        if (chapterParam) {
          setCurrentChapter(parseInt(chapterParam));
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching comic data:", error);
        setLoading(false);
      }
    };

    fetchComicData();
  }, [params.title, searchParams]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle keyboard events if comic data is loaded
      if (!comicData) return;
      
      if (e.key === "ArrowLeft") {
        prevPage();
      } else if (e.key === "ArrowRight") {
        nextPage();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "c" || e.key === "C") {
        setShowControls(!showControls);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, currentChapter, showControls, comicData]);

  const getCurrentChapterData = () => {
    if (!comicData?.chapters) return null;
    return comicData.chapters.find(ch => ch.chapterNumber === currentChapter) || comicData.chapters[0];
  };

  const getCurrentImages = () => {
    const chapter = getCurrentChapterData();
    return chapter?.images || [];
  };

  // Preload images function
  const preloadImages = (startIndex, images) => {
    const imagesToPreload = images.slice(startIndex, startIndex + 4);
    
    imagesToPreload.forEach((image, index) => {
      const actualIndex = startIndex + index;
      const imageUrl = image.r2_url || image.original_src;
      
      if (!preloadedImages.has(imageUrl)) {
        const img = new Image();
        img.onload = () => {
          setPreloadedImages(prev => new Set(prev).add(imageUrl));
        };
        img.onerror = () => {
          console.error(`Failed to preload image at index ${actualIndex}`);
        };
        img.src = imageUrl;
      }
    });
  };

  // Effect to preload images when current page or chapter changes
  useEffect(() => {
    if (comicData && viewMode === "single") {
      const images = getCurrentImages();
      preloadImages(currentPage, images);
    }
  }, [currentPage, currentChapter, comicData, viewMode]);

  // Function to scroll to a specific page in scroll mode
  const scrollToPage = (pageIndex) => {
    if (viewMode === "scroll" && scrollContainerRef.current && pageRefs.current[pageIndex]) {
      const container = scrollContainerRef.current;
      const targetElement = pageRefs.current[pageIndex];
      
      // Calculate the position to scroll to (with some offset for better visibility)
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const scrollTop = container.scrollTop + targetRect.top - containerRect.top - 20; // 20px offset
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  };

  const nextPage = () => {
    if (!comicData) return;
    
    const images = getCurrentImages();
    if (currentPage < images.length - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      if (viewMode === "scroll") {
        scrollToPage(newPage);
      }
    } else {
      nextChapter();
    }
  };

  const prevPage = () => {
    if (!comicData) return;
    
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      if (viewMode === "scroll") {
        scrollToPage(newPage);
      }
    } else {
      prevChapter();
    }
  };

  const nextChapter = () => {
    if (!comicData || currentChapter >= comicData.totalChapters) return;
    
    setCurrentChapter(currentChapter + 1);
    setCurrentPage(0);
    setPreloadedImages(new Set()); // Clear preloaded images for new chapter
    router.push(`/comic-reader/${params.title}?chapter=${currentChapter + 1}`, { scroll: false });
  };

  const prevChapter = () => {
    if (!comicData || currentChapter <= 1) return;
    
    setCurrentChapter(currentChapter - 1);
    setCurrentPage(0);
    setPreloadedImages(new Set()); // Clear preloaded images for new chapter
    router.push(`/comic-reader/${params.title}?chapter=${currentChapter - 1}`, { scroll: false });
  };

  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
    if (viewMode === "scroll") {
      // Use setTimeout to ensure the state update has been processed
      setTimeout(() => scrollToPage(pageNum), 100);
    }
  };

  const goToChapter = (chapterNum) => {
    setCurrentChapter(chapterNum);
    setCurrentPage(0);
    setPreloadedImages(new Set()); // Clear preloaded images for new chapter
    router.push(`/comic-reader/${params.title}?chapter=${chapterNum}`, { scroll: false });
  };

  const zoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.25, 0.5));
  };

  const resetZoom = () => {
    if (window.innerWidth >= 1024) {
      setZoomLevel(1); // Reset to 150% on large screens
    } else {
      setZoomLevel(1); // Reset to 100% on smaller screens
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="text-white text-xl">Loading comic...</div>
      </div>
    );
  }

  if (!comicData) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="text-white text-xl">Comic not found</div>
      </div>
    );
  }

  const currentImages = getCurrentImages();
  const currentImage = currentImages[currentPage];

  return (
    <>
      <ViewCounter itemId={comicData._id} specifier="Comic-Reader" />
      
      <div ref={containerRef} className="fixed inset-0 bg-gray-900 text-white z-[9999]">
        {/* Floating Controls Toggle Button - Only visible when controls are hidden */}
        {!showControls && (
          <button
            onClick={() => setShowControls(true)}
            className="fixed top-4 right-4 bg-black bg-opacity-75 hover:bg-opacity-90 text-white p-3 rounded-full z-[60] transition-all duration-200 shadow-lg"
            title="Show Controls (C)"
          >
            {/* Eye (show) */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}

        {/* Header Controls */}
        <div className={`absolute top-0 left-0 right-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="px-2 sm:px-4 py-2">
            {/* Mobile Layout */}
            <div className="block md:hidden">
              {/* Top Row - Back button and Title */}
              <div className="flex items-center justify-between mb-2">
                <Link
                  href={`/comics1/${params.title}`}
                  className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                >
                  ← Back
                </Link>
                <h1 className="text-sm font-semibold truncate flex-1 mx-2 text-center">
                  {comicData.title}
                </h1>
                <button
                  onClick={toggleFullscreen}
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs"
                >
                  ⛶
                </button>
              </div>
              
              {/* Bottom Row - Controls */}
              <div className="flex items-center justify-between space-x-1">
                <select
                  value={currentChapter}
                  onChange={(e) => goToChapter(parseInt(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded px-1 py-1 text-xs flex-1 min-w-0"
                >
                  {Array.from({ length: comicData.totalChapters }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Ch {i + 1}
                    </option>
                  ))}
                </select>
                
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-1 py-1 text-xs flex-1 min-w-0"
                >
                  <option value="single">Single</option>
                  <option value="scroll">Scroll</option>
                </select>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={zoomOut}
                    className="bg-gray-700 hover:bg-gray-600 px-1 py-1 rounded text-xs"
                  >
                    −
                  </button>
                  <span className="text-xs w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={zoomIn}
                    className="bg-gray-700 hover:bg-gray-600 px-1 py-1 rounded text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/comics1/${params.title}`}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  ← Back to Comic
                </Link>
                <h1 className="text-lg font-semibold truncate max-w-xs">
                  {comicData.title}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={currentChapter}
                  onChange={(e) => goToChapter(parseInt(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
                >
                  {Array.from({ length: comicData.totalChapters }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Chapter {i + 1}
                    </option>
                  ))}
                </select>
                
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
                >
                  <option value="single">Single Page</option>
                  <option value="double">Double Page</option>
                  <option value="scroll">Scroll View</option>
                </select>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={zoomOut}
                    className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
                  >
                    −
                  </button>
                  <span className="text-sm w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={zoomIn}
                    className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
                  >
                    +
                  </button>
                  <button
                    onClick={resetZoom}
                    className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
                  >
                    Reset
                  </button>
                </div>
                
                <button
                  onClick={toggleFullscreen}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
                >
                  ⛶
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Adjusted for responsive header */}
        <div className="absolute top-14 md:top-16 left-0 right-0 bottom-12 md:bottom-16">
          {viewMode === "scroll" ? (
            <div ref={scrollContainerRef} className="h-full overflow-y-auto px-4">
              <div className="space-y-4 py-4">
                {currentImages.map((image, index) => (
                  <div 
                    key={index} 
                    ref={el => pageRefs.current[index] = el}
                    className="flex justify-center"
                  >
                    <ImageWithFallback
                      src={image.r2_url || image.original_src}
                      alt={`Page ${index + 1}`}
                      width={800}
                      height={1200}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full px-0 md:px-4 overflow-auto" style={{ paddingTop: '2rem' }}>
              <div className="relative min-h-full">
                {/* Navigation Arrows */}
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0 && currentChapter === 1}
                  className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full z-10 disabled:opacity-30"
                >
                  ←
                </button>
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === currentImages.length - 1 && currentChapter === comicData.totalChapters}
                  className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full z-10 disabled:opacity-30"
                >
                  →
                </button>

                {/* Image Display Container with proper transform origin */}
                <div 
                  className="relative flex items-center justify-center"
                  style={{ 
                    transform: `scale(${zoomLevel})`, 
                    transformOrigin: 'top center',
                    minHeight: 'calc(100vh - 12rem)', // Account for header, footer, and padding
                    paddingBottom: '2rem'
                  }}
                >
                  {viewMode === "double" && currentPage < currentImages.length - 1 ? (
                    <div className="flex space-x-2 w-full h-full items-center justify-center">
                      <ImageWithFallback
                        src={currentImage?.r2_url || currentImage?.original_src}
                        alt={`Page ${currentPage + 1}`}
                        width={400}
                        height={600}
                        className="max-w-full h-auto object-contain rounded-lg shadow-lg"
                        onLoad={() => setImageLoading(false)}
                      />
                      <ImageWithFallback
                        src={currentImages[currentPage + 1]?.r2_url || currentImages[currentPage + 1]?.original_src}
                        alt={`Page ${currentPage + 2}`}
                        width={400}
                        height={600}
                        className="max-w-full h-auto object-contain rounded-lg shadow-lg"
                      />
                    </div>
                  ) : (
                    <ImageWithFallback
                      ref={imageRef}
                      src={currentImage?.r2_url || currentImage?.original_src}
                      alt={`Page ${currentPage + 1}`}
                      width={800}
                      height={1200}
                      className="w-full max-w-4xl h-auto object-contain rounded-lg shadow-lg"
                      onLoad={() => setImageLoading(false)}
                      onLoadStart={() => {
                        const imageUrl = currentImage?.r2_url || currentImage?.original_src;
                        if (!preloadedImages.has(imageUrl)) {
                          setImageLoading(true);
                        }
                      }}
                    />
                  )}
                </div>

                {/* Loading Overlay */}
                {imageLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-lg">Loading...</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="px-2 sm:px-4 py-2">
            {/* Mobile Layout */}
            <div className="block md:hidden">
              {/* Top Row - Chapter/Page Info */}
              <div className="flex items-center justify-between mb-2 text-xs">
                <span>Ch {currentChapter}/{comicData.totalChapters}</span>
                <span>Page {currentPage + 1}/{currentImages.length}</span>
                <button
                  onClick={() => setShowControls(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs"
                >
                  Hide
                </button>
              </div>
              
              {/* Bottom Row - Navigation */}
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={prevChapter}
                  disabled={currentChapter === 1}
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs disabled:opacity-50"
                >
                  ← Ch
                </button>
                
                <input
                  type="range"
                  min="0"
                  max={currentImages.length - 1}
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                
                <button
                  onClick={nextChapter}
                  disabled={currentChapter === comicData.totalChapters}
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs disabled:opacity-50"
                >
                  Ch →
                </button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  Chapter {currentChapter} / {comicData.totalChapters}
                </span>
                <span className="text-sm">
                  Page {currentPage + 1} / {currentImages.length}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevChapter}
                  disabled={currentChapter === 1}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  Prev Chapter
                </button>
                
                <input
                  type="range"
                  min="0"
                  max={currentImages.length - 1}
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value))}
                  className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                
                <button
                  onClick={nextChapter}
                  disabled={currentChapter === comicData.totalChapters}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  Next Chapter
                </button>
              </div>
              
              <button
                onClick={() => setShowControls(false)}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
              >
                Hide Controls
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Info - Hidden on small devices */}
        <div className="hidden md:block absolute top-20 right-4 bg-black bg-opacity-75 rounded-lg p-3 text-xs z-40 opacity-50 hover:opacity-100 transition-opacity">
          <div className="text-gray-300">
            <div>← → Navigate</div>
            <div>F Fullscreen</div>
            <div>C Toggle Controls</div>
          </div>
        </div>
      </div>

      {/* Comments Section - Hidden when reader is active */}
      <div className="hidden">
        <CommentSection itemId={comicData._id} linkIdentifier="Comic-Reader" />
      </div>

      <ClientOnly>
        <DirectLinkScript directLinkUrl="https://attendedlickhorizontally.com/jth75j6j5?key=1cc239cea6ecf5e6b20d0a992ab044c4" />
      </ClientOnly>
    </>
  );
};

export default ComicReader;