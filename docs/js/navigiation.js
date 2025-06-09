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

  // Functionality for icons inside panels
  document.querySelectorAll('.crew-details .icons').forEach(iconBox => {
    const menuIcon = iconBox.querySelector('.menu-icon');
    const closeIcon = iconBox.querySelector('.close-icon');

    if (menuIcon) {
      menuIcon.addEventListener('click', function () {
        // Open the menu and hide the current panel
        if (menuToggle) menuToggle.checked = true;
        if (profileNavbar) profileNavbar.classList.add('show');
        iconBox.closest('.crew-details').classList.remove('show');
      });
    }

    if (closeIcon) {
      closeIcon.addEventListener('click', function () {
        // Close the menu and hide the current panel
        if (menuToggle) menuToggle.checked = false;
        if (profileNavbar) profileNavbar.classList.remove('show');
        iconBox.closest('.crew-details').classList.remove('show');
        profileNavbar.classList.add('show');
      });
    }
  });

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
