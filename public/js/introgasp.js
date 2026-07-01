/* global SplitType, Lenis */

let lenis;
let splitInstance;
const THEME_REPLAY_DELAY_MS = 100;
const INTRO_ANIMATION_TARGET = "main p:not(.wrapper-gradient-text)";
const WRAPPER_GRADIENT_TARGET = ".wrapper-gradient-text";

function hasElements(selector) {
  return !!document.querySelector(selector);
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

function initializeAnimations() {
  if (!document.querySelector(INTRO_ANIMATION_TARGET)) return;

  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
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
  if (hasElements(WRAPPER_GRADIENT_TARGET)) {
    gsapLib.to(WRAPPER_GRADIENT_TARGET, {
      x: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power3.out",
      delay: 0.12,
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

    return;
  }

  document.querySelectorAll(INTRO_ANIMATION_TARGET).forEach((el) => {
    el.style.opacity = "1";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_TARGET).forEach((el) => {
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
      gsapLib.set(WRAPPER_GRADIENT_TARGET, { x: "30vw", opacity: 0 });
    }

    return;
  }

  document.querySelectorAll(INTRO_ANIMATION_TARGET).forEach((el) => {
    el.style.opacity = "0";
  });

  document.querySelectorAll(WRAPPER_GRADIENT_TARGET).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateX(30vw)";
  });
}

function initPage() {
  try {
    hideIntroContent();
    initializeLenis();
    initializeAnimations();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Intro animation init failed:", error);
    revealIntroContent();
  }
}

function handleThemeTransitionStart() {
  hideIntroContent();
}

function handleThemeTransitioned() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        initPage();
      }, THEME_REPLAY_DELAY_MS);
    });
  });
}

document.addEventListener("DOMContentLoaded", initPage);
document.addEventListener("page:transitioned", initPage);
document.addEventListener("theme:transition:start", handleThemeTransitionStart);
document.addEventListener("theme:transitioned", handleThemeTransitioned);
