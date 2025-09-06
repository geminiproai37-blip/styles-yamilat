document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("generator-form");
  const typeInput = document.getElementById("type");
  const typeTvBtn = document.getElementById("type-tv-btn");
  const typeMovieBtn = document.getElementById("type-movie-btn");
  const tvFields = document.getElementById("tv-fields");
  const contentConfigSection = document.getElementById(
    "content-config-section"
  );
  const generateBtnContainer = document.getElementById(
    "generate-btn-container"
  );
  const outputCode = document.getElementById("output-code");
  const copyBtn = document.getElementById("copy-btn");
  const aniskipFieldsTv = document.getElementById("aniskip-fields-tv");
  const movieMalFields = document.getElementById("movie-mal-fields");
  const loadHtmlModal = document.getElementById("load-html-modal");
  const openLoadModalBtn = document.getElementById("open-load-modal-btn");
  const closeLoadModalBtn = document.getElementById("close-load-modal-btn");
  const loadHtmlBtn = document.getElementById("load-html-btn");
  const htmlInput = document.getElementById("html-input");
  const generatedHtmlModal = document.getElementById("generated-html-modal");
  const closeGeneratedModalBtn = document.getElementById(
    "close-generated-modal-btn"
  );

  let languageOptions = [];

  async function fetchLanguageOptions() {
    // Manually define common languages with their codes
    languageOptions = [
      { name: "Español", code: "es" },
      { name: "Inglés", code: "en" },
      { name: "Japonés", code: "jp" },
      { name: "Portugués", code: "pt" },
      { name: "Francés", code: "fr" },
      { name: "Alemán", code: "de" },
      { name: "Italiano", code: "it" },
      { name: "Coreano", code: "ko" },
      { name: "Chino (Mandarín)", code: "zh" },
      { name: "Ruso", code: "ru" },
      { name: "Árabe", code: "ar" },
      { name: "Hindi", code: "hi" },
      { name: "Turco", code: "tr" },
      { name: "Vietnamita", code: "vi" },
      { name: "Tailandés", code: "th" },
      { name: "Indonesio", code: "id" },
      { name: "Holandés", code: "nl" },
      { name: "Sueco", code: "sv" },
      { name: "Finlandés", code: "fi" },
      { name: "Noruego", code: "no" },
      { name: "Danés", code: "da" },
      { name: "Polaco", code: "pl" },
      { name: "Griego", code: "el" },
      { name: "Hebreo", code: "he" },
      { name: "Rumano", code: "ro" },
      { name: "Húngaro", code: "hu" },
      { name: "Checo", code: "cs" },
      { name: "Eslovaco", code: "sk" },
      { name: "Ucraniano", code: "uk" },
      { name: "Búlgaro", code: "bg" },
      { name: "Serbio", code: "sr" },
      { name: "Croata", code: "hr" },
      { name: "Esloveno", code: "sl" },
      { name: "Estonio", code: "et" },
      { name: "Letón", code: "lv" },
      { name: "Lituano", code: "lt" },
      { name: "Islandés", code: "is" },
      { name: "Georgiano", code: "ka" },
      { name: "Armenio", code: "hy" },
      { name: "Azerí", code: "az" },
      { name: "Kazajo", code: "kk" },
      { name: "Uzbeko", code: "uz" },
      { name: "Persa", code: "fa" },
      { name: "Urdu", code: "ur" },
      { name: "Bengalí", code: "bn" },
      { name: "Tamil", code: "ta" },
      { name: "Telugu", code: "te" },
      { name: "Canarés", code: "kn" },
      { name: "Malayalam", code: "ml" },
      { name: "Marathi", code: "mr" },
      { name: "Gujarati", code: "gu" },
      { name: "Panyabí", code: "pa" },
      { name: "Nepalí", code: "ne" },
      { name: "Cingalés", code: "si" },
      { name: "Birmano", code: "my" },
      { name: "Jemer", code: "km" },
      { name: "Laosiano", code: "lo" },
      { name: "Malayo", code: "ms" },
      { name: "Filipino", code: "fil" },
      { name: "Mongol", code: "mn" },
      { name: "Tibetano", code: "bo" },
      { name: "Afrikáans", code: "af" },
      { name: "Albanés", code: "sq" },
      { name: "Amárico", code: "am" },
      { name: "Vasco", code: "eu" },
      { name: "Bielorruso", code: "be" },
      { name: "Bosnio", code: "bs" },
      { name: "Catalán", code: "ca" },
      { name: "Esperanto", code: "eo" },
      { name: "Gallego", code: "gl" },
      { name: "Hausa", code: "ha" },
      { name: "Hawaiano", code: "haw" },
      { name: "Igbo", code: "ig" },
      { name: "Irlandés", code: "ga" },
      { name: "Javanés", code: "jv" },
      { name: "Kurdo", code: "ku" },
      { name: "Kirguís", code: "ky" },
      { name: "Luxemburgués", code: "lb" },
      { name: "Macedonio", code: "mk" },
      { name: "Malagasy", code: "mg" },
      { name: "Maltés", code: "mt" },
      { name: "Maorí", code: "mi" },
      { name: "Nepalí", code: "ne" },
      { name: "Oriya", code: "or" },
      { name: "Pastún", code: "ps" },
      { name: "Quechua", code: "qu" },
      { name: "Samoano", code: "sm" },
      { name: "Gaélico Escocés", code: "gd" },
      { name: "Sesotho", code: "st" },
      { name: "Shona", code: "sn" },
      { name: "Sindhi", code: "sd" },
      { name: "Somalí", code: "so" },
      { name: "Suajili", code: "sw" },
      { name: "Tayiko", code: "tg" },
      { name: "Tigriña", code: "ti" },
      { name: "Tsonga", code: "ts" },
      { name: "Tswana", code: "tn" },
      { name: "Uigur", code: "ug" },
      { name: "Xhosa", code: "xh" },
      { name: "Yoruba", code: "yo" },
      { name: "Zulú", code: "zu" },
    ].sort((a, b) => a.name.localeCompare(b.name)); // Sort by language name

    populateLanguageDatalist();
  }

  function populateLanguageDatalist() {
    const datalist = document.getElementById("language-codes-list");
    if (!datalist) return;

    // Clear existing options
    datalist.innerHTML = "";

    languageOptions.forEach((lang) => {
      const option = document.createElement("option");
      option.value = `${lang.name} (${lang.code})`;
      datalist.appendChild(option);
    });
  }

  // --- MANEJO DEL MODAL ---
  function openModal(modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  function closeModal(modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  openLoadModalBtn.addEventListener("click", () => openModal(loadHtmlModal));
  closeLoadModalBtn.addEventListener("click", () => closeModal(loadHtmlModal));
  closeGeneratedModalBtn.addEventListener("click", () =>
    closeModal(generatedHtmlModal)
  );

  loadHtmlBtn.addEventListener("click", () => {
    const htmlContent = htmlInput.value;
    if (!htmlContent) {
      alert("Por favor, pega el código HTML en el área de texto.");
      return;
    }

    try {
      // Usar DOMParser para analizar el HTML de forma segura
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      const scripts = doc.querySelectorAll("script");

      let contentConfig = null;
      let languageServers = null;
      let downloadServers = null;

      scripts.forEach((script) => {
        const contentConfigMatch = script.textContent.match(
          /const contentConfig\s*=\s*(\{[\s\S]*?\});/
        );
        if (contentConfigMatch && contentConfigMatch[1]) {
          contentConfig = JSON.parse(contentConfigMatch[1].trim());
        }

        const languageServersMatch = script.textContent.match(
          /const languageServers\s*=\s*(\{[\s\S]*?\});/
        );
        if (languageServersMatch && languageServersMatch[1]) {
          languageServers = JSON.parse(languageServersMatch[1].trim());
        }

        const downloadServersMatch = script.textContent.match(
          /const downloadServers\s*=\s*(\{[\s\S]*?\});/
        );
        if (downloadServersMatch && downloadServersMatch[1]) {
          downloadServers = JSON.parse(downloadServersMatch[1].trim());
        }
      });

      if (contentConfig) {
        console.log("Parsed contentConfig:", contentConfig); // Log for debugging
        console.log("Parsed languageServers:", languageServers); // Log for debugging
        console.log("Parsed downloadServers:", downloadServers); // Log for debugging
        console.log(
          `Calling populateForm with contentConfig.type: ${contentConfig.type}, contentConfig.tmdbId: ${contentConfig.tmdbId}`
        ); // Added log for debugging
        populateForm(contentConfig, languageServers, downloadServers);
        loadHtmlModal.classList.add("hidden"); // Cerrar modal si tiene éxito
        htmlInput.value = ""; // Limpiar textarea
      } else {
        alert(
          "No se pudo encontrar la configuración (contentConfig) en el HTML proporcionado."
        );
      }
    } catch (error) {
      console.error("Error al parsear el HTML:", error);
      alert(
        "Hubo un error al procesar el HTML. Asegúrate de que sea válido y contenga la configuración esperada."
      );
    }
  });

  function populateForm(config, streamServers, dlServers) {
    console.log("Populating form with config:", config);
    console.log("Populating form with streamServers:", streamServers);
    console.log("Populating form with dlServers:", dlServers);
    console.log(
      `populateForm received type: ${config.type}, tmdbId: ${config.tmdbId}`
    ); // Added log for debugging
    // Limpiar formulario antes de poblar
    resetForm();

    // Poblar configuración de contenido
    // Poblar configuración de contenido
    const contentType = config.type || "tv";
    document.getElementById("type").value = contentType;
    console.log(`Setting type input to: ${contentType}`); // Added log for debugging
    document.getElementById("tmdbId").value = config.tmdbId || "";
    console.log(`Setting tmdbId input to: ${config.tmdbId || ""}`); // Added log for debugging
    // After setting type and tmdbId, update the UI and fetch TMDB info
    updateTypeSelection(contentType);
    document.getElementById("nextChapterUrl").value =
      config.nextChapterUrl || "";
    document.getElementById("prevChapterUrl").value =
      config.prevChapterUrl || "";
    document.getElementById("showPrevChapterButton").checked =
      config.showPrevChapterButton || false;

    // Populate hidden fields for values not directly editable in the form
    document.getElementById("chapterNameHidden").value =
      config.chapterName || "";
    document.getElementById("seriesNameHidden").value = config.seriesName || "";
    document.getElementById("introStartTimeHidden").value =
      config.introStartTime || "";
    document.getElementById("introEndTimeHidden").value =
      config.introEndTime || "";
    document.getElementById("endingStartTimeHidden").value =
      config.endingStartTime || "";

    // Populate manual AniSkip fields if they exist in the config
    const enableManualAniSkipCheckbox = document.getElementById(
      "enableManualAniSkip"
    );
    const manualAniSkipFields = document.getElementById(
      "manual-aniskip-fields"
    );

    if (config.manualAniSkipEnabled) {
      enableManualAniSkipCheckbox.checked = true;
      manualAniSkipFields.style.display = "grid";
      document.getElementById("manualIntroStartTime").value =
        config.introStartTimeManualMinutes || "";
      document.getElementById("manualIntroEndTime").value =
        config.introEndTimeManualMinutes || "";
      document.getElementById("manualEndingStartTime").value =
        config.endingStartTimeManualMinutes || "";
    } else {
      enableManualAniSkipCheckbox.checked = false;
      manualAniSkipFields.style.display = "none";
    }

    if (config.type === "tv") {
      document.getElementById("season").value = config.season || "";
      document.getElementById("episode").value = config.episode || "";
      document.getElementById("malIdTv").value = config.malId || "";
    } else {
      // Ensure malIdMovieInput is always targeted correctly for movies
      const malIdMovieInput = document.getElementById("malIdMovie");
      if (malIdMovieInput) {
        malIdMovieInput.value = config.malId || "";
      }
    }

    // Poblar servidores de streaming
    if (streamServers) {
      for (const langCode in streamServers) {
        addLanguageBlock(langServersContainer, "streaming");
        const langBlock = langServersContainer.lastElementChild;
        const langInput = langBlock.querySelector(".lang-code");
        const langName =
          languageOptions.find((l) => l.code === langCode)?.name || langCode;
        langInput.value = `${langName} (${langCode})`;
        langBlock.querySelector(
          ".current-lang-display"
        ).textContent = `Idioma actual: ${langName} (${langCode})`;

        const serversContainer = langBlock.querySelector(".servers-container");
        streamServers[langCode].forEach((server) => {
          addServerBlock(serversContainer, "streaming");
          const serverBlock = serversContainer.lastElementChild;
          const serverNameInput = serverBlock.querySelector(".server-name");
          const serverUrlInput = serverBlock.querySelector(".server-url");
          const serverDisplay = serverBlock.querySelector(
            ".current-server-display"
          );

          serverNameInput.value = server.name;
          serverUrlInput.value = server.url;
          serverDisplay.textContent = `Servidor actual: ${server.name}`; // Update display

          if (server.mp4) {
            serverBlock.querySelector(".is-mp4").checked = true;
          }
        });
      }
    }

    // Poblar servidores de descarga
    if (dlServers) {
      for (const langCode in dlServers) {
        addLanguageBlock(downloadServersContainer, "download");
        const langBlock = downloadServersContainer.lastElementChild;
        const langInput = langBlock.querySelector(".lang-code");
        const langName =
          languageOptions.find((l) => l.code === langCode)?.name || langCode;
        langInput.value = `${langName} (${langCode})`;
        langBlock.querySelector(
          ".current-lang-display"
        ).textContent = `Idioma actual: ${langName} (${langCode})`;

        const serversContainer = langBlock.querySelector(".servers-container");
        dlServers[langCode].forEach((server) => {
          addServerBlock(serversContainer, "download");
          const serverBlock = serversContainer.lastElementChild;
          const serverNameInput = serverBlock.querySelector(".server-name");
          const serverUrlInput = serverBlock.querySelector(".server-url");
          const serverDisplay = serverBlock.querySelector(
            ".current-server-display"
          );

          serverNameInput.value = server.name;
          serverUrlInput.value = server.url;
          serverDisplay.textContent = `Servidor actual: ${server.name}`; // Update display

          serverBlock.querySelector(".download-type").value = server.type;
        });
      }
    }
  }

  function resetForm() {
    form.reset(); // Resetea campos básicos del formulario
    typeInput.value = "tv"; // Valor por defecto
    updateTypeSelection("tv");
    langServersContainer.innerHTML = ""; // Limpia servidores de streaming
    downloadServersContainer.innerHTML = ""; // Limpia servidores de descarga
    outputCode.textContent = "";
    populateLanguageDatalist(); // Repopulate datalist on form reset

    // Clear movie-specific MAL ID if it exists
    const malIdMovieInput = document.getElementById("malIdMovie");
    if (malIdMovieInput) {
      malIdMovieInput.value = "";
    }

    // Reset manual AniSkip fields
    document.getElementById("enableManualAniSkip").checked = false;
    document.getElementById("manual-aniskip-fields").style.display = "none";
    document.getElementById("manualIntroStartTime").value = "";
    document.getElementById("manualIntroEndTime").value = "";
    document.getElementById("manualEndingStartTime").value = "";
  }

  // --- MANEJO DE VISIBILIDAD DE CAMPOS DE TV ---
  function updateTypeSelection(newType, isManualSwitch = false) {
    typeInput.value = newType;
    const isTv = newType === "tv";

    tvFields.style.display = isTv ? "grid" : "none";
    movieMalFields.style.display = isTv ? "none" : "block"; // Show movie MAL fields for movies
    contentConfigSection.style.display = isTv ? "block" : "none"; // Hide content config for movies when type is movie
    generateBtnContainer.style.display = isTv ? "block" : "none"; // Hide TV generate button for movies
    document.getElementById("generate-btn-movie-container").style.display = isTv
      ? "none"
      : "block"; // Show movie generate button for movies

    if (isTv) {
      typeTvBtn.classList.add("active");
      typeMovieBtn.classList.remove("active");
      // If it's a manual switch, always set the default. Otherwise, only if empty.
      if (isManualSwitch || !tmdbIdInput.value) {
        tmdbIdInput.value = "256721"; // Default for TV
      }
    } else {
      typeMovieBtn.classList.add("active");
      typeTvBtn.classList.remove("active");
      // If it's a manual switch, always set the default. Otherwise, only if empty.
      if (isManualSwitch || !tmdbIdInput.value) {
        tmdbIdInput.value = "1311031"; // Default for Movie
      }
    }
    fetchTmdbInfo();
    updateMalLink(); // Update MAL link when type changes
  }

  typeTvBtn.addEventListener("click", () => updateTypeSelection("tv", true));
  typeMovieBtn.addEventListener("click", () =>
    updateTypeSelection("movie", true)
  );

  // --- AniSkip Manual Input Toggle ---
  const enableManualAniSkipCheckbox = document.getElementById(
    "enableManualAniSkip"
  );
  const manualAniSkipFields = document.getElementById("manual-aniskip-fields");

  enableManualAniSkipCheckbox.addEventListener("change", () => {
    if (enableManualAniSkipCheckbox.checked) {
      manualAniSkipFields.style.display = "grid";
    } else {
      manualAniSkipFields.style.display = "none";
      // Optionally clear manual fields when disabled
      document.getElementById("manualIntroStartTime").value = "";
      document.getElementById("manualIntroEndTime").value = "";
      document.getElementById("manualEndingStartTime").value = "";
    }
  });

  // --- LÓGICA PARA AÑADIR/ELIMINAR IDIOMAS Y SERVIDORES ---
  const langServersContainer = document.getElementById(
    "language-servers-container"
  );
  const downloadServersContainer = document.getElementById(
    "download-servers-container"
  );

  document
    .getElementById("add-language-server-btn")
    .addEventListener("click", () =>
      addLanguageBlock(langServersContainer, "streaming")
    );
  document
    .getElementById("add-download-server-btn")
    .addEventListener("click", () =>
      addLanguageBlock(downloadServersContainer, "download")
    );

  function addLanguageBlock(container, type) {
    const langId = Date.now();
    const block = document.createElement("div");
    block.className = "p-4 rounded-md space-y-4 language-block";
    block.innerHTML = `
                  <div class="flex items-center gap-4">
                      <div class="flex-grow">
                          <label class="block text-sm font-medium mb-1">Idioma</label>
                          <div class="relative flex items-center">
                              <input type="text" list="language-codes-list" class="w-full p-2 rounded form-input lang-code pr-8" placeholder="Escribe o selecciona un idioma">
                              <button type="button" class="absolute right-2 text-gray-400 hover:text-white clear-lang-input-btn" title="Limpiar campo">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                              </button>
                          </div>
                          <span class="text-xs text-gray-400 mt-1 current-lang-display"></span>
                      </div>
                      <button type="button" class="mt-5 px-3 py-2 rounded-md text-sm font-medium text-white btn btn-danger remove-lang-btn">Eliminar Idioma</button>
                  </div>
                  <div class="servers-container pl-4 space-y-4"></div>
                  <button type="button" class="px-3 py-1.5 rounded-md text-xs font-medium text-white btn btn-secondary add-server-btn" data-type="${type}">+ Añadir Servidor</button>
              `;
    container.appendChild(block);

    // Update display when input changes
    const langInput = block.querySelector(".lang-code");
    const langDisplay = block.querySelector(".current-lang-display");
    const clearBtn = block.querySelector(".clear-lang-input-btn");

    langInput.addEventListener("input", () => {
      langDisplay.textContent = `Idioma actual: ${langInput.value}`;
    });

    clearBtn.addEventListener("click", () => {
      langInput.value = "";
      langDisplay.textContent = `Idioma actual: `;
    });
  }

  function addServerBlock(container, type) {
    const serverId = Date.now();
    const block = document.createElement("div");
    block.className = "p-3 rounded-md space-y-3 server-block bg-gray-800";

    let extraField = "";
    if (type === "streaming") {
      extraField = `
                      <div class="flex items-center gap-2">
                          <input type="checkbox" id="mp4-${serverId}" class="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 is-mp4">
                          <label for="mp4-${serverId}" class="text-sm font-medium">Es MP4</label>
                      </div>`;
    } else {
      extraField = `
                      <div>
                          <label class="block text-sm font-medium mb-1">Tipo de Descarga</label>
                          <select class="w-full p-2 rounded form-select download-type">
                              <option value="mp4">MP4</option>
                              <option value="external">Externa</option>
                          </select>
                      </div>`;
    }

    const serverNames = [
      "Yamilat (Principal)",
      "Zeus",
      "Hera",
      "Poseidon",
      "Demeter",
      "Ares",
      "Atenea",
      "Apolo",
      "Artemisa",
      "Hefesto",
      "Afrodita",
      "Hermes",
      "Dioniso",
      "Hades",
      "Persefone",
      "Hecate",
      "Morpheus",
      "Nyx",
      "Erebus",
      "Eros",
    ];

    const serverOptions = serverNames
      .map((name) => `<option value="${name}"></option>`)
      .join("");

    block.innerHTML = `
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label class="block text-sm font-medium mb-1">Nombre del Servidor</label>
                          <input list="server-names-list" type="text" class="w-full p-2 rounded form-input server-name" placeholder="Ej: Server Principal">
                          <datalist id="server-names-list">${serverOptions}</datalist>
                          <span class="text-xs text-gray-400 mt-1 current-server-display"></span>
                      </div>
                       <div>
                          <label class="block text-sm font-medium mb-1">URL del Servidor</label>
                          <input type="url" class="w-full p-2 rounded form-input server-url" placeholder="https://...">
                      </div>
                  </div>
                  ${extraField}
                  <div class="text-right">
                       <button type="button" class="px-3 py-1.5 rounded-md text-xs font-medium text-white btn btn-danger remove-server-btn">Eliminar Servidor</button>
                  </div>
              `;
    container.appendChild(block);

    // Update display when input changes
    const serverInput = block.querySelector(".server-name");
    const serverDisplay = block.querySelector(".current-server-display");
    serverInput.addEventListener("input", () => {
      serverDisplay.textContent = `Servidor actual: ${serverInput.value}`;
    });
  }

  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-server-btn")) {
      addServerBlock(e.target.previousElementSibling, e.target.dataset.type);
    }
    if (e.target.classList.contains("remove-server-btn")) {
      e.target.closest(".server-block").remove();
    }
    if (e.target.classList.contains("remove-lang-btn")) {
      e.target.closest(".language-block").remove();
    }
    // No need for a separate event listener for clear-lang-input-btn here, it's handled inside addLanguageBlock
  });

  // --- LÓGICA DE GENERACIÓN DE FORMULARIO ---
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("Formulario enviado!"); // Added for debugging
    const generateBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = generateBtn.textContent;
    generateBtn.textContent = "Generando...";
    generateBtn.disabled = true;

    const tmdbData = await fetchTmdbInfo(); // Fetch TMDB info and get the data

    // Fetch episode-specific data for TV shows
    let tmdbEpisodeData = null;
    const type = document.getElementById("type").value;
    const tmdbId = document.getElementById("tmdbId").value;
    const season = document.getElementById("season").value;
    const episode = document.getElementById("episode").value;

    if (type === "tv" && tmdbId && season && episode) {
      try {
        const tmdbEpisodeUrl = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}/episode/${episode}?api_key=${apiKey}&language=es-ES`;
        const tmdbEpisodeResponse = await fetch(tmdbEpisodeUrl);
        if (tmdbEpisodeResponse.ok) {
          tmdbEpisodeData = await tmdbEpisodeResponse.json();
        } else {
          console.warn(`TMDB: No se pudo obtener la información del episodio.`);
        }
      } catch (error) {
        console.error(
          "Error al obtener la información del episodio de TMDB:",
          error
        );
      }
    }

    const contentConfig = {
      type: type,
      tmdbId: tmdbId,
      posterUrl: tmdbEpisodeData?.still_path // Prioritize episode still image
        ? `https://image.tmdb.org/t/p/original${tmdbEpisodeData.still_path}`
        : tmdbData?.backdrop_path // Fallback to series backdrop
        ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}`
        : tmdbData?.poster_path // Fallback to series poster
        ? `https://image.tmdb.org/t/p/original${tmdbData.poster_path}`
        : "https://via.placeholder.com/500x750.png?text=No+Image",
      reportPosterUrl: tmdbData?.poster_path
        ? `https://image.tmdb.org/t/p/original${tmdbData.poster_path}`
        : "https://via.placeholder.com/500x750.png?text=No+Image", // URL del póster para enviar en el reporte
      goBackId: tmdbId,
    };

    if (contentConfig.type === "tv") {
      contentConfig.nextChapterUrl =
        document.getElementById("nextChapterUrl").value;
      contentConfig.prevChapterUrl =
        document.getElementById("prevChapterUrl").value;
      contentConfig.showPrevChapterButton = document.getElementById(
        "showPrevChapterButton"
      ).checked;
      contentConfig.season = season;
      contentConfig.episode = episode;
      contentConfig.malId = document.getElementById("malIdTv").value; // For TV
      contentConfig.title = tmdbData?.name || "Título de la Serie"; // Título principal del contenido
      contentConfig.chapterName =
        tmdbEpisodeData?.name || `Episodio ${episode}` || "Nombre del Capítulo"; // Nombre del capítulo (para series)
      contentConfig.seriesName = tmdbData?.name || "Nombre de la Serie"; // Nombre de la serie (para reportes)
    } else {
      // For movies, only include relevant fields
      contentConfig.malId = document.getElementById("malIdMovie").value; // For Movie
      contentConfig.title = tmdbData?.title || "Título de la Película"; // Título principal del contenido
      // Preserve AniSkip times if they were loaded from HTML
      contentConfig.introStartTime =
        parseFloat(document.getElementById("introStartTimeHidden").value) ||
        undefined;
      contentConfig.introEndTime =
        parseFloat(document.getElementById("introEndTimeHidden").value) ||
        undefined;
      contentConfig.endingStartTime =
        parseFloat(document.getElementById("endingStartTimeHidden").value) ||
        undefined;
    }

    // Handle manual AniSkip times
    const enableManualAniSkip = document.getElementById(
      "enableManualAniSkip"
    ).checked;
    contentConfig.manualAniSkipEnabled = enableManualAniSkip;

    if (enableManualAniSkip) {
      const manualIntroStartTimeMin = parseFloat(
        document.getElementById("manualIntroStartTime").value
      );
      const manualIntroEndTimeMin = parseFloat(
        document.getElementById("manualIntroEndTime").value
      );
      const manualEndingStartTimeMin = parseFloat(
        document.getElementById("manualEndingStartTime").value
      );

      if (!isNaN(manualIntroStartTimeMin)) {
        contentConfig.introStartTime = manualIntroStartTimeMin * 60;
        contentConfig.introStartTimeManualMinutes = manualIntroStartTimeMin;
      } else {
        contentConfig.introStartTime = undefined;
        contentConfig.introStartTimeManualMinutes = undefined;
      }
      if (!isNaN(manualIntroEndTimeMin)) {
        contentConfig.introEndTime = manualIntroEndTimeMin * 60;
        contentConfig.introEndTimeManualMinutes = manualIntroEndTimeMin;
      } else {
        contentConfig.introEndTime = undefined;
        contentConfig.introEndTimeManualMinutes = undefined;
      }
      if (!isNaN(manualEndingStartTimeMin)) {
        contentConfig.endingStartTime = manualEndingStartTimeMin * 60;
        contentConfig.endingStartTimeManualMinutes = manualEndingStartTimeMin;
      } else {
        contentConfig.endingStartTime = undefined;
        contentConfig.endingStartTimeManualMinutes = undefined;
      }
    } else {
      // If manual is not enabled, clear manual values from config
      contentConfig.introStartTimeManualMinutes = undefined;
      contentConfig.introEndTimeManualMinutes = undefined;
      contentConfig.endingStartTimeManualMinutes = undefined;
    }

    const malId = contentConfig.malId;
    let episodeLength = 0; // Default to 0

    // Use already fetched episode data for runtime
    if (type === "tv" && tmdbEpisodeData && tmdbEpisodeData.runtime) {
      episodeLength = tmdbEpisodeData.runtime * 60; // Convert minutes to seconds
    } else if (type === "movie" && tmdbData && tmdbData.runtime) {
      episodeLength = tmdbData.runtime * 60; // Convert minutes to seconds
    }

    // Only fetch AniSkip API if manual input is NOT enabled
    if (malId && !enableManualAniSkip) {
      let aniskipUrl = "";
      if (contentConfig.type === "tv" && episode) {
        aniskipUrl = `https://api.aniskip.com/v2/skip-times/${malId}/${episode}?types=op&types=ed&episodeLength=${episodeLength}`;
      } else if (contentConfig.type === "movie") {
        // AniSkip for movies might require a different endpoint or handling
        // For now, we'll assume it uses the same endpoint but without episode
        // This might need adjustment based on AniSkip's actual movie support
        aniskipUrl = `https://api.aniskip.com/v2/skip-times/${malId}/1?types=op&types=ed&episodeLength=${episodeLength}`; // Assuming episode 1 for movie
      }

      if (aniskipUrl) {
        console.log(`AniSkip URL: ${aniskipUrl}`); // Log the AniSkip URL
        console.log(`Episode Length for AniSkip: ${episodeLength} seconds`); // Log the episode length
        try {
          const response = await fetch(aniskipUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.found && data.results.length > 0) {
              const op = data.results.find((r) => r.skipType === "op");
              const ed = data.results.find((r) => r.skipType === "ed");
              if (op) {
                contentConfig.introStartTime = op.interval.startTime;
                contentConfig.introEndTime = op.interval.endTime;
              }
              if (ed) {
                contentConfig.endingStartTime = ed.interval.startTime;
              }
              if (data.results.find((r) => r.skipType === "goback")) {
                contentConfig.goBackId = data.results.find(
                  (r) => r.skipType === "goback"
                ).interval.startTime;
              }
            }
          } else {
            console.warn(
              `AniSkip: No se encontraron tiempos para MAL ID ${malId}, ${
                contentConfig.type === "tv" ? `episodio ${episode}` : "película"
              }.`
            );
          }
        } catch (error) {
          console.error("Error al contactar la API de AniSkip:", error);
        }
      }
    }
    const languageServers = {};
    langServersContainer
      .querySelectorAll(".language-block")
      .forEach((block) => {
        const fullLangString = block.querySelector(".lang-code").value.trim();
        const match = fullLangString.match(/\(([^)]+)\)$/); // Extract code from "Language Name (code)"
        const langCode = match ? match[1] : fullLangString; // Use extracted code or full string as fallback

        if (langCode) {
          languageServers[langCode] = [];
          block.querySelectorAll(".server-block").forEach((server) => {
            languageServers[langCode].push({
              name: server.querySelector(".server-name").value,
              url: server.querySelector(".server-url").value,
              mp4: server.querySelector(".is-mp4")?.checked || false,
            });
          });
        }
      });

    const downloadServers = {};
    downloadServersContainer
      .querySelectorAll(".language-block")
      .forEach((block) => {
        const fullLangString = block.querySelector(".lang-code").value.trim();
        const match = fullLangString.match(/\(([^)]+)\)$/); // Extract code from "Language Name (code)"
        const langCode = match ? match[1] : fullLangString; // Use extracted code or full string as fallback

        if (langCode) {
          downloadServers[langCode] = [];
          block.querySelectorAll(".server-block").forEach((server) => {
            downloadServers[langCode].push({
              name: server.querySelector(".server-name").value,
              url: server.querySelector(".server-url").value,
              type: server.querySelector(".download-type").value,
            });
          });
        }
      });

    const generatedHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no"
    />
    <title>Reproductor de Video</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/geminiproai37-blip/playeryamilat@main/reproductor-styles-assest/style.css"
    />

    <script defer>
      const contentConfig = ${JSON.stringify(contentConfig, null, 2)};

      const languageServers = ${JSON.stringify(languageServers, null, 2)};

      const downloadServers = ${JSON.stringify(downloadServers, null, 2)};

      // Carga del ID desde la URL y asignación a la configuración
      document.addEventListener("DOMContentLoaded", function () {
        const urlParams = new URLSearchParams(window.location.search);
        const goBackIdFromUrl = urlParams.get("id");
        if (goBackIdFromUrl) {
          contentConfig.goBackId = goBackIdFromUrl;
        }

        // Asignar variables globales
        window.contentConfig = contentConfig;
        window.languageServers = languageServers;
        window.downloadServers = downloadServers;
      });
    </script>

    <script
      type="module"
      src="https://cdn.jsdelivr.net/gh/geminiproai37-blip/playeryamilat@main/reproductor-styles-assest/dom_builder.js"
      defer
    ></script>
    <script
      type="module"
      src="https://cdn.jsdelivr.net/gh/geminiproai37-blip/playeryamilat@main/reproductor-styles-assest/external_handler.js"
      defer
    ></script>
    <script
      type="module"
      src="https://cdn.jsdelivr.net/gh/geminiproai37-blip/playeryamilat@main/reproductor-styles-assest/continueWatchingModal.js"
      defer
    ></script>
    <script
      type="module"
      src="https://cdn.jsdelivr.net/gh/geminiproai37-blip/playeryamilat@main/reproductor-styles-assest/anime_loader.js"
      defer
    ></script>
    <script
      type="module"
      src="https://cdn.jsdelivr.net/gh/geminiproai37-blip/playeryamilat@main/reproductor-styles-assest/script.js"
      defer
    ></script>
  </head>

  <body>
    <div id="video-player-container" class="video-player-container"></div>
    <div id="vertical-menu-container" class="vertical-menu-container"></div>
    <div id="side-menu-buttons"></div>

    <div id="report-confirmation-modal" class="popup hidden">
      <div class="popup-header">
        <h3>Reporte Enviado</h3>
        <button class="close-popup-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="popup-content report-confirmation-content">
        <img
          src="https://i.pinimg.com/originals/f2/1f/0a/f21f0a529006c607222141022020812f.gif"
          alt="Reporte Enviado"
          class="report-confirmation-gif"
        />
        <p>¡Gracias por tu reporte! Lo revisaremos pronto.</p>
        <button id="report-confirmation-ok-btn" class="btn-primary">
          Aceptar
        </button>
      </div>
    </div>
  </body>
