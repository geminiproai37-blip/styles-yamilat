import {
  buildHeader,
  buildMainContent,
  buildNavigationBar,
} from "./dom-builder.js";
import {
  createHeroSlider,
  createContentSlider,
  fetchMediaDetails,
  fetchTrendingMedia,
  fetchOnTheAirTvShows,
} from "./script.js";

// Set these global variables in script.js if they are used there
// For now, assuming they are only used within the DOMContentLoaded block or passed as arguments

document.addEventListener("DOMContentLoaded", async () => {
  // Define base URLs directly in JavaScript
  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
  const backdropBaseUrl = "https://image.tmdb.org/t/p/w780";

  // Define contentData directly in main.js
  const contentData = [
    {
      title: "Más Vistos",
      isHero: false,
      items: [
        {
          type: "tv",
          id: 1399,
          pageUrl: "/watch/game-of-thrones",
          rank: 1,
        },
        {
          type: "tv",
          id: 1429,
          pageUrl: "/watch/attack-on-titan",
          rank: 2,
        },
        {
          type: "tv",
          id: 60574,
          pageUrl: "/watch/my-hero-academia",
          rank: 3,
        },
        { type: "tv", id: 37854, pageUrl: "/watch/one-piece", rank: 4 },
        {
          type: "tv",
          id: 46261,
          pageUrl: "/watch/naruto-shippuden",
          rank: 5,
        },
      ],
    },
    {
      title: "Series de Anime Populares",
      isHero: false,
      items: [
        { type: "tv", id: 1399, pageUrl: "/watch/game-of-thrones" },
        { type: "tv", id: 1429, pageUrl: "/watch/attack-on-titan" },
        { type: "tv", id: 60574, pageUrl: "/watch/my-hero-academia" },
        { type: "tv", id: 37854, pageUrl: "/watch/one-piece" },
        { type: "tv", id: 46261, pageUrl: "/watch/naruto-shippuden" },
      ],
    },
    {
      title: "Películas de Anime Mejor Calificadas",
      isHero: false,
      items: [
        { type: "movie", id: 372058, pageUrl: "/watch/your-name-movie" },
        { type: "movie", id: 372754, pageUrl: "/watch/a-silent-voice" },
        { type: "movie", id: 149870, pageUrl: "/watch/princess-mononoke" },
        {
          type: "movie",
          id: 315837,
          pageUrl: "/watch/your-lie-in-april-movie",
        },
        { type: "movie", id: 14836, pageUrl: "/watch/akira" },
      ],
    },
    {
      title: "Animes de Fantasía",
      isHero: false,
      items: [
        { type: "tv", id: 95479, pageUrl: "/watch/re-zero" },
        { type: "tv", id: 67915, pageUrl: "/watch/konosuba" },
        {
          type: "tv",
          id: 70523,
          pageUrl: "/watch/the-ancient-magus-bride",
        },
        { type: "tv", id: 65706, pageUrl: "/watch/goblin-slayer" },
        {
          type: "tv",
          id: 80752,
          pageUrl: "/watch/that-time-i-got-reincarnated-as-a-slime",
        },
      ],
    },
    {
      title: "Animes de Ciencia Ficción",
      isHero: false,
      items: [
        { type: "tv", id: 31910, pageUrl: "/watch/steins-gate" },
        { type: "tv", id: 1871, pageUrl: "/watch/cowboy-bebop" },
        { type: "movie", id: 260346, pageUrl: "/watch/ghost-in-the-shell" },
        { type: "tv", id: 69265, pageUrl: "/watch/psycho-pass" },
        { type: "tv", id: 60059, pageUrl: "/watch/code-geass" },
      ],
    },
  ];

  const appRoot = document.getElementById("app-root");
  appRoot.appendChild(buildHeader());
  appRoot.appendChild(buildMainContent());
  appRoot.appendChild(buildNavigationBar());

  const heroSliderSection = document.getElementById("hero-slider-section");
  const slidersSection = document.getElementById("sliders-section");
  slidersSection.innerHTML = ""; // Clear placeholder

  const allItemsForHeroSlider = [];

  for (const sectionData of contentData) {
    let itemsToDisplay = [];

    if (sectionData.title === "Más Vistos") {
      // Fetch details for the specified items and assign ranks based on contentData order
      const detailedItems = await Promise.all(
        sectionData.items.map(async (item) => {
          const details = await fetchMediaDetails(
            apiBaseUrl,
            item.type,
            item.id
          );
          return details
            ? {
                ...item,
                ...details,
                media_type: item.type,
              }
            : { ...item, media_type: item.type };
        })
      );
      itemsToDisplay = detailedItems;
    } else {
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
      itemsToDisplay = detailedItems;
    }

    // Create content sliders for this section
    slidersSection.appendChild(
      createContentSlider(imageBaseUrl, sectionData.title, itemsToDisplay)
    );
    // Collect all items for the hero slider
    allItemsForHeroSlider.push(...itemsToDisplay);
  }

  // Randomly select up to 7 items from all collected items for the hero slider
  const shuffledAllItems = allItemsForHeroSlider.sort(
    () => 0.5 - Math.random()
  );
  const heroItemsToDisplay = shuffledAllItems.slice(0, 7);

  // Finally, populate the hero slider with the selected items
  heroSliderSection.innerHTML = "";
  heroSliderSection.appendChild(
    createHeroSlider(backdropBaseUrl, heroItemsToDisplay)
  );
});
