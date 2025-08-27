const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)');
const isPortrait = window.matchMedia('(orientation: portrait)');

function getSystemTheme() {
  if (prefersDark.matches) return 'dark';
  if (prefersLight.matches) return 'light';
  return 'system';
}

function applyTheme(theme) {
  if (theme === 'system') {
    document.documentElement.setAttribute('data-theme', getSystemTheme());
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme-preference");
  if (savedTheme) {
    applyTheme(savedTheme);
    const radio = document.querySelector(`[name=theme][value="${savedTheme}"]`);
    if (radio) radio.checked = true;
  } else {
    applyTheme('system');
    const radio = document.querySelector(`[name=theme][value="system"]`);
    if (radio) radio.checked = true;
  }

  prefersDark.addEventListener('change', () => {
    if (localStorage.getItem("theme-preference") === 'system') {
      applyTheme('system');
    }
  });
  prefersLight.addEventListener('change', () => {
    if (localStorage.getItem("theme-preference") === 'system') {
      applyTheme('system');
    }
  // Orientation change event listener is currently not used. Add logic here if needed in the future.
  // isPortrait.addEventListener('change', () => {
  //   // Handle orientation changes if required
  // });
  });
});
const supportsViewTransition = !!document.startViewTransition;

Array.from(document.querySelectorAll("[name=theme]")).forEach((radio) => {
  radio.addEventListener("change", (event) => {
    const selectedTheme = event.target.value;
    localStorage.setItem("theme-preference", selectedTheme);

    if (!supportsViewTransition) {
      applyTheme(selectedTheme);
      return;
    }

    document.startViewTransition(() => {
      applyTheme(selectedTheme);
    });
  });
});


