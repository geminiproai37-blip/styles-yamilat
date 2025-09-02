export function buildHeader() {
  const header = document.createElement("header");
  header.className =
    "bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 py-4 px-5 flex justify-between items-center border-b border-gray-800";

  header.innerHTML = `
    <div class="flex items-center space-x-2">
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
      <button id="coin-btn" aria-label="Anuncios" class="text-green-500 hover:text-white transition flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700">
        <i class="fas fa-ad text-lg md:text-xl"></i>
      </button>
      <button id="notification-btn" aria-label="Notificaciones" class="text-gray-400 hover:text-white transition">
        <i class="fas fa-bell text-lg md:text-xl"></i>
      </button>
      <button id="share-btn" aria-label="Compartir" class="text-gray-400 hover:text-white transition">
        <i class="fas fa-share-alt text-lg md:text-xl"></i>
      </button>
      <a href="go:buscar" aria-label="Buscar" class="text-gray-400 hover:text-white transition">
        <i class="fas fa-search text-lg md:text-xl"></i>
      </a>
    </div>
  `;

  // Acciones (puedes reemplazar con funciones reales en vez de redirección)
  header.querySelector("#notification-btn").addEventListener("click", () => {
    window.location.href = "http://action_notifications";
  });
  header.querySelector("#coin-btn").addEventListener("click", () => {
    window.location.href = "http://action_noads"; // Placeholder URL
  });
  header.querySelector("#share-btn").addEventListener("click", () => {
    window.location.href = "http://action_share";
  });

  return header;
}
export function buildMainContent() {
  const main = document.createElement("main");
  main.id = "main-content";
  main.className = "pb-20"; // Add padding-bottom to create space above the navbar

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

    <!-- Series Section -->
    <div id="series-section" class="p-5">
      <h2 class="text-xl font-bold mb-6 text-center text-orange-500 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-40 py-4">
        <i class="fas fa-tv text-lg mr-2"></i>Todas las Series
      </h2>
      <!-- Series grid content will be loaded here by script.js -->
    </div>
  `;
  return main;
}

export function buildNavigationBar() {
  const nav = document.createElement("nav");
  nav.className =
    "fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex justify-around p-2 z-50";

  nav.innerHTML = `
    <a href="go:home" aria-label="Inicio"
      class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-1 rounded-lg transition">
      <i class="fas fa-home text-lg md:text-xl mb-1"></i>
      <span class="text-xs font-semibold">Inicio</span>
    </a>
    <a href="go:series" aria-label="Series"
      class="flex flex-col items-center text-orange-500 w-1/4 py-1 rounded-lg transition">
      <i class="fas fa-tv text-lg md:text-xl mb-1"></i>
      <span class="text-xs font-semibold">Series</span>
    </a>
    <a href="go:movies" aria-label="Películas"
      class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-1 rounded-lg transition">
      <i class="fas fa-film text-lg md:text-xl mb-1"></i>
      <span class="text-xs font-semibold">Películas</span>
    </a>
    <a href="go:favoritos" aria-label="Favoritos"
      class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-1 rounded-lg transition">
      <i class="fas fa-heart text-lg md:text-xl mb-1"></i>
      <span class="text-xs font-semibold">Favoritos</span>
    </a>
  `;
  return nav;
}

export function createMovieGrid(imageBaseUrl, mediaItems) {
  const mediaGrid = document.createElement("div");
  mediaGrid.id = "media-grid";
  mediaGrid.className = "grid grid-cols-3 gap-4"; // 3 columns grid

  mediaItems.forEach((item) => {
    if (item && item.poster_path) {
      const mediaCard = document.createElement("a");
      mediaCard.href = `go:${item.id}`;
      mediaCard.className = "flex flex-col items-center text-center";

      const posterImage = document.createElement("img");
      posterImage.src = imageBaseUrl + item.poster_path;
      posterImage.alt = item.title || item.name;
      posterImage.className = "rounded-lg w-full h-auto object-cover";
      posterImage.loading = "lazy";

      const mediaTitle = document.createElement("p");
      mediaTitle.className = "text-sm mt-2 truncate w-full";
      mediaTitle.textContent = item.title || item.name;

      mediaCard.append(posterImage, mediaTitle);
      mediaGrid.appendChild(mediaCard);
    }
  });

  return mediaGrid;
}
