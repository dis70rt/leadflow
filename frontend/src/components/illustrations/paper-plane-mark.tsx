export function PaperPlaneMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 110"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="plane-trail"
        d="M8 89c25 0 42-7 40-20-2-11-22-11-23 0-2 20 37 26 64 7"
      />
      <path className="plane-wing-back" d="m61 24 105 13-73 24-32-37Z" />
      <path className="plane-keel" d="m93 61-12 18 85-42" />
      <path className="plane-wing-front" d="m93 61 73-24-82 51 9-27Z" />
      <path className="plane-fold" d="m71 30 80 9M91 78l61-34" />
    </svg>
  );
}
