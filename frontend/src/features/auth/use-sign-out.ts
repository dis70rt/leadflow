import { useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/features/workspace/store";
import { useAuth } from "./store";

export function useSignOut() {
  const client = useQueryClient();
  return () => {
    useAuth.getState().signOut();
    useWorkspace.getState().reset();
    client.clear();
  };
}
