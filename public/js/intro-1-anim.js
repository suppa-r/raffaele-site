
/*
 * Standalone entrance animations for intro-1.html
 * Uses centralized animation constants from animation-constants.js
 */
const INTRO1_NAV_ITEMS_TARGET = window.ANIMATION_CONSTANTS.INTRO1.selectors.navItems;
const INTRO1_FOOTER_ENTRIES_TARGET = window.ANIMATION_CONSTANTS.INTRO1.selectors.footerEntries;
const INTRO1_TITLE_WORDS_TARGET = window.ANIMATION_CONSTANTS.INTRO1.selectors.titleWords;
const INTRO1_TITLE_EMPHASIS_TARGET = window.ANIMATION_CONSTANTS.INTRO1.selectors.titleEmphasis;
const INTRO1_PROFILE_TITLE_SPAN_TARGET = window.ANIMATION_CONSTANTS.INTRO1.selectors.profileTitleSpan;

const INTRO1_NAV_REVEAL_DURATION = window.ANIMATION_CONSTANTS.INTRO1.timing.navRevealDuration;
const INTRO1_NAV_REVEAL_DELAY = window.ANIMATION_CONSTANTS.INTRO1.timing.navRevealDelay;
const INTRO1_FOOTER_REVEAL_DURATION = window.ANIMATION_CONSTANTS.INTRO1.timing.footerRevealDuration;
const INTRO1_FOOTER_REVEAL_STAGGER = window.ANIMATION_CONSTANTS.INTRO1.timing.footerRevealStagger;
const INTRO1_FOOTER_REVEAL_DELAY = window.ANIMATION_CONSTANTS.INTRO1.timing.footerRevealDelay;
const INTRO1_TITLE_WORD_DURATION = window.ANIMATION_CONSTANTS.INTRO1.timing.titleWordDuration;
const INTRO1_TITLE_WORD_STAGGER = window.ANIMATION_CONSTANTS.INTRO1.timing.titleWordStagger;
const INTRO1_TITLE_WORD_DELAY = window.ANIMATION_CONSTANTS.INTRO1.timing.titleWordDelay;
const INTRO1_TITLE_WORD_OFFSET = window.ANIMATION_CONSTANTS.INTRO1.timing.titleWordOffset;
const INTRO1_TITLE_EMPHASIS_DURATION = window.ANIMATION_CONSTANTS.INTRO1.timing.titleEmphasisDuration;
const INTRO1_TITLE_EMPHASIS_OVERLAP = window.ANIMATION_CONSTANTS.INTRO1.timing.titleEmphasisOverlap;
const INTRO1_TITLE_EASE = window.ANIMATION_CONSTANTS.EASING.standard;
const INTRO1_PROFILE_TITLE_REVEAL_DURATION = window.ANIMATION_CONSTANTS.INTRO1.timing.profileTitleRevealDuration;

let intro1InitState = "idle";
let intro1TitleSplit = null;

function intro1IsPage() {
  return !!document.querySelector("body[data-page='intro-1']");
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
      INTRO1_TITLE_WORDS_TARGET,
      INTRO1_TITLE_EMPHASIS_TARGET,
    ].forEach((target) => gsapLib.killTweensOf(target));
  }

  document
    .querySelectorAll(
      `${INTRO1_NAV_ITEMS_TARGET}, ${INTRO1_FOOTER_ENTRIES_TARGET}, ${INTRO1_TITLE_WORDS_TARGET}, ${INTRO1_TITLE_EMPHASIS_TARGET}`,
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
      gsapLib.set(INTRO1_NAV_ITEMS_TARGET, {
        opacity: 0,
        y: "-18vh",
      });
    }
    if (intro1HasElements(INTRO1_FOOTER_ENTRIES_TARGET)) {
      gsapLib.set(INTRO1_FOOTER_ENTRIES_TARGET, { y: 16, opacity: 0 });
    }
    if (intro1HasElements(INTRO1_TITLE_WORDS_TARGET)) {
      gsapLib.set(INTRO1_TITLE_WORDS_TARGET, {
        x: INTRO1_TITLE_WORD_OFFSET,
        opacity: 0,
      });
    }
    if (intro1HasElements(INTRO1_TITLE_EMPHASIS_TARGET)) {
      gsapLib.set(INTRO1_TITLE_EMPHASIS_TARGET, {
        y: 16,
        scale: 0.88,
        opacity: 0,
      });
    }
    return;
  }

  document
    .querySelectorAll(
      `${INTRO1_NAV_ITEMS_TARGET}, ${INTRO1_FOOTER_ENTRIES_TARGET}, ${INTRO1_TITLE_WORDS_TARGET}, ${INTRO1_TITLE_EMPHASIS_TARGET}`,
    )
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateX(35vw)";
    });

  if (intro1HasElements(INTRO1_NAV_ITEMS_TARGET)) {
    document.querySelectorAll(INTRO1_NAV_ITEMS_TARGET).forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(-18vh)";
    });
  }
}

