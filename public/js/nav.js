const OVERLAY_NAV_HTML = `<div class="overlay-navigation" id="site-nav-links">
<nav role="navigation" aria-label="Primary overlay navigation">
<ul>
<li aria-hidden="true" role="presentation"></li>
<li><a href="index.html" data-content="start over">home</a></li>
<li aria-hidden="true" role="presentation"></li>
<li><a href="intro-1.html" data-content="hmmmmm">about me</a></li>
<li aria-hidden="true" role="presentation"></li>
</ul>
</nav>
</div>`;
const OVERLAY_OPEN_CLASSES = [
  "slide-in-nav-item",
  "slide-in-nav-item-delay-1",
  "slide-in-nav-item-delay-2",
  "slide-in-nav-item-delay-3",
  "slide-in-nav-item-delay-4",
];
const OVERLAY_CLOSE_CLASSES = [
  "slide-in-nav-item-reverse",
  "slide-in-nav-item-delay-1-reverse",
  "slide-in-nav-item-delay-2-reverse",
  "slide-in-nav-item-delay-3-reverse",
  "slide-in-nav-item-delay-4-reverse",
];
const OVERLAY_CLOSE_DELAY_MS = 1000;
const OVERLAY_CLOSE_FALLBACK_MS = 1100;
const HERO_TEXT_EASE_NAV = "cubic-bezier(0.12, 0.8, 0.2, 1)";
const HERO_REVEAL_DURATION_NAV = 1.8;
const HERO_REVEAL_DELAY_NAV = 0.18;
const HERO_SUBTEXT_PRIMARY_DELAY = 0.88;
const HERO_SUBTEXT_SECONDARY_DELAY = 1.6;
const HERO_PUNCTUATION_DELAY = 2.35;
const HERO_ANIMATION_TARGETS = [
  ".text-with-animation span",
  ".text-with-animation-1 span",
  ".text-with-animation-2 span",
  ".text-with-animation-3",
];
const TEXT_SPAN_SELECTOR = ".text-with-animation span";
const SUBTEXT_PRIMARY_SPAN_SELECTOR = ".text-with-animation-1 span";
const SUBTEXT_SECONDARY_SPAN_SELECTOR = ".text-with-animation-2 span";
const PUNCTUATION_SELECTOR = ".text-with-animation-3";
const OPEN_OVERLAY_SELECTOR = ".open-overlay";
const OVERLAY_FIRST_LINK_SELECTOR = ".overlay-navigation a[href]";
const OVERLAY_FOCUSABLE_SELECTOR =
  ".overlay-navigation a[href], .overlay-navigation button:not([disabled]), .overlay-navigation [tabindex]:not([tabindex='-1'])";
let replayTextAnimationsTimeoutId = null;
let overlayTriggerElement = null;

function isIndexPage() {
  return document.body?.dataset?.page === "index";
}

function getGsap() {
  return typeof window !== "undefined" ? window.gsap : null;
}

function hasElements(selector) {
  return !!document.querySelector(selector);
}

function hasHeroTargets() {
  return HERO_ANIMATION_TARGETS.some(hasElements);
}

function getExistingHeroTargets() {
  return HERO_ANIMATION_TARGETS.filter(hasElements);
}

function replayTextAnimations() {
  const gsapLib = getGsap();
  if (!gsapLib) return;

  const existingTargets = getExistingHeroTargets();
  if (existingTargets.length === 0) return;

  gsapLib.killTweensOf(existingTargets.join(", "));

  if (hasElements(TEXT_SPAN_SELECTOR)) {
    gsapLib.to(TEXT_SPAN_SELECTOR, {
      x: 0,
      opacity: 1,
      duration: HERO_REVEAL_DURATION_NAV,
      ease: HERO_TEXT_EASE_NAV,
      delay: HERO_REVEAL_DELAY_NAV,
      overwrite: "auto",
    });
  }

  if (hasElements(SUBTEXT_PRIMARY_SPAN_SELECTOR)) {
    gsapLib.to(SUBTEXT_PRIMARY_SPAN_SELECTOR, {
      x: 0,
      opacity: 1,
      duration: HERO_REVEAL_DURATION_NAV,
      ease: HERO_TEXT_EASE_NAV,
      delay: HERO_SUBTEXT_PRIMARY_DELAY,
      overwrite: "auto",
    });
  }

  if (hasElements(SUBTEXT_SECONDARY_SPAN_SELECTOR)) {
    gsapLib.to(SUBTEXT_SECONDARY_SPAN_SELECTOR, {
      x: 0,
      opacity: 1,
      duration: HERO_REVEAL_DURATION_NAV,
      ease: HERO_TEXT_EASE_NAV,
      delay: HERO_SUBTEXT_SECONDARY_DELAY,
      overwrite: "auto",
    });
  }

  if (hasElements(PUNCTUATION_SELECTOR)) {
    gsapLib.to(PUNCTUATION_SELECTOR, {
      y: 0,
      opacity: 1,
      duration: HERO_REVEAL_DURATION_NAV,
      ease: HERO_TEXT_EASE_NAV,
      delay: HERO_PUNCTUATION_DELAY,
      overwrite: "auto",
    });
  }
}

