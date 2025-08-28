export function setupVoiceRecognition(searchInput, filterAndDisplayResults) {
  const voiceSearchButton = document.getElementById("voice-search-button");
  const voiceSearchModal = document.getElementById("voice-search-modal");
  const voiceStatusMessage = document.getElementById("voice-status-message");
  const voiceAnimation = document.getElementById("voice-animation");

  if (voiceSearchButton && voiceSearchModal) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "es-ES"; // Set language to Spanish
      recognition.maxAlternatives = 1; // Get the most likely alternative

      voiceSearchButton.addEventListener("click", async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert("Tu navegador no soporta la API de MediaDevices (micrófono).");
          console.error("MediaDevices API not supported.");
          return;
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          stream.getTracks().forEach((track) => track.stop()); // Stop tracks immediately after getting permission

          voiceSearchModal.classList.remove("hidden");
          voiceStatusMessage.textContent = "Escuchando...";
          voiceAnimation.classList.add("animate-pulse-slow"); // Use the custom animation
          recognition.start();
        } catch (err) {
          console.error("Error al acceder al micrófono:", err);
          if (
            err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError"
          ) {
            alert(
              "Permiso de micrófono denegado. Por favor, habilítalo en la configuración de tu navegador para usar la búsqueda por voz."
            );
          } else if (err.name === "NotFoundError") {
            alert(
              "No se encontró ningún micrófono. Asegúrate de que esté conectado y funcionando."
            );
          } else {
            alert("Error al acceder al micrófono: " + err.message);
          }
          voiceSearchModal.classList.add("hidden"); // Hide modal on error
          voiceAnimation.classList.remove("animate-pulse-slow");
        }
      });

      recognition.addEventListener("result", (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        filterAndDisplayResults(transcript.toLowerCase());
        voiceStatusMessage.textContent = "Reconocimiento exitoso!";
        voiceAnimation.classList.remove("animate-pulse-slow");
        voiceAnimation.classList.add("animate-bounce-once"); // Success animation
        setTimeout(() => {
          voiceSearchModal.classList.add("hidden");
          voiceAnimation.classList.remove("animate-bounce-once");
        }, 1500); // Hide modal after 1.5 seconds
        // Update URL with search query
        const newUrl = new URL(window.location.href);
        if (transcript) {
          newUrl.searchParams.set("q", transcript);
        } else {
          newUrl.searchParams.delete("q");
        }
        window.history.replaceState({}, "", newUrl.toString());
      });

      recognition.addEventListener("end", () => {
        if (!voiceSearchModal.classList.contains("hidden")) {
          // Only hide if not already hidden by success message
          voiceSearchModal.classList.add("hidden");
          voiceAnimation.classList.remove("animate-pulse-slow");
        }
      });

      recognition.addEventListener("error", (event) => {
        console.error("Speech recognition error:", event.error);
        voiceStatusMessage.textContent =
          "Error en el reconocimiento de voz: " + event.error;
        voiceAnimation.classList.remove("animate-pulse-slow");
        // Optionally show an error animation
        setTimeout(() => {
          voiceSearchModal.classList.add("hidden");
        }, 2000); // Hide modal after 2 seconds
      });
    } else {
      console.warn("Speech Recognition API no soportada en este navegador.");
      voiceSearchButton.style.display = "none"; // Hide button if not supported
    }
  }
}
