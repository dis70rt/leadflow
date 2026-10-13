import { WorkspaceGate } from "@/features/auth/workspace-gate";
export default function Home() {
  return <WorkspaceGate />;
}
