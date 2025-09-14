document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const linkButton = document.querySelector('.link');
  const dropdown = document.querySelector('.dropdown');
  const dropdownMenu = document.querySelector('.dropdown-menu.color-picker');
  const curve = document.querySelector('.curve-container');
  const text = document.querySelector('.text-container');
  const largebutton = document.querySelector('.large-button');
  const themeRadios = document.querySelectorAll('.theme-list-item input[type="radio"]');

  // Helpers
  function hideContent() {
    if (curve) curve.style.display = 'none';
    if (text) text.style.display = 'none';
    if (largebutton) largebutton.style.display = 'none';
  }

  function showContent() {
    if (curve) curve.style.display = '';
    if (text) text.style.display = '';
    if (largebutton) largebutton.style.display = '';
  }

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
    dropdownMenu.style.pointerEvents = open ? 'all' : 'none';
    dropdownMenu.style.opacity = open ? '1' : '0';
    dropdownMenu.style.transform = open ? 'translateX(0)' : 'translateX(150px)';
  }

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
      document.documentElement.setAttribute('data-theme', theme); // 'light' | 'dark'
    }
    localStorage.setItem('theme-preference', theme);
  }

  // Initial state: hide dropdown, apply saved theme, show content
  setMenuOpen(false);
  showContent();
  const savedTheme = localStorage.getItem('theme-preference') || 'system';
  applyTheme(savedTheme);
  const checkedRadio = document.querySelector(`[name="theme"][value="${savedTheme}"]`);
  if (checkedRadio) checkedRadio.checked = true;

  // .link toggles the dropdown and hides/shows content, triggers animation
  if (linkButton) {
    linkButton.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('active');
      setMenuOpen(!isOpen); // toggle menu
      if (!isOpen) {
        hideContent();
      } else {
        showContent();
      }
    });
  }

  // When a theme is picked: transition, apply theme, close menu, re-show content
  themeRadios.forEach((input) => {
    input.addEventListener('change', () => {
      const val = input.value;
      if ('startViewTransition' in document) {
        document.startViewTransition(() => applyTheme(val));
      } else {
        applyTheme(val);
      }
      setMenuOpen(false);
      showContent();
    });
  });

  // Keep dropdown visibility consistent on resize
  window.addEventListener('resize', () => {
    setMenuOpen(dropdown?.classList.contains('active'));
  });
});