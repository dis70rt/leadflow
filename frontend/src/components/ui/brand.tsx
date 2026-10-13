import { FlowArrow } from "@phosphor-icons/react";
export function Brand() {
  return (
    <div className="brand">
      <span className="brand-symbol">
        <FlowArrow size={23} weight="bold" />
      </span>
      <span>
        leadflow<span className="brand-period">.</span>
      </span>
    </div>
  );
}
