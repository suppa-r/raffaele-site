document.addEventListener('DOMContentLoaded', function () {
  const profileNavbar = document.querySelector('.profile-navbar');
  const profileButton = document.querySelector('.profile-button');
  const profileTabs = document.querySelectorAll('.profile-tab');
  const crewDetails = document.querySelectorAll('.crew-details');

  if (profileButton && profileNavbar) {
    profileButton.addEventListener('click', function (e) {
      e.preventDefault();
      profileNavbar.classList.toggle('show');
      // Hide all crew-details articles
      document.querySelectorAll('.crew-details').forEach(tab => {
        tab.hidden = false;
      });
    }
    );
  }
  // Tab switching logic
  if (profileTabs.length > 0) {
    profileTabs.forEach(tab => {
      tab.addEventListener('click', function (e) {
        e.preventDefault();

        // Show the target article
        const target = tab.getAttribute('data-target');
        const article = document.querySelector('.crew-details.' + target);
        if (article) {
          crewDetails.forEach(detail => detail.hidden = true); // Hide all crew details
          article.hidden = false; // Show the selected one
         
        }

        // Optionally hide the navbar after selection
        profileNavbar.classList.remove('show');
      }); 
    });
  }
});






