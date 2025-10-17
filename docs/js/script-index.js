document.addEventListener('DOMContentLoaded', () => {
  const themeList = document.querySelector('.theme-list');
  const themeButtons = document.querySelectorAll('.theme-button');
  const intro = document.querySelector('.wrapper.intro');
  const title = document.querySelector('.title');

  console.log('Theme buttons found:', themeButtons.length); // Debug

  // Function to update favicon based on theme
  function updateFavicon(theme) {
    console.log('Updating favicon for theme:', theme); // Debug

    // Try multiple selectors to find favicon
    let favicon = document.getElementById("favicon");

    if (!favicon) {
      favicon = document.querySelector("link[rel='icon']");
    }

    if (!favicon) {
      favicon = document.querySelector("link[rel='shortcut icon']");
    }

    console.log('Favicon element:', favicon); // Debug

    if (favicon) {
      const faviconPath = theme === "dark"
        ? "/favicons/dark-1.png"
        : "/favicons/light-1.png";

      console.log('Setting favicon path to:', faviconPath); // Debug

      // Force browser to reload favicon
      favicon.type = 'image/x-icon';
      favicon.rel = 'shortcut icon';
      favicon.href = faviconPath + "?v=" + Date.now();

      console.log('Favicon href after update:', favicon.href); // Debug

      // Alternative method: Create new favicon element
      const newFavicon = favicon.cloneNode();
      newFavicon.href = faviconPath + "?v=" + Date.now();
      favicon.parentNode.removeChild(favicon);
      document.head.appendChild(newFavicon);

    } else {
      console.error('Favicon element not found! Creating new one...');

      // Create favicon if it doesn't exist
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

  // Function to set theme with view transitions and update favicon
  function setTheme(theme) {
    console.log('Setting theme to:', theme); // Debug

    // Check if View Transition API is supported
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Use View Transition API for the rotation effect
      document.startViewTransition(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateFavicon(theme);
      });
    } else {
      // Fallback for browsers without View Transition API or reduced motion preference
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateFavicon(theme);
    }

    // Update radio button states
    themeButtons.forEach(btn => {
      const radio = btn.querySelector('input[type="radio"]');
      if (radio) radio.checked = (radio.value === theme);
    });
    setActiveThemeButton();
  }

  // Open dropdown when clicking the active theme button
  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      console.log('Button clicked'); // Debug
      const input = btn.querySelector('input[type="radio"]');

      if (btn.classList.contains('active')) {
        // Open dropdown (show non-active options)
        e.stopPropagation();
        themeList && themeList.classList.add('active');
        intro && (intro.style.display = 'block');
        title && (title.style.display = 'block');
      } else if (input) {
        // Switch theme if non-active button is clicked
        console.log('Switching to theme:', input.value); // Debug
        input.checked = true;
        setTheme(input.value); // Use setTheme function for view transitions
        themeList && themeList.classList.remove('active');
        intro && (intro.style.display = 'block');
        title && (title.style.display = 'block');
      }
    });
  });

  // Listen to radio button changes directly
  themeButtons.forEach(btn => {
    const input = btn.querySelector('input[type="radio"]');
    if (input) {
      input.addEventListener('change', (e) => {
        console.log('Radio button changed:', e.target.value); // Debug
        if (e.target.checked) {
          setTheme(e.target.value);
        }
      });
    }
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

  console.log('Initial theme:', savedTheme); // Debug

  // Set initial theme and favicon
  setTheme(savedTheme);

  if (savedTheme === 'system') {
    const systemTheme = mql.matches ? 'dark' : 'light';
    setTheme(systemTheme);

    sysListener = e => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setTheme(newSystemTheme);
    };
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
      title && (title.style.display = 'block');
    }
  });
});