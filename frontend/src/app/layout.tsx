import type { Metadata } from "next";
import { AppProviders } from "@/providers/app-providers";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/shared.css";
import "@/styles/workspace.css";
import "@/styles/workspace-main.css";
import "@/styles/workspace-responsive.css";
import "@/styles/leads.css";
import "@/styles/lead-rows.css";
import "@/styles/lead-list-states.css";
import "@/styles/leads-responsive.css";
import "@/styles/dialogs.css";
import "@/styles/lead-details.css";
import "@/styles/timeline.css";
import "@/styles/discussion-form.css";
import "@/styles/login.css";
import "@/styles/login-form.css";
import "@/styles/skeleton.css";
import "@/styles/suggestions.css";
import "@/styles/theme-transition.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LeadFlow — A little more personal",
  description:
    "A focused workspace for leads, conversations, and your next follow-up.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders
          timeZone={process.env.BUSINESS_TIMEZONE ?? "Asia/Kolkata"}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
