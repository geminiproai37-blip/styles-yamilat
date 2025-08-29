import {
  buildHeader,
  buildMainContent,
  buildNavigationBar,
  buildMovieDetailPage,
} from "./dom-builder.js";
import { fetchMediaDetails } from "./script.js";

document.addEventListener("DOMContentLoaded", async () => {
  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
  const backdropBaseUrl = "https://image.tmdb.org/t/p/w780";

  const appRoot = document.getElementById("app-root");
  appRoot.appendChild(buildHeader());
  appRoot.appendChild(buildMainContent());
  appRoot.appendChild(buildNavigationBar());

  const movieDetailSection = document.getElementById("movie-detail-section");

  const path = window.location.pathname;
  const pathParts = path.split("/").filter(Boolean); // Remove empty strings

  let mediaId = null;
  let mediaType = null;
  let seasonNumber = null;
  let episodeNumber = null;

  // Read all media data from local-media-data div as the primary source
  const localMediaDataElement = document.getElementById("local-media-data");
  if (localMediaDataElement) {
    mediaType = localMediaDataElement.dataset.mediaType;
    mediaId = localMediaDataElement.dataset.mediaId;
    if (localMediaDataElement.dataset.seasonNumber) {
      seasonNumber = parseInt(localMediaDataElement.dataset.seasonNumber);
    }
    if (localMediaDataElement.dataset.episodeNumber) {
      episodeNumber = parseInt(localMediaDataElement.dataset.episodeNumber);
    }
  }

  // Only override season and episode with URL parameters if present.
  // mediaType and mediaId are STRICTLY from local-media-data, as per user's request.
  if (pathParts.length >= 2 && pathParts[0] === "go") {
    // Check if season and episode numbers are present in the URL path
    const seasonIndex = pathParts.indexOf("season");
    const episodeIndex = pathParts.indexOf("episode");

    if (seasonIndex !== -1 && pathParts[seasonIndex + 1]) {
      seasonNumber = parseInt(pathParts[seasonIndex + 1]);
    }
    if (episodeIndex !== -1 && pathParts[episodeIndex + 1]) {
      episodeNumber = parseInt(pathParts[episodeIndex + 1]);
    }
  }
  // Read local episodes database from Inicio.html
  const localEpisodesDbScript = document.getElementById("local-episodes-db");
  let localEpisodesDb = {};
  if (localEpisodesDbScript && localEpisodesDbScript.textContent) {
    try {
      localEpisodesDb = JSON.parse(localEpisodesDbScript.textContent);
    } catch (e) {
      console.error("Error parsing local-episodes-db:", e);
    }
  }

  const mediaDetails = await fetchMediaDetails(
    apiBaseUrl,
    mediaType,
    mediaId,
    seasonNumber,
    episodeNumber
  );

  if (mediaDetails) {
    const mediaDetailPageElement = await buildMovieDetailPage(
      apiBaseUrl,
      backdropBaseUrl,
      imageBaseUrl,
      mediaDetails,
      mediaType,
      mediaId,
      seasonNumber,
      episodeNumber,
      localEpisodesDb // Pass the local episodes database
    );
    movieDetailSection.appendChild(mediaDetailPageElement);
  } else {
    movieDetailSection.innerHTML =
      "<p class='text-center text-red-500'>No se pudo cargar la información del contenido.</p>";
  }
});
