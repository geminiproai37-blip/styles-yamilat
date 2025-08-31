import {
  TMDB_API_KEY,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  TELEGRAM_TOPIC_ID,
} from "./config.js";

// Debounce function to limit API calls
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

let selectedContent = null;
let isEpisodeRequest = false;
let hasAnsweredInAppQuestion = false;

// Declare elements globally but initialize them in DOMContentLoaded
let requestModal;
let closeModalButton;
let modalSearchInput;
let modalSearchButton;
let tmdbSearchResults;
let nextStepButton;
let submitRequestButton;
let modalStep1;
let modalStep2;
let inAppQuestion; // New element
let inAppYesButton;
let inAppNoButton;
let episodeRequestFields;
let seasonNumberInput;
let episodeNumberInput;
let backToStep1Button;

export function openRequestModal() {
  requestModal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  submitRequestButton.disabled = true;
  nextStepButton.disabled = true;
  nextStepButton.classList.add("opacity-50", "cursor-not-allowed");
  updateSubmitButtonState();
}

document.addEventListener("DOMContentLoaded", () => {
  requestModal = document.getElementById("request-modal");
  closeModalButton = document.getElementById("close-modal-button");
  modalSearchInput = document.getElementById("modal-search-input");
  modalSearchButton = document.getElementById("modal-search-button");
  tmdbSearchResults = document.getElementById("tmdb-search-results");
  nextStepButton = document.getElementById("next-step-button");
  submitRequestButton = document.getElementById("submit-request-button");
  modalStep1 = document.getElementById("modal-step-1");
  modalStep2 = document.getElementById("modal-step-2");
  inAppQuestion = document.getElementById("in-app-question"); // Initialize new element
  inAppYesButton = document.getElementById("in-app-yes-button");
  inAppNoButton = document.getElementById("in-app-no-button");
  episodeRequestFields = document.getElementById("episode-request-fields");
  seasonNumberInput = document.getElementById("season-number-input");
  episodeNumberInput = document.getElementById("episode-number-input");
  backToStep1Button = document.getElementById("back-to-step-1-button");

  // Close modal
  closeModalButton.addEventListener("click", () => {
    requestModal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    modalSearchInput.value = "";
    tmdbSearchResults.innerHTML = "";
    tmdbSearchResults.classList.add("hidden");
    selectedContent = null;
    submitRequestButton.disabled = true;
    nextStepButton.disabled = true;
    nextStepButton.classList.add("opacity-50", "cursor-not-allowed");
    hasAnsweredInAppQuestion = false;
    modalStep1.classList.remove("hidden");
    modalStep2.classList.add("hidden");
    inAppQuestion.classList.remove("hidden"); // Ensure in-app question is visible for next time
    episodeRequestFields.classList.add("hidden"); // Hide episode fields
    submitRequestButton.classList.add("hidden"); // Hide submit button

    // Focus the new modal search input
    modalSearchInput.focus();
  });

  // Close modal when clicking outside
  requestModal.addEventListener("click", (e) => {
    if (e.target === requestModal) {
      closeModalButton.click();
    }
  });

  // Modal Search (replaces TMDB search)
  modalSearchButton.addEventListener("click", async () => {
    selectedContent = null;
    nextStepButton.disabled = true;
    const query = modalSearchInput.value.trim();
    if (query.length > 2) {
      const results = await searchTmdb(query);
      displayTmdbResults(results);
      tmdbSearchResults.classList.remove("hidden");
    } else {
      tmdbSearchResults.innerHTML = "";
      tmdbSearchResults.classList.add("hidden");
      selectedContent = null;
      nextStepButton.disabled = true;
      nextStepButton.classList.add("opacity-50", "cursor-not-allowed");
    }
  });

  // Disable next step button if search input is cleared or changed
  modalSearchInput.addEventListener("input", () => {
    selectedContent = null;
    nextStepButton.disabled = true;
    nextStepButton.classList.add("opacity-50", "cursor-not-allowed");
    tmdbSearchResults.innerHTML = "";
    tmdbSearchResults.classList.add("hidden");
  });

  // Next Step Button
  nextStepButton.addEventListener("click", () => {
    if (selectedContent) {
      modalStep1.classList.add("hidden");
      modalStep2.classList.remove("hidden");
      inAppQuestion.classList.remove("hidden"); // Show the in-app question
      episodeRequestFields.classList.add("hidden"); // Hide episode fields initially
      submitRequestButton.classList.add("hidden"); // Hide submit button initially
      // Explicitly disable submit button when entering step 2
      submitRequestButton.disabled = true;
      // Reset state variables
      isEpisodeRequest = false;
      seasonNumberInput.value = "";
      episodeNumberInput.value = "";
      hasAnsweredInAppQuestion = false;
      updateSubmitButtonState();
    }
  });

  // Back to Step 1 Button
  backToStep1Button.addEventListener("click", () => {
    modalStep2.classList.add("hidden");
    modalStep1.classList.remove("hidden");
    nextStepButton.disabled = selectedContent === null;
    if (nextStepButton.disabled) {
      nextStepButton.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      nextStepButton.classList.remove("opacity-50", "cursor-not-allowed");
    }
    hasAnsweredInAppQuestion = false;
    updateSubmitButtonState();
  });

  // In-app question buttons
  inAppYesButton.addEventListener("click", () => {
    inAppQuestion.classList.add("hidden"); // Hide the in-app question
    episodeRequestFields.classList.remove("hidden"); // Show episode fields
    submitRequestButton.classList.remove("hidden"); // Show submit button
    isEpisodeRequest = true;
    hasAnsweredInAppQuestion = true;
    updateSubmitButtonState();
  });

  inAppNoButton.addEventListener("click", () => {
    inAppQuestion.classList.add("hidden"); // Hide the in-app question
    episodeRequestFields.classList.add("hidden"); // Hide episode fields
    submitRequestButton.classList.remove("hidden"); // Show submit button
    isEpisodeRequest = false;
    seasonNumberInput.value = "";
    episodeNumberInput.value = "";
    hasAnsweredInAppQuestion = true;
    updateSubmitButtonState();
  });

  // Season and Episode input change listener
  seasonNumberInput.addEventListener("input", updateSubmitButtonState);
  episodeNumberInput.addEventListener("input", updateSubmitButtonState);

  // Submit Request to Telegram
  submitRequestButton.addEventListener("click", async () => {
    if (selectedContent) {
      submitRequestButton.disabled = true;
      submitRequestButton.textContent = "Enviando...";

      let message = `
*Nueva Solicitud de Contenido:*
*Nombre:* ${selectedContent.name}
*Tipo:* ${selectedContent.type}
*Sinopsis:* ${selectedContent.synopsis}
*TMDB ID:* ${selectedContent.id} (${selectedContent.media_type})
*TMDB URL:* ${selectedContent.tmdb_url}
`;

      if (isEpisodeRequest) {
        const season = seasonNumberInput.value;
        const episode = episodeNumberInput.value;
        message += `
*Solicitud de Episodio:*
*Temporada:* ${season}
*Episodio:* ${episode}
`;
      }

      const success = await sendToTelegram(selectedContent, message);
      if (success) {
        showConfirmationWithGif();
        closeModalButton.click(); // Close the modal after successful submission
      } else {
        alert(
          "Error al enviar la solicitud a Telegram. Por favor, inténtalo de nuevo."
        );
      }
      submitRequestButton.textContent = "Enviar Solicitud";
      submitRequestButton.disabled = false;
      updateSubmitButtonState(); // Update button state after reset
    }
  });
});

