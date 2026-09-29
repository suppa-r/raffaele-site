// Opens/closes the mobile nav menu on intro-1.html
(function () {
  if (window.__introOneNavBarLoaded) {
    return;
  }
  window.__introOneNavBarLoaded = true;

  const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
  const NAV_ITEM_SELECTOR = ".nav-item";
  const mobileQuery = window.matchMedia("(max-width: 47.999rem)");

  let menuButton = null;
  let navLinks = null;
  let firstNavLink = null;
  let isMenuOpen = false;
  let boundMenuButton = null;
  let boundNavLinks = null;
  let navCloseTimeoutId = null;
  const NAV_CLOSE_DURATION_MS = 520;

  function isIntroOnePage() {
    return document.body?.dataset?.page === "intro-1";
  }

  function getGsap() {
    return typeof window !== "undefined" ? window.gsap : null;
  }

  function refreshElements() {
    menuButton = document.querySelector(".intro-1-page-title-trigger");
    navLinks = document.querySelector(".nav-links");
    firstNavLink = navLinks ? navLinks.querySelector("a[href]") : null;
  }

  function setActiveNavLink() {
    if (!navLinks) {
      return;
    }

    const currentHash = window.location.hash;
    const links = [...navLinks.querySelectorAll("a[href]")];
    const hasActiveSection = links.some(
      (link) => link.getAttribute("href") === currentHash,
    );

    document.documentElement.classList.toggle(
      "intro-section-active",
      hasActiveSection,
    );

    links.forEach((link) => {
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

  function updateSectionOverflowCue(container) {
    const hasMoreContent =
      container.scrollHeight > container.clientHeight + 1;
    const atBottom =
      container.scrollTop + container.clientHeight >= container.scrollHeight - 1;

    container.classList.toggle("has-more-content", hasMoreContent);
    container.classList.toggle("at-bottom", !hasMoreContent || atBottom);
  }

  function attachSectionOverflowCues() {
    document
      .querySelectorAll(".section-container, .section-container-early")
      .forEach((container) => {
        if (container.dataset.overflowCueBound === "true") {
          updateSectionOverflowCue(container);
          return;
        }

        container.addEventListener(
          "scroll",
          () => updateSectionOverflowCue(container),
          { passive: true },
        );
        container.dataset.overflowCueBound = "true";
        updateSectionOverflowCue(container);
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
        duration: 0.95,
        ease: "power2.out",
        stagger: 0.16,
        overwrite: "auto",
      },
    );
  }

  function setMenuState(isOpen, options = {}) {
    refreshElements();
    if (!menuButton || !navLinks) {
      return;
    }

    const { isKeyboard = false, returnFocus = true } = options;
    clearTimeout(navCloseTimeoutId);
    isMenuOpen = Boolean(isOpen);
    const navHasFocus = navLinks.contains(document.activeElement);
    const focusTarget = isMenuOpen
      ? null
      : returnFocus && (isKeyboard || navHasFocus)
        ? menuButton
        : !returnFocus && navHasFocus
          ? document.getElementById("main-content")
          : null;

    focusTarget?.focus({ preventScroll: true });

    navLinks.classList.toggle("open", isMenuOpen);
    navLinks.setAttribute("aria-hidden", isMenuOpen ? "false" : "true");
    if ("inert" in navLinks) {
      navLinks.inert = !isMenuOpen;
    }

    menuButton.setAttribute("aria-expanded", isMenuOpen ? "true" : "false");

    document.documentElement.classList.toggle("intro-nav-open", isMenuOpen);

    if (isMenuOpen) {
      animateNavItemsIn();
      if (firstNavLink) {
        firstNavLink.focus({ preventScroll: true });
      }
    } else {
      resetNavItems();
    }
  }

  function handleToggleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    setMenuState(!isMenuOpen);
  }

  function handleNavLinksClick(event) {
    const link = event.target.closest("a[href]");
    if (!link) {
      return;
    }

    if (!mobileQuery.matches) {
      const destination = link.getAttribute("href");
      if (destination?.startsWith("#")) {
        setMenuState(false, { returnFocus: false });
        window.setTimeout(setActiveNavLink, 0);
        return;
      }

      event.preventDefault();
      document.documentElement.classList.add("intro-nav-closing");
      window.location.assign(link.href);
      return;
    }

    event.preventDefault();
    navLinks.classList.add("closing");
    document.documentElement.classList.add("intro-nav-closing");
    setMenuState(false, { returnFocus: false });

    navCloseTimeoutId = window.setTimeout(() => {
      navLinks.classList.remove("closing");
      const destination = link.getAttribute("href");
      if (destination?.startsWith("#")) {
        window.location.hash = destination;
        window.scrollTo(0, 0);
        setActiveNavLink();
        document.documentElement.classList.remove("intro-nav-closing");
        document.getElementById("main-content")?.focus({ preventScroll: true });
      } else {
        document.documentElement.classList.remove("intro-nav-closing");
        window.location.assign(link.href);
      }
    }, NAV_CLOSE_DURATION_MS);
  }

  function handleDocumentKeydown(event) {
    if (event.key === "Escape" && isMenuOpen) {
      setMenuState(false, { isKeyboard: true });
    }
  }

  function handleViewportChange() {
    if (!menuButton || !navLinks) {
      return;
    }
    setMenuState(false, {
      returnFocus: navLinks.contains(document.activeElement),
    });
    navLinks.classList.remove("closing");
  }

  function attachEvents() {
    refreshElements();
    if (!menuButton || !navLinks) {
      return;
    }
    menuButton.setAttribute("aria-expanded", "false");
    navLinks.setAttribute("aria-hidden", "true");
    if ("inert" in navLinks) {
      navLinks.inert = true;
    }

    if (boundMenuButton !== menuButton) {
      boundMenuButton = menuButton;
      menuButton.addEventListener("click", handleToggleClick);
    }

    if (boundNavLinks !== navLinks) {
      boundNavLinks = navLinks;
      navLinks.addEventListener("click", handleNavLinksClick);
    }

    resetNavItems();
    setActiveNavLink();
    attachSectionOverflowCues();
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
  window.addEventListener("resize", attachSectionOverflowCues);

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
