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
  'body[data-page="intro"] main p:not(.wrapper-gradient-text)';
const WRAPPER_GRADIENT_TARGET =
  'body[data-page="intro"] .wrapper-gradient-text';
const WRAPPER_GRADIENT_WORD_TARGET =
  'body[data-page="intro"] .wrapper-gradient-text .text-layer';
const INTRO_WORDS_TARGET = 'body[data-page="intro"] .text-with-animation span';
const HERO_TEXT_EASE_INTRO = "cubic-bezier(0.22, 1, 0.36, 1)";
const HERO_REVEAL_DURATION_INTRO = 1.4;
const HERO_REVEAL_STAGGER_INTRO = 0.28;
const HERO_REVEAL_DELAY_INTRO = 0.14;

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
}

function initializeAnimations() {
  if (!document.querySelector(INTRO_ANIMATION_TARGET)) return;

  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  resetIntroAnimationState();
  if (!gsapLib || typeof SplitType === "undefined") {
    revealIntroContent();
    return;
  }

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
    duration: 0.9,
    stagger: 0.16,
    ease: "power3.out",
    delay: 0.12,
  });

  // Fade in the parent paragraphs at the same time
  gsapLib.to(INTRO_ANIMATION_TARGET, {
    opacity: 1,
    duration: 0.55,
    ease: "power2.out",
    delay: 0.08,
  });

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
}

function initPage() {
  if (introInitState === "running" || introInitState === "done") {
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
  if (
    introInitScheduled ||
    introInitState === "running" ||
    introInitState === "done"
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
