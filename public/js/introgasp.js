/* global SplitType, Lenis */

let lenis;
let splitInstance;

let lastInitTimestamp = 0;
let introInitState = "idle";
let introInitScheduled = false;
const INIT_DEDUPE_WINDOW_MS = 450;
const THEME_REPLAY_DELAY_MS = 100;
const INTRO_PAGE_SELECTOR = 'body[data-page="intro"]';
const INTRO_ANIMATION_TARGET =
  'body[data-page="intro"] main p:not(.wrapper-gradient-text):not([data-simple-reveal])';
const WRAPPER_GRADIENT_TARGET =
  'body[data-page="intro"] .wrapper-gradient-text';
const WRAPPER_GRADIENT_WORD_TARGET =
  'body[data-page="intro"] .wrapper-gradient-text .text-layer';
const INTRO_WORDS_TARGET = 'body[data-page="intro"] .text-with-animation span';
const HERO_TEXT_EASE_INTRO = "cubic-bezier(0.22, 1, 0.36, 1)";
const HERO_REVEAL_DURATION_INTRO = 2.2;
const HERO_REVEAL_STAGGER_INTRO = 0.55;
const HERO_REVEAL_DELAY_INTRO = 3.2;
const NAV_ITEMS_TARGET = 'body[data-page="intro"] header .nav-links .nav__item';
const FOOTER_ENTRIES_TARGET = 'body[data-page="intro"] footer.footer > *';
const PAGE_TITLE_LINE_TARGET =
  'body[data-page="intro"] .intro-1-page-title .title-line';
const PAGE_TITLE_LINE_FIRST_TARGET = `${PAGE_TITLE_LINE_TARGET}:first-of-type`;
const PAGE_TITLE_LINE_SECOND_TARGET = `${PAGE_TITLE_LINE_TARGET}:last-of-type`;
const PROFILE_TITLE_SPAN_TARGET = ".profile-title span";
const NAV_REVEAL_DURATION_INTRO = 0.9;
const NAV_REVEAL_STAGGER_INTRO = 0.1;
const NAV_REVEAL_DELAY_INTRO = 0.05;
const FOOTER_REVEAL_DURATION_INTRO = 0.6;
const FOOTER_REVEAL_STAGGER_INTRO = 0.1;
const FOOTER_REVEAL_DELAY_INTRO = 1.8;
const PAGE_TITLE_LINE_DURATION_INTRO = 1.6;
const PAGE_TITLE_LINE_SECOND_DURATION_INTRO = 0.9;
const PAGE_TITLE_LINE_STAGGER_INTRO = 1.1;
const PAGE_TITLE_LINE_DELAY_INTRO = 0.3;
const PROFILE_TITLE_REVEAL_DURATION_INTRO = 1.6;

if (typeof document !== "undefined") {
  document.documentElement.classList.add("js-intro-anim");
}

function hasElements(selector) {
  return !!document.querySelector(selector);
}

function isIntroPage() {
  return !!document.querySelector(INTRO_PAGE_SELECTOR);
}

function initializeLenis() {
  if (typeof Lenis === "undefined") {
    return;
  }

  if (lenis) {
    lenis.destroy();
  }

  lenis = new Lenis({
    autoRaf: true,
    smoothWheel: true,
  });
}

