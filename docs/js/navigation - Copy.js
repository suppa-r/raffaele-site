document.addEventListener('DOMContentLoaded', function () {
<<<<<<< HEAD
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
=======
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
>>>>>>> 82443a1bcf52dc540282e9b45f8b2605b04d9adf
      profileNavbar.classList.toggle('show');
      // Hide all panels when menu is opened
      document.querySelectorAll('.crew-details').forEach(panel => {
        panel.hidden = true;
<<<<<<< HEAD
      });
=======
        panel.tabIndex = -1;
      });
      e.stopPropagation();
>>>>>>> 82443a1bcf52dc540282e9b45f8b2605b04d9adf
    });
  }

  // Tab switching logic
  document.querySelectorAll('.profile-tab').forEach(tab => {
<<<<<<< HEAD
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
=======
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



>>>>>>> 82443a1bcf52dc540282e9b45f8b2605b04d9adf
