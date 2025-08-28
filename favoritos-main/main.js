import {
  buildHeader,
  buildMainContent,
  buildNavigationBar,
  createMediaCard,
} from "./dom-builder.js";
import { fetchMediaDetails, showNotification } from "./script.js";

document.addEventListener("DOMContentLoaded", async () => {
  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

  const appRoot = document.getElementById("app-root");
  appRoot.appendChild(buildHeader());
  appRoot.appendChild(buildMainContent());
  appRoot.appendChild(buildNavigationBar());

  const mainContent = document.querySelector("main");
  if (mainContent) {
    mainContent.innerHTML = `
      <section id="favorites-section" class="p-4">
        <h2 class="text-2xl font-bold mb-4 text-center">Mis Favoritos</h2>
        <div id="favorites-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <!-- Favorite items will be loaded here -->
        </div>
      </section>
    `;
  }

  const renderFavorites = async () => {
    const favoritesGrid = document.getElementById("favorites-grid");
    favoritesGrid.innerHTML = ""; // Clear existing content

    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (favorites.length === 0) {
      favoritesGrid.innerHTML = "<p>No tienes favoritos aún.</p>";
    } else {
      for (const item of favorites) {
        const details = await fetchMediaDetails(apiBaseUrl, item.type, item.id);
        if (details) {
          const mediaCard = createMediaCard(
            imageBaseUrl,
            {
              ...item,
              ...details,
              media_type: item.type,
            },
            true // This item is a favorite
          );
          favoritesGrid.appendChild(mediaCard);
        }
      }
    }
  };

  // Initial render of favorites
  renderFavorites();

  // Event listener for adding/removing favorites
  document.addEventListener("click", (event) => {
    const target = event.target;
    const isAddButton = target.classList.contains("add-to-favorites-btn");
    const isRemoveButton = target.classList.contains(
      "remove-from-favorites-btn"
    );

    if (isAddButton || isRemoveButton) {
      const id = target.dataset.id;
      const type = target.dataset.type;
      const title = target.dataset.title;
      const poster_path = target.dataset.poster;

      let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      const existingItemIndex = favorites.findIndex(
        (fav) => fav.id == id && fav.type === type
      );

      if (isAddButton && existingItemIndex === -1) {
        // Add to favorites
        favorites.push({ id: parseInt(id), type, title, poster_path });
        showNotification(
          `${title} ha sido añadido a tus favoritos!`,
          "success"
        );
      } else if (isRemoveButton && existingItemIndex !== -1) {
        // Remove from favorites
        favorites.splice(existingItemIndex, 1);
        showNotification(
          `${title} ha sido eliminado de tus favoritos.`,
          "info"
        );
      }
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites(); // Re-render the favorites grid
    }
  });
});
