import {
  buildHeader,
  buildMainContent,
  buildNavigationBar,
} from "./dom-builder.js";
import { fetchMediaDetails } from "./script.js";

document.addEventListener("DOMContentLoaded", async () => {
  const appRoot = document.getElementById("app-root");
  appRoot.appendChild(buildHeader());
  appRoot.appendChild(buildMainContent());
  appRoot.appendChild(buildNavigationBar());

  const imageBaseUrl = "https://image.tmdb.org/t/p/w500"; // Base URL for posters

  const moviesTab = document.getElementById("movies-tab");
  const seriesTab = document.getElementById("series-tab");
  const favoritesGrid = document.getElementById("favorites-grid");
  const noFavoritesMessage = document.getElementById("no-favorites-message");

  let currentFilter = "movie"; // Default to showing movies

  const renderFavorites = () => {
    const favorites =
      JSON.parse(localStorage.getItem("yamiLatFavorites")) || [];
    favoritesGrid.innerHTML = ""; // Clear previous content

    const filteredFavorites = favorites.filter(
      (item) => item.type === currentFilter
    );

    if (filteredFavorites.length === 0) {
      noFavoritesMessage.classList.remove("hidden");
      return;
    } else {
      noFavoritesMessage.classList.add("hidden");
    }

    filteredFavorites.forEach((item) => {
      const contentCard = document.createElement("a");
      contentCard.href = `go:${item.id}`;
      contentCard.className = "flex-shrink-0 relative p-1 poster-card";

      const posterImage = document.createElement("img");
      posterImage.src = imageBaseUrl + item.poster_path;
      posterImage.alt = item.title || item.name;
      posterImage.className = "rounded-lg";
      posterImage.loading = "lazy";

      const contentTitle = document.createElement("p");
      contentTitle.className = "text-sm mt-2 truncate";
      contentTitle.textContent = item.title || item.name;

      const removeButton = document.createElement("button");
      removeButton.className =
        "remove-favorite-button absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200";
      removeButton.innerHTML = '<i class="fas fa-times"></i>';
      removeButton.title = "Eliminar de Favoritos";

      removeButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent navigation
        event.stopPropagation(); // Stop event from bubbling to the card link

        let favorites =
          JSON.parse(localStorage.getItem("yamiLatFavorites")) || [];
        favorites = favorites.filter(
          (fav) => !(fav.id === item.id && fav.type === item.type)
        );
        localStorage.setItem("yamiLatFavorites", JSON.stringify(favorites));
        showNotification(
          `${item.title || item.name} ha sido eliminado de tus favoritos.`,
          "info"
        );
        renderFavorites(); // Re-render the list
      });

      contentCard.classList.add("group"); // Add group class for hover effect
      contentCard.append(posterImage, contentTitle, removeButton);
      favoritesGrid.appendChild(contentCard);
    });
  };

  moviesTab.addEventListener("click", () => {
    currentFilter = "movie";
    moviesTab.classList.add("active");
    seriesTab.classList.remove("active");
    renderFavorites();
  });

  seriesTab.addEventListener("click", () => {
    currentFilter = "tv";
    seriesTab.classList.add("active");
    moviesTab.classList.remove("active");
    renderFavorites();
  });

  // Initial render
  renderFavorites();
});

// Function to show a notification
function showNotification(message, type = "info") {
  const notificationContainer = document.getElementById(
    "notification-container"
  );
  if (!notificationContainer) {
    console.warn("Notification container not found.");
    return;
  }

  const notification = document.createElement("div");
  notification.className = `notification ${type} p-3 mb-2 rounded-lg shadow-md text-white`;
  notification.textContent = message;

  // Tailwind classes for styling
  if (type === "success") {
    notification.classList.add("bg-green-500");
  } else if (type === "info") {
    notification.classList.add("bg-blue-500");
  } else if (type === "error") {
    notification.classList.add("bg-red-500");
  } else {
    notification.classList.add("bg-gray-700");
  }

  notificationContainer.prepend(notification); // Add to top

  // Automatically remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
