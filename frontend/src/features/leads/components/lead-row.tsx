import { CaretRight, ChatCircleText, Clock } from "@phosphor-icons/react";
import { dateTime, initials, relativeTime, reminderState } from "@/lib/dates";
import { useWorkspaceClock } from "@/providers/workspace-context";
import type { Lead } from "../types";
import { StatusBadge } from "./status-badge";

export function LeadRow({
  lead,
  onSelect,
  pinned = false,
}: {
  lead: Lead;
  onSelect: () => void;
  pinned?: boolean;
}) {
  const { now, timeZone } = useWorkspaceClock();
  const overdue = reminderState(lead.follow_up_at, timeZone, now) === "overdue";
  return (
    <button
      className={`lead-row ${pinned ? "pinned-row" : ""}`}
      onClick={onSelect}
      aria-label={`Open ${lead.name}`}
    >
      <span className={`avatar avatar-${lead.status}`}>
        {initials(lead.name)}
      </span>
      <span className="lead-identity">
        <strong>{lead.name}</strong>
        <span>{lead.company || "Independent lead"}</span>
      </span>
      <span className="lead-note">
        <span>
          <ChatCircleText size={15} />
          {lead.last_note || "Start the conversation"}
        </span>
        <small>{relativeTime(lead.last_discussion_at, now)}</small>
      </span>
      <span className="lead-status">
        <StatusBadge status={lead.status} />
      </span>
      <span className={`lead-reminder ${overdue ? "overdue" : ""}`}>
        {lead.follow_up_at ? (
          <>
            <Clock size={15} />
            <span>
              {dateTime(lead.follow_up_at, timeZone)}
              {overdue && <small>Overdue</small>}
            </span>
          </>
        ) : (
          <span className="no-reminder">No follow-up</span>
        )}
      </span>
      <CaretRight className="row-chevron" size={17} />
    </button>
  );
}
