let userButton, profileMenu, maincontent;
// --- Dropdown functionality --- (used for color scheme menu)
document.addEventListener("click", e => {
  const isDropdownButton = e.target.matches("[data-dropdown-button]")
  if (!isDropdownButton && e.target.closest("[data-dropdown]") != null) return
  let currentDropdown = null
  if (isDropdownButton) {
    currentDropdown = e.target.closest("[data-dropdown]")
    currentDropdown.classList.toggle("active")
  }

  document.querySelectorAll("[data-dropdown].active").forEach(dropdown => {
    if (dropdown === currentDropdown) return
    dropdown.classList.remove("active")
  })
})
// --- Show profile menu on user button click, handle mobile layout ---
document.addEventListener('DOMContentLoaded', () => {
  userButton = document.querySelector('.user-button');
  profileMenu = document.querySelector('.profile-menu');
  maincontent = document.querySelector('.main-content');

  if (userButton) {
    userButton.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other menus
      const dropdown = document.querySelector('.dropdown-menu');
      if (dropdown) dropdown.classList.remove('active');
      closeThemePreference();
      closeProfileMenu();

      // Toggle color picker
      const colorpicker = document.querySelector('.color-picker');
      if (colorpicker) {
        colorpicker.classList.add('active');
        colorpicker.style.display = 'block';
        colorpicker.style.marginTop = '';
      }
      if (window.innerWidth <= 600 && maincontent) {
        maincontent.style.display = 'none';
      }
    });
  }

  if (profileMenu) {
    profileMenu.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent closing when clicking inside the menu
    });
  }

  const colorpicker = document.querySelector('.color-picker');
  if (colorpicker) {
    colorpicker.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent closing when clicking inside the color picker
    });
  }

  document.addEventListener('click', () => {
    closeProfileMenu();
    closeColorPicker();
    if (window.innerWidth <= 600 && maincontent) {
      maincontent.style.display = 'block';
    }
  });
});
function closeProfileMenu() {
  if (profileMenu) {
    profileMenu.classList.remove('active');
    profileMenu.style.display = 'none';
  }
}
function closeColorPicker() {
  const colorpicker = document.querySelector('.color-picker');
  if (colorpicker) {
    colorpicker.classList.remove('active');
    colorpicker.style.display = 'none';
  }
}
function closeThemePreference() {
  const themepref = document.querySelector('.theme-preference');
  if (themepref) {
    themepref.classList.remove('active');
    themepref.style.display = 'none';
  }
}
// --- End profile menu functionality ---     