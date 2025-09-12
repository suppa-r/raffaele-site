

document.addEventListener("click", e => {
  const isDropdownButton = e.target.matches("[data-dropdown-button]");
  const isLink = e.target.matches(".link");
    // Only handle .link if inside a dropdown
    if (isLink && !e.target.closest("[data-dropdown]")) return;
    // Only handle dropdown logic if .link or [data-dropdown-button]
    if (!isDropdownButton && !isLink) return;

  let currentDropdown = e.target.closest("[data-dropdown]");
  if (currentDropdown) {
    const button = currentDropdown.querySelector("[data-dropdown-button]");
    const wasActive = currentDropdown.classList.contains("active");
    currentDropdown.classList.toggle("active");
    // Show/hide color-picker menu
    const menu = currentDropdown.querySelector(".color-picker.dropdown-menu");
    if (menu) {
      menu.style.display = currentDropdown.classList.contains("active") ? "grid" : "none";
    }
    // Update aria-expanded for accessibility
    if (button) {
      button.setAttribute("aria-expanded", String(!wasActive));
    }
    // Prevent default if .link is a button
    if (isLink && e.target.tagName === "BUTTON") {
      e.preventDefault();
    }
    // On mobile, hide .main-content and .title when menu is first opened
    if (window.innerWidth <= 600 && currentDropdown.classList.contains("active")) {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.display = 'none';
      }
      const title = document.querySelector('.title');
      if (title) {
        title.style.display = 'none';
      }
    }
  }

  document.querySelectorAll("[data-dropdown].active").forEach(dropdown => {
    if (dropdown === currentDropdown) return;
    const button = dropdown.querySelector("[data-dropdown-button]");
    dropdown.classList.remove("active");
    // Hide color-picker menu
    const menu = dropdown.querySelector(".color-picker.dropdown-menu");
    if (menu) {
      menu.style.display = "none";
    }
    if (button) {
      button.setAttribute("aria-expanded", "false");
    }
  });
});

// Color scheme switching using radio buttons with persistence and system support
const themeRadios = document.querySelectorAll('[name="theme"]');

function getSystemTheme() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function applyTheme(theme) {
  if (theme === 'system') {
    const systemTheme = getSystemTheme();
    document.documentElement.setAttribute('data-theme', systemTheme);
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}


// Listen for radio changes and close menu on selection
themeRadios.forEach(radio => {
  radio.addEventListener('change', function() {
    localStorage.setItem('theme', this.value);
    applyTheme(this.value);
    // Hide menu after selection
    const dropdown = this.closest('[data-dropdown]');
    if (dropdown) {
      dropdown.classList.remove('active');
      const menu = dropdown.querySelector('.color-picker.dropdown-menu');
      if (menu) menu.style.display = 'none';
      const button = dropdown.querySelector('[data-dropdown-button]');
      if (button) button.setAttribute('aria-expanded', 'false');
    }
    // On mobile, show .main-content and .title again when a theme is selected
    if (window.innerWidth <= 600) {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.classList.add('background-transition');
        mainContent.style.display = 'block';
      }
      const title = document.querySelector('.title');
      if (title) {
        title.style.display = 'block';
      }
    }
  });
});


// On page load, apply saved theme and select correct radio
const savedTheme = localStorage.getItem('theme');
function selectThemeRadio(theme) {
  themeRadios.forEach(radio => {
    radio.checked = (radio.value === theme);
  });
}

if (savedTheme) {
  applyTheme(savedTheme);
  selectThemeRadio(savedTheme);
} else {
  // Default to system if no saved theme
  selectThemeRadio('system');
  applyTheme('system');
}

// If system theme is selected, listen for OS changes and update radio selection
function handleSystemThemeChange() {
  applyTheme('system');
  selectThemeRadio('system');
}
if ((savedTheme === 'system') || (!savedTheme)) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange);
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', handleSystemThemeChange);
}