function hideTextAnimations() {
  if (!hasHeroTargets()) {
    return;
  }

  HERO_ANIMATION_TARGETS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.style.animation = "none";
      element.style.opacity = "0";
    });
  });

  const gsapLib = getGsap();
  if (!gsapLib) return;

  const existingTargets = getExistingHeroTargets();
  if (existingTargets.length === 0) return;

  gsapLib.killTweensOf(existingTargets.join(", "));

  if (hasElements(TEXT_SPAN_SELECTOR)) {
    gsapLib.set(TEXT_SPAN_SELECTOR, { x: "-22vw", y: 0, opacity: 0 });
  }

  if (hasElements(SUBTEXT_PRIMARY_SPAN_SELECTOR)) {
    gsapLib.set(SUBTEXT_PRIMARY_SPAN_SELECTOR, { x: "18vw", y: 0, opacity: 0 });
  }

  if (hasElements(SUBTEXT_SECONDARY_SPAN_SELECTOR)) {
    gsapLib.set(SUBTEXT_SECONDARY_SPAN_SELECTOR, {
      x: "-18vw",
      y: 0,
      opacity: 0,
    });
  }

  if (hasElements(PUNCTUATION_SELECTOR)) {
    gsapLib.set(PUNCTUATION_SELECTOR, { x: 0, y: "-24svh", opacity: 0 });
  }
}

function replayTextAnimationsAfterTransitions() {
  if (!hasHeroTargets()) {
    return;
  }

  clearTimeout(replayTextAnimationsTimeoutId);
  replayTextAnimationsTimeoutId = setTimeout(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        replayTextAnimations();
      });
    });
  }, 0);
}

function isOverlayOpen() {
  return document
    .querySelector(".overlay-navigation")
    ?.classList.contains("overlay-active");
}

