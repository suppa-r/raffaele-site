// Opens/closes the mobile nav menu on intro-1.html
(function () {
  if (window.__introOneNavBarLoaded) {
    return;
  }
  window.__introOneNavBarLoaded = true;

  const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
  const NAV_ITEM_SELECTOR = ".nav-item";
  const mobileQuery = window.matchMedia("(max-width: 768px)");

  let menuButton = null;
  let navLinks = null;
  let firstNavLink = null;
  let isMenuOpen = false;

  function isIntroOnePage() {
    return document.body?.dataset?.page === "intro-1";
  }

  function getGsap() {
    return typeof window !== "undefined" ? window.gsap : null;
  }

  function refreshElements() {
    menuButton = document.querySelector(".open-overlay");
    navLinks = document.querySelector(".nav-links");
    firstNavLink = navLinks ? navLinks.querySelector("a[href]") : null;
  }

  function setActiveNavLink() {
    if (!navLinks) {
      return;
    }

    const currentHash = window.location.hash;
    navLinks.querySelectorAll("a[href]").forEach((link) => {
      const isCurrent =
        currentHash !== "" && link.getAttribute("href") === currentHash;
      link.classList.toggle("is-current", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function isReducedMotionPreferred() {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  }

  function resetNavItems() {
    const gsapLib = getGsap();
    if (!gsapLib || !navLinks) {
      return;
    }

    const navItems = navLinks.querySelectorAll(NAV_ITEM_SELECTOR);
    if (!mobileQuery.matches) {
      gsapLib.set(navItems, { clearProps: "opacity,transform" });
      return;
    }

    gsapLib.set(navItems, {
      opacity: 0,
      y: -24,
    });
  }

  function animateNavItemsIn() {
    const gsapLib = getGsap();
    if (!navLinks || !mobileQuery.matches) {
      return;
    }

    const navItems = navLinks.querySelectorAll(NAV_ITEM_SELECTOR);
    if (!gsapLib || isReducedMotionPreferred()) {
      gsapLib?.set(navItems, { opacity: 1, y: 0 });
      return;
    }

    gsapLib.fromTo(
      navItems,
      { opacity: 0, y: -24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.16,
        overwrite: "auto",
      },
    );
  }

  function animateHamburgerButton(opening) {
    if (isReducedMotionPreferred() || !menuButton) {
      return;
    }

    const topBar = menuButton.querySelector(".bar-top");
    const middleBar = menuButton.querySelector(".bar-middle");
    const bottomBar = menuButton.querySelector(".bar-bottom");
    if (!topBar || !middleBar || !bottomBar) {
      return;
    }

    const toggle = (element, removeClass, addClass) => {
      element.classList.remove(removeClass, addClass);
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

  function setMenuState(isOpen, options = {}) {
    if (!menuButton || !navLinks) {
      refreshElements();
    }
    if (!menuButton || !navLinks) {
      return;
    }

    const { moveFocus = false, returnFocus = false } = options;
    isMenuOpen = isOpen;

    navLinks.classList.toggle("open", isMenuOpen);
    navLinks.setAttribute("aria-hidden", isMenuOpen ? "false" : "true");
    if ("inert" in navLinks) {
      navLinks.inert = !isMenuOpen;
    }

    menuButton.classList.toggle("is-active", isMenuOpen);
    menuButton.setAttribute("aria-expanded", isMenuOpen ? "true" : "false");
    menuButton.setAttribute(
      "aria-label",
      isMenuOpen ? "Close menu" : "Open menu",
    );

    document.documentElement.classList.toggle("intro-nav-open", isMenuOpen);
    animateHamburgerButton(isMenuOpen);

    if (isMenuOpen) {
      animateNavItemsIn();
    } else {
      resetNavItems();
    }

    if (isMenuOpen && moveFocus && firstNavLink) {
      firstNavLink.focus();
    }

    if (!isMenuOpen && returnFocus) {
      menuButton.focus();
    }
  }

  function handleToggleClick(event) {
    event.preventDefault();
    setMenuState(!isMenuOpen, { moveFocus: true, returnFocus: true });
  }

  function handleToggleKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setMenuState(!isMenuOpen, { moveFocus: true, returnFocus: true });
    }
  }

  function handleNavLinksClick(event) {
    if (!event.target.closest("a[href]")) {
      return;
    }

    if (!mobileQuery.matches) {
      window.setTimeout(setActiveNavLink, 0);
      return;
    }

    // Defer closing (which sets nav inert) until after the browser
    // follows the link's hash, otherwise the navigation gets cancelled.
    window.setTimeout(() => {
      setMenuState(false);
      setActiveNavLink();
    }, 0);
  }

  function handleDocumentKeydown(event) {
    if (event.key === "Escape" && isMenuOpen) {
      setMenuState(false, { returnFocus: true });
    }
  }

  function handleViewportChange() {
    if (!mobileQuery.matches) {
      isMenuOpen = false;
      navLinks?.classList.remove("open");
      navLinks?.setAttribute("aria-hidden", "false");
      if (navLinks && "inert" in navLinks) {
        navLinks.inert = false;
      }
      document.documentElement.classList.remove("intro-nav-open");
    }

    resetNavItems();
  }

  function attachEvents() {
    refreshElements();
    if (!menuButton || !navLinks) {
      return;
    }

    resetNavItems();
    setActiveNavLink();

    menuButton.addEventListener("click", handleToggleClick);
    menuButton.addEventListener("keydown", handleToggleKeydown);
    navLinks.addEventListener("click", handleNavLinksClick);
    document.addEventListener("keydown", handleDocumentKeydown);
    window.addEventListener("hashchange", setActiveNavLink);

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", handleViewportChange);
    } else {
      mobileQuery.addListener(handleViewportChange);
    }
  }

  function init() {
    if (!isIntroOnePage()) {
      return;
    }
    attachEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
