import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useWorkspace } from "@/features/workspace/store";
import { STATUSES, STATUS_LABELS, type LeadStatus } from "../types";

export function LeadToolbar() {
  const search = useWorkspace((state) => state.search);
  const status = useWorkspace((state) => state.status);
  const setSearch = useWorkspace((state) => state.setSearch);
  const setStatus = useWorkspace((state) => state.setStatus);
  return (
    <div className="lead-toolbar">
      <div className="search-field">
        <MagnifyingGlass size={19} />
        <input
          aria-label="Search leads and discussions"
          placeholder="Search names, companies, or conversations…"
          value={search}
          maxLength={200}
          onChange={(event) => setSearch(event.target.value)}
          type="search"
        />
        {search && (
          <button
            className="icon-button"
            aria-label="Clear search"
            onClick={() => setSearch("")}
          >
            <X size={15} />
          </button>
        )}
      </div>
      <label className="status-filter">
        <span className="sr-only">Filter by status</span>
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as LeadStatus | "all")
          }
        >
          <option value="all">All statuses</option>
          {STATUSES.map((stage) => (
            <option value={stage} key={stage}>
              {STATUS_LABELS[stage]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
