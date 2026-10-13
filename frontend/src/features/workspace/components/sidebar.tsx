"use client";
import {
  ArrowUpRight,
  CaretDown,
  CheckCircle,
  SignOut,
  SquaresFour,
  UsersThree,
} from "@phosphor-icons/react";
import { Brand } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/features/auth/store";
import { useSignOut } from "@/features/auth/use-sign-out";
import { useLeadCounts } from "@/features/leads/queries";
import { STATUSES, STATUS_LABELS } from "@/features/leads/types";
import { initials } from "@/lib/dates";
import { useWorkspace } from "../store";

export function Sidebar() {
  const user = useAuth((state) => state.user);
  const logout = useSignOut();
  const status = useWorkspace((state) => state.status);
  const setStatus = useWorkspace((state) => state.setStatus);
  const counts = useLeadCounts();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Brand />
      </div>
      <div className="workspace-label">
        <span className="workspace-icon">
          <SquaresFour size={18} weight="fill" />
        </span>
        <span>
          <strong>Sales workspace</strong>
          <small>Personal workspace</small>
        </span>
        <CaretDown size={14} />
      </div>
      <nav className="sidebar-navigation" aria-label="Lead navigation">
        <span className="nav-caption">WORKSPACE</span>
        <button
          className={`nav-item ${status === "all" ? "active" : ""}`}
          onClick={() => setStatus("all")}
        >
          <UsersThree
            size={20}
            weight={status === "all" ? "fill" : "regular"}
          />
          All leads<span className="nav-count">{counts.all ?? "—"}</span>
        </button>
        <span className="nav-caption stage-caption">PIPELINE STAGES</span>
        {STATUSES.map((stage) => (
          <button
            key={stage}
            className={`nav-item stage-nav ${status === stage ? "active" : ""}`}
            onClick={() => setStatus(stage)}
            aria-pressed={status === stage}
          >
            <span className={`stage-dot dot-${stage}`} />
            {STATUS_LABELS[stage]}
            <span className="nav-count">{counts[stage] ?? "—"}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="workspace-tip">
          <CheckCircle size={21} weight="duotone" />
          <strong>Keep the conversation going.</strong>
          <p>A thoughtful follow-up can make all the difference.</p>
          <a href="#follow-ups">
            See today’s priorities
            <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="sidebar-tools">
          <span>Make it your own</span>
          <ThemeToggle />
        </div>
        <div className="user-profile">
          <span className="avatar user-avatar">
            {initials(user?.name ?? "You")}
          </span>
          <span>
            <strong>{user?.name}</strong>
            <small>Demo session</small>
          </span>
          <button
            className="icon-button"
            aria-label="Sign out"
            title="Sign out"
            onClick={logout}
          >
            <SignOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
