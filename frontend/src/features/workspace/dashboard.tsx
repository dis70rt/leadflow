"use client";
import { AddLeadDialog } from "@/features/leads/components/add-lead-dialog";
import { LeadList } from "@/features/leads/components/lead-list";
import { LeadDialog } from "@/features/discussions/components/lead-dialog";
import { Sidebar } from "./components/sidebar";
import { WorkspaceHeader } from "./components/workspace-header";
import { PipelineSummary } from "./components/pipeline-summary";

export function Dashboard() {
  return (
    <div className="workspace-shell">
      <a className="skip-link" href="#main">
        Skip to leads
      </a>
      <Sidebar />
      <main className="workspace-main" id="main">
        <WorkspaceHeader />
        <div className="workspace-content">
          <PipelineSummary />
          <LeadList />
          <footer className="workspace-footer">
            <span>A little more personal. A lot more organized.</span>
            <span>LeadFlow</span>
          </footer>
        </div>
      </main>
      <AddLeadDialog />
      <LeadDialog />
    </div>
  );
}
