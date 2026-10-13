"use client";
import { useEffect, useRef, useState } from "react";
import { loadPaperPlane } from "./runtime";

export function usePaperPlane() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let destroy: (() => void) | undefined;
    void loadPaperPlane()
      .then(({ kernel, figure }) => {
        const stage = stageRef.current;
        if (disposed || !stage) return;
        kernel.inject(document);
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        kernel.setReducedMotion(media.matches);
        stage.dataset.flightPaused = "true";
        const svg = kernel.mk(
          "svg",
          { viewBox: "0 0 400 320", "aria-hidden": "true" },
          stage,
        );
        const handle = figure.mount(
          { stage, svg, read: { textContent: "rest" } },
          figure.range[1],
        );
        let visible = false;
        const sync = () => {
          kernel.setReducedMotion(media.matches);
          stage.dataset.flightPaused = String(
            !visible || document.hidden || media.matches,
          );
          handle.set(figure.range[1]);
        };
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          sync();
        });
        observer.observe(stage);
        media.addEventListener("change", sync);
        document.addEventListener("visibilitychange", sync);
        destroy = () => {
          observer.disconnect();
          media.removeEventListener("change", sync);
          document.removeEventListener("visibilitychange", sync);
          handle.destroy();
          svg.remove();
        };
        setReady(true);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      destroy?.();
    };
  }, []);

  return { stageRef, ready, failed };
}
