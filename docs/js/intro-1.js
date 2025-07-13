document.addEventListener('DOMContentLoaded', function () {
  const profileNavbar = document.querySelector('.navigation');
  const menuToggle = document.querySelector('.burger-check');
  const crewDetails = document.querySelectorAll('.crew-details');
  const intro = document.querySelector('.intro');
  const bgImage = document.querySelector('.bg-image');
  const navLinks = document.querySelector('.nav-links');

  // Hide all panels initially, show image
  crewDetails.forEach(panel => {
    panel.classList.remove('show');
  });
  if (bgImage) bgImage.style.display = 'block';

  // Show/hide navbar on checkbox toggle
  if (menuToggle && profileNavbar) {
    menuToggle.addEventListener('change', function () {
      if (menuToggle.checked) {
        profileNavbar.classList.add('show');
        if (bgImage) bgImage.style.display = 'none'; // Hide image when nav is open
      } else {
        profileNavbar.classList.remove('show');
        // Only show image if no panel is open
        const anyPanelOpen = Array.from(crewDetails).some(panel => panel.classList.contains('show'));
        if (bgImage) bgImage.style.display = anyPanelOpen ? 'none' : 'block';
        profileNavbar.querySelectorAll('.profile-tab').forEach(tab => {
          tab.tabIndex = -1;
        });
      }
    });
  }

  // Attach click event to each .profile-tab
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      crewDetails.forEach(panel => panel.classList.remove('show'));
      const targetPanel = document.querySelector(`.crew-details.${this.dataset.target}`);
      if (targetPanel) targetPanel.classList.add('show');
      if (profileNavbar) profileNavbar.classList.remove('show');
      if (menuToggle) menuToggle.checked = false;
      if (bgImage) bgImage.style.display = 'none'; // Hide image when any panel is open
      targetPanel.tabIndex = 0;
      targetPanel.focus();
      targetPanel.onblur = function () {
        this.classList.remove('show');
        if (profileNavbar) profileNavbar.classList.add('show');
        if (menuToggle) menuToggle.checked = false;
        // Only show image if nav is closed and no panel is open
        const anyPanelOpen = Array.from(crewDetails).some(panel => panel.classList.contains('show'));
        if (bgImage) bgImage.style.display = anyPanelOpen ? 'none' : 'block';
      };
    });
  });

  document.querySelectorAll('.crew-details .profile-tab').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const currentPanel = this.closest('.crew-details');
      if (currentPanel) currentPanel.classList.remove('show');
      if (menuToggle) menuToggle.checked = true;
      if (profileNavbar) profileNavbar.classList.add('show');
      if (bgImage) bgImage.style.display = 'none'; // Hide image when any panel is open
    });
  });

  document.querySelectorAll('.navigation .burger-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      if (profileNavbar) profileNavbar.classList.remove('show');
      if (menuToggle) menuToggle.checked = false;
      const profileTabs = document.querySelector(`.crew-details.${this.dataset.target}`);
      if (profileTabs) {
        profileTabs.classList.add('show');
        profileTabs.tabIndex = 0;
        profileTabs.focus();
      }
      if (bgImage) bgImage.style.display = 'none'; // Hide image when any panel is open
    });
  });

  if (bgImage) {
    bgImage.addEventListener('load', function () {
      bgImage.style.display = 'block';
    });
    bgImage.addEventListener('error', function () {
      console.error('Background image failed to load.');
      bgImage.style.display = 'none';
    });
  }
});
