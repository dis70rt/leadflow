import { Skeleton, SkeletonRegion } from "@/components/ui/skeleton";
import { LeadListSkeleton } from "@/features/leads/components/lead-list-skeleton";

export function WorkspaceSkeleton() {
  return (
    <div className="workspace-shell">
      <SkeletonRegion
        label="Loading workspace navigation"
        className="sidebar skeleton-sidebar"
      >
        <Skeleton width={145} height={32} />
        <Skeleton width="100%" height={55} />
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton key={index} width="85%" height={18} />
        ))}
      </SkeletonRegion>
      <main className="workspace-main">
        <SkeletonRegion label="Loading your workspace">
          <div className="topbar">
            <Skeleton width={130} height={12} />
          </div>
          <div className="page-heading">
            <div className="skeleton-stack">
              <Skeleton width={200} height={12} />
              <Skeleton className="skeleton-heading" height={40} />
              <Skeleton width="85%" height={12} />
            </div>
            <Skeleton width={145} height={42} />
          </div>
        </SkeletonRegion>
        <div className="workspace-content">
          <SkeletonRegion
            label="Loading pipeline overview"
            className="pipeline-summary"
          >
            <div className="skeleton-summary">
              {[0, 1, 2].map((index) => (
                <div className="skeleton-stack" key={index}>
                  <Skeleton width={90} height={10} />
                  <Skeleton width={35} height={30} />
                </div>
              ))}
            </div>
          </SkeletonRegion>
          <div className="leads-section">
            <Skeleton width="100%" height={43} />
            <div className="search-progress" />
            <LeadListSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
