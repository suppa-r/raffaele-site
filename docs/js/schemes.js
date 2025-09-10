// Theme switching using radio buttons
const themeRadios = document.querySelectorAll('[name="theme"]');

// Get system theme
function getSystemTheme() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark'; // fallback
}

// Apply theme and save preference
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

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (localStorage.getItem('theme-preference') === 'system') {
      applyTheme('system');
      const radio = document.querySelector('[name=theme][value="system"]');
      if (radio) radio.checked = true;
    }
  });
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (localStorage.getItem('theme-preference') === 'system') {
      applyTheme('system');
      const radio = document.querySelector('[name=theme][value="system"]');
      if (radio) radio.checked = true;
    }
  });
});

// Theme radio change handler
function handleThemeChange(event) {
  const selectedTheme = event.target.value;
  applyTheme(selectedTheme);
  // Optionally close theme preference UI
  const themePreference = document.querySelector('.theme-preference');
  if (themePreference) {
    themePreference.classList.remove('active');
  }
}

// Add change/touchend listeners for theme radios
themeRadios.forEach((radio) => {
  radio.addEventListener('change', handleThemeChange);
  radio.addEventListener('touchend', handleThemeChange);
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

// Close dropdown and theme-preference when a list item is selected
document.querySelectorAll('.drop-down li').forEach(item => {
  function closeMenus() {
    const dropdown = item.closest('.dropdown');
    if (dropdown) {
      dropdown.classList.remove('active');
    }
    const themePreference = document.querySelector('.theme-preference');
    if (themePreference) {
      themePreference.classList.remove('active');
    }
  }
  item.addEventListener('click', closeMenus);
  item.addEventListener('touchend', closeMenus);
});



// Utility: close the profile menu (dialog popover or plain element)
function closeProfileMenu() {
  const profileMenu = document.getElementById('profile') || document.querySelector('.profile-menu');
  if (!profileMenu) return;

  // If it's a <dialog popover>, use the API; otherwise fall back to class removal
  if (typeof profileMenu.hidePopover === 'function') {
    profileMenu.hidePopover();
  }
  profileMenu.classList.remove('active');
}

// Theme radio change handler
function handleThemeChange(event) {
  const selectedTheme = event.target.value;
  applyTheme(selectedTheme);
  // Close theme preference UI (if any)
  const themePreference = document.querySelector('.theme-preference');
  if (themePreference) themePreference.classList.remove('active');
  // Also close the profile menu after selection
  closeProfileMenu();
}

// Re-bind listeners for theme radios
themeRadios.forEach((radio) => {
  radio.addEventListener('change', handleThemeChange);
  radio.addEventListener('touchend', (e) => {
    // Prevent duplicate firing on some devices
    if (e.cancelable) e.preventDefault();
    handleThemeChange({ target: radio });
  }, { passive: false });
});

// Delegate: close .profile-menu when an item inside it is clicked/tapped
// Matches common interactive items inside your menu (labels, radios, links, buttons, list items)
function isMenuItem(el) {
  return el.matches('label, input[type="radio"], a, button, li, [role="menuitem"]');
}

document.addEventListener('click', (e) => {
  const inProfileMenu = e.target.closest('.profile-menu');
  if (inProfileMenu && isMenuItem(e.target)) {
    closeProfileMenu();
  }
});

document.addEventListener('touchend', (e) => {
  const inProfileMenu = e.target.closest('.profile-menu');
  if (inProfileMenu && isMenuItem(e.target)) {
    if (e.cancelable) e.preventDefault();
    closeProfileMenu();
  }
}, { passive: false });

// Optional: also close when pressing Enter/Space on focused item
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.profile-menu') && isMenuItem(e.target)) {
    closeProfileMenu();
  }
});

// ...existing code...