function resetIntroAnimationState() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;

  if (gsapLib) {
    [
      INTRO_ANIMATION_TARGET,
      `${INTRO_ANIMATION_TARGET} .line`,
      `${INTRO_ANIMATION_TARGET} .line span`,
      INTRO_WORDS_TARGET,
      WRAPPER_GRADIENT_TARGET,
      WRAPPER_GRADIENT_WORD_TARGET,
      NAV_ITEMS_TARGET,
      FOOTER_ENTRIES_TARGET,
      PAGE_TITLE_LINE_TARGET,
    ].forEach((target) => gsapLib.killTweensOf(target));
  }

  if (splitInstance) {
    splitInstance.revert();
    splitInstance = null;
  }

  document
    .querySelectorAll(`${INTRO_ANIMATION_TARGET} .line`)
    .forEach((line) => {
      line.style.display = "";
      line.style.overflow = "";
    });

  document
    .querySelectorAll(`${INTRO_ANIMATION_TARGET} .line span`)
    .forEach((span) => {
      span.style.transform = "";
      span.style.opacity = "";
      span.style.removeProperty("transform");
      span.style.removeProperty("opacity");
    });

  document.querySelectorAll(INTRO_ANIMATION_TARGET).forEach((element) => {
    element.style.opacity = "";
    element.style.transform = "";
  });

  document
    .querySelectorAll(
      `${WRAPPER_GRADIENT_TARGET}, ${WRAPPER_GRADIENT_WORD_TARGET}, ${INTRO_WORDS_TARGET}`,
    )
    .forEach((element) => {
      element.style.opacity = "";
      element.style.transform = "";
    });

  document
    .querySelectorAll(
      `${NAV_ITEMS_TARGET}, ${FOOTER_ENTRIES_TARGET}, ${PAGE_TITLE_LINE_TARGET}`,
    )
    .forEach((element) => {
      element.style.opacity = "";
      element.style.transform = "";
    });
}

function initializeAnimations() {
  const hasParagraphTarget = !!document.querySelector(INTRO_ANIMATION_TARGET);
  const hasAnyTarget =
    hasParagraphTarget ||
    hasElements(NAV_ITEMS_TARGET) ||
    hasElements(FOOTER_ENTRIES_TARGET) ||
    hasElements(PAGE_TITLE_LINE_TARGET);
  if (!hasAnyTarget) return;

  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  resetIntroAnimationState();
  if (!gsapLib) {
    revealIntroContent();
    return;
  }

  if (hasParagraphTarget && typeof SplitType !== "undefined") {
    if (splitInstance) {
      splitInstance.revert();
      splitInstance = null;
    }

    splitInstance = new SplitType(INTRO_ANIMATION_TARGET, {
      types: "lines",
      tagName: "div",
      lineClass: "line",
    });

    splitInstance.lines.forEach((line) => {
      const content = line.innerHTML;
      line.innerHTML = `<span>${content}</span>`;
    });

    // .line is the clip container; .line span starts below and reveals upward
    gsapLib.set(`${INTRO_ANIMATION_TARGET} .line`, {
      display: "block",
      overflow: "hidden",
    });

    gsapLib.set(`${INTRO_ANIMATION_TARGET} .line span`, {
      y: "100%",
      opacity: 0,
    });

    gsapLib.to(`${INTRO_ANIMATION_TARGET} .line span`, {
      y: "0%",
      opacity: 1,
      duration: 1.6,
      stagger: 1.1,
      ease: "power3.out",
      delay: 0.3,
    });

    // Fade in the parent paragraphs slightly ahead of the lines
    gsapLib.to(INTRO_ANIMATION_TARGET, {
      opacity: 1,
      duration: 1,
      ease: "power2.out",
      delay: 0.15,
    });
  }

  // Match the side-entry feel used by the hero text animation.
  if (hasElements(INTRO_WORDS_TARGET)) {
    gsapLib.to(INTRO_WORDS_TARGET, {
      x: 0,
      opacity: 1,
      visibility: "visible",
      duration: HERO_REVEAL_DURATION_INTRO,
      ease: HERO_TEXT_EASE_INTRO,
      delay: HERO_REVEAL_DELAY_INTRO,
      stagger: HERO_REVEAL_STAGGER_INTRO,
      overwrite: "auto",
    });
  }

  // Match the side-entry feel used by the hero text animation.
  if (hasElements(WRAPPER_GRADIENT_WORD_TARGET)) {
    gsapLib.to(WRAPPER_GRADIENT_WORD_TARGET, {
      x: 0,
      opacity: 1,
      duration: HERO_REVEAL_DURATION_INTRO,
      ease: HERO_TEXT_EASE_INTRO,
      delay: HERO_REVEAL_DELAY_INTRO,
      stagger: HERO_REVEAL_STAGGER_INTRO,
      overwrite: "auto",
    });
  } else if (hasElements(WRAPPER_GRADIENT_TARGET)) {
    gsapLib.to(WRAPPER_GRADIENT_TARGET, {
      x: 0,
      opacity: 1,
      duration: HERO_REVEAL_DURATION_INTRO,
      ease: HERO_TEXT_EASE_INTRO,
      delay: HERO_REVEAL_DELAY_INTRO,
      overwrite: "auto",
    });
  }

  // Duplicate the same line-reveal entrance on the nav links and footer entries
  if (hasElements(NAV_ITEMS_TARGET)) {
    gsapLib.to(NAV_ITEMS_TARGET, {
      y: 0,
      opacity: 1,
      duration: NAV_REVEAL_DURATION_INTRO,
      ease: "power3.out",
      stagger: NAV_REVEAL_STAGGER_INTRO,
      delay: NAV_REVEAL_DELAY_INTRO,
      overwrite: "auto",
    });
  }

  if (hasElements(FOOTER_ENTRIES_TARGET)) {
    gsapLib.to(FOOTER_ENTRIES_TARGET, {
      y: 0,
      opacity: 1,
      duration: FOOTER_REVEAL_DURATION_INTRO,
      ease: "power3.out",
      stagger: FOOTER_REVEAL_STAGGER_INTRO,
      delay: FOOTER_REVEAL_DELAY_INTRO,
      overwrite: "auto",
    });
  }

  // Same reliable opacity/translateY reveal used for the footer, applied to the page-title lines
  if (hasElements(PAGE_TITLE_LINE_TARGET)) {
    gsapLib.to(PAGE_TITLE_LINE_FIRST_TARGET, {
      y: 0,
      opacity: 1,
      duration: PAGE_TITLE_LINE_DURATION_INTRO,
      ease: "power3.out",
      delay: PAGE_TITLE_LINE_DELAY_INTRO,
      overwrite: "auto",
    });

    // The LISTEN line enters at the same moment but resolves faster
    gsapLib.to(PAGE_TITLE_LINE_SECOND_TARGET, {
      y: 0,
      opacity: 1,
      duration: PAGE_TITLE_LINE_SECOND_DURATION_INTRO,
      ease: "power3.out",
      delay: PAGE_TITLE_LINE_DELAY_INTRO + PAGE_TITLE_LINE_STAGGER_INTRO,
      overwrite: "auto",
    });
  }

  // Remove any inline overflow styles from .text-layer elements
  document.querySelectorAll(".text-layer").forEach((el) => {
    el.style.overflow = "";
  });
}

