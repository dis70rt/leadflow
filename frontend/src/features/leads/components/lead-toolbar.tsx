import { SearchBox } from "@/features/search/components/search-box";
import { useWorkspace } from "@/features/workspace/store";
import { STATUSES, STATUS_LABELS, type LeadStatus } from "../types";

export function LeadToolbar() {
  const status = useWorkspace((state) => state.status);
  const setStatus = useWorkspace((state) => state.setStatus);
  return (
    <div className="lead-toolbar">
      <SearchBox />
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
