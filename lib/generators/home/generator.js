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
  const modalSectionSelect = document.getElementById("modal-section-select");
  const newSectionFields = document.getElementById("new-section-fields");
  const modalNewSectionTitleInput = document.getElementById(
    "modal-new-section-title"
  );
  const modalIsHeroCheckbox = document.getElementById("modal-is-hero");
  const modalRankField = document.getElementById("modal-rank-field"); // New
  const modalRankInput = document.getElementById("modal-rank"); // New
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

  // Function to clear add item modal fields
  const clearAddItemModalFields = () => {
    modalSeriesIdInput.value = "";
    modalSectionSelect.value = ""; // Reset to first option
    modalNewSectionTitleInput.value = "";
    modalIsHeroCheckbox.checked = false;
    modalRankInput.value = ""; // Clear rank input
    modalMediaTypeSelect.value = "movie";
    newSectionFields.classList.add("hidden"); // Always hide new section fields
    modalRankField.classList.add("hidden"); // Hide rank field initially
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
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/geminiproai37-blip/styles-yamilat@main/home-w/style.css"
    />
  </head>
  <body class="bg-gray-900 text-white">
    <div id="app-root"></div>
    <div id="notification-container" class="fixed bottom-4 right-4 z-50"></div>
    <script>
      // Define contentData directly in main.js
      const contentData = ${JSON.stringify(contentData, null, 2)};
    </script>
    <script
      type="module"
      src="https://cdn.jsdelivr.net/gh/geminiproai37-blip/styles-yamilat@main/home-w/main.js"
    ></script>
    <script src="https://cdn.jsdelivr.net/gh/geminiproai37-blip/styles-yamilat@main/home-w/lazy-loader.js"></script>
  </body>
</html>`;

    outputHtml.value = htmlTemplate.trim();
    htmlModal.classList.remove("hidden"); // Show the modal
  });

  // Initialize contentData from localStorage or with default sections
  let contentData = JSON.parse(localStorage.getItem("contentData")) || [
    {
      title: "Más Vistos",
      isHero: false,
      items: [],
    },
    {
      title: "Series de Anime Populares",
      isHero: false,
      items: [],
    },
    {
      title: "Películas de Anime Mejor Calificadas",
      isHero: false,
      items: [],
    },
    {
      title: "Animes de Fantasía",
      isHero: false,
      items: [],
    },
    {
      title: "Animes de Ciencia Ficción",
      isHero: false,
      items: [],
    },
  ];

  // Function to save contentData to localStorage
  const saveContentData = () => {
    localStorage.setItem("contentData", JSON.stringify(contentData));
    renderMediaList();
  };

  // Function to render the list of media items
  const renderMediaList = async () => {
    mediaListContainer.innerHTML = "";

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
        "text-xl font-bold text-orange-500 mb-4 border-b border-slate-700 pb-2"; // Enhanced section header
      sectionHeader.textContent = section.title;
      sectionWrapper.appendChild(sectionHeader);

      if (section.items.length === 0) {
        const noItemsMessage = document.createElement("p");
        noItemsMessage.className = "text-slate-400 italic";
        noItemsMessage.textContent = `No hay elementos en la sección "${section.title}".`;
        sectionWrapper.appendChild(noItemsMessage);
        continue;
      }

      const sectionItemsContainer = document.createElement("div");
      sectionItemsContainer.className =
        "grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto custom-scrollbar"; // Container for items within a section with scroll
      sectionWrapper.appendChild(sectionItemsContainer);

      for (const [itemIndex, item] of section.items.entries()) {
        const listItem = document.createElement("div");
        listItem.className =
          "flex items-center bg-slate-700 p-3 rounded-md shadow-sm hover:bg-slate-600 transition-colors duration-200"; // Enhanced list item styling

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
              posterHtml = `<img src="https://image.tmdb.org/t/p/w92${data.poster_path}" alt="Póster" class="w-12 h-auto rounded-md mr-3 flex-shrink-0">`;
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
          <div class="flex-grow overflow-hidden">
            <span class="text-slate-200 font-medium truncate block">${mediaTitle}</span>
            <p class="text-xs text-slate-400">ID: ${
              item.id
            } | Tipo: ${item.type.toUpperCase()} ${
          item.rank ? `| Rank: ${item.rank}` : ""
        }</p>
          </div>
          <div class="flex-shrink-0 ml-3 space-x-2">
            <button type="button" data-section-index="${sectionIndex}" data-item-index="${itemIndex}" class="edit-item-btn text-blue-400 hover:text-blue-300 p-1 rounded-full hover:bg-slate-500 transition-colors duration-200">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button type="button" data-section-index="${sectionIndex}" data-item-index="${itemIndex}" class="delete-item-btn text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-slate-500 transition-colors duration-200">
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
        const itemIndex = parseInt(e.currentTarget.dataset.itemIndex);
        itemToEditIndex = { section: sectionIndex, item: itemIndex };
        const item = contentData[sectionIndex].items[itemIndex];

        editModalSeriesIdInput.value = item.id;
        editModalMediaTypeSelect.value = item.type;

        editItemModal.classList.remove("hidden");
      });
    });

    // Add event listeners for delete buttons
    document.querySelectorAll(".delete-item-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const sectionIndex = parseInt(e.currentTarget.dataset.sectionIndex);
        const itemIndex = parseInt(e.currentTarget.dataset.itemIndex);
        itemToDelete = { section: sectionIndex, item: itemIndex };

        const item = contentData[sectionIndex].items[itemIndex];
        fetch(
          `https://api.themoviedb.org/3/${item.type}/${item.id}?api_key=${TMDB_API_KEY}&language=es-ES`
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
      });
    });
  };

  // The addToListBtn and associated logic are removed as the main form no longer has these fields.
  // The functionality is now handled by the "Add Item" modal.

  // Event listeners for the "Add Item" modal
  openAddItemModalBtn.addEventListener("click", () => {
    populateSectionSelect();
    clearAddItemModalFields(); // Clear fields and reset section selection
    addItemModal.classList.remove("hidden");
  });

  closeAddItemModalBtn.addEventListener("click", () => {
    addItemModal.classList.add("hidden");
    clearAddItemModalFields(); // Clear modal fields when closing
  });

  confirmAddItemBtn.addEventListener("click", () => {
    const mediaType = modalMediaTypeSelect.value;
    const seriesId = modalSeriesIdInput.value;
    let sectionTitle;
    let isHero;

    // If creating a new section is not allowed, this block should be removed or modified
    // if (modalSectionSelect.value === "") {
    //   // Creating a new section
    //   sectionTitle = modalNewSectionTitleInput.value.trim();
    //   isHero = modalIsHeroCheckbox.checked;
    // } else {
    // Adding to an existing section
    sectionTitle = modalSectionSelect.value;
    const existingSection = contentData.find((s) => s.title === sectionTitle);
    isHero = existingSection ? existingSection.isHero : false; // Keep existing isHero status
    // }

    addItemToContentData(seriesId, mediaType, sectionTitle, isHero);
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
  const addItemToContentData = (seriesId, mediaType, sectionTitle, isHero) => {
    if (!seriesId || !sectionTitle) {
      alert("Por favor, ingresa un ID de contenido y un título de sección.");
      return;
    }

    let targetSection = contentData.find(
      (section) => section.title === sectionTitle
    );

    // If creating a new section is not allowed, this block should be removed or modified
    // if (!targetSection) {
    //   targetSection = {
    //     title: sectionTitle,
    //     isHero: isHero,
    //     items: [],
    //   };
    //   contentData.push(targetSection);
    // }
    if (!targetSection) {
      alert("Error: La sección seleccionada no existe.");
      return;
    }

    let itemRank;
    if (sectionTitle === "Más Vistos") {
      const rankValue = parseInt(modalRankInput.value);
      if (isNaN(rankValue) || rankValue <= 0) {
        alert(
          "Por favor, ingresa un Rank válido (número positivo) para 'Más Vistos'."
        );
        return;
      }
      // Check if rank already exists in "Más Vistos"
      if (targetSection.items.some((item) => item.rank === rankValue)) {
        alert(
          `El Rank ${rankValue} ya existe en la sección "Más Vistos". Por favor, elige otro.`
        );
        return;
      }
      itemRank = rankValue;
    } else {
      // Determine the next rank within the target section for other sections
      itemRank =
        targetSection.items.length > 0
          ? Math.max(...targetSection.items.map((item) => item.rank || 0)) + 1
          : 1;
    }

    const newItem = {
      type: mediaType,
      id: parseInt(seriesId),
      rank: itemRank,
    };

    if (sectionTitle === "Más Vistos") {
      // Insert item at the correct position to maintain sorted order by rank
      let inserted = false;
      for (let i = 0; i < targetSection.items.length; i++) {
        if (newItem.rank < targetSection.items[i].rank) {
          targetSection.items.splice(i, 0, newItem);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        targetSection.items.push(newItem);
      }
    } else {
      targetSection.items.push(newItem);
    }

    saveContentData();
    clearAddItemModalFields(); // Clear fields after adding
  };

  // Helper function to update item in contentData
  const updateItemInContentData = (indices, seriesId, mediaType) => {
    if (!seriesId) {
      alert("Por favor, ingresa un ID de contenido.");
      return;
    }

    const { section: sectionIndex, item: itemIndex } = indices;
    if (
      contentData[sectionIndex] &&
      contentData[sectionIndex].items[itemIndex]
    ) {
      contentData[sectionIndex].items[itemIndex].type = mediaType;
      contentData[sectionIndex].items[itemIndex].id = parseInt(seriesId);
      saveContentData();
      clearEditItemModalFields(); // Clear fields after updating
      itemToEditIndex = null;
    } else {
      alert("Error: No se encontró el elemento a editar.");
    }
  };

  // Function to populate the section select dropdown
  const populateSectionSelect = () => {
    modalSectionSelect.innerHTML =
      '<option value="">-- Crear Nueva Sección --</option>';
    contentData.forEach((section) => {
      const option = document.createElement("option");
      option.value = section.title;
      option.textContent = section.title;
      modalSectionSelect.appendChild(option);
    });
  };

  // Event listener for section select dropdown
  modalSectionSelect.addEventListener("change", () => {
    if (modalSectionSelect.value === "") {
      newSectionFields.classList.remove("hidden");
      modalRankField.classList.add("hidden"); // Hide rank field when creating new section
    } else {
      newSectionFields.classList.add("hidden");
      // Show rank field only if "Más Vistos" is selected
      if (modalSectionSelect.value === "Más Vistos") {
        modalRankField.classList.remove("hidden");
      } else {
        modalRankField.classList.add("hidden");
      }
    }
  });

  // Confirmation modal event listeners
  cancelDeleteBtn.addEventListener("click", () => {
    confirmationModal.classList.add("hidden");
    itemToDelete = null;
  });

  confirmDeleteBtn.addEventListener("click", () => {
    if (itemToDelete !== null) {
      const { section: sectionIndex, item: itemIndex } = itemToDelete;
      if (
        contentData[sectionIndex] &&
        contentData[sectionIndex].items[itemIndex]
      ) {
        contentData[sectionIndex].items.splice(itemIndex, 1);
        // If the section becomes empty, remove it
        // if (contentData[sectionIndex].items.length === 0) { // REMOVED THIS LOGIC
        //   contentData.splice(sectionIndex, 1);
        // }
        saveContentData();
        confirmationModal.classList.add("hidden");
        itemToDelete = null;
      } else {
        alert("Error: No se encontró el elemento a eliminar.");
      }
    }
  });

  // Initial render of the media list
  renderMediaList();

  // Event listener for the "Open TMDB" button
  openTmdbBtn.addEventListener("click", () => {
    window.open("https://www.themoviedb.org/", "_blank");
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
    // Clear items from all sections, but keep the sections themselves
    contentData.forEach((section) => {
      section.items = [];
    });
    saveContentData(); // Re-render the list
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