function revealIntroContent() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (gsapLib) {
    if (hasElements(INTRO_ANIMATION_TARGET)) {
      gsapLib.set(INTRO_ANIMATION_TARGET, { opacity: 1 });
    }

    if (hasElements(WRAPPER_GRADIENT_TARGET)) {
      gsapLib.set(WRAPPER_GRADIENT_TARGET, { x: 0, opacity: 1 });
    }

    if (hasElements(WRAPPER_GRADIENT_WORD_TARGET)) {
      gsapLib.set(WRAPPER_GRADIENT_WORD_TARGET, { x: 0, opacity: 1 });
    }

    if (hasElements(INTRO_WORDS_TARGET)) {
      gsapLib.set(INTRO_WORDS_TARGET, { x: 0, opacity: 1 });
    }

    if (hasElements(NAV_ITEMS_TARGET)) {
      gsapLib.set(NAV_ITEMS_TARGET, { y: 0, opacity: 1 });
    }

    if (hasElements(FOOTER_ENTRIES_TARGET)) {
      gsapLib.set(FOOTER_ENTRIES_TARGET, { y: 0, opacity: 1 });
    }

    if (hasElements(PAGE_TITLE_LINE_TARGET)) {
      gsapLib.set(PAGE_TITLE_LINE_TARGET, { y: 0, opacity: 1 });
    }

    return;
  }

  document.querySelectorAll(INTRO_ANIMATION_TARGET).forEach((el) => {
    el.style.opacity = "1";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "translateX(0)";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_WORD_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "translateX(0)";
  });

  document.querySelectorAll(INTRO_WORDS_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "translateX(0)";
  });

  document
    .querySelectorAll(
      `${NAV_ITEMS_TARGET}, ${FOOTER_ENTRIES_TARGET}, ${PAGE_TITLE_LINE_TARGET}`,
    )
    .forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
}