async function searchTmdb(query) {
  const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
    query
  )}&language=es-ES`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results.filter(
      (item) =>
        (item.media_type === "movie" || item.media_type === "tv") &&
        item.poster_path
    );
  } catch (error) {
    console.error("Error searching TMDB:", error);
    return [];
  }
}

function displayTmdbResults(results) {
  tmdbSearchResults.innerHTML = "";
  if (results.length === 0) {
    tmdbSearchResults.innerHTML =
      '<p class="text-gray-400 col-span-full text-center">No se encontraron resultados.</p>';
    tmdbSearchResults.classList.add("hidden");
    selectedContent = null;
    nextStepButton.disabled = true;
    nextStepButton.classList.add("opacity-50", "cursor-not-allowed");
    return;
  }
  tmdbSearchResults.classList.remove("hidden");

  results.forEach((item) => {
    const posterUrl = `https://image.tmdb.org/t/p/w185${item.poster_path}`;
    const title = item.media_type === "movie" ? item.title : item.name;
    const releaseDate =
      item.media_type === "movie"
        ? item.release_date
          ? item.release_date.substring(0, 4)
          : ""
        : item.first_air_date
        ? item.first_air_date.substring(0, 4)
        : "";
    const synopsis = item.overview || "Sinopsis no disponible.";
    console.log("TMDB Item Overview (Synopsis):", item.overview);

    const resultElement = document.createElement("div");
    resultElement.classList.add(
      "cursor-pointer",
      "rounded-lg",
      "overflow-hidden",
      "shadow-lg",
      "flex",
      "flex-col",
      "items-center",
      "text-center",
      "bg-gray-700"
    );
    resultElement.innerHTML = `
      <div class="w-24 h-44 relative flex-shrink-0">
        <img src="${posterUrl}" alt="${title}" class="absolute inset-0 w-full h-full object-cover rounded-t-lg">
      </div>
      <div class="p-1 flex-grow flex items-center justify-center">
        <p class="text-white text-xs font-semibold">${title} (${releaseDate})</p>
      </div>
    `;

    resultElement.addEventListener("click", () => {
      // Remove previous selection
      document.querySelectorAll(".tmdb-result.selected").forEach((el) => {
        el.classList.remove("selected", "border-4", "border-orange-500");
      });
      // Add current selection
      resultElement.classList.add("selected", "border-4", "border-orange-500");
      selectedContent = {
        poster: posterUrl,
        name: title,
        type: item.media_type === "movie" ? "Película" : "Serie",
        synopsis: synopsis,
        id: item.id,
        media_type: item.media_type,
        tmdb_url: `https://www.themoviedb.org/${item.media_type}/${item.id}`,
      };
      nextStepButton.disabled = false;
      nextStepButton.classList.remove("opacity-50", "cursor-not-allowed");
    });
    tmdbSearchResults.appendChild(resultElement);
  });
}

