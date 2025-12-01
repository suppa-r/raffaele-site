document.addEventListener('DOMContentLoaded', () => {
  const themeButtons = document.querySelectorAll('.theme-button');

  // Cache favicon element
  const favicon = document.getElementById("favicon") || document.querySelector("link[rel='icon']");

  // Cache prefers-reduced-motion query
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Helper functions
  function isValidTheme(theme) {
    return ['dark', 'light'].includes(theme);
  }

  // Function to update favicon based on theme
  function updateFavicon(theme) {
    if (!favicon) return;

    requestAnimationFrame(() => {
      favicon.href = theme === "dark"
        ? "/favicons/dark-1.png"
        : "/favicons/light-1.png";
    });
  }

  // Function to update active class on theme buttons
  function setActiveThemeButton(theme) {
    themeButtons.forEach(btn => {
      const input = btn.querySelector('input[type="radio"]');
      if (input) {
        input.checked = (input.value === theme);
        btn.classList.toggle('active', input.checked);
      }
    });
  }

  // Function to set theme with view transitions
  function setTheme(theme) {
    if (!isValidTheme(theme)) return;

    // Check if View Transition API is supported
    if (document.startViewTransition && !prefersReducedMotion.matches) {
      document.startViewTransition(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      });
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }

    updateFavicon(theme);
    setActiveThemeButton(theme);
  }

  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  setActiveThemeButton(savedTheme);
  updateFavicon(savedTheme);

  // Event listener for theme button clicks
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.querySelector('input[type="radio"]');
      if (input) {
        setTheme(input.value);
      }
    });
  });
});