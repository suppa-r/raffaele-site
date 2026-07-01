const THEME_TRANSITION_CLASS = "theme-transitioning";
const VALID_THEMES = ["dark", "light", "auto"];
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const THEME_FAVICONS = {
  dark: "/favicons/web-app-manifest-192x192.png",
  light: "/favicons/favicon-96x96.png",
  auto: "/favicons/favicon-96x96.png",
};
const OVERLAY_NAV_HTML = `<div class="overlay-navigation">
<nav role="navigation">
<ul>
<li><a href="index.html" data-content="start over">home</a></li>
<li><a href="intro-1.html" data-content="hmmmmmm">about me</a></li>
<li><a href="#" data-content="things; though, never built!">revit</a></li>
<li><a href="#" data-content="simple things">stuff</a></li>
<li><a href="#" data-content="coffee's on me">call me</a></li>
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
const OVERLAY_CLOSE_DELAY_MS = 1200;
const HERO_TEXT_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const HERO_REVEAL_DURATION = 0.9;
const HERO_REVEAL_STAGGER = 0.16;
const HERO_REVEAL_DELAY = 0.06;
const HERO_SUBTEXT_DELAY = 0.18;
const HERO_PUNCTUATION_DELAY = 0.28;
const HERO_ANIMATION_TARGETS = [
  ".text-with-animation span",
  ".subtext-with-animation span",
  ".subtext-with-animation-1",
];

let themeTransitionTimeoutId = null;
let themePickerAnimationTimeoutId = null;
let replayTextAnimationsTimeoutId = null;

function isReducedMotionPreferred() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getStoredTheme() {
  try {
    const theme = localStorage.getItem("theme");
    return VALID_THEMES.includes(theme) ? theme : null;
  } catch {
    // ignore storage errors
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // ignore storage errors
  }
}

function resolveTheme(theme) {
  return theme === "auto"
    ? window.matchMedia(COLOR_SCHEME_QUERY).matches
      ? "dark"
      : "light"
    : theme;
}

function isThemeValid(theme) {
  return VALID_THEMES.includes(theme);
}

function isThemeAlreadyApplied(theme, resolvedTheme) {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  return currentTheme === resolvedTheme && theme === getStoredTheme();
}

function updateThemeButtonState(theme) {
  document.querySelectorAll("button[data-theme-toggle]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      button.dataset.themeToggle === theme ? "true" : "false",
    );
  });
}

function updateFavicon(theme) {
  const favicon =
    document.getElementById("favicon") ||
    document.querySelector('link[rel="icon"]');
  if (!favicon) return;
  favicon.href = THEME_FAVICONS[theme] || THEME_FAVICONS.light;
}

function getGsap() {
  return typeof window !== "undefined" ? window.gsap : null;
}

function hasElements(selector) {
  return !!document.querySelector(selector);
}

function replayTextAnimations() {
  const gsapLib = getGsap();
  if (!gsapLib) return;

  const existingTargets = HERO_ANIMATION_TARGETS.filter(hasElements);
  if (existingTargets.length === 0) return;

  gsapLib.killTweensOf(existingTargets.join(", "));

  if (hasElements(".text-with-animation span")) {
    gsapLib.to(".text-with-animation span", {
      x: 0,
      opacity: 1,
      duration: HERO_REVEAL_DURATION,
      ease: HERO_TEXT_EASE,
      delay: HERO_REVEAL_DELAY,
      stagger: HERO_REVEAL_STAGGER,
      overwrite: "auto",
    });
  }

  if (hasElements(".subtext-with-animation span")) {
    gsapLib.to(".subtext-with-animation span", {
      x: 0,
      opacity: 1,
      duration: HERO_REVEAL_DURATION,
      ease: HERO_TEXT_EASE,
      delay: HERO_SUBTEXT_DELAY,
      stagger: HERO_REVEAL_STAGGER,
      overwrite: "auto",
    });
  }

  if (hasElements(".subtext-with-animation-1")) {
    gsapLib.to(".subtext-with-animation-1", {
      y: 0,
      opacity: 1,
      duration: HERO_REVEAL_DURATION,
      ease: HERO_TEXT_EASE,
      delay: HERO_PUNCTUATION_DELAY,
      overwrite: "auto",
    });
  }
}

function hideTextAnimations() {
  if (
    !HERO_ANIMATION_TARGETS.some((selector) => document.querySelector(selector))
  ) {
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

  const existingTargets = HERO_ANIMATION_TARGETS.filter(hasElements);
  if (existingTargets.length === 0) return;

  gsapLib.killTweensOf(existingTargets.join(", "));

  if (hasElements(".text-with-animation span")) {
    gsapLib.set(".text-with-animation span", { x: "-7vw", opacity: 0 });
  }

  if (hasElements(".subtext-with-animation span")) {
    gsapLib.set(".subtext-with-animation span", { x: "-4vw", opacity: 0 });
  }

  if (hasElements(".subtext-with-animation-1")) {
    gsapLib.set(".subtext-with-animation-1", { y: "-8svh", opacity: 0 });
  }
}

function replayTextAnimationsAfterTransitions() {
  if (
    !HERO_ANIMATION_TARGETS.some((selector) => document.querySelector(selector))
  ) {
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

function clearThemePickerAnimation() {
  clearTimeout(themePickerAnimationTimeoutId);
  themePickerAnimationTimeoutId = null;

  const themeSwitcher = document.querySelector(".theme-switcher");
  if (!themeSwitcher) return;

  themeSwitcher.classList.remove("is-animating");
  themeSwitcher.querySelectorAll("button[data-theme-toggle]").forEach((btn) => {
    btn.classList.remove("is-incoming", "is-outgoing");
  });
}

function animateThemePicker(nextTheme) {
  if (isReducedMotionPreferred()) {
    clearThemePickerAnimation();
    return;
  }

  const themeSwitcher = document.querySelector(".theme-switcher");
  if (!themeSwitcher) return;

  const currentButton = themeSwitcher.querySelector(
    'button[data-theme-toggle][aria-pressed="true"]',
  );
  const nextButton = themeSwitcher.querySelector(
    `button[data-theme-toggle="${nextTheme}"]`,
  );

  clearThemePickerAnimation();
  themeSwitcher.classList.add("is-animating");

  if (currentButton && currentButton !== nextButton) {
    currentButton.classList.add("is-outgoing");
  }

  if (nextButton) {
    nextButton.classList.add("is-incoming");
  }

  themePickerAnimationTimeoutId = setTimeout(clearThemePickerAnimation, 0);
}

function applyThemeState(resolvedTheme, theme) {
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  saveTheme(theme);
  updateFavicon(resolvedTheme);
  updateThemeButtonState(theme);
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
    toggle(bottomBar, "animate-middle-bar", "animate-out-bottom-bar");
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
  if (isOverlayOpen()) return;

  const overlayHost = document.querySelector(".wrapper") || document.body;
  overlayHost.insertAdjacentHTML("afterbegin", OVERLAY_NAV_HTML);
  const overlayNavigation = document.querySelector(".overlay-navigation");
  if (!overlayNavigation) return;

  overlayNavigation.classList.add("overlay-active");
  overlayNavigation.getBoundingClientRect();
  overlayNavigation.classList.add("overlay-slide-down");

  const openOverlay = document.querySelector(".open-overlay");
  if (openOverlay) {
    openOverlay.setAttribute("aria-label", "Close navigation menu");
    openOverlay.setAttribute("aria-expanded", "true");
  }

  animateHamburgerButton(true);
  addOverlayOpenClasses(overlayNavigation);
}

function closeOverlayNavigation() {
  const overlayNavigation = document.querySelector(".overlay-navigation");
  if (!overlayNavigation) return;

  const openOverlay = document.querySelector(".open-overlay");
  if (openOverlay) {
    openOverlay.setAttribute("aria-label", "Open navigation menu");
    openOverlay.setAttribute("aria-expanded", "false");
  }

  animateHamburgerButton(false);
  addOverlayCloseClasses(overlayNavigation);

  setTimeout(() => {
    overlayNavigation.classList.replace(
      "overlay-slide-down",
      "overlay-slide-up",
    );
    overlayNavigation.addEventListener(
      "transitionend",
      () => overlayNavigation.remove(),
      { once: true },
    );
  }, OVERLAY_CLOSE_DELAY_MS);
}

let navEventsAttached = false;

function handleOverlayToggle() {
  if (isOverlayOpen()) {
    closeOverlayNavigation();
  } else {
    openOverlayNavigation();
  }
}

function handleDocumentClick(event) {
  const themeToggleButton = event.target.closest("[data-theme-toggle]");
  if (themeToggleButton) {
    event.preventDefault();
    setTheme(themeToggleButton.dataset.themeToggle);
    return;
  }

  const openOverlayButton = event.target.closest(".open-overlay");
  if (openOverlayButton) {
    event.preventDefault();
    handleOverlayToggle();
  }
}

function handleDocumentKeydown(event) {
  if (!event.target.closest(".open-overlay")) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleOverlayToggle();
  }
}

function attachNavEventHandlers() {
  if (navEventsAttached) return;
  navEventsAttached = true;

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);
}

function getCurrentPage() {
  return document.body?.dataset.page || "default";
}

function initDefaultNav() {
  attachNavEventHandlers();
}

function initIntro1ProfileNav() {
  // Placeholder for intro-1 profile navigation behavior.
  attachNavEventHandlers();
}

function initNavPage() {
  const navInitializers = {
    "intro-1": initIntro1ProfileNav,
  };

  const currentPage = getCurrentPage();
  (navInitializers[currentPage] || initDefaultNav)();
}

function notifyThemeTransitioned() {
  document.dispatchEvent(new Event("theme:transitioned"));
}

function notifyThemeTransitionStarted() {
  document.dispatchEvent(new Event("theme:transition:start"));
}

function setTheme(theme) {
  if (!isThemeValid(theme)) return;

  const resolvedTheme = resolveTheme(theme);
  const overlayWasOpen = isOverlayOpen();

  if (isThemeAlreadyApplied(theme, resolvedTheme)) {
    updateThemeButtonState(theme);
    updateFavicon(resolvedTheme);
    clearThemePickerAnimation();
    return;
  }

  animateThemePicker(theme);
  notifyThemeTransitionStarted();

  if (overlayWasOpen) {
    closeOverlayNavigation();
  }

  hideTextAnimations();

  if (isReducedMotionPreferred() || overlayWasOpen) {
    applyThemeState(resolvedTheme, theme);
    replayTextAnimationsAfterTransitions();
    notifyThemeTransitioned();
    return;
  }

  clearTimeout(themeTransitionTimeoutId);
  document.documentElement.classList.add(THEME_TRANSITION_CLASS);

  const endTransition = (delayMs) => {
    clearTimeout(themeTransitionTimeoutId);
    themeTransitionTimeoutId = setTimeout(() => {
      document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
    }, delayMs);
  };

  if (document.startViewTransition) {
    try {
      const transition = document.startViewTransition(() => {
        document.documentElement.setAttribute("data-theme", resolvedTheme);
        saveTheme(theme);
      });

      transition.finished
        .then(() => {
          updateFavicon(resolvedTheme);
          updateThemeButtonState(theme);
          replayTextAnimationsAfterTransitions();
          notifyThemeTransitioned();
          endTransition(0);
        })
        .catch(() => {
          document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
        });

      return;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("View transition error:", error);
      document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
    }
  }

  applyThemeState(resolvedTheme, theme);
  replayTextAnimationsAfterTransitions();
  notifyThemeTransitioned();
  endTransition(0);
}

document.addEventListener("page:transitioned", () => {
  hideTextAnimations();
  updateThemeButtonState(getStoredTheme() || "auto");
  initNavPage();
  replayTextAnimationsAfterTransitions();
});

document.addEventListener("DOMContentLoaded", () => {
  hideTextAnimations();
  const storedTheme = getStoredTheme();
  const theme = storedTheme || "auto";

  if (!storedTheme) {
    saveTheme(theme);
  }

  const resolvedTheme = resolveTheme(theme);
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  updateThemeButtonState(theme);
  updateFavicon(resolvedTheme);
  initNavPage();
  replayTextAnimationsAfterTransitions();
});
