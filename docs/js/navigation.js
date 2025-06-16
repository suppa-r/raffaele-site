document.addEventListener('DOMContentLoaded', function () {
  const profileNavbar = document.querySelector('.navagation');
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
    });
  }

// Attach click event ONCE to each .profile-tab
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      // Hide all panels
      document.querySelectorAll('.crew-details').forEach(panel => {
        panel.classList.remove('show');
      });
      // Show the clicked panel
      const targetPanel = document.querySelector(`.crew-details.${this.dataset.target}`);
      if (targetPanel) {
        targetPanel.classList.add('show');
        targetPanel.tabIndex = 0;
        targetPanel.focus();
      }
      // Optionally close the navbar and uncheck menu
      if (profileNavbar) profileNavbar.classList.remove('show');
      if (menuToggle) menuToggle.checked = false;
    });
  });
});
