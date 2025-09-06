document.addEventListener("DOMContentLoaded", () => {
  const generatorForm = document.getElementById("generator-form");
  const outputHtml = document.getElementById("output-html");
  const htmlModal = document.getElementById("html-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const copyHtmlBtn = document.getElementById("copy-html");
  const mediaListContainer = document.getElementById("media-list-container");
  const generateHtmlBtn = document.getElementById("generate-html-btn");

  // Add Item Modal Elements
  const openAddItemModalBtn = document.getElementById(
    "open-add-item-modal-btn"
  );
  const addItemModal = document.getElementById("add-item-modal");
  const closeAddItemModalBtn = document.getElementById("close-add-item-modal");
  const modalSeriesIdInput = document.getElementById("modal-series-id");
  const modalMediaTypeSelect = document.getElementById("modal-media-type");
  const confirmAddItemBtn = document.getElementById("confirm-add-item-btn");
  const openTmdbBtn = document.getElementById("open-tmdb-btn");

  // Edit Item Modal Elements
  const editItemModal = document.getElementById("edit-item-modal");
  const closeEditItemModalBtn = document.getElementById(
    "close-edit-item-modal"
  );
  const editModalSeriesIdInput = document.getElementById(
    "edit-modal-series-id"
  );
  const editModalMediaTypeSelect = document.getElementById(
    "edit-modal-media-type"
  );
  const confirmEditItemBtn = document.getElementById("confirm-edit-item-btn");
  const editOpenTmdbBtn = document.getElementById("edit-open-tmdb-btn");
  let itemToEditIndex = null; // To store the index of the item being edited

  // Search Input
  const searchMediaInput = document.getElementById("search-media-input");
  const filterMediaTypeSelect = document.getElementById("filter-media-type");
  const toggleFilterBtn = document.getElementById("toggle-filter-btn");
  const filterMediaTypeContainer = document.getElementById(
    "filter-media-type-container"
  );

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

  const TMDB_API_KEY = "b619bab44d405bb6c49b14dfc7365b51"; // Using the provided API Key. For production, consider using your own key.

  // Function to clear add item modal fields
  const clearAddItemModalFields = () => {
    modalSeriesIdInput.value = "";
    modalMediaTypeSelect.value = "movie";
  };

  // Function to clear edit item modal fields
  const clearEditItemModalFields = () => {
    editModalSeriesIdInput.value = "";
    editModalMediaTypeSelect.value = "movie";
  };

  generateHtmlBtn.addEventListener("click", () => {
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
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/geminiproai37-blip/styles-yamilat@main/buscador-a/style.css" />
  </head>
  <body class="bg-gray-900 text-white">
    <div id="app-root"></div>
    <div id="notification-container" class="fixed bottom-4 right-4 z-50"></div>

    <!-- Request Modal -->
    <div
      id="request-modal"
      class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 hidden"
    >
      <div
        class="bg-gray-800 p-6 rounded-lg shadow-xl w-11/12 max-w-2xl relative"
      >
        <button
          id="close-modal-button"
          class="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>
        <h2 class="text-xl font-bold mb-4 text-orange-500">
          Solicitar Nuevo Contenido
        </h2>

        <!-- Step 1: Search for Content -->
        <div id="modal-step-1">
          <div class="mb-4 relative">
            <input
              type="text"
              id="modal-search-input"
              placeholder="Buscar películas o series..."
              class="w-full p-3 pr-12 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
            <button
              id="modal-search-button"
              class="absolute inset-y-0 right-0 flex items-center px-4 text-white bg-orange-600 rounded-r-lg hover:bg-orange-700 focus:outline-none"
            >
              <i class="fas fa-search"></i>
            </button>
          </div>

          <div
            id="tmdb-search-results"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4 max-h-80 overflow-y-auto custom-scrollbar"
          >
            <!-- Search results will be displayed here -->
          </div>

          <button
            id="next-step-button"
            class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg opacity-50 cursor-not-allowed"
            disabled
          >
            Siguiente Paso
          </button>
        </div>

        <!-- Step 2: Episode Request or Final Submit -->
        <div id="modal-step-2" class="hidden">
          <!-- In-app content question -->
          <div id="in-app-question" class="mb-4 text-center">
            <p class="text-lg font-semibold mb-4">
              ¿Este contenido ya está en la app?
            </p>
            <div class="flex justify-center space-x-4">
              <button
                id="in-app-yes-button"
                class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Sí
              </button>
              <button
                id="in-app-no-button"
                class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                No
              </button>
            </div>
          </div>

          <div id="episode-request-fields" class="mb-4 hidden">
            <div class="flex flex-col space-y-4 mb-4">
              <input
                type="number"
                id="season-number-input"
                placeholder="Temporada"
                min="1"
                class="p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
              <input
                type="number"
                id="episode-number-input"
                placeholder="Episodio"
                min="1"
                class="p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div class="flex justify-between mt-6">
            <button
              id="back-to-step-1-button"
              class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              Atrás
            </button>
            <button
              id="submit-request-button"
              class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg opacity-50 cursor-not-allowed"
              disabled
            >
              Enviar Solicitud
            </button>
          </div>
        </div>
      </div>
    </div>

    <script type="module" src="https://cdn.jsdelivr.net/gh/geminiproai37-blip/styles-yamilat@main/buscador-a/request-modal.js"></script>
    <script type="module">
      window.contentData = ${JSON.stringify(contentData, null, 2)};
    </script>
    <script type="module" src="https://cdn.jsdelivr.net/gh/geminiproai37-blip/styles-yamilat@main/buscador-a/main.js"></script>
  </body>
</html>`;

    outputHtml.value = htmlTemplate.trim();
    htmlModal.classList.remove("hidden"); // Show the modal
  });

  // Initialize contentData from localStorage or as an empty array
  let contentData = JSON.parse(localStorage.getItem("contentData")) || [
    { items: [] },
  ];

  // Function to save contentData to localStorage
  const saveContentData = () => {
    localStorage.setItem("contentData", JSON.stringify(contentData));
    renderMediaList();
  };

  // Function to render the list of media items
  const renderMediaList = async () => {
    mediaListContainer.innerHTML = "";
    const searchTerm = searchMediaInput.value.toLowerCase();
    const filterType = filterMediaTypeSelect.value;

    if (contentData[0] && contentData[0].items.length > 0) {
      const filteredItems = contentData[0].items.filter((item) => {
        const matchesSearchTerm =
          item.id.toString().includes(searchTerm) ||
          (item.title && item.title.toLowerCase().includes(searchTerm)); // Assuming title might be available after fetch
        const matchesFilterType =
          filterType === "all" || item.type === filterType;
        return matchesSearchTerm && matchesFilterType;
      });

      for (const [index, item] of filteredItems.entries()) {
        const listItem = document.createElement("div");
        listItem.className =
          "flex items-center bg-slate-700 p-3 rounded-md shadow-sm mb-2";

        let mediaTitle = "Cargando...";
        let posterHtml = "";

        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/${item.type}/${item.id}?api_key=${TMDB_API_KEY}&language=es-ES`
          );
          if (response.ok) {
            const data = await response.json();
            mediaTitle = data.name || data.title || "Título Desconocido";
            if (data.poster_path) {
              posterHtml = `<img src="https://image.tmdb.org/t/p/w92${data.poster_path}" alt="Póster" class="w-12 h-auto rounded-md mr-3">`;
            }
          } else {
            mediaTitle = "Error al cargar título";
          }
        } catch (error) {
          console.error("Error fetching media details for list item:", error);
          mediaTitle = "Error de red";
        }

        listItem.innerHTML = `
          ${posterHtml}
          <div class="flex-grow">
            <span class="text-slate-200 font-medium">${mediaTitle}</span>
            <p class="text-xs text-slate-400">${item.type.toUpperCase()}: ${
          item.id
        } (Rank: ${item.rank})</p>
          </div>
          <button type="button" data-index="${index}" class="edit-item-btn text-blue-400 hover:text-blue-600 ml-3">
            <i class="fas fa-pencil-alt"></i>
          </button>
          <button type="button" data-index="${index}" class="delete-item-btn text-red-400 hover:text-red-600 ml-3">
            <i class="fas fa-trash"></i>
          </button>
        `;
        mediaListContainer.appendChild(listItem);
      }

      // Add event listeners for edit buttons
      document.querySelectorAll(".edit-item-btn").forEach((button) => {
        button.addEventListener("click", async (e) => {
          e.stopPropagation();
          const index = parseInt(e.currentTarget.dataset.index);
          itemToEditIndex = index;
          const item = contentData[0].items[index];

          editModalSeriesIdInput.value = item.id;
          editModalMediaTypeSelect.value = item.type;

          editItemModal.classList.remove("hidden");
        });
      });

      // Add event listeners for delete buttons
      document.querySelectorAll(".delete-item-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent the event from bubbling up and triggering form submission
          const index = parseInt(e.currentTarget.dataset.index);
          itemToDelete = index; // Store the index of the item to delete
          // Fetch the title again for the confirmation message for accuracy
          const item = contentData[0].items[index];
          fetch(
            `https://api.themoviedb.org/3/${item.type}/${item.id}?api_key=${TMDB_API_KEY}&language=es-ES`
          )
            .then((response) => response.json())
            .then((data) => {
              const title = data.name || data.title || "este elemento";
              confirmationMessage.textContent = `¿Estás seguro de que quieres eliminar "${title}"? Esta acción no se puede deshacer.`;
              confirmationModal.classList.remove("hidden");
            })
            .catch((error) => {
              console.error("Error fetching title for confirmation:", error);
              confirmationMessage.textContent = `¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.`;
              confirmationModal.classList.remove("hidden");
            });
        });
      });
    } else {
      mediaListContainer.innerHTML =
        "<p class='text-slate-400'>No hay elementos en la base de datos.</p>";
    }
  };

  // The addToListBtn and associated logic are removed as the main form no longer has these fields.
  // The functionality is now handled by the "Add Item" modal.

  // Event listeners for the "Add Item" modal
  openAddItemModalBtn.addEventListener("click", () => {
    addItemModal.classList.remove("hidden");
  });

  closeAddItemModalBtn.addEventListener("click", () => {
    addItemModal.classList.add("hidden");
    clearAddItemModalFields(); // Clear modal fields when closing
  });

  confirmAddItemBtn.addEventListener("click", () => {
    const mediaType = modalMediaTypeSelect.value;
    const seriesId = modalSeriesIdInput.value;
    addItemToContentData(seriesId, mediaType);
    addItemModal.classList.add("hidden"); // Close modal after adding
  });

  // Event listeners for the "Edit Item" modal
  closeEditItemModalBtn.addEventListener("click", () => {
    editItemModal.classList.add("hidden");
    clearEditItemModalFields();
    itemToEditIndex = null;
  });

  confirmEditItemBtn.addEventListener("click", () => {
    if (itemToEditIndex !== null) {
      const mediaType = editModalMediaTypeSelect.value;
      const seriesId = editModalSeriesIdInput.value;
      updateItemInContentData(itemToEditIndex, seriesId, mediaType);
      editItemModal.classList.add("hidden");
    }
  });

  editOpenTmdbBtn.addEventListener("click", () => {
    window.open("https://www.themoviedb.org/", "_blank");
  });

  // Helper function to add item to contentData
  const addItemToContentData = (seriesId, mediaType) => {
    if (!seriesId) {
      alert("Por favor, ingresa un ID de contenido.");
      return;
    }

    // Determine the next rank
    const nextRank =
      contentData[0].items.length > 0
        ? Math.max(...contentData[0].items.map((item) => item.rank)) + 1
        : 1;

    const newItem = {
      type: mediaType,
      id: parseInt(seriesId),
      rank: nextRank,
    };

    contentData[0].items.push(newItem);
    saveContentData();
    clearAddItemModalFields(); // Clear fields after adding
  };

  // Helper function to update item in contentData
  const updateItemInContentData = (index, seriesId, mediaType) => {
    if (!seriesId) {
      alert("Por favor, ingresa un ID de contenido.");
      return;
    }

    contentData[0].items[index].type = mediaType;
    contentData[0].items[index].id = parseInt(seriesId);
    saveContentData();
    clearEditItemModalFields(); // Clear fields after updating
    itemToEditIndex = null;
  };

  // Confirmation modal event listeners
  cancelDeleteBtn.addEventListener("click", () => {
    confirmationModal.classList.add("hidden");
    itemToDelete = null;
  });

  confirmDeleteBtn.addEventListener("click", () => {
    if (itemToDelete !== null) {
      contentData[0].items.splice(itemToDelete, 1);
      saveContentData();
      confirmationModal.classList.add("hidden");
      itemToDelete = null;
    }
  });

  // Initial render of the media list
  renderMediaList();

  // Event listener for the "Open TMDB" button
  openTmdbBtn.addEventListener("click", () => {
    window.open("https://www.themoviedb.org/", "_blank");
  });

  // Search and Filter functionality
  searchMediaInput.addEventListener("input", renderMediaList);
  filterMediaTypeSelect.addEventListener("change", renderMediaList);

  toggleFilterBtn.addEventListener("click", () => {
    filterMediaTypeContainer.classList.toggle("hidden");
  });

  copyHtmlBtn.addEventListener("click", () => {
    outputHtml.select();
    document.execCommand("copy");
    copyConfirmationModal.classList.remove("hidden"); // Show copy confirmation modal
  });

  closeModalBtn.addEventListener("click", () => {
    htmlModal.classList.add("hidden"); // Hide the HTML generated modal
  });

  closeCopyConfirmationModalBtn.addEventListener("click", () => {
    copyConfirmationModal.classList.add("hidden"); // Hide copy confirmation modal
  });

  loadHtmlBtn.addEventListener("click", () => {
    loadHtmlModal.classList.remove("hidden"); // Show load HTML modal
  });

  closeLoadHtmlModalBtn.addEventListener("click", () => {
    loadHtmlModal.classList.add("hidden"); // Hide load HTML modal
  });

  loadHtmlIntoGeneratorBtn.addEventListener("click", () => {
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

  cancelClearDbBtn.addEventListener("click", () => {
    clearDbConfirmationModal.classList.add("hidden");
  });

  confirmClearDbBtn.addEventListener("click", () => {
    localStorage.removeItem("contentData");
    contentData = [{ items: [] }]; // Reset contentData to its initial empty state
    saveContentData(); // Re-render the list (which will now be empty)
    clearDbConfirmationModal.classList.add("hidden");
    alert("La base de datos ha sido limpiada.");
  });

  // Function to load HTML into the generator
  const loadHtmlIntoGenerator = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // Attempt to extract contentData from the loaded HTML
    const scriptTags = doc.querySelectorAll('script[type="module"]');
    let loadedContentData = null;
    scriptTags.forEach((script) => {
      if (script.textContent.includes("window.contentData =")) {
        try {
          const dataString = script.textContent.match(
            /window\.contentData = (\[.*?\]);/s
          );
          if (dataString && dataString[1]) {
            loadedContentData = JSON.parse(dataString[1]);
          }
        } catch (error) {
          console.error("Error parsing contentData from loaded HTML:", error);
        }
      }
    });

    if (loadedContentData) {
      contentData = loadedContentData;
      saveContentData(); // Save the loaded data to localStorage
      // alert("Datos de contenido cargados exitosamente desde el HTML."); // Removed alert as per user feedback
    } else {
      alert(
        "El HTML proporcionado no contiene los datos de 'window.contentData' necesarios para cargar en el generador."
      );
    }
  };
});
