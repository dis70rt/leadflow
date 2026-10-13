import { STATUS_LABELS, type LeadStatus } from "../types";
export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`status-badge status-${status}`}>
      <span />
      {STATUS_LABELS[status]}
    </span>
  );
}
