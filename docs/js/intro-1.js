document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.querySelector('.burger-check');
  const burger = document.querySelector('.burger');
  const intro = document.querySelector('.intro');
  const navLinks = document.querySelector('.nav-links');

  // Show/hide navbar on burger click
  if (burger && navLinks && menuToggle) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (navLinks.classList.contains('open')) {
        navLinks.style.display = 'block';
        if (intro) intro.style.display = 'none';
      } else {
        navLinks.style.display = '';
        if (intro) intro.style.display = 'block';
      }
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', function (e) {
    if (navLinks && !navLinks.contains(e.target) && menuToggle && menuToggle.checked) {
      navLinks.classList.remove('open');
      menuToggle.checked = false;
      if (intro) intro.style.display = "";
    }
  });



  // Make nav links functional (close menu and scroll if anchor)
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
      navLinks.classList.remove('open');
      if (menuToggle) menuToggle.checked = false;
      if (intro) intro.style.display = "";
    });
  });

  // Fade in intro section
  if (intro) {
    intro.style.opacity = 1;
  }
});