import { Skeleton, SkeletonRegion } from "@/components/ui/skeleton";

export function TimelineSkeleton() {
  return (
    <SkeletonRegion label="Loading conversations" className="timeline">
      <div className="timeline-heading">
        <Skeleton width={150} height={10} />
      </div>
      <div className="timeline-list">
        {[0, 1, 2].map((index) => (
          <div key={index} className="skeleton-timeline-item">
            <span className="timeline-dot" />
            <div className="timeline-date">
              <Skeleton width={125} height={10} />
              <Skeleton width={60} height={10} />
            </div>
            <div className="timeline-note skeleton-stack">
              <Skeleton width="95%" height={11} />
              <Skeleton width={index === 1 ? "80%" : "65%"} height={11} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}

export function LeadDetailsSkeleton() {
  return (
    <>
      <SkeletonRegion label="Loading lead details" className="lead-detail-bar">
        <div className="skeleton-detail-bar">
          <Skeleton width={120} height={12} />
          <Skeleton width={115} height={32} />
        </div>
      </SkeletonRegion>
      <div className="timeline-scroll">
        <TimelineSkeleton />
      </div>
      <SkeletonRegion
        label="Loading conversation form"
        className="discussion-form"
      >
        <div className="skeleton-stack">
          <Skeleton width={180} height={12} />
          <Skeleton width="100%" height={95} />
          <Skeleton width={100} height={40} className="skeleton-submit" />
        </div>
      </SkeletonRegion>
    </>
  );
}
