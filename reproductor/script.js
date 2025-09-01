// Edita este objeto para cambiar el contenido que se carga por defecto.

import { buildPlayerHTML } from "./dom_builder.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOMContentLoaded event fired.");
  console.log("contentConfig:", window.contentConfig); // Debug: Check contentConfig

  // Inject the HTML content
  // Access contentConfig from the global scope (defined in index.html)
  document.body.innerHTML = buildPlayerHTML(contentConfig);

  console.log(
    "After innerHTML assignment. Checking report-form directly:",
    document.getElementById("report-form")
  ); // Debug: Check report-form immediately after injection

  // --- OBTENER ELEMENTOS DEL DOM ---
  // Moved after HTML injection to ensure elements are available
  const dom = {
    wrapper: document.getElementById("player-wrapper"),
    video: document.getElementById("video-element"),
    iframe: document.getElementById("iframe-element"),
    poster: document.getElementById("poster-bg"),
    loader: document.getElementById("loader"),
    controls: document.getElementById("controls-overlay"),
    centerPlayControls: document.querySelector(".center-play-controls"),
    playPauseBtn: document.getElementById("play-pause-btn"),
    timeline: document.getElementById("timeline"),
    currentTime: document.getElementById("current-time"),
    duration: document.getElementById("duration"),
    fullscreenBtn: document.getElementById("fullscreen-btn"),
    rewindBtn: document.getElementById("rewind-btn"),
    forwardBtn: document.getElementById("forward-btn"),
    backBtn: document.getElementById("back-btn"),
    prevEpisodeBtn: document.getElementById("prev-episode-btn"),
    nextEpisodeBtn: document.getElementById("next-episode-btn"),
    langSelect: document.getElementById("lang-select"), // Reference to the language select
    serversSelect: document.getElementById("servers-select"), // Reference to the servers select
    popups: {
      episodes: document.getElementById("episodes-popup"),
      report: document.getElementById("report-popup"), // New: Report popup
      downloadServers: document.getElementById("download-servers-popup"), // New: Download Servers popup
    },
    closePopupBtns: document.querySelectorAll(".close-popup-btn"), // Botones para cerrar popups
    title: document.getElementById("episode-title-display"),
    openExternalBtn: document.getElementById("open-external-btn"),
    downloadBtn: document.getElementById("download-btn"),
    bottomBar: document.querySelector(".bottom-bar"), // Add reference to bottom bar
    reportBtn: document.getElementById("report-btn"), // New: Report button
    skipIntroContainer: document.getElementById("skip-intro-container"), // New: Skip intro container
    skipIntroBtn: document.getElementById("skip-intro-button"), // New: Skip intro button
    // Report form elements
    reportForm: document.getElementById("report-form"),
    reportIssueType: document.getElementById("report-issue-type"), // New: Report issue type select
    reportDescription: document.getElementById("report-description"), // New: Report description textarea
    reportServerSelect: document.getElementById("report-server"),
    reportLanguageSelect: document.getElementById("report-language"),
    reportTypeStreaming: document.getElementById("report-type-streaming"),
    reportTypeDownload: document.getElementById("report-type-download"),
    reportChatId: document.getElementById("report-chat-id"),
    reportToken: document.getElementById("report-token"),
    reportTopic: document.getElementById("report-topic"),
    // Download popup elements
    downloadServerSelect: document.getElementById("download-server-select"),
    startDownloadBtn: document.getElementById("start-download-btn"),
  };

  console.log("dom.reportForm:", dom.reportForm); // Debug line
  console.log("dom.reportServerSelect:", dom.reportServerSelect); // Debug line

  // Initialize continue watching modal
  window.initContinueWatchingModal(dom.video, getContentKey(contentConfig));

  // Import functions from external_handler.js
  const { showExternalPlayerModal, sendTelegramReport } = await import(
    "./external_handler.js"
  );

  // --- 1. CONFIGURACIÓN PRINCIPAL ---
  // IMPORTANTE: Reemplaza 'TU_API_KEY_DE_TMDB' con tu propia clave.
  const TMDB_API_KEY = "b619bab44d405bb6c49b14dfc7365b51";

  // --- ESTADO Y CONFIGURACIÓN ---
  let controlsTimeout;
  let currentServer = null; // To keep track of the currently loaded server
  let currentLanguage = "es"; // Default language
  let playerInitialized = false; // New flag to track if player has been initialized
  let currentEpisodeTitle = ""; // Store the actual episode title
  let currentSeriesName = ""; // Store the series name
  let currentSeasonNumber = ""; // Store the season number
  let currentEpisodeNumber = ""; // Store the episode number
  let currentContentSynopsis = ""; // Store the content synopsis
  let currentContentPosterUrl = ""; // Store the content poster URL

  // --- FUNCIONES PRINCIPALES ---

  // Helper function to get accurate video duration, acting as a small "library"
  const getAccurateVideoDuration = (videoElement) => {
    return new Promise((resolve) => {
      if (isFinite(videoElement.duration) && videoElement.duration > 0) {
        resolve(videoElement.duration);
        return;
      }

      const checkDuration = () => {
        if (isFinite(videoElement.duration) && videoElement.duration > 0) {
          resolve(videoElement.duration);
        } else {
          // Retry after a short delay if duration is not yet available
          setTimeout(checkDuration, 100);
        }
      };

      // Listen for metadata and duration changes
      videoElement.addEventListener("loadedmetadata", checkDuration, {
        once: true,
      });
      videoElement.addEventListener("durationchange", checkDuration, {
        once: true,
      });

      // Fallback: Start checking after a small initial delay in case events are missed or slow
      setTimeout(checkDuration, 500);
    });
  };

  // Helper function to parse time strings (e.g., "2m", "1h30m") into seconds
  const parseTimeToSeconds = (timeString) => {
    if (typeof timeString === "number") {
      return timeString; // Already in seconds
    }
    if (typeof timeString !== "string") {
      return 0; // Invalid input
    }

    let totalSeconds = 0;
    const hoursMatch = timeString.match(/(\d+)h/);
    const minutesMatch = timeString.match(/(\d+)m/);
    const mmssMatch = timeString.match(/(\d+):(\d+)/); // New: MM:SS format

    if (hoursMatch) {
      totalSeconds += parseInt(hoursMatch[1]) * 3600;
    }
    if (minutesMatch) {
      totalSeconds += parseInt(minutesMatch[1]) * 60;
    } else if (mmssMatch) {
      // If MM:SS format, parse minutes and seconds
      totalSeconds += parseInt(mmssMatch[1]) * 60; // Minutes
      totalSeconds += parseInt(mmssMatch[2]); // Seconds
    }
    return totalSeconds;
  };

  function getContentKey(config) {
    if (config.type === "tv") {
      return `${config.tmdbId}-${config.season}-${config.episode}`;
    }
    return config.tmdbId;
  }

  async function fetchContentData() {
    console.log("Fetching content data...");
    if (TMDB_API_KEY === "TU_API_KEY_DE_TMDB") {
      dom.title.textContent = "Error: Configura tu API Key de TMDb";
      console.error("TMDb API Key not configured.");
      return;
    }

    let url, data;
    try {
      if (contentConfig.type === "tv") {
        url = `https://api.themoviedb.org/3/tv/${contentConfig.tmdbId}/season/${contentConfig.season}/episode/${contentConfig.episode}?api_key=${TMDB_API_KEY}&language=es-ES`;
        const response = await fetch(url);
        data = await response.json();
        currentEpisodeTitle = `${data.episode_number}. ${data.name}`; // Store the title
        dom.title.textContent = currentEpisodeTitle;
        if (data.still_path) {
          dom.poster.style.backgroundImage = `url(https://image.tmdb.org/t/p/w780${data.still_path})`;
        }

        // Fetch series details for synopsis and main poster
        const seriesUrl = `https://api.themoviedb.org/3/tv/${contentConfig.tmdbId}?api_key=${TMDB_API_KEY}&language=es-ES`;
        const seriesResponse = await fetch(seriesUrl);
        const seriesData = await seriesResponse.json();
        currentSeriesName = seriesData.name; // Store series name
        currentSeasonNumber = contentConfig.season; // Store season number
        currentEpisodeNumber = contentConfig.episode; // Store episode number
        currentContentSynopsis =
          seriesData.overview || "Sinopsis no disponible.";
        currentContentPosterUrl = seriesData.poster_path
          ? `https://image.tmdb.org/t/p/w500${seriesData.poster_path}`
          : seriesData.backdrop_path
          ? `https://image.tmdb.org/t/p/w500${seriesData.backdrop_path}`
          : "N/A";
      } else {
        // movie
        url = `https://api.themoviedb.org/3/movie/${contentConfig.tmdbId}?api_key=${TMDB_API_KEY}&language=es-ES`;
        const response = await fetch(url);
        data = await response.json();
        currentEpisodeTitle = data.title; // Store the title
        dom.title.textContent = currentEpisodeTitle;
        if (data.backdrop_path) {
          dom.poster.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${data.backdrop_path})`;
        }
        currentSeriesName = data.title; // For movies, series name is the movie title
        currentSeasonNumber = "N/A"; // Not applicable for movies
        currentEpisodeNumber = "N/A"; // Not applicable for movies
        currentContentSynopsis = data.overview || "Sinopsis no disponible.";
        currentContentPosterUrl = data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : data.backdrop_path
          ? `https://image.tmdb.org/t/p/w500${data.backdrop_path}`
          : "N/A";
      }
      console.log("Content data fetched successfully:", data);
      console.log("Series Name:", currentSeriesName);
      console.log("Season Number:", currentSeasonNumber);
      console.log("Episode Number:", currentEpisodeNumber);
      console.log("Synopsis:", currentContentSynopsis);
      console.log("Poster URL:", currentContentPosterUrl);
    } catch (error) {
      console.error("Error fetching TMDb data:", error);
      dom.title.textContent = "Error al cargar datos";
    }
  }

  // Helper para obtener el código de país y el nombre completo del idioma
  function getLanguageInfo(langCode) {
    const langInfoMap = {
      es: { country: "ES", name: "Español" },
      en: { country: "US", name: "English" }, // Usamos US para English, puedes cambiar a GB si prefieres
      // Añade más mapeos según sea necesario
    };
    return (
      langInfoMap[langCode.toLowerCase()] || {
        country: langCode.toUpperCase(),
        name: langCode.toUpperCase(),
      }
    ); // Fallback
  }

  // Nueva función para poblar las opciones de idioma en el select
  function populateLanguageOptions() {
    dom.langSelect.innerHTML = ""; // Clear existing options
    for (const langCode in window.languageServers) {
      const langInfo = getLanguageInfo(langCode);
      const option = document.createElement("option");
      option.value = langCode;
      option.textContent = langInfo.name;
      if (langCode === currentLanguage) {
        option.selected = true;
      }
      dom.langSelect.appendChild(option);
    }
  }

  // Nueva función para poblar las opciones de servidor para un idioma específico en el select
  function populateServersByLanguage(langCode) {
    dom.serversSelect.innerHTML = ""; // Limpiar opciones existentes
    const servers = window.languageServers[langCode] || [];

    if (servers.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No hay servidores disponibles";
      option.disabled = true;
      dom.serversSelect.appendChild(option);
      dom.serversSelect.disabled = true;
      handleServerSelection(null); // No server selected
      return;
    }

    dom.serversSelect.disabled = false;
    servers.forEach((server) => {
      const option = document.createElement("option");
      option.value = server.url;
      option.textContent = server.name;
      option.dataset.mp4 = server.mp4; // Store mp4 type in dataset
      if (currentServer && currentServer.url === server.url) {
        option.selected = true;
      }
      dom.serversSelect.appendChild(option);
    });

    // Automatically select the first server if none is currently selected or if the current one is not in the new list
    if (!currentServer || !servers.some((s) => s.url === currentServer.url)) {
      handleServerSelection(servers[0]);
    } else {
      // If currentServer is still valid, ensure the select reflects it
      dom.serversSelect.value = currentServer.url;
    }
  }

  // Manejador para la selección de idioma
  function handleLanguageSelection(langCode) {
    currentLanguage = langCode;
    populateServersByLanguage(currentLanguage);
  }

  // Manejador para la selección de servidor
  function handleServerSelection(server) {
    if (server) {
      loadSource(server);
    } else {
      // Handle case where no server is available or selected
      dom.loader.innerHTML = "<p>No hay servidor seleccionado.</p>";
      dom.loader.classList.remove("hidden");
      stopPlayback(); // Stop any ongoing playback
    }
  }

  function loadSource(server) {
    console.log("Loading source:", server.name);
    dom.loader.classList.remove("hidden"); // Always show loader when loading new source
    dom.poster.classList.remove("hidden"); // Always show poster when loading new source
    hideAllPopups();

    const urlToLoad = server.url; // Use direct URL
    console.log("URL to load:", urlToLoad);

    if (server.mp4) {
      dom.video.src = urlToLoad;
      dom.video.classList.remove("hidden");
      dom.iframe.classList.add("hidden");
      dom.iframe.src = "about:blank"; // Clear iframe src
      dom.timeline.classList.remove("hidden"); // Show timeline for MP4
      dom.fullscreenBtn.classList.remove("hidden"); // Show fullscreen button for MP4
      dom.centerPlayControls.classList.remove("hidden"); // Show center play controls for MP4
      dom.video.load(); // Explicitly load the video
      dom.wrapper.classList.remove("iframe-active"); // Remove iframe-active class
      dom.bottomBar.classList.remove("hidden"); // Ensure bottom bar is visible for MP4 initially
      console.log("MP4 video source set.");
      // Ensure video always fills the screen
      dom.video.style.width = "100%";
      dom.video.style.height = "100%";
      dom.video.style.objectFit = "cover";
      dom.video.style.position = "absolute";
      dom.video.style.top = "0";
      dom.video.style.left = "0";
      dom.video.style.transform = "none";
    } else {
      dom.iframe.src = urlToLoad;
      dom.iframe.classList.remove("hidden");
      dom.video.classList.add("hidden");
      dom.video.src = ""; // Clear video src
      dom.loader.classList.add("hidden"); // Hide loader immediately for iframes
      dom.timeline.classList.add("hidden"); // Hide timeline for iframe
      dom.centerPlayControls.classList.add("hidden"); // Hide center play controls for iframe
      dom.wrapper.classList.add("iframe-active"); // Add iframe-active class
      dom.bottomBar.classList.remove("hidden"); // Ensure bottom bar is visible for iframes
      console.log("Iframe source set.");
    }
    currentServer = server; // Store the currently loaded server
    dom.controls.classList.remove("hidden"); // Ensure controls are visible after loading source
    dom.bottomBar.classList.remove("hidden"); // Ensure bottom bar is visible after loading source
    clearTimeout(controlsTimeout); // Clear any existing timeout
    if (!dom.video.paused) {
      // Only set timeout if video is playing
      controlsTimeout = setTimeout(hideControls, 3000);
    }
    updateSkipIntroButtonVisibility(); // Update visibility after loading new source
  }

  // New function to manage skip intro button visibility
  function updateSkipIntroButtonVisibility() {
    const { introStartTime, introEndTime } = window.contentConfig;
    const introEndTimeInSeconds = parseTimeToSeconds(introEndTime); // Convert to seconds
    const isMp4 = currentServer && currentServer.mp4;
    const currentTime = dom.video.currentTime;

    console.log(
      "updateSkipIntroButtonVisibility:",
      "introStartTime:",
      introStartTime,
      "introEndTime:",
      introEndTime,
      "introEndTimeInSeconds:",
      introEndTimeInSeconds,
      "currentTime:",
      currentTime
    );

    if (
      isMp4 &&
      introStartTime !== undefined &&
      introEndTimeInSeconds !== undefined &&
      currentTime >= introStartTime &&
      currentTime < introEndTimeInSeconds
    ) {
      dom.skipIntroContainer.classList.add("active");
      dom.skipIntroBtn.textContent = "Omitir Intro"; // Removed time from button text
    } else {
      dom.skipIntroContainer.classList.remove("active");
      dom.skipIntroBtn.textContent = "Omitir Intro"; // Reset text when not active
    }
  }

  // Event listener for the skip intro button
  dom.skipIntroBtn.addEventListener("click", () => {
    const introEndTimeValue = window.contentConfig.introEndTime;
    if (introEndTimeValue !== undefined) {
      const introEndTimeInSeconds = parseTimeToSeconds(introEndTimeValue); // Convert to seconds
      console.log(
        "Skip intro button clicked. Attempting to skip to:",
        introEndTimeInSeconds,
        "Current video time:",
        dom.video.currentTime
      ); // Debug: Log introEndTime and current time
      dom.video.currentTime = introEndTimeInSeconds;
      dom.skipIntroContainer.classList.remove("active"); // Hide button after skipping
    }
  });

  window.changeEpisode = (newEpisode) => {
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set("e", newEpisode);
    window.location.href = currentUrl.href;
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
    const totalSeconds = Math.floor(timeInSeconds);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    } else {
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    }
  };
  const hideControls = () => {
    // If iframe is active, controls should always be visible, so do not hide them.
    if (dom.wrapper.classList.contains("iframe-active")) {
      return;
    }

    // Check if any popup is currently visible OR if a select element has focus
    const anyPopupOpen = Object.values(dom.popups).some(
      (popup) => !popup.classList.contains("hidden")
    );
    const selectHasFocus =
      document.activeElement === dom.langSelect ||
      document.activeElement === dom.serversSelect ||
      document.activeElement === dom.downloadServerSelect ||
      document.activeElement === dom.reportServerSelect ||
      document.activeElement === dom.reportLanguageSelect;

    if (anyPopupOpen || selectHasFocus) {
      // If a popup is open, or a select has focus, don't hide controls
      clearTimeout(controlsTimeout); // Ensure timeout is cleared
      controlsTimeout = setTimeout(hideControls, 3000); // Re-schedule check
      return;
    }

    // Check if intro is currently active
    const { introStartTime, introEndTime } = window.contentConfig;
    const introEndTimeInSeconds = parseTimeToSeconds(introEndTime);
    const isIntroActive =
      currentServer &&
      currentServer.mp4 &&
      introStartTime !== undefined &&
      introEndTimeInSeconds !== undefined &&
      dom.video.currentTime >= introStartTime &&
      dom.video.currentTime < introEndTimeInSeconds;

    dom.controls.classList.add("hidden");
    dom.bottomBar.classList.add("hidden"); // Hide bottom bar

    // Always hide the skip intro button when controls are hidden.
    // Its visibility will be re-evaluated by updateSkipIntroButtonVisibility when controls are shown.
    dom.skipIntroContainer.classList.remove("active");
  };
  const showControls = () => {
    dom.controls.classList.remove("hidden");
    dom.bottomBar.classList.remove("hidden"); // Show bottom bar

    clearTimeout(controlsTimeout);
    if (!dom.video.paused) {
      // Only set timeout if video is playing
      controlsTimeout = setTimeout(hideControls, 3000);
    }
    updateSkipIntroButtonVisibility(); // Re-evaluate visibility of skip intro button
  };
  const hideAllPopups = () => {
    dom.popups.episodes.classList.add("hidden");
    dom.popups.report.classList.add("hidden"); // Hide report popup
    dom.popups.downloadServers.classList.add("hidden"); // Hide download servers popup
  };

  // Function to populate download servers dropdown
  function populateDownloadServersDropdown() {
    dom.downloadServerSelect.innerHTML = ""; // Clear existing options
    const servers = window.downloadServers[currentLanguage] || [];

    if (servers.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No hay servidores disponibles";
      option.disabled = true;
      dom.downloadServerSelect.appendChild(option);
      dom.startDownloadBtn.disabled = true;
      return;
    }

    dom.startDownloadBtn.disabled = false;
    servers.forEach((server) => {
      const option = document.createElement("option");
      option.value = server.url;
      option.textContent = server.name;
      option.dataset.type = server.type; // Store download type in dataset
      dom.downloadServerSelect.appendChild(option);
    });
  }

  // Handler for initiating download
  function handleDownloadInitiation() {
    const selectedOption =
      dom.downloadServerSelect.options[dom.downloadServerSelect.selectedIndex];
    if (!selectedOption || !selectedOption.value) {
      alert("Por favor, selecciona un servidor de descarga.");
      return;
    }

    const serverUrl = selectedOption.value;
    const serverType = selectedOption.dataset.type;
    const serverName = selectedOption.textContent;

    hideAllPopups();

    if (serverType === "mp4") {
      const a = document.createElement("a");
      a.href = serverUrl;
      a.download = `${serverName}-${contentConfig.tmdbId}-${
        contentConfig.episode || contentConfig.tmdbId
      }.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(serverUrl, "_blank");
    }
  }

  // Function to populate report dropdowns
  function populateReportDropdowns() {
    // Populate language dropdown
    dom.reportLanguageSelect.innerHTML = "";
    for (const langCode in window.languageServers) {
      const langInfo = getLanguageInfo(langCode);
      const option = document.createElement("option");
      option.value = langCode;
      option.textContent = langInfo.name;
      if (langCode === currentLanguage) {
        option.selected = true;
      }
      dom.reportLanguageSelect.appendChild(option);
    }

    // Populate server dropdown based on current language
    dom.reportServerSelect.innerHTML = "";
    const serversForCurrentLang = window.languageServers[currentLanguage] || [];
    serversForCurrentLang.forEach((server, index) => {
      const option = document.createElement("option");
      option.value = server.name; // Or a unique ID for the server
      option.textContent = server.name;
      if (currentServer && currentServer.url === server.url) {
        option.selected = true;
      }
      dom.reportServerSelect.appendChild(option);
    });
    if (serversForCurrentLang.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No hay servidores disponibles";
      dom.reportServerSelect.appendChild(option);
      dom.reportServerSelect.disabled = true;
    } else {
      dom.reportServerSelect.disabled = false;
    }
  }

  // --- EVENTOS DEL REPRODUCTOR DE VIDEO ---
  dom.video.addEventListener("loadedmetadata", async () => {
    console.log("Video loadedmetadata event fired.");
    const duration = await getAccurateVideoDuration(dom.video);
    dom.duration.textContent = formatTime(duration);
    dom.timeline.max = duration;

    const storageKey = getContentKey(contentConfig);
    const lastTime = localStorage.getItem(storageKey);
    if (lastTime) {
      const resumeTime = parseFloat(lastTime);
      if (resumeTime > 10 && resumeTime < duration - 10) {
        dom.video.pause();
        // The message is already part of the HTML for continue-watching-container
        dom.continueWatching.container.classList.add("active"); // Show continue watching container
        dom.loader.classList.add("hidden");
        console.log("Continue watching prompt shown.");
      } else {
        // If no significant resume point, attempt to autoplay
        dom.video.play().catch((error) => {
          console.error("Autoplay prevented on loadedmetadata:", error);
          // No longer setting title to "Haz clic para reproducir"
          dom.poster.classList.add("hidden"); // Hide poster
          showControls(); // Ensure controls are visible
        });
        console.log("Attempting autoplay on loadedmetadata.");
      }
    } else {
      // If no last time, attempt to autoplay
      dom.video.play().catch((error) => {
        console.error(
          "Autoplay prevented on loadedmetadata (no last time):",
          error
        );
        // No longer setting title to "Haz clic para reproducir"
        dom.poster.classList.add("hidden"); // Hide poster
        showControls(); // Ensure controls are visible
      });
      console.log("Attempting autoplay on loadedmetadata (no last time).");
    }
  });

  dom.video.addEventListener("canplay", () => {
    console.log("Video canplay event fired.");
    dom.loader.classList.add("hidden"); // Always hide loader when video is ready to play

    // Attempt to play the video
    dom.video
      .play()
      .then(() => {
        console.log("Autoplay successful on canplay.");
        dom.poster.classList.add("hidden"); // Hide poster if autoplay succeeds
        showControls(); // Ensure controls are visible
      })
      .catch((error) => {
        console.error("Autoplay prevented on canplay:", error);
        // If autoplay is prevented, show the poster and a message to prompt user interaction
        dom.poster.classList.remove("hidden"); // Show poster
        dom.title.textContent = "Haz clic para reproducir"; // Prompt user to click
        showControls(); // Ensure controls are visible for user interaction
      });
  });

  dom.video.addEventListener("loadeddata", () => {
    console.log("Video loadeddata event fired.");
    dom.loader.classList.add("hidden"); // Hide loader once enough data is loaded
  });

  dom.video.addEventListener("error", (e) => {
    const errorMsg = dom.video.error
      ? `Code: ${dom.video.error.code}, Message: ${dom.video.error.message}`
      : "Unknown error";
    console.error("Video error:", e, "MediaError:", errorMsg);
    // Instead of displaying a specific error message, just hide the loader and show the poster.
    // This allows for a more graceful fallback or silent failure as per user request.
    dom.loader.classList.add("hidden");
    dom.poster.classList.remove("hidden"); // Show poster on error
    // Optionally, display a user-friendly message
    // dom.title.textContent = "Error al cargar el video. Intenta con otro servidor.";
  });

  dom.iframe.addEventListener("load", () => {
    dom.loader.classList.add("hidden"); // Hide loader once iframe content is loaded
    dom.poster.classList.add("hidden"); // Hide poster when iframe content is loaded
  });

  dom.iframe.addEventListener("error", (e) => {
    console.error("Iframe error:", e);
    dom.loader.innerHTML = "<p>Error al cargar el contenido del servidor.</p>";
    dom.loader.classList.remove("hidden");
  });

  dom.video.addEventListener("timeupdate", () => {
    const percentage = (dom.video.currentTime / dom.video.duration) * 100;
    dom.timeline.value = dom.video.currentTime;
    dom.timeline.style.setProperty(
      "--progress-value",
      `${percentage}%`
    ); /* Set CSS variable for progress fill */
    dom.currentTime.textContent = formatTime(dom.video.currentTime);
    localStorage.setItem(getContentKey(contentConfig), dom.video.currentTime);
    updateSkipIntroButtonVisibility(); // Update visibility on timeupdate
  });
  dom.video.addEventListener("play", () => {
    console.log("Video play event fired.");
    dom.playPauseBtn.textContent = "pause";
    dom.loader.classList.add("hidden");
    dom.poster.classList.add("hidden"); // Hide poster when video starts playing
    showControls();
    updateSkipIntroButtonVisibility(); // Update visibility on play
  });
  dom.video.addEventListener("pause", () => {
    console.log("Video pause event fired.");
    dom.playPauseBtn.textContent = "play_arrow";
    showControls();
    clearTimeout(controlsTimeout);
    updateSkipIntroButtonVisibility(); // Update visibility on pause
  });
  dom.video.addEventListener("waiting", () => {
    console.log("Video waiting event fired.");
    dom.loader.classList.remove("hidden");
  });
  dom.video.addEventListener("playing", () => {
    console.log("Video playing event fired.");
    dom.loader.classList.add("hidden");
  });
  dom.video.addEventListener("ended", () => {
    console.log("Video ended event fired.");
    localStorage.removeItem(getContentKey(contentConfig));
    dom.poster.classList.remove("hidden"); // Show poster again when video ends
  });

  // --- EVENTOS DE LOS CONTROLES ---

  // --- EVENTOS DE LOS CONTROLES ---
  dom.playPauseBtn.addEventListener("click", () =>
    dom.video.paused ? dom.video.play() : dom.video.pause()
  );
  dom.timeline.addEventListener(
    "input",
    () => (dom.video.currentTime = dom.timeline.value)
  );
  dom.fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      // If iframe is active, request fullscreen on the iframe itself or the wrapper
      if (!dom.iframe.classList.contains("hidden")) {
        // Attempt to request fullscreen on the iframe element
        // Note: Fullscreen on iframe content might be restricted by sandbox attributes or cross-origin policies.
        // Requesting fullscreen on the wrapper is a more reliable approach for the entire player.
        dom.wrapper
          .requestFullscreen()
          .catch((err) =>
            console.error("Error requesting fullscreen on wrapper:", err)
          );
      } else {
        // If video is active, request fullscreen on the wrapper
        dom.wrapper
          .requestFullscreen()
          .catch((err) =>
            console.error("Error requesting fullscreen on wrapper:", err)
          );
      }
    } else {
      document.exitFullscreen();
    }
  });
  dom.rewindBtn.addEventListener("click", () => (dom.video.currentTime -= 10));
  dom.forwardBtn.addEventListener("click", () => (dom.video.currentTime += 10));
  dom.wrapper.addEventListener("click", (e) => {
    // If iframe is active, controls should always be visible, so do not hide them on wrapper click.
    if (dom.wrapper.classList.contains("iframe-active")) {
      showControls(); // Ensure controls are visible
      return;
    }

    // Only toggle controls if the click is directly on the wrapper or the video element
    // This prevents clicks on control buttons or popups from hiding controls
    if (e.target === dom.wrapper || e.target === dom.video) {
      if (dom.controls.classList.contains("hidden")) {
        showControls();
        // If "Haz clic para reproducir" is displayed, change it back to the episode title
        if (dom.title.textContent.trim() === "Haz clic para reproducir") {
          console.log(
            "Changing title from 'Haz clic para reproducir' to:",
            currentEpisodeTitle
          );
          dom.title.textContent = currentEpisodeTitle;
          dom.poster.classList.add("hidden"); // Hide poster when playback starts
        }
      } else {
        hideControls();
      }
    }
  });
  dom.backBtn.addEventListener("click", () => {
    const tmdbId = dom.backBtn.dataset.tmdbId;
    const tmdbType = dom.backBtn.dataset.tmdbType;
    if (tmdbId) {
      const customUrl = `go:${tmdbId}`;
      window.location.href = customUrl;
    } else {
      console.warn(
        "TMDb ID not found for back button. Falling back to history."
      );
      if (window.history.length > 1) {
        window.history.back();
      } else {
        alert("Simulando go:home");
      }
    }
  });

  dom.prevEpisodeBtn.addEventListener("click", () => {
    const usePrevEpisode = dom.prevEpisodeBtn.dataset.usePrevEpisode === "true";
    const prevEpisodeUrl = dom.prevEpisodeBtn.dataset.prevEpisodeUrl;

    if (usePrevEpisode && prevEpisodeUrl) {
      window.location.href = prevEpisodeUrl;
    } else {
      const currentEpisode = parseInt(contentConfig.episode);
      if (currentEpisode > 1) {
        changeEpisode(currentEpisode - 1);
      } else {
        alert("Ya estás en el primer episodio.");
      }
    }
  });

  dom.nextEpisodeBtn.addEventListener("click", () => {
    const nextEpisodeUrl = dom.nextEpisodeBtn.dataset.nextEpisodeUrl;

    if (nextEpisodeUrl) {
      window.location.href = nextEpisodeUrl;
    } else {
      const currentEpisode = parseInt(contentConfig.episode);
      changeEpisode(currentEpisode + 1);
    }
  });

  // Eventos para los select de idioma y servidor
  dom.langSelect.addEventListener("change", (e) => {
    handleLanguageSelection(e.target.value);
  });

  dom.serversSelect.addEventListener("change", (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedServer = {
      name: selectedOption.textContent,
      url: selectedOption.value,
      mp4: selectedOption.dataset.mp4 === "true",
    };
    handleServerSelection(selectedServer);
  });

  // Eventos para cerrar popups
  dom.closePopupBtns.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      hideAllPopups();
    });
  });

  document.addEventListener("click", (e) => {
    // Hide all popups if click is outside of them and not on controls
    if (
      !e.target.closest(".popup") &&
      !e.target.closest(".bottom-controls") &&
      !e.target.closest(".top-bar")
    ) {
      hideAllPopups();
    }
  });

  // --- NUEVOS BOTONES ---
  // --- NUEVOS BOTONES ---
  if (dom.openExternalBtn) {
    dom.openExternalBtn.addEventListener("click", () => {
      console.log("Open external button clicked.");
      console.log("currentServer:", currentServer);
      console.log(
        "currentServer.url:",
        currentServer ? currentServer.url : "N/A"
      );

      if (currentServer && currentServer.url) {
        const url = currentServer.url;
        const absoluteUrl = new URL(url, window.location.origin);
        const scheme = absoluteUrl.protocol.slice(0, -1); // "http" or "https"
        const urlWithoutScheme = absoluteUrl.href.replace(
          `${absoluteUrl.protocol}//`,
          ""
        );
        const intentUrl = `intent://${urlWithoutScheme}#Intent;action=android.intent.action.VIEW;type=video/*;scheme=${scheme};end`;
        window.open(intentUrl, "_system");
      } else {
        console.warn("No server URL selected for external opening."); // Log a warning
        alert("No hay URL de servidor seleccionada para abrir.");
      }
    });
  }

  if (dom.downloadBtn) {
    dom.downloadBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      hideAllPopups();
      dom.popups.downloadServers.classList.remove("hidden");
      populateDownloadServersDropdown();
    });
  }

  if (dom.startDownloadBtn) {
    dom.startDownloadBtn.addEventListener("click", handleDownloadInitiation);
  }

  // Evento para el botón de reporte
  if (dom.reportBtn) {
    dom.reportBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      hideAllPopups();
      dom.popups.report.classList.remove("hidden");
      populateReportDropdowns();

      // --- CONFIGURACIÓN DE TELEGRAM PARA EL REPORTE ---
      // IMPORTANTE: Reemplaza estos valores con los datos reales de tu bot y chat.
      // Estos valores se usarán para enviar el reporte a Telegram.
      dom.reportChatId.value = "-1003012512019"; // Ejemplo: "123456789"
      dom.reportToken.value = "7501592844:AAFR8K1wZEdie8g8F4FY3rVtKyM3EEZ8xg0"; // Ejemplo: "123456:ABC-DEF1234ghIkl-798989898989"
      dom.reportTopic.value = "102"; // Opcional, ejemplo: "123" (para un topic específico en un grupo)
      // --- FIN DE CONFIGURACIÓN DE TELEGRAM ---
    });
  }

  // Evento para el envío del formulario de reporte
  if (dom.reportForm) {
    dom.reportForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent default form submission
      const reportData = {
        server: dom.reportServerSelect.value,
        language: dom.reportLanguageSelect.value,
        reportType: dom.reportTypeStreaming.checked ? "streaming" : "download", // Get selected report type
        seriesName: currentSeriesName, // Add series name
        seasonNumber: currentSeasonNumber, // Add season number
        episodeNumber: currentEpisodeNumber, // Add episode number
        contentType: contentConfig.type, // Add content type
        // contentSynopsis: currentContentSynopsis, // Removed synopsis
        contentPosterUrl: currentContentPosterUrl, // Add poster URL
        currentUrl: window.location.href,
        currentServerUrl: currentServer ? currentServer.url : "N/A",
        chat_id: dom.reportChatId.value,
        token: dom.reportToken.value,
        topic: dom.reportTopic.value,
      };
      sendTelegramReport(reportData);
    });
  }

  // --- INICIALIZACIÓN ---
  async function startPlayback() {
    if (playerInitialized) return; // Prevent re-initialization
    playerInitialized = true;

    await fetchContentData();
    // Inicializar con el primer servidor del idioma por defecto
    const defaultServers = window.languageServers[currentLanguage];
    if (defaultServers && defaultServers.length > 0) {
      loadSource(defaultServers[0]);
    } else {
      dom.loader.innerHTML =
        "<p>No hay servidores para este contenido en el idioma por defecto.</p>";
    }

    // Intentar bloquear la orientación de la pantalla a horizontal
    // La lógica de orientación de pantalla se ha eliminado según la solicitud del usuario.
    // Ahora el reproductor siempre intentará iniciar la reproducción.
    // if (screen.orientation && screen.orientation.lock) {
    //   screen.orientation.lock("landscape").catch((err) => {
    //     console.warn("Failed to lock screen orientation to landscape:", err);
    //   });
    // } else {
    //   console.warn("Screen Orientation API not supported or available.");
    // }
  }

  function stopPlayback() {
    if (dom.video) {
      dom.video.pause();
      dom.video.src = ""; // Clear video source
      dom.video.classList.add("hidden");
    }
    if (dom.iframe) {
      dom.iframe.src = "about:blank"; // Clear iframe source
      dom.iframe.classList.add("hidden");
    }
    dom.loader.classList.add("hidden");
    dom.poster.classList.remove("hidden"); // Show poster when stopped
    dom.controls.classList.add("hidden"); // Hide controls
    dom.bottomBar.classList.add("hidden"); // Hide bottom bar
    playerInitialized = false;
  }

  populateLanguageOptions(); // Populate language select on load
  populateServersByLanguage(currentLanguage); // Populate server select for default language
  startPlayback();

  // Event listeners to keep controls visible on hover
  dom.controls.addEventListener("mouseover", showControls);
  dom.bottomBar.addEventListener("mouseover", showControls);

  dom.controls.addEventListener("mouseleave", () => {
    if (!dom.video.paused && !dom.wrapper.classList.contains("iframe-active")) {
      controlsTimeout = setTimeout(hideControls, 3000);
    }
  });
  dom.bottomBar.addEventListener("mouseleave", () => {
    if (!dom.video.paused && !dom.wrapper.classList.contains("iframe-active")) {
      controlsTimeout = setTimeout(hideControls, 3000);
    }
  });
});
