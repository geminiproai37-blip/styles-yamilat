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
