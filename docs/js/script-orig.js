function handleDropdownEvent(e) {
  const isDropdownButton = e.target.matches(".link");
  const dropdown = e.target.closest("[data-dropdown]");

  // Toggle dropdown and color-picker when .link is clicked/touched
  if (isDropdownButton && dropdown) {
    dropdown.classList.toggle("active");
    const colorPicker = dropdown.querySelector('.color-picker');
    if (colorPicker) {
      colorPicker.classList.toggle('active');
      // Match the width of .color-picker to the dropdown or .link button
      const link = dropdown.querySelector('.link');
      if (link) {
        const computedWidth = window.getComputedStyle(link).width;
        colorPicker.style.width = computedWidth;
        colorPicker.style.minWidth = computedWidth;
        colorPicker.style.maxWidth = computedWidth;
      }
    }
    if (dropdown.classList.contains("active")) {
      // Position the color-picker below the .link
      const linkRect = e.target.getBoundingClientRect();
      const dropdownRect = dropdown.getBoundingClientRect();
      if (colorPicker) {
        colorPicker.style.top = `${linkRect.bottom - dropdownRect.top + 10}px`; // 10px gap
        colorPicker.style.left = `${linkRect.left - dropdownRect.left}px`;
      }
    } else {
      // Close all other dropdowns if any
      document.querySelectorAll("[data-dropdown].active").forEach(activeDropdown => {
        if (activeDropdown !== dropdown) {
          activeDropdown.classList.remove("active");
          const activeColorPicker = activeDropdown.querySelector('.color-picker');
          if (activeColorPicker) activeColorPicker.classList.remove('active');
        }
      });
    }
  } else {
    // Clicked/touched outside any dropdown: close all
    document.querySelectorAll("[data-dropdown].active").forEach(activeDropdown => {
      activeDropdown.classList.remove("active");
      const colorPicker = activeDropdown.querySelector('.color-picker');
      if (colorPicker) colorPicker.classList.remove('active');
    });
  }
}

// Listen for both click and touchend events
document.addEventListener("click", handleDropdownEvent);
document.addEventListener("touchend", handleDropdownEvent);

// Close dropdown and color-picker when a theme option is selected (also for touch)
document.querySelectorAll('.color-picker input[type="radio"]').forEach(radio => {
  function closeDropdowns() {
    const dropdown = radio.closest('[data-dropdown]');
    const colorPicker = dropdown.querySelector('.color-picker');
    if (dropdown) dropdown.classList.remove('active');
    if (colorPicker) colorPicker.classList.remove('active');
  }
  radio.addEventListener('change', closeDropdowns);
  radio.addEventListener('touchend', closeDropdowns);
});

// Theme handling code (moved from schemes.js for better cohesion)
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
    const newTheme = getSystemTheme();
    applyTheme(newTheme);
    const radio = document.querySelector(`[name=theme][value="${newTheme}"]`);
    if (radio) radio.checked = true;
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

// Listen for theme radio changes (click/touch)
document.querySelectorAll('[name="theme"]').forEach(radio => {
  function handleThemeChange() {
    applyTheme(radio.value);
  }
  radio.addEventListener('change', handleThemeChange);
  radio.addEventListener('touchend', handleThemeChange);
});

// ...existing code for dropdowns...

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
    const newTheme = getSystemTheme();
    applyTheme('system');
    const radio = document.querySelector(`[name=theme][value="system"]`);
    if (radio) radio.checked = true;
  }
});