const MENU_HANDLER_FLAG = "menuBtnHandlerAttached";
const TOUCH_CLICK_DEDUP_MS = 450;

let lastTouchToggleAt = 0;

const getMenuElements = () => {
  const menuBtn = document.querySelector(".menu-btn");
  const navList = document.querySelector(".nav-links");
  return { menuBtn, navList };
};

const syncMenuState = (menuBtn, navList, isOpen) => {
  menuBtn.classList.toggle("open", isOpen);
  navList.classList.toggle("open", isOpen);
  menuBtn.setAttribute("aria-expanded", String(isOpen));
};

const closeMenu = () => {
  const { menuBtn, navList } = getMenuElements();
  if (!menuBtn || !navList) {
    return;
  }

  syncMenuState(menuBtn, navList, false);
};

const toggleMenu = (menuBtn) => {
  const navList = document.querySelector(".nav-links");
  if (!navList) {
    return;
  }

  const isOpen = menuBtn.classList.contains("open");
  syncMenuState(menuBtn, navList, !isOpen);
};

const handleMenuInteraction = (event) => {
  const clickedMenuBtn = event.target.closest(".menu-btn");
  if (!clickedMenuBtn) {
    return false;
  }

  const now = Date.now();
  const isTouchInteraction =
    event.type === "touchend" ||
    (event.type === "pointerup" && event.pointerType !== "mouse");

  // Ignore the synthetic click that often follows touch/pointer interactions.
  if (
    event.type === "click" &&
    now - lastTouchToggleAt < TOUCH_CLICK_DEDUP_MS
  ) {
    return true;
  }

  if (isTouchInteraction) {
    lastTouchToggleAt = now;
    event.preventDefault();
  }

  toggleMenu(clickedMenuBtn);
  return true;
};

const initializeMenu = () => {
  const { menuBtn, navList } = getMenuElements();
  if (!menuBtn || !navList) {
    return;
  }

  // Always start closed on load/revisit.
  syncMenuState(menuBtn, navList, false);
};

if (!document.documentElement.dataset[MENU_HANDLER_FLAG]) {
  document.addEventListener("touchend", (event) => {
    handleMenuInteraction(event);
  });

  document.addEventListener("pointerup", (event) => {
    if (event.button !== 0) {
      return;
    }

    handleMenuInteraction(event);
  });

  document.addEventListener("click", (event) => {
    if (handleMenuInteraction(event)) {
      return;
    }

    const clickedInsideNav = event.target.closest(".nav-menu");

    if (!clickedInsideNav) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.documentElement.dataset[MENU_HANDLER_FLAG] = "true";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeMenu, { once: true });
} else {
  initializeMenu();
}

document.addEventListener("page:transitioned", initializeMenu);
