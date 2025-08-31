import { fetchMediaDetails } from "./script.js";
import { buildCard } from "./dom-builder.js";
document.addEventListener("DOMContentLoaded", async () => {
  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

  const searchInput = document.getElementById("search-input");
  const searchResultsDiv = document.getElementById("search-results");
  const backButton = document.getElementById("back-button");

  backButton.addEventListener("click", () => {
    window.location.href = "go:home";
  });

  let allMedia = [];
  let uniqueMedia = [];

  const displayResults = (results) => {
    searchResultsDiv.innerHTML = "";
    if (results.length === 0) {
      searchResultsDiv.innerHTML =
        "<p class='text-center text-gray-400 col-span-full'>No se encontraron resultados.</p>";
      return;
    }
    results.forEach((item) => {
      searchResultsDiv.appendChild(buildCard(imageBaseUrl, item));
    });
  };

  // Function to filter and display results
  const filterAndDisplayResults = (query) => {
    const filteredMedia = uniqueMedia.filter((item) => {
      const title =
        item.title || item.name || item.original_title || item.original_name;
      return title && title.toLowerCase().includes(query);
    });
    displayResults(filteredMedia);
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

  if (initialQuery) {
    searchInput.value = initialQuery;
    filterAndDisplayResults(initialQuery.toLowerCase());
  } else {
    // Initial display of all unique media if no query in URL
    displayResults(uniqueMedia);
  }

  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    filterAndDisplayResults(query);

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
