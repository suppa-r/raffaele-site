document.addEventListener('DOMContentLoaded', function () {
  const bars = document.querySelector('.bars'); // burger button
  const navLinks = document.querySelector('.nav-links');
  const intro = document.querySelector('.intro');
  const themeList = document.querySelector('.theme-list');
  const themesBtn = document.querySelector('.link');

  // Toggle menu on burger click (show/hide nav-links)
  if (bars && navLinks) {
    bars.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = navLinks.classList.toggle('open');
      // Hide intro and themesBtn when menu is open, show when closed
      if (intro) intro.style.display = isOpen ? 'none' : '';
      if (themesBtn) themesBtn.style.display = isOpen ? 'none' : '';
      if (themeList) themeList.style.display = isOpen ? 'none' : 'flex';
    });
  }
  document.addEventListener('click', function () {
    if (navLinks && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      if (intro) intro.style.display = '';
      if (themesBtn) themesBtn.style.display = '';
      if (themeList) themeList.style.display = 'flex';
    }
  });

  // Also close menu when a nav link is clicked
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      if (intro) intro.style.display = '';
      if (themesBtn) themesBtn.style.display = '';
      if (themeList) themeList.style.display = 'flex';
    });
  });
});