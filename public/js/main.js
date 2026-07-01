const PARTICLE_COUNT = 20;
const PARTICLE_REMOVE_MS = 1000;
const PAGE_LEAVE_CLASS = "is-leaving";
const PARTICLE_DISTANCE_MIN = 20;
const PARTICLE_DISTANCE_MAX = 100;
const NAVIGATION_SCROLL_BEHAVIOR = "manual";

const NAV_DEBUG_QUERY = "debugNav";
const NAV_DEBUG_STORAGE_KEY = "debugNav";
let navDebugTraverseOnlyActive = false;

function isNavigationDebugEnabled() {
  const queryFlag = new URLSearchParams(window.location.search).get(
    NAV_DEBUG_QUERY,
  );
  if (queryFlag === "1") {
    try {
      localStorage.setItem(NAV_DEBUG_STORAGE_KEY, "1");
    } catch {
      // ignore storage errors
    }
    return true;
  }

  if (queryFlag === "0") {
    try {
      localStorage.removeItem(NAV_DEBUG_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    return false;
  }

  try {
    return localStorage.getItem(NAV_DEBUG_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function navDebugLog(message, details) {
  if (!isNavigationDebugEnabled()) return;
  if (!navDebugTraverseOnlyActive) return;
  if (details === undefined) {
    console.info(`[nav-debug] ${message}`);
    return;
  }
  console.info(`[nav-debug] ${message}`, details);
}

function getSneakerButton() {
  return document.querySelector(".btn");
}

function bindOnce(selector, eventName, handler) {
  document.querySelectorAll(selector).forEach((element) => {
    const key = `bound${eventName}`;
    if (element.dataset[key] === "true") return;
    element.addEventListener(eventName, handler);
    element.dataset[key] = "true";
  });
}

function createParticle(x, y) {
  const particle = document.createElement("div");
  particle.classList.add("particle");
  particle.setAttribute("aria-hidden", "true");
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;

  const angle = Math.random() * 2 * Math.PI;
  const distance =
    Math.random() * (PARTICLE_DISTANCE_MAX - PARTICLE_DISTANCE_MIN) +
    PARTICLE_DISTANCE_MIN;
  particle.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
  particle.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);

  return particle;
}

function emitParticles(button, x, y) {
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const particle = createParticle(x, y);
    button.appendChild(particle);
    setTimeout(() => particle.remove(), PARTICLE_REMOVE_MS);
  }
}

function handleSneakerClick(event) {
  const button = getSneakerButton();
  if (!button) return;

  const rect = button.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  document.body.classList.add(PAGE_LEAVE_CLASS);
  emitParticles(button, x, y);
  navDebugLog("Sneaker click transition start", {
    x,
    y,
    target: "intro.html",
  });

  setTimeout(() => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.href = "intro.html";
      });
    } else {
      window.location.href = "intro.html";
    }
  }, 800);
}

function bindSneakerButton() {
  bindOnce(".btn", "click", handleSneakerClick);
}

function loadNewStylesheets(newStylesheets, currentHrefs) {
  const promises = [];

  newStylesheets.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || currentHrefs.includes(href)) return;

    const clone = link.cloneNode(true);
    const loadPromise = new Promise((resolve) => {
      clone.addEventListener("load", resolve, { once: true });
      clone.addEventListener("error", resolve, { once: true });
    });

    promises.push(loadPromise);
    document.head.appendChild(clone);
  });

  return Promise.all(promises);
}

function removeOldStylesheets(newHrefs) {
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || newHrefs.includes(href)) return;
    link.remove();
  });
}

