/* global gsap */
/* Standalone entrance animations for intro-1.html; does not touch introgasp.js state. */

const INTRO1_PAGE_MARKER = ".intro-1-page-title";
const INTRO1_NAV_ITEMS_TARGET = "header .nav-links .nav__item";
const INTRO1_FOOTER_ENTRIES_TARGET = "footer.footer > *";
const INTRO1_TITLE_LINE_TARGET = ".intro-1-page-title .title-line";
const INTRO1_TITLE_LINE_FIRST_TARGET = `${INTRO1_TITLE_LINE_TARGET}:first-of-type`;
const INTRO1_TITLE_LINE_SECOND_TARGET = `${INTRO1_TITLE_LINE_TARGET}:last-of-type`;
const INTRO1_PROFILE_TITLE_SPAN_TARGET = ".profile-title span";

const INTRO1_NAV_REVEAL_DURATION = 0.9;
const INTRO1_NAV_REVEAL_STAGGER = 0.1;
const INTRO1_NAV_REVEAL_DELAY = 0.05;
const INTRO1_FOOTER_REVEAL_DURATION = 0.6;
const INTRO1_FOOTER_REVEAL_STAGGER = 0.1;
const INTRO1_FOOTER_REVEAL_DELAY = 1.8;
const INTRO1_TITLE_LINE_DURATION = 1.6;
const INTRO1_TITLE_LINE_SECOND_DURATION = 0.9;
const INTRO1_TITLE_LINE_STAGGER = 1.1;
const INTRO1_TITLE_LINE_DELAY = 0.3;
const INTRO1_PROFILE_TITLE_REVEAL_DURATION = 1.6;

let intro1InitState = "idle";

function intro1IsPage() {
  return !!document.querySelector(INTRO1_PAGE_MARKER);
}

function intro1HasElements(selector) {
  return !!document.querySelector(selector);
}

function intro1ResetState() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (gsapLib) {
    [
      INTRO1_NAV_ITEMS_TARGET,
      INTRO1_FOOTER_ENTRIES_TARGET,
      INTRO1_TITLE_LINE_TARGET,
    ].forEach((target) => gsapLib.killTweensOf(target));
  }

  document
    .querySelectorAll(
      `${INTRO1_NAV_ITEMS_TARGET}, ${INTRO1_FOOTER_ENTRIES_TARGET}, ${INTRO1_TITLE_LINE_TARGET}`,
    )
    .forEach((element) => {
      element.style.opacity = "";
      element.style.transform = "";
    });
}

function intro1HideContent() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (gsapLib) {
    if (intro1HasElements(INTRO1_NAV_ITEMS_TARGET)) {
      gsapLib.set(INTRO1_NAV_ITEMS_TARGET, { y: 16, opacity: 0 });
    }
    if (intro1HasElements(INTRO1_FOOTER_ENTRIES_TARGET)) {
      gsapLib.set(INTRO1_FOOTER_ENTRIES_TARGET, { y: 16, opacity: 0 });
    }
    if (intro1HasElements(INTRO1_TITLE_LINE_TARGET)) {
      gsapLib.set(INTRO1_TITLE_LINE_TARGET, { y: 16, opacity: 0 });
    }
    return;
  }

  document
    .querySelectorAll(
      `${INTRO1_NAV_ITEMS_TARGET}, ${INTRO1_FOOTER_ENTRIES_TARGET}, ${INTRO1_TITLE_LINE_TARGET}`,
    )
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
    });
}

