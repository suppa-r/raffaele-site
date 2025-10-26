document.addEventListener('DOMContentLoaded', () => {
  // Element declarations
  const themeSwitcher = document.querySelector('.theme-switcher');
  const themeButtons = document.querySelectorAll('.theme-button');
  const wrapper = document.querySelector('.wrapper');
  const h = document.querySelector('header');
  const nav = document.querySelector('.nav-links');
  const menuBtn = document.querySelector('.menu-btn');
  const burgerMenu = document.querySelector('.menu-burger');
  const intro = document.querySelector('.intro');
  const navLinksTabs = document.querySelectorAll('.nav-links a');

  // ✅ FIXED: Ensure all nav items have --i variables
  const navItems = document.querySelectorAll('.nav-links li');
  if (navItems.length > 0) {
    navItems.forEach((item, index) => {
      if (!item.style.getPropertyValue('--i')) {
        item.style.setProperty('--i', index + 1);
      }
      console.log(`Nav item ${index + 1}: --i = ${item.style.getPropertyValue('--i')}`);
    });
  } else {
    console.warn('No nav items found for animation setup');
  }

  // Debug: Check if elements exist
  console.log('Menu button found:', menuBtn);
  console.log('Burger menu found:', burgerMenu);
  console.log('Nav links found:', nav);

  intro && (intro.style.display = 'block');

  // Close nav menu when a nav link is clicked
  navLinksTabs.forEach(link => {
    link.addEventListener('click', () => {
      console.log('Nav link clicked, closing menu');
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        nav.style.display = 'none'; // ✅ FIXED: Properly hide nav
        burgerMenu && burgerMenu.classList.remove('active');
      }
    });
  });

  // ✅ FIXED: Burger menu click handler with proper logic
  if (burgerMenu && nav) {
    burgerMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      console.log('Burger clicked!');

      const isOpen = !nav.classList.contains('open');
      console.log('Nav will be:', isOpen ? 'open' : 'closed');

      if (isOpen) {
        // Opening nav
        nav.style.display = 'flex';
        nav.style.opacity = '1';
        nav.style.pointerEvents = 'all';

        // Force reflow
        nav.offsetHeight;

        // Add open class for animations
        requestAnimationFrame(() => {
          nav.classList.add('open');
          console.log('Nav opened with animations');

          // Debug li elements
          const currentNavItems = document.querySelectorAll('.nav-links li');
          currentNavItems.forEach((item, index) => {
            setTimeout(() => {
              console.log(`Li ${index} styles:`, {
                transform: getComputedStyle(item).transform,
                opacity: getComputedStyle(item).opacity,
                transitionDelay: getComputedStyle(item).transitionDelay,
                iValue: item.style.getPropertyValue('--i')
              });
            }, 100);
          });
        });

        // Hide other elements when nav is open
        if (intro) intro.style.display = 'none';
        if (themeSwitcher) themeSwitcher.classList.remove('active');

      } else {
        // Closing nav
        nav.classList.remove('open');

        // Wait for animations to finish before hiding
        setTimeout(() => {
          nav.style.display = 'none';
          nav.style.opacity = '0';
          nav.style.pointerEvents = 'none';
        }, 1000);

        // Show other elements when nav is closed
        if (intro) intro.style.display = 'block';
      }

      // Toggle burger active state
      burgerMenu.classList.toggle('active', isOpen);
    });
  } else {
    console.error('Burger menu or nav not found!');
  }

  // ✅ FIXED: Function to update active class on theme buttons
  function setActiveThemeButton() {
    themeButtons.forEach(btn => {
      const input = btn.querySelector('input[type="radio"]');
      btn.classList.toggle('active', input && input.checked);
    });
  }

  // ✅ FIXED: Theme button handlers
  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const input = btn.querySelector('input[type="radio"]');

      if (btn.classList.contains('active')) {
        // If already active, toggle theme switcher
        e.stopPropagation();
        if (themeSwitcher) {
          themeSwitcher.classList.add('active');
        }
        if (intro) intro.style.display = 'block';
        if (h) h.style.display = 'block';
        if (nav) nav.style.display = 'block';

      } else if (input) {
        // Change theme
        input.checked = true;
        const selectedTheme = input.value;

        // Apply theme with transitions
        if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          document.startViewTransition(() => {
            document.documentElement.setAttribute('data-theme', selectedTheme);
            localStorage.setItem('theme', selectedTheme);
            updateFavicon(selectedTheme);
          });
        } else {
          document.documentElement.setAttribute('data-theme', selectedTheme);
          localStorage.setItem('theme', selectedTheme);
          updateFavicon(selectedTheme);
        }

        setActiveThemeButton();

        // Close theme switcher and nav
        if (themeSwitcher) themeSwitcher.classList.remove('active');
        if (intro) intro.style.display = 'block';
        if (h) h.style.display = 'block';
        if (nav) {
          nav.style.display = '';
          nav.classList.remove('open');
        }

        // Reset burger menu state
        if (burgerMenu) burgerMenu.classList.remove('active');
      }
    });
  });

  // ✅ FIXED: Click outside handlers
  document.addEventListener('click', (event) => {
    // Close theme dropdown
    if (themeSwitcher &&
      themeSwitcher.classList.contains('active') &&
      !themeSwitcher.contains(event.target)) {

      themeSwitcher.classList.remove('active');
      if (intro) intro.style.display = 'block';
      if (h) h.style.display = 'block';
      if (nav) nav.style.display = 'block';
    }

    // Close mobile nav when clicking outside
    if (nav &&
      nav.classList.contains('open') &&
      !nav.contains(event.target) &&
      burgerMenu && !burgerMenu.contains(event.target)) {

      console.log('Clicked outside, closing nav');
      nav.classList.remove('open');

      setTimeout(() => {
        nav.style.display = 'none';
        nav.style.opacity = '0';
        nav.style.pointerEvents = 'none';
      }, 800);

      if (burgerMenu) burgerMenu.classList.remove('active');
      if (intro) intro.style.display = 'block';
    }
  });

  // ✅ FIXED: Theme initialization
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  let sysListener;

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
});

// ✅ FIXED: Favicon function outside DOMContentLoaded
function updateFavicon(theme) {
  const favicon = document.getElementById("favicon") || document.querySelector("link[rel='icon']");
  if (favicon) {
    const faviconPath = theme === "dark"
      ? "/favicons/dark-1.png"
      : "/favicons/light-1.png";
    favicon.href = faviconPath + "?v=" + Date.now();
  }
}