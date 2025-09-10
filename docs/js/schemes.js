const userButton = document.querySelector('.user-button');
const maincontent = document.querySelector('.main-content');

if (userButton) {
  userButton.addEventListener('click', () => {
    const profileMenu = document.querySelector('.profile-menu');
    const title = document.querySelector('.title');
    const headermobile = document.querySelector('.headermobile');

    // Always show menu on click
    if (profileMenu) {
      profileMenu.classList.add('active');
      profileMenu.style.display = 'block';
      profileMenu.style.marginTop = '';
    }

    // Mobile-specific layout changes
    if (window.innerWidth <= 600 && maincontent) {
      maincontent.style.display = 'none';
      userButton.classList.add('active');
      if (title) {
        title.style.display = 'block';
        title.style.marginTop = 'var(--space-xl)';
        if (profileMenu && title.parentNode) {
          title.parentNode.insertBefore(profileMenu, title.nextSibling);
          profileMenu.style.marginTop = 'var(--space-7xl)';
        }
      }
      if (headermobile) {
        headermobile.style.display = 'block';
        headermobile.style.marginTop = 'var(--space-2xl)';
      }
    }
  });
}

// --- Utility functions ---
function showMainContent() {
  if (maincontent) maincontent.style.display = 'block';
  if (userButton) userButton.classList.remove('active');
  const title = document.querySelector('.title');
  if (title) {
    title.style.display = '';
    title.style.marginTop = '';
  }
  const headermobile = document.querySelector('.headermobile');
  if (headermobile) {
    headermobile.style.display = '';
    headermobile.style.marginTop = '';
  }
  const profileMenu = document.querySelector('.profile-menu');
  if (profileMenu) {
    profileMenu.classList.remove('active');
    profileMenu.style.marginTop = '';
    profileMenu.style.display = 'none';
  }
}

// ...rest of your code remains unchanged...

function closeThemePreference() {
  const themePreference = document.querySelector('.theme-preference');
  if (themePreference) themePreference.classList.remove('active');
}

function closeProfileMenu() {
  const profileMenu = document.querySelector('.profile-menu');
  if (profileMenu) {
    profileMenu.classList.remove('active');
    profileMenu.style.marginTop = '0';
    profileMenu.style.display = 'none'; // <-- Hide menu after selection
  }
}

function isMenuItem(el) {
  return el.matches('label, input[type="radio"], a, button, li, [role="menuitem"]');
}

// --- Close menus and show main-content when a menu item is selected ---
function closeMenusAndShow() {
  const dropdown = document.querySelector('.dropdown.active');
  if (dropdown) dropdown.classList.remove('active');
  closeThemePreference();
  closeProfileMenu();
  showMainContent();
}

document.querySelectorAll('.drop-down li').forEach(item => {
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
});

// --- View Transitions API for smooth theme switch (if supported) ---
if ('startViewTransition' in document) {
  themeRadios.forEach((radio) => {
    radio.addEventListener('change', (event) => {
      const selectedTheme = event.target.value;
      document.startViewTransition(() => applyTheme(selectedTheme));
    });
  });
}