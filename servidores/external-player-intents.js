// external-player-intents.js

/**
 * Opens a given URL in VLC using an Android intent.
 * @param {string} url The URL to open.
 */
export function openInVLC(url) {
  if (!url) {
    console.error("URL provided to openInVLC is empty.");
    return;
  }
  const vlcIntentUrl = `intent:${url}#Intent;package=org.videolan.vlc;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end`;
  window.open(vlcIntentUrl, "_system");
  console.log(`Attempting to open URL in VLC: ${url}`);
}

/**
 * Opens a given URL in MX Player using an Android intent.
 * @param {string} url The URL to open.
 */
export function openInMXPlayer(url) {
  if (!url) {
    console.error("URL provided to openInMXPlayer is empty.");
    return;
  }
  const mxPlayerIntentUrl = `intent:${url}#Intent;package=com.mxtech.videoplayer.ad;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end`;
  window.open(mxPlayerIntentUrl, "_system");
  console.log(`Attempting to open URL in MX Player: ${url}`);
}

/**
 * Creates and displays a modal for selecting an external player (VLC or MX Player).
 * @param {string} url The URL to be played by the selected player.
 */
export function showExternalPlayerModal(url) {
  if (!url) {
    console.error("URL provided to showExternalPlayerModal is empty.");
    return;
  }

  // Remove any existing modal to prevent duplicates
  const existingModal = document.getElementById("external-player-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modalOverlay = document.createElement("div");
  modalOverlay.id = "external-player-modal";
  modalOverlay.className =
    "fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50";

  const modalContent = document.createElement("div");
  modalContent.className =
    "bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4";

  modalContent.innerHTML = `
    <h3 class="text-lg font-bold text-white mb-4">Seleccionar Reproductor Externo</h3>
    <div class="flex flex-col space-y-4">
      <button id="vlc-button" class="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center">
        <i class="fab fa-vlc mr-2"></i> Abrir con VLC
      </button>
      <button id="mxplayer-button" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center">
        <i class="fas fa-play-circle mr-2"></i> Abrir con MX Player
      </button>
      <button id="cancel-button" class="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200">
        Cancelar
      </button>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // Add event listeners to modal buttons
  document.getElementById("vlc-button").addEventListener("click", () => {
    openInVLC(url);
    modalOverlay.remove();
  });

  document.getElementById("mxplayer-button").addEventListener("click", () => {
    openInMXPlayer(url);
    modalOverlay.remove();
  });

  document.getElementById("cancel-button").addEventListener("click", () => {
    modalOverlay.remove();
  });

  // Close modal if clicking outside
  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}
