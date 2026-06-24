import { useState, useEffect } from "react";

const STORAGE_KEY = "vent_theme";

function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return saved;
  // Respect OS preference if no saved choice
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function setTheme(t) {
    setThemeState(t);
    applyTheme(t);
  }

  function toggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return { theme, setTheme, toggle, isDark: theme === "dark" };
}

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={isDark ? "Cambiar a modo claro / Switch to light mode" : "Cambiar a modo oscuro / Switch to dark mode"}
      style={{
        width: 36, height: 36, borderRadius: "var(--r-full)",
        border: "1px solid var(--out)", background: "var(--sur)",
        cursor: "pointer", fontSize: 16, display: "flex",
        alignItems: "center", justifyContent: "center",
        transition: "background .2s, border-color .2s",
        flexShrink: 0,
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
