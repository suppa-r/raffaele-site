const themeRadios = document.querySelectorAll('[name="theme"]');

// Set initial theme on load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme-preference');
  const theme = savedTheme || 'system';
  applyTheme(theme);
  const radio = document.querySelector(`[name=theme][value="${theme}"]`);
  if (radio) radio.checked = true;
});

function getSystemTheme() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark'; // fallback
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (localStorage.getItem('theme-preference') === 'system') {
    applyTheme('system');
  }
});
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  if (localStorage.getItem('theme-preference') === 'system') {
    applyTheme('system');
  }
});

function applyTheme(theme) {
  let appliedTheme = theme;
  if (theme === 'system') {
    appliedTheme = getSystemTheme();
  }
  document.documentElement.setAttribute('data-theme', appliedTheme);
  localStorage.setItem('theme-preference', theme);
}

// Use View Transitions API if available, else fallback
const themeChangeHandler = (event) => {
  const selectedTheme = event.target.value;
  if (document.startViewTransition) {
    document.startViewTransition(() => applyTheme(selectedTheme));
  } else {
    applyTheme(selectedTheme);
  }
};
themeRadios.forEach(radio => radio.addEventListener('change', themeChangeHandler));

// Close dropdowns on item click (for both mouse and touch)
document.querySelectorAll('ul.dropdown li').forEach(item => {
  function closeDropdown() {
    const dropdown = item.closest('.dropdown');
    if (dropdown) {
      dropdown.classList.remove('active');
    }
  }
  item.addEventListener('click', closeDropdown);
  item.addEventListener('touchend', closeDropdown);
});
