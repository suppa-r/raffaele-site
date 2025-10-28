document.addEventListener('DOMContentLoaded', () => {
  // Using js- prefixed classes for cleaner separation
  const hamburgerTrigger = document.querySelector('.js-hamburger-trigger');
  const hamburgerOpen = document.querySelector('.js-hamburger-open');
  const hamburgerClose = document.querySelector('.js-hamburger-close');
  const navLinks = document.querySelector('.nav-links');

  // State tracking
  let isMenuOpen = false;

  function toggleHamburgerMenu() {
    isMenuOpen = !isMenuOpen;

    if (isMenuOpen) {
      // Show close icon, hide open icon
      hamburgerOpen.classList.add('d-none');
      hamburgerClose.classList.remove('d-none');
      navLinks.classList.add('open');
    } else {
      // Show open icon, hide close icon
      hamburgerOpen.classList.remove('d-none');
      hamburgerClose.classList.add('d-none');
      navLinks.classList.remove('open');
    }

    console.log('Menu is now:', isMenuOpen ? 'open' : 'closed');
  }

  // Event listener
  if (hamburgerTrigger) {
    hamburgerTrigger.addEventListener('click', toggleHamburgerMenu);
  }

  // Close menu when clicking nav links
  const navLinkItems = document.querySelectorAll('.nav-links a');
  navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
      if (isMenuOpen) {
        toggleHamburgerMenu();
      }
    });
  });
});