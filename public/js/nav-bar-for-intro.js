let menu = null;
let overlayNavigation = null;
let navlinks = null;
let pageTitle = null;
const mobileQuery = window.matchMedia("(max-width: 768px)");
let firstNavLink = null;
const introThemeAnnouncement = document.getElementById("theme-announcement");

const INTRO_VALID_THEMES = ["light", "dark", "system"];
const INTRO_COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const INTRO_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const INTRO_THEME_TRANSITION_CLASS = "theme-transitioning";
const INTRO_THEME_VISUAL_TOGGLE_CLASS = "theme-visual-swap";
const INTRO_NAV_CLOSE_HIDE_FALLBACK_MS = 320;
const INTRO_NAV_CLOSING_CLASS = "intro-nav-closing";

const INTRO_CUSTOM_THEME_SELECTOR_ROOT = "[data-theme-selector]";
const INTRO_CUSTOM_THEME_SELECTOR_TRIGGER = "[data-theme-selector-trigger]";
const INTRO_CUSTOM_THEME_SELECTOR_OPTION = "[data-theme-option]";
const INTRO_CUSTOM_THEME_SELECTOR_MENU = "[data-theme-selector-menu]";

const introSectionHashes = new Set(
  Array.from(
    document.querySelectorAll("main > section[id]"),
    (section) => `#${section.id}`,
  ),
);

let isMenuOpen = false;
let introThemeTransitionTimeoutId = null;
let introNavHideTimeoutId = null;
let introThemeVisualSwapState = false;
let introDocumentEventsAttached = false;
let introBoundMenuElement = null;
let introBoundNavLinksElement = null;

function normalizeIntroOverlayNav() {
  const overlays = [...document.querySelectorAll(".overlay-navigation")];
  if (overlays.length === 0) {
    return;
  }

  const overlayWithIntroLinks = overlays.find((overlay) =>
    overlay.querySelector(".nav-links"),
  );
  const primaryOverlay = overlayWithIntroLinks || overlays[0];

  overlays.forEach((overlay) => {
    if (overlay !== primaryOverlay) {
      overlay.remove();
    }
  });

  let introNavLinks = primaryOverlay.querySelector(".nav-links");
  if (!introNavLinks) {
    const fallbackList = primaryOverlay.querySelector("ul");
    if (fallbackList) {
      fallbackList.classList.add("nav-links");
      introNavLinks = fallbackList;
    }
  }

  if (!introNavLinks) {
    return;
  }

  [...introNavLinks.querySelectorAll("li")].forEach((item) => {
    if (!item.querySelector("a[href]")) {
      item.remove();
    }
  });

  const linkedItems = [...introNavLinks.querySelectorAll("li")].filter((item) =>
    item.querySelector("a[href]"),
  );

  linkedItems.slice(2).forEach((item) => {
    item.remove();
  });
}

function isIntroPage() {
  return document.body?.dataset?.page === "intro";
}

function refreshIntroNavElements() {
  normalizeIntroOverlayNav();
  menu = document.querySelector(".open-overlay");
  overlayNavigation = document.querySelector(".overlay-navigation");
  navlinks = overlayNavigation
    ? overlayNavigation.querySelector(".nav-links") ||
      overlayNavigation.querySelector("ul")
    : document.querySelector(".nav-links");
  pageTitle = document.querySelector(".intro-1-page-title");
  firstNavLink = navlinks ? navlinks.querySelector("a[href]") : null;
}

function introIsReducedMotionPreferred() {
  return window.matchMedia(INTRO_REDUCED_MOTION_QUERY).matches;
}

function introParseTimeToMs(timeValue) {
  const value = timeValue.trim();
  if (!value) {
    return 0;
  }

  if (value.endsWith("ms")) {
    const milliseconds = Number.parseFloat(value.slice(0, -2));
    return Number.isFinite(milliseconds) ? milliseconds : 0;
  }

  if (value.endsWith("s")) {
    const seconds = Number.parseFloat(value.slice(0, -1));
    return Number.isFinite(seconds) ? seconds * 1000 : 0;
  }

  return 0;
}

