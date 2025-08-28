// Function to load video into the player container, handling ArtPlayer or iframe
export function loadVideoPlayer(url, isSandboxed, videoPlayerContainer) {
  videoPlayerContainer.innerHTML = ""; // Clear previous player

  const iframeElement = document.createElement("iframe");
  iframeElement.id = "video-iframe";
  iframeElement.className = "w-full h-full rounded-lg";
  iframeElement.setAttribute("allowfullscreen", "");
  if (isSandboxed) {
    iframeElement.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-presentation allow-fullscreen allow-popups"
    );
  } else {
    iframeElement.removeAttribute("sandbox");
  }
  iframeElement.src = url;
  videoPlayerContainer.appendChild(iframeElement);
}
