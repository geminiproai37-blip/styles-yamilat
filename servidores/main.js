import {
  buildHeader,
  buildMainContent,
  buildMovieDetailPage,
} from "./dom-builder.js";
import { fetchMediaDetails } from "./script.js";
import { openInWebVideoCaster } from "./web-video-caster.js"; // Reverted import
import { showExternalPlayerModal } from "./external-player-intents.js";

document.addEventListener("DOMContentLoaded", async () => {
  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
  const backdropBaseUrl = "https://image.tmdb.org/t/p/w780";

  const appRoot = document.getElementById("app-root");
  appRoot.appendChild(buildHeader());
  appRoot.appendChild(buildMainContent());

  const movieDetailSection = document.getElementById("movie-detail-section");

  // Get media data from local-media-data div
  const localMediaDataElement = document.getElementById("local-media-data");
  const mediaType = localMediaDataElement.dataset.mediaType;
  const mediaId = localMediaDataElement.dataset.seriesId; // Changed to seriesId
  const seasonNumber = localMediaDataElement.dataset.seasonNumber
    ? parseInt(localMediaDataElement.dataset.seasonNumber)
    : null;
  const episodeNumber = localMediaDataElement.dataset.episodeNumber
    ? parseInt(localMediaDataElement.dataset.episodeNumber)
    : null;
  const allEpisodesUrl = localMediaDataElement.dataset.allEpisodesUrl;
  const nextEpisodeUrl = localMediaDataElement.dataset.nextEpisodeUrl;

  // Get server data from local-servers-db script tag
  const localServersDbScript = document.getElementById("local-servers-db");
  let localServersDb = {};
  if (localServersDbScript && localServersDbScript.textContent) {
    try {
      localServersDb = JSON.parse(localServersDbScript.textContent);
    } catch (e) {
      console.error("Error parsing local-servers-db:", e);
    }
  }

  // Fetch actual media details using the extracted data
  const mediaDetails = await fetchMediaDetails(
    apiBaseUrl,
    mediaType,
    mediaId,
    seasonNumber,
    episodeNumber
  );

  if (!mediaDetails) {
    console.error("Failed to fetch media details. Cannot build page.");
    return;
  }

  const mediaDetailPageElement = await buildMovieDetailPage(
    apiBaseUrl,
    backdropBaseUrl,
    imageBaseUrl,
    mediaDetails,
    mediaType,
    mediaId,
    seasonNumber,
    episodeNumber,
    {}, // Empty localEpisodesDb for now
    allEpisodesUrl, // New parameter
    nextEpisodeUrl, // New parameter
    localServersDb, // Pass localServersDb
    openInWebVideoCaster, // Pass the reverted function
    showExternalPlayerModal // Pass the function
  );
  movieDetailSection.appendChild(mediaDetailPageElement);
});
