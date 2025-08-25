import { tmdbApiKey } from ".../config.js";
import { initializeLazyLoading } from "./lazyLoader.js";
import { apiBaseUrl, imageBaseUrl } from "../config.js";

document.addEventListener("DOMContentLoaded", () => {
  // Handle internal navigation for 'go:' links
  document.body.addEventListener("click", (event) => {
    const target = event.target.closest("a[href^='go:']");
    if (target) {
      // Removed event.preventDefault() and console.log to allow browser to handle 'go:' links
      // If the browser does not handle 'go:' protocol, a custom handler would be needed.
      // For now, we let the browser attempt to navigate.
    }
  });

  // Add event listeners for header buttons
  document.getElementById("notification-btn").addEventListener("click", () => {
    window.location.href = "http://action_notifications"; // Placeholder URL for notifications
  });
  document.getElementById("share-btn").addEventListener("click", () => {
    window.location.href = "http://action_share"; // Placeholder URL for sharing
  });

  const seriesGrid = document.getElementById("series-grid");
  const apiKeyMessage = document.getElementById("api-key-message");
  // Removed categorySelect as the filter button is removed

  // --- CONFIGURACIÓN IMPORTANTE ---
  // La clave de API ahora se importa desde config.js

  if (!tmdbApiKey) {
    apiKeyMessage.classList.remove("hidden");
    return;
  }

  let allSeries = []; // To store all fetched series for filtering
  let genres = []; // To store fetched genres (still fetched for potential future use, but not used for filtering now)

  // Removed all filtering related functions and event listeners
  async function fetchGenres() {
    const endpoint = `/genre/tv/list?api_key=${tmdbApiKey}&language=es-ES`;
    try {
      const response = await fetch(apiBaseUrl + endpoint);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Network response was not ok: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      genres = data.genres;
      return data.genres;
    } catch (error) {
      console.error("Error fetching genres:", error);
      return [];
    }
  }

  // Removed populateCategorySelect and filterSeries functions
  // The grid will always display all series

  async function fetchSeriesPoster(seriesId) {
    const endpoint = `/tv/${seriesId}?api_key=${tmdbApiKey}&language=es-ES`;
    try {
      const response = await fetch(apiBaseUrl + endpoint);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Network response was not ok: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      return data.poster_path;
    } catch (error) {
      console.error(`Error fetching series ${seriesId} poster:`, error);
      return null;
    }
  }

  async function fetchLocalSeriesWithPosters() {
    const seriesWithPosters = await Promise.all(
      localSeriesData.map(async (series) => {
        const seriesDetails = await fetchSeriesDetails(series.id); // Fetch full series details
        return { ...series, ...seriesDetails }; // Merge local data with fetched details
      })
    );
    return seriesWithPosters.filter((series) => series.poster_path); // Only show series with a poster
  }

  async function fetchSeriesDetails(seriesId) {
    const endpoint = `/tv/${seriesId}?api_key=${tmdbApiKey}&language=es-ES`;
    try {
      const response = await fetch(apiBaseUrl + endpoint);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Network response was not ok: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      const genreIdsType =
        data.genre_ids && data.genre_ids.length > 0
          ? typeof data.genre_ids[0]
          : "N/A (empty or undefined)";
      console.log(
        `Fetched details for series ${seriesId}: genre_ids: ${JSON.stringify(
          data.genre_ids
        )}, type of first element: ${genreIdsType}`
      );
      return {
        name: data.name,
        poster_path: data.poster_path,
        genre_ids: (data.genre_ids || []).map((id) => parseInt(id)), // Ensure all genre_ids are numbers
        overview: data.overview,
      }; // Return name, poster_path, genre_ids, and overview
    } catch (error) {
      console.error(`Error fetching series ${seriesId} details:`, error);
      return { name: "Unknown", poster_path: null, genre_ids: [] }; // Ensure genre_ids is an empty array on error
    }
  }

  function createCard(item) {
    const card = document.createElement("a");
    card.href = `go:${item.id}`; // Open with go:seriesId
    // Removed target="_blank" for internal navigation
    card.className = "group";

    const image = document.createElement("img");
    image.src = "https://placehold.co/500x750/1a202c/f97316?text=Loading..."; // Placeholder for lazy loading
    image.dataset.src = item.poster_path
      ? imageBaseUrl + item.poster_path
      : "https://placehold.co/500x750/1a202c/f97316?text=No+Image";
    image.alt = item.name; // Use item.name from fetched details
    image.className =
      "w-full h-auto rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-300 lazy-load-img"; // Add lazy-load-img class

    card.appendChild(image);
    return card;
  }

  function populateGrid(items) {
    seriesGrid.innerHTML = "";
    items.forEach((item) => {
      seriesGrid.appendChild(createCard(item));
    });
    initializeLazyLoading(); // Initialize lazy loading for new images
  }

  function createLoader() {
    const loaderContainer = document.createElement("div");
    loaderContainer.id = "loader-container";
    loaderContainer.className =
      "col-span-full flex justify-center items-center h-64";
    const loader = document.createElement("div");
    loader.className = "loader";
    loaderContainer.appendChild(loader);
    return loaderContainer;
  }

  async function initializeApp() {
    seriesGrid.innerHTML = "";
    seriesGrid.appendChild(createLoader());

    allSeries = await fetchLocalSeriesWithPosters(); // Store all series
    console.log("All series after fetching details:", allSeries); // Added log
    await fetchGenres(); // Fetch genres
    populateGrid(allSeries); // Populate grid with all series initially

    const loader = document.getElementById("loader-container");
    if (loader) {
      loader.remove();
    }
  }

  initializeApp();
});

