document.addEventListener("DOMContentLoaded", () => {
  const themeButtons = document.querySelectorAll('.theme-button input[type="radio"]');

  if (!themeButtons.length) {
    console.error("Theme toggle buttons not found");
    return;
  }

  // Function to update favicon
  function updateFavicon(theme) {
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      const faviconPath = theme === "dark"
        ? "/favicons/dark-1.png"
        : "/favicons/light-1.png";
      favicon.href = faviconPath + "?v=" + Date.now();
    }
  }

  // Function to set theme
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("currentTheme", theme);
    updateFavicon(theme);

    // Update radio button states
    themeButtons.forEach(btn => {
      btn.checked = (btn.value === theme);
      btn.closest('.theme-button').classList.toggle('active', btn.checked);
    });
    console.log("Theme set to:", theme);
  }

  // Initialize theme on page load
  const savedTheme = localStorage.getItem("currentTheme");
  const initialTheme = savedTheme || "dark"; // Default to dark

  setTheme(initialTheme);

  // Theme toggle event listeners
  themeButtons.forEach(btn => {
    btn.addEventListener("change", () => {
      if (btn.checked) {
        setTheme(btn.value);
      }
    });
  });
});