document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const linkButton = document.querySelector('.link');
  const dropdown = document.querySelector('.dropdown');
  const dropdownMenu = document.querySelector('.color-picker.dropdown-menu');
  const intro = document.querySelector('.intro');
  const h = document.querySelector('.h');
  const nav = document.querySelector('.nav-links');
  const themeRadios = document.querySelectorAll('.theme-list-item input[type="radio"]');

  // Helpers
  function animateDropdownMenu(open) {
    if (!dropdownMenu) return;
    dropdownMenu.classList.remove('animate-in');
    if (open) {
      // Force reflow to restart animation
      void dropdownMenu.offsetWidth;
      dropdownMenu.classList.add('animate-in');
    }
  }

  function setMenuOpen(open) {
    if (!dropdown || !dropdownMenu) return;
    dropdown.classList.toggle('active', open);
    animateDropdownMenu(open);
    // Only hide .h and nav, not .intro, if menu is open
    if (open) {
      if (h) h.style.display = 'none';
      if (nav) nav.style.display = 'none';
      if (intro) intro.style.display = 'none';
      // Do NOT hide intro if dropdown is inside intro!
    } else {
      if (h) h.style.display = '';
      if (nav) nav.style.display = '';
      if (intro) intro.style.display = '';
    }
  }

  // Close menu and show content when clicking outside
  document.addEventListener('mousedown', (e) => {
    if (
      dropdown &&
      dropdown.classList.contains('active') &&
      !dropdown.contains(e.target)
    ) {
      setMenuOpen(false);
    }
  });

  // Theme logic
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  let sysListener = null;
  function applyTheme(theme) {
    if (theme === 'system') {
      document.documentElement.setAttribute('data-theme', mql.matches ? 'dark' : 'light');
      if (!sysListener) {
        sysListener = e => document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        mql.addEventListener('change', sysListener);
      }
    } else {
      if (sysListener) { mql.removeEventListener('change', sysListener); sysListener = null; }
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme-preference', theme);
  }

  // Initial state: hide dropdown, apply saved theme, show content
  setMenuOpen(false);

  const savedTheme = localStorage.getItem('theme-preference') || 'system';
  applyTheme(savedTheme);
  const checkedRadio = document.querySelector(`[name="theme"][value="${savedTheme}"]`);
  if (checkedRadio) checkedRadio.checked = true;

  // .link toggles the dropdown and hides/shows main content
  if (linkButton && dropdown && dropdownMenu) {
    linkButton.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('active');
      setMenuOpen(!isOpen);
    });
  }

  // When a theme is picked: apply theme, close menu, show main content
  themeRadios.forEach((input) => {
    input.addEventListener('change', () => {
      const val = input.value;
      if ('startViewTransition' in document) {
        document.startViewTransition(() => applyTheme(val));
      } else {
        applyTheme(val);
      }
      setMenuOpen(false);
    });
  });

  // Keep dropdown visibility consistent on resize
  window.addEventListener('resize', () => {
    setMenuOpen(dropdown?.classList.contains('active'));
  });
});