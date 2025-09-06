import { favoriteText } from "./lib/generators/favoritos/data.js";

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".shortcut-button");
  const copyNotification = document.getElementById("copy-notification");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const url = button.dataset.url;
      const action = button.dataset.action;

      if (url) {
        window.location.href = url;
      } else if (action === "copy-favorites") {
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(favoriteText)
            .then(() => {
              if (copyNotification) {
                copyNotification.textContent =
                  "Copiada sesión de mis favoritos al portapapeles";
                copyNotification.classList.remove("hidden");
                setTimeout(() => {
                  copyNotification.classList.add("hidden");
                }, 2000); // Hide after 2 seconds
              }
            })
            .catch((err) => {
              console.error("Error al copiar el código: ", err);
              alert("Error al copiar el código."); // Keep alert for errors
            });
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = favoriteText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          textArea.remove();
          if (copyNotification) {
            copyNotification.textContent =
              "Copiada sesión de mis favoritos al portapapeles";
            copyNotification.classList.remove("hidden");
            setTimeout(() => {
              copyNotification.classList.add("hidden");
            }, 2000); // Hide after 2 seconds
          }
        }
      }
    });
  });
});
