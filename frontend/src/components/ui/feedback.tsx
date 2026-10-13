import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react";
import { errorMessage } from "@/lib/http";
export function ErrorState({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <WarningCircle size={26} />
      <p>{errorMessage(error)}</p>
      <button className="button secondary" onClick={retry}>
        <ArrowClockwise size={16} />
        Try again
      </button>
    </div>
  );
}
