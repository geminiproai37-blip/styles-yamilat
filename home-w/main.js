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
