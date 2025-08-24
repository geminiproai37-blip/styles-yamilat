export function renderPage() {
  const body = document.body;
  body.innerHTML = ""; // Clear existing body content

  // Header
  const header = document.createElement("header");
  header.className =
    "bg-black/30 backdrop-blur-sm fixed top-0 z-50 py-4 px-5 flex justify-between items-center w-full";
  header.innerHTML = `
    <div class="flex items-center space-x-4">
      <a href="#" class="text-white text-2xl hover:text-orange-500 transition">
        <i class="fas fa-arrow-left"></i>
      </a>
      <div class="flex items-center space-x-2">
        <svg
          class="h-8 w-8 text-orange-500"
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
        <h1 class="text-2xl font-bold text-white">
          Yami<span class="text-orange-500">Lat</span>
        </h1>
      </div>
    </div>
    <a href="#" class="text-gray-200 hover:text-white transition">
      <!-- Removed search icon -->
    </a>
  `;
  body.appendChild(header);

  // Transmit and External Player buttons
  const topButtonsDiv = document.createElement("div");
  topButtonsDiv.className = "absolute top-[96px] right-5 flex space-x-2 z-40";
  topButtonsDiv.innerHTML = `
    <button
      id="cast-btn-global"
      class="bg-blue-600 text-white text-sm font-bold p-2 rounded-full hover:bg-blue-700 transition shadow-lg flex items-center justify-center w-10 h-10"
      aria-label="Transmitir"
    >
      <i class="material-icons">cast</i>
    </button>
    <button
      id="external-player-btn"
      class="bg-purple-600 text-white text-sm font-bold p-2 rounded-full hover:bg-purple-700 transition shadow-lg flex items-center justify-center w-10 h-10"
      aria-label="Reproducir Externo"
    >
      <i class="fas fa-play-circle"></i>
    </button>
  `;
  body.appendChild(topButtonsDiv);

  // Main Content
  const main = document.createElement("main");
  main.id = "main-content";
  main.className = "p-3 md:p-5 pt-[60px]";
  main.innerHTML = `
    <div
      id="loader-container"
      class="flex justify-center items-center h-screen hidden"
    >
      <div class="loader"></div>
    </div>

    <!-- Movie Details Container -->
    <div id="movie-details-container">
      <!-- Language Tabs -->
      <div id="tabs-section" class="border-b border-gray-700 mb-4">
        <nav
          id="language-tabs-nav"
          class="flex space-x-2"
          aria-label="Tabs"
        ></nav>
      </div>

      <!-- Server Buttons Container -->
      <div
        id="server-buttons-container"
        class="flex flex-nowrap gap-2 mb-4 overflow-x-auto"
      ></div>

      <!-- Episode Info -->
      <div id="episode-info" class="mb-4 flex items-baseline flex-wrap">
        <h3 id="episode-name" class="text-xl font-bold mr-2">
          Nombre de Episodio: Cargando...
        </h3>
        <p
          id="episode-number"
          class="text-gray-300 text-sm whitespace-nowrap"
        >
          Número de Episodio: Cargando...
        </p>
      </div>

      <!-- Episode Synopsis -->
      <div id="episode-synopsis" class="mb-4">
        <p id="episode-overview" class="text-gray-400 text-sm">
          Sinopsis: Cargando...
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap justify-start gap-2 mb-4">
        <button
          id="view-all-chapters-btn"
          class="flex-1 bg-orange-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-orange-700 transition shadow-lg min-w-[120px]"
        >
          <i class="fas fa-list-ul mr-1"></i>Ver capítulos
        </button>
        <button
          id="next-chapter-btn"
          class="flex-1 bg-gray-700 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-gray-600 transition shadow-lg min-w-[120px]"
        >
          <i class="fas fa-forward mr-1"></i>Siguiente
        </button>
      </div>
    </div>
  `;
  body.appendChild(main);

  // Video Player Container (created separately to handle iframe sandbox attribute)
  const videoPlayerContainer = document.createElement("div");
  videoPlayerContainer.id = "video-player-container";
  videoPlayerContainer.className = "relative mb-4 rounded-lg overflow-hidden";
  videoPlayerContainer.style.paddingTop = "56.25%";

  const videoIframe = document.createElement("iframe");
  videoIframe.id = "video-iframe";
  videoIframe.className = "absolute top-0 left-0 w-full h-full";
  videoIframe.src = "";
  videoIframe.frameBorder = "0";
  videoIframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-smedia; gyroscope; picture-in-picture; fullscreen";
  videoIframe.allowFullscreen = true;

  videoPlayerContainer.appendChild(videoIframe);
  document
    .getElementById("movie-details-container")
    .insertBefore(
      videoPlayerContainer,
      document.getElementById("episode-info")
    );

  // Message Modal
  const messageModal = document.createElement("div");
  messageModal.id = "message-modal";
  messageModal.className =
    "hidden fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[70] p-4";
  messageModal.innerHTML = `
    <div class="bg-gray-800 rounded-lg w-full max-w-sm p-6 text-center">
      <h3 id="message-title" class="text-xl font-bold mb-2"></h3>
      <p id="message-text" class="text-gray-300 mb-4"></p>
      <button
        id="close-message-btn"
        class="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition"
      >
        Aceptar
      </button>
    </div>
  `;
  body.appendChild(messageModal);
}
