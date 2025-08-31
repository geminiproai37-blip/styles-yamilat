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

export async function fetchSeries(apiBaseUrl) {
  try {
    const url = `${apiBaseUrl}/discover/tv?api_key=${tmdbApiKey}&language=es-ES&sort_by=popularity.desc&include_adult=false&page=1`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching series:", error);
    return [];
  }
}

export async function fetchSpecificSeries(apiBaseUrl, seriesData) {
  try {
    const seriesDetailsPromises = seriesData.map(async (seriesItem) => {
      if (seriesItem.type === "tv") {
        return await fetchMediaDetails(
          apiBaseUrl,
          seriesItem.type,
          seriesItem.id
        );
      }
      return null;
    });
    const series = await Promise.all(seriesDetailsPromises);
    return series.filter(Boolean); // Filter out null values
  } catch (error) {
    console.error("Error fetching specific series:", error);
    return [];
  }
}
