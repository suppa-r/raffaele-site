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

// Function to update visibility based on screen width
function updateVisibility() {
  if (window.matchMedia("(max-width: 700px)").matches) {
    // If screen width is 700px or less
    siteNavigation.style.display = "block"; // Hide navigation
    introContents.style.display = "none"; // Show intro content
    star.style.display = "none"; // Show star
    headertext.style.display = "none"; // Show header text
    beaucoup.style.display = "block"; // Show .beaucoup
  } else {
    // If screen width is greater than 700px
    siteNavigation.style.display = "none"; // Hide navigation
    introContents.style.display = "block"; // Show intro content
    star.style.display = "block"; // Show star
    headertext.style.display = "block"; // Show header text
    beaucoup.style.display = "block"; // Hide .beaucoup
  }
}
// Initial call to set visibility based on current screen width
updateVisibility();

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

    // Add event listener for window resize
    window.addEventListener("resize", updateVisibility);
  }
}
