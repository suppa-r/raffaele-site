// You should also save the preference
// so when a user comes back, they don't have
// to set it again.
function applyTheme(theme) {
  if (theme === "💻") {
    // Use system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
    // Listen for system changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
      document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
    });
  } else if (theme === "☀️") {
    document.documentElement.setAttribute("data-theme", "light");
  } else if (theme === "🌑") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
  localStorage.setItem("theme-preference", theme);
}

// On page load, restore theme
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme-preference") || "💻";
  applyTheme(savedTheme);
  const radio = document.querySelector(`[name=theme][value="${savedTheme}"]`);
  if (radio) radio.checked = true;
});

// On radio change
document.querySelectorAll("[name=theme]").forEach(radio => {
  radio.addEventListener("change", e => {
    applyTheme(e.target.value);
  });
});


function updateTheme(selectedTheme) {
  if (selectedTheme === "💻") {
    document.documentElement.style.removeProperty("--theme");
  } else {
    document.documentElement.style.setProperty("--theme", selectedTheme);
  }
}

Array.from(document.querySelectorAll("[name=theme]")).forEach((radio) => {
  radio.addEventListener("change", (event) => {
    const selectedTheme = event.target.value;

    // Hide dropdown menu when a theme is selected
    if (dropdown && dropdownMenu) {
      dropdown.classList.remove('active');
      dropdownMenu.style.display = 'none';
    }

    if (!document.startViewTransition) {
      updateTheme(selectedTheme);
      return;
    }

    document.startViewTransition(() => {
      updateTheme(selectedTheme);
    });
  });
});

// Show/hide dropdown when .link is clicked
const linkButton = document.querySelector('.link');
const dropdownMenu = document.querySelector('.color-picker.dropdown-menu');
const dropdown = document.querySelector('.dropdown');
if (linkButton && dropdownMenu && dropdown) {
  // Hide dropdown menu initially
  dropdownMenu.style.display = 'none';

  linkButton.addEventListener('click', (e) => {
    e.preventDefault();
    dropdown.classList.toggle('active');
    dropdownMenu.style.display = dropdown.classList.contains('active') ? 'grid' : 'none';
  });
}

