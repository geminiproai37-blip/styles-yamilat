import {
  fetchMediaDetails,
  fetchCast,
  fetchMediaVideos,
  fetchTvSeasonDetails,
  fetchEpisodeDetails,
} from "./script.js";
import {
  showExternalPlayerModal,
  openWithAndroidChooser,
} from "./external-player-intents.js";
import { openInWebVideoCaster } from "./web-video-caster.js";
import { showReportIssueModal } from "./report-issue.js";

export function buildHeader(mediaId) {
  const header = document.createElement("header");
  header.className =
    "bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 py-3 px-4 flex justify-between items-center border-b border-gray-800 max-w-4xl mx-auto";

  header.innerHTML = `
    <div class="flex items-center space-x-2">
      <button id="back-btn" aria-label="Regresar" class="text-gray-400 hover:text-white transition mr-2">
        <i class="fas fa-arrow-left text-lg md:text-xl"></i>
      </button>
      <svg
        class="h-7 w-7 md:h-8 md:w-8 text-orange-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9a2.25 2.25 0 0 0-2.25 2.25v9A2.25 2.25 0 0 0 4.5 18.75Z"
        />
      </svg>
      <h1 class="text-xl md:text-2xl font-bold text-white">
        Yami<span class="text-orange-500">Lat</span>
      </h1>
    </div>
    <div class="flex items-center space-x-4">
      <button id="search-btn" aria-label="Buscar" class="text-gray-400 hover:text-white transition">
        <i class="fas fa-search text-lg md:text-xl"></i>
      </button>
    </div>
  `;

  // Acciones (puedes reemplazar con funciones reales en vez de redirección)
  header.querySelector("#search-btn").addEventListener("click", () => {
    window.location.href = "go:buscar";
  });
  header.querySelector("#back-btn").addEventListener("click", () => {
    window.location.href = `go:${mediaId}`;
  });

  return header;
}

export function buildMainContent() {
  const main = document.createElement("main");
  main.id = "main-content";
  main.className = "";

  main.innerHTML = `
    <!-- Mensaje API Key -->
    <div
      id="api-key-message"
      class="hidden bg-red-800 border-l-4 border-red-500 text-red-100 p-4 rounded-lg m-5"
      role="alert"
    >
      <p class="font-bold">Error de Configuración</p>
      <p>
        Por favor, introduce tu clave de API de TMDB en la variable \`apiKey\`
        del script para cargar el contenido.
      </p>
    </div>

    <!-- Movie Detail Section -->
    <div id="movie-detail-section" class="w-full">
      <!-- Movie detail content will be loaded here by script.js -->
    </div>
  `;
  return main;
}

