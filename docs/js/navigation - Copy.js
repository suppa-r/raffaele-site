document.addEventListener('DOMContentLoaded', function () {
  const profileNavbar = document.querySelector('.navigation'); // or '.navigation'
  const profileButton = document.querySelector('.burger-check');

  // Hide all panels initially
  document.querySelectorAll('.crew-details').forEach(panel => {
    panel.hidden = true;
    panel.tabIndex = -1;
  });

  // Show/hide navbar on burger click
  if (profileButton && profileNavbar) {
    profileButton.addEventListener('click', function (e) {
      profileNavbar.classList.toggle('show');
      // Hide all panels when menu is opened
      document.querySelectorAll('.crew-details').forEach(panel => {
        panel.hidden = true;
        panel.tabIndex = -1;
      });
      e.stopPropagation();
    });
  }

  // Tab switching logic
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();

      // Hide all panels
      document.querySelectorAll('.crew-details').forEach(panel => {
        panel.hidden = true;
        panel.tabIndex = -1;
      });

      // Show the selected panel
      const target = this.getAttribute('data-target');
      const article = document.querySelector('.crew-details.' + target);
      if (article) {
        article.hidden = false;
        article.tabIndex = 0;
        article.focus();
      }

      // Hide navbar after selection
      profileNavbar.classList.remove('show');

      // Update aria-selected
      document.querySelectorAll('.profile-tab').forEach(t => t.setAttribute('aria-selected', 'false'));
      this.setAttribute('aria-selected', 'true');
    });
  });

  // Close navbar when clicking outside
  document.addEventListener('click', function (event) {
    if (
      profileNavbar.classList.contains('show') &&
      !profileNavbar.contains(event.target) &&
      !profileButton.contains(event.target)
    ) {
      profileNavbar.classList.remove('show');
    }
  });
});



