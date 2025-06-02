document.addEventListener('DOMContentLoaded', function () {
  const profileNavbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.check'); // your checkbox for menu

  // Hide all panels initially
  document.querySelectorAll('.crew-details').forEach(panel => {
    panel.classList.remove('show');
  });

  // Show/hide navbar on checkbox toggle (for hamburger/label menu)
  if (menuToggle && profileNavbar) {
    menuToggle.addEventListener('change', function () {
      if (menuToggle.checked) {
        profileNavbar.classList.add('show');
      } else {
        profileNavbar.classList.remove('show');
        // Optionally hide all panels when menu closes
        document.querySelectorAll('.crew-details').forEach(panel => {
          panel.classList.remove('show');
        });
      }
    });
  }

  // Tab switching logic
  document.querySelectorAll('.profile-tab').forEach(tab => {
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
        // Uncheck the menu toggle if present
        if (menuToggle) menuToggle.checked = false;
      });
    }
  });
});