function updateSubmitButtonState() {
  if (!hasAnsweredInAppQuestion) {
    submitRequestButton.disabled = true;
    return;
  }

  if (isEpisodeRequest) {
    const season = parseInt(seasonNumberInput.value);
    const episode = parseInt(episodeNumberInput.value);
    submitRequestButton.disabled = !(season > 0 && episode > 0);
  } else {
    submitRequestButton.disabled = selectedContent === null;
  }

  if (submitRequestButton.disabled) {
    submitRequestButton.classList.add("opacity-50", "cursor-not-allowed");
  } else {
    submitRequestButton.classList.remove("opacity-50", "cursor-not-allowed");
  }
}

async function sendToTelegram(content, message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
  const formData = new FormData();
  formData.append("chat_id", TELEGRAM_CHAT_ID);
  formData.append("photo", content.poster);
  formData.append("caption", message);
  formData.append("parse_mode", "Markdown");
  if (TELEGRAM_TOPIC_ID) {
    formData.append("message_thread_id", TELEGRAM_TOPIC_ID);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (data.ok) {
      console.log("Mensaje enviado a Telegram:", data);
      return true;
    } else {
      console.error("Error al enviar mensaje a Telegram:", data);
      return false;
    }
  } catch (error) {
    console.error("Error de red al enviar a Telegram:", error);
    return false;
  }
}

function showConfirmationWithGif() {
  const gifUrl =
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWJibHM3Zjd4ZDJxZGpucGZndGo5NjV5YXB2NW5udzU4cXBrZnRocSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4ilFRqgbzbx4c/giphy.gif"; // A more reliable GIF URL
  const confirmationMessage = "¡Solicitud enviada con éxito!";

  const notificationContainer = document.getElementById(
    "notification-container"
  );
  const notification = document.createElement("div");
  notification.classList.add(
    "bg-gray-800",
    "text-white",
    "p-4",
    "rounded-xl", // Changed from rounded-lg to rounded-xl
    "shadow-lg",
    "mb-4",
    "flex",
    "items-center",
    "space-x-4"
  );
  notification.innerHTML = `
    <img src="${gifUrl}" alt="Confirmation GIF" class="w-16 h-16 rounded-full">
    <div>
      <p class="font-bold">${confirmationMessage}</p>
      <p class="text-sm text-gray-400">Tu solicitud ha sido recibida.</p>
    </div>
  `;
  notificationContainer.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000); // Remove after 5 seconds
}
