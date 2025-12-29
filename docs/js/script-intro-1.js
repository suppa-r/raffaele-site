document.addEventListener('DOMContentLoaded', () => {
  const themeSwitcher = document.querySelector('.theme-switcher');
  const themeButtons = document.querySelectorAll('.theme-button');
  const wrapper = document.querySelector('.wrapper');
  const h = document.querySelector('header p');
  const nav = document.querySelector('.nav-links');
  const bars = document.querySelector('.menu-btn');
  const navigation = document.querySelector('.navigation');
  const profile = document.querySelector('.profile');
  const profileTabs = document.querySelectorAll('.data-tab.genesis, .data-tab.early, .data-tab.beginnings, .data-tab.ryerson');
  const navLinksTabs = document.querySelectorAll('.nav-links a[data-tab]');

  function showTab(tab) {
    profileTabs.forEach(tabEl => tabEl.classList.remove('open'));
    const showTab = document.querySelector('.data-tab.' + tab);
    if (showTab) showTab.classList.add('open');
  }

  function setActiveNav(tab) {
    navLinksTabs.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector('.nav-links a[data-tab="' + tab + '"]');
    if (activeLink) activeLink.classList.add('active');
  }

  navLinksTabs.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const tab = this.getAttribute('data-tab');
      setActiveNav(tab);
      showTab(tab);
    });
  });

  // On load, show the first tab and set nav active
  if (navLinksTabs.length > 0) {
    const firstTab = navLinksTabs[0].getAttribute('data-tab');
    setActiveNav(firstTab);
    showTab(firstTab);
  }
  const profileMenu = document.querySelector('.profile-menu');


  // Initially hide profile tabs container
  profile && (profile.style.display = 'block');

  // Toggle navigation on menu-btn click
  bars.addEventListener('click', (e) => {
    e.stopPropagation();
    // Toggle hamburger animation
    bars.classList.toggle('open');
    if (navigation) {
      navigation.classList.toggle('open');
    }
    // Optionally, close profile menu if open
    if (profileMenu) {
      profileMenu.setAttribute('hidden', '');
    }
  });

  // Close profile menu when clicking outside
  document.addEventListener('click', (event) => {
    if (profileMenu && !profileMenu.hasAttribute('hidden')) {
      if (!profileMenu.contains(event.target) && !bars.contains(event.target)) {
        profileMenu.setAttribute('hidden', '');
      }
    }
  });

  // Function to update active class on theme buttons
  function setActiveThemeButton() {
    themeLabels.forEach(label => {
      const input = themeSwitcher.querySelector(`#${label.getAttribute('for')}`);
      label.classList.toggle('active', input && input.checked);
    });
  }

  // Open dropdown when clicking the active theme button
  themeLabels.forEach(label => {
    label.addEventListener('click', (e) => {
      const input = themeSwitcher.querySelector(`#${label.getAttribute('for')}`);
      if (input && !input.checked) {
        input.checked = true;
        setTheme(input.value);
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
  themeRadios.forEach(input => {
    input.addEventListener('change', (e) => {
      if (e.target.checked) {
        setTheme(e.target.value);
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