document.addEventListener('DOMContentLoaded', function () {
  const profileButton = document.querySelector('.profile-button');
  const profileNavbar = document.querySelector('.navbar');

  // Hide all panels initially
  document.querySelectorAll('.crew-details').forEach(panel => {
    panel.classList.remove('show');
  });

  // Show/hide navbar on button click
  if (profileButton && profileNavbar) {
    profileButton.addEventListener('click', function () {
      profileNavbar.classList.toggle('show');
      // Hide all panels when menu is opened
      document.querySelectorAll('.crew-details').forEach(panel => {
        panel.classList.remove('show');
      });
    });
  }

  // Tab switching logic
  document.querySelectorAll('.profile-tab').forEach(tab => {
    // Only add handler if not a link (home)
    if (tab.tagName !== 'A') {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        // Hide all panels
        document.querySelectorAll('.crew-details').forEach(panel => {
          panel.classList.remove('show');
        });
        // Show the selected panel
        const panelClass = tab.getAttribute('data-target');
        const panel = document.querySelector('.crew-details.' + panelClass);
        if (panel) {
          panel.classList.add('show');
          panel.tabIndex = 0;
          panel.focus();
        }
        // Hide navbar after selection
        profileNavbar.classList.remove('show');
      });
    }
  });
});
