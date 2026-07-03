const INTRO1_MENU_HANDLER_FLAG = "intro1MenuHandlerAttached";
const OPEN_MENU_BOUND_FLAG = "intro1MenuBound";
const TOUCH_CLICK_DEDUP_MS = 500;

let lastTouchActivateAt = 0;

function getIntro1MenuElements() {
  const openMenu = document.querySelector(".open-menu");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelector(".nav-links");
  return { openMenu, navMenu, navLinks };
}

function animateOpenMenuBars(openMenu, opening) {
  if (!openMenu) return;

  const topBar = openMenu.querySelector(".bar-top");
  const middleBar = openMenu.querySelector(".bar-middle");
  const bottomBar = openMenu.querySelector(".bar-bottom");
  if (!topBar || !middleBar || !bottomBar) return;

  const toggle = (element, removeClass, addClass) => {
    element.classList.remove(removeClass);
    element.classList.remove(addClass);
    void element.offsetWidth;
    element.classList.add(addClass);
  };

  if (opening) {
    toggle(topBar, "animate-out-top-bar", "animate-top-bar");
    toggle(middleBar, "animate-out-middle-bar", "animate-middle-bar");
    toggle(bottomBar, "animate-out-bottom-bar", "animate-bottom-bar");
  } else {
    toggle(topBar, "animate-top-bar", "animate-out-top-bar");
    toggle(middleBar, "animate-middle-bar", "animate-out-middle-bar");
    toggle(bottomBar, "animate-bottom-bar", "animate-out-bottom-bar");
  }
}

function syncIntro1MenuState(
  openMenu,
  navMenu,
  navLinks,
  isOpen,
  shouldAnimate,
) {
  openMenu.classList.toggle("open", isOpen);
  openMenu.setAttribute("aria-expanded", String(isOpen));
  openMenu.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );

  navMenu.classList.toggle("open", isOpen);
  navLinks.classList.toggle("open", isOpen);

  if (shouldAnimate) {
    animateOpenMenuBars(openMenu, isOpen);
  }
}

function closeIntro1Menu(shouldAnimate = true) {
  const { openMenu, navMenu, navLinks } = getIntro1MenuElements();
  if (!openMenu || !navMenu || !navLinks) {
    return;
  }

  if (!navLinks.classList.contains("open")) {
    return;
  }

  syncIntro1MenuState(openMenu, navMenu, navLinks, false, shouldAnimate);
}

function toggleIntro1Menu(shouldAnimate = true) {
  const { openMenu, navMenu, navLinks } = getIntro1MenuElements();
  if (!openMenu || !navMenu || !navLinks) {
    return;
  }

  const isOpen = navLinks.classList.contains("open");
  syncIntro1MenuState(openMenu, navMenu, navLinks, !isOpen, shouldAnimate);
}

function handleOpenMenuActivateEvent(event) {
  const now = Date.now();

  if (
    event &&
    event.type === "click" &&
    now - lastTouchActivateAt < TOUCH_CLICK_DEDUP_MS
  ) {
    return;
  }

  if (event && event.type === "touchend") {
    lastTouchActivateAt = now;
    event.preventDefault();
  }

  toggleIntro1Menu(true);
}

function initializeIntro1Menu() {
  const { openMenu, navMenu, navLinks } = getIntro1MenuElements();
  if (!openMenu || !navMenu || !navLinks) {
    return;
  }

  openMenu.setAttribute("role", "button");
  openMenu.setAttribute("tabindex", "0");
  openMenu.setAttribute("aria-controls", navMenu.id || "profile-nav");

  syncIntro1MenuState(openMenu, navMenu, navLinks, false, false);

  if (openMenu.dataset[OPEN_MENU_BOUND_FLAG] === "true") {
    return;
  }

  openMenu.addEventListener("touchend", (event) => {
    event.stopPropagation();
    handleOpenMenuActivateEvent(event);
  });

  openMenu.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleOpenMenuActivateEvent(event);
  });

  openMenu.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      toggleIntro1Menu(true);
    }
  });

  openMenu.dataset[OPEN_MENU_BOUND_FLAG] = "true";
}

if (!document.documentElement.dataset[INTRO1_MENU_HANDLER_FLAG]) {
  document.addEventListener("click", (event) => {
    if (event.target.closest(".nav-links a")) {
      closeIntro1Menu(true);
      return;
    }

    const clickedInsideMenu =
      !!event.target.closest(".open-menu") ||
      !!event.target.closest(".nav-menu");

    if (!clickedInsideMenu) {
      closeIntro1Menu(true);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeIntro1Menu(true);
    }
  });

  document.documentElement.dataset[INTRO1_MENU_HANDLER_FLAG] = "true";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeIntro1Menu, {
    once: true,
  });
} else {
  initializeIntro1Menu();
}

document.addEventListener("page:transitioned", initializeIntro1Menu);
