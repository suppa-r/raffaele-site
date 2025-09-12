// ...existing code...
const linkButton = document.querySelector('.link');
const dropdown = document.querySelector('.dropdown');
const dropdownMenu = document.querySelector('.color-picker.dropdown-menu');

const curve = document.querySelector('.curve-container');
const text = document.querySelector('.text-container');
const largebutton = document.querySelector('.large-button');

const themeRadios = document.querySelectorAll('.theme-list-item input[type="radio"]');

const isMobile = () => window.matchMedia('(max-width: 600px)').matches;

// --- Theme logic ---
let systemMql = window.matchMedia('(prefers-color-scheme: dark)');
let systemListener = null;

function bindSystemListener() {
  if (systemListener) return;
  systemListener = (e) => {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  };
  systemMql.addEventListener('change', systemListener);
}
function unbindSystemListener() {
  if (!systemListener) return;
  systemMql.removeEventListener('change', systemListener);
  systemListener = null;
}
function applyTheme(theme) {
  if (theme === '💻') {
    document.documentElement.setAttribute('data-theme', systemMql.matches ? 'dark' : 'light');
    bindSystemListener();
  } else {
    unbindSystemListener();
    document.documentElement.setAttribute('data-theme', theme === '🌑' ? 'dark' : 'light');
  }
  localStorage.setItem('theme-preference', theme);
}

// --- UI refresh ---
function setContainersVisible(visible) {
  const displayVal = visible ? '' : 'none';
  if (curve) curve.style.display = displayVal;
  if (text) text.style.display = displayVal;
  if (largebutton) largebutton.style.display = displayVal;
}

function syncMenuVisibility() {
  if (!dropdown || !dropdownMenu) return;
  const isActive = dropdown.classList.contains('active');
  dropdownMenu.style.display = isActive ? 'grid' : 'none';
}

function refreshUI() {
  // Ensure dropdown menu element visibility matches active state
  syncMenuVisibility();
  // Hide content while the menu is open, show otherwise
  const menuOpen = dropdown?.classList.contains('active');
  setContainersVisible(!menuOpen);
}

// --- Init: hide dropdown by default, apply saved theme, initial refresh ---
document.addEventListener('DOMContentLoaded', () => {
  if (dropdown) dropdown.classList.remove('active');
  if (dropdownMenu) dropdownMenu.style.display = 'none';

  const savedTheme = localStorage.getItem('theme-preference') || '💻';
  applyTheme(savedTheme);
  const checked = document.querySelector(`[name="theme"][value="${savedTheme}"]`);
  if (checked) checked.checked = true;

  refreshUI();
});

// --- Toggle menu on .link click ---
if (linkButton) {
  linkButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (!dropdown) return;
    dropdown.classList.toggle('active');
    refreshUI();
  });
}

// --- When a theme is picked: apply theme, close menu, refresh ---
themeRadios.forEach((input) => {
  input.addEventListener('change', () => {
    const val = input.value;
    if ('startViewTransition' in document) {
      document.startViewTransition(() => applyTheme(val));
    } else {
      applyTheme(val);
    }
    if (dropdown) dropdown.classList.remove('active');
    refreshUI();
  });
});

// --- Global click: re-sync UI after any interaction ---
document.addEventListener('click', () => {
  // Defer to run after default handlers
  setTimeout(refreshUI, 0);
}, true);

// --- Resize: keep UI consistent across breakpoints ---
window.addEventListener('resize', () => {
  refreshUI();
});