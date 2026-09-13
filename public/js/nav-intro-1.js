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
  let boundMenuButton = null;
  let boundNavLinks = null;

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
    if (!navLinks) {
      return;
    }

    const navItems = navLinks.querySelectorAll(NAV_ITEM_SELECTOR);
    if (gsapLib) {
      gsapLib.killTweensOf(navItems);
      if (!mobileQuery.matches) {
        gsapLib.set(navItems, { clearProps: "opacity,transform" });
        return;
      }
      gsapLib.set(navItems, {
        opacity: 0,
        y: -24,
      });
    } else {
      navItems.forEach((item) => {
        item.style.opacity = mobileQuery.matches ? "0" : "";
        item.style.transform = mobileQuery.matches ? "translateY(-24px)" : "";
      });
    }
  }

  function animateNavItemsIn() {
    const gsapLib = getGsap();
    if (!navLinks || !mobileQuery.matches) {
      return;
    }

    const navItems = navLinks.querySelectorAll(NAV_ITEM_SELECTOR);
    if (!gsapLib || isReducedMotionPreferred()) {
      gsapLib?.killTweensOf(navItems);
      gsapLib?.set(navItems, { opacity: 1, y: 0 });
      return;
    }

    gsapLib.killTweensOf(navItems);
    gsapLib.fromTo(
      navItems,
      { opacity: 0, y: -24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
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
    refreshElements();
    if (!menuButton || !navLinks) {
      return;
    }

    const { isKeyboard = false } = options;
    isMenuOpen = Boolean(isOpen);

    navLinks.classList.toggle("open", isMenuOpen);
    navLinks.setAttribute("aria-hidden", isMenuOpen ? "false" : "true");
    if ("inert" in navLinks) {
      navLinks.inert = !isMenuOpen && mobileQuery.matches;
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
      if (isKeyboard && firstNavLink) {
        firstNavLink.focus({ preventScroll: true });
      }
    } else {
      resetNavItems();
      if (isKeyboard) {
        menuButton.focus({ preventScroll: true });
      }
    }
  }

  function handleToggleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    setMenuState(!isMenuOpen, { isKeyboard: false });
  }

  function handleToggleKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      setMenuState(!isMenuOpen, { isKeyboard: true });
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

    window.setTimeout(() => {
      setMenuState(false);
      setActiveNavLink();
    }, 0);
  }

  function handleDocumentKeydown(event) {
    if (event.key === "Escape" && isMenuOpen) {
      setMenuState(false, { isKeyboard: true });
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

    if (boundMenuButton !== menuButton) {
      boundMenuButton = menuButton;
      menuButton.addEventListener("click", handleToggleClick);
      menuButton.addEventListener("keydown", handleToggleKeydown);
    }

    if (boundNavLinks !== navLinks) {
      boundNavLinks = navLinks;
      navLinks.addEventListener("click", handleNavLinksClick);
    }

    resetNavItems();
    setActiveNavLink();
  }

  function init() {
    if (!isIntroOnePage()) {
      boundMenuButton = null;
      boundNavLinks = null;
      isMenuOpen = false;
      return;
    }
    attachEvents();
  }

  document.addEventListener("keydown", handleDocumentKeydown);
  window.addEventListener("hashchange", setActiveNavLink);

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else {
    mobileQuery.addListener(handleViewportChange);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("page:transitioned", init);
})();
