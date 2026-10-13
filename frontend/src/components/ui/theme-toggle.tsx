"use client";
import { MoonStars, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
const subscribe = () => () => {};
let transitionTimer: number | undefined;
export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();
  const dark = !mounted || theme === "dark";
  function toggleTheme() {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("theme-transition");
      window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(() => {
        document.documentElement.classList.remove("theme-transition");
      }, 350);
    }
    setTheme(dark ? "light" : "dark");
  }
  return (
    <button
      className="icon-button"
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
    >
      {dark ? <Sun size={20} /> : <MoonStars size={20} />}
    </button>
  );
}
