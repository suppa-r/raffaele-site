const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".primary-navigation");
const introcontent = document.querySelector(".intro-content");

menuToggle.addEventListener("click", () => {
  const isOpened = menuToggle.getAttribute("aria-expanded") === "true";
  isOpened ? closeMenu() : openMenu();
});

function openMenu() {
  menuToggle.setAttribute("aria-expanded", "true");
  siteNavigation.setAttribute("data-state", "opened");
  introcontent.setAttribute("data-state", "hidden");
  introcontent.style.display = "none";
}
function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  siteNavigation.setAttribute("data-state", "closing");
  introcontent.setAttribute("data-state", "visible");
  introcontent.style.display = "block";

  siteNavigation.addEventListener(
    "animationend",
    () => {
      siteNavigation.setAttribute("data-state", "closed");
    },
    { once: true }
  );
}
