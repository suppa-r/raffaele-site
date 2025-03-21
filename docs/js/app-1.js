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
  logo.style.display = "block";
  logo.style.display = "flex";
  logo.style.justifyContent = "flex-start";
  introcontent.style.display = "block";
  siteNavigation.style.display = "block";
  logo.setAttribute.length.display = "none";
}
