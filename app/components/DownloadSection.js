"use client";
import React, { useState } from "react";

const DownloadSection = ({ seasons }) => {
  const [openSeason, setOpenSeason] = useState(null);

  const toggleSeason = (seasonNumber) => {
    setOpenSeason(openSeason === seasonNumber ? null : seasonNumber);
  };

  const nonEmptySeasons = seasons.filter((season) =>
    season.resolutions.some((resolution) => resolution.episodes.length > 0)
  );

  const getDisplayText = (episode) => {
    const persianRegex = /[\u0600-\u06FF]/;
    let displayText = "";

    // Function to extract filename from URL
    const getFilenameFromUrl = (url) => {
      const parts = url.split("/");
      const lastPart = parts[parts.length - 1];
      return decodeURIComponent(lastPart).replace(/\.[^/.]+$/, "");
    };

    if (
      persianRegex.test(episode.fileName) ||
      episode.fileName.length < 4 ||
      episode.fileName.endsWith(".>")
    ) {
      // Use the download link for Persian text, short filenames, or truncated filenames
      displayText = getFilenameFromUrl(episode.downloadLink);
    } else {
      // Use the existing logic for other filenames
      let extension = ".mkv";
      let endIndex = episode.fileName.indexOf(extension);
      if (endIndex === -1) {
        // If .mkv is not found, use the whole filename
        displayText = episode.fileName;
      } else {
        displayText = episode.fileName
          .substring(0, endIndex)
          .replace("description", "");
      }
    }

    return displayText.trim() || "Unknown Episode";
  };

  return (
    <div className="mt-12 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Download Links
      </h2>
      {nonEmptySeasons.map((season, seasonIndex) => (
        <div
          key={seasonIndex}
          className="mb-4 border rounded-lg overflow-hidden w-full"
        >
          <button
            className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center"
            onClick={() => toggleSeason(season.seasonNumber)}
          >
            <span className="text-xl font-semibold">
              Season {season.seasonNumber}
            </span>
            <svg
              className={`w-6 h-6 transform transition-transform duration-300 ${
                openSeason === season.seasonNumber ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSeason === season.seasonNumber
                ? "opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4">
              {season.resolutions.map(
                (resolution, resIndex) =>
                  resolution.episodes.length > 0 && (
                    <div key={resIndex} className="mb-4">
                      {resolution.resolution === "Unknown" ? (
                        <></>
                      ) : (
                        <h4 className="text-lg font-medium text-gray-700 mb-2">
                          {resolution.resolution} Resolution
                        </h4>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {resolution.episodes.map((episode, epIndex) => (
                          <a
                            key={epIndex}
                            href={episode.downloadLink}
                            className="flex items-center justify-between p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="truncate mr-2">
                              {getDisplayText(episode)}
                            </span>
                            <svg
                              className="w-4 h-4 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DownloadSection;
