const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".primary-navigation");
const introContents = document.querySelector(".intro-content");
const logo = document.querySelector(".logo");

menuToggle.addEventListener("click", () => {
  const isOpened = menuToggle.getAttribute("aria-expanded") === "true";
  isOpened ? closeMenu() : openMenu();
});

function openMenu() {
  menuToggle.setAttribute("aria-expanded", "true");
  siteNavigation.setAttribute("data-state", "opened");
  siteNavigation.style.display = "block"; // Show navigation
  introContents.style.display = "none"; // Hide main content
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  siteNavigation.setAttribute("data-state", "closing");

  // Ensure main is displayed and set background properties
  introContents.style.display = "block"; // Show main content

  siteNavigation.style.display = "none"; // Temporarily hide navigation to force reflow
  void siteNavigation.offsetHeight; // Trigger a reflow
  siteNavigation.style.display = "none"; // Show navigation again
  logo.style.display = "block"; //  logo

  siteNavigation.addEventListener(
    "animationend",
    () => {
      siteNavigation.setAttribute("data-state", "closed");
    },
    { once: true }
  );
}
