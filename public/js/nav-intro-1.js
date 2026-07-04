const THEME_TRANSITION_CLASS = "theme-transitioning";
const VALID_THEMES = ["dark", "light", "auto"];
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const THEME_FAVICONS = {
  dark: "/favicons/web-app-manifest-192x192.png",
  light: "/favicons/favicon-96x96.png",
  auto: "/favicons/favicon-96x96.png",
};
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

function getIntro1MenuElements() {
  const openMenu = document.querySelector(".open-menu");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelector(".nav-links");
  return { openMenu, navMenu, navLinks };
}

function isOverlayOpen() {
  return document.querySelector(".nav-links")?.classList.contains("open");
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

function openOverlayNavigation() {
  const { openMenu, navMenu, navLinks } = getIntro1MenuElements();
  if (!openMenu || !navMenu || !navLinks) return;

  openMenu.classList.add("open");
  openMenu.setAttribute("aria-label", "Close navigation menu");
  openMenu.setAttribute("aria-expanded", "true");

  navMenu.classList.add("open");
  navLinks.classList.add("open");

  animateHamburgerButton(true);
}

function closeOverlayNavigation() {
  const { openMenu, navMenu, navLinks } = getIntro1MenuElements();
  if (!openMenu || !navMenu || !navLinks) return;

  openMenu.classList.remove("open");
  openMenu.setAttribute("aria-label", "Open navigation menu");
  openMenu.setAttribute("aria-expanded", "false");

  navMenu.classList.remove("open");
  navLinks.classList.remove("open");

  animateHamburgerButton(false);
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

  const openOverlayButton = event.target.closest(".open-menu");
  if (openOverlayButton) {
    event.preventDefault();
    handleOverlayToggle();
    return;
  }

  if (event.target.closest(".nav-links a")) {
    closeOverlayNavigation();
    return;
  }

  if (
    isOverlayOpen() &&
    !event.target.closest(".nav-menu") &&
    !event.target.closest(".open-menu")
  ) {
    closeOverlayNavigation();
  }
}

function handleDocumentKeydown(event) {
  if (
    event.target.closest(".open-menu") &&
    (event.key === "Enter" || event.key === " ")
  ) {
    event.preventDefault();
    handleOverlayToggle();
    return;
  }

  if (event.key === "Escape" && isOverlayOpen()) {
    closeOverlayNavigation();
  }
}

function attachNavEventHandlers() {
  if (navEventsAttached) return;
  navEventsAttached = true;

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);
}

function initIntroNav() {
  const { openMenu, navMenu } = getIntro1MenuElements();
  if (openMenu) {
    openMenu.setAttribute("role", "button");
    openMenu.setAttribute("tabindex", "0");
    if (navMenu?.id) {
      openMenu.setAttribute("aria-controls", navMenu.id);
    }
    openMenu.setAttribute("aria-label", "Open navigation menu");
    openMenu.setAttribute("aria-expanded", "false");
  }

  closeOverlayNavigation();
  attachNavEventHandlers();
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
  initIntroNav();
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
  initIntroNav();
  replayTextAnimationsAfterTransitions();
});