export async function buildMovieDetailPage(
  apiBaseUrl,
  backdropBaseUrl,
  imageBaseUrl,
  mediaDetails,
  mediaType,
  mediaId,
  seasonNumber,
  episodeNumber,
  localEpisodesDb, // New parameter
  allEpisodesUrl, // New parameter
  nextEpisodeUrl, // New parameter
  previousEpisodeUrl, // New parameter
  hasPreviousEpisode, // New parameter
  localServersDb, // New parameter
  localDownloadServersDb, // New parameter
  openInWebVideoCaster, // New parameter (reverted name)
  showDownloadModal // New parameter
) {
  const movie = mediaDetails;
  const movieDetailContainer = document.createElement("div");
  movieDetailContainer.className =
    "relative w-full min-h-screen bg-gray-900 text-white pb-20";

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "relative z-10 p-5 max-w-4xl mx-auto";

  // Language Tabs Container
  // Buttons for Transmit and External Player
  const playerButtonsContainer = document.createElement("div");
  playerButtonsContainer.className = "flex justify-end space-x-2 mt-4"; // Aligned to the right
  contentWrapper.appendChild(playerButtonsContainer);

  let currentServerUrl = ""; // Variable to store the currently selected server URL
  let currentLanguage = ""; // Variable to store the currently active language
  let currentServerName = ""; // Variable to store the currently selected server name

  const externalPlayerButton = document.createElement("button");
  externalPlayerButton.id = "external-player-button";
  externalPlayerButton.className =
    "bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200 fa-lg"; // Default to blue
  externalPlayerButton.innerHTML = `<i class="fab fa-chromecast"></i>`; // Default to transmit icon
  playerButtonsContainer.appendChild(externalPlayerButton);

  const reportIssueButton = document.createElement("button");
  reportIssueButton.id = "report-issue-button";
  reportIssueButton.className =
    "bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-200";
  reportIssueButton.innerHTML = `<i class="fas fa-exclamation-triangle"></i>`; // Changed icon
  playerButtonsContainer.appendChild(reportIssueButton);

  const downloadButton = document.createElement("button");
  downloadButton.id = "download-button";
  downloadButton.className =
    "bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors duration-200";
  downloadButton.innerHTML = `<i class="fas fa-download"></i>`;
  playerButtonsContainer.appendChild(downloadButton);

  downloadButton.addEventListener("click", () => {
    if (
      localDownloadServersDb &&
      Object.keys(localDownloadServersDb).length > 0 &&
      currentLanguage
    ) {
      showDownloadModal(
        mediaDetails,
        mediaType,
        localDownloadServersDb,
        currentLanguage
      );
    } else {
      console.warn("No download servers configured or language not selected.");
    }
  });

  externalPlayerButton.addEventListener("click", () => {
    if (currentServerUrl) {
      const absoluteUrl = new URL(currentServerUrl, window.location.origin)
        .href;
      const isProIamakintech = currentServerUrl.includes("pro.iamakintech.com");
      const isArchiveOrg = currentServerUrl.includes("archive.org");

      if (isProIamakintech || isArchiveOrg) {
        openInWebVideoCaster(absoluteUrl);
      } else {
        openWithAndroidChooser(absoluteUrl);
      }
    } else {
      console.warn("No server URL selected for external player.");
    }
  });

  const languageTabsContainer = document.createElement("div");
  languageTabsContainer.className = "mt-6 mb-4";
  contentWrapper.appendChild(languageTabsContainer);

  const tabsHeader = document.createElement("div");
  tabsHeader.className = "flex overflow-x-auto space-x-2 pb-2 no-scrollbar"; // Added overflow-x-auto for scrollability, no-scrollbar for cleaner look
  languageTabsContainer.appendChild(tabsHeader);

  const serversContentContainer = document.createElement("div");
  serversContentContainer.id = "servers-content-container";
  serversContentContainer.className = "mt-4";
  languageTabsContainer.appendChild(serversContentContainer);

  let activeLanguageTab = null;
  const serverContentWrappers = {}; // To store server button wrappers for each language
  let currentPlyrInstance = null; // To store the active Plyr instance

  for (const lang in localServersDb) {
    const langButton = document.createElement("button");
    langButton.className =
      "py-1 px-2 text-xs font-semibold text-gray-400 border-b-2 border-transparent hover:text-orange-500 hover:border-orange-500 focus:outline-none transition-colors duration-200 flex items-center space-x-1 flex-shrink-0 flex-grow"; // Changed w-1/3 to flex-grow

    const flagCode = localServersDb[lang].flagCode;

    langButton.innerHTML = `
      <span class="fi fi-${flagCode} mr-2"></span>
      <span>${lang}</span>
    `;
    tabsHeader.appendChild(langButton);

    // Create server buttons wrapper for this language
    const serverButtonsWrapper = document.createElement("div");
    serverButtonsWrapper.className = "flex flex-wrap gap-2 hidden"; // Initially hidden
    serversContentContainer.appendChild(serverButtonsWrapper);
    serverContentWrappers[lang] = serverButtonsWrapper; // Store for later access

    let activeServerButton = null; // Keep track of active server button per language

    localServersDb[lang].servers.forEach((server) => {
      const serverButton = document.createElement("button");
      serverButton.className =
        "bg-gray-700 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-1";
      serverButton.innerHTML = `
        <i class="fas fa-server mr-1"></i>
        <span>${server.name}</span>
      `;
      serverButtonsWrapper.appendChild(serverButton);

      serverButton.addEventListener("click", () => {
        if (activeServerButton) {
          activeServerButton.classList.remove(
            "bg-orange-600",
            "hover:bg-orange-700"
          );
          activeServerButton.classList.add("bg-gray-700", "hover:bg-gray-600");
        }

        serverButton.classList.add("bg-orange-600", "hover:bg-orange-700");
        serverButton.classList.remove("bg-gray-700", "hover:bg-gray-600");
        activeServerButton = serverButton;
        currentServerUrl = server.url;
        currentServerName = server.name; // Set current server name

        const isArchiveOrgLink = server.url.includes("archive.org");
        const isDirectVideoLink =
          server.url.includes("pro.iamakintech.com") ||
          server.url.includes("gamelink.b-cdn.net") ||
          /\.(mp4|webm|ogg|mov|avi|flv|wmv)(\?.*)?$/i.test(server.url) ||
          server.url.includes("pixeldrain.com/api/file/") ||
          isArchiveOrgLink; // Include archive.org in direct video links

        // Change icon and color based on link type
        if (isDirectVideoLink) {
          externalPlayerButton.innerHTML = `
            <span class="fa-layers fa-fw">
              <i class="fas fa-play" data-fa-transform="shrink-6 left-3"></i>
              <i class="fab fa-chromecast" data-fa-transform="shrink-6 right-3"></i>
            </span>`;
          externalPlayerButton.classList.remove(
            "bg-blue-600",
            "hover:bg-blue-700"
          );
          externalPlayerButton.classList.add(
            "bg-purple-600",
            "hover:bg-purple-700"
          );
        } else {
          externalPlayerButton.innerHTML = `<i class="fab fa-chromecast"></i>`;
          externalPlayerButton.classList.remove(
            "bg-purple-600",
            "hover:bg-purple-700"
          );
          externalPlayerButton.classList.add(
            "bg-blue-600",
            "hover:bg-blue-700"
          );
        }

        if (isDirectVideoLink) {
          // Destroy existing Plyr instance if any
          if (currentPlyrInstance) {
            currentPlyrInstance.destroy();
            currentPlyrInstance = null;
          }

          iframeContainer.classList.remove("hidden");
          iframeContainer.innerHTML = ``; // Clear previous content, including "no player" message
          const loadingIndicator = document.createElement("div");
          loadingIndicator.className =
            "flex items-center justify-center h-full bg-gray-900 text-gray-400";
          loadingIndicator.innerHTML = `<i class="fas fa-spinner fa-spin text-2xl mr-2"></i> Cargando video...`;
          iframeContainer.appendChild(loadingIndicator);

          // Attempt to load video and initialize player
          try {
            const videoElement = document.createElement("video");
            videoElement.controls = true;
            videoElement.crossOrigin = "anonymous";
            videoElement.playsInline = true;
            if (mediaDetails.still_path) {
              videoElement.poster = `${backdropBaseUrl}${mediaDetails.still_path}`;
            }
            videoElement.className = "w-full h-full"; // Removed plyr-video class

            let videoType = "video/mp4"; // Default to mp4

            // Explicitly set videoType to video/mp4 for specific domains
            if (
              server.url.includes("pro.iamakintech.com") ||
              server.url.includes("gamelink.b-cdn.net") ||
              isArchiveOrgLink // Also for archive.org
            ) {
              videoType = "video/mp4";
            } else {
              // Otherwise, try to determine type from extension
              const match = server.url.match(
                /\.(mp4|webm|ogg|mov|avi|flv|wmv)(\?.*)?$/i
              );
              if (match && match[1]) {
                const extension = match[1].toLowerCase();
                if (extension === "mp4") videoType = "video/mp4";
                else if (extension === "webm") videoType = "video/webm";
                else if (extension === "ogg") videoType = "video/ogg";
                else if (extension === "mov") videoType = "video/mp4";
                else if (extension === "avi") videoType = "video/x-msvideo";
                else if (extension === "flv") videoType = "video/x-flv";
                else if (extension === "wmv") videoType = "video/x-ms-wmv";
              }
            }

            videoElement.src = server.url;
            videoElement.type = videoType;
            videoElement.id = "video-player"; // Add an ID for Fluid Player

            // Clear loading message and append video
            iframeContainer.innerHTML = "";
            iframeContainer.appendChild(videoElement);

            if (isArchiveOrgLink) {
              // Initialize Fluid Player for archive.org
              fluidPlayer("video-player", {
                sources: [
                  {
                    src: server.url,
                    type: videoType,
                  },
                ],
                layoutControls: {
                  primaryColor: "#f97316", // Orange color
                  posterImage: mediaDetails.still_path
                    ? `${backdropBaseUrl}${mediaDetails.still_path}`
                    : "",
                  playButtonShowing: "hover",
                  fillToContainer: true,
                  autoHide: true,
                  autoHideTimeout: 3,
                  allowTheatre: true,
                  allowDownload: false,
                  playbackRateEnabled: true,
                  subtitlesEnabled: false,
                  keyboardControl: true,
                  progressControl: "hover",
                  loop: false,
                  mute: false,
                  volume: 1,
                  playerInitCallback: () => {
                    console.log(
                      "Fluid Player initialized for archive.org:",
                      server.url
                    );
                  },
                },
                vastOptions: {
                  adList: [], // No ads
                },
              });
            } else {
              // Initialize Plyr for other direct video links
              currentPlyrInstance = new Plyr(videoElement, {
                controls: [
                  "play-large",
                  "play",
                  "progress",
                  "current-time",
                  "mute",
                  "volume",
                  "fullscreen",
                  "pip",
                ],
                settings: ["quality", "speed"],
                iconUrl: "https://cdn.plyr.io/3.7.8/plyr.svg",
                tooltips: { controls: true, seek: true },
              });
              document.documentElement.style.setProperty(
                "--plyr-color-main",
                "#f97316"
              );
              console.log(
                `Direct video link detected (or Pixeldrain API file), playing with Plyr: ${server.url}`
              );

              currentPlyrInstance.on("error", (event) => {
                console.error(
                  "Plyr error: Failed to load video.",
                  server.url,
                  event
                );
                let errorMessage =
                  "Error al cargar el video con Plyr. El enlace podría estar roto o no disponible.";
                // Check for specific network errors that often indicate CORS issues
                if (event.detail && event.detail.code === 4) {
                  // HTMLMediaElement.NETWORK_NO_SOURCE
                  errorMessage =
                    "Error de red: El video no pudo ser cargado. Esto a menudo se debe a una política de CORS que bloquea el acceso desde este sitio. Por favor, intenta con otro servidor o contacta al proveedor del video.";
                } else if (
                  event.detail &&
                  event.detail.message &&
                  event.detail.message.includes("CORS")
                ) {
                  errorMessage =
                    "Error de CORS: El video no pudo ser cargado debido a una política de seguridad. Por favor, intenta con otro servidor o contacta al proveedor del video.";
                } else {
                  errorMessage =
                    "Error al cargar el video con Plyr. El enlace podría estar roto, no disponible o bloqueado por políticas de CORS.";
                }

                iframeContainer.innerHTML = `
                  <div class="flex flex-col items-center justify-center h-full bg-gray-900 text-red-400 p-4">
                    <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
                    <p class="text-center">${errorMessage}</p>
                  </div>
                `;
              });
            }
          } catch (error) {
            console.error("Error initializing player:", error);
            iframeContainer.innerHTML = `
              <div class="flex flex-col items-center justify-center h-full bg-gray-900 text-red-400 p-4">
                <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
                <p class="text-center">Error al preparar el reproductor de video. Asegúrate de que el enlace sea válido.</p>
              </div>
            `;
          }
        } else {
          // Set sandbox attribute to block popups but allow fullscreen
          iframeElement.setAttribute(
            "sandbox",
            "allow-fullscreen allow-scripts allow-same-origin allow-presentation"
          );
          iframeElement.src = server.url;
          iframeContainer.classList.remove("hidden");
          iframeContainer.innerHTML = ""; // Clear previous content
          iframeContainer.appendChild(iframeElement);
        }

        // The button is now always visible, so this is no longer needed.
      });
    });

    langButton.addEventListener("click", () => {
      if (activeLanguageTab) {
        activeLanguageTab.classList.remove(
          "text-orange-500",
          "border-orange-500"
        );
        activeLanguageTab.classList.add("text-gray-400", "border-transparent");
        // Hide previous server buttons wrapper
        serverContentWrappers[activeLanguageTab.dataset.lang].classList.add(
          "hidden"
        );
      }

      langButton.classList.add("text-orange-500", "border-orange-500");
      langButton.classList.remove("text-gray-400", "border-transparent");
      activeLanguageTab = langButton;
      activeLanguageTab.dataset.lang = lang; // Store the language in the button for easy access
      currentLanguage = lang; // Set current language

      // Show current server buttons wrapper
      serverContentWrappers[lang].classList.remove("hidden");

      // Automatically click the first server button of the active language tab
      if (serverContentWrappers[lang].firstElementChild) {
        serverContentWrappers[lang].firstElementChild.click();
      }
    });
  }

  // Create and append iframe container and element outside the dynamic content area
  const iframeContainer = document.createElement("div");
  iframeContainer.id = "iframe-container";
  iframeContainer.className =
    "w-full aspect-video bg-gray-800 rounded-lg overflow-hidden mt-4 hidden responsive-iframe-container"; // Initially hidden
  contentWrapper.appendChild(iframeContainer);

  const iframeElement = document.createElement("iframe");
  iframeElement.id = "media-iframe";
  iframeElement.className = "w-full h-full";
  iframeElement.setAttribute("allowfullscreen", "");
  iframeElement.setAttribute("frameborder", "0");
  // Add sandbox attribute to restrict iframe capabilities, allowing fullscreen but blocking popups and downloads
  iframeElement.setAttribute(
    "sandbox",
    "allow-fullscreen allow-scripts allow-same-origin allow-presentation"
  );
  iframeContainer.appendChild(iframeElement);

  // Display series name, episode name, synopsis, and buttons after the iframe
  const detailsAfterIframe = document.createElement("div");
  detailsAfterIframe.className = "mt-6 p-4 rounded-lg shadow-lg"; // Removed bg-gray-800

  // Series Name (if TV show) or Movie Title
  if (mediaType === "tv" && mediaDetails.series_name) {
    const seriesNameElement = document.createElement("h2");
    seriesNameElement.className = "text-base font-bold text-orange-500 mb-2"; // Changed from text-lg to text-base
    seriesNameElement.textContent = mediaDetails.series_name;
    detailsAfterIframe.appendChild(seriesNameElement);
  } else if (mediaType === "movie" && mediaDetails.title) {
    const movieTitleElement = document.createElement("h2");
    movieTitleElement.className = "text-base font-bold text-orange-500 mb-2";
    movieTitleElement.textContent = mediaDetails.title;
    detailsAfterIframe.appendChild(movieTitleElement);
  }

  // Attach the event listener here, after the title has been set
  reportIssueButton.addEventListener("click", () => {
    if (currentServerUrl && currentLanguage && currentServerName) {
      showReportIssueModal(
        mediaDetails,
        mediaType, // Pass mediaType
        localServersDb,
        currentLanguage,
        currentServerName,
        currentServerUrl,
        localDownloadServersDb // Pass localDownloadServersDb
      );
    } else {
      console.warn("Missing server information for reporting an issue.");
    }
  });

  // Episode Name (if TV show and episode details exist)
  if (mediaType === "tv" && mediaDetails.episode_name) {
    const episodeNameElement = document.createElement("h3");
    episodeNameElement.className = "text-sm font-semibold text-white mb-3"; // Changed from text-base to text-sm
    episodeNameElement.textContent = `T${mediaDetails.season_number} E${mediaDetails.episode_number} - ${mediaDetails.episode_name}`;
    detailsAfterIframe.appendChild(episodeNameElement);
  }

  // Synopsis
  const synopsisElement = document.createElement("p");
  synopsisElement.className = "text-xs text-gray-300 leading-relaxed mb-6";
  synopsisElement.textContent =
    mediaDetails.episode_overview ||
    mediaDetails.overview ||
    "Sinopsis no disponible.";
  detailsAfterIframe.appendChild(synopsisElement);

  // Buttons Container for TV shows
  if (mediaType === "tv") {
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className =
      "flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4";
    detailsAfterIframe.appendChild(buttonsContainer);

    // All Episodes Button
    const allEpisodesButton = document.createElement("button");
    allEpisodesButton.className =
      "bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center";
    allEpisodesButton.innerHTML = `<i class="fas fa-list-ul mr-2"></i> Todos los Episodios`;
    buttonsContainer.appendChild(allEpisodesButton);

    allEpisodesButton.addEventListener("click", () => {
      window.location.href = `go:${mediaId}`;
    });

    // Next Episode Button
    const nextEpisodeButton = document.createElement("button");
    nextEpisodeButton.className =
      "bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center";
    nextEpisodeButton.innerHTML = `<i class="fas fa-forward mr-2"></i> Siguiente Episodio`;
    buttonsContainer.appendChild(nextEpisodeButton);

    if (nextEpisodeUrl) {
      nextEpisodeButton.addEventListener("click", () => {
        window.location.href = nextEpisodeUrl;
      });
    }

    // Previous Episode Button
    const previousEpisodeButton = document.createElement("button");
    previousEpisodeButton.className =
      "bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center";
    previousEpisodeButton.innerHTML = `<i class="fas fa-backward mr-2"></i> Episodio Anterior`;
    buttonsContainer.insertBefore(
      previousEpisodeButton,
      allEpisodesButton.nextSibling
    ); // Insert after All Episodes button

    if (hasPreviousEpisode && previousEpisodeUrl) {
      previousEpisodeButton.addEventListener("click", () => {
        window.location.href = previousEpisodeUrl;
      });
    } else {
      previousEpisodeButton.classList.add("hidden"); // Hide the button
      previousEpisodeButton.disabled = true;
    }
  }

  contentWrapper.appendChild(detailsAfterIframe);

  // Activate the first language tab by default
  if (tabsHeader.firstElementChild) {
    tabsHeader.firstElementChild.click();
  }

  movieDetailContainer.appendChild(contentWrapper);

  return movieDetailContainer;
}
