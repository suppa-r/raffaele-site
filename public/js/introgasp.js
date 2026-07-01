/* global gsap, SplitType, Lenis */

let lenis;

function initializeLenis() {
  if (lenis) {
    lenis.destroy();
  }

  lenis = new Lenis({
    autoRaf: true,
    smoothWheel: true,
  });
}

function initializeAnimations() {
  if (!document.querySelector("main p:not(.wrapper-gradient-text)")) return;

  // Clear any previous SplitType splits before re-splitting
  document
    .querySelectorAll("main p:not(.wrapper-gradient-text) .line")
    .forEach((split) => {
      const text = split.textContent;
      split.parentNode.replaceChild(document.createTextNode(text), split);
    });

  const splitText = new SplitType("main p:not(.wrapper-gradient-text)", {
    types: "lines",
    tagName: "div",
    lineClass: "line",
  });

  splitText.lines.forEach((line) => {
    const content = line.innerHTML;
    line.innerHTML = `<span>${content}</span>`;
  });

  // .line is the clip container; .line span starts below and reveals upward
  gsap.set("main p:not(.wrapper-gradient-text) .line", {
    display: "block",
    overflow: "hidden",
  });

  gsap.set("main p:not(.wrapper-gradient-text) .line span", {
    y: "100%",
    opacity: 0,
  });

  gsap.to("main p:not(.wrapper-gradient-text) .line span", {
    y: "0%",
    opacity: 1,
    duration: 5,
    stagger: 0.075,
    ease: "power4.out",
    delay: 0.45,
  });

  // Fade in the parent paragraphs at the same time
  gsap.to("main p:not(.wrapper-gradient-text)", {
    opacity: 1,
    duration: 5,
    delay: 0.45,
  });

  // Remove any inline overflow styles from .text-layer elements
  document.querySelectorAll(".text-layer").forEach((el) => {
    el.style.overflow = "";
  });
}

function initPage() {
  initializeLenis();
  initializeAnimations();
}

// Listen for color scheme changes and retrigger animations
const themeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "data-theme") {
      initializeAnimations();
    }
  });
});

themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});

document.addEventListener("DOMContentLoaded", initPage);
document.addEventListener("page:transitioned", initPage);
