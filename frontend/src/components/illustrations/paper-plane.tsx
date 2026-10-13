"use client";
import { usePaperPlane } from "@/lib/hairline/use-paper-plane";
import { PaperPlaneMark } from "./paper-plane-mark";

export function PaperPlane() {
  const { stageRef, ready, failed } = usePaperPlane();
  return (
    <div className="paper-plane-figure" aria-hidden="true">
      <div
        className="hairline-stage"
        data-hairline="paper-plane"
        data-flight="ambient"
        ref={stageRef}
      >
        {(!ready || failed) && <PaperPlaneMark className="plane-fallback" />}
      </div>
    </div>
  );
}
