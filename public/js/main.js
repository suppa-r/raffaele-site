const PARTICLE_COUNT = 20;
const PARTICLE_REMOVE_MS = 1000;
const PAGE_LEAVE_CLASS = "is-leaving";
const PARTICLE_DISTANCE_MIN = 20;
const PARTICLE_DISTANCE_MAX = 100;
const NAVIGATION_SCROLL_BEHAVIOR = "manual";
const MAIN_COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

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

function getAbsoluteHref(href, baseUrl) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

function getSavedThemePreference() {
  try {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "auto") {
      localStorage.setItem("theme", "system");
      return "system";
    }

    return ["dark", "system"].includes(savedTheme) ? savedTheme : "dark";
  } catch {
    return "dark";
  }
}

function resolveSavedThemePreference(themePreference) {
  if (themePreference !== "system") {
    return themePreference;
  }

  return window.matchMedia(MAIN_COLOR_SCHEME_QUERY).matches ? "dark" : "light";
}

function loadNewStylesheets(newStylesheets, currentHrefSet, destinationUrl) {
  const promises = [];

  newStylesheets.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const absoluteHref = getAbsoluteHref(href, destinationUrl);
    if (currentHrefSet.has(absoluteHref)) return;

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

function removeOldStylesheets(newHrefSet) {
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const absoluteHref = link.href;
    if (newHrefSet.has(absoluteHref)) return;

    link.remove();
  });
}

async function loadMissingScripts(newScripts, currentSrcSet, destinationUrl) {
  for (const script of newScripts) {
    const src = script.getAttribute("src");
    if (!src) continue;

    const absoluteSrc = getAbsoluteHref(src, destinationUrl);
    if (currentSrcSet.has(absoluteSrc)) continue;

    await new Promise((resolve) => {
      const clone = document.createElement("script");
      clone.src = absoluteSrc;

      const type = script.getAttribute("type");
      if (type) {
        clone.type = type;
      }

      if (script.noModule) {
        clone.noModule = true;
      }

      clone.async = false;
      clone.defer = true;
      clone.addEventListener("load", resolve, { once: true });
      clone.addEventListener("error", resolve, { once: true });
      document.head.appendChild(clone);
      currentSrcSet.add(absoluteSrc);
    });
  }
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
  if (new URL(event.destination.url).origin !== location.origin) {
    return;
  }

  const currentUrl = new URL(window.location.href);
  const destinationUrl = new URL(event.destination.url);

  if (
    currentUrl.pathname === destinationUrl.pathname &&
    currentUrl.search === destinationUrl.search
  ) {
    return;
  }

  event.intercept({
    handler: async () => {
      const overlayNav = document.querySelector(".overlay-navigation");
      if (overlayNav) overlayNav.remove();

      let newDocument;
      try {
        newDocument = await fetchDocument(event.destination.url);
      } catch {
        window.location.href = event.destination.url;
        return;
      }

      const currentStylesheets = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]'),
      );
      const newStylesheets = Array.from(
        newDocument.querySelectorAll('link[rel="stylesheet"]'),
      );
      const currentScripts = Array.from(
        document.querySelectorAll("script[src]"),
      );
      const newScripts = Array.from(
        newDocument.querySelectorAll("script[src]"),
      );
      const currentHrefSet = new Set(
        currentStylesheets.map((link) => link.href).filter(Boolean),
      );
      const currentSrcSet = new Set(
        currentScripts.map((script) => script.src).filter(Boolean),
      );
      const newHrefSet = new Set(
        newStylesheets
          .map((link) => link.getAttribute("href"))
          .filter(Boolean)
          .map((href) => getAbsoluteHref(href, event.destination.url)),
      );

      await loadNewStylesheets(
        newStylesheets,
        currentHrefSet,
        event.destination.url,
      );
      removeOldStylesheets(newHrefSet);

      const savedTheme = resolveSavedThemePreference(getSavedThemePreference());
      if (!document.startViewTransition) {
        adoptNewBody(newDocument, savedTheme);
        await loadMissingScripts(
          newScripts,
          currentSrcSet,
          event.destination.url,
        );
        window.scrollTo(0, 0);
        document.body.classList.remove("page-entering");
        document.dispatchEvent(new CustomEvent("page:transitioned"));
        return;
      }

      const transition = document.startViewTransition(() => {
        adoptNewBody(newDocument, savedTheme);
      });

      transition.ready
        .then(() => {
          window.scrollTo(0, 0);
        })
        .catch(() => {
          // no-op: transition ready may reject when interrupted
        });

      try {
        await transition.finished;
      } catch {
        // no-op: transition finished may reject when interrupted
      }

      await loadMissingScripts(
        newScripts,
        currentSrcSet,
        event.destination.url,
      );

      document.body.classList.remove("page-entering");
      document.dispatchEvent(new CustomEvent("page:transitioned"));
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
}

document.addEventListener("DOMContentLoaded", initMainPage);
document.addEventListener("page:transitioned", initMainPage);
