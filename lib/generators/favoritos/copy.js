document.addEventListener("DOMContentLoaded", () => {
  const handleCopyClick = () => {
    const favoritesContainer = document.getElementById("favorites-container");
    if (favoritesContainer) {
      const htmlToCopy = favoritesContainer.outerHTML;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(htmlToCopy).then(() => {
          showNotification("Copiado al portapapeles");
        });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = htmlToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
        showNotification("Copiado al portapapeles");
      }
    }
  };

  const showNotification = (message) => {
    const notificationContainer = document.getElementById(
      "notification-container"
    );
    if (notificationContainer) {
      const notification = document.createElement("div");
      notification.className =
        "bg-green-500 text-white px-4 py-2 rounded-md shadow-md";
      notification.textContent = message;
      notificationContainer.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  };

  const favoritesTitle = document.querySelector("h1.text-3xl.font-bold.mb-6");
  if (favoritesTitle && favoritesTitle.textContent.includes("Mis Favoritos")) {
    const copyButton = document.createElement("button");
    copyButton.textContent = "Copiar HTML";
    copyButton.className =
      "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4";
    copyButton.addEventListener("click", handleCopyClick);
    favoritesTitle.appendChild(copyButton);
  }
});
