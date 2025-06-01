document.addEventListener('DOMContentLoaded', function () {
  const profileNavbar = document.querySelector('.profile-navbar');
  const profileButton = document.querySelector('.profile-button');

  if (profileButton && profileNavbar) {
    profileButton.addEventListener('click', function (e) {
      e.preventDefault();
      profileNavbar.classList.toggle('show');
      // Hide all crew-details articles
      document.querySelectorAll('.crew-details').forEach(tab => {
        tab.hidden = false;
      });
    });
  }

  // Tab switching logic
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();

  // Show the target article
      const target = tab.getAttribute('data-target');
      const article = document.querySelector('.crew-details.' + target);
      if (article) {
        article.hidden = true;
      }

      // Optionally hide the navbar after selection
      profileNavbar.classList.remove('show');
    });
  });
});







