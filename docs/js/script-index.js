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
      const inputId = btn.getAttribute('for');
      const input = document.getElementById(inputId);
      if (input) {
        input.checked = (input.value === theme);
        btn.classList.toggle('active', input.checked);
      }
    });
  }

  // Function to set theme with view transitions
  function setTheme(theme) {
    if (!isValidTheme(theme)) return;

    // Always respect prefers-reduced-motion, regardless of View Transition API support
    if (prefersReducedMotion.matches) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } else if (document.startViewTransition) {
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
  const savedTheme = localStorage.getItem('theme');
  const theme = isValidTheme(savedTheme) ? savedTheme : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  setActiveThemeButton(theme);
  updateFavicon(theme);

  // Event listener for theme button clicks
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const inputId = btn.getAttribute('for');
      const input = document.getElementById(inputId);
      if (input) {
        setTheme(input.value);
      }
    });
  });
});