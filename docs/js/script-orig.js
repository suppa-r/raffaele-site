// --- THEME LOGIC ---
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
  const theme = savedTheme || 'system';
  applyTheme(theme);
  const radio = document.querySelector(`[name=theme][value="${theme}"]`);
  if (radio) radio.checked = true;
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (localStorage.getItem('theme-preference') === 'system') {
    applyTheme('system');
    const radio = document.querySelector(`[name=theme][value="system"]`);
    if (radio) radio.checked = true;
  }
});
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  if (localStorage.getItem('theme-preference') === 'system') {
    applyTheme('system');
    const radio = document.querySelector(`[name=theme][value="system"]`);
    if (radio) radio.checked = true;
  }
});

// Listen for theme radio changes (click/touch)
document.querySelectorAll('[name="theme"]').forEach(radio => {
  function handleThemeChange() {
    applyTheme(radio.value);
    // Close dropdown and color-picker after selection
    const dropdown = radio.closest('[data-dropdown]');
    const colorPicker = dropdown ? dropdown.querySelector('.color-picker') : null;
    if (dropdown) dropdown.classList.remove('active');
    if (colorPicker) colorPicker.classList.remove('active');
  }
  radio.addEventListener('change', handleThemeChange);
  radio.addEventListener('touchend', handleThemeChange);
});

// --- DROPDOWN & COLOR-PICKER LOGIC ---
function handleDropdownEvent(e) {
  const isDropdownButton = e.target.matches(".link");
  const dropdown = e.target.closest("[data-dropdown]");

  if (isDropdownButton && dropdown) {
    dropdown.classList.toggle("active");
    const colorPicker = dropdown.querySelector('.color-picker');
    if (colorPicker) {
      colorPicker.classList.toggle('active');
      const link = dropdown.querySelector('.link');
      // Desktop: match width and position
      if (window.innerWidth > 600 && link) {
        const computedWidth = window.getComputedStyle(link).width;
        colorPicker.style.width = computedWidth;
        colorPicker.style.minWidth = computedWidth;
        colorPicker.style.maxWidth = computedWidth;
        // Position the color-picker below the .link
        const linkRect = link.getBoundingClientRect();
        const dropdownRect = dropdown.getBoundingClientRect();
        colorPicker.style.top = `${linkRect.bottom - dropdownRect.top + 10}px`; // 10px gap
        colorPicker.style.left = `${linkRect.left - dropdownRect.left}px`;
        colorPicker.style.position = "absolute";
        colorPicker.style.transform = "";
      } else {
        // Mobile: let CSS handle layout
        colorPicker.style.width = "";
        colorPicker.style.minWidth = "";
        colorPicker.style.maxWidth = "";
        colorPicker.style.top = "";
        colorPicker.style.left = "";
        colorPicker.style.position = "";
        colorPicker.style.transform = "";
      }
    }
    // Close other dropdowns
    document.querySelectorAll("[data-dropdown].active").forEach(activeDropdown => {
      if (activeDropdown !== dropdown) {
        activeDropdown.classList.remove("active");
        const activeColorPicker = activeDropdown.querySelector('.color-picker');
        if (activeColorPicker) activeColorPicker.classList.remove('active');
      }
    });
  } else {
    // Click/touch outside: close all dropdowns and color-pickers
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