document.addEventListener('DOMContentLoaded', () => {
  const themeList = document.querySelector('.theme-list');
  const themeButtons = document.querySelectorAll('.theme-button');
  const wrapper = document.querySelector('.wrapper');
  const h = document.querySelector('header p');
  const nav = document.querySelector('.nav-links');
  const bgImage = document.querySelector('.bg-image');
  const burger = document.querySelector('.burger');

  if (burger) {
    burger.addEventListener('click', () => {
      if (bgImage) {
        bgImage.style.display = (bgImage.style.display === 'none' ? 'block' : 'none');
      }
      if (burger) (burger).classList.toggle('active'); ``
      if (burger.classList.contains('active')) {  
        
        burger.classList.remove('active');
      } else {
        burger.classList.add('active');
      }
    });
  }

  // Function to update active class on theme buttons
  function setActiveThemeButton() {
    themeButtons.forEach(btn => {
      const input = btn.querySelector('input[type="radio"]');
      btn.classList.toggle('active', input && input.checked);
    });
  }

  // Open dropdown when clicking the active theme button  


  // Theme button click: toggle bgImage and handle theme logic
  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const input = btn.querySelector('input[type="radio"]');
      if (bgImage) {
        // Toggle bg-image on every theme button click
        bgImage.style.display = (bgImage.style.display === 'none' ? 'block' : 'none');
      }
      if (btn.classList.contains('active')) {
        // Open dropdown (show non-active options)
        e.stopPropagation();
        themeList.classList.add('active');
        wrapper && (wrapper.style.display = 'block');
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
        wrapper && (wrapper.style.display = 'block');
        h && (h.style.display = 'block');
        nav && (nav.style.display = 'flex');
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
      wrapper && (wrapper.style.display = 'block');
      h && (h.style.display = 'block');
      nav && (nav.style.display = 'flex');
    }
  });
});


