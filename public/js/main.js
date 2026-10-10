const TOUCH_INTERACTION_QUERY = "(hover: none) and (pointer: coarse)";
const NAVIGATION_SCROLL_BEHAVIOR = "manual";
const INDEX_HERO_TEXT_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const INDEX_HERO_REVEAL_DURATION = 0.9;
const INDEX_HERO_REVEAL_STAGGER = 0.12;
const INDEX_HERO_REVEAL_DELAY = 0.1;
const INDEX_SLIDE_OFFSET = "35vw";
const INDEX_HEADING_SELECTORS = [
  ".text-with-animation span",
  ".text-with-animation-1 span",
  ".text-with-animation-2 span",
];

function bindGameClickNavigation() {
  const games = document.querySelectorAll(".game");
  if (!games.length) return;

  games.forEach((game) => {
    if (game.dataset.clickNavigationBound === "true") return;

    let touchActivation = false;
    let revealedOnPointerDown = false;
    let navigationOnPointerDown = false;

    const scheduleNavigation = () => {
      window.location.assign(game.href);
    };

    game.addEventListener("pointerdown", (event) => {
      touchActivation = event.pointerType === "touch";
      if (!touchActivation) return;

      event.preventDefault();

      if (!game.classList.contains("is-revealed")) {
        document.querySelectorAll(".game.is-revealed").forEach((revealedGame) => {
          revealedGame.classList.remove("is-revealed");
        });
        game.classList.add("is-revealed");
        revealedOnPointerDown = true;
        return;
      }

      navigationOnPointerDown = true;
      scheduleNavigation();
    });

    const navigateToIntroOne = (event) => {
      const usesTouchInteraction = window.matchMedia(TOUCH_INTERACTION_QUERY).matches;
      const isTouchTap = touchActivation || (usesTouchInteraction && event.detail > 0);
      touchActivation = false;

      if (isTouchTap && (revealedOnPointerDown || navigationOnPointerDown)) {
        event.preventDefault();
        revealedOnPointerDown = false;
        navigationOnPointerDown = false;
        return;
      }

      if (
        usesTouchInteraction &&
        isTouchTap &&
        !game.classList.contains("is-revealed")
      ) {
        event.preventDefault();
        document.querySelectorAll(".game.is-revealed").forEach((revealedGame) => {
          revealedGame.classList.remove("is-revealed");
        });
        game.classList.add("is-revealed");
        return;
      }

      event.preventDefault();
      scheduleNavigation();
    };

    game.addEventListener("click", navigateToIntroOne);
    game.dataset.clickNavigationBound = "true";
  });
}

function animateIndexHeadings() {
  const headingGroups = INDEX_HEADING_SELECTORS.map((selector) =>
    document.querySelectorAll(selector),
  ).filter((group) => group.length);
  const headingSpans = headingGroups.flatMap((group) => [...group]);

  if (!headingSpans.length) return;

  const showHeadings = () => {
    headingSpans.forEach((span) => {
      span.style.opacity = "1";
      span.style.transform = "translate3d(0, 0, 0)";
    });
  };

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    typeof Element.prototype.animate !== "function"
  ) {
    showHeadings();
    return;
  }

  const duration = INDEX_HERO_REVEAL_DURATION * 1000;
  const stagger = INDEX_HERO_REVEAL_STAGGER * 1000;
  const groupDuration =
    duration +
    Math.max(...headingGroups.map((group) => group.length - 1)) * stagger;

  headingGroups.forEach((group, groupIndex) => {
    const offset =
      groupIndex === 1 ? `-${INDEX_SLIDE_OFFSET}` : INDEX_SLIDE_OFFSET;

    group.forEach((span, spanIndex) => {
      const animation = span.animate(
        [
          {
            opacity: 0,
            transform: `translate3d(${offset}, 0, 0)`,
          },
          {
            opacity: 1,
            transform: "translate3d(0, 0, 0)",
          },
        ],
        {
          delay:
            INDEX_HERO_REVEAL_DELAY * 1000 +
            groupIndex * groupDuration +
            spanIndex * stagger,
          duration,
          easing: INDEX_HERO_TEXT_EASE,
          fill: "forwards",
        },
      );

      animation.addEventListener(
        "finish",
        () => {
          span.style.opacity = "1";
          span.style.transform = "translate3d(0, 0, 0)";
          animation.cancel();
        },
        { once: true },
      );
    });
  });
}

function getAbsoluteHref(href, baseUrl) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
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

function adoptNewBody(newDocument) {
  const newBody = document.adoptNode(newDocument.body);
  newBody.classList.add("page-entering");
  document.documentElement.replaceChild(newBody, document.body);
  document.documentElement.classList.remove(
    "intro-page-nav-open",
    "intro-page-nav-closing",
    "intro-1-nav-open",
    "intro-1-nav-closing",
    "intro-1-section-active",
    "intro-1-nav-title-visible",
  );
  document.title = newDocument.title;

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

      if (!document.startViewTransition) {
        adoptNewBody(newDocument);
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
        adoptNewBody(newDocument);
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
  bindGameClickNavigation();
  animateIndexHeadings();
  initNavigationInterception();
}

document.addEventListener("DOMContentLoaded", initMainPage);
document.addEventListener("page:transitioned", initMainPage);
