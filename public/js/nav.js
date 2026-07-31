const THEME_TRANSITION_CLASS = "theme-transitioning";
const VALID_THEMES = ["light", "dark", "system"];
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const THEME_FAVICONS = {
  dark: "/favicons/web-app-manifest-192x192.png",
  light: "/favicons/favicon-96x96.png",
  system: "/favicons/favicon-96x96.png",
};
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
const OVERLAY_CLOSE_DELAY_MS = 900;
const OVERLAY_CLOSE_FALLBACK_MS = 1000;
const HERO_TEXT_EASE_NAV = "cubic-bezier(0.16, 1, 0.3, 1)";
const HERO_REVEAL_DURATION_NAV = 0.9;
const HERO_REVEAL_STAGGER_NAV = 0.16;
const HERO_REVEAL_DELAY_NAV = 0.06;
const HERO_SUBTEXT_DELAY = 0.18;
const HERO_PUNCTUATION_DELAY = 0.28;
const HERO_ANIMATION_TARGETS = [
  ".text-with-animation span",
  ".subtext-with-animation span",
  ".subtext-with-animation-1",
];
const TEXT_SPAN_SELECTOR = ".text-with-animation span";
const SUBTEXT_SPAN_SELECTOR = ".subtext-with-animation span";
const PUNCTUATION_SELECTOR = ".subtext-with-animation-1";
const THEME_SWITCHER_SELECTOR = ".theme-switcher";
const CUSTOM_THEME_SELECTOR_ROOT = "[data-theme-selector]";
const CUSTOM_THEME_SELECTOR_TRIGGER = "[data-theme-selector-trigger]";
const CUSTOM_THEME_SELECTOR_MENU = "[data-theme-selector-menu]";
const CUSTOM_THEME_SELECTOR_OPTION = "[data-theme-option]";
const OPEN_OVERLAY_SELECTOR = ".open-overlay";
const OVERLAY_FIRST_LINK_SELECTOR = ".overlay-navigation a[href]";
const THEME_VISUAL_TOGGLE_CLASS = "theme-visual-swap";

let themeTransitionTimeoutId = null;
let themePickerAnimationTimeoutId = null;
let replayTextAnimationsTimeoutId = null;
let overlayTriggerElement = null;
let themeVisualSwapState = false;

