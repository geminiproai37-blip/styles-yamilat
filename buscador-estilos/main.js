import { fetchMediaDetails } from "./script.js";
import {
  buildCard,
  buildPageStructure,
  buildSliderPoster,
} from "./dom-builder.js";
import { openRequestModal } from "./request-modal.js";
import { TMDB_API_KEY } from "./config.js";

window.addEventListener("load", async () => {
  const appRoot = document.getElementById("app-root");
  buildPageStructure(appRoot);

  const addContentButton = document.getElementById("add-content-button");
  if (addContentButton) {
    addContentButton.addEventListener("click", openRequestModal);
  }

  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

  const searchInput = document.getElementById("search-input");
  const searchResultsDiv = document.getElementById("search-results");
  const backButton = document.getElementById("back-button");
  const defaultContentSlider = document.getElementById(
    "default-content-slider"
  );
  const sliderContent = document.getElementById("slider-content");
  const recommendedTitle = document.getElementById("recommended-title"); // Get reference to the new title div

  backButton.addEventListener("click", () => {
    window.location.href = "go:home";
  });

  let allMedia = [];
  let uniqueMedia = [];

  const displayDefaultContent = () => {
    sliderContent.innerHTML = "";
    // Shuffle uniqueMedia to display in a different order
    const shuffledMedia = [...uniqueMedia].sort(() => 0.5 - Math.random());
    shuffledMedia.forEach((item) => {
      sliderContent.appendChild(buildSliderPoster(imageBaseUrl, item));
    });
    defaultContentSlider.classList.remove("hidden");
    recommendedTitle.classList.remove("hidden"); // Show the recommended title
    recommendedTitle.querySelector("h2").textContent =
      "Animes y películas recomendadas"; // Set default title
  };

  const displaySearchResults = (results) => {
    searchResultsDiv.innerHTML = "";
    if (results.length === 0) {
      searchResultsDiv.innerHTML =
        "<p class='text-center text-gray-400 col-span-full'>No se encontraron resultados.</p>";
      searchResultsDiv.classList.remove("hidden");
      recommendedTitle.classList.remove("hidden"); // Show the title for search results
      recommendedTitle.querySelector("h2").textContent = "Resultados"; // Set title to "Resultados"
      return;
    }
    results.forEach((item) => {
      searchResultsDiv.appendChild(buildCard(imageBaseUrl, item));
    });
    searchResultsDiv.classList.remove("hidden");
    recommendedTitle.classList.remove("hidden"); // Show the title for search results
    recommendedTitle.querySelector("h2").textContent = "Resultados"; // Set title to "Resultados"
  };

  // Function to filter and display results
  const filterAndDisplayResults = (query) => {
    const filteredMedia = uniqueMedia.filter((item) => {
      const title =
        item.title || item.name || item.original_title || item.original_name;
      return title && title.toLowerCase().includes(query);
    });
    displaySearchResults(filteredMedia);
  };

  // Fetch all media details once
  for (const sectionData of window.contentData) {
    const detailedItems = await Promise.all(
      sectionData.items.map(async (item) => {
        const details = await fetchMediaDetails(
          apiBaseUrl,
          item.type,
          item.id,
          item.season_number,
          item.episode_number
        );
        return details
          ? { ...item, ...details, media_type: item.type }
          : { ...item, media_type: item.type };
      })
    );
    allMedia.push(...detailedItems);
  }
  // Remove duplicates based on id and type
  uniqueMedia = Array.from(
    new Map(allMedia.map((item) => [`${item.id}-${item.type}`, item])).values()
  );

  // Handle initial search from URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get("q");

  // No longer fetching popular media, directly use uniqueMedia for slider

  if (initialQuery) {
    searchInput.value = initialQuery;
    filterAndDisplayResults(initialQuery.toLowerCase());
    defaultContentSlider.classList.add("hidden"); // Hide slider when there's an initial query
    recommendedTitle.classList.remove("hidden"); // Show recommended title for search results
    recommendedTitle.querySelector("h2").textContent = "Resultados"; // Set title to "Resultados"
  } else {
    // Initial display of default content (now uniqueMedia) and all unique media if no query in URL
    displayDefaultContent();
    displaySearchResults(uniqueMedia);
    recommendedTitle.classList.remove("hidden"); // Show recommended title initially
    recommendedTitle.querySelector("h2").textContent =
      "Animes y películas recomendadas"; // Set default title
  }

  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    if (query) {
      filterAndDisplayResults(query);
      defaultContentSlider.classList.add("hidden"); // Hide slider when searching
      recommendedTitle.classList.remove("hidden"); // Show recommended title for search results
      recommendedTitle.querySelector("h2").textContent = "Resultados"; // Set title to "Resultados"
    } else {
      displayDefaultContent(); // Show default content when search is cleared
      displaySearchResults(uniqueMedia); // Show all unique media when search is cleared
      recommendedTitle.classList.remove("hidden"); // Show recommended title when search is cleared
      recommendedTitle.querySelector("h2").textContent =
        "Animes y películas recomendadas"; // Set default title
    }

    // Update URL with search query
    const newUrl = new URL(window.location.href);
    if (query) {
      newUrl.searchParams.set("q", query);
    } else {
      newUrl.searchParams.delete("q");
    }
    window.history.replaceState({}, "", newUrl.toString());
  });
});
