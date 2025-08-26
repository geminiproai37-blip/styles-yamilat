const initializeLazyLoading = () => {
  const lazyLoadImages = document.querySelectorAll(".lazy-load-img");

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazy-load-img");
        observer.unobserve(img);
      }
    });
  });

  lazyLoadImages.forEach((img) => {
    observer.observe(img);
  });
};

document.addEventListener("DOMContentLoaded", initializeLazyLoading);

export { initializeLazyLoading };