function isReducedMotionPreferred() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }

  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getStoredTheme() {
  try {
    const theme = localStorage.getItem("theme");
    if (theme === "auto") {
      saveTheme("system");
      return "system";
    }
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
  return theme === "system"
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

  const themeSelector = document.getElementById("theme-selector");
  if (themeSelector instanceof HTMLSelectElement) {
    themeSelector.value =
      theme === "light" || theme === "dark" || theme === "system"
        ? theme
        : "dark";
  }

  syncCustomThemeSelector(theme);
}

function getCustomThemeSelectorRoot() {
  return document.querySelector(CUSTOM_THEME_SELECTOR_ROOT);
}

function getCustomThemeSelectorElements() {
  const root = getCustomThemeSelectorRoot();
  if (!root) {
    return {};
  }

  return {
    root,
    trigger: root.querySelector(CUSTOM_THEME_SELECTOR_TRIGGER),
    menu: root.querySelector(CUSTOM_THEME_SELECTOR_MENU),
    options: [...root.querySelectorAll(CUSTOM_THEME_SELECTOR_OPTION)],
  };
}

function closeCustomThemeSelector({ returnFocus = false } = {}) {
  const { root, trigger, menu } = getCustomThemeSelectorElements();
  if (!root || !trigger || !menu) {
    return;
  }

  root.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");
  menu.hidden = true;

  if (returnFocus && trigger instanceof HTMLElement) {
    trigger.focus();
  }
}

function openCustomThemeSelector() {
  const { root, trigger, menu } = getCustomThemeSelectorElements();
  if (!root || !trigger || !menu) {
    return;
  }

  root.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  menu.hidden = false;
}

function syncCustomThemeSelector(theme) {
  const { root, options, trigger } = getCustomThemeSelectorElements();
  if (!root || !trigger || options.length === 0) {
    return;
  }

  const selectedTheme = VALID_THEMES.includes(theme) ? theme : "dark";
  let selectedOption = null;

  options.forEach((option) => {
    const isSelected = option.dataset.themeOption === selectedTheme;
    option.setAttribute("aria-selected", isSelected ? "true" : "false");
    if (isSelected) {
      selectedOption = option;
    }
  });

  if (!selectedOption) {
    return;
  }

  const triggerIcon = root.querySelector(".theme-selector-trigger-icon");
  const triggerText = root.querySelector(".theme-selector-trigger-text");
  const optionIcon = selectedOption.querySelector(".theme-option-icon");
  const optionText = selectedOption.querySelector(".theme-option-label");

  if (triggerIcon && optionIcon) {
    triggerIcon.innerHTML = optionIcon.innerHTML;
  }

  if (triggerText && optionText) {
    triggerText.textContent = optionText.textContent;
  }
}

function focusCustomThemeOption(direction = 1) {
  const { options } = getCustomThemeSelectorElements();
  if (!options || options.length === 0) {
    return;
  }

  const activeElement = document.activeElement;
  const activeIndex = options.findIndex((option) => option === activeElement);
  const fallbackIndex = options.findIndex(
    (option) => option.getAttribute("aria-selected") === "true",
  );
  const startIndex =
    activeIndex >= 0 ? activeIndex : Math.max(fallbackIndex, 0);
  const nextIndex = (startIndex + direction + options.length) % options.length;

  options[nextIndex]?.focus();
}

function applyThemeFromCustomOption(optionButton) {
  const nextTheme = optionButton?.dataset.themeOption;
  if (!isThemeValid(nextTheme)) {
    return;
  }

  const themeSelector = document.getElementById("theme-selector");
  if (themeSelector instanceof HTMLSelectElement) {
    themeSelector.value = nextTheme;
    themeSelector.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    setTheme(nextTheme);
  }
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
      stagger: HERO_REVEAL_STAGGER_NAV,
      overwrite: "auto",
    });
  }

  if (hasElements(SUBTEXT_SPAN_SELECTOR)) {
    gsapLib.to(SUBTEXT_SPAN_SELECTOR, {
      x: 0,
      opacity: 1,
      duration: HERO_REVEAL_DURATION_NAV,
      ease: HERO_TEXT_EASE_NAV,
      delay: HERO_SUBTEXT_DELAY,
      stagger: HERO_REVEAL_STAGGER_NAV,
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
    gsapLib.set(TEXT_SPAN_SELECTOR, { x: "-7vw", opacity: 0 });
  }

  if (hasElements(SUBTEXT_SPAN_SELECTOR)) {
    gsapLib.set(SUBTEXT_SPAN_SELECTOR, { x: "-4vw", opacity: 0 });
  }

  if (hasElements(PUNCTUATION_SELECTOR)) {
    gsapLib.set(PUNCTUATION_SELECTOR, { y: "-8svh", opacity: 0 });
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

function clearThemePickerAnimation() {
  clearTimeout(themePickerAnimationTimeoutId);
  themePickerAnimationTimeoutId = null;

  const themeSwitcher = document.querySelector(THEME_SWITCHER_SELECTOR);
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

  const themeSwitcher = document.querySelector(THEME_SWITCHER_SELECTOR);
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

function toggleThemeVisualSwapState() {
  themeVisualSwapState = !themeVisualSwapState;
  document.documentElement.classList.toggle(
    THEME_VISUAL_TOGGLE_CLASS,
    themeVisualSwapState,
  );
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
      firstOverlayLink.focus();
    });
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

let navEventsAttached = false;

function handleOverlayToggle() {
  if (isOverlayOpen()) {
    closeOverlayNavigation({ returnFocus: true });
  } else {
    openOverlayNavigation();
  }
}

function isNavigationOverlayLink(openOverlayButton) {
  const href = openOverlayButton.getAttribute("href");
  return !!href && href.trim() !== "" && href !== "#";
}

function handleDocumentClick(event) {
  const customThemeOption = event.target.closest(CUSTOM_THEME_SELECTOR_OPTION);
  if (customThemeOption) {
    event.preventDefault();
    applyThemeFromCustomOption(customThemeOption);
    closeCustomThemeSelector({ returnFocus: true });
    return;
  }

  const customThemeTrigger = event.target.closest(
    CUSTOM_THEME_SELECTOR_TRIGGER,
  );
  if (customThemeTrigger) {
    event.preventDefault();
    const isExpanded =
      customThemeTrigger.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeCustomThemeSelector();
    } else {
      openCustomThemeSelector();
    }
    return;
  }

  const customThemeRoot = event.target.closest(CUSTOM_THEME_SELECTOR_ROOT);
  if (!customThemeRoot) {
    closeCustomThemeSelector();
  }

  const themeToggleButton = event.target.closest("[data-theme-toggle]");
  if (themeToggleButton) {
    event.preventDefault();
    setTheme(themeToggleButton.dataset.themeToggle);
    return;
  }

  const openOverlayButton = event.target.closest(OPEN_OVERLAY_SELECTOR);
  if (openOverlayButton) {
    if (isNavigationOverlayLink(openOverlayButton)) {
      return;
    }
    event.preventDefault();
    handleOverlayToggle();
  }
}

function handleDocumentKeydown(event) {
  const customThemeIsOpen =
    getCustomThemeSelectorRoot()?.classList.contains("is-open") || false;
  const onCustomThemeTrigger =
    event.target.closest(CUSTOM_THEME_SELECTOR_TRIGGER) !== null;
  const onCustomThemeOption =
    event.target.closest(CUSTOM_THEME_SELECTOR_OPTION) !== null;

  if (customThemeIsOpen && event.key === "Escape") {
    event.preventDefault();
    closeCustomThemeSelector({ returnFocus: true });
    return;
  }

  if (onCustomThemeTrigger && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    const { trigger } = getCustomThemeSelectorElements();
    const isExpanded = trigger?.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeCustomThemeSelector();
    } else {
      openCustomThemeSelector();
      focusCustomThemeOption(1);
    }
    return;
  }

  if (onCustomThemeTrigger && event.key === "ArrowDown") {
    event.preventDefault();
    openCustomThemeSelector();
    focusCustomThemeOption(1);
    return;
  }

  if (onCustomThemeTrigger && event.key === "ArrowUp") {
    event.preventDefault();
    openCustomThemeSelector();
    focusCustomThemeOption(-1);
    return;
  }

  if (customThemeIsOpen && onCustomThemeOption && event.key === "ArrowDown") {
    event.preventDefault();
    focusCustomThemeOption(1);
    return;
  }

  if (customThemeIsOpen && onCustomThemeOption && event.key === "ArrowUp") {
    event.preventDefault();
    focusCustomThemeOption(-1);
    return;
  }

  if (
    customThemeIsOpen &&
    onCustomThemeOption &&
    (event.key === "Enter" || event.key === " ")
  ) {
    event.preventDefault();
    applyThemeFromCustomOption(
      event.target.closest(CUSTOM_THEME_SELECTOR_OPTION),
    );
    closeCustomThemeSelector({ returnFocus: true });
    return;
  }

  if (event.key === "Escape" && isOverlayOpen()) {
    event.preventDefault();
    closeOverlayNavigation({ returnFocus: true });
    return;
  }

  const openOverlayButton = event.target.closest(OPEN_OVERLAY_SELECTOR);
  if (!openOverlayButton) return;
  if (isNavigationOverlayLink(openOverlayButton)) return;

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleOverlayToggle();
  }
}

