const TOUCH_INTERACTION_QUERY = "(hover: none) and (pointer: coarse)";
const NAVIGATION_SCROLL_BEHAVIOR = "manual";
const WHIMSY_BUTTON_SELECTOR = '.btn[data-btn-type="whimsical"]';
// The touch deco fades out by 1.0s; keep a brief buffer before navigating.
const WHIMSY_TOUCH_PLAY_DURATION = 1000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function initHomeTitleAnimation() {
  const title = document.querySelector(".text-with-animation[data-theme-transition-text]");
  if (!title || title.querySelector(".title-letters") || !Intl.Segmenter) return;

  const text = title.textContent;
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const characters = Array.from(segmenter.segment(text), ({ segment }) => segment);
  const midpoint = Math.floor(characters.filter((character) => character.trim()).length / 2);
  const accessibleText = document.createElement("span");
  accessibleText.className = "visually-hidden";
  accessibleText.textContent = text;

  const letters = document.createElement("span");
  letters.className = "title-letters";
  letters.setAttribute("aria-hidden", "true");

  let letterIndex = 0;
  characters.forEach((character) => {
    if (!character.trim()) {
      letters.appendChild(document.createTextNode(character));
      return;
    }

    const letter = document.createElement("span");
    letter.textContent = character;
    if (letterIndex >= midpoint) letter.classList.add("title-letter-from-right");
    letterIndex += 1;
    letters.appendChild(letter);
  });

  title.replaceChildren(accessibleText, letters);
}

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

function bindWhimsyButtonTouchPlayback() {
  const buttons = document.querySelectorAll(WHIMSY_BUTTON_SELECTOR);
  if (!buttons.length) return;

  buttons.forEach((button) => {
    if (button.dataset.whimsyTouchBound === "true") return;

    let playbackTimer = 0;
    let navigationTimer = 0;
    let playbackStartedAt = 0;
    let touchActivation = false;
    let navigationPending = false;

    const stopPlayback = () => {
      window.clearTimeout(playbackTimer);
      button.classList.remove("is-playing");
    };

    const cancelPlayback = () => {
      window.clearTimeout(navigationTimer);
      navigationPending = false;
      touchActivation = false;
      stopPlayback();
    };

    // Touch devices never resolve :hover, so a tap drives the same deco effect.
    button.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch") return;

      touchActivation = true;
      if (navigationPending) return;

      window.clearTimeout(playbackTimer);
      playbackStartedAt = performance.now();
      button.classList.add("is-playing");
      playbackTimer = window.setTimeout(
        stopPlayback,
        WHIMSY_TOUCH_PLAY_DURATION,
      );
    });

    // Hold the tap navigation until the deco animation has finished playing.
    button.addEventListener("click", (event) => {
      const isTouchTap = touchActivation;
      touchActivation = false;

      if (!isTouchTap || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

      event.preventDefault();

      if (navigationPending) return;
      navigationPending = true;

      const elapsed = performance.now() - playbackStartedAt;
      const remaining = Math.max(WHIMSY_TOUCH_PLAY_DURATION - elapsed, 0);

      navigationTimer = window.setTimeout(() => {
        navigationPending = false;
        window.location.assign(button.href);
      }, remaining);
    });

    button.addEventListener("pointercancel", cancelPlayback);
    button.dataset.whimsyTouchBound = "true";
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
  const pendingStylesheets = [];

  newStylesheets.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const absoluteHref = getAbsoluteHref(href, destinationUrl);
    if (currentHrefSet.has(absoluteHref)) return;

    const clone = link.cloneNode(true);
    clone.media = "not all";
    pendingStylesheets.push({ clone, media: link.getAttribute("media") });
    const loadPromise = new Promise((resolve, reject) => {
      clone.addEventListener("load", resolve, { once: true });
      clone.addEventListener("error", () => {
        reject(new Error(`Stylesheet failed to load: ${absoluteHref}`));
      }, { once: true });
    });

    promises.push(loadPromise);
    document.head.appendChild(clone);
  });

  return Promise.all(promises).then(() => pendingStylesheets);
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

    await new Promise((resolve, reject) => {
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
      clone.addEventListener("error", () => {
        reject(new Error(`Script failed to load: ${absoluteSrc}`));
      }, { once: true });
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
      let newDocument;
      try {
        newDocument = await fetchDocument(event.destination.url);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Page navigation failed:", error);
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

      let pendingStylesheets;
      try {
        pendingStylesheets = await loadNewStylesheets(
          newStylesheets,
          currentHrefSet,
          event.destination.url,
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Page styles failed to load:", error);
        window.location.href = event.destination.url;
        return;
      }

      const updatePage = async () => {
        pendingStylesheets.forEach(({ clone, media }) => {
          if (media === null) {
            clone.removeAttribute("media");
          } else {
            clone.media = media;
          }
        });
        removeOldStylesheets(newHrefSet);
        adoptNewBody(newDocument);
        initHomeTitleAnimation();
        await loadMissingScripts(
          newScripts,
          currentSrcSet,
          event.destination.url,
        );
        window.scrollTo(0, 0);
      };

      if (!document.startViewTransition) {
        try {
          await updatePage();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Page initialization failed:", error);
          window.location.href = event.destination.url;
          return;
        }
        document.body.classList.remove("page-entering");
        document.dispatchEvent(new CustomEvent("page:transitioned"));
        return;
      }

      document.documentElement.classList.add("page-transitioning");
      const transition = document.startViewTransition(updatePage);

      transition.ready
        .then(() => {
          window.scrollTo(0, 0);
        })
        .catch(() => {
          // no-op: transition ready may reject when interrupted
        });

      try {
        await transition.updateCallbackDone;
      } catch (error) {
        document.documentElement.classList.remove("page-transitioning");
        // eslint-disable-next-line no-console
        console.error("Page initialization failed:", error);
        window.location.href = event.destination.url;
        return;
      }

      try {
        await transition.finished;
      } catch {
        // no-op: transition finished may reject when interrupted
      }

      document.documentElement.classList.remove("page-transitioning");
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
  initHomeTitleAnimation();
  bindGameClickNavigation();
  bindWhimsyButtonTouchPlayback();
  initNavigationInterception();
}

document.addEventListener("DOMContentLoaded", initMainPage);
document.addEventListener("page:transitioned", initMainPage);
