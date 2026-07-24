const menu = document.querySelector(".bars");
const navlinks = document.querySelector(".nav-links");
const pageTitle = document.querySelector(".intro-1-page-title");
const mobileQuery = window.matchMedia("(max-width: 768px)");
const firstNavLink = navlinks ? navlinks.querySelector("a[href]") : null;
const introThemeAnnouncement = document.getElementById("theme-announcement");
const INTRO_VALID_THEMES = ["dark", "auto"];
const INTRO_COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const INTRO_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const INTRO_THEME_TRANSITION_CLASS = "theme-transitioning";
const INTRO_THEME_BUTTON_PULSE_CLASS = "is-tapped";
const INTRO_THEME_BUTTON_PULSE_MS = 520;
const INTRO_THEME_TRANSITION_START_DELAY_MS = 820;
const INTRO_NAV_CLOSE_HIDE_FALLBACK_MS = 320;
const introSectionHashes = new Set(
  Array.from(
    document.querySelectorAll("main > section[id]"),
    (section) => `#${section.id}`,
  ),
);

let isMenuOpen = false;
let introThemeTransitionTimeoutId = null;
let introThemeButtonPulseTimeoutId = null;
let introThemeTransitionStartTimeoutId = null;
let introNavHideTimeoutId = null;

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
  if (theme !== "auto") {
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
}

function introAnnounceTheme(theme) {
  if (!introThemeAnnouncement) {
    return;
  }

  introThemeAnnouncement.textContent =
    theme === "auto" ? "Theme set to device preference" : "Theme set to dark";
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

function introRunThemeTransition(theme, announce) {
  document.documentElement.classList.add(INTRO_THEME_TRANSITION_CLASS);

  if (document.startViewTransition) {
    try {
      const transition = document.startViewTransition(() => {
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
    clearTimeout(introThemeTransitionStartTimeoutId);
    return;
  }

  if (!withTransition || introIsReducedMotionPreferred()) {
    clearTimeout(introThemeTransitionStartTimeoutId);
    introApplyTheme(theme, announce);
    return;
  }

  clearTimeout(introThemeTransitionStartTimeoutId);
  introThemeTransitionStartTimeoutId = setTimeout(() => {
    introRunThemeTransition(theme, announce);
  }, INTRO_THEME_TRANSITION_START_DELAY_MS);
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
  if (introGetStoredTheme() !== "auto") {
    return;
  }

  introSetTheme("auto", { announce: false, withTransition: false });
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

  setPageTitleVisibility(false);

  if (mobileQuery.matches) {
    setMenuState(false, { showTitle: false });
  }
}

function handleDocumentKeydown(event) {
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
