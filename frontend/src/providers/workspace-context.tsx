"use client";
import { createContext, useContext, useEffect, useState } from "react";
const WorkspaceContext = createContext({ timeZone: "UTC", now: 0 });
export function WorkspaceClock({
  timeZone,
  children,
}: {
  timeZone: string;
  children: React.ReactNode;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  return (
    <WorkspaceContext.Provider value={{ timeZone, now }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
export const useWorkspaceClock = () => useContext(WorkspaceContext);
