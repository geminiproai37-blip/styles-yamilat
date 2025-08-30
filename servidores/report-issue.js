import { telegramBotToken, telegramChatId, telegramTopicId } from "./config.js";

/**
 * Creates and displays a modal for reporting server issues.
 * @param {object} mediaDetails Details of the media (e.g., title, poster_path).
 * @param {object} localServersDb The database of local servers.
 * @param {string} currentLanguage The currently active language tab.
 * @param {string} currentServerName The name of the currently selected server.
 * @param {string} currentServerUrl The URL of the currently selected server.
 * @param {object} localDownloadServersDb The database of local download servers.
 */
export function showReportIssueModal(
  mediaDetails,
  mediaType,
  localServersDb,
  currentLanguage,
  currentServerName,
  currentServerUrl,
  localDownloadServersDb
) {
  // Remove any existing modal to prevent duplicates
  const existingModal = document.getElementById("report-issue-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modalOverlay = document.createElement("div");
  modalOverlay.id = "report-issue-modal";
  modalOverlay.className =
    "fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50";

  const modalContent = document.createElement("div");
  modalContent.className =
    "bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4";

  modalContent.innerHTML = `
    <h3 class="text-lg font-bold text-white mb-4">Reportar Problema con Servidor</h3>
    <form id="report-issue-form" class="flex flex-col space-y-4">
      <div>
        <label for="server-type-select" class="block text-sm font-medium text-gray-300 mb-1">Tipo de Servidor:</label>
        <select id="server-type-select" class="block w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500">
          <option value="playback">Reproducción</option>
          <option value="download">Descarga</option>
        </select>
      </div>
      <div>
        <label for="server-select" class="block text-sm font-medium text-gray-300 mb-1">Servidor con Falla:</label>
        <select id="server-select" class="block w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500">
          <!-- Options will be dynamically loaded here -->
        </select>
      </div>
      <div>
        <label for="issue-type-select" class="block text-sm font-medium text-gray-300 mb-1">Tipo de Falla:</label>
        <select id="issue-type-select" class="block w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500">
          <option value="no-carga">No Carga</option>
          <option value="audio-desincronizado">Audio Desincronizado</option>
          <option value="video-baja-calidad">Video Baja Calidad</option>
          <option value="enlace-roto">Enlace Roto</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <button type="submit" class="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center justify-center">
        <i class="fas fa-exclamation-triangle mr-2"></i> Enviar Reporte
      </button>
      <button type="button" id="cancel-report-button" class="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200">
        Cancelar
      </button>
    </form>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  const serverTypeSelect = document.getElementById("server-type-select");
  const serverSelect = document.getElementById("server-select");
  const issueTypeSelect = document.getElementById("issue-type-select");
  const reportIssueForm = document.getElementById("report-issue-form");

  function updateServerOptions(selectedType) {
    serverSelect.innerHTML = ""; // Clear existing options
    let serversToDisplay = {};

    if (selectedType === "playback") {
      serversToDisplay = localServersDb;
    } else if (selectedType === "download") {
      serversToDisplay = localDownloadServersDb;
    }

    for (const lang in serversToDisplay) {
      serversToDisplay[lang].servers.forEach((server) => {
        const option = document.createElement("option");
        option.value = `${lang}|${server.name}|${server.url}|${selectedType}`;
        option.textContent = `${lang} - ${server.name}`;
        // Pre-select the current server if it matches
        if (
          selectedType === "playback" &&
          lang === currentLanguage &&
          server.name === currentServerName
        ) {
          option.selected = true;
        }
        serverSelect.appendChild(option);
      });
    }
  }

  // Initial load
  updateServerOptions(serverTypeSelect.value);

  serverTypeSelect.addEventListener("change", (event) => {
    updateServerOptions(event.target.value);
  });

  reportIssueForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const [lang, serverName, serverUrl, serverType] =
      serverSelect.value.split("|");
    const issueType = issueTypeSelect.value;

    const mediaTitle =
      mediaType === "movie"
        ? mediaDetails.title
        : mediaDetails.series_name || mediaDetails.name;
    const mediaLabel = mediaType === "movie" ? "Película" : "Serie";
    let message = `🚨 *Reporte de Falla de Servidor* 🚨\n\n`;
    message += `*${mediaLabel}:* ${mediaTitle}\n`;

    // Conditionally add episode info
    if (mediaDetails.season_number && mediaDetails.episode_number) {
      message += `*Episodio:* T${mediaDetails.season_number} E${
        mediaDetails.episode_number
      } - ${mediaDetails.episode_name || "N/A"}\n`;
    }

    message += `*Tipo de Servidor:* ${
      serverType === "playback" ? "Reproducción" : "Descarga"
    }\n`;
    message += `*Servidor Reportado:* ${serverName} (${lang})\n`;
    message += `*Tipo de Falla:* ${issueType}`;

    const posterUrl = `https://image.tmdb.org/t/p/w500${mediaDetails.poster_path}`;

    const replyMarkup = {
      inline_keyboard: [[{ text: "URL del Servidor", url: serverUrl }]],
    };

    const success = await sendToTelegram(message, posterUrl, replyMarkup);
    modalOverlay.remove();
    if (success) {
      await showSuccessNotification();
    }
  });

  document
    .getElementById("cancel-report-button")
    .addEventListener("click", () => {
      modalOverlay.remove();
    });

  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}

