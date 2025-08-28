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
      contentCard.className =
        "flex-shrink-0 relative p-2 m-2 w-32 h-auto bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 window-card";

      const posterImage = document.createElement("img");
      posterImage.src = imageBaseUrl + item.poster_path;
      posterImage.alt = item.title || item.name;
      posterImage.className = "rounded-md w-full h-auto object-cover";
      posterImage.loading = "lazy";

      const contentTitle = document.createElement("p");
      contentTitle.className = "text-xs mt-2 truncate text-center";
      contentTitle.textContent = item.title || item.name;

      const removeButton = document.createElement("button");
      removeButton.className =
        "remove-favorite-button absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs z-10"; // Removed opacity-0 and group-hover:opacity-100 to make it always visible
      removeButton.innerHTML = '<i class="fas fa-times"></i>';
      removeButton.title = "Eliminar de Favoritos";

      removeButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent navigation
        event.stopPropagation(); // Stop event from bubbling to the card link
        showConfirmationModal(item); // Show confirmation modal
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

// Get modal elements
const confirmationModal = document.getElementById("confirmation-modal");
const modalMessage = document.getElementById("modal-message");
const confirmDeleteButton = document.getElementById("confirm-delete-button");
const cancelDeleteButton = document.getElementById("cancel-delete-button");

let itemToDelete = null; // To store the item to be deleted

function showConfirmationModal(item) {
  itemToDelete = item;
  modalMessage.textContent = `¿Estás seguro de que quieres eliminar "${
    item.title || item.name
  }" de tus favoritos?`;
  confirmationModal.classList.remove("hidden");
}

function hideConfirmationModal() {
  confirmationModal.classList.add("hidden");
  itemToDelete = null;
}

confirmDeleteButton.addEventListener("click", () => {
  if (itemToDelete) {
    let favorites = JSON.parse(localStorage.getItem("yamiLatFavorites")) || [];
    favorites = favorites.filter(
      (fav) => !(fav.id === itemToDelete.id && fav.type === itemToDelete.type)
    );
    localStorage.setItem("yamiLatFavorites", JSON.stringify(favorites));
    showNotification(
      `${
        itemToDelete.title || itemToDelete.name
      } ha sido eliminado de tus favoritos.`,
      "info"
    );
    renderFavorites(); // Re-render the list
  }
  hideConfirmationModal();
});

cancelDeleteButton.addEventListener("click", () => {
  hideConfirmationModal();
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