function intro1RevealContent() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;
  if (gsapLib) {
    if (intro1HasElements(INTRO1_NAV_ITEMS_TARGET)) {
      gsapLib.set(INTRO1_NAV_ITEMS_TARGET, { x: 0, y: 0, opacity: 1 });
    }
    if (intro1HasElements(INTRO1_FOOTER_ENTRIES_TARGET)) {
      gsapLib.set(INTRO1_FOOTER_ENTRIES_TARGET, { y: 0, opacity: 1 });
    }
    if (intro1HasElements(INTRO1_TITLE_WORDS_TARGET)) {
      gsapLib.set(INTRO1_TITLE_WORDS_TARGET, { x: 0, y: 0, opacity: 1 });
    }
    if (intro1HasElements(INTRO1_TITLE_EMPHASIS_TARGET)) {
      gsapLib.set(INTRO1_TITLE_EMPHASIS_TARGET, {
        y: 0,
        scale: 1,
        opacity: 1,
      });
    }
    return;
  }

  document
    .querySelectorAll(
      `${INTRO1_NAV_ITEMS_TARGET}, ${INTRO1_FOOTER_ENTRIES_TARGET}, ${INTRO1_TITLE_WORDS_TARGET}, ${INTRO1_TITLE_EMPHASIS_TARGET}`,
    )
    .forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "translateX(0)";
    });
}

function intro1InitializeAnimations() {
  const gsapLib = typeof window !== "undefined" ? window.gsap : null;

  if (!gsapLib) {
    intro1RevealContent();
    return;
  }

  if (intro1HasElements(INTRO1_NAV_ITEMS_TARGET)) {
    gsapLib.fromTo(
      INTRO1_NAV_ITEMS_TARGET,
      {
        opacity: 0,
        y: "-18vh",
      },
      {
        x: 0,
        y: 0,
        opacity: 1,
        duration: INTRO1_NAV_REVEAL_DURATION,
        ease: "power3.out",
        delay: INTRO1_NAV_REVEAL_DELAY,
        overwrite: "auto",
      },
    );
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

  if (intro1HasElements(INTRO1_TITLE_WORDS_TARGET)) {
    const titleTimeline = gsapLib.timeline({
      delay: INTRO1_TITLE_WORD_DELAY,
      overwrite: "auto",
    });

    titleTimeline.fromTo(
      INTRO1_TITLE_WORDS_TARGET,
      { x: INTRO1_TITLE_WORD_OFFSET, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: INTRO1_TITLE_WORD_DURATION,
        stagger: INTRO1_TITLE_WORD_STAGGER,
        ease: INTRO1_TITLE_EASE,
      },
    );

    if (intro1HasElements(INTRO1_TITLE_EMPHASIS_TARGET)) {
      titleTimeline.fromTo(
        INTRO1_TITLE_EMPHASIS_TARGET,
        { y: 16, scale: 0.88, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: INTRO1_TITLE_EMPHASIS_DURATION,
          ease: INTRO1_TITLE_EASE,
        },
        `-=${INTRO1_TITLE_EMPHASIS_OVERLAP}`,
      );
    }
  }
}

function intro1PrepareTitleWords() {
  const titleButton = document.querySelector(".intro-1-page-title-trigger");
  if (typeof window.SplitType !== "function" || !titleButton) {
    return;
  }

  intro1TitleSplit?.revert();
  intro1TitleSplit = new window.SplitType(titleButton, { types: "words" });
  intro1TitleSplit.words.forEach((word) => {
    word.style.display = "inline-block";
  });
}

function intro1InitPage() {
  if (!intro1IsPage()) {
    intro1TitleSplit?.revert();
    intro1TitleSplit = null;
    intro1InitState = "idle";
    return;
  }

  if (intro1InitState === "done") {
    return;
  }

  intro1InitState = "running";
  intro1ResetState();
  intro1PrepareTitleWords();
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
