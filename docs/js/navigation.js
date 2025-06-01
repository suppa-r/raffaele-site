document.addEventListener('DOMContentLoaded', function () {
  const profileNavbar = document.querySelector('.profile-navbar');
  const profileButton = document.querySelector('.profile-button');

  if (profileButton && profileNavbar) {
    profileButton.addEventListener('click', function () {
      profileNavbar.classList.toggle('show');
    });
  }

  // Add event listener to each tab, not the navbar
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      // Hide all tab panels
      document.querySelectorAll('.crew-details').forEach(panel => {
        panel.hidden = true;
        panel.tabIndex = -1;
        panel.removeAttribute('aria-selected');
        panel.blur();
      });

      // Show the selected panel using data-target
      const panelClass = this.getAttribute('data-target');
      const panel = document.querySelector(`.crew-details.${panelClass}`);
      if (panel) {
        panel.hidden = false;
        panel.tabIndex = 0;
        panel.focus();
      }

      // Mark this tab as selected
      this.setAttribute('aria-selected', 'true');
      this.tabIndex = 0;
      this.focus();

      // Optionally hide the navbar after selection
      profileNavbar.classList.remove('show');
    });
  });
});