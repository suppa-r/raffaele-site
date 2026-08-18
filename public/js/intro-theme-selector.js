const INTRO_THEME_CONFIG = {
  values: ["light", "dark", "system"],
  colorSchemeQuery: "(prefers-color-scheme: dark)",
  reducedMotionQuery: "(prefers-reduced-motion: reduce)",
  transitionClass: "theme-transitioning",
  visualToggleClass: "theme-visual-swap",
  selectors: {
    root: "[data-theme-selector]",
    trigger: "[data-theme-selector-trigger]",
    option: "[data-theme-option]",
    menu: "[data-theme-selector-menu]",
  },
  favicons: {
    dark: "/favicons/web-app-manifest-192x192.png",
    light: "/favicons/favicon-96x96.png",
  },
};

let introThemeTransitionTimeoutId = null;
let introThemeVisualSwapState = false;
let introThemeEventsInitialized = false;

const isValidTheme = (t) => INTRO_THEME_CONFIG.values.includes(t);
const reducedMotionPreferred = () =>
  window.matchMedia(INTRO_THEME_CONFIG.reducedMotionQuery).matches;
const getThemePage = () =>
  document.querySelector(INTRO_THEME_CONFIG.selectors.root);
const getThemeElements = () => {
  const root = getThemePage();
  return root
    ? {
      root,
      trigger: root.querySelector(INTRO_THEME_CONFIG.selectors.trigger),
      menu: root.querySelector(INTRO_THEME_CONFIG.selectors.menu),
      options: [...root.querySelectorAll(INTRO_THEME_CONFIG.selectors.option)],
    }
    : {};
};

function getStoredTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "auto") {
      saveTheme("system");
      return "system";
    }
    return isValidTheme(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Ignore storage failures in private mode
  }
}

function resolveTheme(theme) {
  return theme === "system"
    ? window.matchMedia(INTRO_THEME_CONFIG.colorSchemeQuery).matches
      ? "dark"
      : "light"
    : theme;
}

function toggleThemeMenu(open = null) {
  const { root, trigger, menu } = getThemeElements();
  if (!root || !trigger || !menu) return;

  const shouldOpen =
    open !== null ? open : trigger.getAttribute("aria-expanded") !== "true";
  root.classList.toggle("is-open", shouldOpen);
  trigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  menu.hidden = !shouldOpen;

  if (shouldOpen) focusSelectedOption();
}

function syncThemeUI(theme) {
  const { root, options, trigger } = getThemeElements();
  if (!root || !trigger || !options.length) return;

  const selectedTheme = isValidTheme(theme) ? theme : "system";
  const selectedOption = options.find(
    (o) => o.dataset.themeOption === selectedTheme
  );

  options.forEach((o) =>
    o.setAttribute("aria-selected", o === selectedOption ? "true" : "false")
  );

  if (!selectedOption) return;

  const triggerIcon = root.querySelector(".theme-selector-trigger-icon");
  const triggerText = root.querySelector(".theme-selector-trigger-text");
  const optionIcon = selectedOption.querySelector(".theme-option-icon");
  const optionText = selectedOption.querySelector(".theme-option-label");

  if (triggerIcon?.innerHTML && optionIcon?.innerHTML)
    triggerIcon.innerHTML = optionIcon.innerHTML;
  if (triggerText && optionText)
    triggerText.textContent = optionText.textContent;
  if (trigger instanceof HTMLButtonElement && optionText)
    trigger.setAttribute(
      "aria-label",
      `Select color theme, current selection ${optionText.textContent.trim()}`
    );
}

function updateThemeControls(theme) {
  document
    .querySelectorAll("button[data-theme-toggle]")
    .forEach((btn) =>
      btn.setAttribute(
        "aria-pressed",
        btn.dataset.themeToggle === theme ? "true" : "false"
      )
    );

  const selector = document.getElementById("theme-selector");
  if (selector instanceof HTMLSelectElement)
    selector.value = isValidTheme(theme) ? theme : "system";

  syncThemeUI(theme);
}

function announceTheme(theme) {
  const announce = document.getElementById("theme-announcement");
  if (announce) {
    announce.textContent =
      theme === "system"
        ? "Theme set to device preference"
        : `Theme set to ${theme}`;
  }
}

function updateFavicon(resolvedTheme) {
  const favicon =
    document.getElementById("favicon") ||
    document.querySelector('link[rel="icon"]');
  if (favicon)
    favicon.href =
      INTRO_THEME_CONFIG.favicons[resolvedTheme] ||
      INTRO_THEME_CONFIG.favicons.light;
}

function applyTheme(resolvedTheme, theme, announce) {
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  saveTheme(theme);
  updateFavicon(resolvedTheme);
  updateThemeControls(theme);
  if (announce) announceTheme(theme);
}

function focusOption(direction = 1) {
  const { options } = getThemeElements();
  if (!options?.length) return;

  const activeIdx = options.indexOf(document.activeElement);
  const selectedIdx = options.findIndex(
    (o) => o.getAttribute("aria-selected") === "true"
  );
  const startIdx = activeIdx >= 0 ? activeIdx : Math.max(selectedIdx, 0);
  options[(startIdx + direction + options.length) % options.length]?.focus();
}

function focusSelectedOption() {
  const { options } = getThemeElements();
  options?.find((o) => o.getAttribute("aria-selected") === "true")?.focus() ||
    options?.[0]?.focus();
}

