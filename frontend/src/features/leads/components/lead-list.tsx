import {
  ArrowLeft,
  ArrowRight,
  CalendarBlank,
  MagnifyingGlass,
  Plus,
  UsersThree,
} from "@phosphor-icons/react";
import { Loading, ErrorState } from "@/components/ui/feedback";
import { isToday } from "@/lib/dates";
import { useWorkspaceClock } from "@/providers/workspace-context";
import { useWorkspace } from "@/features/workspace/store";
import { useDebounced } from "@/lib/use-debounced";
import { PAGE_SIZE } from "../api";
import { useLeads } from "../queries";
import { LeadRow } from "./lead-row";
import { LeadToolbar } from "./lead-toolbar";

export function LeadList() {
  const search = useWorkspace((state) => state.search);
  const status = useWorkspace((state) => state.status);
  const page = useWorkspace((state) => state.page);
  const selectLead = useWorkspace((state) => state.selectLead);
  const setPage = useWorkspace((state) => state.setPage);
  const debounced = useDebounced(search);
  const query = useLeads({ search: debounced, status, page });
  const { timeZone, now } = useWorkspaceClock();
  const today =
    query.data?.items.filter((lead) =>
      isToday(lead.follow_up_at, timeZone, new Date(now)),
    ) ?? [];
  const others =
    query.data?.items.filter(
      (lead) => !isToday(lead.follow_up_at, timeZone, new Date(now)),
    ) ?? [];
  const total = query.data?.total ?? 0;
  const busy = query.isFetching || search !== debounced;
  return (
    <section className="leads-section" aria-label="Lead workspace">
      <LeadToolbar />
      <div className="search-progress" role="status">
        {busy && !query.isPending ? "Updating your view…" : ""}
      </div>
      {query.isPending ? (
        <Loading label="Gathering your leads…" />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <div
          className={
            query.isPlaceholderData ? "list-content is-stale" : "list-content"
          }
          aria-busy={busy}
        >
          <section className="follow-up-section" id="follow-ups">
            <div className="section-title">
              <div>
                <CalendarBlank size={18} />
                <h2>Today’s follow-ups</h2>
                <span className="count-badge">{today.length}</span>
              </div>
              <span className="section-meta">
                {timeZone.replaceAll("_", " ")} · in this view
              </span>
            </div>
            {today.length ? (
              <div className="follow-up-list">
                {today.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    pinned
                    onSelect={() => selectLead(lead.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="follow-up-empty">
                <span className="empty-calendar">
                  <CalendarBlank size={23} weight="duotone" />
                </span>
                <span>
                  <strong>No follow-ups in this view today.</strong>
                  <small>
                    Add a reminder when you log your next conversation.
                  </small>
                </span>
              </div>
            )}
          </section>
          <section className="all-leads-section">
            <div className="section-title">
              <div>
                <UsersThree size={18} />
                <h2>{search.trim() ? "Search results" : "All leads"}</h2>
                <span className="count-badge">{total}</span>
              </div>
              <span className="section-meta">
                {search.trim()
                  ? "Including conversation history"
                  : "Most recent activity first"}
              </span>
            </div>
            {total === 0 ? (
              <div className="empty-state">
                <MagnifyingGlass size={34} weight="duotone" />
                <h3>
                  {search || status !== "all"
                    ? "No connections found"
                    : "Your next connection starts here"}
                </h3>
                <p>
                  {search || status !== "all"
                    ? "Try a different search or clear your filters."
                    : "Add your first lead and give every conversation a home."}
                </p>
                {search || status !== "all" ? (
                  <button
                    className="button secondary"
                    onClick={() => {
                      useWorkspace.getState().setSearch("");
                      useWorkspace.getState().setStatus("all");
                    }}
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    className="button primary"
                    onClick={() => useWorkspace.getState().setAddLeadOpen(true)}
                  >
                    <Plus size={16} />
                    Add your first lead
                  </button>
                )}
              </div>
            ) : others.length ? (
              <div className="lead-table">
                <div className="table-header">
                  <span>LEAD</span>
                  <span>LAST CONVERSATION</span>
                  <span>STATUS</span>
                  <span>FOLLOW-UP</span>
                </div>
                {others.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    onSelect={() => selectLead(lead.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="all-pinned-note">
                All leads on this page are pinned above for today.
              </p>
            )}
          </section>
          {total > 0 && (
            <div className="pagination">
              <span>
                Showing {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, total)} of {total} leads
              </span>
              <div>
                <button
                  className="button secondary compact"
                  disabled={page === 0 || busy}
                  onClick={() => setPage(page - 1)}
                >
                  <ArrowLeft size={15} />
                  Previous
                </button>
                <button
                  className="button secondary compact"
                  disabled={(page + 1) * PAGE_SIZE >= total || busy}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
