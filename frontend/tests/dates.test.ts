import { describe, expect, it } from "vitest";
import { initials, isToday, relativeTime, reminderState } from "@/lib/dates";

describe("workspace dates", () => {
  const now = new Date("2026-10-13T19:00:00Z");
  it("pins by business timezone across UTC midnight", () => {
    expect(isToday("2026-10-14T01:00:00Z", "Asia/Kolkata", now)).toBe(true);
    expect(isToday("2026-10-13T17:00:00Z", "Asia/Kolkata", now)).toBe(false);
    expect(isToday(null, "Asia/Kolkata", now)).toBe(false);
  });
  it("marks an earlier reminder today overdue", () => {
    expect(reminderState("2026-10-13T18:40:00Z", "Asia/Kolkata", +now)).toBe(
      "overdue",
    );
    expect(reminderState("2026-10-13T21:00:00Z", "Asia/Kolkata", +now)).toBe(
      "today",
    );
    expect(reminderState(null, "Asia/Kolkata", +now)).toBe("none");
  });
  it("formats null and recent conversations", () => {
    expect(relativeTime(null, +now)).toBe("No conversations yet");
    expect(relativeTime("2026-10-13T18:59:50Z", +now)).toBe("Just now");
    expect(relativeTime("2026-10-13T17:00:00Z", +now)).toBe("2 hours ago");
  });
  it("extracts initials without assuming two names", () => {
    expect(initials("  Jamie Chen ")).toBe("JC");
    expect(initials("Jamie")).toBe("J");
  });
});
