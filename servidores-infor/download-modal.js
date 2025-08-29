/**
 * Creates and displays a modal for selecting download servers.
 * @param {object} mediaDetails Details of the media (e.g., title, poster_path, episode_name).
 * @param {string} mediaType Type of media ('movie' or 'tv').
 * @param {object} localDownloadServersDb The database of local download servers.
 * @param {string} currentLanguage The currently active language tab.
 */
export function showDownloadModal(
  mediaDetails,
  mediaType,
  localDownloadServersDb,
  currentLanguage
) {
  // Remove any existing modal to prevent duplicates
  const existingModal = document.getElementById("download-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modalOverlay = document.createElement("div");
  modalOverlay.id = "download-modal";
  modalOverlay.className =
    "fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50";

  const modalContent = document.createElement("div");
  modalContent.className =
    "bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4";

  let downloadServersHtml = "";
  const serversForCurrentLang = localDownloadServersDb[currentLanguage];

  if (serversForCurrentLang && serversForCurrentLang.servers.length > 0) {
    downloadServersHtml += `<h4 class="text-md font-semibold text-orange-400 mt-4 mb-2">Servidores de Descarga (${currentLanguage})</h4>`;
    serversForCurrentLang.servers.forEach((server) => {
      downloadServersHtml += `
        <a href="${server.url}" target="_blank" rel="noopener noreferrer" class="block bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 mb-2 flex items-center justify-center text-sm">
          <i class="fas fa-download mr-2"></i> ${server.name}
        </a>
      `;
    });
  } else {
    // Placeholder GIF for now. I will need to find a reliable source for random anime GIFs.
    const placeholderGif =
      "https://media.giphy.com/media/v1.giphy.com/media/l0HlTJjQ0x9Q20y0o/giphy.gif"; // Example GIF
    downloadServersHtml = `
      <p class="text-gray-400 text-sm mb-4">No hay servidores de descarga disponibles para ${currentLanguage}.</p>
      <div class="flex justify-center">
        <img src="${placeholderGif}" alt="No downloads available" class="rounded-lg max-w-full h-auto" style="max-height: 200px; object-fit: cover;">
      </div>
    `;
  }

  const title =
    mediaType === "movie"
      ? mediaDetails.title || mediaDetails.name
      : mediaDetails.series_name;
  const episodeInfo =
    mediaType === "tv" && mediaDetails.episode_name
      ? `T${mediaDetails.season_number} E${mediaDetails.episode_number} - ${mediaDetails.episode_name}`
      : "";

  modalContent.innerHTML = `
    <h3 class="text-lg font-bold text-white mb-4">Descargar ${title}</h3>
    ${
      episodeInfo
        ? `<p class="text-sm text-gray-300 mb-4">${episodeInfo}</p>`
        : ""
    }
    <div class="flex flex-col space-y-2">
      ${downloadServersHtml}
      <button type="button" id="cancel-download-button" class="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200 mt-4">
        Cancelar
      </button>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  document
    .getElementById("cancel-download-button")
    .addEventListener("click", () => {
      modalOverlay.remove();
    });

  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}
