document.addEventListener("DOMContentLoaded", () => {
  const generatorForm = document.getElementById("generator-form");
  const outputHtml = document.getElementById("output-html");
  console.log("outputHtml:", outputHtml);
  const htmlModal = document.getElementById("html-modal");
  console.log("htmlModal element:", htmlModal);
  console.log("htmlModal:", htmlModal);
  const closeModalBtn = document.getElementById("close-modal");
  console.log("closeModalBtn:", closeModalBtn);
  const copyHtmlBtn = document.getElementById("copy-html");
  const mediaListContainer = document.getElementById("media-list-container");
  const generateHtmlBtn = document.getElementById("generate-html-btn");
  const searchInput = document.getElementById("search-input"); // Get reference to search input
  const sectionTitleDisplay = document.getElementById("section-title-display"); // Get reference to section title display

  // Add Item Modal Elements
  const openAddItemModalBtn = document.getElementById(
    "open-add-item-modal-btn"
  );
  const addItemModal = document.getElementById("add-item-modal");
  const closeAddItemModalBtn = document.getElementById("close-add-item-modal");
  const modalMoviesIdInput = document.getElementById("modal-Movies-id");
  const confirmAddItemBtn = document.getElementById("confirm-add-item-btn");
  const openTmdbBtn = document.getElementById("open-tmdb-btn");

  // Edit Item Modal Elements
  const editItemModal = document.getElementById("edit-item-modal");
  const closeEditItemModalBtn = document.getElementById(
    "close-edit-item-modal"
  );
  const editModalMoviesIdInput = document.getElementById(
    "edit-modal-Movies-id"
  );
  const confirmEditItemBtn = document.getElementById("confirm-edit-item-btn");
  const editOpenTmdbBtn = document.getElementById("edit-open-tmdb-btn");
  let itemToEditIndex = null; // To store the index of the item being edited

  // Clear Fields Button (now only clears modal fields)
  // const clearFieldsBtn = document.getElementById("clear-fields-btn"); // This button is removed from HTML

  // Confirmation Modal Elements
  const confirmationModal = document.getElementById("confirmation-modal");
  const confirmationMessage = document.getElementById("confirmation-message");
  const cancelDeleteBtn = document.getElementById("cancel-delete");
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  let itemToDelete = null; // To store the element to be deleted

  // Copy Confirmation Modal Elements
  const copyConfirmationModal = document.getElementById(
    "copy-confirmation-modal"
  );
  const closeCopyConfirmationModalBtn = document.getElementById(
    "close-copy-confirmation-modal"
  );

  // Load HTML Modal Elements
  const loadHtmlBtn = document.getElementById("load-html-btn");
  const loadHtmlModal = document.getElementById("load-html-modal");
  const closeLoadHtmlModalBtn = document.getElementById(
    "close-load-html-modal"
  );
  const inputHtmlToLoad = document.getElementById("input-html-to-load");
  const loadHtmlIntoGeneratorBtn = document.getElementById(
    "load-html-into-generator"
  );

  // Clear Database Button
  const clearDatabaseBtn = document.getElementById("clear-database-btn");

  // Clear Database Confirmation Modal Elements
  const clearDbConfirmationModal = document.getElementById(
    "clear-db-confirmation-modal"
  );
  const cancelClearDbBtn = document.getElementById("cancel-clear-db");
  const confirmClearDbBtn = document.getElementById("confirm-clear-db");

  // Clear Success Modal Elements
  const clearSuccessModal = document.getElementById("clear-success-modal");
  const closeClearSuccessModalBtn = document.getElementById(
    "close-clear-success-modal"
  );

  const TMDB_API_KEY = "b619bab44d405bb6c49b14dfc7365b51"; // Using the provided API Key. For production, consider using your own key.

  console.log("generator.js script loaded.");
  console.log("loadHtmlBtn:", document.getElementById("load-html-btn"));

  // Function to clear add item modal fields
  const clearAddItemModalFields = () => {
    modalMoviesIdInput.value = "";
  };

  // Function to clear edit item modal fields
  const clearEditItemModalFields = () => {
    editModalMoviesIdInput.value = "";
  };

  generateHtmlBtn.addEventListener("click", async () => {
    const items = contentData[0].items;
    const itemStrings = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let mediaTitle = "";
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${item.type}/${item.id}?api_key=${TMDB_API_KEY}&language=es-ES`
        );
        if (response.ok) {
          const data = await response.json();
          mediaTitle = data.name || data.title || "Título Desconocido";
        } else {
          mediaTitle = "Error al cargar título";
        }
      } catch (error) {
        console.error(
          "Error fetching media details for HTML generation:",
          error
        );
        mediaTitle = "Error de red";
      }
      // Add comma after the object, before the comment, for all but the last item
      const comma = i < items.length - 1 ? "," : "";
      itemStrings.push(
        `        { "type": "${item.type}", "id": ${item.id} }${comma} // ${mediaTitle}`
      );
    }

    let movieDataString = "[\n" + itemStrings.join("\n") + "\n      ];";

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Yami Lat - Tu Guía de Anime</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/geminiproai37-blip/styles-yamilat@main/peliculas-estilos/style.css" />
  </head>
  <body class="bg-gray-900 text-white">
    <div id="app-root"></div>
    <div id="notification-container" class="fixed bottom-4 right-4 z-50"></div>
    <script>
      const movieData = ${movieDataString}
 </script>
    <script type="module" src="https://cdn.jsdelivr.net/gh/geminiproai37-blip/styles-yamilat@main/peliculas-estilos/main.js"></script>
  </body>
</html>
`;

    outputHtml.value = htmlTemplate.trim();
    htmlModal.classList.remove("hidden"); // Show the modal
  });

  // Initialize contentData to strictly enforce a single section
  let contentData = [
    {
      title: "", // Only one section
      isHero: false,
      items: [],
    },
  ];

  // Store fetched media titles to avoid repeated API calls for filtering
  let mediaTitlesCache = new Map();

  // Load existing items for this single section from localStorage if available
  const storedContentData = JSON.parse(localStorage.getItem("contentData"));
  if (
    storedContentData &&
    storedContentData.length > 0 &&
    storedContentData[0].items
  ) {
    // Ensure only items from the first section are loaded into our single section
    contentData[0].items = storedContentData[0].items;
  }

  // Function to save contentData to localStorage
  const saveContentData = () => {
    localStorage.setItem("contentData", JSON.stringify(contentData));
    renderMediaList(); // Re-enabled as per user request for real-time updates
  };

  // Function to fetch media title and poster
  const fetchMediaDetails = async (item) => {
    if (mediaTitlesCache.has(item.id)) {
      return mediaTitlesCache.get(item.id);
    }
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${item.type}/${item.id}?api_key=${TMDB_API_KEY}&language=es-ES`
      );
      if (response.ok) {
        const data = await response.json();
        const mediaTitle = data.name || data.title || "Título Desconocido";
        const posterPath = data.poster_path
          ? `https://image.tmdb.org/t/p/w92${data.poster_path}`
          : "";
        mediaTitlesCache.set(item.id, { mediaTitle, posterPath });
        return { mediaTitle, posterPath };
      } else {
        return { mediaTitle: "Error al cargar título", posterPath: "" };
      }
    } catch (error) {
      console.error("Error fetching media details:", error);
      return { mediaTitle: "Error de red", posterPath: "" };
    }
  };

  // Function to render the list of media items
  const renderMediaList = async () => {
    console.log("renderMediaList called.");
    mediaListContainer.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase();

    // Update the section title display
    sectionTitleDisplay.textContent = contentData[0].title || "Movies de Anime";

    if (contentData.length === 0) {
      mediaListContainer.innerHTML =
        "<p class='text-slate-400'>No hay secciones ni elementos en la base de datos.</p>";
      return;
    }

    for (const [sectionIndex, section] of contentData.entries()) {
      const sectionWrapper = document.createElement("div");
      sectionWrapper.className = "bg-slate-800 p-4 rounded-lg shadow-md mb-6"; // Styled section container
      mediaListContainer.appendChild(sectionWrapper);

      const sectionHeader = document.createElement("h3");
      sectionHeader.className =
        "text-xl font-bold text-orange-500 mb-4 border-b border-slate-700 pb-2 text-center"; // Enhanced section header with text-center
      sectionHeader.textContent = section.title;
      sectionWrapper.appendChild(sectionHeader);

      const filteredItems = [];
      for (const item of section.items) {
        const { mediaTitle } = await fetchMediaDetails(item);
        if (mediaTitle.toLowerCase().includes(searchTerm)) {
          filteredItems.push({ ...item, mediaTitle });
        }
      }

      if (filteredItems.length === 0) {
        const noItemsMessage = document.createElement("p");
        noItemsMessage.className = "text-slate-400 italic";
        noItemsMessage.textContent = `No hay elementos que coincidan con la búsqueda en la sección "${section.title}".`;
        sectionWrapper.appendChild(noItemsMessage);
        continue;
      }

      const sectionItemsContainer = document.createElement("div");
      sectionItemsContainer.className =
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 custom-scrollbar"; // Container for items within a section with scroll, now with grid and gap
      sectionWrapper.appendChild(sectionItemsContainer);

      for (const item of filteredItems) {
        const listItem = document.createElement("div");
        listItem.className =
          "flex items-center bg-slate-700 p-3 rounded-md shadow-sm hover:bg-slate-600 transition-colors duration-200"; // Enhanced list item styling

        const { mediaTitle, posterPath } = await fetchMediaDetails(item);
        const posterHtml = posterPath
          ? `<img src="${posterPath}" alt="Póster" class="w-12 h-auto rounded-md mr-3 flex-shrink-0">`
          : "";

        listItem.innerHTML = `
          ${posterHtml}
          <div class="flex-grow overflow-hidden">
            <span class="text-slate-200 font-medium truncate block">${mediaTitle}</span>
            <p class="text-xs text-slate-400">ID: ${
              item.id
            } | Tipo: ${item.type.toUpperCase()} ${
          item.rank ? `| Rank: ${item.rank}` : ""
        }</p>
          </div>
          <div class="flex-shrink-0 ml-3 space-x-2">
            <button type="button" data-section-index="${sectionIndex}" data-item-id="${
          item.id
        }" data-item-type="${
          item.type
        }" class="edit-item-btn text-blue-400 hover:text-blue-300 p-1 rounded-full hover:bg-slate-500 transition-colors duration-200">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button type="button" data-section-index="${sectionIndex}" data-item-id="${
          item.id
        }" data-item-type="${
          item.type
        }" class="delete-item-btn text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-slate-500 transition-colors duration-200">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
        sectionItemsContainer.appendChild(listItem);
      }
    }

    // Add event listeners for edit buttons
    document.querySelectorAll(".edit-item-btn").forEach((button) => {
      button.addEventListener("click", async (e) => {
        e.stopPropagation();
        const sectionIndex = parseInt(e.currentTarget.dataset.sectionIndex);
        const itemId = parseInt(e.currentTarget.dataset.itemId);
        const itemType = e.currentTarget.dataset.itemType;

        const originalItemIndex = contentData[sectionIndex].items.findIndex(
          (original) => original.id === itemId && original.type === itemType
        );

        if (originalItemIndex !== -1) {
          itemToEditIndex = { section: sectionIndex, item: originalItemIndex };
          editModalMoviesIdInput.value =
            contentData[sectionIndex].items[originalItemIndex].id;
          editItemModal.classList.remove("hidden");
        } else {
          console.error("Original item not found for editing.");
        }
      });
    });

    // Add event listeners for delete buttons
    document.querySelectorAll(".delete-item-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const sectionIndex = parseInt(e.currentTarget.dataset.sectionIndex);
        const itemId = parseInt(e.currentTarget.dataset.itemId);
        const itemType = e.currentTarget.dataset.itemType;

        const originalItem = contentData[sectionIndex].items.find(
          (original) => original.id === itemId && original.type === itemType
        );

        if (originalItem) {
          itemToDelete = {
            section: sectionIndex,
            originalItem: originalItem,
          };

          fetch(
            `https://api.themoviedb.org/3/${originalItem.type}/${originalItem.id}?api_key=${TMDB_API_KEY}&language=es-ES`
          )
            .then((response) => response.json())
            .then((data) => {
              const title = data.name || data.title || "este elemento";
              confirmationMessage.textContent = `¿Estás seguro de que quieres eliminar "${title}" de la sección "${contentData[sectionIndex].title}"? Esta acción no se puede deshacer.`;
              confirmationModal.classList.remove("hidden");
            })
            .catch((error) => {
              console.error("Error fetching title for confirmation:", error);
              confirmationMessage.textContent = `¿Estás seguro de que quieres eliminar este elemento de la sección "${contentData[sectionIndex].title}"? Esta acción no se puede deshacer.`;
              confirmationModal.classList.remove("hidden");
            });
        } else {
          console.error("Original item not found for deletion.");
        }
      });
    });
  };

  // The addToListBtn and associated logic are removed as the main form no longer has these fields.
  // The functionality is now handled by the "Add Item" modal.

  // Event listeners for the "Add Item" modal
  openAddItemModalBtn.addEventListener("click", () => {
    clearAddItemModalFields(); // Clear fields
    addItemModal.classList.remove("hidden");
  });

  closeAddItemModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItemModal.classList.add("hidden");
    clearAddItemModalFields(); // Clear modal fields when closing
  });

  confirmAddItemBtn.addEventListener("click", () => {
    const MoviesId = modalMoviesIdInput.value;
    const sectionTitle = contentData[0].title; // Always use the single section title
    const isHero = contentData[0].isHero; // Always use the single section's isHero status

    addItemToContentData(MoviesId, "movie", sectionTitle, isHero);
    addItemModal.classList.add("hidden"); // Close modal after adding
  });

  // Event listeners for the "Edit Item" modal
  closeEditItemModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    editItemModal.classList.add("hidden");
    clearEditItemModalFields();
    itemToEditIndex = null;
  });

  confirmEditItemBtn.addEventListener("click", () => {
    if (itemToEditIndex !== null) {
      const MoviesId = editModalMoviesIdInput.value;
      updateItemInContentData(itemToEditIndex, MoviesId, "movie");
      editItemModal.classList.add("hidden");
    }
  });

  editOpenTmdbBtn.addEventListener("click", () => {
    window.open("https://www.themoviedb.org/", "_blank");
  });

  // Helper function to add item to contentData
  const addItemToContentData = (MoviesId, mediaType, sectionTitle, isHero) => {
    if (!MoviesId) {
      alert("Por favor, ingresa un ID de contenido.");
      return;
    }

    let targetSection = contentData[0]; // Always target the first (and only) section

    let itemRank;
    // For the single section, determine the next rank
    itemRank =
      targetSection.items.length > 0
        ? Math.max(...targetSection.items.map((item) => item.rank || 0)) + 1
        : 1;

    const newItem = {
      type: mediaType,
      id: parseInt(MoviesId),
      rank: itemRank,
    };

    targetSection.items.push(newItem);

    saveContentData();
    clearAddItemModalFields(); // Clear fields after adding
  };

  // Helper function to update item in contentData
  const updateItemInContentData = (indices, MoviesId, mediaType) => {
    if (!MoviesId) {
      alert("Por favor, ingresa un ID de contenido.");
      return;
    }

    const { section: sectionIndex, item: itemIndex } = indices;
    if (
      contentData[sectionIndex] &&
      contentData[sectionIndex].items[itemIndex]
    ) {
      contentData[sectionIndex].items[itemIndex].type = mediaType;
      contentData[sectionIndex].items[itemIndex].id = parseInt(MoviesId);
      saveContentData();
      clearEditItemModalFields(); // Clear fields after updating
      itemToEditIndex = null;
    } else {
      alert("Error: No se encontró el elemento a editar.");
    }
  };

  // Confirmation modal event listeners
  cancelDeleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    confirmationModal.classList.add("hidden");
    itemToDelete = null;
  });

  confirmDeleteBtn.addEventListener("click", () => {
    if (itemToDelete && itemToDelete.originalItem) {
      const { section: sectionIndex, originalItem } = itemToDelete;
      const originalIndex = contentData[sectionIndex].items.findIndex(
        (item) => item.id === originalItem.id && item.type === originalItem.type
      );

      if (originalIndex !== -1) {
        contentData[sectionIndex].items.splice(originalIndex, 1);
        saveContentData();
        confirmationModal.classList.add("hidden");
        itemToDelete = null;
      } else {
        alert("Error: No se encontró el elemento original a eliminar.");
      }
    }
  });

  // Initial render of the media list
  renderMediaList();

  // Event listener for search input
  searchInput.addEventListener("input", renderMediaList);

  // Event listener for the "Open TMDB" button
  openTmdbBtn.addEventListener("click", () => {
    window.open("https://www.themoviedb.org/", "_blank");
  });

  copyHtmlBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default button behavior
    e.stopPropagation(); // Stop event propagation
    outputHtml.select();
    document.execCommand("copy");
    copyConfirmationModal.classList.remove("hidden"); // Show copy confirmation modal
  });

  closeModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    htmlModal.classList.add("hidden"); // Hide the HTML generated modal
  });

  closeCopyConfirmationModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    copyConfirmationModal.classList.add("hidden"); // Hide copy confirmation modal
  });

  loadHtmlBtn.addEventListener("click", () => {
    loadHtmlModal.classList.remove("hidden"); // Show load HTML modal
  });

  closeLoadHtmlModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    loadHtmlModal.classList.add("hidden"); // Hide load HTML modal
  });

  loadHtmlIntoGeneratorBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const htmlContent = inputHtmlToLoad.value;
    if (!htmlContent) {
      alert("Por favor, pega el HTML en el campo de texto para cargarlo.");
      return;
    }
    loadHtmlIntoGenerator(htmlContent);
    loadHtmlModal.classList.add("hidden"); // Hide the modal after loading
  });

  clearDatabaseBtn.addEventListener("click", () => {
    clearDbConfirmationModal.classList.remove("hidden");
  });

  cancelClearDbBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearDbConfirmationModal.classList.add("hidden");
  });

  confirmClearDbBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Clear items from all sections, but keep the sections themselves
    contentData.forEach((section) => {
      section.items = [];
    });
    saveContentData();
    clearDbConfirmationModal.classList.add("hidden");
    clearSuccessModal.classList.remove("hidden"); // Show the success modal
  });

  closeClearSuccessModalBtn.addEventListener("click", () => {
    clearSuccessModal.classList.add("hidden"); // Hide the success modal
  });

  // Function to load HTML into the generator
  const loadHtmlIntoGenerator = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // Attempt to extract contentData from the loaded HTML
    const scriptTags = doc.querySelectorAll("script");
    let loadedItems = null;
    scriptTags.forEach((script) => {
      if (script.textContent.includes("const movieData =")) {
        try {
          const dataStringMatch = script.textContent.match(
            /const\s+movieData\s*=\s*(\[[^]*?\]);?/s // Use [^]*? to match any character including newlines, non-greedily
          );
          if (dataStringMatch && dataStringMatch[1]) {
            let jsonString = dataStringMatch[1];
            console.log("Extracted raw movieData string:", jsonString);

            // 1. Remove comments (single-line comments)
            jsonString = jsonString.replace(/\/\/.*$/gm, "");
            console.log("movieData after removing comments:", jsonString);

            // 2. Add missing commas between objects that are on separate lines
            jsonString = jsonString.replace(/}\s*\n\s*{/g, "},\n      {");
            console.log("movieData after adding missing commas:", jsonString);

            // 3. Add quotes to keys (e.g., type: -> "type":)
            // This regex is more specific to avoid quoting values that might look like keys
            jsonString = jsonString.replace(
              /([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g,
              '$1"$2":'
            );
            console.log("movieData after quoting keys:", jsonString);

            // 4. Remove trailing commas after objects or before array/object closing
            // This regex targets commas that are followed by whitespace and then a ']' or '}'
            // or a newline, potentially with comments.
            jsonString = jsonString.replace(/,\s*(?=[\]}]|\/\/.*$)/gm, "");
            console.log(
              "movieData after removing trailing commas:",
              jsonString
            );

            try {
              loadedItems = JSON.parse(jsonString);
            } catch (error) {
              console.error(
                "Error parsing movieData from loaded HTML:",
                error,
                "Processed string:",
                jsonString
              );
            }
          }
        } catch (error) {
          console.error("Error parsing movieData from loaded HTML:", error);
        }
      }
    });

    if (loadedItems) {
      // Replace the items in the single section with the loaded items
      contentData[0].items = loadedItems;
      saveContentData(); // Save the loaded data to localStorage
    } else {
      alert(
        "El HTML proporcionado no contiene los datos de 'movieData' necesarios para cargar en el generador."
      );
    }
  };
});
