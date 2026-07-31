const menu = document.querySelector(".open-overlay");
const navlinks = document.querySelector(".nav-links");
const pageTitle = document.querySelector(".intro-1-page-title");
const mobileQuery = window.matchMedia("(max-width: 768px)");
const firstNavLink = navlinks ? navlinks.querySelector("a[href]") : null;
const introThemeAnnouncement = document.getElementById("theme-announcement");
const INTRO_VALID_THEMES = ["light", "dark", "system"];
const INTRO_COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const INTRO_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const INTRO_THEME_TRANSITION_CLASS = "theme-transitioning";
const INTRO_THEME_VISUAL_TOGGLE_CLASS = "theme-visual-swap";
const INTRO_THEME_BUTTON_PULSE_CLASS = "is-tapped";
const INTRO_THEME_BUTTON_PULSE_MS = 520;
const INTRO_NAV_CLOSE_HIDE_FALLBACK_MS = 320;
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
let introThemeButtonPulseTimeoutId = null;
let introNavHideTimeoutId = null;
let introThemeVisualSwapState = false;

function introIsReducedMotionPreferred() {
  return window.matchMedia(INTRO_REDUCED_MOTION_QUERY).matches;
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
  if (!navlinks || introIsReducedMotionPreferred()) {
    return 0;
  }

  const styles = window.getComputedStyle(navlinks);
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

  // Add one frame so hidden is toggled after paint of the last animation frame.
  return Math.ceil(maxTimeMs + 16);
}

function introGetStoredTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "auto") {
      introSaveTheme("system");
      return "system";
    }
    return INTRO_VALID_THEMES.includes(saved) ? saved : "dark";
  } catch {
    return "dark";
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
  if (theme !== "system") {
    return theme;
  }

  return window.matchMedia(INTRO_COLOR_SCHEME_QUERY).matches ? "dark" : "light";
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
        : "dark";
  }

  introSyncCustomThemeSelector(theme);
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
  const { root, options } = introGetCustomThemeSelectorElements();
  if (!root || options.length === 0) {
    return;
  }

  const selectedTheme = INTRO_VALID_THEMES.includes(theme) ? theme : "dark";
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

