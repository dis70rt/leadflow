"use client";
import {
  Bell,
  CalendarCheck,
  ChatCircleDots,
  Check,
  FlowArrow,
  Target,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import { useEffect, useId, useRef } from "react";

const connections = [
  { name: "lead", path: "M72 58 C190 58 172 150 300 150", delay: 0 },
  { name: "discussion", path: "M72 150 H300", delay: 1.1 },
  { name: "reminder", path: "M72 242 C190 242 172 150 300 150", delay: 2.2 },
  { name: "qualified", path: "M300 150 C420 150 410 58 528 58", delay: 2.8 },
  { name: "follow-up", path: "M528 58 V150", delay: 3.8 },
  { name: "won", path: "M528 150 V242", delay: 4.8 },
];

function WorkflowNode({
  icon: NodeIcon,
  label,
  x,
  y,
  tone = "",
}: {
  icon: Icon;
  label: string;
  x: number;
  y: number;
  tone?: string;
}) {
  return (
    <div
      className={`workflow-node ${tone}`}
      style={{ left: `${x}%`, top: y }}
      aria-hidden="true"
    >
      <NodeIcon size={19} weight="duotone" />
      <span>{label}</span>
    </div>
  );
}

export function CrmWorkflow() {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      const paused = !visible || document.hidden || media.matches;
      root.dataset.motion = paused ? "paused" : "running";
      if (paused) svg.pauseAnimations?.();
      else svg.unpauseAnimations?.();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    sync();
    observer.observe(root);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      svg.pauseAnimations?.();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="crm-workflow"
      role="img"
      aria-label="LeadFlow brings leads, discussions, and reminders together in one CRM workspace, helping you qualify leads, follow up, and win deals."
    >
      <svg
        ref={svgRef}
        className="workflow-connections"
        viewBox="0 0 600 300"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {connections.map((connection) => (
            <path
              id={`${id}-${connection.name}`}
              key={connection.name}
              d={connection.path}
            />
          ))}
        </defs>
        {connections.map((connection) => (
          <g
            key={connection.name}
            className={`workflow-link workflow-${connection.name}`}
          >
            <use href={`#${id}-${connection.name}`} className="workflow-wire" />
            <circle r="3.4" className="workflow-packet">
              <animateMotion
                dur="3.2s"
                begin={`${-connection.delay}s`}
                repeatCount="indefinite"
                calcMode="spline"
                keyPoints="0;1"
                keyTimes="0;1"
                keySplines="0.4 0 0.2 1"
              >
                <mpath href={`#${id}-${connection.name}`} />
              </animateMotion>
            </circle>
          </g>
        ))}
      </svg>
      <WorkflowNode icon={UsersThree} label="New leads" x={12} y={58} />
      <WorkflowNode icon={ChatCircleDots} label="Discussions" x={12} y={150} />
      <WorkflowNode icon={Bell} label="Reminders" x={12} y={242} />
      <div className="workflow-hub" aria-hidden="true">
        <span className="workflow-hub-symbol">
          <FlowArrow size={28} weight="bold" />
        </span>
        <strong>LeadFlow</strong>
        <span>CRM workspace</span>
      </div>
      <WorkflowNode
        icon={Target}
        label="Qualified"
        x={88}
        y={58}
        tone="workflow-qualified-node"
      />
      <WorkflowNode
        icon={CalendarCheck}
        label="Follow-up"
        x={88}
        y={150}
        tone="workflow-follow-up-node"
      />
      <WorkflowNode
        icon={Check}
        label="Won"
        x={88}
        y={242}
        tone="workflow-won-node"
      />
    </div>
  );
}
