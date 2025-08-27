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

export async function fetchMovieVideos(apiBaseUrl, movieId) {
  try {
    const url = `${apiBaseUrl}/movie/${movieId}/videos?api_key=${tmdbApiKey}&language=es-ES`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Error fetching videos for movie ID ${movieId}:`, error);
    return [];
  }
}

export async function fetchCast(
  apiBaseUrl,
  type,
  id,
  season_number = null,
  episode_number = null
) {
  try {
    let url;
    if (type === "movie") {
      url = `${apiBaseUrl}/movie/${id}/credits?api_key=${tmdbApiKey}&language=es-ES`;
    } else if (
      type === "tv" &&
      season_number !== null &&
      episode_number !== null
    ) {
      url = `${apiBaseUrl}/tv/${id}/season/${season_number}/episode/${episode_number}/credits?api_key=${tmdbApiKey}&language=es-ES`;
    } else if (type === "tv") {
      url = `${apiBaseUrl}/tv/${id}/credits?api_key=${tmdbApiKey}&language=es-ES`;
    } else {
      throw new Error("Unsupported media type for fetching cast.");
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.cast || data.crew; // For episodes, it might be 'crew' for guest stars
  } catch (error) {
    console.error(`Error fetching cast for ${type} with ID ${id}:`, error);
    return [];
  }
}

export async function fetchTvSeasonDetails(apiBaseUrl, tvId, seasonNumber) {
  try {
    const url = `${apiBaseUrl}/tv/${tvId}/season/${seasonNumber}?api_key=${tmdbApiKey}&language=es-ES`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.episodes;
  } catch (error) {
    console.error(
      `Error fetching season ${seasonNumber} details for TV ID ${tvId}:`,
      error
    );
    return [];
  }
}

export async function fetchEpisodeDetails(
  apiBaseUrl,
  tvId,
  seasonNumber,
  episodeNumber
) {
  try {
    const languagePriority = ["es-MX", "es-ES", "en"];
    let episodeData = null;

    for (const lang of languagePriority) {
      const url = `${apiBaseUrl}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${tmdbApiKey}&language=${lang}`;
      const response = await fetch(url);
      if (response.ok) {
        episodeData = await response.json();
        if (episodeData.name || episodeData.overview) {
          break;
        }
      }
    }

    if (!episodeData || (!episodeData.name && !episodeData.overview)) {
      const url = `${apiBaseUrl}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${tmdbApiKey}`;
      const response = await fetch(url);
      if (response.ok) {
        episodeData = await response.json();
      }
    }

    if (!episodeData) {
      console.warn(
        `Could not fetch episode details for TV ID ${tvId}, Season ${seasonNumber}, Episode ${episodeNumber} in any language.`
      );
      return null;
    }

    // Fetch images for the specific episode
    let imagesData = { stills: [] };
    try {
      const imagesUrl = `${apiBaseUrl}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/images?api_key=${tmdbApiKey}&include_image_language=es-MX,es-ES,en,ja,null`;
      const imagesResponse = await fetch(imagesUrl);
      if (imagesResponse.ok) {
        imagesData = await imagesResponse.json();
      } else {
        console.warn(
          `No se pudieron obtener imágenes para el episodio ${episodeNumber} de la temporada ${seasonNumber} de TV ID ${tvId}.`
        );
      }
    } catch (err) {
      console.warn(
        `Error al obtener stills de TMDB para el episodio ${episodeNumber}:`,
        err
      );
    }

    let stillPath = null;
    if (imagesData.stills?.length > 0) {
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

    return { ...episodeData, still_path: stillPath };
  } catch (error) {
    console.error(
      `Error fetching episode details for TV ID ${tvId}, Season ${seasonNumber}, Episode ${episodeNumber}:`,
      error
    );
    return null;
  }
}

export async function fetchContentRatings(apiBaseUrl, movieId) {
  try {
    const url = `${apiBaseUrl}/movie/${movieId}/release_dates?api_key=${tmdbApiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Filter for release dates that have a certification
    const ratings = data.results.filter(
      (result) =>
        result.release_dates.length > 0 && result.release_dates[0].certification
    );
    // Map to a simpler array of { iso_3166_1, rating }
    return ratings.map((result) => ({
      iso_3166_1: result.iso_3166_1,
      rating: result.release_dates[0].certification,
    }));
  } catch (error) {
    console.error(
      `Error fetching content ratings for movie ID ${movieId}:`,
      error
    );
    return [];
  }
}
