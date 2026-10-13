import { ArrowUpRight, Handshake, UsersThree } from "@phosphor-icons/react";
import { useLeadCounts } from "@/features/leads/queries";

export function PipelineSummary() {
  const counts = useLeadCounts();
  const open = ["new", "contacted", "qualified", "proposal_sent"].reduce<
    number | undefined
  >(
    (sum, status) =>
      sum === undefined || counts[status] === undefined
        ? undefined
        : sum + counts[status],
    0,
  );
  return (
    <section className="pipeline-summary" aria-label="Pipeline overview">
      <div>
        <span className="summary-icon">
          <UsersThree size={20} />
        </span>
        <span>
          <small>Total leads</small>
          <strong>{counts.all ?? "—"}</strong>
        </span>
      </div>
      <div>
        <span className="summary-icon">
          <ArrowUpRight size={20} />
        </span>
        <span>
          <small>Open relationships</small>
          <strong>{open ?? "—"}</strong>
        </span>
      </div>
      <div>
        <span className="summary-icon won-icon">
          <Handshake size={20} />
        </span>
        <span>
          <small>Won leads</small>
          <strong>{counts.won ?? "—"}</strong>
        </span>
      </div>
      <p>
        Good things happen
        <br />
        <strong>one conversation at a time.</strong>
      </p>
    </section>
  );
}
