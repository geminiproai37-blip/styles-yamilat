import { buildCard } from "./dom-builder.js";
import { fetchMediaDetails } from "./script.js";

const contentData = [
  {
    title: "Más Vistos",
    isHero: false,
    items: [
      { type: "tv", id: 1399, rank: 1 },
      { type: "tv", id: 1429, rank: 2 },
      { type: "tv", id: 60574, rank: 3 },
      { type: "tv", id: 37854, rank: 4 },
      { type: "tv", id: 46261, rank: 5 },
    ],
  },
  {
    title: "Series de Anime Populares",
    isHero: false,
    items: [
      { type: "tv", id: 1399 },
      { type: "tv", id: 1429 },
      { type: "tv", id: 60574 },
      { type: "tv", id: 37854 },
      { type: "tv", id: 46261 },
    ],
  },
  {
    title: "Películas de Anime Mejor Calificadas",
    isHero: false,
    items: [
      { type: "movie", id: 372058 },
      { type: "movie", id: 372754 },
      { type: "movie", id: 149870 },
      { type: "movie", id: 315837 },
      { type: "movie", id: 14836 },
    ],
  },
  {
    title: "Animes de Fantasía",
    isHero: false,
    items: [
      { type: "tv", id: 95479 },
      { type: "tv", id: 67915 },
      { type: "tv", id: 70523 },
      { type: "tv", id: 65706 },
      { type: "tv", id: 80752 },
    ],
  },
  {
    title: "Animes de Ciencia Ficción",
    isHero: false,
    items: [
      { type: "tv", id: 31910 },
      { type: "tv", id: 1871 },
      { type: "movie", id: 260346 },
      { type: "tv", id: 69265 },
      { type: "tv", id: 60059 },
    ],
  },
];

document.addEventListener("DOMContentLoaded", async () => {
  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

  const searchInput = document.getElementById("search-input");
  const searchResultsDiv = document.getElementById("search-results");
  const backButton = document.getElementById("back-button");

  backButton.addEventListener("click", () => {
    window.history.back();
  });

  let allMedia = [];

  // Fetch all media details once
  for (const sectionData of contentData) {
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
  const uniqueMedia = Array.from(
    new Map(allMedia.map((item) => [`${item.id}-${item.type}`, item])).values()
  );

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

  // Initial display of all unique media
  displayResults(uniqueMedia);

  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    const filteredMedia = uniqueMedia.filter((item) => {
      const title =
        item.title || item.name || item.original_title || item.original_name;
      return title && title.toLowerCase().includes(query);
    });
    displayResults(filteredMedia);
  });
});
