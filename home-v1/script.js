import { tmdbApiKey } from "./config.js";

export async function fetchMediaDetails(
  apiBaseUrl,
  type,
  id,
  season_number = null,
  episode_number = null
) {
  try {
    let detailsData = null;
    const languagePriority = ["es-MX", "es-ES", "en"]; // Prioritize Spanish (Mexico), then Spanish (Castellano), then English

    // Try fetching main details with language priority
    for (const lang of languagePriority) {
      let url;
      if (type === "tv" && season_number !== null && episode_number !== null) {
        url = `${apiBaseUrl}/${type}/${id}/season/${season_number}/episode/${episode_number}?api_key=${tmdbApiKey}&language=${lang}`;
      } else {
        url = `${apiBaseUrl}/${type}/${id}?api_key=${tmdbApiKey}&language=${lang}`;
      }

      const detailsResponse = await fetch(url);
      if (detailsResponse.ok) {
        detailsData = await detailsResponse.json();
        // Check if essential fields like title/name or overview are present
        if (detailsData.title || detailsData.name || detailsData.overview) {
          break; // Found good data, stop trying other languages
        }
      }
    }

    // If no data found with specific languages, try without language parameter (TMDB default)
    if (
      !detailsData ||
      (!detailsData.title && !detailsData.name && !detailsData.overview)
    ) {
      let url;
      if (type === "tv" && season_number !== null && episode_number !== null) {
        url = `${apiBaseUrl}/${type}/${id}/season/${season_number}/episode/${episode_number}?api_key=${tmdbApiKey}`;
      } else {
        url = `${apiBaseUrl}/${type}/${id}?api_key=${tmdbApiKey}`;
      }
      const detailsResponse = await fetch(url);
      if (detailsResponse.ok) {
        detailsData = await detailsResponse.json();
      }
    }

    if (!detailsData) {
      detailsData = {}; // Initialize as empty object if no details found
      console.warn(
        `Could not fetch main details for ${type} with ID ${id} in any language.`
      );
    }

    // Logos / imágenes y stills para episodios
    let imagesData = { logos: [], stills: [] };
    try {
      let imagesUrl;
      if (type === "tv" && season_number !== null && episode_number !== null) {
        // Fetch images for a specific episode
        imagesUrl = `${apiBaseUrl}/${type}/${id}/season/${season_number}/episode/${episode_number}/images?api_key=${tmdbApiKey}&include_image_language=es-MX,es-ES,en,ja,null`;
      } else {
        // Fetch images for TV series/movies
        imagesUrl = `${apiBaseUrl}/${type}/${id}/images?api_key=${tmdbApiKey}&include_image_language=es-MX,es-ES,en,ja,null`;
      }

      const imagesResponse = await fetch(imagesUrl);
      if (imagesResponse.ok) {
        imagesData = await imagesResponse.json();
      } else {
        console.warn(
          `No se pudieron obtener imágenes para ${type} con ID ${id} (S${season_number}E${episode_number}).`
        );
      }
    } catch (err) {
      console.warn(`Error al obtener logos/stills de TMDB para ID ${id}:`, err);
    }

    // Seleccionar logo: prioridad es-MX > es-ES > en > ja > null
    let logoPath = null;
    if (imagesData.logos?.length > 0) {
      const priority = ["es-MX", "es-ES", "en", "ja", null]; // Prioritize Spanish (Mexico), then Spanish (Castellano), then English, then Japanese, then any other
      for (const lang of priority) {
        const logo = imagesData.logos.find((l) => l.iso_639_1 === lang);
        if (logo) {
          logoPath = logo.file_path;
          break;
        }
      }
      // If no specific language logo found, take the first available logo
      if (!logoPath && imagesData.logos.length > 0) {
        logoPath = imagesData.logos[0].file_path;
      }
    }

    // Seleccionar still para episodios: prioridad es-MX > es-ES > en > ja > null
    let stillPath = null;
    if (
      type === "tv" &&
      season_number !== null &&
      episode_number !== null &&
      imagesData.stills?.length > 0
    ) {
      const priority = ["es-MX", "es-ES", "en", "ja", null];
      for (const lang of priority) {
        const still = imagesData.stills.find((s) => s.iso_639_1 === lang);
        if (still) {
          stillPath = still.file_path;
          break;
        }
      }
      if (!stillPath && imagesData.stills.length > 0) {
        stillPath = imagesData.stills[0].file_path;
      }
    }

    // Ensure pageUrl is not present, as we are now using go:id
    if (detailsData.pageUrl) {
      delete detailsData.pageUrl;
    }

    return { ...detailsData, logo_path: logoPath, still_path: stillPath };
  } catch (error) {
    console.error(`Error fetching ${type} with ID ${id}:`, error);
    return null;
  }
}