function adoptNewBody(newDocument, savedTheme) {
  const newBody = document.adoptNode(newDocument.body);
  newBody.classList.add("page-entering");
  document.documentElement.replaceChild(newBody, document.body);
  document.title = newDocument.title;

  const currentTheme = document.documentElement.getAttribute("data-theme");
  if (currentTheme !== savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  const newGrid = newDocument.documentElement.getAttribute("data-grid");
  if (newGrid) {
    document.documentElement.setAttribute("data-grid", newGrid);
  } else {
    document.documentElement.removeAttribute("data-grid");
  }
}

async function fetchDocument(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Navigation response error: ${response.status} ${response.statusText}`,
    );
  }
  const text = await response.text();
  return new DOMParser().parseFromString(text, "text/html");
}

async function handleNavigation(event) {
  navDebugTraverseOnlyActive = event.navigationType === "traverse";

  navDebugLog("Navigation event received", {
    from: window.location.href,
    to: event.destination.url,
    canIntercept: typeof event.intercept === "function",
    navigationType: event.navigationType,
  });

  if (new URL(event.destination.url).origin !== location.origin) {
    navDebugLog("Skipped non-origin navigation", event.destination.url);
    navDebugTraverseOnlyActive = false;
    return;
  }

  event.intercept({
    handler: async () => {
      navDebugLog("Intercept handler begin", event.destination.url);
      const overlayNav = document.querySelector(".overlay-navigation");
      if (overlayNav) overlayNav.remove();

      let newDocument;
      try {
        newDocument = await fetchDocument(event.destination.url);
        navDebugLog("Navigation document fetched", {
          title: newDocument.title,
          url: event.destination.url,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Navigation fetch failed:", error);
        navDebugLog("Navigation fetch fallback to hard load", {
          url: event.destination.url,
          error: String(error),
        });
        window.location.href = event.destination.url;
        navDebugTraverseOnlyActive = false;
        return;
      }

      const currentStylesheets = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]'),
      );
      const newStylesheets = Array.from(
        newDocument.querySelectorAll('link[rel="stylesheet"]'),
      );
      const currentHrefs = currentStylesheets.map((link) =>
        link.getAttribute("href"),
      );
      const newHrefs = newStylesheets.map((link) => link.getAttribute("href"));

      await loadNewStylesheets(newStylesheets, currentHrefs);
      removeOldStylesheets(newHrefs);
      navDebugLog("Stylesheet swap complete", {
        added: newHrefs.filter((href) => !currentHrefs.includes(href)).length,
        removed: currentHrefs.filter((href) => !newHrefs.includes(href)).length,
      });

      const savedTheme = localStorage.getItem("theme") ?? "dark";
      if (!document.startViewTransition) {
        navDebugLog("ViewTransition API unavailable; using fallback swap");
        adoptNewBody(newDocument, savedTheme);
        window.scrollTo(0, 0);
        document.body.classList.remove("page-entering");
        document.dispatchEvent(new CustomEvent("page:transitioned"));
        navDebugLog("Fallback navigation completed", event.destination.url);
        navDebugTraverseOnlyActive = false;
        return;
      }

      const transition = document.startViewTransition(() => {
        navDebugLog("startViewTransition callback executing", {
          savedTheme,
          destination: event.destination.url,
        });
        adoptNewBody(newDocument, savedTheme);
      });

      transition.ready
        .then(() => {
          navDebugLog("Transition ready", event.destination.url);
          window.scrollTo(0, 0);
        })
        .catch(() => {
          // Transition can be interrupted by browser navigation controls.
          navDebugLog("Transition ready rejected (likely interrupted)");
        });

      try {
        await transition.finished;
        navDebugLog("Transition finished", event.destination.url);
      } catch {
        // Transition promises can reject when the user interrupts navigation.
        navDebugLog("Transition finished rejected (likely interrupted)");
      }

      document.body.classList.remove("page-entering");
      document.dispatchEvent(new CustomEvent("page:transitioned"));
      navDebugLog("Custom page:transitioned dispatched", event.destination.url);
      navDebugTraverseOnlyActive = false;
    },
    scroll: NAVIGATION_SCROLL_BEHAVIOR,
  });
}

function initNavigationInterception() {
  const nav = window.navigation;
  if (!nav || typeof nav.addEventListener !== "function") {
    return;
  }

  nav.addEventListener("navigate", handleNavigation);
}

function initMainPage() {
  bindSneakerButton();
  initNavigationInterception();
  navDebugLog("Main page initialized", {
    href: window.location.href,
    debugEnabled: isNavigationDebugEnabled(),
  });
}

document.addEventListener("DOMContentLoaded", initMainPage);
document.addEventListener("page:transitioned", initMainPage);
