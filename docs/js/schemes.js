// Theme switching using radio buttons
const themeRadios = document.querySelectorAll('[name="theme"]');

function getSystemTheme() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark'; // fallback
}

function applyTheme(theme) {
  let appliedTheme = theme;
  if (theme === 'system') {
    appliedTheme = getSystemTheme();
  }
  document.documentElement.setAttribute('data-theme', appliedTheme);
  localStorage.setItem('theme-preference', theme);
}

// Set initial theme on load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme-preference');
  if (savedTheme) {
    applyTheme(savedTheme);
    const radio = document.querySelector(`[name=theme][value="${savedTheme}"]`);
    if (radio) radio.checked = true;
  } else {
    applyTheme('system');
    const radio = document.querySelector('[name=theme][value="system"]');
    if (radio) radio.checked = true;
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
});

themeRadios.forEach((radio) => {
  radio.addEventListener('change', (event) => {
    const selectedTheme = event.target.value;
    applyTheme(selectedTheme);
  });
});

document.querySelectorAll('.drop-down li').forEach(item => {
  item.addEventListener('click', () => {
    const dropdown = item.closest('.dropdown');
    if (dropdown) {
      dropdown.classList.remove('active');
    }
  });
});

// Optional: Smooth transition using View Transitions API if supported
if (document.startViewTransition) {
  themeRadios.forEach((radio) => {
    radio.addEventListener('change', (event) => {
      const selectedTheme = event.target.value;
      document.startViewTransition(() => applyTheme(selectedTheme));
    });
  });
}

