const navbar = document.querySelector(".navbar");
const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
const navLinks = document.querySelector(".step-nav");
const intro = document.querySelector(".intro");
let isMenuOpen = false;

// Scroll effect
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Toggle mobile menu
function toggleMenu() {
  isMenuOpen = !isMenuOpen;
  mobileNavToggle.classList.toggle("active");
  navLinks.classList.toggle("active");
  document.body.style.overflow = isMenuOpen ? "hidden" : "";
}

// Hide or show .section-content
if (isMenuOpen) {
  intro.classList.add("hidden");
} else {
  intro.classList.remove("hidden");
}

mobileNavToggle.addEventListener("click", toggleMenu);
overlay.addEventListener("click", toggleMenu);

// Close mobile menu when clicking a link
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    if (isMenuOpen) toggleMenu();
  });
});

// Close menu on escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isMenuOpen) toggleMenu();
});

// Prevent scroll when menu is open
window.addEventListener("resize", () => {
  if (window.innerWidth > 768 && isMenuOpen) {
    toggleMenu();
  }
});
