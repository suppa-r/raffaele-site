/* -----------------------------------------
  Have focus outline only for keyboard users
 ---------------------------------------- */

const handleFirstTab = (e) => {
  if (e.key === "Tab") {
    document.body.classList.add("user-is-tabbing");

    window.removeEventListener("keydown", handleFirstTab);
    window.addEventListener("mousedown", handleMouseDownOnce);
  }
};

const handleMouseDownOnce = () => {
  document.body.classList.remove("user-is-tabbing");

  window.removeEventListener("mousedown", handleMouseDownOnce);
  window.addEventListener("keydown", handleFirstTab);
};

window.addEventListener("keydown", handleFirstTab);

const backToTopButton = document.querySelector(".back-to-top");
let isBackToTopRendered = false;

let alterStyles = (isBackToTopRendered) => {
  backToTopButton.style.visibility = isBackToTopRendered ? "visible" : "hidden";
  backToTopButton.style.opacity = isBackToTopRendered ? 1 : 0;
  backToTopButton.style.transform = isBackToTopRendered
    ? "scale(1)"
    : "scale(0)";
};

window.addEventListener("scroll", () => {
  if (window.scrollY > 700) {
    isBackToTopRendered = true;
    alterStyles(isBackToTopRendered);
  } else {
    isBackToTopRendered = false;
    alterStyles(isBackToTopRendered);
  }
});

const headerText = document.querySelector(".header__text");
const sectionTargets = document.querySelectorAll("main > section[id]");
const sectionHashes = new Set(
  Array.from(sectionTargets, (section) => `#${section.id}`),
);

const updateHeaderTextVisibility = () => {
  if (!headerText) {
    return;
  }

  const hasActiveSection = sectionHashes.has(window.location.hash);
  headerText.hidden = hasActiveSection;
  headerText.setAttribute("aria-hidden", hasActiveSection ? "true" : "false");
};

window.addEventListener("hashchange", updateHeaderTextVisibility);
updateHeaderTextVisibility();
