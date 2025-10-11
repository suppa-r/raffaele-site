document.addEventListener('DOMContentLoaded', () => {
  const themeList = document.querySelector('.theme-list');
  const themeButtons = document.querySelectorAll('.theme-button');
  const wrapper = document.querySelector('.wrapper');
  const h = document.querySelector('header p');
  const nav = document.querySelector('.nav-links');
  const bars = document.querySelector('.menu-btn');
  const intro = document.querySelector('.intro');
 const navLinksTabs = document.querySelectorAll('.nav-links a');

intro && (intro.style.display = 'block');
// Close nav menu when a nav link is clicked (for better mobile UX)
navLinksTabs.forEach(link => {
  link.addEventListener('click', () => {
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      nav.style.display = ''; // Hide nav links when a link is clicked
    }
  });
});

  // Toggle nav menu on menu button click (for mobile)
bars.addEventListener('click', (e) => {
  e.stopPropagation();
  h && (h.style.display = 'block'); // Always show header p
  if (nav) {
    const isOpen = nav.classList.toggle('open');
    nav.style.display = isOpen ? 'block' : '';
    themeList && themeList.classList.remove('active');
    intro && (intro.style.display = isOpen ? 'none' : 'block'); // <-- Show intro when menu closes
    // Hide theme list when menu is toggled
    if (isOpen) {
      themeList && themeList.classList.remove('active');
    } else {
      themeList && (themeList.style.display = 'none');
    }
  }
});

// Function to update active class on theme buttons
function setActiveThemeButton() {
  themeButtons.forEach(btn => {
    const input = btn.querySelector('input[type="radio"]');
    btn.classList.toggle('active', input && input.checked);
    });
  }

  // Open dropdown when clicking the active theme button
  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const input = btn.querySelector('input[type="radio"]');
      if (btn.classList.contains('active')) {
        // Open dropdown (show non-active options)
        e.stopPropagation();
        themeList.classList.add('active');
        intro && (intro.style.display = 'block');
        h && (h.style.display = 'block');
        nav && (nav.style.display = 'block'); // <-- Show nav-links
      } else if (input) {
        // Switch theme if non-active button is clicked
        input.checked = true;
        const selectedTheme = input.value;
        document.documentElement.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('theme', selectedTheme);
        setActiveThemeButton();
        themeList.classList.remove('active');
        intro && (intro.style.display = 'block');
        h && (h.style.display = 'block');
        nav && (nav.style.display = ''); // <-- Hide nav-links
        nav && nav.classList.remove('open'); // <-- Remove open class if used
      }
    });
  });

  // Media query for system theme preference
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  let sysListener;

  // Load saved theme from localStorage
  let savedTheme = localStorage.getItem('theme');
  if (!savedTheme) {
    savedTheme = 'dark';
    localStorage.setItem('theme', 'dark');
  }
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeButtons.forEach(btn => {
    const radio = btn.querySelector('input[type="radio"]');
    if (radio) radio.checked = (radio.value === savedTheme);
  });
  setActiveThemeButton();

  if (savedTheme === 'system') {
    document.documentElement.setAttribute('data-theme', mql.matches ? 'dark' : 'light');
    sysListener = e => document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    mql.addEventListener('change', sysListener);
  } else if (sysListener) {
    mql.removeEventListener('change', sysListener);
  }

  // Close dropdown if clicking outside
  document.addEventListener('click', (event) => {
    if (
      themeList &&
      themeList.classList.contains('active') &&
      !themeList.contains(event.target)
    ) {
      themeList.classList.remove('active');
      intro && (intro.style.display = 'block');
      h && (h.style.display = 'block');
      nav && (nav.style.display = 'block');
    }
  });
});