document.addEventListener('DOMContentLoaded', () => {
  // ✅ Force dark theme immediately to prevent flash
  document.documentElement.setAttribute('data-theme', 'dark');

  const themeList = document.querySelector('.theme-list');
  const themeButtons = document.querySelectorAll('.theme-button');
  const wrapper = document.querySelector('.wrapper');
  const title = document.querySelector('.title');

  console.log('Theme buttons found:', themeButtons.length);
  console.log('Elements found:', { // ✅ Add debug info
    themeList: !!themeList,
    wrapper: !!wrapper,
    title: !!title
  });

  // ✅ Helper functions
  function getDefaultTheme() {
    return 'dark';
  }

  function isValidTheme(theme) {
    return ['dark', 'light'].includes(theme);
  }

  // Function to update favicon based on theme
  function updateFavicon(theme) {
    console.log('Updating favicon for theme:', theme);

    let favicon = document.getElementById("favicon") ||
      document.querySelector("link[rel='icon']") ||
      document.querySelector("link[rel='shortcut icon']");

    console.log('Favicon element:', favicon);

    if (favicon) {
      const faviconPath = theme === "dark"
        ? "/favicons/dark-1.png"
        : "/favicons/light-1.png";

      console.log('Setting favicon path to:', faviconPath);
      favicon.href = faviconPath + "?v=" + Date.now();
    } else {
      console.error('Favicon element not found! Creating new one...');

      const newFavicon = document.createElement('link');
      newFavicon.id = 'favicon';
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/png';
      newFavicon.href = (theme === "dark" ? "/favicons/dark-1.png" : "/favicons/light-1.png") + "?v=" + Date.now();
      document.head.appendChild(newFavicon);
    }
  }

  // Function to update active class on theme buttons
  function setActiveThemeButton() {
    themeButtons.forEach(btn => {
      const input = btn.querySelector('input[type="radio"]');
      btn.classList.toggle('active', input && input.checked);
    });
  }

  // ✅ Function to ensure content is visible
  function ensureContentVisible() {
    if (wrapper) {
      wrapper.style.display = 'block';
      wrapper.style.visibility = 'visible';
      wrapper.style.opacity = '1';
    }
    if (title) {
      title.style.display = 'block';
      title.style.visibility = 'visible';
      title.style.opacity = '1';
    }
    console.log('Content visibility ensured');
  }

  // Function to set theme with view transitions and update favicon
  function setTheme(theme) {
    console.log('Setting theme to:', theme);

    // Check if View Transition API is supported
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateFavicon(theme);
        ensureContentVisible(); // ✅ Ensure content is visible after theme change
      });
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateFavicon(theme);
      ensureContentVisible(); // ✅ Ensure content is visible after theme change
    }

    // Update radio button states
    themeButtons.forEach(btn => {
      const radio = btn.querySelector('input[type="radio"]');
      if (radio) radio.checked = (radio.value === theme);
    });
    setActiveThemeButton();
  }

  // ✅ Initialize with dark theme
  localStorage.setItem('theme', 'dark');
  let savedTheme = 'dark';

  console.log('Forced dark theme as default');

  // ✅ Apply theme immediately to avoid flash
  document.documentElement.setAttribute('data-theme', savedTheme);
  ensureContentVisible(); // ✅ Ensure initial content visibility

  // ✅ Update radio buttons to match saved theme
  themeButtons.forEach(btn => {
    const radio = btn.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = (radio.value === savedTheme);
    }
  });

  setActiveThemeButton();

  // ✅ Update favicon to match default theme
  updateFavicon(savedTheme);

  console.log('Final applied theme:', savedTheme);

  // Open dropdown when clicking the active theme button
  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      console.log('Button clicked');
      const input = btn.querySelector('input[type="radio"]');

      if (btn.classList.contains('active')) {
        e.stopPropagation();
        themeList && themeList.classList.add('active');
        // ✅ FIXED: Removed reference to undefined 'intro'
        ensureContentVisible(); // ✅ Use the helper function
      } else if (input) {
        console.log('Switching to theme:', input.value);
        input.checked = true;
        setTheme(input.value);
        themeList && themeList.classList.remove('active');
        ensureContentVisible(); // ✅ Use the helper function
      }
    });
  });

  // Listen to radio button changes directly
  themeButtons.forEach(btn => {
    const input = btn.querySelector('input[type="radio"]');
    if (input) {
      input.addEventListener('change', (e) => {
        console.log('Radio button changed:', e.target.value);
        if (e.target.checked) {
          setTheme(e.target.value);
        }
      });
    }
  });

  // Media query for system theme preference
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  let sysListener;

  // Handle system theme if selected
  if (savedTheme === 'system') {
    const systemTheme = mql.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', systemTheme);
    ensureContentVisible(); // ✅ Ensure content is visible
    console.log('System theme applied:', systemTheme);

    sysListener = e => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newSystemTheme);
      ensureContentVisible(); // ✅ Ensure content is visible
      console.log('System theme changed to:', newSystemTheme);
    };
    mql.addEventListener('change', sysListener);
  }

  // Close dropdown if clicking outside
  document.addEventListener('click', (event) => {
    if (
      themeList &&
      themeList.classList.contains('active') &&
      !themeList.contains(event.target)
    ) {
      themeList.classList.remove('active');
      ensureContentVisible(); // ✅ Use the helper function
    }
  });
});