function finalizeThemeChange(resolvedTheme, theme) {
  applyThemeState(resolvedTheme, theme);
  replayTextAnimationsAfterTransitions();
  notifyThemeTransitioned();
}

function attachNavEventHandlers() {
  if (navEventsAttached) return;
  navEventsAttached = true;

  const openOverlayButton = document.querySelector(OPEN_OVERLAY_SELECTOR);
  if (openOverlayButton instanceof HTMLElement) {
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

  const themeSelector = document.getElementById("theme-selector");
  if (themeSelector instanceof HTMLSelectElement) {
    themeSelector.addEventListener("change", (event) => {
      const nextTheme = event.target.value;
      if (
        nextTheme === "light" ||
        nextTheme === "dark" ||
        nextTheme === "system"
      ) {
        setTheme(nextTheme);
      }
    });
  }

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);
}

function initIntroNav() {
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
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const overlayWasOpen = isOverlayOpen();

  if (isThemeAlreadyApplied(theme, resolvedTheme)) {
    updateThemeButtonState(theme);
    updateFavicon(resolvedTheme);
    clearThemePickerAnimation();
    return;
  }

  // If the resolved color stays the same (e.g. dark <-> system on dark OS),
  // still run a lightweight transition so every click gets visual feedback.
  if (currentTheme === resolvedTheme) {
    animateThemePicker(theme);
    notifyThemeTransitionStarted();

    if (isReducedMotionPreferred() || !document.startViewTransition) {
      applyThemeState(resolvedTheme, theme);
      replayTextAnimationsAfterTransitions();
      notifyThemeTransitioned();
      return;
    }

    clearTimeout(themeTransitionTimeoutId);
    document.documentElement.classList.add(THEME_TRANSITION_CLASS);

    const transition = document.startViewTransition(() => {
      toggleThemeVisualSwapState();
      applyThemeState(resolvedTheme, theme);
    });

    transition.finished
      .then(() => {
        replayTextAnimationsAfterTransitions();
        notifyThemeTransitioned();
        clearTimeout(themeTransitionTimeoutId);
        themeTransitionTimeoutId = setTimeout(() => {
          document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
        }, 0);
      })
      .catch(() => {
        document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
      });

    return;
  }

  animateThemePicker(theme);
  notifyThemeTransitionStarted();

  if (overlayWasOpen) {
    closeOverlayNavigation();
  }

  hideTextAnimations();

  if (isReducedMotionPreferred() || overlayWasOpen) {
    finalizeThemeChange(resolvedTheme, theme);
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
        toggleThemeVisualSwapState();
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

  finalizeThemeChange(resolvedTheme, theme);
  endTransition(0);
}

document.addEventListener("page:transitioned", () => {
  hideTextAnimations();
  updateThemeButtonState(getStoredTheme() || "dark");
  initIntroNav();
  replayTextAnimationsAfterTransitions();
});

document.addEventListener("DOMContentLoaded", () => {
  hideTextAnimations();
  const storedTheme = getStoredTheme();
  const theme = storedTheme || "dark";

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
