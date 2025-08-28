import { tmdbApiKey } from "./config.js";
import { renderPage } from "./render.js"; // Import the renderPage function
import { initializeWebVideoCaster } from "./webvideo_caster_enhancements.js"; // Import the new functionality

document.addEventListener("DOMContentLoaded", () => {
  renderPage(); // Render the HTML content
  const serverData = window.serverData; // Access serverData from the global scope
  const languageTabsNav = document.getElementById("language-tabs-nav");
  const serverButtonsContainer = document.getElementById(
    "server-buttons-container"
  );
  const videoPlayerContainer = document.getElementById(
    "video-player-container"
  );
  const videoIframe = document.getElementById("video-iframe");
  const tabsSection = document.getElementById("tabs-section");
  const movieDetailsContainer = document.getElementById(
    "movie-details-container"
  );
  const loaderContainer = document.getElementById("loader-container");

  const episodeNameEl = document.getElementById("episode-name");
  const episodeNumberEl = document.getElementById("episode-number");
  const episodeOverviewEl = document.getElementById("episode-overview"); // New element for synopsis

  const messageModal = document.getElementById("message-modal");
  const messageTitleEl = document.getElementById("message-title");
  const messageTextEl = document.getElementById("message-text");
  const closeMessageBtn = document.getElementById("close-message-btn");

  const viewAllChaptersBtn = document.getElementById("view-all-chapters-btn");
  const nextChapterBtn = document.getElementById("next-chapter-btn");
  const castBtnGlobal = document.getElementById("cast-btn-global"); // Global cast button
  const backButtonHeader = document.getElementById("back-button-header"); // Get the back button by its ID

  let currentServerUrl = ""; // Variable to store the URL of the currently selected server
  let currentEpisodeData = {
    tmdb_id: window.tmdbId,
    season_number: window.seasonNumber, // Add season number
    episode_number: window.episodeNumber,
    episode_name: "Cargando...",
  }; // Object to store current episode data

  // Function to show the custom message modal
  function showMessage(title, message) {
    messageTitleEl.innerHTML = title; // Use innerHTML to allow for custom HTML in title
    messageTextEl.innerHTML = message; // Use innerHTML to allow for custom HTML in message
    messageModal.classList.remove("hidden");
  }

  // Function to close the message modal
  closeMessageBtn.addEventListener("click", () => {
    messageModal.classList.add("hidden");
  });

  // Function to get the flag URL from a real API
  function getFlagUrl(countryCode) {
    // Replaces 'US' with the country code. 'flat' is the style and '64.png' the size.
    return `https://flagsapi.com/${countryCode.toUpperCase()}/flat/64.png`;
  }

  // Function to render server buttons for a given language
  function renderServerButtons(language) {
    serverButtonsContainer.innerHTML = "";
    const servers = serverData[language]?.servers;

    if (!servers || servers.length === 0) {
      showMessage("Error", "No hay servidores disponibles para este idioma.");
      return;
    }

    servers.forEach((server, index) => {
      const button = document.createElement("button");
      button.className =
        "flex-shrink-0 bg-gray-800 text-white font-bold py-0.5 px-1 rounded-lg hover:bg-gray-700 transition shadow-lg text-xs server-button inline-flex items-center justify-center"; // Adjusted to fit text content and be inline-flex

      // Replaces the flag image with a server icon
      button.innerHTML = `
        <i class="fas fa-server mr-0.5"></i>
        <span class="whitespace-nowrap overflow-hidden text-ellipsis">${server.name}</span>
      `;

      button.addEventListener("click", () => {
        // Remove active class from all server buttons and reset text/icon color
        document.querySelectorAll(".server-button").forEach((btn) => {
          btn.classList.remove("bg-orange-600", "hover:bg-orange-700");
          btn.classList.add("bg-gray-800", "hover:bg-gray-700");
          btn.querySelector("i").classList.remove("text-white");
          btn.querySelector("i").classList.add("text-orange-500");
          btn.querySelector("span").classList.remove("text-white");
        });

        // Add active class to the clicked button and set text/icon color to white
        button.classList.remove("bg-gray-800", "hover:bg-gray-700");
        button.classList.add("bg-orange-600", "hover:bg-orange-700");
        button.querySelector("i").classList.remove("text-orange-500");
        button.querySelector("i").classList.add("text-white");
        button.querySelector("span").classList.add("text-white");

        // Conditionally apply the sandbox attribute
        if (server.isSandboxed) {
          videoIframe.setAttribute(
            "sandbox",
            "allow-scripts allow-same-origin"
          );
        } else {
          videoIframe.removeAttribute("sandbox");
        }

        videoIframe.src = server.url;
        currentServerUrl = server.url; // Update the current server URL
        movieDetailsContainer.classList.remove("hidden"); // Ensure movie details are visible
      });
      serverButtonsContainer.appendChild(button);

      // Automatically click the first server button to set it as active and load its video
      if (index === 0) {
        button.click();
      }
    });
  }

  // Function to initialize the language tabs
  async function initializeTabs() {
    const languages = Object.keys(serverData);
    if (languages.length > 0) {
      languageTabsNav.innerHTML = "";
      const initialTab = languages[0];

      // Render the tabs
      for (const lang of languages) {
        const button = document.createElement("button");
        button.id = `tab-${lang}`;
        button.className = `tab-link whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition flex items-center space-x-1 text-gray-400 border-transparent hover:border-gray-500 hover:text-gray-300`; // Adjusted for mobile

        const flagUrl = getFlagUrl(serverData[lang]?.flagCode);
        button.innerHTML = `
          <img src="${flagUrl}" alt="Bandera de ${lang}" class="h-4 w-auto rounded-sm" onerror="this.onerror=null;this.src='https://placehold.co/24x16/374151/FFFFFF?text=?'">
          <span>${lang}</span>
        `;
        button.addEventListener("click", () => {
          document
            .querySelectorAll("#language-tabs-nav .tab-link")
            .forEach((t) => {
              t.classList.remove("active", "text-orange-500");
              t.classList.add("text-gray-400", "border-transparent");
            });

          button.classList.add("active", "text-orange-500");
          button.classList.remove("text-gray-400", "border-transparent");

          renderServerButtons(lang);
        });
        languageTabsNav.appendChild(button);
      }

      // Activate the first tab by default
      const firstTab = document.getElementById(`tab-${initialTab}`);
      if (firstTab) {
        firstTab.classList.add("active", "text-orange-500");
        firstTab.classList.remove("text-gray-400", "border-transparent");
      }

      // Render the buttons of the first language when the page loads
      renderServerButtons(initialTab);

      // The first server's video is now loaded by the click event in renderServerButtons
    } else {
      showMessage("Error", "No se encontraron idiomas disponibles.");
    }
  }

  // Call functions to load content and tabs
  async function loadPageContent() {
    // Fetch episode details from TMDB
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${window.tmdbId}/season/${window.seasonNumber}/episode/${window.episodeNumber}?api_key=${tmdbApiKey}&language=es-ES`
      );
      const data = await response.json();
      // Ensure data.name and data.episode_number are not undefined
      const episodeName = data.name || "No disponible";
      const episodeNum = data.episode_number || window.episodeNumber; // Use default if API returns undefined
      const episodeOverview = data.overview || "Sinopsis no disponible."; // Get synopsis

      episodeNameEl.textContent = `Nombre de Episodio: ${episodeName}`;
      episodeNumberEl.textContent = `Número de Episodio: ${episodeNum}`;
      episodeOverviewEl.textContent = `Sinopsis: ${episodeOverview}`; // Update synopsis

      // Update currentEpisodeData with fetched data for other buttons
      currentEpisodeData.tmdb_id = window.tmdbId;
      currentEpisodeData.season_number = window.seasonNumber; // Update season number
      currentEpisodeData.episode_number = episodeNum;
      currentEpisodeData.episode_name = episodeName;
    } catch (error) {
      console.error("Error fetching TMDB episode data:", error);
      episodeNameEl.textContent = "Nombre de Episodio: No disponible";
      episodeNumberEl.textContent = "Número de Episodio: No disponible";
      episodeOverviewEl.textContent = "Sinopsis: No disponible."; // Set default synopsis on error
      // Ensure currentEpisodeData still has valid numbers even on error
      currentEpisodeData.tmdb_id = window.tmdbId;
      currentEpisodeData.season_number = window.seasonNumber;
      currentEpisodeData.episode_number = window.episodeNumber;
      currentEpisodeData.episode_name = "No disponible";
    }

    initializeTabs();
  }

  loadPageContent();

  // Event listeners for new buttons
  viewAllChaptersBtn.addEventListener("click", () => {
    window.open(`go:${currentEpisodeData.tmdb_id}`, "_blank");
  });

  nextChapterBtn.addEventListener("click", () => {
    const nextEpisodeNumber = parseInt(currentEpisodeData.episode_number) + 1;
    window.open(
      `go:${currentEpisodeData.tmdb_id}S${currentEpisodeData.season_number}E${nextEpisodeNumber}`,
      "_blank"
    );
  });

  backButtonHeader.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default link behavior
    window.open("go:home", "_blank");
  });

  // Add click event listener to episodeNameEl
  episodeNameEl.addEventListener("click", () => {
    window.open(`go:${currentEpisodeData.tmdb_id}`, "_blank");
  });

  // Initialize Web Video Caster functionality
  initializeWebVideoCaster(
    castBtnGlobal,
    () => currentServerUrl, // Pass a function to get the currentServerUrl
    showMessage
  );

  const externalPlayerBtn = document.getElementById("external-player-btn");
  externalPlayerBtn.addEventListener("click", () => {
    if (currentServerUrl) {
      showMessage(
        "Reproducir en",
        `
        <div class="flex flex-col space-y-4 mt-4">
          <button id="mxplayer-btn" class="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition w-full">MX Player</button>
          <button id="vlc-btn" class="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition w-full">VLC</button>
        </div>
        `
      );

      document.getElementById("mxplayer-btn").addEventListener("click", () => {
        const mxPlayerUrl = `intent:${encodeURIComponent(
          currentServerUrl
        )}#Intent;package=com.mxtech.videoplayer.ad;S.title=${encodeURIComponent(
          currentEpisodeData.episode_name
        )};end`;
        window.open(mxPlayerUrl, "_blank");
        messageModal.classList.add("hidden");
      });

      document.getElementById("vlc-btn").addEventListener("click", () => {
        const vlcUrl = `intent:${encodeURIComponent(
          currentServerUrl
        )}#Intent;package=org.videolan.vlc;S.title=${encodeURIComponent(
          currentEpisodeData.episode_name
        )};end`;
        window.open(vlcUrl, "_blank");
        messageModal.classList.add("hidden");
      });
    } else {
      showMessage(
        "Error",
        "No hay video reproduciéndose para reproducir externamente."
      );
    }
  });
});
