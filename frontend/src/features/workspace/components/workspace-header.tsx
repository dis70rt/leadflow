import { Plus, SignOut } from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/store";
import { useSignOut } from "@/features/auth/use-sign-out";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useWorkspaceClock } from "@/providers/workspace-context";
import { useWorkspace } from "../store";

export function WorkspaceHeader() {
  const logout = useSignOut();
  const user = useAuth((state) => state.user);
  const setAddLeadOpen = useWorkspace((state) => state.setAddLeadOpen);
  const { timeZone, now } = useWorkspaceClock();
  const date = new Intl.DateTimeFormat("en", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  return (
    <>
      <header className="topbar">
        <div className="breadcrumb">
          Workspace<span>/</span>
          <strong>Leads</strong>
        </div>
        <div className="topbar-right">
          <span className="demo-pill">Demo workspace</span>
          <span className="mobile-theme">
            <ThemeToggle />
            <button
              className="icon-button"
              aria-label="Sign out"
              onClick={logout}
            >
              <SignOut size={18} />
            </button>
          </span>
        </div>
      </header>
      <div className="page-heading">
        <div>
          <p className="greeting">
            Hello, {user?.name.split(" ")[0]}. Let’s make a connection.
          </p>
          <h1>
            Your leads, in focus<span>.</span>
          </h1>
          <p className="page-subtitle">
            Every conversation in one place. Every next step, a little clearer.
          </p>
        </div>
        <div className="heading-actions">
          <span className="today-date">{date}</span>
          <button
            className="button primary"
            onClick={() => setAddLeadOpen(true)}
          >
            <Plus size={18} weight="bold" />
            Add new lead
          </button>
        </div>
      </div>
    </>
  );
}
