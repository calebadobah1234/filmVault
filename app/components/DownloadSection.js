"use client"
import React, { useState } from "react";

// Domain to CDN mapping function
const replaceDomainWithCDN = (url) => {
  if (!url) return url;
  
  // Map of domains to their CDN equivalents
  const domainMappings = {
    "http://ds10.30namachi.com": "https://namachi10.b-cdn.net",
    "http://ds11.30namachi.com": "https://namachi11.b-cdn.net",
    "http://ds12.30namachi.com": "https://namachi12.b-cdn.net",
    "http://ds14.30namachi.com": "https://namachi14.b-cdn.net",
    "http://ds15.30namachi.com": "https://namachi15.b-cdn.net",
    "http://ds16.30namachi.com": "https://namachi16.b-cdn.net",
    "http://ds17.30namachi.com": "https://namachi17.b-cdn.net",
    "http://ds3.30namachi.co": "https://namachi3.b-cdn.net",
    "http://dl4.30namcahi.com": "https://namachi4.b-cdn.net",
    "http://ds5.30namachi.com": "https://namachi5.b-cdn.net",
    "http://ds7.30namachi.com": "https://namachi7.b-cdn.net",
    "http://d10.30namachi.com": "https://namachid10.b-cdn.net",
    "https://dl11.sermoviedown.pw": "https://sermovie11.b-cdn.net",
    "https://dl12.sermoviedown.pw": "https://sermovie12.b-cdn.net",
    "https://dl3.sermoviedown.pw": "https://sermovie3.b-cdn.net",
    "https://dl4.sermoviedown.pw": "https://sermovie4.b-cdn.net",
    "https://dl5.sermoviedown.pw": "https://sermovie5.b-cdn.net",
    "https://dl2.sermoviedown.pw": "https://servmovie2.b-cdn.net",
    "http://dl.vinadl.xyz": "https://vinadl1.b-cdn.net",
    "http://dl2.vinadl.xyz": "https://vinadl2.b-cdn.net",
    "http://dl3.vinadl.xyz": "https://vinadl3.b-cdn.net",
    "http://dl8.vinadl.xyz": "https://vinadl8.b-cdn.net",
    "http://dl9.vinadl.xyz": "https://vinadl9.b-cdn.net",
    "https://dl1.dl-bcmovie1.xyz": "https://bcmovie1.b-cdn.net",
    "https://dl.vinadl.xyz":"https://vinadl0.b-cdn.net"
  };

  // Check each domain pattern and replace if found
  for (const [oldDomain, newDomain] of Object.entries(domainMappings)) {
    if (url.startsWith(oldDomain)) {
      return url.replace(oldDomain, newDomain);
    }
  }

  return url;
};

