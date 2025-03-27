/* -----------------------------------------
  Have focus outline only for keyboard users 
 ---------------------------------------- */

const handleFirstTab = (e) => {
  if (e.key === "Tab") {
    document.body.classList.add("user-is-tabbing");

    window.removeEventListener("keydown", handleFirstTab);
    window.addEventListener("mousedown", handleMouseDownOnce);
  }
};

const handleMouseDownOnce = () => {
  document.body.classList.remove("user-is-tabbing");

  window.removeEventListener("mousedown", handleMouseDownOnce);
  window.addEventListener("keydown", handleFirstTab);
};

window.addEventListener("keydown", handleFirstTab);

/* -----------------------------------------
  Toggle menu
 ---------------------------------------- */
const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".primary-navigation");
const introcontent = document.querySelector(".intro-content");
const logo = document.querySelector(".logo");

menuToggle.addEventListener("click", () => {
  const isOpened = menuToggle.getAttribute("aria-expanded") === "true";
  isOpened ? closeMenu() : openMenu();
});

function openMenu() {
  menuToggle.setAttribute("aria-expanded", "true");
  siteNavigation.setAttribute("data-state", "opened");

  siteNavigation.addEventListener(
    "animationend",
    () => {
      siteNavigation.setAttribute("data-state", "open");
    },
    { once: true }
  );

  logo.style.display = "none";
  introcontent.style.display = "none";
  siteNavigation.style.display = "block";
  updateLogoDisplay(); // Update logo display based on screen width
}
function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  siteNavigation.setAttribute("data-state", "closing");

  siteNavigation.addEventListener(
    "animationend",
    () => {
      siteNavigation.setAttribute("data-state", "closed");
      siteNavigation.style.display = "none"; // Hide navigation after animation ends
    },
    { once: true }
  );

  introcontent.style.display = "block";
  updateLogoDisplay(); // Update logo display based on screen width
}

function updateLogoDisplay() {
  if (window.innerWidth < 600) {
    logo.style.display = "none";
    siteNavigation.style.display = "block"; // Always hide navigation on small screens
  } else {
    logo.style.display = "block";

    // Only display the navigation if its state is "opened"
    if (siteNavigation.getAttribute("data-state") === "opened") {
      siteNavigation.style.display = "block";
    } else {
      siteNavigation.style.display = "none";
    }
  }
}
// Call updateLogoDisplay on window resize
window.addEventListener("resize", updateLogoDisplay);

// Initial call to set the correct display state on page load
updateLogoDisplay();

/* -----------------------------------------
  Handle submenu
 ---------------------------------------- */
const btn = document.querySelector(".dropdown-btn");
const ul = document.querySelector(".sub-menu");

btn.addEventListener("click", () => {
  const isSubMenuVisible = ul.style.display === "block";
  isSubMenuVisible ? hideSubMenu() : showSubMenu();
});

function showSubMenu() {
  ul.style.display = "block"; // Show submenu
  refreshSubMenu(); // Refresh the submenu
}

function hideSubMenu() {
  ul.style.display = "none"; // Hide submenu
}

function refreshSubMenu() {
  ul.style.display = "none"; // Temporarily hide the submenu
  void ul.offsetHeight; // Trigger a reflow
  ul.style.display = "block"; // Show the submenu again
}
