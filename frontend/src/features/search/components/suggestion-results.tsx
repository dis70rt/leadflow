import { ChatCircleText, MagnifyingGlass } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/features/leads/components/status-badge";
import type { LeadSuggestion } from "../types";
import { HighlightedText } from "./highlighted-text";

interface ResultsProps {
  id: string;
  items: LeadSuggestion[];
  active: number;
  loading: boolean;
  failed: boolean;
  onSelect: (lead: LeadSuggestion) => void;
  onRetry: () => void;
}
export function SuggestionResults({
  id,
  items,
  active,
  loading,
  failed,
  onSelect,
  onRetry,
}: ResultsProps) {
  return (
    <div className="suggestions-popover">
      <div className="suggestions-heading">
        SEARCH ALL LEADS & CONVERSATIONS
      </div>
      {loading ? (
        <div
          role="status"
          aria-label="Loading suggestions"
          className="suggestions-loading"
        >
          {[0, 1, 2].map((index) => (
            <div key={index} className="skeleton-stack">
              <Skeleton width="50%" height={15} />
              <Skeleton width="85%" height={12} />
            </div>
          ))}
        </div>
      ) : failed ? (
        <div className="suggestions-feedback" role="status">
          Suggestions unavailable.
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onRetry}
          >
            Try again
          </button>
        </div>
      ) : items.length ? (
        <ul
          id={id}
          role="listbox"
          aria-label="Matching leads and discussions"
          className="suggestions-list"
        >
          {items.map((lead, index) => (
            <li role="presentation" key={lead.id}>
              <button
                id={`${id}-${index}`}
                role="option"
                aria-selected={active === index}
                tabIndex={-1}
                className="suggestion-option"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect(lead)}
              >
                <span className="suggestion-identity">
                  <strong>{lead.name}</strong>
                  <StatusBadge status={lead.status} />
                </span>
                {lead.company && (
                  <span className="suggestion-company">{lead.company}</span>
                )}
                <span className="suggestion-snippet">
                  {lead.match_field === "discussion" ? (
                    <ChatCircleText size={16} />
                  ) : (
                    <MagnifyingGlass size={16} />
                  )}
                  <span>
                    {lead.snippet ? (
                      <>
                        <span className="match-label">
                          {lead.match_field === "discussion"
                            ? "Discussion"
                            : lead.match_field}{" "}
                          ·{" "}
                        </span>
                        <HighlightedText text={lead.snippet} />
                      </>
                    ) : (
                      "Matching lead"
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="suggestions-feedback" role="status">
          No matches yet. Try a name, company, phone, or discussion keyword.
        </div>
      )}
      <div className="suggestions-footer">
        Prefix and typo-tolerant matching<span>↑ ↓ navigate · Enter opens</span>
      </div>
    </div>
  );
}
