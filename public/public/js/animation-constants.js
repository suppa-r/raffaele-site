/**
 * Shared animation constants across all pages
 * Centralizes timing, easing, and selectors to avoid duplication and reduce redundancy
 * Use globally via window.ANIMATION_CONSTANTS
 */

window.ANIMATION_CONSTANTS = {
  /* ===== SHARED EASING ===== */
  EASING: {
    standard: "cubic-bezier(0.22, 1, 0.36, 1)",
    smooth: "power3.out",
    smooth2: "power2.out",
  },

  /* ===== INTRO PAGE ANIMATIONS ===== */
  INTRO: {
    pageSelector: 'body[data-page="intro"]',
    selectors: {
      paragraphs: 'body[data-page="intro"] main p:not(.wrapper-gradient-text)',
      wrapperGradient: 'body[data-page="intro"] .wrapper-gradient-text',
      wrapperGradientWord: 'body[data-page="intro"] .wrapper-gradient-text .text-layer',
      introWords: 'body[data-page="intro"] .text-with-animation span',
    },
    timing: {
      paragraphDuration: 0.9,
      paragraphStagger: 0.16,
      paragraphDelay: 0.12,
      paragraphFadeDuration: 0.55,
      paragraphFadeDelay: 0.08,
      heroRevealDuration: 1.7,
      heroRevealStagger: 0.18,
      heroRevealDelay: 0.18,
    },
    slideOffset: "35vw",
  },

  /* ===== INTRO-1 PAGE ANIMATIONS ===== */
  INTRO1: {
    pageSelector: ".intro-1-page-title",
    selectors: {
      navItems: "header",
      footerEntries: "footer.footer > *:not(.theme-selector-container)",
      titleLine: ".intro-1-page-title .title-line",
      titleLineFirst: ".intro-1-page-title .title-line:first-of-type",
      titleLineSecond: ".intro-1-page-title .title-line:last-of-type",
      profileTitleSpan: ".profile-title span",
    },
    timing: {
      navRevealDuration: 0.9,
      navRevealDelay: 0.05,
      footerRevealDuration: 0.6,
      footerRevealStagger: 0.1,
      footerRevealDelay: 1.8,
      titleLineDuration: 1.7,
      titleLineSecondDuration: 1.7,
      titleLineStagger: 0.18,
      titleLineDelay: 0.18,
      profileTitleRevealDuration: 1.6,
    },
  },

  /* ===== UTILITY FUNCTIONS ===== */
  killTweens(gsapLib, selectors) {
    if (gsapLib && Array.isArray(selectors)) {
      selectors.forEach((selector) => gsapLib.killTweensOf(selector));
    }
  },

  hideElement(gsapLib, selector, options = {}) {
    const { y = 16, opacity = 0 } = options;
    if (gsapLib && document.querySelector(selector)) {
      gsapLib.set(selector, { y, opacity });
    } else {
      document.querySelectorAll(selector).forEach((el) => {
        el.style.opacity = opacity.toString();
        el.style.transform = `translateY(${y}px)`;
      });
    }
  },

  revealElement(gsapLib, selector, options = {}) {
    const { y = 0, opacity = 1, duration = 0, delay = 0, stagger = 0 } = options;
    if (gsapLib && document.querySelector(selector)) {
      if (duration > 0) {
        gsapLib.to(selector, { y, opacity, duration, delay, stagger });
      } else {
        gsapLib.set(selector, { y, opacity });
      }
    } else {
      document.querySelectorAll(selector).forEach((el) => {
        el.style.opacity = opacity.toString();
        el.style.transform = `translateY(${y}px)`;
      });
    }
  },
};
