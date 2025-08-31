import {
  buildHeader,
  buildMainContent,
  buildNavigationBar,
  createMovieGrid,
} from "./dom-builder.js";
import { fetchMediaDetails, fetchSpecificSeries } from "./script.js";

// Set these global variables in script.js if they are used there
// For now, assuming they are only used within the DOMContentLoaded block or passed as arguments

document.addEventListener("DOMContentLoaded", async () => {
  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

  const appRoot = document.getElementById("app-root");
  appRoot.appendChild(buildHeader());
  appRoot.appendChild(buildMainContent());
  appRoot.appendChild(buildNavigationBar());

  // Use the seriesData defined in Inicio.html
  const series = await fetchSpecificSeries(apiBaseUrl, seriesData);
  const seriesSection = document.getElementById("series-section");
  if (seriesSection) {
    seriesSection.appendChild(createMovieGrid(imageBaseUrl, series));
  }
});
