document.addEventListener('DOMContentLoaded', function () {
  const profileNavbar = document.querySelector('.profile-navbar');
  const profileButton = document.querySelector('.profile-button');
  const target = tab.getAttribute('data-target');
const article = document.querySelector('.crew-details.' + target);

  // Hide all panels initially
  //document.querySelectorAll('.crew-details').forEach(panel => {
   // panel.hidden = true;
  //});

  // Show/hide navbar on button click
  if (profileButton && profileNavbar) {
    profileButton.addEventListener('click', function () {
      profileNavbar.classList.toggle('show');
      // Hide all panels when menu is opened
      document.querySelectorAll('.crew-details').forEach(panel => {
        panel.hidden = true;
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
          panel.hidden = true;
        });

        // Show the selected panel
        const target = tab.getAttribute('data-target');
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
        tab.setAttribute('aria-selected', 'true');
      });
    }
  });
});