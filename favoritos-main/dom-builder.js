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
  header.querySelector("#share-btn").addEventListener("click", () => {
    window.location.href = "http://action_share";
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

  `;
  return main;
}

export function createMediaCard(imageBaseUrl, media, isFavorite = false) {
  const card = document.createElement("div");
  card.className =
    "bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out";
  card.dataset.id = media.id;
  card.dataset.type = media.media_type;

  const imageUrl = media.poster_path
    ? `${imageBaseUrl}${media.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";
  const title = media.title || media.name || "Título Desconocido";

  const buttonText = isFavorite
    ? "Eliminar de Favoritos"
    : "Añadir a Favoritos";
  const buttonClass = isFavorite
    ? "remove-from-favorites-btn bg-red-600 hover:bg-red-700"
    : "add-to-favorites-btn bg-orange-600 hover:bg-orange-700";

  card.innerHTML = `
    <img
      src="${imageUrl}"
      alt="${title}"
      class="w-full h-48 object-cover"
      loading="lazy"
    />
    <div class="p-3">
      <h3 class="text-sm font-semibold truncate">${title}</h3>
      <p class="text-xs text-gray-400">ID: ${media.id} | Tipo: ${media.media_type}</p>
      <button
        class="mt-2 w-full text-white text-xs font-bold py-1 px-2 rounded transition-colors duration-200 ${buttonClass}"
        data-id="${media.id}"
        data-type="${media.media_type}"
        data-title="${title}"
        data-poster="${media.poster_path}"
      >
        ${buttonText}
      </button>
    </div>
  `;

  return card;
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
      class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-1 rounded-lg transition">
      <i class="fas fa-tv text-lg md:text-xl mb-1"></i>
      <span class="text-xs font-semibold">Series</span>
    </a>
    <a href="go:movies" aria-label="Películas"
      class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-1 rounded-lg transition">
      <i class="fas fa-film text-lg md:text-xl mb-1"></i>
      <span class="text-xs font-semibold">Películas</span>
    </a>
    <a href="go:favoritos" aria-label="Favoritos"
      class="flex flex-col items-center text-orange-500 w-1/4 py-1 rounded-lg transition">
      <i class="fas fa-heart text-lg md:text-xl mb-1"></i>
      <span class="text-xs font-semibold">Favoritos</span>
    </a>
  `;
  return nav;
}