function hideIntroContent() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (gsapLib) {
    if (hasElements(INTRO_ANIMATION_TARGET)) {
      gsapLib.set(INTRO_ANIMATION_TARGET, { opacity: 0 });
    }

    if (hasElements(WRAPPER_GRADIENT_TARGET)) {
      gsapLib.set(WRAPPER_GRADIENT_TARGET, { x: "-7vw", opacity: 0 });
    }

    if (hasElements(WRAPPER_GRADIENT_WORD_TARGET)) {
      gsapLib.set(WRAPPER_GRADIENT_WORD_TARGET, { x: "-7vw", opacity: 0 });
    }

    if (hasElements(INTRO_WORDS_TARGET)) {
      gsapLib.set(INTRO_WORDS_TARGET, { x: "-7vw", opacity: 0 });
    }

    if (hasElements(NAV_ITEMS_TARGET)) {
      gsapLib.set(NAV_ITEMS_TARGET, { y: 16, opacity: 0 });
    }

    if (hasElements(FOOTER_ENTRIES_TARGET)) {
      gsapLib.set(FOOTER_ENTRIES_TARGET, { y: 16, opacity: 0 });
    }

    if (hasElements(PAGE_TITLE_LINE_TARGET)) {
      gsapLib.set(PAGE_TITLE_LINE_TARGET, { y: 16, opacity: 0 });
    }

    return;
  }

  document.querySelectorAll(INTRO_ANIMATION_TARGET).forEach((el) => {
    el.style.opacity = "0";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_TARGET).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-7vw)";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_WORD_TARGET).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-7vw)";
  });

  document.querySelectorAll(INTRO_WORDS_TARGET).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-7vw)";
  });

  document
    .querySelectorAll(
      `${NAV_ITEMS_TARGET}, ${FOOTER_ENTRIES_TARGET}, ${PAGE_TITLE_LINE_TARGET}`,
    )
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
    });
}

function initPage() {
  if (introInitState === "running") {
    return;
  }

  if (!isIntroPage()) {
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
    if (splitInstance) {
      splitInstance.revert();
      splitInstance = null;
    }
    introInitState = "idle";
    return;
  }

  if (introInitState === "done") {
    return;
  }

  introInitState = "running";

  const now = Date.now();
  if (now - lastInitTimestamp < INIT_DEDUPE_WINDOW_MS) {
    return;
  }

  lastInitTimestamp = now;

  try {
    hideIntroContent();
    initializeLenis();
    initializeAnimations();
    introInitState = "done";
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Intro animation init failed:", error);
    introInitState = "idle";
    revealIntroContent();
  }
}

function scheduleIntroInit() {
  const currentlyIntroPage = isIntroPage();

  if (
    introInitScheduled ||
    introInitState === "running" ||
    (introInitState === "done" && currentlyIntroPage)
  ) {
    return;
  }

  introInitScheduled = true;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        introInitScheduled = false;
        initPage();
      }, THEME_REPLAY_DELAY_MS);
    });
  });
}

scheduleIntroInit();
document.addEventListener("DOMContentLoaded", scheduleIntroInit);
document.addEventListener("page:transitioned", scheduleIntroInit);

// Duplicate the same gasp reveal on the profile-title span of the section that becomes active
function revealActiveProfileTitle() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (!gsapLib || !window.location.hash) return;

  const titleSpan = document.querySelector(
    `${window.location.hash} ${PROFILE_TITLE_SPAN_TARGET}`,
  );
  if (!titleSpan) return;

  gsapLib.killTweensOf(titleSpan);
  gsapLib.fromTo(
    titleSpan,
    { y: "60%", opacity: 0 },
    {
      y: "0%",
      opacity: 1,
      duration: PROFILE_TITLE_REVEAL_DURATION_INTRO,
      ease: "power3.out",
      delay: 0.05,
      overwrite: "auto",
    },
  );
}

window.addEventListener("hashchange", revealActiveProfileTitle);
document.addEventListener("DOMContentLoaded", revealActiveProfileTitle);
document.addEventListener("page:transitioned", revealActiveProfileTitle);
