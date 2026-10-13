"use client";
import { Pause, Play } from "@phosphor-icons/react";
import { usePaperPlane } from "@/lib/hairline/use-paper-plane";
import { PaperPlaneMark } from "./paper-plane-mark";

export function PaperPlane() {
  const { stageRef, ready, failed, playing, setPlaying } = usePaperPlane();
  return (
    <figure className="paper-plane-figure">
      <div
        className="hairline-stage"
        data-hairline="paper-plane"
        ref={stageRef}
        role="img"
        aria-label="An isometric folded paper plane that banks toward your pointer."
        onPointerMove={() => setPlaying(false)}
      >
        {(!ready || failed) && <PaperPlaneMark className="plane-fallback" />}
      </div>
      <figcaption className="plane-caption">
        <span>A little follow-through goes a long way.</span>
        {ready && (
          <button
            type="button"
            className="plane-play"
            aria-label={playing ? "Pause flight" : "Play flight"}
            aria-pressed={playing}
            onClick={() => setPlaying(!playing)}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? "Pause flight" : "Play flight"}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