function introApplyThemeFromCustomOption(optionButton) {
  const nextTheme = optionButton?.dataset.themeOption;
  if (nextTheme !== "light" && nextTheme !== "dark" && nextTheme !== "system") {
    return;
  }

  const themeSelector = document.getElementById("theme-selector");
  if (themeSelector instanceof HTMLSelectElement) {
    themeSelector.value = nextTheme;
    themeSelector.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  introSetTheme(nextTheme, { announce: true, withTransition: true });
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

function introApplyTheme(theme, announce = true) {
  if (!INTRO_VALID_THEMES.includes(theme)) {
    return;
  }

  const resolvedTheme = introResolveTheme(theme);
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  introSaveTheme(theme);
  introUpdateThemeButtons(theme);

  if (announce) {
    introAnnounceTheme(theme);
  }
}

function introEndThemeTransition() {
  clearTimeout(introThemeTransitionTimeoutId);
  introThemeTransitionTimeoutId = setTimeout(() => {
    document.documentElement.classList.remove(INTRO_THEME_TRANSITION_CLASS);
  }, 0);
}

function introToggleThemeVisualSwapState() {
  introThemeVisualSwapState = !introThemeVisualSwapState;
  document.documentElement.classList.toggle(
    INTRO_THEME_VISUAL_TOGGLE_CLASS,
    introThemeVisualSwapState,
  );
}

function introRunThemeTransition(theme, announce) {
  document.documentElement.classList.add(INTRO_THEME_TRANSITION_CLASS);

  if (document.startViewTransition) {
    try {
      const transition = document.startViewTransition(() => {
        introToggleThemeVisualSwapState();
        introApplyTheme(theme, announce);
      });

      transition.finished
        .then(() => {
          introEndThemeTransition();
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

  introApplyTheme(theme, announce);
  introEndThemeTransition();
}

function introSetTheme(theme, options = {}) {
  const { announce = true, withTransition = true } = options;
  if (!INTRO_VALID_THEMES.includes(theme)) {
    return;
  }

  const resolvedTheme = introResolveTheme(theme);
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const storedTheme = introGetStoredTheme();

  if (currentTheme === resolvedTheme && storedTheme === theme) {
    introUpdateThemeButtons(theme);
    return;
  }

  // Dark <-> system can resolve to the same visual theme.
  // Keep transition feedback even if resolved colors are the same.
  if (currentTheme === resolvedTheme) {
    if (!withTransition || introIsReducedMotionPreferred()) {
      introApplyTheme(theme, announce);
      return;
    }

    introRunThemeTransition(theme, announce);
    return;
  }

  if (!withTransition || introIsReducedMotionPreferred()) {
    introApplyTheme(theme, announce);
    return;
  }

  introRunThemeTransition(theme, announce);
}

function introPulseThemeButton(button) {
  if (introIsReducedMotionPreferred()) {
    return;
  }

  if (!button) {
    return;
  }

  clearTimeout(introThemeButtonPulseTimeoutId);
  button.classList.remove(INTRO_THEME_BUTTON_PULSE_CLASS);
  void button.offsetWidth;
  button.classList.add(INTRO_THEME_BUTTON_PULSE_CLASS);

  introThemeButtonPulseTimeoutId = setTimeout(() => {
    button.classList.remove(INTRO_THEME_BUTTON_PULSE_CLASS);
  }, INTRO_THEME_BUTTON_PULSE_MS);
}

function handleThemeToggleClick(event) {
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
  if (!themeButton) {
    return;
  }

  event.preventDefault();
  introPulseThemeButton(themeButton);
  introSetTheme(themeButton.dataset.themeToggle, {
    announce: true,
    withTransition: true,
  });
}

function handleSystemThemeChange() {
  if (introGetStoredTheme() !== "system") {
    return;
  }

  introSetTheme("system", { announce: false, withTransition: false });
}

function initIntroThemeSwitcher() {
  const storedTheme = introGetStoredTheme();
  introSetTheme(storedTheme, { announce: false, withTransition: false });

  const mediaQueryList = window.matchMedia(INTRO_COLOR_SCHEME_QUERY);
  if (typeof mediaQueryList.addEventListener === "function") {
    mediaQueryList.addEventListener("change", handleSystemThemeChange);
  } else {
    mediaQueryList.addListener(handleSystemThemeChange);
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
        introSetTheme(nextTheme, { announce: true, withTransition: true });
      }
    });
  }

  document.addEventListener("click", handleThemeToggleClick);
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

function setMenuState(isOpen, options = {}) {
  const { moveFocus = false, returnFocus = false, showTitle = true } = options;
  isMenuOpen = isOpen;

  clearTimeout(introNavHideTimeoutId);

  if (!mobileQuery.matches) {
    navlinks.classList.remove("open");
    menu.classList.remove("is-active");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation menu");
    navlinks.hidden = false;
    navlinks.removeAttribute("aria-hidden");
    if ("inert" in navlinks) {
      navlinks.inert = false;
    }
    setIntroNavOpenState(false);
    setPageTitleVisibility(showTitle);
    return;
  }

  const wasOpen = navlinks.classList.contains("open");
  if (isMenuOpen) {
    navlinks.hidden = false;
  }

  navlinks.classList.toggle("open", isMenuOpen);
  menu.classList.toggle("is-active", isMenuOpen);
  menu.setAttribute("aria-expanded", isMenuOpen ? "true" : "false");
  menu.setAttribute(
    "aria-label",
    isMenuOpen ? "Close navigation menu" : "Open navigation menu",
  );
  navlinks.setAttribute("aria-hidden", isMenuOpen ? "false" : "true");
  if ("inert" in navlinks) {
    navlinks.inert = !isMenuOpen;
  }

  if (!isMenuOpen) {
    if (wasOpen) {
      const navCloseHideDelayMs = introGetNavCloseHideDelayMs();
      introNavHideTimeoutId = setTimeout(() => {
        if (!isMenuOpen) {
          navlinks.hidden = true;
        }
      }, navCloseHideDelayMs);
    } else {
      navlinks.hidden = true;
    }
  }

  setIntroNavOpenState(isMenuOpen);
  setPageTitleVisibility(isMenuOpen ? false : showTitle);
  animateHamburgerButton(isMenuOpen);

  if (isMenuOpen && moveFocus && firstNavLink) {
    firstNavLink.focus();
  }

  if (!isMenuOpen && returnFocus) {
    menu.focus();
  }
}

function toggleMenu() {
  if (!mobileQuery.matches) {
    return;
  }

  setMenuState(!isMenuOpen, {
    moveFocus: true,
    returnFocus: true,
  });
}

function handleViewportChange() {
  setMenuState(false);
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

  if (mobileQuery.matches) {
    if (isIntroSectionHash) {
      event.preventDefault();
      setMenuState(false, { showTitle: false });

      // Apply hash on the next paint frames after close state is committed.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (window.location.hash !== href) {
            window.location.hash = href;
          }
        });
      });
      return;
    }

    setMenuState(false, { showTitle: false });
  }
}

function handleDocumentKeydown(event) {
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
      introFocusCustomThemeOption(1);
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

  if (event.key !== "Escape" || !mobileQuery.matches || !isMenuOpen) {
    return;
  }

  event.preventDefault();
  setMenuState(false, { returnFocus: true });
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

if (menu && navlinks) {
  initIntroThemeSwitcher();
  menu.addEventListener("click", toggleMenu);
  navlinks.addEventListener("click", handleNavLinkClick);
  navlinks.addEventListener("focusin", handleNavFocusIn);
  navlinks.addEventListener("focusout", handleNavFocusOut);
  menu.addEventListener("focusin", handleNavFocusIn);
  menu.addEventListener("focusout", handleNavFocusOut);
  document.addEventListener("keydown", handleDocumentKeydown);
  document.addEventListener("click", (event) => {
    if (!mobileQuery.matches || !isMenuOpen) {
      return;
    }

    if (event.target.closest(".back-to-top")) {
      setMenuState(false);
    }
  });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else {
    mobileQuery.addListener(handleViewportChange);
  }

  handleViewportChange();
  clearSectionHashOnClosedLoad();
}