function animateHamburgerButton(opening) {
  const topBar = document.querySelector(".bar-top");
  const middleBar = document.querySelector(".bar-middle");
  const bottomBar = document.querySelector(".bar-bottom");
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

function addOverlayOpenClasses(overlayNavigation) {
  overlayNavigation.querySelectorAll("nav li").forEach((item, index) => {
    if (index < OVERLAY_OPEN_CLASSES.length) {
      item.classList.add(OVERLAY_OPEN_CLASSES[index]);
    }
  });
}

function addOverlayCloseClasses(overlayNavigation) {
  const navItems = [...overlayNavigation.querySelectorAll("nav li")];
  const lastIndex = Math.min(navItems.length, OVERLAY_CLOSE_CLASSES.length) - 1;

  navItems.forEach((item, index) => {
    if (index >= OVERLAY_CLOSE_CLASSES.length) return;
    item.classList.remove(OVERLAY_OPEN_CLASSES[index]);
    item.classList.add(OVERLAY_CLOSE_CLASSES[lastIndex - index]);
  });
}

function openOverlayNavigation() {
  if (!isIndexPage()) return;
  if (isOverlayOpen()) return;

  document.querySelectorAll(".overlay-navigation").forEach((overlay) => {
    overlay.remove();
  });

  const openOverlay = document.querySelector(OPEN_OVERLAY_SELECTOR);

  overlayTriggerElement =
    openOverlay instanceof HTMLElement
      ? openOverlay
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

  const overlayHost = document.querySelector(".wrapper") || document.body;
  overlayHost.insertAdjacentHTML("afterbegin", OVERLAY_NAV_HTML);
  const overlayNavigation = document.querySelector(".overlay-navigation");
  if (!overlayNavigation) return;

  overlayNavigation.classList.add("overlay-active");
  overlayNavigation.style.pointerEvents = "auto";
  overlayNavigation.removeAttribute("aria-hidden");
  if ("inert" in overlayNavigation) {
    overlayNavigation.inert = false;
  }
  overlayNavigation.getBoundingClientRect();
  overlayNavigation.classList.add("overlay-slide-down");

  if (openOverlay) {
    openOverlay.setAttribute("aria-label", "Close navigation menu");
    openOverlay.setAttribute("aria-expanded", "true");
  }

  animateHamburgerButton(true);
  addOverlayOpenClasses(overlayNavigation);

  const firstOverlayLink = overlayNavigation.querySelector(
    OVERLAY_FIRST_LINK_SELECTOR,
  );
  if (firstOverlayLink instanceof HTMLElement) {
    requestAnimationFrame(() => {
      focusFirstOverlayItem();
    });
  }
}

function getOverlayFocusableItems() {
  const overlayNavigation = document.querySelector(".overlay-navigation");
  if (!(overlayNavigation instanceof HTMLElement)) {
    return [];
  }

  return [
    ...overlayNavigation.querySelectorAll(OVERLAY_FOCUSABLE_SELECTOR),
  ].filter((element) => {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    return !element.hasAttribute("disabled") && !element.closest("[hidden]");
  });
}

function focusFirstOverlayItem() {
  const [firstItem] = getOverlayFocusableItems();
  if (firstItem instanceof HTMLElement) {
    firstItem.focus();
  }
}

function trapOverlayFocus(event) {
  if (!isOverlayOpen() || event.key !== "Tab") {
    return;
  }

  const focusableItems = getOverlayFocusableItems();
  if (focusableItems.length === 0) {
    event.preventDefault();
    return;
  }

  const firstItem = focusableItems[0];
  const lastItem = focusableItems[focusableItems.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && activeElement === firstItem) {
    event.preventDefault();
    lastItem.focus();
    return;
  }

  if (!event.shiftKey && activeElement === lastItem) {
    event.preventDefault();
    firstItem.focus();
  }
}

function restoreOverlayTriggerFocus() {
  if (overlayTriggerElement instanceof HTMLElement) {
    overlayTriggerElement.focus();
  } else {
    const openOverlay = document.querySelector(OPEN_OVERLAY_SELECTOR);
    if (openOverlay instanceof HTMLElement) {
      openOverlay.focus();
    }
  }

  overlayTriggerElement = null;
}

function closeOverlayNavigation(options = {}) {
  if (!isIndexPage()) return;
  const { returnFocus = false } = options;
  const overlayNavigation = document.querySelector(".overlay-navigation");
  if (!overlayNavigation) return;

  overlayNavigation.classList.remove("overlay-active");
  overlayNavigation.setAttribute("aria-hidden", "true");
  overlayNavigation.style.pointerEvents = "none";
  if ("inert" in overlayNavigation) {
    overlayNavigation.inert = true;
  }

  const openOverlay = document.querySelector(OPEN_OVERLAY_SELECTOR);
  if (openOverlay) {
    openOverlay.setAttribute("aria-label", "Open navigation menu");
    openOverlay.setAttribute("aria-expanded", "false");
  }

  if (returnFocus) {
    restoreOverlayTriggerFocus();
  }

  animateHamburgerButton(false);
  addOverlayCloseClasses(overlayNavigation);

  setTimeout(() => {
    overlayNavigation.classList.replace(
      "overlay-slide-down",
      "overlay-slide-up",
    );

    let isClosed = false;
    const finalizeClose = () => {
      if (isClosed) {
        return;
      }

      isClosed = true;
      overlayNavigation.remove();
    };

    overlayNavigation.addEventListener("transitionend", finalizeClose, {
      once: true,
    });

    setTimeout(finalizeClose, OVERLAY_CLOSE_FALLBACK_MS);
  }, OVERLAY_CLOSE_DELAY_MS);
}

let navDocumentEventsAttached = false;
let boundOverlayButton = null;

function handleOverlayToggle() {
  if (!isIndexPage()) return;
  if (isOverlayOpen()) {
    closeOverlayNavigation({ returnFocus: true });
  } else {
    openOverlayNavigation();
  }
}

function handleDocumentClick(event) {
  if (!isIndexPage()) {
    return;
  }

  const openOverlayButton = event.target.closest(OPEN_OVERLAY_SELECTOR);
  if (openOverlayButton) {
    event.preventDefault();
    handleOverlayToggle();
  }
}

function handleDocumentKeydown(event) {
  if (!isIndexPage()) {
    return;
  }

  if (isOverlayOpen() && event.key === "Tab") {
    trapOverlayFocus(event);
  }

  if (event.key === "Escape" && isOverlayOpen()) {
    event.preventDefault();
    closeOverlayNavigation({ returnFocus: true });
    return;
  }

  const openOverlayButton = event.target.closest(OPEN_OVERLAY_SELECTOR);
  if (!openOverlayButton) return;

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleOverlayToggle();
  }
}

function attachNavEventHandlers() {
  if (!isIndexPage()) {
    return;
  }

  const openOverlayButton = document.querySelector(OPEN_OVERLAY_SELECTOR);
  if (
    openOverlayButton instanceof HTMLElement &&
    boundOverlayButton !== openOverlayButton
  ) {
    boundOverlayButton = openOverlayButton;
    openOverlayButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleOverlayToggle();
    });
    openOverlayButton.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        handleOverlayToggle();
      }
    });
  }

  if (!navDocumentEventsAttached) {
    navDocumentEventsAttached = true;
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeydown);
  }
}

function initIntroNav() {
  if (!isIndexPage()) {
    return;
  }

  attachNavEventHandlers();
}

document.addEventListener("page:transitioned", () => {
  if (!isIndexPage()) {
    return;
  }

  hideTextAnimations();
  initIntroNav();
  replayTextAnimationsAfterTransitions();
});

document.addEventListener("DOMContentLoaded", () => {
  if (!isIndexPage()) {
    return;
  }

  hideTextAnimations();
  initIntroNav();
  replayTextAnimationsAfterTransitions();
});

document.addEventListener("theme:transition:start", () => {
  if (isIndexPage()) {
    hideTextAnimations();
  }
});

document.addEventListener("theme:transitioned", () => {
  if (isIndexPage()) {
    replayTextAnimationsAfterTransitions();
  }
});
