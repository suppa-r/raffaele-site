const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".primary-navigation");
const introContents = document.querySelector(".intro-content");
const star = document.querySelector("header .star");
const headertext = document.querySelector("header .header-text");
const beaucoup = document.querySelector(".intro-content .beaucoup"); // Declare .beaucoup

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

  introContents.style.display = "none"; // Hide intro content
  siteNavigation.style.display = "block"; // Show navigation
  star.style.display = "none"; // Hide star
  headertext.style.display = "none"; // Hide header text
  beaucoup.style.display = "block"; // Show .beaucoup
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  siteNavigation.setAttribute("data-state", "closing");

  siteNavigation.addEventListener(
    "animationend",
    () => {
      siteNavigation.setAttribute("data-state", "closed");
    },
    { once: true }
  );

  siteNavigation.style.display = "none"; // Hide navigation
  introContents.style.display = "block"; // Show intro content
  star.style.display = "block"; // Show star
  headertext.style.display = "block"; // Show header text
  beaucoup.style.display = "block"; // Hide .beaucoup
}
