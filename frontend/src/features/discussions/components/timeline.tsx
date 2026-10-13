import { CalendarBlank, ChatCircleText } from "@phosphor-icons/react";
import { Loading, ErrorState } from "@/components/ui/feedback";
import { dateTime, relativeTime } from "@/lib/dates";
import { useWorkspaceClock } from "@/providers/workspace-context";
import { useDiscussions } from "../queries";

export function Timeline({ leadId }: { leadId: string }) {
  const query = useDiscussions(leadId);
  const { now, timeZone } = useWorkspaceClock();
  if (query.isPending) return <Loading label="Loading conversations…" />;
  if (query.isError)
    return (
      <ErrorState error={query.error} retry={() => void query.refetch()} />
    );
  const discussions = query.data.pages.flatMap((page) => page.items);
  return (
    <div className="timeline">
      <div className="timeline-heading">
        <span>CONVERSATION HISTORY</span>
        <span>Newest first</span>
      </div>
      {discussions.length === 0 ? (
        <div className="timeline-empty">
          <ChatCircleText size={30} weight="duotone" />
          <strong>Every relationship starts with hello.</strong>
          <p>Log your first conversation below.</p>
        </div>
      ) : (
        <ol className="timeline-list">
          {discussions.map((discussion, index) => (
            <li key={discussion.id} className={index === 0 ? "latest" : ""}>
              <span className="timeline-dot" />
              <div className="timeline-date">
                <time dateTime={discussion.created_at}>
                  {dateTime(discussion.created_at, timeZone)}
                </time>
                <span>{relativeTime(discussion.created_at, now)}</span>
              </div>
              <div className="timeline-note">
                <p>{discussion.note}</p>
                {discussion.follow_up_at && (
                  <span className="historical-reminder">
                    <CalendarBlank size={14} />
                    Follow-up set for{" "}
                    {dateTime(discussion.follow_up_at, timeZone)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      {query.hasNextPage && (
        <button
          className="button secondary load-more"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? "Loading…" : "Load earlier conversations"}
        </button>
      )}
    </div>
  );
}
