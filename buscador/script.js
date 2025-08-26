import { tmdbApiKey } from "./config.js";

function generateHTML() {
  return `
    <!-- Header -->
    <header
      class="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 py-2 px-3 flex justify-between items-center border-b border-gray-800"
    >
      <div class="flex items-center space-x-2">
        <a
          href="/index.html"
          class="text-white text-xl hover:text-orange-500 transition"
        >
          <i class="fas fa-arrow-left"></i>
        </a>
        <div class="flex items-center space-x-1">
          <svg
            class="h-6 w-6 text-orange-500"
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
      </div>
    </header>

    <!-- Main Content -->
    <main id="main-content" class="p-2 pb-16">
      <div class="relative mb-3">
        <input
          type="text"
          id="search-input"
          placeholder="Buscar en la base de datos..."
          class="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <i
          class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
        ></i>
      </div>

      <div
        id="api-key-message"
        class="hidden bg-red-800 border-l-4 border-red-500 text-red-100 p-3 rounded-lg mb-4"
        role="alert"
      >
        <p class="font-bold text-sm">Error de Configuración</p>
        <p class="text-xs">
          Por favor, introduce tu clave de API de TMDB en la variable \`apiKey\`
          del script para cargar el contenido.
        </p>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-700 mb-4">
        <nav class="flex space-x-2" aria-label="Tabs">
          <button
            id="tab-movies"
            class="tab-link active whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs"
          >
            Películas
          </button>
          <button
            id="tab-series"
            class="tab-link whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs text-gray-400 border-transparent hover:border-gray-500 hover:text-gray-300"
          >
            Series
          </button>
        </nav>
      </div>

      <!-- Results Grid -->
      <div id="results-grid" class="grid grid-cols-4 gap-1">
        <!-- Search results will appear here -->
      </div>
      <div
        id="loader-container"
        class="hidden justify-center items-center h-32"
      >
        <div class="loader"></div>
      </div>
      <p id="no-results-message" class="hidden text-center text-gray-400 mt-4 text-sm">
        No se encontraron resultados.
      </p>
    </main>

    <!-- Bottom Navigation Bar -->
    <nav
      class="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 flex justify-around p-1 z-50"
    >
      <a
        href="/index.html"
        class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-0.5 rounded-lg transition"
      >
        <i class="fas fa-home text-lg mb-0.5"></i>
        <span class="text-[0.65rem] font-semibold">Inicio</span>
      </a>
      <a
        href="/series.html"
        class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-0.5 rounded-lg transition"
      >
        <i class="fas fa-tv text-lg mb-0.5"></i>
        <span class="text-[0.65rem] font-semibold">Series</span>
      </a>
      <a
        href="/movies.html"
        class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-0.5 rounded-lg transition"
      >
        <i class="fas fa-film text-lg mb-0.5"></i>
        <span class="text-[0.65rem] font-semibold">Películas</span>
      </a>
      <a
        href="/favorites.html"
        class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-0.5 rounded-lg transition"
      >
        <i class="fas fa-heart text-lg mb-0.5"></i>
        <span class="text-[0.65rem] font-semibold">Favoritos</span>
      </a>
    </nav>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.innerHTML = generateHTML();

  const apiKey = tmdbApiKey; // <-- IMPORTANTE: Introduce tu clave de API de TMDB aquí

  // --- BASE DE DATOS LOCAL ---
  const localDatabase = [
    {
      id: 372058,
      media_type: "movie",
    },
    {
      id: 129,
      media_type: "movie",
    },
    {
      id: 94605,
      media_type: "tv",
    },
    {
      id: 85037,
      media_type: "tv",
    },
    {
      id: 1429,
      media_type: "tv",
    },
  ];
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
  let enrichedDatabase = []; // Para guardar los datos de TMDB

  // Re-select elements after HTML injection
  const searchInput = document.getElementById("search-input");
  const resultsGrid = document.getElementById("results-grid");
  const noResultsMessage = document.getElementById("no-results-message");
  const loaderContainer = document.getElementById("loader-container");
  const tabMovies = document.getElementById("tab-movies");
  const tabSeries = document.getElementById("tab-series");
  let activeFilter = "movie"; // Default filter

  if (!apiKey) {
    document.getElementById("api-key-message").classList.remove("hidden");
    searchInput.disabled = true;
    return;
  }

  async function fetchDetailsFromTMDB(item) {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${item.media_type}/${item.id}?api_key=${apiKey}&language=es-ES`
      );
      if (!response.ok) return null;
      const details = await response.json();
      return {
        ...item, // Conserva id, media_type
        title: details.title || details.name,
        poster_path: details.poster_path,
      };
    } catch (error) {
      console.error(`Error fetching details for ID ${item.id}:`, error);
      return null;
    }
  }

  async function initializeDatabase() {
    loaderContainer.style.display = "flex";
    const promises = localDatabase.map(fetchDetailsFromTMDB);
    enrichedDatabase = (await Promise.all(promises)).filter(
      (item) => item !== null
    );
    loaderContainer.style.display = "none";
    performSearch(""); // Muestra los resultados iniciales
  }

  function performSearch(query) {
    const lowerCaseQuery = query.toLowerCase();
    const filteredResults = enrichedDatabase.filter(
      (item) =>
        item.media_type === activeFilter &&
        (query.length < 2 || item.title.toLowerCase().includes(lowerCaseQuery))
    );

    if (filteredResults.length === 0) {
      resultsGrid.innerHTML = "";
      noResultsMessage.classList.remove("hidden");
    } else {
      noResultsMessage.classList.add("hidden");
      displayResults(filteredResults);
    }
  }

  function displayResults(results) {
    resultsGrid.innerHTML = "";
    results.forEach((item) => {
      const card = document.createElement("div");
      card.className = "group";

      const link = document.createElement("a");
      link.href = `go:id tmdb:${item.id}`;
      link.target = "_blank";

      const poster = document.createElement("img");
      poster.src = item.poster_path
        ? `${imageBaseUrl}${item.poster_path}`
        : "https://placehold.co/500x750/1a202c/f97316?text=No+Image";
      poster.alt = item.title;
      poster.className =
        "w-full h-auto rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-300";

      const title = document.createElement("p");
      title.className = "mt-1 text-xs font-semibold text-white truncate"; // Reduced margin and font size
      title.textContent = item.title;

      link.appendChild(poster);
      card.append(link, title); // Removed tmdbId
      resultsGrid.appendChild(card);
    });
  }

  // Tab switching logic
  // These elements need to be re-selected after the HTML is injected
  tabMovies.addEventListener("click", () => {
    activeFilter = "movie";
    tabMovies.classList.add("active");
    tabSeries.classList.remove("active");
    performSearch(searchInput.value);
  });

  tabSeries.addEventListener("click", () => {
    activeFilter = "tv";
    tabSeries.classList.add("active");
    tabMovies.classList.remove("active");
    performSearch(searchInput.value);
  });

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value;
    performSearch(query);
  });

  // Initial load
  initializeDatabase();
});
