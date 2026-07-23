const menu = document.querySelector(".bars");
const navlinks = document.querySelector(".nav-links");
const pageTitle = document.querySelector(".intro-1-page-title");
const mobileQuery = window.matchMedia("(max-width: 768px)");
const firstNavLink = navlinks ? navlinks.querySelector("a[href]") : null;

let isMenuOpen = false;

function setPageTitleVisibility(isVisible) {
  if (!pageTitle) {
    return;
  }

  pageTitle.hidden = !isVisible;
  pageTitle.setAttribute("aria-hidden", isVisible ? "false" : "true");
}

function setMenuState(isOpen, options = {}) {
  const { moveFocus = false, returnFocus = false } = options;
  isMenuOpen = isOpen;

  if (!mobileQuery.matches) {
    navlinks.classList.remove("open");
    menu.classList.remove("is-active");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation menu");
    navlinks.hidden = false;
    navlinks.removeAttribute("aria-hidden");
    if ("inert" in navlinks) {
      navlinks.inert = false;
    }
    setPageTitleVisibility(true);
    return;
  }

  navlinks.classList.toggle("open", isMenuOpen);
  menu.classList.toggle("is-active", isMenuOpen);
  menu.setAttribute("aria-expanded", isMenuOpen ? "true" : "false");
  menu.setAttribute(
    "aria-label",
    isMenuOpen ? "Close navigation menu" : "Open navigation menu",
  );
  navlinks.hidden = !isMenuOpen;
  navlinks.setAttribute("aria-hidden", isMenuOpen ? "false" : "true");
  if ("inert" in navlinks) {
    navlinks.inert = !isMenuOpen;
  }
  setPageTitleVisibility(!isMenuOpen);

  if (isMenuOpen && moveFocus && firstNavLink) {
    firstNavLink.focus();
  }

  if (!isMenuOpen && returnFocus) {
    menu.focus();
  }
}

function toggleMenu() {
  if (!mobileQuery.matches) {
    return;
  }

  setMenuState(!isMenuOpen, {
    moveFocus: true,
    returnFocus: true,
  });
}

function handleViewportChange() {
  setMenuState(false);
}

function handleNavLinkClick(event) {
  const link = event.target.closest("a[href]");
  if (!link) {
    return;
  }

  setPageTitleVisibility(false);

  if (mobileQuery.matches) {
    setMenuState(false);
  }
}

function handleDocumentKeydown(event) {
  if (event.key !== "Escape" || !mobileQuery.matches || !isMenuOpen) {
    return;
  }

  event.preventDefault();
  setMenuState(false, { returnFocus: true });
}

function handleNavFocusIn() {
  setPageTitleVisibility(false);
}

function handleNavFocusOut(event) {
  const nextFocusedElement = event.relatedTarget;
  const focusStaysInNav =
    !!nextFocusedElement &&
    (navlinks.contains(nextFocusedElement) ||
      menu.contains(nextFocusedElement));

  if (!focusStaysInNav) {
    setPageTitleVisibility(true);
  }
}

if (menu && navlinks) {
  menu.addEventListener("click", toggleMenu);
  navlinks.addEventListener("click", handleNavLinkClick);
  navlinks.addEventListener("focusin", handleNavFocusIn);
  navlinks.addEventListener("focusout", handleNavFocusOut);
  menu.addEventListener("focusin", handleNavFocusIn);
  menu.addEventListener("focusout", handleNavFocusOut);
  document.addEventListener("keydown", handleDocumentKeydown);

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else {
    mobileQuery.addListener(handleViewportChange);
  }

  handleViewportChange();
}
