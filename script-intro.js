document.addEventListener('DOMContentLoaded', () => {
  // ✅ FIXED: Element declarations to match your HTML structure
  const themeSwitcher = document.querySelector('.theme-switcher');
  const themeButtons = document.querySelectorAll('.theme-button');
  const wrapper = document.querySelector('.wrapper');
  const navBar = document.querySelector('.navbar');
  const main = document.querySelector('main');

  // ✅ FIXED: Helper functions
  function getDefaultTheme() {
    return 'dark';
  }

  function isValidTheme(theme) {
    return ['dark', 'light', 'system'].includes(theme);
  }

  function setActiveThemeButton() {
    themeButtons.forEach(btn => {
      const input = btn.querySelector('input[type="radio"]');
      btn.classList.toggle('active', input && input.checked);
    });
  }

  function updateFavicon(theme) {
    const favicon = document.getElementById("favicon") || document.querySelector("link[rel='icon']");
    if (favicon) {
      const faviconPath = theme === "dark"
        ? "/favicons/dark-1.png"
        : "/favicons/light-1.png";
      favicon.href = faviconPath + "?v=" + Date.now();
    }
  }


  // ✅ FIXED: Theme initialization
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  let sysListener;

  let savedTheme = localStorage.getItem('theme');

  // Validate and set default theme
  if (!savedTheme || !isValidTheme(savedTheme)) {
    savedTheme = getDefaultTheme();
    localStorage.setItem('theme', savedTheme);
    console.log('No valid saved theme, defaulting to:', savedTheme);
  } else {
    console.log('Using saved theme:', savedTheme);
  }

  // Apply theme immediately
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Update radio buttons
  themeButtons.forEach(btn => {
    const radio = btn.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = (radio.value === savedTheme);
    }
  });

  setActiveThemeButton();

  // Handle system theme if selected
  if (savedTheme === 'system') {
    const systemTheme = mql.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', systemTheme);
    console.log('System theme applied:', systemTheme);

    sysListener = e => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newSystemTheme);
      console.log('System theme changed to:', newSystemTheme);
    };
    mql.addEventListener('change', sysListener);
  } else if (sysListener) {
    mql.removeEventListener('change', sysListener);
  }

  // Update favicon to match default theme
  updateFavicon(savedTheme === 'system' ? (mql.matches ? 'dark' : 'light') : savedTheme);

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
        if (wrapper) wrapper.style.display = 'none';
        if (main) main.style.display = 'none';
        if (navBar) navBar.style.display = 'none';
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

        // Close theme switcher
        if (themeSwitcher) themeSwitcher.classList.remove('active');
        if (wrapper) wrapper.style.display = 'block';
        if (main) main.style.display = 'block';
        if (navigation) navigation.style.display = 'block';
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
      if (main) main.style.display = 'block';
      if (navigation) navigation.style.display = 'block';
    }



    // ✅ ADDED: Debug information
    console.log('Script loaded. Elements found:', {
      themeSwitcher: !!themeSwitcher,
      themeButtons: themeButtons.length,
      wrapper: !!wrapper,
      main: !!main,
      navigation: !!navigation,
      navLinks: !!navLinks,
      headerSmMenu: !!headerSmMenu,
      hamMenuBtn: !!hamMenuBtn,
      headerHamMenuBtn: !!headerHamMenuBtn,
      headerHamMenuCloseBtn: !!headerHamMenuCloseBtn,
      headerSmallMenuLinks: headerSmallMenuLinks.length,
      headerLogoContainer: !!headerLogoContainer
    });
  });    // Show main content
  if (wrapper) wrapper.style.display = 'block';
});