function introGetNavCloseHideDelayMs() {
  if (introIsReducedMotionPreferred()) {
    return 0;
  }

  const transitionElement = overlayNavigation || navlinks;
  if (!transitionElement) {
    return 0;
  }

  const styles = window.getComputedStyle(transitionElement);
  const durationValues = styles.transitionDuration
    .split(",")
    .map((value) => introParseTimeToMs(value));
  const delayValues = styles.transitionDelay
    .split(",")
    .map((value) => introParseTimeToMs(value));

  const pairCount = Math.max(durationValues.length, delayValues.length);
  if (pairCount === 0) {
    return INTRO_NAV_CLOSE_HIDE_FALLBACK_MS;
  }

  let maxTimeMs = 0;
  for (let i = 0; i < pairCount; i += 1) {
    const duration = durationValues[i % durationValues.length] ?? 0;
    const delay = delayValues[i % delayValues.length] ?? 0;
    maxTimeMs = Math.max(maxTimeMs, duration + delay);
  }

  if (maxTimeMs <= 0) {
    return 0;
  }

  return Math.ceil(maxTimeMs + 16);
}

function introGetStoredTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "auto") {
      introSaveTheme("system");
      return "system";
    }
    return INTRO_VALID_THEMES.includes(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

function introSaveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Ignore storage failures in private mode.
  }
}

function introResolveTheme(theme) {
  return theme === "system"
    ? window.matchMedia(INTRO_COLOR_SCHEME_QUERY).matches
      ? "dark"
      : "light"
    : theme;
}

function introGetCustomThemeSelectorRoot() {
  return document.querySelector(INTRO_CUSTOM_THEME_SELECTOR_ROOT);
}

function introGetCustomThemeSelectorElements() {
  const root = introGetCustomThemeSelectorRoot();
  if (!root) {
    return {};
  }

  return {
    root,
    trigger: root.querySelector(INTRO_CUSTOM_THEME_SELECTOR_TRIGGER),
    menu: root.querySelector(INTRO_CUSTOM_THEME_SELECTOR_MENU),
    options: [...root.querySelectorAll(INTRO_CUSTOM_THEME_SELECTOR_OPTION)],
  };
}

function introCloseCustomThemeSelector({ returnFocus = false } = {}) {
  const { root, trigger, menu } = introGetCustomThemeSelectorElements();
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

function introOpenCustomThemeSelector() {
  const { root, trigger, menu } = introGetCustomThemeSelectorElements();
  if (!root || !trigger || !menu) {
    return;
  }

  root.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  menu.hidden = false;
}

function introSyncCustomThemeSelector(theme) {
  const { root, options, trigger } = introGetCustomThemeSelectorElements();
  if (!root || !trigger || options.length === 0) {
    return;
  }

  const selectedTheme = INTRO_VALID_THEMES.includes(theme) ? theme : "system";
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

  if (trigger instanceof HTMLButtonElement && optionText) {
    trigger.setAttribute(
      "aria-label",
      `Select color theme, current selection ${optionText.textContent.trim()}`,
    );
  }
}

function introUpdateThemeButtons(theme) {
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
        : "system";
  }

  introSyncCustomThemeSelector(theme);
}

