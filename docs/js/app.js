const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".primary-navigation");
const introContents = document.querySelector(".intro-content");
const logo = document.querySelector(".logo");
const headertext = document.querySelector(".header-text");

menuToggle.addEventListener("click", () => {
  const isOpened = menuToggle.getAttribute("aria-expanded") === "true";
  isOpened ? closeMenu() : openMenu();
});

function openMenu() {
  menuToggle.setAttribute("aria-expanded", "true");
  siteNavigation.setAttribute("data-state", "opened");
  siteNavigation.style.display = "block"; // Show navigation
  introContents.style.display = "none"; // Hide main content
  logo.style.display = "none"; // Hide logo
  headertext.style.display = "none"; // Hide header text
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  siteNavigation.setAttribute("data-state", "closing");

  // Temporarily hide navigation to force reflow
  siteNavigation.style.display = "none";
  void siteNavigation.offsetHeight; // Trigger a reflow

  // Ensure main is displayed and set background properties
  introContents.style.display = "block"; // Show main content
  logo.style.display = "block"; // Show logo
  headertext.style.display = "block"; // Show header text
  siteNavigation.style.display = "block";

  siteNavigation.addEventListener(
    "animationend",
    () => {
      siteNavigation.setAttribute("data-state", "closed");
      siteNavigation.style.display = "none"; // Hide navigation after animation ends
    },
    { once: true }
  );
}
