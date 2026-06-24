import { useState, useEffect } from "react";
import { isLoggedIn } from "./api.js";
import LoginScreen from "./shared/LoginScreen.jsx";
import { ModuleProvider } from "./core/ModuleProvider.jsx";
import Shell from "./core/Shell.jsx";
import { G } from "./shared/globalStyles.js";
import { I18nProvider } from "./i18n/index.jsx";

// Apply saved theme before first render to avoid flash
const savedTheme = localStorage.getItem("vent_theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.documentElement.setAttribute("data-theme", savedTheme);

export default function App() {
  const [ok, setOk] = useState(() => isLoggedIn());

  if (!ok) {
    return (
      <I18nProvider>
        <style>{G}</style>
        <LoginScreen onUnlock={() => setOk(true)} />
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <style>{G}</style>
      <ModuleProvider>
        <Shell onLogout={() => setOk(false)} />
      </ModuleProvider>
    </I18nProvider>
  );
}
