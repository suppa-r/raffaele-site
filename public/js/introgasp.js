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
const INTRO_SPLIT_TARGET =
  'body[data-page="intro"] main p:not(.wrapper-gradient-text, .fancy-quote, .fancy-quote-author)';
const WRAPPER_GRADIENT_TARGET =
  'body[data-page="intro"] .wrapper-gradient-text';
const WRAPPER_GRADIENT_WORD_TARGET =
  'body[data-page="intro"] .wrapper-gradient-text .text-layer';
const INTRO_WORDS_TARGET = 'body[data-page="intro"] .text-with-animation span';
const INTRO_HEADER_TARGET = 'body[data-page="intro"] header';
const HERO_TEXT_EASE_INTRO = "power3.out";
const HERO_REVEAL_DURATION_INTRO = 1.7;
const HERO_REVEAL_STAGGER_INTRO = 0.18;
const HERO_REVEAL_DELAY_INTRO = 0.18;
const INTRO_SLIDE_OFFSET = "-8vh";
const INTRO_PARAGRAPH_DELAY = 0.55;
const INTRO_PARAGRAPH_BEAT = 0.22;
const INTRO_PARAGRAPH_BEAT_GROWTH = 0.012;
const INTRO_PARAGRAPH_DURATION = 0.85;
const INTRO_PARAGRAPH_DURATION_GROWTH = 0.035;
const INTRO_LINE_STAGGER = 0.12;
const INTRO_HEADER_REVEAL_DURATION = 0.9;
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
      `${INTRO_ANIMATION_TARGET} .line`,
      `${INTRO_ANIMATION_TARGET} .line > span`,
      INTRO_WORDS_TARGET,
      WRAPPER_GRADIENT_TARGET,
      WRAPPER_GRADIENT_WORD_TARGET,
      INTRO_HEADER_TARGET,
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
    .querySelectorAll(`${INTRO_ANIMATION_TARGET} .line > span`)
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
  if (
    !gsapLib ||
    typeof SplitType === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    revealIntroContent();
    return;
  }

  if (splitInstance) {
    splitInstance.revert();
    splitInstance = null;
  }

  splitInstance = new SplitType(INTRO_SPLIT_TARGET, {
    types: "lines",
    tagName: "div",
    lineClass: "line",
  });

  if (hasElements(INTRO_HEADER_TARGET)) {
    gsapLib.set(INTRO_HEADER_TARGET, { y: "-18vh", opacity: 0 });
    gsapLib.to(INTRO_HEADER_TARGET, {
      y: 0,
      opacity: 1,
      duration: INTRO_HEADER_REVEAL_DURATION,
      ease: "power3.out",
      delay: INTRO_HEADER_REVEAL_DELAY,
      overwrite: "auto",
    });
  }

  splitInstance.lines.forEach((line) => {
    const content = line.innerHTML;
    line.innerHTML = `<span>${content}</span>`;
  });

  // Clip each line while its content descends into place.
  gsapLib.set(`${INTRO_ANIMATION_TARGET} .line`, {
    display: "block",
    overflow: "hidden",
  });

  document.querySelectorAll(INTRO_ANIMATION_TARGET).forEach((paragraph, index) => {
    const lines = Array.from(paragraph.querySelectorAll(".line"), (line) =>
      line.firstElementChild,
    );
    const targets = lines.length ? lines : paragraph;
    const delay =
      INTRO_PARAGRAPH_DELAY +
      index * INTRO_PARAGRAPH_BEAT +
      (index * (index - 1) * INTRO_PARAGRAPH_BEAT_GROWTH) / 2;

    gsapLib.set(paragraph, { opacity: 1, visibility: "visible" });
    gsapLib.set(targets, {
      y: lines.length ? "-100%" : "-2rem",
      opacity: 0,
    });
    gsapLib.to(targets, {
      y: 0,
      opacity: 1,
      duration: INTRO_PARAGRAPH_DURATION + index * INTRO_PARAGRAPH_DURATION_GROWTH,
      stagger: INTRO_LINE_STAGGER,
      ease: HERO_TEXT_EASE_INTRO,
      delay,
      overwrite: "auto",
    });
  });

  gsapLib.set(WRAPPER_GRADIENT_TARGET, { x: 0, y: 0, opacity: 1 });

  gsapLib.set(WRAPPER_GRADIENT_WORD_TARGET, {
    x: 0,
    y: INTRO_SLIDE_OFFSET,
    opacity: 0,
  });

  if (hasElements(INTRO_WORDS_TARGET)) {
    gsapLib.set(INTRO_WORDS_TARGET, {
      x: 0,
      y: INTRO_SLIDE_OFFSET,
      opacity: 0,
      visibility: "hidden",
    });

    gsapLib.to(INTRO_WORDS_TARGET, {
      x: 0,
      y: 0,
      opacity: 1,
      visibility: "visible",
      duration: HERO_REVEAL_DURATION_INTRO,
      ease: HERO_TEXT_EASE_INTRO,
      delay: HERO_REVEAL_DELAY_INTRO,
      stagger: HERO_REVEAL_STAGGER_INTRO,
      overwrite: "auto",
    });
  }

  // The parent remains in place; the updated single text layer owns the entry motion.
  if (hasElements(WRAPPER_GRADIENT_WORD_TARGET)) {
    gsapLib.to(WRAPPER_GRADIENT_WORD_TARGET, {
      x: 0,
      y: 0,
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
      y: 0,
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
      gsapLib.set(INTRO_ANIMATION_TARGET, { y: 0, opacity: 1, visibility: "visible" });
    }

    if (hasElements(WRAPPER_GRADIENT_TARGET)) {
      gsapLib.set(WRAPPER_GRADIENT_TARGET, { x: 0, y: 0, opacity: 1, visibility: "visible" });
    }

    if (hasElements(WRAPPER_GRADIENT_WORD_TARGET)) {
      gsapLib.set(WRAPPER_GRADIENT_WORD_TARGET, { x: 0, y: 0, opacity: 1, visibility: "visible" });
    }

    if (hasElements(INTRO_WORDS_TARGET)) {
      gsapLib.set(INTRO_WORDS_TARGET, { x: 0, y: 0, opacity: 1, visibility: "visible" });
    }

    if (hasElements(INTRO_HEADER_TARGET)) {
      gsapLib.set(INTRO_HEADER_TARGET, { y: 0, opacity: 1 });
    }

    return;
  }

  document.querySelectorAll(INTRO_ANIMATION_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.visibility = "visible";
    el.style.transform = "none";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.visibility = "visible";
    el.style.transform = "none";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_WORD_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.visibility = "visible";
    el.style.transform = "none";
  });

  document.querySelectorAll(INTRO_WORDS_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.visibility = "visible";
    el.style.transform = "none";
  });

  document.querySelectorAll(INTRO_HEADER_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}

function hideIntroContent() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (gsapLib) {
    if (hasElements(INTRO_ANIMATION_TARGET)) {
      gsapLib.set(INTRO_ANIMATION_TARGET, { opacity: 0 });
    }

    if (hasElements(WRAPPER_GRADIENT_TARGET)) {
      gsapLib.set(WRAPPER_GRADIENT_TARGET, { x: 0, y: 0, opacity: 0 });
    }

    if (hasElements(WRAPPER_GRADIENT_WORD_TARGET)) {
      gsapLib.set(WRAPPER_GRADIENT_WORD_TARGET, { x: 0, y: INTRO_SLIDE_OFFSET, opacity: 0 });
    }

    if (hasElements(INTRO_WORDS_TARGET)) {
      gsapLib.set(INTRO_WORDS_TARGET, { x: 0, y: INTRO_SLIDE_OFFSET, opacity: 0 });
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
    el.style.transform = "none";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_WORD_TARGET).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = `translateY(${INTRO_SLIDE_OFFSET})`;
  });

  document.querySelectorAll(INTRO_WORDS_TARGET).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = `translateY(${INTRO_SLIDE_OFFSET})`;
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
