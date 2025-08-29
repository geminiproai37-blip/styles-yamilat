import {
  buildHeader,
  buildMainContent,
  buildNavigationBar,
  buildMovieDetailPage,
  buildFavoritesPage,
} from "./dom-builder.js";
import { fetchMediaDetails } from "./script.js";

const apiBaseUrl = "https://api.themoviedb.org/3";
const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
const backdropBaseUrl = "https://image.tmdb.org/t/p/w780";
const appRoot = document.getElementById("app-root");
const localEpisodesDb = JSON.parse(localStorage.getItem("localEpisodes")) || {};

async function handleNavigation() {
  const hash = window.location.hash.substring(1); // Remove '#'
  const mainContent = document.getElementById("main-content");

  const currentMainContent = appRoot.querySelector("#main-content");
  if (!currentMainContent) {
    appRoot.appendChild(buildMainContent());
    currentMainContent = appRoot.querySelector("#main-content"); // Re-query after appending
  }
  currentMainContent.innerHTML = ""; // Clear existing content to prevent duplication

  if (hash.startsWith("go:")) {
    const path = hash.substring(3); // Remove 'go:'

    if (path === "favoritos") {
      currentMainContent.appendChild(buildFavoritesPage(imageBaseUrl));
    } else if (path.includes("/")) {
      const [mediaType, mediaId] = path.split("/");
      if ((mediaType === "movie" || mediaType === "tv") && !isNaN(mediaId)) {
        const mediaDetails = await fetchMediaDetails(
          apiBaseUrl,
          mediaType,
          mediaId
        );
        if (mediaDetails) {
          currentMainContent.appendChild(
            await buildMovieDetailPage(
              apiBaseUrl,
              backdropBaseUrl,
              imageBaseUrl,
              mediaDetails,
              mediaType,
              mediaId,
              null, // seasonNumber
              null, // episodeNumber
              localEpisodesDb
            )
          );
        } else {
          currentMainContent.innerHTML =
            "<p class='text-center text-red-500 mt-10'>No se encontraron detalles para este elemento.</p>";
        }
      } else {
        currentMainContent.innerHTML =
          "<p class='text-center text-red-500 mt-10'>URL de medios no válida.</p>";
      }
    } else if (
      path === "home" ||
      path === "series" ||
      path === "movies" ||
      path === "buscar" ||
      path === ""
    ) {
      // Default content for home, series, movies, search, or empty go:
      currentMainContent.innerHTML =
        "<p class='text-center text-gray-400 mt-10'>Bienvenido a YamiLat. Explora nuestro contenido.</p>";
    } else if (!isNaN(path)) {
      // New condition for go:ID
      const mediaId = parseInt(path);
      const favorites =
        JSON.parse(localStorage.getItem("yamiLatFavorites")) || [];
      const favoriteItem = favorites.find((fav) => fav.id === mediaId);

      if (favoriteItem) {
        const mediaType = favoriteItem.type;
        const mediaDetails = await fetchMediaDetails(
          apiBaseUrl,
          mediaType,
          mediaId
        );
        if (mediaDetails) {
          currentMainContent.appendChild(
            await buildMovieDetailPage(
              apiBaseUrl,
              backdropBaseUrl,
              imageBaseUrl,
              mediaDetails,
              mediaType,
              mediaId,
              null, // seasonNumber
              null, // episodeNumber
              localEpisodesDb
            )
          );
        } else {
          currentMainContent.innerHTML =
            "<p class='text-center text-red-500 mt-10'>No se encontraron detalles para este elemento.</p>";
        }
      } else {
        currentMainContent.innerHTML =
          "<p class='text-center text-red-500 mt-10'>ID de medios no reconocido o no está en favoritos.</p>";
      }
    } else {
      currentMainContent.innerHTML =
        "<p class='text-center text-red-500 mt-10'>Ruta no reconocida.</p>";
    }
  } else if (hash === "") {
    // If no hash, default to favorites page
    currentMainContent.appendChild(buildFavoritesPage(imageBaseUrl));
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  appRoot.appendChild(buildHeader());
  appRoot.appendChild(buildNavigationBar(handleNavigation)); // Pass handleNavigation as a callback
  appRoot.appendChild(buildMainContent()); // Ensure main-content exists

  // Initial navigation handling for the current hash (or lack thereof)
  handleNavigation();

  // Listen for hash changes to handle navigation
  window.addEventListener("hashchange", handleNavigation);
});
