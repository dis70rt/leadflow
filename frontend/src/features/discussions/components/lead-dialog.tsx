import { Phone, SpinnerGap } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { ErrorState } from "@/components/ui/feedback";
import { useLead, useUpdateLead } from "@/features/leads/queries";
import {
  STATUSES,
  STATUS_LABELS,
  type LeadStatus,
} from "@/features/leads/types";
import { useWorkspace } from "@/features/workspace/store";
import { dateTime } from "@/lib/dates";
import { errorMessage } from "@/lib/http";
import { useWorkspaceClock } from "@/providers/workspace-context";
import { DiscussionForm } from "./discussion-form";
import { Timeline } from "./timeline";
import { LeadDetailsSkeleton } from "./timeline-skeleton";

export function LeadDialog() {
  const id = useWorkspace((state) => state.selectedLeadId);
  return id ? <LeadDialogContent key={id} id={id} /> : null;
}
function LeadDialogContent({ id }: { id: string }) {
  const query = useLead(id);
  const update = useUpdateLead(id);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const { timeZone } = useWorkspaceClock();
  const lead = query.data;
  function close() {
    if (
      !saving &&
      !update.isPending &&
      (!dirty || window.confirm("Discard your unsaved conversation?"))
    )
      useWorkspace.getState().selectLead(null);
  }
  async function changeStatus(status: LeadStatus) {
    try {
      await update.mutateAsync({ status });
      toast.success(`Lead moved to ${STATUS_LABELS[status]}`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }
  async function clearReminder() {
    try {
      await update.mutateAsync({ follow_up_at: null });
      toast.success("Follow-up cleared");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }
  return (
    <Modal
      open
      wide
      onOpenChange={(value) => {
        if (!value) close();
      }}
      title={lead?.name ?? "Lead details"}
      description={
        lead?.company ?? "Your conversations and next steps, in one place."
      }
    >
      {query.isPending ? (
        <LeadDetailsSkeleton />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        lead && (
          <>
            <div className="lead-detail-bar">
              <span className="phone-detail">
                <Phone size={16} />
                {lead.phone || "No phone added"}
              </span>
              <label className="status-select">
                <span>Status</span>
                {update.isPending && <SpinnerGap className="spin" size={15} />}
                <select
                  aria-label="Lead status"
                  value={lead.status}
                  disabled={saving || update.isPending}
                  onChange={(event) =>
                    void changeStatus(event.target.value as LeadStatus)
                  }
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {lead.follow_up_at && (
              <div className="active-reminder">
                <span>
                  Next follow-up · {dateTime(lead.follow_up_at, timeZone)}
                </span>
                <button
                  disabled={saving || update.isPending}
                  onClick={() => void clearReminder()}
                >
                  Clear reminder
                </button>
              </div>
            )}
            <div className="timeline-scroll">
              <Timeline leadId={id} />
            </div>
            <DiscussionForm
              lead={lead}
              onDirtyChange={setDirty}
              onPendingChange={setSaving}
            />
          </>
        )
      )}
    </Modal>
  );
}
