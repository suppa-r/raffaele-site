document.addEventListener('DOMContentLoaded', function () {
  const profileNavbar = document.querySelector('.navigation');
  const menuToggle = document.querySelector('.burger-check');
  const crewDetails = document.querySelectorAll('.crew-details');

  

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

  // Attach click event to each .profile-tab
 document.querySelectorAll('.profile-tab').forEach(tab => {
  tab.addEventListener('click', function (e) {
    e.preventDefault();
   // Hide all panels
    document.querySelectorAll('.crew-details').forEach(panel => panel.classList.remove('show'));
  //  // Show the clicked panel
    const targetPanel = document.querySelector(`.crew-details.${this.dataset.target}`);
    if (targetPanel) targetPanel.classList.add('show');
    // Close the navbar and uncheck menu
    if (profileNavbar) profileNavbar.classList.remove('show');
    if (menuToggle) menuToggle.checked = false;
  });
});

  document.querySelectorAll('.crew-details .profile-tab').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    // Hide the current panel
    const currentPanel = this.closest('.crew-details');
    if (currentPanel) currentPanel.classList.remove('show');
    // Show the navigation
    if (menuToggle) menuToggle.checked = true;
    if (profileNavbar) profileNavbar.classList.add('show');
   });
});

  // Handle click on .burger-link in the navigation
  document.querySelectorAll('.navigation .burger-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      // Hide the navigation
      if (profileNavbar) profileNavbar.classList.remove('show');
      if (menuToggle) menuToggle.checked = false;
      // Show the corresponding panel
      const profileTabs = document.querySelector(`.crew-details.${this.dataset.target}`);
      if (targetPanel) {
        profileTabs.classList.add('show');
        profileTabs.tabIndex = 0;
        profileTabs.focus();
      }
    });
  });
});
