"use client";
import { useEffect, useRef, useState } from "react";
import { loadPaperPlane } from "./runtime";

export function usePaperPlane() {
  const stageRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<Awaited<ReturnType<typeof loadPaperPlane>>>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    let disposed = false;
    let destroy: (() => void) | undefined;
    void loadPaperPlane()
      .then(({ kernel, figure }) => {
        const stage = stageRef.current;
        if (disposed || !stage) return;
        kernel.inject(document);
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const syncMotion = () => kernel.setReducedMotion(media.matches);
        syncMotion();
        media.addEventListener("change", syncMotion);
        const svg = kernel.mk(
          "svg",
          { viewBox: "0 0 400 320", "aria-hidden": "true" },
          stage,
        );
        const handle = figure.mount(
          { stage, svg, read: { textContent: "rest" } },
          figure.range[1],
        );
        runtimeRef.current = { kernel, figure };
        destroy = () => {
          media.removeEventListener("change", syncMotion);
          handle.destroy();
          svg.remove();
          runtimeRef.current = null;
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

  useEffect(() => {
    const stage = stageRef.current;
    const runtime = runtimeRef.current;
    if (!ready || !playing || !stage || !runtime) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let flight: { stop(): void } | undefined;
    let visible = false;
    const stop = () => {
      flight?.stop();
      flight = undefined;
    };
    const sync = () => {
      stop();
      if (visible && !document.hidden && !media.matches) {
        flight = runtime.kernel.tour(stage, runtime.figure.tour);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(stage);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      stop();
    };
  }, [ready, playing]);

  return { stageRef, ready, failed, playing, setPlaying };
}
