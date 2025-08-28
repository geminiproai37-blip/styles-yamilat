export function initializeWebVideoCaster(
  castBtnGlobal,
  currentServerUrlProvider,
  showMessage
) {
  castBtnGlobal.addEventListener("click", () => {
    const serverUrl = currentServerUrlProvider(); // Get the current server URL
    if (serverUrl) {
      window.open(`wvc-x-callback://open?url=${serverUrl}`, "_blank");
    } else {
      showMessage("Error", "No hay video reproduciéndose para transmitir.");
    }
  });
}
