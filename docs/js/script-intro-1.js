document.addEventListener('DOMContentLoaded', () => {
  // Element declarations to match HTML structure
  const themeButtons = document.querySelectorAll('.theme-button');
  const bars = document.querySelector('.menu-btn');
  const navigation = document.querySelector('.navigation');
  const nav = document.querySelector('.nav-links');
  const navLinksTabs = document.querySelectorAll('.nav-links a[data-tab]');
  const dataTabs = document.querySelectorAll('.data-tab.genesis, .data-tab.early, .data-tab.beginnings, .data-tab.ryerson')
    ;
  const profileheader = document.querySelector('.profile-header-img');

  // Helper functions
  function getDefaultTheme() {
    return 'dark';
  }
  function isValidTheme(theme) {
    return ['dark', 'light'].includes(theme);
  }
  function setActiveThemeButton() {
    themeButtons.forEach(btn => {
      const inputId = btn.getAttribute('for');
      const input = document.getElementById(inputId);
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

  // Theme initialization
  let savedTheme = localStorage.getItem('theme');
  if (!savedTheme || !isValidTheme(savedTheme)) {
    savedTheme = getDefaultTheme();
    localStorage.setItem('theme', savedTheme);
  }
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeButtons.forEach(btn => {
    const inputId = btn.getAttribute('for');
    const radio = document.getElementById(inputId);
    if (radio) radio.checked = (radio.value === savedTheme);
  });
  setActiveThemeButton();
  updateFavicon(savedTheme);
  // Theme button handlers
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const inputId = btn.getAttribute('for');
      const input = document.getElementById(inputId);
      if (input && !btn.classList.contains('active')) {
        input.checked = true;
        const selectedTheme = input.value;
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
      }
    });
  });

  // Navigation menu toggle
  if (bars && navigation && nav) {
    const burger = bars.querySelector('.menu-btn__burger');
    bars.addEventListener('click', (e) => {
      e.stopPropagation();
      bars.classList.toggle('open');
      if (burger) burger.classList.toggle('open');
      navigation.classList.toggle('open');
      nav.classList.toggle('open');
      if (navigation.classList.contains('open')) {
        profileheader.style.display = 'none';
      } else {
        profileheader.style.display = 'block';
      }
      // Hide all dataTabs on menu open
      if (dataTabs) {
        dataTabs.forEach(tab => {
          tab.style.display = 'none';
        });
      }
    });
  }

  // Tab logic
  function showTab(tab) {
    dataTabs.forEach(tabEl => tabEl.classList.remove('open'));
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
  // Hide all dataTabs initially
  if (dataTabs) {
    dataTabs.forEach(tab => tab.style.display = 'none');
  }

  // Close menus/tabs when clicking outside
  document.addEventListener('click', (event) => {
    // Close nav menu if open and click outside
    if (navigation && navigation.classList.contains('open') && !navigation.contains(event.target) && !bars.contains(event.target)) {
      navigation.classList.remove('open');
      nav.classList.remove('open');
      bars.classList.remove('open');
      profileheader.style.display = 'none';
      const burger = bars.querySelector('.menu-btn__burger');
      if (burger) burger.classList.remove('open');
    }
    // Ensure profileheader is displayed when menu is closed
    if (navigation && !navigation.classList.contains('open')) {
      profileheader.style.display = 'block';
    }
    // Hide all dataTabs if open and click outside
    if (dataTabs) {
      dataTabs.forEach(tab => {
        if (tab.classList.contains('open') && !tab.contains(event.target)) {
          tab.classList.remove('open');
          tab.style.display = 'none';
        }
      });
    }
  });
});
