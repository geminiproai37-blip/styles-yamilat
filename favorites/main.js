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

  // Clear existing main content by removing its first child, if any
  if (mainContent && mainContent.firstChild) {
    mainContent.firstChild.remove();
  } else if (!mainContent) {
    // If main-content doesn't exist, create and append it
    appRoot.appendChild(buildMainContent());
  }

  let contentDisplayed = false; // Flag to track if content is displayed on current page

  if (hash.startsWith("go:")) {
    const path = hash.substring(3); // Remove 'go:'

    if (path.includes("/")) {
      const [mediaType, mediaId] = path.split("/");
      if ((mediaType === "movie" || mediaType === "tv") && !isNaN(mediaId)) {
        const mediaDetails = await fetchMediaDetails(
          apiBaseUrl,
          mediaType,
          mediaId
        );
        if (mediaDetails) {
          appRoot.querySelector("#main-content").appendChild(
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
          contentDisplayed = true;
        } else {
          appRoot.querySelector("#main-content").innerHTML =
            "<p class='text-center text-red-500 mt-10'>No se encontraron detalles para este elemento.</p>";
          contentDisplayed = true;
        }
      } else {
        appRoot.querySelector("#main-content").innerHTML =
          "<p class='text-center text-red-500 mt-10'>URL de medios no válida.</p>";
        contentDisplayed = true;
      }
    }
    // For "home", "series", "movies", and "" (exact "go:"), no new tab is opened.
    // These will fall through to the default favorites display below if no other content is set.
  }

  // If no specific content was displayed on the current page, or if it's "favoritos",
  // always display the favorites page content.
  if (!contentDisplayed || hash === "go:favoritos") {
    appRoot
      .querySelector("#main-content")
      .appendChild(buildFavoritesPage(imageBaseUrl));
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  appRoot.appendChild(buildHeader());
  appRoot.appendChild(buildNavigationBar());
  appRoot.appendChild(buildMainContent()); // Ensure main-content exists

  // Set default hash if none exists
  if (!window.location.hash) {
    window.location.hash = "go:home";
  }

  // Listen for hash changes to handle navigation
  window.addEventListener("hashchange", handleNavigation);

  // Initial navigation handling for the current hash
  handleNavigation();
});