function introFocusCustomThemeOption(direction = 1) {
  const { options } = introGetCustomThemeSelectorElements();
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

function introFocusSelectedCustomThemeOption() {
  const { options } = introGetCustomThemeSelectorElements();
  if (!options || options.length === 0) {
    return;
  }

  const selectedOption = options.find(
    (option) => option.getAttribute("aria-selected") === "true",
  );

  (selectedOption || options[0])?.focus();
}

function introApplyThemeFromCustomOption(optionButton) {
  const nextTheme = optionButton?.dataset.themeOption;
  if (!INTRO_VALID_THEMES.includes(nextTheme)) {
    return;
  }

  const themeSelector = document.getElementById("theme-selector");
  if (themeSelector instanceof HTMLSelectElement) {
    themeSelector.value = nextTheme;
  }

  introSetTheme(nextTheme);
}

function handleIntroDocumentThemeSelectorChange(event) {
  if (!isIntroPage()) {
    return;
  }

  const themeSelector = event.target;
  if (!(themeSelector instanceof HTMLSelectElement)) {
    return;
  }

  if (themeSelector.id !== "theme-selector") {
    return;
  }

  const nextTheme = themeSelector.value;
  if (nextTheme === "light" || nextTheme === "dark" || nextTheme === "system") {
    introSetTheme(nextTheme);
  }
}

function introAnnounceTheme(theme) {
  if (!introThemeAnnouncement) {
    return;
  }

  introThemeAnnouncement.textContent =
    theme === "system"
      ? "Theme set to device preference"
      : theme === "light"
        ? "Theme set to light"
        : "Theme set to dark";
}

function introApplyThemeState(resolvedTheme, theme, announce) {
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  introSaveTheme(theme);
  introUpdateThemeButtons(theme);

  if (announce) {
    introAnnounceTheme(theme);
  }
}

function introToggleThemeVisualSwapState() {
  introThemeVisualSwapState = !introThemeVisualSwapState;
  document.documentElement.classList.toggle(
    INTRO_THEME_VISUAL_TOGGLE_CLASS,
    introThemeVisualSwapState,
  );
}

function introSetTheme(theme, options = {}) {
  const { announce = true, withTransition = true } = options;
  if (!INTRO_VALID_THEMES.includes(theme)) {
    return;
  }

  const resolvedTheme = introResolveTheme(theme);
  const currentTheme = document.documentElement.getAttribute("data-theme");

  if (currentTheme === resolvedTheme && introGetStoredTheme() === theme) {
    introUpdateThemeButtons(theme);
    return;
  }

  if (!withTransition || introIsReducedMotionPreferred()) {
    introApplyThemeState(resolvedTheme, theme, announce);
    return;
  }

  clearTimeout(introThemeTransitionTimeoutId);
  document.documentElement.classList.add(INTRO_THEME_TRANSITION_CLASS);

  if (document.startViewTransition) {
    try {
      const transition = document.startViewTransition(() => {
        introToggleThemeVisualSwapState();
        introApplyThemeState(resolvedTheme, theme, announce);
      });

      transition.finished
        .then(() => {
          introThemeTransitionTimeoutId = setTimeout(() => {
            document.documentElement.classList.remove(
              INTRO_THEME_TRANSITION_CLASS,
            );
          }, 0);
        })
        .catch(() => {
          document.documentElement.classList.remove(
            INTRO_THEME_TRANSITION_CLASS,
          );
        });
      return;
    } catch {
      document.documentElement.classList.remove(INTRO_THEME_TRANSITION_CLASS);
    }
  }

  introApplyThemeState(resolvedTheme, theme, announce);
  introThemeTransitionTimeoutId = setTimeout(() => {
    document.documentElement.classList.remove(INTRO_THEME_TRANSITION_CLASS);
  }, 0);
}

function animateHamburgerButton(opening) {
  if (introIsReducedMotionPreferred()) return;
  const topBar = menu ? menu.querySelector(".bar-top") : null;
  const middleBar = menu ? menu.querySelector(".bar-middle") : null;
  const bottomBar = menu ? menu.querySelector(".bar-bottom") : null;
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

function setPageTitleVisibility(isVisible) {
  if (!pageTitle) {
    return;
  }

  pageTitle.classList.toggle("is-hidden", !isVisible);
  pageTitle.setAttribute("aria-hidden", isVisible ? "false" : "true");
}

function setIntroNavOpenState(isOpen) {
  document.documentElement.classList.toggle("intro-nav-open", isOpen);
}

function setIntroNavClosingState(isClosing) {
  document.documentElement.classList.toggle(INTRO_NAV_CLOSING_CLASS, isClosing);
}

function setMenuState(isOpen, options = {}) {
  if (!menu || !overlayNavigation || !navlinks) {
    refreshIntroNavElements();
  }

  const { moveFocus = false, returnFocus = false, showTitle = true } = options;
  isMenuOpen = isOpen;

  clearTimeout(introNavHideTimeoutId);

  const wasOpen =
    overlayNavigation?.classList.contains("overlay-slide-down") ||
    navlinks?.classList.contains("open");

  if (isMenuOpen && overlayNavigation) {
    const wasHidden = overlayNavigation.hidden;
    overlayNavigation.hidden = false;
    overlayNavigation.removeAttribute("aria-hidden");
    setIntroNavClosingState(false);
    if (wasHidden) {
      void overlayNavigation.offsetHeight;
    }
  }

  navlinks?.classList.toggle("open", isMenuOpen);
  if (overlayNavigation) {
    overlayNavigation.classList.toggle("overlay-slide-down", isMenuOpen);
    overlayNavigation.classList.toggle("overlay-slide-up", !isMenuOpen);
    overlayNavigation.setAttribute(
      "aria-hidden",
      isMenuOpen ? "false" : "true",
    );
  }

  if (menu) {
    menu.classList.toggle("is-active", isMenuOpen);
    menu.setAttribute("aria-expanded", isMenuOpen ? "true" : "false");
    menu.setAttribute(
      "aria-label",
      isMenuOpen ? "Close navigation menu" : "Open navigation menu",
    );
  }

  if (!isMenuOpen && overlayNavigation) {
    if (wasOpen) {
      setIntroNavClosingState(true);
      const navCloseHideDelayMs = introGetNavCloseHideDelayMs();
      introNavHideTimeoutId = setTimeout(() => {
        if (!isMenuOpen && overlayNavigation) {
          overlayNavigation.hidden = true;
          setIntroNavClosingState(false);
        }
      }, navCloseHideDelayMs);
    } else {
      overlayNavigation.hidden = true;
      setIntroNavClosingState(false);
    }
  }

  if (navlinks) {
    navlinks.setAttribute("aria-hidden", isMenuOpen ? "false" : "true");
    if ("inert" in navlinks) {
      navlinks.inert = !isMenuOpen;
    }
  }

  setIntroNavOpenState(isMenuOpen);
  setPageTitleVisibility(isMenuOpen ? false : showTitle);
  animateHamburgerButton(isMenuOpen);

  if (isMenuOpen && moveFocus && firstNavLink) {
    firstNavLink.focus();
  }

  if (!isMenuOpen && returnFocus && menu) {
    menu.focus();
  }
}

function handleOverlayToggle() {
  refreshIntroNavElements();
  if (!menu || !overlayNavigation || !navlinks) {
    return;
  }

  setMenuState(!isMenuOpen, { moveFocus: true, returnFocus: true });
}

function isNavigationOverlayLink(openOverlayButton) {
  const href = openOverlayButton.getAttribute("href");
  return !!href && href.trim() !== "" && href !== "#";
}

function handleDocumentClick(event) {
  if (!isIntroPage()) {
    return;
  }

  const customThemeOption = event.target.closest(
    INTRO_CUSTOM_THEME_SELECTOR_OPTION,
  );
  if (customThemeOption) {
    event.preventDefault();
    introApplyThemeFromCustomOption(customThemeOption);
    introCloseCustomThemeSelector({ returnFocus: true });
    return;
  }

  const customThemeTrigger = event.target.closest(
    INTRO_CUSTOM_THEME_SELECTOR_TRIGGER,
  );
  if (customThemeTrigger) {
    event.preventDefault();
    const isExpanded =
      customThemeTrigger.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      introCloseCustomThemeSelector();
    } else {
      introOpenCustomThemeSelector();
      introFocusSelectedCustomThemeOption();
    }
    return;
  }

  const customThemeRoot = event.target.closest(
    INTRO_CUSTOM_THEME_SELECTOR_ROOT,
  );
  if (!customThemeRoot) {
    introCloseCustomThemeSelector();
  }

  const themeButton = event.target.closest("button[data-theme-toggle]");
  if (themeButton) {
    event.preventDefault();
    introSetTheme(themeButton.dataset.themeToggle);
    return;
  }

  const openOverlayButton = event.target.closest(".open-overlay");
  if (openOverlayButton) {
    if (isNavigationOverlayLink(openOverlayButton)) {
      return;
    }
    event.preventDefault();
    handleOverlayToggle();
  }
}

function handleNavLinkClick(event) {
  const link = event.target.closest("a[href]");
  if (!link) {
    return;
  }

  const href = link.getAttribute("href") || "";
  const isIntroSectionHash =
    href.startsWith("#") && introSectionHashes.has(href);

  setPageTitleVisibility(false);
  setMenuState(false, { showTitle: false });

  if (mobileQuery.matches && isIntroSectionHash) {
    event.preventDefault();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (window.location.hash !== href) {
          window.location.hash = href;
        }
      });
    });
  }
}