const DownloadSection = ({ seasons, seasons2 }) => {
  const [openSeasons, setOpenSeasons] = useState({ server1: null, server2: null });

  const toggleSeason = (server, seasonNumber) => {
    setOpenSeasons(prev => ({
      ...prev,
      [server]: prev[server] === seasonNumber ? null : seasonNumber
    }));
  };

  const getDisplayText = (episode) => {
    const persianRegex = /[\u0600-\u06FF]/;
    let displayText = "";

    const getFilenameFromUrl = (url) => {
      const parts = url.split("/");
      const lastPart = parts[parts.length - 1];
      return decodeURIComponent(lastPart).replace(/\.[^/.]+$/, "");
    };

    if (
      persianRegex.test(episode.fileName) ||
      episode.fileName?.length < 4 ||
      episode.fileName?.endsWith(".>")
    ) {
      displayText = getFilenameFromUrl(episode.downloadLink || episode.link);
    } else {
      let extension = ".mkv";
      let endIndex = episode.fileName ? episode.fileName.indexOf(extension) : -1;
      if (endIndex === -1) {
        displayText = episode.fileName || getFilenameFromUrl(episode.downloadLink || episode.link);
      } else {
        displayText = episode.fileName
          .substring(0, endIndex)
          .replace("description", "");
      }
    }

    return displayText.trim() || "Unknown Episode";
  };

  // Process the seasons data to replace download links with CDN links
  const processSeasons = (seasonsArray) => {
    if (!seasonsArray) return [];
    
    return seasonsArray.map(season => {
      // Deep copy to avoid mutating props
      const processedSeason = {...season};
      
      // Handle the structure with episodes that have downloadLinks
      if (season.episodes && season.episodes[0]?.downloadLinks) {
        processedSeason.episodes = season.episodes.map(episode => {
          const processedEpisode = {...episode};
          if (episode.downloadLinks) {
            processedEpisode.downloadLinks = episode.downloadLinks.map(link => ({
              ...link,
              downloadLink: replaceDomainWithCDN(link.downloadLink)
            }));
          }
          return processedEpisode;
        });
      }
      
      // Handle the structure with resolutions that have episodes
      if (season.resolutions) {
        processedSeason.resolutions = season.resolutions.map(resolution => {
          const processedResolution = {...resolution};
          if (resolution.episodes) {
            processedResolution.episodes = resolution.episodes.map(episode => ({
              ...episode,
              downloadLink: replaceDomainWithCDN(episode.downloadLink),
              link: episode.link ? replaceDomainWithCDN(episode.link) : episode.link
            }));
          }
          return processedResolution;
        });
      }
      
      return processedSeason;
    });
  };

  // Process both server seasons
  const processedSeasons = processSeasons(seasons);
  const processedSeasons2 = processSeasons(seasons2);

  const normalizeSeasons = (seasonsArray) => {
    return seasonsArray.map(season => {
      if (season.episodes && season.episodes[0]?.downloadLinks) {
        const qualityGroups = {};
        season.episodes.forEach(episode => {
          episode.downloadLinks.forEach(link => {
            const quality = link.quality.replace('دانلود ', '');
            if (!qualityGroups[quality]) {
              qualityGroups[quality] = [];
            }
            qualityGroups[quality].push({
              fileName: episode.episodeInfo,
              downloadLink: link.downloadLink,
              size: link.size
            });
          });
        });

        return {
          seasonNumber: season.seasonNumber,
          resolutions: Object.entries(qualityGroups).map(([quality, episodes]) => ({
            resolution: quality,
            episodes
          }))
        };
      }
      if (season.resolutions) {
        return season;
      }
      return season;
    });
  };

  const renderSeasonList = (serverSeasons, serverName, serverTitle) => {
    const normalizedSeasons = normalizeSeasons(serverSeasons || []);
    const nonEmptySeasons = normalizedSeasons.filter((season) =>
      season.resolutions.some((resolution) => {
        const filteredEpisodes = resolution.episodes.filter(
          (episode) => !getDisplayText(episode).toLowerCase().includes("duble")
        );
        return filteredEpisodes.length > 0;
      })
    );

    return nonEmptySeasons.length > 0 ? (
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{serverTitle}</h3>
        {nonEmptySeasons.map((season, seasonIndex) => (
          <div
            key={seasonIndex}
            className="mb-4 border rounded-lg overflow-hidden w-full"
          >
            <button
              className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center"
              onClick={() => toggleSeason(serverName, season.seasonNumber)}
            >
              <span className="text-xl font-semibold">
                Season {season.seasonNumber}
              </span>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  openSeasons[serverName] === season.seasonNumber ? "rotate-180" : ""
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
                openSeasons[serverName] === season.seasonNumber
                  ? "opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-4">
                {season.resolutions.map((resolution, resIndex) => {
                  const filteredEpisodes = resolution.episodes.filter(
                    (episode) =>
                      !getDisplayText(episode).toLowerCase().includes("duble")
                  );

                  return filteredEpisodes.length > 0 ? (
                    <div key={resIndex} className="mb-4">
                      {resolution.resolution === "Unknown" ? (
                        <></>
                      ) : (
                        <h4 className="text-lg font-medium text-gray-700 mb-2">
                          {resolution.resolution} Resolution
                        </h4>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredEpisodes.map((episode, epIndex) => (
                          <a
                            key={epIndex}
                            href={episode.downloadLink}
                            className="flex items-center justify-between p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                            target="_blank"
                            rel="noopener noreferrer"
                            download // Added download attribute for DirectLinkScript compatibility
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
                  ) : null;
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : null;
  };

  return (
    <div className="mt-12 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Download Links
      </h2>
      {renderSeasonList(processedSeasons, 'server1', 'Server 1')}
      {renderSeasonList(processedSeasons2, 'server2', 'Server 2')}
    </div>
  );
};

export default DownloadSection;