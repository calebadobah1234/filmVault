"use client";
import { useEffect } from 'react';

const ViewCounter = ({ itemId,specifier }) => {
  useEffect(() => {
    const incrementViews = async () => {
      try {
        const response = await fetch(`https://api3.mp3vault.xyz/add-views${specifier}/${itemId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error('Failed to increment views:', response.status);
        }
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    };

    // Only increment views if we have an itemId
    if (itemId) {
      incrementViews();
      console.log(`item incremented true`)
    }
    
  }, [itemId]); // Only run when itemId changes

  // This component doesn't render anything
  return null;
};

export default ViewCounter;