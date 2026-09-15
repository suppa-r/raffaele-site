(function () {
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const getSavedTheme = () => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "auto") {
        localStorage.setItem("theme", "system");
        return "system";
      }

      return ["light", "dark", "system"].includes(saved) ? saved : "system";
    } catch {
      return "system";
    }
  };

  const resolveTheme = (theme) =>
    theme === "system" ? getSystemTheme() : theme;

  const actualTheme = resolveTheme(getSavedTheme());
  const current = document.documentElement.getAttribute("data-theme");

  if (current !== actualTheme) {
    document.documentElement.setAttribute("data-theme", actualTheme);
  }
})();
