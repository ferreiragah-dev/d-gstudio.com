"use client";
import { useEffect, useSyncExternalStore } from "react";
import { MoonStar, SunMedium } from "lucide-react";
function subscribe(callback: () => void) {
  window.addEventListener("dg-theme", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("dg-theme", callback);
    window.removeEventListener("storage", callback);
  };
}
function snapshot() {
  const stored = localStorage.getItem("dgstudio-theme");
  return stored === "light" || stored === "dark"
    ? stored
    : matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
}
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "dark");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      onClick={() => {
        localStorage.setItem(
          "dgstudio-theme",
          theme === "dark" ? "light" : "dark",
        );
        window.dispatchEvent(new Event("dg-theme"));
      }}
    >
      {theme === "dark" ? <SunMedium size={17} /> : <MoonStar size={17} />}
    </button>
  );
}
