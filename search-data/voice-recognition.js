// Compatibilidad Chrome y prefijos
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;

export function setupVoiceRecognition(searchInput, filterAndDisplayResults) {
  if (!SpeechRecognition) {
    alert("Tu navegador no soporta SpeechRecognition.");
  } else {
    const recognition = new SpeechRecognition();

    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    const voiceSearchButton = document.getElementById("voice-search-button");
    const voiceSearchModal = document.getElementById("voice-search-modal");
    const voiceStatusMessage = document.getElementById("voice-status-message");

    voiceSearchButton.onclick = () => {
      voiceSearchModal.classList.remove("hidden");
      voiceStatusMessage.textContent = "Escuchando...";
      recognition.start();
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      voiceStatusMessage.textContent = `Reconocido: "${transcript}" (Confianza: ${(
        confidence * 100
      ).toFixed(1)}%)`;

      searchInput.value = transcript;
      filterAndDisplayResults(transcript.toLowerCase()); // Use the passed function

      voiceSearchModal.classList.add("hidden");
    };

    recognition.onspeechend = () => {
      recognition.stop();
      voiceStatusMessage.textContent = "Reconocimiento finalizado.";
      // Optionally hide the modal after a short delay
      setTimeout(() => {
        voiceSearchModal.classList.add("hidden");
      }, 1000);
    };

    recognition.onerror = (event) => {
      voiceStatusMessage.textContent =
        "Error en el reconocimiento: " + event.error;
      console.error("Error en el reconocimiento de voz:", event.error);
      voiceSearchModal.classList.add("hidden");
    };

    recognition.onnomatch = () => {
      voiceStatusMessage.textContent =
        "No se reconoció ninguna entrada de voz.";
      // Optionally hide the modal after a short delay
      setTimeout(() => {
        voiceSearchModal.classList.add("hidden");
      }, 1000);
    };
  }
}
