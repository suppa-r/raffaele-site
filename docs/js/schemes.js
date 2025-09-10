// --- Hide main-content when .user-button is clicked (mobile only) ---
const userButton = document.querySelector('.user-button');
const maincontent = document.querySelector('.main-content');

if (userButton) {
  userButton.addEventListener('click', () => {
    if (window.innerWidth <= 600 && maincontent) {
      maincontent.style.display = 'none';
      userButton.classList.add('active');
    }
  });
}

// --- Show main-content when menus are closed or .user-button is inactive ---
function showMainContent() {
  if (maincontent) maincontent.style.display = 'block';
  if (userButton) userButton.classList.remove('active');
}

// --- Utility functions ---
function closeThemePreference() {
  const themePreference = document.querySelector('.theme-preference');
  if (themePreference) themePreference.classList.remove('active');
}

function closeProfileMenu() {
  const profileMenu = document.getElementById('profile') || document.querySelector('.profile-menu');
  if (!profileMenu) return;
  if (typeof profileMenu.hidePopover === 'function') {
    profileMenu.hidePopover();
  } else {
    profileMenu.classList.remove('active');
  }
}

function isMenuItem(el) {
  return el.matches('label, input[type="radio"], a, button, li, [role="menuitem"]');
}

// --- Close menus and show main-content when a menu item is selected ---
document.querySelectorAll('.drop-down li').forEach(item => {
  function closeMenusAndShow() {
    const dropdown = item.closest('.dropdown');
    if (dropdown) dropdown.classList.remove('active');
    closeThemePreference();
    closeProfileMenu();
    showMainContent();
  }
  item.addEventListener('click', closeMenusAndShow);
  item.addEventListener('touchend', closeMenusAndShow);
});

// --- Close .profile-menu and show main-content when an item inside it is selected ---
document.addEventListener('click', (e) => {
  const inProfileMenu = e.target.closest('.profile-menu');
  if (inProfileMenu && isMenuItem(e.target)) {
    closeProfileMenu();
    showMainContent();
  }
});

document.addEventListener('touchend', (e) => {
  const inProfileMenu = e.target.closest('.profile-menu');
  if (inProfileMenu && isMenuItem(e.target)) {
    if (e.cancelable) e.preventDefault();
    closeProfileMenu();
    showMainContent();
  }
}, { passive: false });

document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.profile-menu') && isMenuItem(e.target)) {
    closeProfileMenu();
    showMainContent();
  }
});

// --- Theme switching using radio buttons ---
const themeRadios = document.querySelectorAll('[name="theme"]');

function getSystemTheme() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

function applyTheme(theme) {
  let appliedTheme = theme;
  if (theme === 'system') {
    appliedTheme = getSystemTheme();
  }
  document.documentElement.setAttribute('data-theme', appliedTheme);
  localStorage.setItem('theme-preference', theme);
}

// --- Set initial theme on load and listen for system changes ---
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme-preference');
  const theme = savedTheme || 'system';
  applyTheme(theme);
  const radio = document.querySelector(`[name=theme][value="${theme}"]`);
  if (radio) radio.checked = true;

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

// --- Theme radio change handler ---
function handleThemeChange(event) {
  const selectedTheme = event.target.value;
  applyTheme(selectedTheme);
  closeThemePreference();
  closeProfileMenu();
  showMainContent();
}

themeRadios.forEach((radio) => {
  radio.addEventListener('change', handleThemeChange);
  radio.addEventListener('touchend', (e) => {
    if (e.cancelable) e.preventDefault();
    handleThemeChange({ target: radio });
  }, { passive: false });
});

// --- View Transitions API for smooth theme switch (if supported) ---
if ('startViewTransition' in document) {
  themeRadios.forEach((radio) => {
    radio.addEventListener('change', (event) => {
      const selectedTheme = event.target.value;
      document.startViewTransition(() => applyTheme(selectedTheme));
    });
    radio.addEventListener('touchend', (e) => {
      if (e.cancelable) e.preventDefault();
      const selectedTheme = radio.value;
      document.startViewTransition(() => applyTheme(selectedTheme));
    }, { passive: false });
  });
}

