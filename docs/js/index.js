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

  // Ensure main content and logo are displayed correctly
  introcontent.style.display = "block";
  siteNavigation.style.display = "block";
  logo.style.display = "block";
  logo.style.display = "flex";

  // Only show the logo if the screen width is greater than 500px
  if (window.innerWidth < 501) {
    logo.style.display = "none";
    siteNavigation.style.display = "block";
    //logo.style.display = "flex";
    //logo.style.justifyContent = "flex-start";
  } else {
    siteNavigation.style.display = "block";
    logo.style.display = "block";
    logo.style.display = "flex";
    logo.style.justifyContent = "flex-end";
  }
}

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
