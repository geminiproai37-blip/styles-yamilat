import { tmdbApiKey } from "https://cdn.jsdelivr.net/gh/geminiproai37-blip/styles-yamilat@main/config.js";
import { initializeLazyLoading } from "./lazyLoader.js";
export const apiBaseUrl = "https://api.themoviedb.org/3";
export const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

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

  const moviesGrid = document.getElementById("movies-grid");
  const apiKeyMessage = document.getElementById("api-key-message");

  if (!tmdbApiKey) {
    apiKeyMessage.classList.remove("hidden");
    return;
  }

  let allMovies = []; // To store all fetched movies for filtering
  let genres = []; // To store fetched genres

  async function fetchGenres() {
    const endpoint = `/genre/movie/list?api_key=${tmdbApiKey}&language=es-ES`;
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

  async function fetchMoviePoster(movieId) {
    const endpoint = `/movie/${movieId}?api_key=${tmdbApiKey}&language=es-ES`;
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
      console.error(`Error fetching movie ${movieId} poster:`, error);
      return null;
    }
  }

  async function fetchLocalMoviesWithPosters() {
    const moviesWithPosters = await Promise.all(
      localMoviesData.map(async (movie) => {
        const movieDetails = await fetchMovieDetails(movie.id); // Fetch full movie details
        return { ...movie, ...movieDetails }; // Merge local data with fetched details
      })
    );
    return moviesWithPosters.filter((movie) => movie.poster_path); // Only show movies with a poster
  }

  async function fetchMovieDetails(movieId) {
    const endpoint = `/movie/${movieId}?api_key=${tmdbApiKey}&language=es-ES`;
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
        `Fetched details for movie ${movieId}: genre_ids: ${JSON.stringify(
          data.genre_ids
        )}, type of first element: ${genreIdsType}`
      );
      return {
        title: data.title,
        poster_path: data.poster_path,
        genre_ids: (data.genre_ids || []).map((id) => parseInt(id)), // Ensure all genre_ids are numbers
        overview: data.overview,
      }; // Return title, poster_path, genre_ids, and overview
    } catch (error) {
      console.error(`Error fetching movie ${movieId} details:`, error);
      return { title: "Unknown", poster_path: null, genre_ids: [] }; // Ensure genre_ids is an empty array on error
    }
  }

  function createCard(item) {
    const card = document.createElement("a");
    card.href = `go:${item.id}`; // Open with go:movieId
    card.className = "group";

    const image = document.createElement("img");
    image.src = "https://placehold.co/500x750/1a202c/f97316?text=Loading..."; // Placeholder for lazy loading
    image.dataset.src = item.poster_path
      ? imageBaseUrl + item.poster_path
      : "https://placehold.co/500x750/1a202c/f97316?text=No+Image";
    image.alt = item.title; // Use item.title from fetched details
    image.className =
      "w-full h-auto rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-300 lazy-load-img"; // Add lazy-load-img class

    card.appendChild(image);
    return card;
  }

  function populateGrid(items) {
    moviesGrid.innerHTML = "";
    items.forEach((item) => {
      moviesGrid.appendChild(createCard(item));
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
    moviesGrid.innerHTML = "";
    moviesGrid.appendChild(createLoader());

    allMovies = await fetchLocalMoviesWithPosters(); // Store all movies
    console.log("All movies after fetching details:", allMovies); // Added log
    await fetchGenres(); // Fetch genres
    populateGrid(allMovies); // Populate grid with all movies initially

    const loader = document.getElementById("loader-container");
    if (loader) {
      loader.remove();
    }
  }

  initializeApp();
});
