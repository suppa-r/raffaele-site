/* global Lenis */

let lenis;

let lastInitTimestamp = 0;
let introInitState = "idle";
let introInitScheduled = false;
const INIT_DEDUPE_WINDOW_MS = 450;
const THEME_REPLAY_DELAY_MS = 100;
const INTRO_PAGE_SELECTOR = 'body[data-page="intro"]';
const INTRO_ANIMATION_TARGET =
  'body[data-page="intro"] main p:not(.wrapper-gradient-text)';
const WRAPPER_GRADIENT_TARGET =
  'body[data-page="intro"] .wrapper-gradient-text';
const WRAPPER_GRADIENT_WORD_TARGET =
  'body[data-page="intro"] .wrapper-gradient-text .text-layer';
const INTRO_WORDS_TARGET = 'body[data-page="intro"] .text-with-animation span';
const INTRO_HEADER_TARGET = 'body[data-page="intro"] header';
const HERO_REVEAL_DELAY_INTRO = 0.08;
const INTRO_TEXT_REVEAL_DURATION = 0.72;
const INTRO_TEXT_REVEAL_EASE = "power2.out";
const INTRO_TEXT_REVEAL_STAGGER = 0.2;
const INTRO_TEXT_REVEAL_OFFSET = 10;
const INTRO_HEADER_REVEAL_DELAY = 0.05;

if (typeof document !== "undefined") {
  document.documentElement.classList.add("js-intro-anim");
}

function hasElements(selector) {
  return !!document.querySelector(selector);
}

function isIntroPage() {
  return !!document.querySelector(INTRO_PAGE_SELECTOR);
}

function isClassicIntroPage() {
  return isIntroPage() && hasElements(WRAPPER_GRADIENT_TARGET);
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
      INTRO_WORDS_TARGET,
      WRAPPER_GRADIENT_TARGET,
      WRAPPER_GRADIENT_WORD_TARGET,
      INTRO_HEADER_TARGET,
    ].forEach((target) => gsapLib.killTweensOf(target));
  }

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

  if (hasElements(INTRO_HEADER_TARGET)) {
    document.querySelectorAll(INTRO_HEADER_TARGET).forEach((element) => {
      element.style.opacity = "";
      element.style.transform = "";
    });
  }
}

function initializeAnimations() {
  if (!document.querySelector(INTRO_ANIMATION_TARGET)) return;

  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  resetIntroAnimationState();
  if (!gsapLib) {
    revealIntroContent();
    return;
  }

  if (hasElements(INTRO_HEADER_TARGET)) {
    gsapLib.set(INTRO_HEADER_TARGET, { y: INTRO_TEXT_REVEAL_OFFSET, opacity: 0 });
    gsapLib.to(INTRO_HEADER_TARGET, {
      y: 0,
      opacity: 1,
      duration: INTRO_TEXT_REVEAL_DURATION,
      ease: INTRO_TEXT_REVEAL_EASE,
      delay: INTRO_HEADER_REVEAL_DELAY,
      overwrite: "auto",
    });
  }

  gsapLib.set(WRAPPER_GRADIENT_WORD_TARGET, { x: 0, y: 0, opacity: 1 });

  const contentTimeline = gsapLib.timeline({
    delay: HERO_REVEAL_DELAY_INTRO,
    defaults: { ease: INTRO_TEXT_REVEAL_EASE, overwrite: "auto" },
  });
  const headingTarget = WRAPPER_GRADIENT_TARGET;

  if (hasElements(headingTarget)) {
    contentTimeline.fromTo(headingTarget, {
      x: 0,
      y: INTRO_TEXT_REVEAL_OFFSET,
      opacity: 0,
    }, {
      x: 0,
      y: 0,
      opacity: 1,
      duration: INTRO_TEXT_REVEAL_DURATION,
    });
  }

  document.querySelectorAll(INTRO_ANIMATION_TARGET).forEach((paragraph) => {
    contentTimeline.fromTo(paragraph, { y: INTRO_TEXT_REVEAL_OFFSET, opacity: 0 }, {
      y: 0,
      opacity: 1,
      visibility: "visible",
      duration: INTRO_TEXT_REVEAL_DURATION,
    }, `<+=${INTRO_TEXT_REVEAL_STAGGER}`);
  });

  // Remove any inline overflow styles from .text-layer elements
  document.querySelectorAll(".text-layer").forEach((el) => {
    el.style.overflow = "";
  });
}

function revealIntroContent() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (gsapLib) {
    if (hasElements(INTRO_ANIMATION_TARGET)) {
      gsapLib.set(INTRO_ANIMATION_TARGET, { opacity: 1, visibility: "visible" });
    }

    if (hasElements(WRAPPER_GRADIENT_TARGET)) {
      gsapLib.set(WRAPPER_GRADIENT_TARGET, { x: 0, opacity: 1, visibility: "visible" });
    }

    if (hasElements(WRAPPER_GRADIENT_WORD_TARGET)) {
      gsapLib.set(WRAPPER_GRADIENT_WORD_TARGET, { x: 0, opacity: 1, visibility: "visible" });
    }

    if (hasElements(INTRO_WORDS_TARGET)) {
      gsapLib.set(INTRO_WORDS_TARGET, { x: 0, opacity: 1, visibility: "visible" });
    }

    if (hasElements(INTRO_HEADER_TARGET)) {
      gsapLib.set(INTRO_HEADER_TARGET, { y: 0, opacity: 1 });
    }

    return;
  }

  document.querySelectorAll(INTRO_ANIMATION_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.visibility = "visible";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.visibility = "visible";
    el.style.transform = "translateX(0)";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_WORD_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.visibility = "visible";
    el.style.transform = "translateX(0)";
  });

  document.querySelectorAll(INTRO_WORDS_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.visibility = "visible";
    el.style.transform = "translateX(0)";
  });
}

function hideIntroContent() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (gsapLib) {
    if (hasElements(INTRO_ANIMATION_TARGET)) {
      gsapLib.set(INTRO_ANIMATION_TARGET, { opacity: 0 });
    }

    if (hasElements(WRAPPER_GRADIENT_TARGET)) {
      gsapLib.set(WRAPPER_GRADIENT_TARGET, { x: "100vw", opacity: 0 });
    }

    if (hasElements(WRAPPER_GRADIENT_WORD_TARGET)) {
      gsapLib.set(WRAPPER_GRADIENT_WORD_TARGET, { x: "100vw", opacity: 0 });
    }

    if (hasElements(INTRO_WORDS_TARGET)) {
      gsapLib.set(INTRO_WORDS_TARGET, { x: "100vw", opacity: 0 });
    }

    if (hasElements(INTRO_HEADER_TARGET)) {
      gsapLib.set(INTRO_HEADER_TARGET, { y: "-18vh", opacity: 0 });
    }

    return;
  }

  document.querySelectorAll(INTRO_ANIMATION_TARGET).forEach((el) => {
    el.style.opacity = "0";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_TARGET).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateX(100vw)";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_WORD_TARGET).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateX(100vw)";
  });

  document.querySelectorAll(INTRO_WORDS_TARGET).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateX(100vw)";
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

function replayClassicIntroAnimationsForTheme() {
  if (!isClassicIntroPage()) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initializeAnimations();
    });
  });
}

scheduleIntroInit();
document.addEventListener("DOMContentLoaded", scheduleIntroInit);
document.addEventListener("page:transitioned", scheduleIntroInit);
document.addEventListener("theme:transition:start", () => {
  if (isClassicIntroPage()) {
    hideIntroContent();
  }
});
document.addEventListener(
  "theme:transitioned",
  replayClassicIntroAnimationsForTheme,
);
