document.addEventListener('DOMContentLoaded', function () {
  const profileNavbar = document.querySelector('.navigation');
  const menuToggle = document.querySelector('.burger-check');
  const icons = document.querySelectorAll('.icons');

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

    // Hide all panels initially
  document.querySelectorAll('.crew-details').forEach(panel => {
    panel.classList.remove('show');
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
      });
    });
});

icons.addEventListener('click', function () {
    // Hide the navbar when an icon is clicked
   
      profileNavbar.classList.add('show');
 
    // Uncheck the menu toggle checkbox
    const menuToggle = document.querySelector('.burger-check');
    if (menuToggle) {
      menuToggle.checked = false;
    }
  }); 

     














  