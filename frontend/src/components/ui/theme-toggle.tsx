"use client";
import { MoonStars, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { type MouseEvent, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
const subscribe = () => () => {};
let transitioning = false;
export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();
  const dark = !mounted || theme === "dark";
  async function toggleTheme(event: MouseEvent<HTMLButtonElement>) {
    if (transitioning) return;
    const nextTheme = dark ? "light" : "dark";
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(nextTheme);
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    transitioning = true;
    document.documentElement.classList.add("theme-reveal");
    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(nextTheme));
    });
    try {
      await transition.ready;
      await document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 800,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      ).finished;
    } catch {
      transition.skipTransition();
    } finally {
      await transition.finished;
      document.documentElement.classList.remove("theme-reveal");
      transitioning = false;
    }
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
