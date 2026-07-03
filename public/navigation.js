const MENU_HANDLER_FLAG = "menuBtnHandlerAttached";

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

const initializeMenu = () => {
  const { menuBtn, navList } = getMenuElements();
  if (!menuBtn || !navList) {
    return;
  }

  // Always start closed on load/revisit.
  syncMenuState(menuBtn, navList, false);
};

if (!document.documentElement.dataset[MENU_HANDLER_FLAG]) {
  document.addEventListener("click", (event) => {
    const clickedMenuBtn = event.target.closest(".menu-btn");
    const clickedInsideNav = event.target.closest(".nav-menu");

    if (clickedMenuBtn) {
      const navList = document.querySelector(".nav-links");
      if (!navList) {
        return;
      }

      const isOpen = clickedMenuBtn.classList.contains("open");
      syncMenuState(clickedMenuBtn, navList, !isOpen);
      return;
    }

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