function handleViewportChange() {
  setMenuState(false);
}

function handleNavFocusIn() {
  setPageTitleVisibility(false);
}

function handleNavFocusOut(event) {
  const nextFocusedElement = event.relatedTarget;
  const focusStaysInNav =
    !!nextFocusedElement &&
    (navlinks.contains(nextFocusedElement) ||
      menu.contains(nextFocusedElement));

  if (!focusStaysInNav) {
    setPageTitleVisibility(true);
  }
}

function handleDocumentKeydown(event) {
  if (!isIntroPage()) {
    return;
  }

  const customThemeIsOpen =
    introGetCustomThemeSelectorRoot()?.classList.contains("is-open") || false;
  const onCustomThemeTrigger =
    event.target.closest(INTRO_CUSTOM_THEME_SELECTOR_TRIGGER) !== null;
  const onCustomThemeOption =
    event.target.closest(INTRO_CUSTOM_THEME_SELECTOR_OPTION) !== null;

  if (customThemeIsOpen && event.key === "Escape") {
    event.preventDefault();
    introCloseCustomThemeSelector({ returnFocus: true });
    return;
  }

  if (onCustomThemeTrigger && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    const { trigger } = introGetCustomThemeSelectorElements();
    const isExpanded = trigger?.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      introCloseCustomThemeSelector();
    } else {
      introOpenCustomThemeSelector();
      introFocusSelectedCustomThemeOption();
    }
    return;
  }

  if (onCustomThemeTrigger && event.key === "ArrowDown") {
    event.preventDefault();
    introOpenCustomThemeSelector();
    introFocusCustomThemeOption(1);
    return;
  }

  if (onCustomThemeTrigger && event.key === "ArrowUp") {
    event.preventDefault();
    introOpenCustomThemeSelector();
    introFocusCustomThemeOption(-1);
    return;
  }

  if (customThemeIsOpen && onCustomThemeOption && event.key === "ArrowDown") {
    event.preventDefault();
    introFocusCustomThemeOption(1);
    return;
  }

  if (customThemeIsOpen && onCustomThemeOption && event.key === "ArrowUp") {
    event.preventDefault();
    introFocusCustomThemeOption(-1);
    return;
  }

  if (customThemeIsOpen && (onCustomThemeTrigger || onCustomThemeOption)) {
    if (event.key === "Home") {
      event.preventDefault();
      const { options } = introGetCustomThemeSelectorElements();
      options?.[0]?.focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const { options } = introGetCustomThemeSelectorElements();
      options?.[options.length - 1]?.focus();
      return;
    }
  }

  if (
    customThemeIsOpen &&
    onCustomThemeOption &&
    (event.key === "Enter" || event.key === " ")
  ) {
    event.preventDefault();
    introApplyThemeFromCustomOption(
      event.target.closest(INTRO_CUSTOM_THEME_SELECTOR_OPTION),
    );
    introCloseCustomThemeSelector({ returnFocus: true });
    return;
  }

  if (event.key === "Escape" && isMenuOpen) {
    event.preventDefault();
    setMenuState(false, { returnFocus: true });
    return;
  }

  const openOverlayButton = event.target.closest(".open-overlay");
  if (!openOverlayButton) {
    return;
  }
  if (isNavigationOverlayLink(openOverlayButton)) {
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleOverlayToggle();
  }
}