function setTheme(theme, { announce = true, withTransition = true } = {}) {
  if (!isValidTheme(theme)) return;

  const resolved = resolveTheme(theme);
  if (
    document.documentElement.getAttribute("data-theme") === resolved &&
    getStoredTheme() === theme
  ) {
    updateThemeControls(theme);
    return;
  }

  if (!withTransition || reducedMotionPreferred()) {
    document.dispatchEvent(new Event("theme:transition:start"));
    applyTheme(resolved, theme, announce);
    document.dispatchEvent(new Event("theme:transitioned"));
    return;
  }

  clearTimeout(introThemeTransitionTimeoutId);
  document.documentElement.classList.add(INTRO_THEME_CONFIG.transitionClass);
  document.dispatchEvent(new Event("theme:transition:start"));

  if (!document.startViewTransition) {
    applyTheme(resolved, theme, announce);
    document.dispatchEvent(new Event("theme:transitioned"));
    introThemeTransitionTimeoutId = setTimeout(
      () =>
        document.documentElement.classList.remove(
          INTRO_THEME_CONFIG.transitionClass
        ),
      0
    );
    return;
  }

  try {
    const transition = document.startViewTransition(() => {
      introThemeVisualSwapState = !introThemeVisualSwapState;
      document.documentElement.classList.toggle(
        INTRO_THEME_CONFIG.visualToggleClass,
        introThemeVisualSwapState
      );
      applyTheme(resolved, theme, announce);
    });

    transition.finished.finally(() => {
      document.dispatchEvent(new Event("theme:transitioned"));
      introThemeTransitionTimeoutId = setTimeout(
        () =>
          document.documentElement.classList.remove(
            INTRO_THEME_CONFIG.transitionClass
          ),
        0
      );
    });
  } catch {
    applyTheme(resolved, theme, announce);
    document.dispatchEvent(new Event("theme:transitioned"));
    document.documentElement.classList.remove(
      INTRO_THEME_CONFIG.transitionClass
    );
  }
}

function selectOption(option) {
  const theme = option?.dataset.themeOption;
  if (!isValidTheme(theme)) return;
  setTheme(theme);
}

function handleClick(e) {
  if (!getThemePage()) return;

  const option = e.target.closest(INTRO_THEME_CONFIG.selectors.option);
  if (option) {
    e.preventDefault();
    selectOption(option);
    toggleThemeMenu(false);
    return;
  }

  const trigger = e.target.closest(INTRO_THEME_CONFIG.selectors.trigger);
  if (trigger) {
    e.preventDefault();
    toggleThemeMenu();
    return;
  }

  if (!e.target.closest(INTRO_THEME_CONFIG.selectors.root)) {
    toggleThemeMenu(false);
  }

  const legacyBtn = e.target.closest("button[data-theme-toggle]");
  if (legacyBtn) {
    e.preventDefault();
    setTheme(legacyBtn.dataset.themeToggle);
  }
}

function handleKeydown(e) {
  if (!getThemePage()) return;

  const root = getThemePage();
  const isOpen = root?.classList.contains("is-open");
  const onTrigger = e.target.closest(INTRO_THEME_CONFIG.selectors.trigger);
  const onOption = e.target.closest(INTRO_THEME_CONFIG.selectors.option);

  if (isOpen && e.key === "Escape") {
    e.preventDefault();
    toggleThemeMenu(false);
    onTrigger?.focus();
    return;
  }

  if (onTrigger && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    toggleThemeMenu();
    return;
  }

  if (
    onTrigger &&
    (e.key === "ArrowDown" || e.key === "ArrowUp")
  ) {
    e.preventDefault();
    if (!isOpen) toggleThemeMenu(true);
    focusOption(e.key === "ArrowDown" ? 1 : -1);
    return;
  }

  if (
    isOpen &&
    onOption &&
    (e.key === "ArrowDown" || e.key === "ArrowUp")
  ) {
    e.preventDefault();
    focusOption(e.key === "ArrowDown" ? 1 : -1);
    return;
  }

  if (
    isOpen &&
    (onTrigger || onOption) &&
    (e.key === "Home" || e.key === "End")
  ) {
    e.preventDefault();
    const { options } = getThemeElements();
    options?.[e.key === "Home" ? 0 : options.length - 1]?.focus();
    return;
  }

  if (isOpen && onOption && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    selectOption(onOption);
    toggleThemeMenu(false);
    onTrigger?.focus();
  }
}

function handleNativeChange(e) {
  if (!getThemePage() || !(e.target instanceof HTMLSelectElement)) return;
  if (e.target.id === "theme-selector") setTheme(e.target.value);
}

function handleSystemChange() {
  if (getStoredTheme() === "system") {
    setTheme("system", { announce: false, withTransition: false });
  }
}

function init() {
  if (!getThemePage()) return;

  setTheme(getStoredTheme(), { announce: false, withTransition: false });

  if (!introThemeEventsInitialized) {
    introThemeEventsInitialized = true;
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("change", handleNativeChange);

    const mql = window.matchMedia(INTRO_THEME_CONFIG.colorSchemeQuery);
    (mql.addEventListener || mql.addListener).call(mql, handleSystemChange);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

document.addEventListener("page:transitioned", init);
