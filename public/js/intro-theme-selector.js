const INTRO_THEME_VALUES = ["light", "dark", "system"];
const INTRO_THEME_COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const INTRO_THEME_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const INTRO_THEME_TRANSITION_CLASS = "theme-transitioning";
const INTRO_THEME_VISUAL_TOGGLE_CLASS = "theme-visual-swap";
const INTRO_THEME_SELECTOR_ROOT = "[data-theme-selector]";
const INTRO_THEME_SELECTOR_TRIGGER = "[data-theme-selector-trigger]";
const INTRO_THEME_SELECTOR_OPTION = "[data-theme-option]";
const INTRO_THEME_SELECTOR_MENU = "[data-theme-selector-menu]";
const INTRO_THEME_FAVICONS = {
  dark: "/favicons/web-app-manifest-192x192.png",
  light: "/favicons/favicon-96x96.png",
};

let introThemeTransitionTimeoutId = null;
let introThemeVisualSwapState = false;
let introThemeDocumentEventsAttached = false;
let introThemeSystemQueryAttached = false;

function isIntroThemePage() {
  return !!document.querySelector(INTRO_THEME_SELECTOR_ROOT);
}

function isIntroThemeReducedMotionPreferred() {
  return window.matchMedia(INTRO_THEME_REDUCED_MOTION_QUERY).matches;
}

function getIntroStoredTheme() {
  try {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "auto") {
      saveIntroTheme("system");
      return "system";
    }
    return INTRO_THEME_VALUES.includes(savedTheme) ? savedTheme : "system";
  } catch {
    return "system";
  }
}

function saveIntroTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Ignore storage failures in private mode.
  }
}

function resolveIntroTheme(theme) {
  return theme === "system"
    ? window.matchMedia(INTRO_THEME_COLOR_SCHEME_QUERY).matches
      ? "dark"
      : "light"
    : theme;
}

function getIntroThemeSelectorElements() {
  const root = document.querySelector(INTRO_THEME_SELECTOR_ROOT);
  if (!root) {
    return {};
  }

  return {
    root,
    trigger: root.querySelector(INTRO_THEME_SELECTOR_TRIGGER),
    menu: root.querySelector(INTRO_THEME_SELECTOR_MENU),
    options: [...root.querySelectorAll(INTRO_THEME_SELECTOR_OPTION)],
  };
}

