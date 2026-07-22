const menu = document.querySelector(".bars");
const navlinks = document.querySelector(".nav-links");
const mobileQuery = window.matchMedia("(max-width: 768px)");

let isMenuOpen = false;

function setMenuState(isOpen) {
  isMenuOpen = isOpen;

  if (!mobileQuery.matches) {
    navlinks.classList.remove("open");
    menu.classList.remove("is-active");
    menu.setAttribute("aria-expanded", "false");
    return;
  }

  navlinks.classList.toggle("open", isMenuOpen);
  menu.classList.toggle("is-active", isMenuOpen);
  menu.setAttribute("aria-expanded", isMenuOpen ? "true" : "false");
}

function toggleMenu() {
  if (!mobileQuery.matches) {
    return;
  }

  setMenuState(!isMenuOpen);
}

function handleViewportChange() {
  setMenuState(false);
}

function handleNavLinkClick(event) {
  const link = event.target.closest("a[href]");
  if (!link || !mobileQuery.matches) {
    return;
  }

  setMenuState(false);
}

if (menu && navlinks) {
  menu.addEventListener("click", toggleMenu);
  navlinks.addEventListener("click", handleNavLinkClick);

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else {
    mobileQuery.addListener(handleViewportChange);
  }

  handleViewportChange();
}
