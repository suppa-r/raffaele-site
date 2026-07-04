/* global SplitType, Lenis */

let lenis;
let splitInstance;
let hasPlayedIntro1MainAnimation = false;
let lastInitTimestamp = 0;
const INIT_DEDUPE_WINDOW_MS = 450;
const THEME_REPLAY_DELAY_MS = 100;
const INTRO_ANIMATION_TARGET = "main p:not(.wrapper-gradient-text)";
const WRAPPER_GRADIENT_TARGET = ".wrapper-gradient-text";
const INTRO1_MAIN_CHILDREN_TARGET = 'body[data-page="intro-1"] main > *';

if (typeof document !== "undefined") {
  document.documentElement.classList.add("js-intro-anim");
}

function isIntro1Page() {
  return document.body?.dataset?.page === "intro-1";
}

function prefersReducedMotion() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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

function revealIntro1MainContent(animate = false) {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (gsapLib) {
    if (!animate) {
      gsapLib.set(INTRO1_MAIN_CHILDREN_TARGET, {
        clearProps: "opacity,transform",
      });
      gsapLib.set(INTRO1_MAIN_CHILDREN_TARGET, { autoAlpha: 1, y: 0 });
      return;
    }

    const introChildren = Array.from(
      document.querySelectorAll(INTRO1_MAIN_CHILDREN_TARGET),
    );
    const [introImage, introMenuButton, ...introMenuRest] = introChildren;
    const timeline = gsapLib.timeline({
      defaults: {
        duration: 0.7,
        ease: "power3.out",
      },
      onComplete: () => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.remove("js-intro-anim");
        }
      },
    });

    if (introImage) {
      gsapLib.killTweensOf(introImage);
      timeline.fromTo(
        introImage,
        { autoAlpha: 0, y: 120 },
        { autoAlpha: 1, y: 0 },
        0,
      );
    }

    if (introMenuButton) {
      gsapLib.killTweensOf(introMenuButton);
      timeline.fromTo(
        introMenuButton,
        { autoAlpha: 0, y: 150 },
        { autoAlpha: 1, y: 0 },
        0.34,
      );
    }

    introMenuRest.forEach((el, index) => {
      gsapLib.killTweensOf(el);
      timeline.fromTo(
        el,
        { autoAlpha: 0, y: 150 },
        { autoAlpha: 1, y: 0 },
        0.52 + index * 0.18,
      );
    });
    return;
  }

  document.querySelectorAll(INTRO1_MAIN_CHILDREN_TARGET).forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  });
}

function hideIntro1MainContent() {
  const children = document.querySelectorAll(INTRO1_MAIN_CHILDREN_TARGET);
  if (!children.length) return;

  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (!gsapLib) {
    children.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(140px)";
    });
    return;
  }

  gsapLib.set(INTRO1_MAIN_CHILDREN_TARGET, { autoAlpha: 0, y: 140 });
}

function shouldAnimateIntro1MainContent() {
  return (
    !!document.querySelector(INTRO1_MAIN_CHILDREN_TARGET) &&
    !hasPlayedIntro1MainAnimation
  );
}

function animateIntro1MainContent() {
  const children = document.querySelectorAll(INTRO1_MAIN_CHILDREN_TARGET);
  if (!children.length) return;

  if (!shouldAnimateIntro1MainContent()) {
    revealIntro1MainContent();
    return;
  }

  if (prefersReducedMotion()) {
    revealIntro1MainContent();
    hasPlayedIntro1MainAnimation = true;
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("js-intro-anim");
    }
    return;
  }

  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (!gsapLib) {
    revealIntro1MainContent();
    hasPlayedIntro1MainAnimation = true;
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("js-intro-anim");
    }
    return;
  }

  gsapLib.killTweensOf(INTRO1_MAIN_CHILDREN_TARGET);

  hideIntro1MainContent();
  revealIntro1MainContent(true);

  hasPlayedIntro1MainAnimation = true;
}

function initPage() {
  const now = Date.now();
  if (now - lastInitTimestamp < INIT_DEDUPE_WINDOW_MS) {
    return;
  }

  lastInitTimestamp = now;

  try {
    if (!isIntro1Page()) {
      hasPlayedIntro1MainAnimation = false;
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("js-intro-anim");
      }
    } else if (
      !hasPlayedIntro1MainAnimation &&
      typeof document !== "undefined"
    ) {
      document.documentElement.classList.add("js-intro-anim");
    } else if (isIntro1Page() && hasPlayedIntro1MainAnimation) {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("js-intro-anim");
      }
      revealIntro1MainContent();
      return;
    }

    hideIntroContent();
    if (shouldAnimateIntro1MainContent()) {
      hideIntro1MainContent();
    } else {
      revealIntro1MainContent();
    }
    initializeLenis();
    initializeAnimations();
    animateIntro1MainContent();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Intro animation init failed:", error);
    revealIntroContent();
    revealIntro1MainContent();
  }
}

function handleThemeTransitionStart() {
  if (isIntro1Page() && hasPlayedIntro1MainAnimation) {
    return;
  }

  hideIntroContent();
  if (shouldAnimateIntro1MainContent()) {
    hideIntro1MainContent();
  }
}

function handleThemeTransitioned() {
  if (isIntro1Page() && hasPlayedIntro1MainAnimation) {
    return;
  }

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
