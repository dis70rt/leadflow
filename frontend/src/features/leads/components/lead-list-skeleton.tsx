import { Skeleton, SkeletonRegion } from "@/components/ui/skeleton";

function LeadRowSkeleton() {
  return (
    <div className="lead-row skeleton-lead-row">
      <Skeleton className="skeleton-avatar" />
      <span className="lead-identity skeleton-stack">
        <Skeleton width="75%" height={12} />
        <Skeleton width="55%" height={9} />
      </span>
      <span className="lead-note skeleton-stack">
        <Skeleton width="90%" height={11} />
        <Skeleton width="35%" height={9} />
      </span>
      <span className="lead-status">
        <Skeleton width={75} height={22} />
      </span>
      <span className="lead-reminder">
        <Skeleton width={85} height={11} />
      </span>
    </div>
  );
}

export function LeadListSkeleton() {
  return (
    <SkeletonRegion label="Loading leads" className="lead-list-skeleton">
      <div className="section-title">
        <Skeleton width={170} height={15} />
      </div>
      <div className="follow-up-list">
        <LeadRowSkeleton />
      </div>
      <div className="all-leads-section">
        <div className="section-title">
          <Skeleton width={100} height={15} />
        </div>
        <div className="lead-table">
          <div className="table-header">
            {[110, 140, 70, 85].map((width) => (
              <Skeleton key={width} width={width} height={9} />
            ))}
          </div>
          {Array.from({ length: 5 }, (_, index) => (
            <LeadRowSkeleton key={index} />
          ))}
        </div>
      </div>
    </SkeletonRegion>
  );
}
