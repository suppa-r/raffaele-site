const PARTICLE_COUNT = 20;
const PARTICLE_REMOVE_MS = 1000;
const PAGE_LEAVE_CLASS = "is-leaving";
const PARTICLE_DISTANCE_MIN = 20;
const PARTICLE_DISTANCE_MAX = 100;

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

function initMainPage() {
  bindSneakerButton();
}

document.addEventListener("DOMContentLoaded", initMainPage);
document.addEventListener("page:transitioned", initMainPage);
