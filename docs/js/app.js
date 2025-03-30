const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".primary-navigation");
const introcontent = document.querySelector(".intro-content");
const star = document.querySelector("header .star");
const headertext = document.querySelector("header .header-text");

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
  introcontent.style.display = "none";
  siteNavigation.style.display = "block";
  star.style.display = "none";
  headertext.style.display = "none";
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
  introcontent.style.display = "block";
  siteNavigation.style.display = "block";
  star.style.display = "block";
  headertext.style.display = "block";
}
