export function buildCard(imageBaseUrl, item) {
  const card = document.createElement("div");
  card.className = "bg-gray-800 rounded-lg shadow-md overflow-hidden";

  const imageUrl = item.poster_path
    ? `${imageBaseUrl}${item.poster_path}`
    : "https://via.placeholder.com/150x225?text=No+Image";
  const title =
    item.title || item.name || item.original_title || item.original_name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  card.innerHTML = `
    <img src="${imageUrl}" alt="${title}" class="w-full h-auto aspect-[2/3] object-cover" />
    <div class="p-4">
      <h3 class="text-base font-semibold text-white h-12 overflow-hidden">${title}</h3>
      <p class="text-gray-400 text-sm">${year}</p>
    </div>
  `;

  card.addEventListener("click", () => {
    window.location.href = `go:${item.id}`;
  });

  return card;
}
