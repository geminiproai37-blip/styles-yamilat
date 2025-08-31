export function buildCard(imageBaseUrl, item) {
  const card = document.createElement("div");
  card.className =
    "bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden w-full max-w-md flex items-center"; // Adjusted max-w to md for smaller card, added items-center

  const imageUrl = item.poster_path
    ? `${imageBaseUrl}${item.poster_path}`
    : "https://via.placeholder.com/150x225?text=No+Image";
  const title =
    item.title || item.name || item.original_title || item.original_name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  card.innerHTML = `
    <div class="relative w-32 h-20 flex-shrink-0 rounded-l-lg overflow-hidden"> <!-- Container for background image and logo -->
      <img src="${
        item.backdrop_path
          ? `${imageBaseUrl}${item.backdrop_path}`
          : "https://via.placeholder.com/300x169?text=No+Image"
      }" alt="${title}" class="absolute inset-0 w-full h-full object-cover" />
      ${
        item.logo_path
          ? `<img src="${imageBaseUrl}${item.logo_path}" alt="${title} logo" class="absolute inset-0 m-auto h-12 object-contain" />`
          : `<h3 class="absolute inset-0 m-auto text-white text-sm font-bold flex items-center justify-center text-center">${title}</h3>`
      }
    </div>
    <div class="p-3 flex flex-col justify-center flex-grow"> <!-- Content area: title/year, reduced padding -->
      <h3 class="text-base font-semibold text-white">${title}</h3> <!-- Reduced font size -->
      <p class="text-gray-400 text-xs">${year}</p> <!-- Reduced font size -->
    </div>
    <div class="p-3 flex items-center flex-shrink-0"> <!-- Button container, reduced padding -->
      <button class="bg-orange-500 hover:bg-orange-600 text-white font-bold p-1 rounded-full inline-flex items-center justify-center text-xs">
        <i class="fas fa-play-circle"></i>
      </button>
    </div>
  `;

  card.addEventListener("click", () => {
    window.location.href = `go:${item.id}`;
  });

  return card;
}

export function buildPageStructure(appRoot) {
  appRoot.innerHTML = `
    <header
      class="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 py-4 px-5 sm:py-6 sm:px-8 flex justify-between items-center border-b border-gray-800"
    >
      <div class="container mx-auto flex flex-col items-center py-2 max-w-sm">
        <div class="flex items-center space-x-4 mb-4 w-full">
          <button
            id="back-button"
            aria-label="Volver"
            class="text-gray-400 hover:text-white transition"
          >
            <i class="fas fa-arrow-left text-xl"></i>
          </button>
          <div class="flex items-center space-x-2 flex-grow justify-center">
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
          <button
            id="add-content-button"
            aria-label="Agregar Contenido"
            class="text-gray-400 hover:text-white transition ml-4"
          >
            <i class="fas fa-plus text-xl"></i>
          </button>
        </div>
        <!-- Search Input for Main Screen -->
        <div class="relative w-full mt-4">
          <input
            type="text"
            id="search-input"
            placeholder="Buscar anime..."
            class="bg-gray-700 text-white rounded-full py-2 px-4 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <i
            class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          ></i>
        </div>
      </div>
    </header>

    <!-- Default Content Slider -->
    <div
      id="default-content-slider"
      class="container mx-auto mt-4 px-4 overflow-x-auto whitespace-nowrap custom-scrollbar"
    >
      <div id="slider-content" class="flex space-x-4 pb-4">
        <!-- Slider posters will be loaded here -->
      </div>
    </div>

    <!-- Recommended Content Title -->
    <div id="recommended-title" class="w-full px-4 mt-4 hidden">
      <h2 class="text-lg font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis special-title-font">Animes y películas recomendadas</h2>
    </div>

    <!-- Modal de Solicitud de Contenido -->
    <div
      id="request-modal"
      class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 hidden"
    >
      <div
        class="bg-gray-800 rounded-lg p-6 w-11/12 max-w-2xl relative border border-gray-700"
      >
        <button
          id="close-modal-button"
          class="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
        >
          &times;
        </button>
        <h2 class="text-2xl font-bold mb-4 text-white">
          Solicitar Contenido
        </h2>

        <!-- Step 1: Search for content -->
        <div id="modal-step-1">
          <div class="mb-4 flex items-center space-x-2">
            <div class="relative flex-grow">
              <input
                type="text"
                id="modal-search-input"
                placeholder="Buscar anime..."
                class="bg-gray-700 text-white rounded-full py-2 px-4 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <i
                class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              ></i>
            </div>
            <button
              id="modal-search-button"
              aria-label="Buscar"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition"
            >
              <i class="fas fa-search"></i>
            </button>
          </div>
          <div
            id="tmdb-search-results"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-4 overflow-y-auto custom-scrollbar justify-items-center hidden max-h-64"
          >
            <!-- TMDB search results will be loaded here -->
          </div>
          <button
            id="next-step-button"
            class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full w-full transition"
            disabled
          >
            Siguiente
          </button>
        </div>

        <!-- Step 2: Episode Request -->
        <div id="modal-step-2" class="hidden">
          <div id="modal-step2-question" class="mb-4 text-center hidden">
            <p class="text-lg font-semibold mb-4">
              ¿Ya está en la app y solo quieres solicitar un episodio?
            </p>
            <div class="flex justify-center space-x-4">
              <button
                id="in-app-yes-button"
                class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition"
              >
                Sí
              </button>
              <button
                id="in-app-no-button"
                class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition"
              >
                No
              </button>
            </div>
          </div>

          <div
            id="episode-request-fields"
            class="grid grid-cols-2 gap-4 mb-4 hidden"
          >
            <div>
              <label
                for="season-number-input"
                class="block text-gray-300 text-sm font-bold mb-2"
                >Temporada:</label
              >
              <input
                type="number"
                id="season-number-input"
                placeholder="Ej: 1"
                class="bg-gray-700 text-white rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label
                for="episode-number-input"
                class="block text-gray-300 text-sm font-bold mb-2"
                >Episodio:</label
              >
              <input
                type="number"
                id="episode-number-input"
                placeholder="Ej: 5"
                class="bg-gray-700 text-white rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>
          <div class="flex justify-between space-x-4">
            <button
              id="back-to-step-1-button"
              class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition flex-grow"
            >
              Atrás
            </button>
            <button
              id="submit-request-button"
              class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full transition flex-grow"
              disabled
            >
              Enviar Solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
    <main class="container mx-auto p-8">
      <div id="search-results" class="flex flex-col items-center gap-6">
        <!-- Search results will be loaded here -->
      </div>
    </main>
  `;
}

export function buildSliderPoster(imageBaseUrl, item) {
  const poster = document.createElement("div");
  poster.className =
    "flex-none w-20 h-auto rounded-lg overflow-hidden shadow-lg bg-gray-800 cursor-pointer"; // Changed width to w-20 for smaller size, added cursor-pointer
  poster.innerHTML = `
    <img src="${imageBaseUrl}${item.poster_path}" alt="${
    item.title || item.name
  }" class="w-full h-full object-cover">
  `;
  poster.addEventListener("click", () => {
    window.location.href = `go:${item.id}`;
  });
  return poster;
}
