document.addEventListener('DOMContentLoaded', () => {
  // Element declarations to match HTML structure
  const themeSwitcher = document.querySelector('.theme-switcher');
  const themeButtons = document.querySelectorAll('.theme-button');
  const navBar = document.querySelector('.navbar');
  const main = document.querySelector('.main');

  // Helper functions
  function getDefaultTheme() {
    return 'dark';
  }

  function isValidTheme(theme) {
    return ['dark', 'light'].includes(theme);
  }

  function setActiveThemeButton() {
    themeButtons.forEach(btn => {
      const input = btn.querySelector('input[type="radio"]');
      btn.classList.toggle('active', input && input.checked);
    });
  }

  function updateFavicon(theme) {
    const favicon = document.getElementById("favicon") || document.querySelector("link[rel='icon']");
    if (favicon) {
      const faviconPath = theme === "dark"
        ? "/favicons/dark-1.png"
        : "/favicons/light-1.png";
      favicon.href = faviconPath + "?v=" + Date.now();
    }
  }

  // Theme initialization
  let savedTheme = localStorage.getItem('theme');

  // Validate and set default theme
  if (!savedTheme || !isValidTheme(savedTheme)) {
    savedTheme = getDefaultTheme();
    localStorage.setItem('theme', savedTheme);
  }

  // Apply theme immediately
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Update radio buttons
  themeButtons.forEach(btn => {
    const radio = btn.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = (radio.value === savedTheme);
    }
  });

  setActiveThemeButton();
  updateFavicon(savedTheme);

  // Theme button handlers
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.querySelector('input[type="radio"]');

      if (input && !btn.classList.contains('active')) {
        input.checked = true;
        const selectedTheme = input.value;

        // Apply theme with transitions
        if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          document.startViewTransition(() => {
            document.documentElement.setAttribute('data-theme', selectedTheme);
            localStorage.setItem('theme', selectedTheme);
            updateFavicon(selectedTheme);
          });
        } else {
          document.documentElement.setAttribute('data-theme', selectedTheme);
          localStorage.setItem('theme', selectedTheme);
          updateFavicon(selectedTheme);
        }

        setActiveThemeButton();
      }
    });
  });
});