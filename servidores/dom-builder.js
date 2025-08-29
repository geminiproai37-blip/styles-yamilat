import {
  fetchMediaDetails,
  fetchCast,
  fetchMediaVideos,
  fetchTvSeasonDetails,
  fetchEpisodeDetails,
} from "./script.js";

export function buildHeader() {
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
    window.location.href = "go:home";
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
  localServersDb, // New parameter
  openInWebVideoCaster, // New parameter (reverted name)
  showExternalPlayerModal // New parameter
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

  const transmitButton = document.createElement("button");
  transmitButton.id = "transmit-button"; // Add ID for easier targeting
  transmitButton.className =
    "bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200";
  transmitButton.innerHTML = `<i class="fab fa-chromecast"></i>`;
  playerButtonsContainer.appendChild(transmitButton);

  transmitButton.addEventListener("click", () => {
    if (currentServerUrl) {
      openInWebVideoCaster(currentServerUrl); // Use the reverted function name
    } else {
      console.warn("No server URL selected for transmission.");
    }
  });

  const externalPlayerButton = document.createElement("button");
  externalPlayerButton.id = "external-player-button"; // Add ID for easier targeting
  externalPlayerButton.className =
    "bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors duration-200";
  externalPlayerButton.innerHTML = `<i class="fas fa-play-circle"></i>`;
  playerButtonsContainer.appendChild(externalPlayerButton);

  externalPlayerButton.addEventListener("click", () => {
    if (currentServerUrl) {
      showExternalPlayerModal(currentServerUrl);
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

  for (const lang in localServersDb) {
    // Use localServersDb instead of serverData
    const langButton = document.createElement("button");
    langButton.className =
      "py-1 px-2 text-xs font-semibold text-gray-400 border-b-2 border-transparent hover:text-orange-500 hover:border-orange-500 focus:outline-none transition-colors duration-200 flex items-center space-x-1 flex-shrink-0 w-1/3"; // Smaller padding, text, and space, added flex-shrink-0 and w-1/3 for max 3 on screen

    const flagCode = localServersDb[lang].flagCode; // Use localServersDb

    langButton.innerHTML = `
      <span class="fi fi-${flagCode} mr-2"></span>
      <span>${lang}</span>
    `;
    tabsHeader.appendChild(langButton);

    langButton.addEventListener("click", () => {
      // Deactivate previous tab
      if (activeLanguageTab) {
        activeLanguageTab.classList.remove(
          "text-orange-500",
          "border-orange-500"
        );
        activeLanguageTab.classList.add("text-gray-400", "border-transparent");
      }

      // Activate current tab
      langButton.classList.add("text-orange-500", "border-orange-500");
      langButton.classList.remove("text-gray-400", "border-transparent");
      activeLanguageTab = langButton;

      // Clear previous server buttons and reset active server button
      serversContentContainer.innerHTML = "";
      let activeServerButton = null;

      // Create new server buttons for the selected language
      const serverButtonsWrapper = document.createElement("div");
      serverButtonsWrapper.className = "flex flex-wrap gap-2";
      serversContentContainer.appendChild(serverButtonsWrapper);

      localServersDb[lang].servers.forEach((server) => {
        // Use localServersDb
        const serverButton = document.createElement("button");
        serverButton.className =
          "bg-gray-700 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-1"; // Smaller padding, text, and added flex for icon
        serverButton.innerHTML = `
          <i class="fas fa-server mr-1"></i>
          <span>${server.name}</span>
        `;
        serverButtonsWrapper.appendChild(serverButton);

        serverButton.addEventListener("click", () => {
          // Deactivate previous server button
          if (activeServerButton) {
            activeServerButton.classList.remove(
              "bg-orange-600",
              "hover:bg-orange-700"
            );
            activeServerButton.classList.add(
              "bg-gray-700",
              "hover:bg-gray-600"
            );
          }

          // Activate current server button
          serverButton.classList.add("bg-orange-600", "hover:bg-orange-700");
          serverButton.classList.remove("bg-gray-700", "hover:bg-gray-600");
          activeServerButton = serverButton;
          currentServerUrl = server.url; // Store the selected server URL

          iframeElement.src = server.url;
          iframeContainer.classList.remove("hidden"); // Ensure iframe is visible
        });
      });

      // Automatically click the first server button of the active language tab
      if (serverButtonsWrapper.firstElementChild) {
        serverButtonsWrapper.firstElementChild.click();
      }
    });
  }

  // Create and append iframe container and element outside the dynamic content area
  const iframeContainer = document.createElement("div");
  iframeContainer.id = "iframe-container";
  iframeContainer.className =
    "w-full aspect-video bg-gray-800 rounded-lg overflow-hidden mt-4 hidden"; // Initially hidden
  contentWrapper.appendChild(iframeContainer);

  const iframeElement = document.createElement("iframe");
  iframeElement.id = "media-iframe";
  iframeElement.className = "w-full h-full";
  iframeElement.setAttribute("allowfullscreen", "");
  iframeElement.setAttribute("frameborder", "0");
  iframeElement.setAttribute("scrolling", "no");
  iframeContainer.appendChild(iframeElement);

  // Display series name, episode name, synopsis, and buttons after the iframe
  const detailsAfterIframe = document.createElement("div");
  detailsAfterIframe.className = "mt-6 p-4 rounded-lg shadow-lg"; // Removed bg-gray-800

  // Series Name (if TV show)
  if (mediaType === "tv" && mediaDetails.series_name) {
    const seriesNameElement = document.createElement("h2");
    seriesNameElement.className = "text-base font-bold text-orange-500 mb-2"; // Changed from text-lg to text-base
    seriesNameElement.textContent = mediaDetails.series_name;
    detailsAfterIframe.appendChild(seriesNameElement);
  }

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

  // Buttons Container
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

  if (allEpisodesUrl) {
    allEpisodesButton.addEventListener("click", () => {
      window.location.href = allEpisodesUrl;
    });
  }

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

  contentWrapper.appendChild(detailsAfterIframe);

  // Activate the first language tab by default
  if (tabsHeader.firstElementChild) {
    tabsHeader.firstElementChild.click();
  }

  movieDetailContainer.appendChild(contentWrapper);

  return movieDetailContainer;
}
