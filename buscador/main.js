document.addEventListener("DOMContentLoaded", async () => {
  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

  const searchInput = document.getElementById("search-input");
  const searchResultsDiv = document.getElementById("search-results");
  const backButton = document.getElementById("back-button");

  backButton.addEventListener("click", () => {
    window.history.back();
  });

  let allMedia = [];

  // Fetch all media details once
  for (const sectionData of window.contentData) {
    const detailedItems = await Promise.all(
      sectionData.items.map(async (item) => {
        const details = await window.fetchMediaDetails(
          apiBaseUrl,
          item.type,
          item.id,
          item.season_number,
          item.episode_number
        );
        return details
          ? { ...item, ...details, media_type: item.type }
          : { ...item, media_type: item.type };
      })
    );
    allMedia.push(...detailedItems);
  }

  // Remove duplicates based on id and type
  const uniqueMedia = Array.from(
    new Map(allMedia.map((item) => [`${item.id}-${item.type}`, item])).values()
  );

  const displayResults = (results) => {
    searchResultsDiv.innerHTML = "";
    if (results.length === 0) {
      searchResultsDiv.innerHTML =
        "<p class='text-center text-gray-400 col-span-full'>No se encontraron resultados.</p>";
      return;
    }
    results.forEach((item) => {
      searchResultsDiv.appendChild(window.buildCard(imageBaseUrl, item));
    });
  };

  // Initial display of all unique media
  displayResults(uniqueMedia);

  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    const filteredMedia = uniqueMedia.filter((item) => {
      const title =
        item.title || item.name || item.original_title || item.original_name;
      return title && title.toLowerCase().includes(query);
    });
    displayResults(filteredMedia);
  });
});
