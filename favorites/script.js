import { tmdbApiKey } from "./config.js";

export async function fetchMediaDetails(
  apiBaseUrl,
  type,
  id,
  season_number = null,
  episode_number = null
) {
  try {
    let mainDetails = {};
    let episodeDetails = null;
    let episodeStills = [];
    const languagePriority = ["es-MX", "es-ES", "en"];

    // 1. Fetch main media details (series or movie)
    for (const lang of languagePriority) {
      const url = `${apiBaseUrl}/${type}/${id}?api_key=${tmdbApiKey}&language=${lang}`;
      const response = await fetch(url);
      if (response.ok) {
        mainDetails = await response.json();
        if (mainDetails.title || mainDetails.name || mainDetails.overview) {
          break;
        }
      }
    }
    if (!mainDetails.id) {
      // Fallback without language if no good data found
      const url = `${apiBaseUrl}/${type}/${id}?api_key=${tmdbApiKey}`;
      const response = await fetch(url);
      if (response.ok) {
        mainDetails = await response.json();
      }
    }

    if (!mainDetails.id) {
      console.warn(
        `Could not fetch main details for ${type} with ID ${id} in any language.`
      );
      return null; // Cannot proceed without main media details
    }

    // 2. Fetch main media images (logos, backdrops, posters)
    let mainImagesData = { logos: [], backdrops: [], posters: [] };
    try {
      const imagesUrl = `${apiBaseUrl}/${type}/${id}/images?api_key=${tmdbApiKey}&include_image_language=es-MX,es-ES,en,ja,null`;
      const imagesResponse = await fetch(imagesUrl);
      if (imagesResponse.ok) {
        mainImagesData = await imagesResponse.json();
      } else {
        console.warn(
          `No se pudieron obtener imágenes principales para ${type} con ID ${id}.`
        );
      }
    } catch (err) {
      console.warn(
        `Error al obtener imágenes principales de TMDB para ID ${id}:`,
        err
      );
    }

    // Select logo from main images
    let logoPath = null;
    if (mainImagesData.logos?.length > 0) {
      const priority = ["es-MX", "es-ES", "en", "ja", null];
      for (const lang of priority) {
        const logo = mainImagesData.logos.find((l) => l.iso_639_1 === lang);
        if (logo) {
          logoPath = logo.file_path;
          break;
        }
      }
      if (!logoPath && mainImagesData.logos.length > 0) {
        logoPath = mainImagesData.logos[0].file_path;
      }
    }

    // 3. If it's a TV show and season/episode numbers are provided, fetch episode details and stills
    if (type === "tv" && season_number !== null && episode_number !== null) {
      for (const lang of languagePriority) {
        const url = `${apiBaseUrl}/${type}/${id}/season/${season_number}/episode/${episode_number}?api_key=${tmdbApiKey}&language=${lang}`;
        const response = await fetch(url);
        if (response.ok) {
          episodeDetails = await response.json();
          if (episodeDetails.name || episodeDetails.overview) {
            break;
          }
        }
      }
      if (
        !episodeDetails ||
        (!episodeDetails.name && !episodeDetails.overview)
      ) {
        // Fallback without language
        const url = `${apiBaseUrl}/${type}/${id}/season/${season_number}/episode/${episode_number}?api_key=${tmdbApiKey}`;
        const response = await fetch(url);
        if (response.ok) {
          episodeDetails = await response.json();
        }
      }

      if (!episodeDetails) {
        console.warn(
          `Could not fetch episode details for TV ID ${id}, Season ${season_number}, Episode ${episode_number} in any language.`
        );
      }

      // Fetch episode stills
      try {
        const stillsUrl = `${apiBaseUrl}/${type}/${id}/season/${season_number}/episode/${episode_number}/images?api_key=${tmdbApiKey}&include_image_language=es-MX,es-ES,en,ja,null`;
        const stillsResponse = await fetch(stillsUrl);
        if (stillsResponse.ok) {
          episodeStills = (await stillsResponse.json()).stills || [];
        } else {
          console.warn(
            `No se pudieron obtener stills para el episodio ${episode_number} de la temporada ${season_number} de TV ID ${id}.`
          );
        }
      } catch (err) {
        console.warn(
          `Error al obtener stills de TMDB para episodio ${episode_number}:`,
          err
        );
      }
    }

    // Select still for episodes: priority es-MX > es-ES > en > ja > null
    let stillPath = null;
    if (episodeStills.length > 0) {
      const priority = ["es-MX", "es-ES", "en", "ja", null];
      for (const lang of priority) {
        const still = episodeStills.find((s) => s.iso_639_1 === lang);
        if (still) {
          stillPath = still.file_path;
          break;
        }
      }
      if (!stillPath && episodeStills.length > 0) {
        stillPath = episodeStills[0].file_path;
      }
    }

    // Combine main details with episode details, prioritizing episode details for specific fields
    const combinedDetails = { ...mainDetails, logo_path: logoPath };
    if (episodeDetails) {
      combinedDetails.episode_name = episodeDetails.name;
      combinedDetails.episode_overview = episodeDetails.overview;
      combinedDetails.episode_number = episodeDetails.episode_number;
      combinedDetails.season_number = episodeDetails.season_number;
      combinedDetails.still_path = stillPath; // Episode still
      // Override main overview/title if episode has them and they are more relevant
      if (episodeDetails.overview)
        combinedDetails.overview = episodeDetails.overview;
      if (episodeDetails.name) combinedDetails.name = episodeDetails.name; // For display purposes, might show episode name
    }

    // Ensure pageUrl is not present, as we are now using go:id
    if (combinedDetails.pageUrl) {
      delete combinedDetails.pageUrl;
    }

    return combinedDetails;
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
    const languagePriority = ["es-MX", "es-ES", "en"];
    let seasonData = null;

    for (const lang of languagePriority) {
      const url = `${apiBaseUrl}/tv/${tvId}/season/${seasonNumber}?api_key=${tmdbApiKey}&language=${lang}`;
      const response = await fetch(url);
      if (response.ok) {
        seasonData = await response.json();
        if (seasonData.episodes && seasonData.episodes.length > 0) {
          // Check if episodes have names or overviews
          const hasContent = seasonData.episodes.some(
            (ep) => ep.name || ep.overview
          );
          if (hasContent) {
            break;
          }
        }
      }
    }

    if (
      !seasonData ||
      !seasonData.episodes ||
      seasonData.episodes.length === 0
    ) {
      // Fallback without language if no good data found
      const url = `${apiBaseUrl}/tv/${tvId}/season/${seasonNumber}?api_key=${tmdbApiKey}`;
      const response = await fetch(url);
      if (response.ok) {
        seasonData = await response.json();
      }
    }

    if (!seasonData || !seasonData.episodes) {
      console.warn(
        `Could not fetch season ${seasonNumber} details for TV ID ${tvId} in any language.`
      );
      return [];
    }

    console.log(
      `TMDB Season ${seasonNumber} details for TV ID ${tvId}:`,
      seasonData.episodes
    ); // Added for debugging
    return seasonData.episodes;
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
