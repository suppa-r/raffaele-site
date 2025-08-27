// You should also save the preference
// so when a user comes back, they don't have
// to set it again.
// Restore theme preference on page load
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const isPortrait = window.matchMedia('(orientation: portrait)').matches;
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme-preference");
  if (savedTheme) {
    updateTheme(savedTheme);
    const radio = document.querySelector(`[name=theme][value="${savedTheme}"]`);
    if (radio) radio.checked = true;
  }
});

function updateTheme(selectedTheme) {
  if (selectedTheme === "system") {
    document.documentElement.style.removeProperty("--theme");
  } else {
    document.documentElement.style.setProperty("--theme", selectedTheme);
  }
  // Save preference
  localStorage.setItem("theme-preference", selectedTheme);
}

Array.from(document.querySelectorAll("[name=theme]")).forEach((radio) => {
  radio.addEventListener("change", (event) => {
    const selectedTheme = event.target.value;

    if (!document.startViewTransition) {
      updateTheme(selectedTheme);
      return;
    }

    document.startViewTransition(() => {
      updateTheme(selectedTheme);
    });
  });
});

