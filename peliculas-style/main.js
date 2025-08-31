import {
  buildHeader,
  buildMainContent,
  buildNavigationBar,
  createMovieGrid,
} from "./dom-builder.js";
import { fetchMediaDetails, fetchSpecificMovies } from "./script.js";

// Set these global variables in script.js if they are used there
// For now, assuming they are only used within the DOMContentLoaded block or passed as arguments

document.addEventListener("DOMContentLoaded", async () => {
  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

  const appRoot = document.getElementById("app-root");
  appRoot.appendChild(buildHeader());
  appRoot.appendChild(buildMainContent());
  appRoot.appendChild(buildNavigationBar());

  // Use the movieData defined in Inicio.html
  const movies = await fetchSpecificMovies(apiBaseUrl, movieData);
  const moviesSection = document.getElementById("movies-section");
  if (moviesSection) {
    moviesSection.appendChild(createMovieGrid(imageBaseUrl, movies));
  }
});
