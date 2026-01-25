document.addEventListener('DOMContentLoaded', () => {
  const VALID_THEMES = ['dark', 'light'];
  const themeButtons = document.querySelectorAll('.theme-button');
  const favicon = document.getElementById('favicon') || document.querySelector("link[rel='icon']");
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  function isValidTheme(theme) {
    return VALID_THEMES.includes(theme);
  }

  function persistTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function updateFavicon(theme) {
    if (!favicon) return;

    requestAnimationFrame(() => {
      favicon.href = theme === 'dark' ? '/favicons/dark-1.png' : '/favicons/light-1.png';
    });
  }

  function setActiveThemeButton(theme) {
    themeButtons.forEach(btn => {
      const inputId = btn.getAttribute('for');
      const input = document.getElementById(inputId);
      if (!input) return;

      const isActive = input.value === theme;
      input.checked = isActive;
      btn.classList.toggle('active', isActive);
    });
  }

  function setTheme(nextTheme) {
    if (!isValidTheme(nextTheme)) return;

    const apply = () => {
      persistTheme(nextTheme);
      updateFavicon(nextTheme);
      setActiveThemeButton(nextTheme);
    };

    // Respect reduced-motion users even if View Transition API exists
    if (prefersReducedMotion.matches) {
      apply();
      return;
    }

    if (document.startViewTransition) {
      document.startViewTransition(apply);
      return;
    }

    apply();
  }

  function resolveInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (isValidTheme(savedTheme)) return savedTheme;
    return prefersDarkScheme.matches ? 'dark' : 'light';
  }

  const initialTheme = resolveInitialTheme();
  persistTheme(initialTheme);
  updateFavicon(initialTheme);
  setActiveThemeButton(initialTheme);

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const inputId = btn.getAttribute('for');
      const input = document.getElementById(inputId);
      if (input) setTheme(input.value);
    });
  });
});