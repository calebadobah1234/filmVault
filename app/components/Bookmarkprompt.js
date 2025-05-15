"use client"
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const BookmarkPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [shortcut, setShortcut] = useState(''); // State for the shortcut

  useEffect(() => {
    // Check if user has seen the prompt before
    const hasSeenPrompt = localStorage.getItem('bookmarkPromptSeen');
    
    // Determine the shortcut only on the client-side
    if (typeof navigator !== 'undefined') {
      const isMacPlatform = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      setShortcut(isMacPlatform ? '⌘+D' : 'Ctrl+D');
    } else {
      // Default shortcut or handle server-side (though it won't be shown)
      setShortcut('Ctrl+D'); 
    }

    // Show prompt after 30 seconds if user hasn't seen it before
    if (!hasSeenPrompt) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array means this runs once on mount

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('bookmarkPromptSeen', 'true');
  };

  if (!showPrompt || !shortcut) return null; // Don't render if not showing or shortcut not set

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-gray-900 text-white p-4 rounded-lg shadow-lg border border-gray-700 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold mb-2">📌 Quick Access to FilmVault.XYZ</h3>
          <p className="text-sm text-gray-300 mb-3">
            Press {shortcut} to bookmark FilmVault.xyz for instant access to your favorite movies and shows!
          </p>
          <button
            onClick={dismissPrompt}
            className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
          >
            Got it!
          </button>
        </div>
        <button
          onClick={dismissPrompt}
          className="ml-4 text-gray-400 hover:text-gray-200 transition-colors duration-200"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default BookmarkPrompt;