</html>
`;

    outputCode.textContent = generatedHtml.trim();
    openModal(generatedHtmlModal);

    generateBtn.textContent = originalBtnText;
    generateBtn.disabled = false;
  });

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(outputCode.textContent);
      copyBtn.textContent = "¡Copiado!";
      setTimeout(() => {
        copyBtn.textContent = "Copiar Código";
      }, 2000);
    } catch (err) {
      console.error("Error al copiar con navigator.clipboard:", err);
      // Fallback para navegadores que no soportan o deniegan navigator.clipboard
      const textarea = document.createElement("textarea");
      textarea.value = outputCode.textContent;
      textarea.style.position = "fixed"; // Evita el scroll
      textarea.style.opacity = "0"; // Lo hace invisible
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
        copyBtn.textContent = "¡Copiado!";
        setTimeout(() => {
          copyBtn.textContent = "Copiar Código";
        }, 2000);
      } catch (err2) {
        console.error("Error al copiar con document.execCommand:", err2);
        copyBtn.textContent = "Error";
        setTimeout(() => {
          copyBtn.textContent = "Copiar Código";
        }, 2000);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  });

  // --- LÓGICA PARA OBTENER INFO DE TMDB ---
  const tmdbIdInput = document.getElementById("tmdbId");
  const tmdbLink = document.getElementById("tmdb-link");
  const malIdTvInput = document.getElementById("malIdTv");
  const malLinkTv = document.getElementById("mal-link-tv");
  const typeInputForTmdb = document.getElementById("type");
  const tmdbContentDiv = document.getElementById("tmdb-content");
  const apiKey = "b619bab44d405bb6c49b14dfc7365b51"; // Clave de API de TMDB

  function updateTmdbLink() {
    const tmdbId = tmdbIdInput.value.trim();
    const type = typeInputForTmdb.value; // Get the current type
    if (tmdbId && type) {
      tmdbLink.href = `https://www.themoviedb.org/${type}/${tmdbId}`;
    } else {
      tmdbLink.href = "https://www.themoviedb.org/"; // Fallback to main page if no ID or type
    }
  }

  function updateMalLink() {
    const type = typeInputForTmdb.value;
    const { malIdMovieInput, malLinkMovie } = getMalMovieElements();

    if (type === "tv") {
      const malId = malIdTvInput.value.trim();
      if (malId) {
        malLinkTv.href = `https://myanimelist.net/anime/${malId}`;
      } else {
        malLinkTv.href = "https://myanimelist.net/";
      }
      if (malLinkMovie) {
        malLinkMovie.href = "https://myanimelist.net/"; // Clear movie link
      }
    } else {
      const malId = malIdMovieInput ? malIdMovieInput.value.trim() : "";
      if (malId && malLinkMovie) {
        malLinkMovie.href = `https://myanimelist.net/anime/${malId}`;
      } else if (malLinkMovie) {
        malLinkMovie.href = "https://myanimelist.net/";
      }
      malLinkTv.href = "https://myanimelist.net/"; // Clear tv link
    }
  }

  // Get malIdMovieInput and malLinkMovie dynamically as they are now in a toggled div
  function getMalMovieElements() {
    const movieMalFieldsDiv = document.getElementById("movie-mal-fields");
    // No need to check display style here, as elements might exist but be hidden.
    // We just need to get the references if they exist in the DOM.
    return {
      malIdMovieInput: movieMalFieldsDiv
        ? movieMalFieldsDiv.querySelector("#malIdMovie")
        : null,
      malLinkMovie: movieMalFieldsDiv
        ? movieMalFieldsDiv.querySelector("#mal-link-movie")
        : null,
    };
  }

  async function fetchTmdbInfo() {
    const tmdbId = tmdbIdInput.value.trim();
    const type = typeInputForTmdb.value;

    updateTmdbLink();

    if (!tmdbId) {
      tmdbContentDiv.innerHTML =
        '<p class="text-gray-400">Ingrese un ID de TMDb.</p>';
      return null; // Return null if no TMDB ID
    }

    tmdbContentDiv.innerHTML = '<p class="text-gray-400">Cargando datos...</p>';

    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${apiKey}&language=es-ES`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error ${response.status}: ${
            errorData.status_message || response.statusText
          }`
        );
      }
      const data = await response.json();
      displayTmdbInfo(data); // Still display info in the generator form
      return data; // Return the fetched data
    } catch (error) {
      console.error("Error al obtener datos de TMDB:", error);
      tmdbContentDiv.innerHTML = `<p class="text-red-400">Error al cargar datos. Verifique el ID y el tipo.</p><p class="text-xs text-gray-500 mt-1">${error.message}</p>`;
      return null; // Return null on error
    }
  }

  function displayTmdbInfo(data) {
    const title = data.name || data.title;
    const posterPath = data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : "https://via.placeholder.com/500x750.png?text=No+Image";

    let seriesInfo = "";
    if (typeInput.value === "tv") {
      const season = document.getElementById("season").value;
      const episode = document.getElementById("episode").value;
      seriesInfo = `
        <div class="text-sm text-gray-400 mt-2">
          <span>Temporada ${season}</span> &bull;
          <span>Episodio ${episode}</span>
        </div>
      `;
    }

    tmdbContentDiv.innerHTML = `
      <img src="${posterPath}" alt="${title}" class="w-2/3 mx-auto h-auto rounded-lg mb-2 shadow-lg">
      <h3 class="text-lg font-bold text-white">${title}</h3>
      ${seriesInfo}
    `;
  }

  // --- EVENT LISTENERS PARA ACTUALIZAR TMDB INFO ---
  let debounceTimer;
  tmdbIdInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchTmdbInfo, 500); // Debounce para evitar demasiadas peticiones
  });
  malIdTvInput.addEventListener("input", updateMalLink);
  // Event listener for malIdMovieInput needs to be added after the element is visible
  // For now, we'll rely on updateMalLink being called on type change and form load
  // and ensure it handles null malIdMovieInput gracefully.

  document.getElementById("season").addEventListener("input", fetchTmdbInfo);
  document.getElementById("episode").addEventListener("input", fetchTmdbInfo);
  // The type change is now handled by the button click listeners

  // Carga inicial al cargar la página
  updateTypeSelection("tv", false);
  // Call fetchTmdbInfo and then updateMalLink after it resolves
  fetchTmdbInfo().then(() => {
    updateMalLink();
  });
  fetchLanguageOptions(); // Call to fetch language options on load

  // Add event listener for malIdMovieInput after initial setup
  // This ensures it's attached if the movie fields are initially visible or become visible
  const movieMalFieldsDiv = document.getElementById("movie-mal-fields");
  if (movieMalFieldsDiv) {
    const malIdMovieInput = movieMalFieldsDiv.querySelector("#malIdMovie");
    if (malIdMovieInput) {
      malIdMovieInput.addEventListener("input", updateMalLink);
    }
  }
});