function clearSectionHashOnClosedLoad() {
  if (!window.location.hash || !introSectionHashes.has(window.location.hash)) {
    return;
  }

  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`,
  );
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function handleSystemThemeChange() {
  if (introGetStoredTheme() !== "system") {
    return;
  }

  introSetTheme("system", { announce: false, withTransition: false });
}

function attachIntroNavEvents() {
  if (!isIntroPage()) {
    return;
  }

  refreshIntroNavElements();

  if (!introDocumentEventsAttached) {
    introDocumentEventsAttached = true;

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeydown);
    document.addEventListener("change", handleIntroDocumentThemeSelectorChange);

    document.addEventListener("click", (event) => {
      if (!mobileQuery.matches || !isMenuOpen) {
        return;
      }

      if (event.target.closest(".back-to-top")) {
        setMenuState(false);
      }
    });
  }

  if (!menu) {
    return;
  }

  if (introBoundMenuElement !== menu) {
    introBoundMenuElement = menu;

    const openOverlayButton = document.querySelector(".open-overlay");
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

    menu.addEventListener("focusin", handleNavFocusIn);
    menu.addEventListener("focusout", handleNavFocusOut);
  }

  if (!navlinks || introBoundNavLinksElement === navlinks) {
    return;
  }

  introBoundNavLinksElement = navlinks;
  navlinks.addEventListener("click", handleNavLinkClick);
  navlinks.addEventListener("focusin", handleNavFocusIn);
  navlinks.addEventListener("focusout", handleNavFocusOut);

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else {
    mobileQuery.addListener(handleViewportChange);
  }
}

function initIntroThemeSwitcher() {
  if (!isIntroPage()) {
    return;
  }

  const storedTheme = introGetStoredTheme();
  introSetTheme(storedTheme, { announce: false, withTransition: false });

  const mediaQueryList = window.matchMedia(INTRO_COLOR_SCHEME_QUERY);
  if (typeof mediaQueryList.addEventListener === "function") {
    mediaQueryList.addEventListener("change", handleSystemThemeChange);
  } else {
    mediaQueryList.addListener(handleSystemThemeChange);
  }

  // Change handling is delegated at the document level to survive body swaps.
}

function initIntroNav() {
  if (!isIntroPage()) {
    introBoundMenuElement = null;
    introBoundNavLinksElement = null;
    return;
  }

  refreshIntroNavElements();

  initIntroThemeSwitcher();
  attachIntroNavEvents();
  handleViewportChange();
  clearSectionHashOnClosedLoad();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initIntroNav);
} else {
  initIntroNav();
}

document.addEventListener("page:transitioned", initIntroNav);
