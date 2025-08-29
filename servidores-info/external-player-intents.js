/**
 * Abre una URL con el selector de apps de Android ("Abrir con...").
 * @param {string} url
 */
export function openWithAndroidChooser(url) {
  if (!url) {
    alert("La URL no es válida.");
    return;
  }

  // Ensure the URL is absolute before creating the intent
  const absoluteUrl = new URL(url, window.location.origin);
  const scheme = absoluteUrl.protocol.slice(0, -1); // "http" or "https"
  const urlWithoutScheme = absoluteUrl.href.replace(
    `${absoluteUrl.protocol}//`,
    ""
  );

  const intentUrl = `intent://${urlWithoutScheme}#Intent;action=android.intent.action.VIEW;type=video/*;scheme=${scheme};end`;
  window.open(intentUrl, "_system");
}

/**
 * Muestra un modal para seleccionar cómo abrir el video.
 * @param {string} url
 */
export function showExternalPlayerModal(url) {
  if (!url) {
    alert("Por favor, proporciona una URL válida de video.");
    return;
  }

  // Elimina modal existente
  const existingModal = document.getElementById("external-player-modal");
  if (existingModal) existingModal.remove();

  // Crea el modal
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "external-player-modal";
  modalOverlay.className =
    "fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50";

  const modalContent = document.createElement("div");
  modalContent.className =
    "bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4";
  modalContent.innerHTML = `
    <h3 class="text-lg font-bold text-white mb-4">Seleccionar Reproductor</h3>
    <div class="flex flex-col space-y-4">
      <button id="open-with-button" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center">
        <i class="fas fa-external-link-alt mr-2"></i> Abrir con...
      </button>
      <button id="cancel-button" class="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700">
        Cancelar
      </button>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // Eventos
  document.getElementById("open-with-button").addEventListener("click", () => {
    openWithAndroidChooser(url);
    modalOverlay.remove();
  });
  document.getElementById("cancel-button").addEventListener("click", () => {
    modalOverlay.remove();
  });

  // Cierra el modal si se hace clic fuera
  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}