/**
 * Displays a success notification with a GIF.
 */
async function showSuccessNotification() {
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "success-notification";
  modalOverlay.className =
    "fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50";

  const modalContent = document.createElement("div");
  modalContent.className =
    "bg-gray-800 p-4 rounded-lg shadow-xl text-center max-w-xs";
  modalContent.innerHTML = `
        <div class="loader"></div>
        <p class="text-white font-bold text-lg">Cargando...</p>
    `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  try {
    const response = await fetch("https://api.waifu.pics/sfw/dance");
    const data = await response.json();
    const gifUrl = data.url;

    modalContent.innerHTML = `
            <img src="${gifUrl}" alt="Success" class="w-32 h-32 mx-auto mb-4 rounded">
            <p class="text-white font-bold text-md">¡Reporte Enviado!</p>
            <p class="text-gray-300 text-sm">Gracias por tu ayuda.</p>
            <p class="text-gray-400 text-xs mt-2">Fue notificado el administrador, estaremos solventando el problema.</p>
        `;
  } catch (error) {
    console.error("Error fetching GIF:", error);
    modalContent.innerHTML = `
            <img src="https://media1.tenor.com/m/u5V_1lOF6-EAAAAC/anime-thank-you.gif" alt="Success" class="w-32 h-32 mx-auto mb-4 rounded">
            <p class="text-white font-bold text-md">¡Reporte Enviado!</p>
            <p class="text-gray-300 text-sm">Gracias por tu ayuda.</p>
            <p class="text-gray-400 text-xs mt-2">Fue notificado el administrador, estaremos solventando el problema.</p>
        `;
  }

  setTimeout(() => {
    modalOverlay.remove();
  }, 3000); // Remove after 3 seconds
}

/**
 * Sends a photo with a caption to a Telegram chat.
 * @param {string} caption The caption for the photo.
 * @param {string} photoUrl The URL of the photo to send.
 * @param {object} replyMarkup Optional reply markup for buttons.
 */
async function sendToTelegram(caption, photoUrl, replyMarkup = null) {
  if (!telegramBotToken || !telegramChatId) {
    console.error("Telegram Bot Token or Chat ID is not configured.");
    alert("Error: Configuración de Telegram incompleta.");
    return false;
  }

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendPhoto`;
  const params = new URLSearchParams({
    chat_id: telegramChatId,
    photo: photoUrl,
    caption: caption,
    parse_mode: "Markdown",
  });

  if (replyMarkup) {
    params.append("reply_markup", JSON.stringify(replyMarkup));
  }

  try {
    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();
    if (!data.ok) {
      console.error("Error sending message to Telegram:", data);
      // Fallback to sending a text message if photo fails
      return await sendTextMessage(caption, replyMarkup);
    } else {
      console.log("Message sent to Telegram:", data);
      return true;
    }
  } catch (error) {
    console.error("Network error sending message to Telegram:", error);
    alert("Error de red al enviar el reporte a Telegram.");
    return false;
  }
}

/**
 * Sends a text-only message as a fallback.
 * @param {string} message The message to send.
 * @param {object} replyMarkup Optional reply markup for buttons.
 */
async function sendTextMessage(message, replyMarkup = null) {
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  const params = new URLSearchParams({
    chat_id: telegramChatId,
    text: message,
    parse_mode: "Markdown",
  });

  if (replyMarkup) {
    params.append("reply_markup", JSON.stringify(replyMarkup));
  }

  const response = await fetch(`${url}?${params.toString()}`);
  const data = await response.json();
  if (!data.ok) {
    alert("Error al enviar el reporte a Telegram.");
    return false;
  }
  return true;
}