function closeIntroThemeSelector({ returnFocus = false } = {}) {
  const { root, trigger, menu } = getIntroThemeSelectorElements();
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

function openIntroThemeSelector() {
  const { root, trigger, menu } = getIntroThemeSelectorElements();
  if (!root || !trigger || !menu) {
    return;
  }

  root.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  menu.hidden = false;
}

function syncIntroThemeSelector(theme) {
  const { root, options, trigger } = getIntroThemeSelectorElements();
  if (!root || !trigger || options.length === 0) {
    return;
  }

  const selectedTheme = INTRO_THEME_VALUES.includes(theme) ? theme : "system";
  const selectedOption = options.find(
    (option) => option.dataset.themeOption === selectedTheme,
  );

  options.forEach((option) => {
    option.setAttribute(
      "aria-selected",
      option === selectedOption ? "true" : "false",
    );
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

function updateIntroThemeControls(theme) {
  document.querySelectorAll("button[data-theme-toggle]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      button.dataset.themeToggle === theme ? "true" : "false",
    );
  });

  const nativeSelector = document.getElementById("theme-selector");
  if (nativeSelector instanceof HTMLSelectElement) {
    nativeSelector.value = INTRO_THEME_VALUES.includes(theme)
      ? theme
      : "system";
  }

  syncIntroThemeSelector(theme);
}

function announceIntroTheme(theme) {
  const announcement = document.getElementById("theme-announcement");
  if (!announcement) {
    return;
  }

  announcement.textContent =
    theme === "system"
      ? "Theme set to device preference"
      : `Theme set to ${theme}`;
}

function updateIntroThemeFavicon(resolvedTheme) {
  const favicon =
    document.getElementById("favicon") ||
    document.querySelector('link[rel="icon"]');
  if (favicon) {
    favicon.href =
      INTRO_THEME_FAVICONS[resolvedTheme] || INTRO_THEME_FAVICONS.light;
  }
}

function applyIntroThemeState(resolvedTheme, theme, announce) {
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  saveIntroTheme(theme);
  updateIntroThemeFavicon(resolvedTheme);
  updateIntroThemeControls(theme);

  if (announce) {
    announceIntroTheme(theme);
  }
}

function setIntroTheme(theme, options = {}) {
  const { announce = true, withTransition = true } = options;
  if (!INTRO_THEME_VALUES.includes(theme)) {
    return;
  }

  const resolvedTheme = resolveIntroTheme(theme);
  if (
    document.documentElement.getAttribute("data-theme") === resolvedTheme &&
    getIntroStoredTheme() === theme
  ) {
    updateIntroThemeControls(theme);
    return;
  }

  if (!withTransition || isIntroThemeReducedMotionPreferred()) {
    document.dispatchEvent(new Event("theme:transition:start"));
    applyIntroThemeState(resolvedTheme, theme, announce);
    document.dispatchEvent(new Event("theme:transitioned"));
    return;
  }

  clearTimeout(introThemeTransitionTimeoutId);
  document.documentElement.classList.add(INTRO_THEME_TRANSITION_CLASS);
  document.dispatchEvent(new Event("theme:transition:start"));

  if (document.startViewTransition) {
    try {
      const transition = document.startViewTransition(() => {
        introThemeVisualSwapState = !introThemeVisualSwapState;
        document.documentElement.classList.toggle(
          INTRO_THEME_VISUAL_TOGGLE_CLASS,
          introThemeVisualSwapState,
        );
        applyIntroThemeState(resolvedTheme, theme, announce);
      });

      transition.finished
        .catch(() => {})
        .finally(() => {
          document.dispatchEvent(new Event("theme:transitioned"));
          introThemeTransitionTimeoutId = setTimeout(() => {
            document.documentElement.classList.remove(
              INTRO_THEME_TRANSITION_CLASS,
            );
          }, 0);
        });
      return;
    } catch {
      document.documentElement.classList.remove(INTRO_THEME_TRANSITION_CLASS);
    }
  }

  applyIntroThemeState(resolvedTheme, theme, announce);
  document.dispatchEvent(new Event("theme:transitioned"));
  introThemeTransitionTimeoutId = setTimeout(() => {
    document.documentElement.classList.remove(INTRO_THEME_TRANSITION_CLASS);
  }, 0);
}

function focusIntroThemeOption(direction = 1) {
  const { options } = getIntroThemeSelectorElements();
  if (!options || options.length === 0) {
    return;
  }

  const activeIndex = options.indexOf(document.activeElement);
  const selectedIndex = options.findIndex(
    (option) => option.getAttribute("aria-selected") === "true",
  );
  const startIndex =
    activeIndex >= 0 ? activeIndex : Math.max(selectedIndex, 0);
  options[(startIndex + direction + options.length) % options.length]?.focus();
}

function focusSelectedIntroThemeOption() {
  const { options } = getIntroThemeSelectorElements();
  options
    ?.find((option) => option.getAttribute("aria-selected") === "true")
    ?.focus() || options?.[0]?.focus();
}

function selectIntroThemeOption(option) {
  const theme = option?.dataset.themeOption;
  if (!INTRO_THEME_VALUES.includes(theme)) {
    return;
  }
  setIntroTheme(theme);
}

function handleIntroThemeClick(event) {
  if (!isIntroThemePage()) {
    return;
  }

  const option = event.target.closest(INTRO_THEME_SELECTOR_OPTION);
  if (option) {
    event.preventDefault();
    selectIntroThemeOption(option);
    closeIntroThemeSelector({ returnFocus: true });
    return;
  }

  const trigger = event.target.closest(INTRO_THEME_SELECTOR_TRIGGER);
  if (trigger) {
    event.preventDefault();
    if (trigger.getAttribute("aria-expanded") === "true") {
      closeIntroThemeSelector();
    } else {
      openIntroThemeSelector();
      focusSelectedIntroThemeOption();
    }
    return;
  }

  if (!event.target.closest(INTRO_THEME_SELECTOR_ROOT)) {
    closeIntroThemeSelector();
  }

  const legacyButton = event.target.closest("button[data-theme-toggle]");
  if (legacyButton) {
    event.preventDefault();
    setIntroTheme(legacyButton.dataset.themeToggle);
  }
}

function handleIntroThemeKeydown(event) {
  if (!isIntroThemePage()) {
    return;
  }

  const root = document.querySelector(INTRO_THEME_SELECTOR_ROOT);
  const isOpen = root?.classList.contains("is-open") || false;
  const onTrigger = event.target.closest(INTRO_THEME_SELECTOR_TRIGGER) !== null;
  const onOption = event.target.closest(INTRO_THEME_SELECTOR_OPTION) !== null;

  if (isOpen && event.key === "Escape") {
    event.preventDefault();
    closeIntroThemeSelector({ returnFocus: true });
    return;
  }

  if (onTrigger && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    if (event.target.getAttribute("aria-expanded") === "true") {
      closeIntroThemeSelector();
    } else {
      openIntroThemeSelector();
      focusSelectedIntroThemeOption();
    }
    return;
  }

  if (onTrigger && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
    event.preventDefault();
    openIntroThemeSelector();
    focusIntroThemeOption(event.key === "ArrowDown" ? 1 : -1);
    return;
  }

  if (
    isOpen &&
    onOption &&
    (event.key === "ArrowDown" || event.key === "ArrowUp")
  ) {
    event.preventDefault();
    focusIntroThemeOption(event.key === "ArrowDown" ? 1 : -1);
    return;
  }

  if (
    isOpen &&
    (onTrigger || onOption) &&
    (event.key === "Home" || event.key === "End")
  ) {
    event.preventDefault();
    const { options } = getIntroThemeSelectorElements();
    options?.[event.key === "Home" ? 0 : options.length - 1]?.focus();
    return;
  }

  if (isOpen && onOption && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    selectIntroThemeOption(event.target.closest(INTRO_THEME_SELECTOR_OPTION));
    closeIntroThemeSelector({ returnFocus: true });
  }
}

function handleIntroThemeNativeChange(event) {
  if (!isIntroThemePage() || !(event.target instanceof HTMLSelectElement)) {
    return;
  }
  if (event.target.id === "theme-selector") {
    setIntroTheme(event.target.value);
  }
}

function handleIntroThemeSystemChange() {
  if (getIntroStoredTheme() === "system") {
    setIntroTheme("system", { announce: false, withTransition: false });
  }
}

function initIntroThemeSelector() {
  if (!isIntroThemePage()) {
    return;
  }

  setIntroTheme(getIntroStoredTheme(), {
    announce: false,
    withTransition: false,
  });

  if (!introThemeDocumentEventsAttached) {
    introThemeDocumentEventsAttached = true;
    document.addEventListener("click", handleIntroThemeClick);
    document.addEventListener("keydown", handleIntroThemeKeydown);
    document.addEventListener("change", handleIntroThemeNativeChange);
  }

  if (!introThemeSystemQueryAttached) {
    introThemeSystemQueryAttached = true;
    const mediaQueryList = window.matchMedia(INTRO_THEME_COLOR_SCHEME_QUERY);
    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleIntroThemeSystemChange);
    } else {
      mediaQueryList.addListener(handleIntroThemeSystemChange);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initIntroThemeSelector);
} else {
  initIntroThemeSelector();
}

document.addEventListener("page:transitioned", initIntroThemeSelector);