function intro1RevealContent() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (gsapLib) {
    if (intro1HasElements(INTRO1_NAV_ITEMS_TARGET)) {
      gsapLib.set(INTRO1_NAV_ITEMS_TARGET, { y: 0, opacity: 1 });
    }
    if (intro1HasElements(INTRO1_FOOTER_ENTRIES_TARGET)) {
      gsapLib.set(INTRO1_FOOTER_ENTRIES_TARGET, { y: 0, opacity: 1 });
    }
    if (intro1HasElements(INTRO1_TITLE_LINE_TARGET)) {
      gsapLib.set(INTRO1_TITLE_LINE_TARGET, { y: 0, opacity: 1 });
    }
    return;
  }

  document
    .querySelectorAll(
      `${INTRO1_NAV_ITEMS_TARGET}, ${INTRO1_FOOTER_ENTRIES_TARGET}, ${INTRO1_TITLE_LINE_TARGET}`,
    )
    .forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
}

function intro1InitializeAnimations() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  intro1ResetState();

  if (!gsapLib) {
    intro1RevealContent();
    return;
  }

  if (intro1HasElements(INTRO1_NAV_ITEMS_TARGET)) {
    gsapLib.to(INTRO1_NAV_ITEMS_TARGET, {
      y: 0,
      opacity: 1,
      duration: INTRO1_NAV_REVEAL_DURATION,
      ease: "power3.out",
      stagger: INTRO1_NAV_REVEAL_STAGGER,
      delay: INTRO1_NAV_REVEAL_DELAY,
      overwrite: "auto",
    });
  }

  if (intro1HasElements(INTRO1_FOOTER_ENTRIES_TARGET)) {
    gsapLib.to(INTRO1_FOOTER_ENTRIES_TARGET, {
      y: 0,
      opacity: 1,
      duration: INTRO1_FOOTER_REVEAL_DURATION,
      ease: "power3.out",
      stagger: INTRO1_FOOTER_REVEAL_STAGGER,
      delay: INTRO1_FOOTER_REVEAL_DELAY,
      overwrite: "auto",
    });
  }

  if (intro1HasElements(INTRO1_TITLE_LINE_TARGET)) {
    gsapLib.to(INTRO1_TITLE_LINE_FIRST_TARGET, {
      y: 0,
      opacity: 1,
      duration: INTRO1_TITLE_LINE_DURATION,
      ease: "power3.out",
      delay: INTRO1_TITLE_LINE_DELAY,
      overwrite: "auto",
    });

    // The LISTEN line enters at the same moment but resolves faster
    gsapLib.to(INTRO1_TITLE_LINE_SECOND_TARGET, {
      y: 0,
      opacity: 1,
      duration: INTRO1_TITLE_LINE_SECOND_DURATION,
      ease: "power3.out",
      delay: INTRO1_TITLE_LINE_DELAY + INTRO1_TITLE_LINE_STAGGER,
      overwrite: "auto",
    });
  }
}

function intro1InitPage() {
  if (!intro1IsPage()) {
    intro1InitState = "idle";
    return;
  }

  if (intro1InitState === "done") {
    return;
  }

  intro1InitState = "running";
  intro1HideContent();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      intro1InitializeAnimations();
      intro1InitState = "done";
    });
  });
}

function intro1RevealActiveProfileTitle() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (!gsapLib || !window.location.hash) return;

  const titleSpan = document.querySelector(
    `${window.location.hash} ${INTRO1_PROFILE_TITLE_SPAN_TARGET}`,
  );
  if (!titleSpan) return;

  gsapLib.killTweensOf(titleSpan);
  gsapLib.fromTo(
    titleSpan,
    { y: "60%", opacity: 0 },
    {
      y: "0%",
      opacity: 1,
      duration: INTRO1_PROFILE_TITLE_REVEAL_DURATION,
      ease: "power3.out",
      delay: 0.05,
      overwrite: "auto",
    },
  );
}

function intro1OnFreshPage() {
  intro1InitState = "idle";
  intro1InitPage();
  intro1RevealActiveProfileTitle();
}

document.addEventListener("DOMContentLoaded", intro1OnFreshPage);
document.addEventListener("page:transitioned", intro1OnFreshPage);
window.addEventListener("hashchange", intro1RevealActiveProfileTitle);
