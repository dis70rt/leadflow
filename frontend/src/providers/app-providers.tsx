"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ApiError } from "@/lib/http";
import { WorkspaceClock } from "./workspace-context";

export function AppProviders({
  children,
  timeZone,
}: {
  children: React.ReactNode;
  timeZone: string;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15000,
            retry: (count, error) =>
              count < 1 &&
              (!(error instanceof ApiError) || error.status >= 500),
          },
        },
      }),
  );
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
    >
      <QueryClientProvider client={client}>
        <WorkspaceClock timeZone={timeZone}>{children}</WorkspaceClock>
        <Toaster position="bottom-right" richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
