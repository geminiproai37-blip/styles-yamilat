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

  if (pathParts.length >= 2 && pathParts[0] === "go") {
    mediaType = pathParts[1]; // e.g., "movie" or "tv"
    mediaId = pathParts[2];

    if (pathParts[3] === "season" && pathParts[4]) {
      seasonNumber = parseInt(pathParts[4]);
    }
    if (pathParts[5] === "episode" && pathParts[6]) {
      episodeNumber = parseInt(pathParts[6]);
    }
  }

  // Default to a TV show if no specific media is in the URL for demonstration
  if (!mediaId || !mediaType) {
    mediaType = "tv";
    mediaId = 1399; // Game of Thrones
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
