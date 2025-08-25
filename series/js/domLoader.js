document.addEventListener("DOMContentLoaded", () => {
  const appHtml = `
    <!-- Header -->
    <header
      class="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm py-2 px-2 flex justify-between items-center border-b border-gray-800"
    >
      <div class="flex items-center space-x-1">
        <svg
          class="h-7 w-7 text-orange-500"
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
        <h1 class="text-xl font-bold text-white">
          Yami<span class="text-orange-500">Lat</span>
        </h1>
      </div>
      <div class="flex items-center space-x-3">
        <button id="notification-btn" class="text-gray-400 hover:text-white transition">
          <i class="fas fa-bell text-lg"></i>
        </button>
        <button id="share-btn" class="text-gray-400 hover:text-white transition">
          <i class="fas fa-share-alt text-lg"></i>
        </button>
        <a href="/search.html" class="text-gray-400 hover:text-white transition">
          <i class="fas fa-search text-lg"></i>
        </a>
      </div>
    </header>

    <!-- Main Content -->
    <main id="main-content" class="pt-36 p-2 pb-16"> <!-- Adjusted pt for fixed header and filter bar -->
      <!-- Header for "Todas las Series" -->
      <div class="fixed top-14 left-0 right-0 bg-gray-900 text-white py-3 -mx-2 px-4 z-40 flex items-center justify-center border-b border-gray-800">
        <h2 class="text-lg font-normal flex items-center space-x-2">
          <i class="fas fa-tv text-orange-500 text-lg"></i>
          <span>Todas las Series</span>
        </h2>
      </div>

      <!-- Placeholder for API Key Message -->
      <div
        id="api-key-message"
        class="hidden bg-red-800 border-l-4 border-red-500 text-red-100 p-4 rounded-lg mb-6"
        role="alert"
      >
        <p class="font-bold">Error de Configuración</p>
        <p>
          Por favor, introduce tu clave de API de TMDB en la variable \`apiKey\`
          del script para cargar el contenido.
        </p>
      </div>

      <!-- Series Grid -->
      <div
        id="series-grid"
        class="grid grid-cols-4 gap-3"
      >
        <!-- Series will be loaded here -->
      </div>
    </main>

    <!-- Bottom Navigation Bar -->
    <nav
      class="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 flex justify-around p-0.5"
    >
      <a
        href="go:home"
        class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-0.5 rounded-lg transition"
      >
        <i class="fas fa-home text-lg mb-0.5"></i>
        <span class="text-xs font-semibold">Inicio</span>
      </a>
      <a
        href="go:series"
        class="flex flex-col items-center text-orange-500 w-1/4 py-0.5 rounded-lg transition"
      >
        <i class="fas fa-tv text-lg mb-0.5"></i>
        <span class="text-xs font-semibold">Series</span>
      </a>
      <a
        href="go:movies"
        class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-0.5 rounded-lg transition"
      >
        <i class="fas fa-film text-lg mb-0.5"></i>
        <span class="text-xs font-semibold">Películas</span>
      </a>
      <a
        href="go:favoritos"
        class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-0.5 rounded-lg transition"
      >
        <i class="fas fa-heart text-lg mb-0.5"></i>
        <span class="text-xs font-semibold">Favoritos</span>
      </a>
    </nav>
  `;

  document.body.insertAdjacentHTML("afterbegin", appHtml);
});
