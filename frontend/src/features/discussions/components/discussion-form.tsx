import { ArrowUp, CalendarBlank, SpinnerGap } from "@phosphor-icons/react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/http";
import type { Lead } from "@/features/leads/types";
import { useCreateDiscussion } from "../queries";

export function DiscussionForm({
  lead,
  onDirtyChange,
  onPendingChange,
}: {
  lead: Lead;
  onDirtyChange: (dirty: boolean) => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [date, setDate] = useState("");
  const create = useCreateDiscussion(lead.id);
  const closed = lead.status === "won" || lead.status === "lost";
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  function updateDirty(nextNote: string, nextFollowUp: boolean) {
    onDirtyChange(Boolean(nextNote || nextFollowUp));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!note.trim()) return;
    onPendingChange(true);
    try {
      await create.mutateAsync({
        note: note.trim(),
        ...(followUp && !closed && date
          ? { follow_up_at: new Date(date).toISOString() }
          : {}),
      });
      setNote("");
      setFollowUp(false);
      setDate("");
      onDirtyChange(false);
      toast.success("Conversation saved");
    } catch {
      /* Keep the draft intact; the error appears below. */
    } finally {
      onPendingChange(false);
    }
  }
  return (
    <form className="discussion-form" onSubmit={submit}>
      <label htmlFor="discussion-note">Keep the conversation going</label>
      <textarea
        id="discussion-note"
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
          updateDirty(event.target.value, followUp);
        }}
        placeholder="What did you discuss? Capture the details that matter…"
        rows={3}
        maxLength={10000}
        required
        disabled={create.isPending}
      />
      <div className="discussion-form-actions">
        <div className="reminder-controls">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={followUp && !closed}
              disabled={closed || create.isPending}
              onChange={(event) => {
                setFollowUp(event.target.checked);
                updateDirty(note, event.target.checked);
              }}
            />
            <CalendarBlank size={16} />
            Set follow-up
          </label>
          {followUp && !closed && (
            <label className="reminder-date">
              <span className="sr-only">Follow-up date and time</span>
              <input
                type="datetime-local"
                required
                value={date}
                disabled={create.isPending}
                onChange={(event) => setDate(event.target.value)}
              />
              <small>Your local time · {localZone}</small>
            </label>
          )}
          {closed && (
            <small className="closed-hint">
              Reopen this lead to schedule a follow-up.
            </small>
          )}
        </div>
        <button
          type="submit"
          className="button primary"
          disabled={create.isPending || !note.trim()}
        >
          {create.isPending ? (
            <SpinnerGap className="spin" size={17} />
          ) : (
            <ArrowUp size={17} weight="bold" />
          )}
          {create.isPending ? "Saving…" : "Save note"}
        </button>
      </div>
      {create.isError && (
        <p className="field-error" role="alert">
          {errorMessage(create.error)}
        </p>
      )}
    </form>
  );
}
