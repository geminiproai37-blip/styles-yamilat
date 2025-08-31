import { fetchMediaDetails, fetchCast, fetchMovieVideos } from "./script.js";

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

export function buildNavigationBar() {
  const nav = document.createElement("nav");
  nav.className =
    "fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex justify-around p-2 z-50";

  nav.innerHTML = `
    <a href="go:home" aria-label="Inicio"
      class="flex flex-col items-center text-gray-400 w-1/4 py-1 rounded-lg transition"> <!-- Deactivated home icon -->
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
      class="flex flex-col items-center text-gray-400 hover:text-orange-500 w-1/4 py-1 rounded-lg transition">
      <i class="fas fa-heart text-lg md:text-xl mb-1"></i>
      <span class="text-xs font-semibold">Favoritos</span>
    </a>
  `;
  return nav;
}

export async function buildMovieDetailPage(
  apiBaseUrl,
  backdropBaseUrl,
  imageBaseUrl,
  mediaDetails,
  mediaType,
  mediaId,
  playUrlTemplate
) {
  const movie = mediaDetails; // For backward compatibility with existing code
  const mediaIdStr = String(mediaId); // Declare mediaIdStr once at a higher scope
  const movieDetailContainer = document.createElement("div");
  movieDetailContainer.className =
    "relative w-full min-h-screen bg-gray-900 text-white pb-20"; // Full height, app background, padding for nav

  // Content
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "relative z-10 p-5 max-w-4xl mx-auto"; // Centered, max-width for content

  // Container for media display (trailer/backdrop + logo)
  const mediaDisplayContainer = document.createElement("div");
  mediaDisplayContainer.className =
    "relative w-full aspect-video mb-4 rounded-lg overflow-hidden shadow-lg"; // 16:9 aspect ratio, relative for logo positioning
  contentWrapper.appendChild(mediaDisplayContainer);

  // Trailer or 16:9 Image
  const videos = await fetchMovieVideos(apiBaseUrl, movie.id);
  const trailer = videos.find(
    (video) => video.site === "YouTube" && video.type === "Trailer"
  );

  // Always use backdrop image for the thumbnail
  if (movie.backdrop_path) {
    mediaDisplayContainer.style.backgroundImage = `url(${backdropBaseUrl}${movie.backdrop_path})`;
    mediaDisplayContainer.style.backgroundSize = "cover";
    mediaDisplayContainer.style.backgroundPosition = "center";
  } else {
    // Fallback if no backdrop
    mediaDisplayContainer.style.backgroundColor = "#1f2937"; // gray-800
    mediaDisplayContainer.innerHTML = `
      <div class="flex items-center justify-center w-full h-full text-gray-500 text-xl">
        No hay imagen disponible
      </div>
    `;
  }

  // Movie Logo (positioned absolutely at the bottom center of the mediaDisplayContainer)
  if (movie.logo_path) {
    const logo = document.createElement("img");
    logo.src = `https://image.tmdb.org/t/p/original${movie.logo_path}`;
    logo.alt = `${movie.title || movie.name} logo`;
    logo.className =
      "absolute bottom-4 left-4 max-w-[150px] h-auto drop-shadow-lg z-10"; // Larger, bottom-left
    mediaDisplayContainer.appendChild(logo);
  }

  // Movie Title and Categories (below media display)
  const titleAndGenresContainer = document.createElement("div");
  titleAndGenresContainer.className =
    "flex flex-col md:flex-row md:items-center md:justify-between mb-3";
  contentWrapper.appendChild(titleAndGenresContainer);

  // Display title if no logo was shown in the media display container
  if (!movie.logo_path) {
    const title = document.createElement("h1");
    title.className =
      "text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-0 drop-shadow-lg text-center"; // Centered title
    title.textContent = movie.title || movie.name;
    titleAndGenresContainer.appendChild(title);
  }

  // Categories/Genres, Year, and Age Category
  const categoriesAndMetadataContainer = document.createElement("div");
  categoriesAndMetadataContainer.className =
    "flex flex-wrap gap-2 mt-2 md:mt-0 md:ml-4"; // Use similar styling as genresContainer

  if (movie.genres && movie.genres.length > 0) {
    movie.genres.forEach((genre) => {
      const genreSpan = document.createElement("span");
      genreSpan.className =
        "bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full";
      genreSpan.textContent = genre.name;
      categoriesAndMetadataContainer.appendChild(genreSpan);
    });
  }

  // Add year for movies here, if mediaType is movie
  if (mediaType === "movie" && movie.release_date) {
    const movieYearSpan = document.createElement("span");
    movieYearSpan.className =
      "bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full";
    movieYearSpan.textContent = movie.release_date.substring(0, 4);
    categoriesAndMetadataContainer.appendChild(movieYearSpan);
  }

  const ageRatingSpan = document.createElement("span");
  ageRatingSpan.className =
    "bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full"; // New style for age rating
  ageRatingSpan.textContent = movie.adult ? "+18" : "TP"; // Simple placeholder
  categoriesAndMetadataContainer.appendChild(ageRatingSpan);

  // Only append if there's content
  if (categoriesAndMetadataContainer.children.length > 0) {
    titleAndGenresContainer.appendChild(categoriesAndMetadataContainer);
  }

  // Buttons (Play and Add to Favorites) - Moved above tabs, styled as stacked rounded squares
  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "flex flex-col gap-3 mt-4 mb-4"; // Changed to flex-col for stacking
  contentWrapper.appendChild(buttonsContainer);

  const playButton = document.createElement("a");
  playButton.className =
    "bg-white text-gray-900 px-6 py-3 rounded-lg font-bold flex items-center justify-center transition-colors hover:bg-gray-300 text-base"; // Larger, rounded-lg
  playButton.innerHTML = '<i class="fas fa-play mr-2"></i> Reproducir';
  buttonsContainer.appendChild(playButton);

  // Trailer Button
  const trailerButton = document.createElement("button");
  trailerButton.id = "trailer-btn";
  trailerButton.className =
    "bg-orange-600 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center transition-colors hover:bg-orange-700 text-base";
  trailerButton.innerHTML = '<i class="fas fa-film mr-2"></i> Ver Trailer';
  buttonsContainer.appendChild(trailerButton);

  const myListButton = document.createElement("button");
  myListButton.className =
    "bg-gray-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center transition-colors hover:bg-gray-600 text-base"; // Larger, rounded-lg
  buttonsContainer.appendChild(myListButton);

  const updateFavoriteButton = () => {
    let favorites = JSON.parse(localStorage.getItem("yamiLatFavorites")) || [];
    const existingItem = favorites.find(
      (fav) => fav.id === movie.id && fav.type === mediaType
    );

    if (existingItem) {
      myListButton.innerHTML =
        '<i class="fas fa-check mr-2"></i> Añadido a Favoritos';
      myListButton.classList.add("added-to-favorites");
    } else {
      myListButton.innerHTML =
        '<i class="fas fa-plus mr-2"></i> Añadir a Favoritos';
      myListButton.classList.remove("added-to-favorites");
    }
  };

  updateFavoriteButton();

  myListButton.addEventListener("click", () => {
    let favorites = JSON.parse(localStorage.getItem("yamiLatFavorites")) || [];
    const existingItem = favorites.find(
      (fav) => fav.id === movie.id && fav.type === mediaType
    );

    if (!existingItem) {
      favorites.push({
        id: movie.id,
        type: mediaType,
        title:
          mediaType === "tv"
            ? movie.series_name || movie.name
            : movie.title || movie.name,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
      });
      localStorage.setItem("yamiLatFavorites", JSON.stringify(favorites));
      // showNotification(`${movie.title || movie.name} ha sido añadido a tus favoritos!`, "success");
    } else {
      favorites = favorites.filter(
        (fav) => !(fav.id === movie.id && fav.type === mediaType)
      );
      localStorage.setItem("yamiLatFavorites", JSON.stringify(favorites));
      // showNotification(`${movie.title || movie.name} ha sido eliminado de tus favoritos.`, "info");
    }
    updateFavoriteButton();
  });
  buttonsContainer.appendChild(myListButton);

  // Tabs
  const tabsContainer = document.createElement("div");
  tabsContainer.className =
    "flex justify-around border-b border-gray-700 mt-4 mb-4 bg-gray-900/80 backdrop-blur-sm z-40";
  contentWrapper.appendChild(tabsContainer);

  const infoTabButton = document.createElement("button");
  infoTabButton.id = "info-tab-btn";
  infoTabButton.className =
    "flex-1 py-3 text-sm font-semibold border-b-2 border-orange-500 text-orange-500 focus:outline-none transition-colors duration-200";
  infoTabButton.textContent = "Info";
  tabsContainer.appendChild(infoTabButton);

  const castTabButton = document.createElement("button");
  castTabButton.id = "cast-tab-btn";
  castTabButton.className =
    "flex-1 py-3 text-sm font-semibold text-gray-400 border-b-2 border-transparent hover:text-white hover:border-gray-500 focus:outline-none transition-colors duration-200";
  castTabButton.textContent = "Reparto";
  tabsContainer.appendChild(castTabButton);

  const commentsTabButton = document.createElement("button");
  commentsTabButton.id = "comments-tab-btn";
  commentsTabButton.className =
    "flex-1 py-3 text-sm font-semibold text-gray-400 border-b-2 border-transparent hover:text-white hover:border-gray-500 focus:outline-none transition-colors duration-200";
  commentsTabButton.textContent = "Comentarios";
  tabsContainer.appendChild(commentsTabButton);

  const tabContentContainer = document.createElement("div");
  tabContentContainer.className = "flex-grow overflow-y-auto pb-20"; // Added padding-bottom for nav bar
  contentWrapper.appendChild(tabContentContainer);

  // Info Tab Content
  const infoContent = document.createElement("div");
  infoContent.id = "info-content";
  infoContent.className = "tab-content pt-4"; // Added padding-top
  tabContentContainer.appendChild(infoContent);

  // Synopsis - Moved inside infoContent with read more/less functionality
  const synopsisContainer = document.createElement("div");
  synopsisContainer.className = "mb-4";
  infoContent.appendChild(synopsisContainer);

  const synopsisText = document.createElement("p");
  synopsisText.className = "text-sm md:text-base";
  synopsisContainer.appendChild(synopsisText);

  const fullSynopsis = movie.overview;
  const truncateLength = 150; // Characters
  let isTruncated = fullSynopsis.length > truncateLength;

  const updateSynopsisDisplay = () => {
    if (isTruncated) {
      synopsisText.textContent =
        fullSynopsis.substring(0, truncateLength) + "...";
      readMoreButton.textContent = "Leer más";
    } else {
      synopsisText.textContent = fullSynopsis;
      readMoreButton.textContent = "Leer menos";
    }
  };

  const readMoreButton = document.createElement("button");
  readMoreButton.className =
    "text-orange-500 hover:underline text-sm mt-1 focus:outline-none";
  readMoreButton.addEventListener("click", () => {
    isTruncated = !isTruncated;
    updateSynopsisDisplay();
  });

  if (fullSynopsis.length > truncateLength) {
    synopsisContainer.appendChild(readMoreButton);
  }
  updateSynopsisDisplay();

  // Cast Tab Content
  const castContent = document.createElement("div");
  castContent.id = "cast-content";
  castContent.className = "tab-content hidden pt-4"; // Hidden by default, added padding-top
  tabContentContainer.appendChild(castContent);

  // Comments Tab Content
  const commentsContent = document.createElement("div");
  commentsContent.id = "comments-content";
  commentsContent.className = "tab-content hidden pt-4"; // Hidden by default, added padding-top

  // Construct the URL for the Facebook comments plugin
  const currentUrl = window.location.href.split("?")[0];
  const commentsUrl = `${currentUrl}?mediaId=${mediaId}&mediaType=${mediaType}`;

  commentsContent.innerHTML = `
    <div class="fb-comments" data-href="${commentsUrl}" data-width="100%" data-numposts="5"></div>
  `;
  tabContentContainer.appendChild(commentsContent);

  // Tab Switching Logic
  infoTabButton.addEventListener("click", () => {
    infoTabButton.classList.add("border-orange-500", "text-orange-500");
    infoTabButton.classList.remove(
      "border-transparent",
      "text-gray-400",
      "hover:text-white"
    );
    castTabButton.classList.remove("border-orange-500", "text-orange-500");
    castTabButton.classList.add(
      "border-transparent",
      "text-gray-400",
      "hover:text-white"
    );
    commentsTabButton.classList.remove("border-orange-500", "text-orange-500");
    commentsTabButton.classList.add(
      "border-transparent",
      "text-gray-400",
      "hover:text-white"
    );
    infoContent.classList.remove("hidden");
    castContent.classList.add("hidden");
    commentsContent.classList.add("hidden");
    tabContentContainer.classList.remove("hidden"); // Show the main tab content container
  });

  castTabButton.addEventListener("click", async () => {
    castTabButton.classList.add("border-orange-500", "text-orange-500");
    castTabButton.classList.remove(
      "border-transparent",
      "text-gray-400",
      "hover:text-white"
    );
    infoTabButton.classList.remove("border-orange-500", "text-orange-500");
    infoTabButton.classList.add(
      "border-transparent",
      "text-gray-400",
      "hover:text-white"
    );
    commentsTabButton.classList.remove("border-orange-500", "text-orange-500");
    commentsTabButton.classList.add(
      "border-transparent",
      "text-gray-400",
      "hover:text-white"
    );
    castContent.classList.remove("hidden");
    infoContent.classList.add("hidden");
    commentsContent.classList.add("hidden");
    tabContentContainer.classList.remove("hidden"); // Show the main tab content container

    // Fetch and display cast only once
    if (castContent.children.length === 0) {
      const cast = await fetchCast(apiBaseUrl, mediaType, mediaId);
      if (cast && cast.length > 0) {
        const castSlider = document.createElement("div");
        castSlider.className =
          "flex overflow-x-auto space-x-4 pb-4 slider-container"; // Horizontal slider
        cast.slice(0, 10).forEach((actor) => {
          // Limit to 10 cast members for slider
          const actorCard = document.createElement("div");
          actorCard.className =
            "flex-shrink-0 w-24 flex flex-col items-center text-center"; // Fixed width for slider items
          if (actor.profile_path) {
            const actorImage = document.createElement("img");
            actorImage.src = `${imageBaseUrl}${actor.profile_path}`;
            actorImage.alt = actor.name;
            actorImage.className = "w-20 h-20 rounded-full object-cover mb-2";
            actorCard.appendChild(actorImage);
          } else {
            const placeholder = document.createElement("div");
            placeholder.className =
              "w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-2";
            placeholder.innerHTML =
              '<i class="fas fa-user text-2xl text-gray-400"></i>';
            actorCard.appendChild(placeholder);
          }
          const actorName = document.createElement("p");
          actorName.className = "text-sm font-semibold truncate w-full"; // Truncate long names
          actorName.textContent = actor.name;
          actorCard.appendChild(actorName);
          const characterName = document.createElement("p");
          characterName.className = "text-xs text-gray-400 truncate w-full"; // Truncate long characters
          characterName.textContent = actor.character;
          actorCard.appendChild(characterName);
          castSlider.appendChild(actorCard);
        });
        castContent.appendChild(castSlider);
      } else {
        castContent.innerHTML =
          "<p class='text-center text-gray-400'>No se encontró información del reparto.</p>";
      }
    }
  });

  commentsTabButton.addEventListener("click", () => {
    commentsTabButton.classList.add("border-orange-500", "text-orange-500");
    commentsTabButton.classList.remove(
      "border-transparent",
      "text-gray-400",
      "hover:text-white"
    );
    infoTabButton.classList.remove("border-orange-500", "text-orange-500");
    infoTabButton.classList.add(
      "border-transparent",
      "text-gray-400",
      "hover:text-white"
    );
    castTabButton.classList.remove("border-orange-500", "text-orange-500");
    castTabButton.classList.add(
      "border-transparent",
      "text-gray-400",
      "hover:text-white"
    );
    commentsContent.classList.remove("hidden");
    infoContent.classList.add("hidden");
    castContent.classList.add("hidden");
    tabContentContainer.classList.remove("hidden"); // Show the main tab content container

    // Parse the Facebook comments plugin after it's made visible
    if (typeof FB !== "undefined" && FB.XFBML) {
      FB.XFBML.parse(commentsContent);
    }
  });

  movieDetailContainer.appendChild(contentWrapper);

  movieDetailContainer.appendChild(contentWrapper);

  // Trailer Modal Structure
  const trailerModal = document.createElement("div");
  trailerModal.id = "trailer-modal";
  trailerModal.className =
    "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] hidden"; // Hidden by default, high z-index
  trailerModal.innerHTML = `
    <div class="relative w-11/12 max-w-3xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      <button id="close-trailer-modal" class="absolute top-3 right-3 text-white text-2xl z-10">
        <i class="fas fa-times-circle"></i>
      </button>
      <div id="trailer-iframe-container" class="w-full h-full">
        <!-- Trailer iframe will be loaded here -->
      </div>
    </div>
  `;
  movieDetailContainer.appendChild(trailerModal);

  // Event listener for trailer button
  if (trailer) {
    trailerButton.addEventListener("click", () => {
      const trailerIframeContainer = trailerModal.querySelector(
        "#trailer-iframe-container"
      );
      trailerIframeContainer.innerHTML = `
        <iframe
          src="https://www.youtube.com/embed/${trailer.key}?autoplay=1"
          allow="autoplay; encrypted-media"
          allowfullscreen
          class="w-full h-full"
        ></iframe>
      `;
      trailerModal.classList.remove("hidden");
    });
  } else {
    trailerButton.style.display = "none"; // Hide button if no trailer
  }

  // Find a suitable video for the "Reproducir" button
  const mainVideo = videos.find(
    (video) =>
      video.site === "YouTube" &&
      (video.type === "Clip" ||
        video.type === "Featurette" ||
        video.type === "Trailer")
  );

  if (mainVideo && playUrlTemplate) {
    playButton.href = playUrlTemplate.replace("{VIDEO_KEY}", mainVideo.key);
    playButton.target = "_blank"; // Open in a new tab
  } else {
    playButton.style.display = "none"; // Hide button if no main video
  }

  // Event listener for closing the modal
  trailerModal
    .querySelector("#close-trailer-modal")
    .addEventListener("click", () => {
      trailerModal.classList.add("hidden");
      trailerModal.querySelector("#trailer-iframe-container").innerHTML = ""; // Stop video playback
    });

  console.log("Returning movieDetailContainer:", movieDetailContainer);
  return movieDetailContainer;
}
