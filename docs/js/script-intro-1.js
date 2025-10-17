document.addEventListener('DOMContentLoaded', () => {
  const themeList = document.querySelector('.theme-list');
  const themeButtons = document.querySelectorAll('.theme-button');
  const wrapper = document.querySelector('.wrapper');
  const h = document.querySelector('header p');
  const nav = document.querySelector('.nav-links');
  const bars = document.querySelector('.menu-btn');
  const profile = document.querySelector('.profile');
  const profileTabs = document.querySelectorAll('.profile-tab');
  const navLinksTabs = document.querySelectorAll('.nav-links a');


  // Initially hide profile tabs container
  profile && (profile.style.display = 'block');

  bars.addEventListener('click', (e) => {
    e.stopPropagation();
    h && (h.style.display = 'block'); // Always show header p
    if (nav) {
      const isOpen = nav.classList.toggle('open');
      nav.style.display = isOpen ? 'block' : '';
      themeList && themeList.classList.remove('active');
      profile && (profile.style.display = 'none');
      // Hide all profile tabs when menu is open
      profileTabs.forEach(tab => {
        tab.style.display = isOpen ? 'none' : '';
      });

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
        nav && (nav.style.display = 'flex');
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
      h && (h.style.display = 'block');
      nav && (nav.style.display = 'flex');
    }
  });
});