"use client";

import Link from "next/link";
import React from "react";
import { GrNext, GrPrevious } from "react-icons/gr";

const CursorPagination = (props) => {
  const { pagination, category, whatFor } = props;
  const { hasMore, nextCursor, prevCursor, itemCount } = pagination;

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const baseButtonStyles = `
    px-4 py-2 rounded-md 
    transition-all duration-300 ease-in-out
    font-medium text-sm
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    flex items-center gap-2
  `;

  const activeButtonStyles = `
    bg-blue-500 text-white
    hover:bg-blue-600
  `;

  const inactiveButtonStyles = `
    bg-gray-200 text-gray-700
    hover:bg-gray-300 hover:text-gray-900
  `;

  const disabledButtonStyles = `
    bg-gray-100 text-gray-400 cursor-not-allowed
    opacity-50
  `;

  const buildUrl = (cursor, direction) => {
    const params = new URLSearchParams();
    params.set(whatFor, category);
    params.set('limit', '30');
    if (cursor) {
      params.set('cursor', cursor);
      params.set('direction', direction);
    }
    
    const suffix = props.anime
      ? "-anime"
      : props.series
      ? "-series"
      : props.kdrama
      ? "-kdrama"
      : props.comics
      ? "-comics"
      : "";
    
    return `/${whatFor}-page${suffix}?${params.toString()}`;
  };

  return (
    <nav className="flex justify-center mt-10" aria-label="Pagination">
      <div className="flex items-center space-x-4">
        {/* Previous Button */}
        {prevCursor ? (
          <Link
            href={buildUrl(prevCursor, 'prev')}
            onClick={handleScrollToTop}
            className={`${baseButtonStyles} ${inactiveButtonStyles}`}
          >
            <GrPrevious className="w-4 h-4" />
            <span>Previous</span>
          </Link>
        ) : (
          <div className={`${baseButtonStyles} ${disabledButtonStyles}`}>
            <GrPrevious className="w-4 h-4" />
            <span>Previous</span>
          </div>
        )}

        {/* Page Info */}
        <div className="px-4 py-2 text-gray-600 font-medium">
          Showing {itemCount} items
        </div>

        {/* Next Button */}
        {hasMore ? (
          <Link
            href={buildUrl(nextCursor, 'next')}
            onClick={handleScrollToTop}
            className={`${baseButtonStyles} ${inactiveButtonStyles}`}
          >
            <span>Next</span>
            <GrNext className="w-4 h-4" />
          </Link>
        ) : (
          <div className={`${baseButtonStyles} ${disabledButtonStyles}`}>
            <span>Next</span>
            <GrNext className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Optional: Add a "Back to First Page" button */}
      {prevCursor && (
        <div className="ml-6">
          <Link
            href={buildUrl(null, 'next')}
            onClick={handleScrollToTop}
            className={`${baseButtonStyles} bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs`}
          >
            Back to Start
          </Link>
        </div>
      )}
    </nav>
  );
};

export default CursorPagination;