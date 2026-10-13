"use client";
import { useEffect, useState } from "react";
import { Loading } from "@/components/ui/feedback";
import { Dashboard } from "@/features/workspace/dashboard";
import { Login } from "./login";
import { useAuth } from "./store";

export function WorkspaceGate() {
  const user = useAuth((state) => state.user);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void Promise.resolve(useAuth.persist.rehydrate()).then(() =>
      setHydrated(true),
    );
  }, []);
  if (!hydrated)
    return (
      <main className="boot-screen">
        <Loading />
      </main>
    );
  return user ? <Dashboard /> : <Login />;
}
