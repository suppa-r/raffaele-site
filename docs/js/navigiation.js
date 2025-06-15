document.addEventListener('DOMContentLoaded', function () {
  const profileNavbar = document.querySelector('.navigation');
  const menuToggle = document.querySelector('.burger-check');

  // Hide all panels initially
  document.querySelectorAll('.crew-details').forEach(panel => {
    panel.classList.remove('show');
  });

  // Show/hide navbar on checkbox toggle
  if (menuToggle && profileNavbar) {
    menuToggle.addEventListener('change', function () {
      if (menuToggle.checked) {
        profileNavbar.classList.add('show');
      } else {
        profileNavbar.classList.remove('show');
      }
      // Optionally hide all panels when menu is toggled
      document.querySelectorAll('.crew-details').forEach(panel => panel.classList.remove('show'));
    });
  }

  // Add click event to profile tabs ONCE
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      // Hide all panels
      document.querySelectorAll('.crew-details').forEach(panel => panel.classList.remove('show'));
      // Show the clicked panel
      const target = this.dataset.target;
      const panel = document.querySelector('.crew-details.' + target);
      if (panel) panel.classList.add('show');
      // Optionally close the navigation after selection:
      if (profileNavbar) profileNavbar.classList.remove('show');
      if (menuToggle) menuToggle.checked = false;
    });
  });
});