export async function fetchTrendingMedia(
  apiBaseUrl,
  timeWindow = "week",
  mediaType = "all"
) {
  try {
    const url = `${apiBaseUrl}/trending/${mediaType}/${timeWindow}?api_key=${tmdbApiKey}&language=es-ES`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(
      `Error fetching trending ${mediaType} (${timeWindow}):`,
      error
    );
    return [];
  }
}

export function createHeroSlider(backdropBaseUrl, items) {
  const sliderContainer = document.createElement("div");
  sliderContainer.className =
    "flex overflow-x-auto snap-x snap-mandatory scroll-smooth hero-slider-container relative"; // Changed back to auto for manual sliding

  let currentSlideIndex = 0;
  const totalSlides = items.length;

  // Function to show a specific slide
  const showSlide = (index) => {
    sliderContainer.scrollTo({
      left: index * sliderContainer.offsetWidth,
      behavior: "smooth",
    });
    updateDots(index);
  };

  // Function to go to the next slide
  const nextSlide = () => {
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    showSlide(currentSlideIndex);
  };

  // Auto-advance slider
  let slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds

  // Pause on hover
  sliderContainer.addEventListener("mouseenter", () =>
    clearInterval(slideInterval)
  );
  sliderContainer.addEventListener("mouseleave", () => {
    slideInterval = setInterval(nextSlide, 5000);
  });

  items.forEach((item, index) => {
    if (item && item.poster_path) {
      const slide = document.createElement("div");
      slide.className =
        "flex-shrink-0 w-full snap-center hero-slider-item relative";
      slide.dataset.slideIndex = index; // Add data attribute for index
      slide.style.cursor = "pointer"; // Indicate it's clickable
      slide.addEventListener("click", (event) => {
        // Only navigate if the click wasn't on the play or info button
        if (!event.target.closest(".hero-button")) {
          window.location.href = `go:${item.id}`;
        }
      });

      // Set backdrop image as background-image for the slide
      if (item.backdrop_path) {
        slide.style.backgroundImage = `url(${backdropBaseUrl}${item.backdrop_path})`;
        slide.style.backgroundSize = "cover";
        slide.style.backgroundPosition = "center";
        slide.style.backgroundRepeat = "no-repeat";
      }

      // Overlay oscuro
      const gradientOverlay = document.createElement("div");
      gradientOverlay.className = "gradient-overlay";

      // Contenedor de contenido
      const contentContainer = document.createElement("div");
      contentContainer.className = "hero-content-container";

      const topContent = document.createElement("div");
      topContent.className = "flex flex-col";

      // --- LOGO encima del póster ---
      // Tipo de medio (Película/Serie)
      const mediaTypeSpan = document.createElement("span");
      mediaTypeSpan.className = "text-white text-sm font-semibold mb-1";
      mediaTypeSpan.textContent = item.type === "movie" ? "Película" : "Serie";
      topContent.appendChild(mediaTypeSpan);

      if (item.logo_path) {
        const logo = document.createElement("img");
        logo.src = `https://image.tmdb.org/t/p/original${item.logo_path}`;
        logo.alt = `${item.title || item.name} logo`;
        logo.className = "hero-title-logo absolute top-6 w-1/2 drop-shadow-lg"; // Removed conflicting centering classes
        slide.appendChild(logo); // Append to slide directly
      } else {
        // Si no hay logo, mostrar título como texto
        const fallbackTitle = document.createElement("h2");
        fallbackTitle.textContent = item.title || item.name;
        fallbackTitle.className =
          "absolute top-6 left-0 right-0 text-center text-3xl font-bold text-white drop-shadow-lg";
        slide.appendChild(fallbackTitle); // Append to slide directly
      }

      // Metadatos
      const metadataContainer = document.createElement("div");
      metadataContainer.className = "hero-metadata";

      if (item.genres && item.genres.length > 0) {
        item.genres.slice(0, 3).forEach((genre, index) => {
          const span = document.createElement("span");
          span.textContent = genre.name;
          metadataContainer.appendChild(span);
          if (index < item.genres.slice(0, 3).length - 1) {
            const dot = document.createElement("div");
            dot.className = "dot";
            metadataContainer.appendChild(dot);
          }
        });
      }
      topContent.appendChild(metadataContainer);

      const description = document.createElement("p");
      description.className =
        "text-white text-lg mt-4 mb-6 max-w-2xl line-clamp-3";
      description.textContent = item.overview || "";

      // Botones
      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "hero-buttons-container";

      const playButton = document.createElement("a");
      playButton.href = `go:${item.id}`;
      playButton.className = "hero-button play";
      playButton.innerHTML =
        '<i class="fas fa-play text-xl mr-3"></i> Reproducir';

      const myListButton = document.createElement("button");
      myListButton.className = "hero-button secondary-icon";

      const updateFavoriteButton = () => {
        let favorites =
          JSON.parse(localStorage.getItem("yamiLatFavorites")) || [];
        const existingItem = favorites.find(
          (fav) => fav.id === item.id && fav.type === item.type
        );

        if (existingItem) {
          myListButton.innerHTML =
            '<i class="fas fa-check text-2xl"></i><span class="text-xs mt-1">Añadido a Favoritos</span>';
          myListButton.classList.add("added-to-favorites"); // Add a class for styling if needed
        } else {
          myListButton.innerHTML =
            '<i class="fas fa-plus text-2xl"></i><span class="text-xs mt-1">Añadir a Favoritos</span>';
          myListButton.classList.remove("added-to-favorites");
        }
      };

      updateFavoriteButton(); // Set initial state

      myListButton.addEventListener("click", () => {
        let favorites =
          JSON.parse(localStorage.getItem("yamiLatFavorites")) || [];
        const existingItem = favorites.find(
          (fav) => fav.id === item.id && fav.type === item.type
        );

        if (!existingItem) {
          favorites.push({
            id: item.id,
            type: item.type,
            title: item.title || item.name,
          });
          localStorage.setItem("yamiLatFavorites", JSON.stringify(favorites));
          showNotification(
            `${item.title || item.name} ha sido añadido a tus favoritos!`,
            "success"
          );
        } else {
          // If already in favorites, remove it (toggle functionality)
          favorites = favorites.filter(
            (fav) => !(fav.id === item.id && fav.type === item.type)
          );
          localStorage.setItem("yamiLatFavorites", JSON.stringify(favorites));
          showNotification(
            `${item.title || item.name} ha sido eliminado de tus favoritos.`,
            "info"
          );
        }
        updateFavoriteButton(); // Update button state after click
      });

      const infoButton = document.createElement("button");
      infoButton.className = "hero-button secondary-icon";
      infoButton.innerHTML =
        '<i class="fas fa-info-circle text-2xl"></i><span class="text-xs mt-1">Info</span>';
      infoButton.addEventListener("click", () => {
        window.location.href = `go:${item.id}`;
      });

      buttonsContainer.append(myListButton, playButton, infoButton);

      contentContainer.append(topContent, description, buttonsContainer);

      // Añadir todo al slide
      slide.append(gradientOverlay, contentContainer); // Removed backgroundImage
      sliderContainer.appendChild(slide);
    }
  });

  // Navigation dots container
  const dotsContainer = document.createElement("div");
  dotsContainer.className = "hero-slider-dots";
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement("span");
    dot.className = "hero-slider-dot";
    dot.addEventListener("click", () => {
      currentSlideIndex = i;
      showSlide(currentSlideIndex);
      clearInterval(slideInterval); // Reset interval on manual interaction
      slideInterval = setInterval(nextSlide, 5000);
    });
    dotsContainer.appendChild(dot);
  }

  // Function to update active dot
  const updateDots = (activeIndex) => {
    dotsContainer.querySelectorAll(".hero-slider-dot").forEach((dot, i) => {
      if (i === activeIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  };

  // Initial dot update
  if (totalSlides > 0) {
    updateDots(currentSlideIndex);
  }

  const wrapper = document.createElement("div");
  wrapper.className = "hero-slider-wrapper relative";
  wrapper.appendChild(sliderContainer);
  wrapper.appendChild(dotsContainer);

  return wrapper;
}

// Function to show a notification
function showNotification(message, type = "info") {
  const notificationContainer = document.getElementById(
    "notification-container"
  );
  if (!notificationContainer) {
    console.warn("Notification container not found.");
    return;
  }

  const notification = document.createElement("div");
  notification.className = `notification ${type} p-3 mb-2 rounded-lg shadow-md text-white`;
  notification.textContent = message;

  // Tailwind classes for styling
  if (type === "success") {
    notification.classList.add("bg-green-500");
  } else if (type === "info") {
    notification.classList.add("bg-blue-500");
  } else if (type === "error") {
    notification.classList.add("bg-red-500");
  } else {
    notification.classList.add("bg-gray-700");
  }

  notificationContainer.prepend(notification); // Add to top

  // Automatically remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

export function createContentSlider(imageBaseUrl, title, items) {
  const section = document.createElement("section");
  section.className = "mb-8";

  const h2 = document.createElement("h2");
  h2.className = "text-xl font-bold mb-4 text-orange-500";
  h2.textContent = title;
  section.appendChild(h2);

  const sliderContainer = document.createElement("div");
  sliderContainer.className =
    "flex overflow-x-auto space-x-3 md:space-x-4 pb-4 slider-container";

  items.forEach((item) => {
    if (item && (item.poster_path || item.backdrop_path)) {
      const contentCard = document.createElement("a");
      // Construct the URL for episodes
      if (item.type === "tv" && item.season_number && item.episode_number) {
        contentCard.href = `go:${item.id}S${item.season_number}E${item.episode_number}`;
      } else {
        contentCard.href = `go:${item.id}`;
      }
      let cardClasses = "flex-shrink-0 relative p-1"; // Added relative positioning and padding
      if (title === "Últimos Capítulos") {
        cardClasses += " episode-card";
      } else {
        cardClasses += " poster-card";
      }
      contentCard.className = cardClasses;

      const posterImage = document.createElement("img");
      posterImage.src = imageBaseUrl + (item.still_path || item.poster_path);
      posterImage.alt = item.name || item.title;
      posterImage.className = "rounded-lg"; // The new CSS classes handle width, height, and object-fit
      posterImage.loading = "lazy";

      contentCard.append(posterImage);

      if (title === "Más Vistos" && item.rank) {
        const rankOverlay = document.createElement("div");
        rankOverlay.className = "rank-overlay absolute top-2 right-2"; // Changed to top-right with offset
        rankOverlay.textContent = item.rank;
        contentCard.appendChild(rankOverlay);
      }

      const contentTitle = document.createElement("p");
      contentTitle.className = "text-sm mt-2 truncate";
      contentTitle.textContent = item.name || item.title; // Use item.name for episode titles

      contentCard.append(contentTitle);

      if (item.episode_number && item.season_number) {
        const episodeInfo = document.createElement("p");
        episodeInfo.className = "text-xs text-gray-400";
        episodeInfo.textContent = `T${item.season_number} E${item.episode_number}`;
        contentCard.appendChild(episodeInfo);
      }

      sliderContainer.appendChild(contentCard);
    }
  });

  section.appendChild(sliderContainer);
  return section;
}

export async function fetchOnTheAirTvShows(apiBaseUrl) {
  try {
    const url = `${apiBaseUrl}/tv/on_the_air?api_key=${tmdbApiKey}&language=es-ES`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching on the air TV shows:", error);
    return [];
  }
}
