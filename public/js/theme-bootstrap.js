(function () {
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const getSavedTheme = () => {
    try {
      const saved = localStorage.getItem("theme");
      return ["light", "dark", "auto"].includes(saved) ? saved : "auto";
    } catch {
      return "auto";
    }
  };

  const resolveTheme = (theme) => (theme === "auto" ? getSystemTheme() : theme);

  const actualTheme = resolveTheme(getSavedTheme());
  const current = document.documentElement.getAttribute("data-theme");

  if (current !== actualTheme) {
    document.documentElement.setAttribute("data-theme", actualTheme);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = getSavedTheme();
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        button.dataset.themeToggle === savedTheme ? "true" : "false",
      );
    });
  });
})();
