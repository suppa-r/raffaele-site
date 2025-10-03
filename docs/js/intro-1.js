document.addEventListener('DOMContentLoaded', function () {
  const bars = document.querySelector('.bars'); // burger button
  const navLinks = document.querySelector('.nav-links');
  const intro = document.querySelector('.intro');

  // Toggle menu on burger click
  if (bars && navLinks) {
    bars.addEventListener('click', function (e) {
      e.stopPropagation();
      navLinks.classList.toggle('open');
      if (intro) intro.style.display = navLinks.classList.contains('open') ? 'none' : '';
    });
  }

  // Close menu on any click outside the menu or burger
  document.addEventListener('click', function (e) {
    if (
      navLinks &&
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !bars.contains(e.target)
    ) {
      navLinks.classList.remove('open');
      if (intro) intro.style.display = '';
    }
  });

  // Also close menu when a nav link is clicked
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      if (intro) intro.style.display = '';
    });
  });
});