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
    duration: 1.2,
    stagger: 0.15,
    ease: "power4.out",
    delay: 0.25,
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

document.addEventListener("DOMContentLoaded", initPage);
document.addEventListener("page:transitioned", initPage);
