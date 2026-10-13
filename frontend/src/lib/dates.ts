export function relativeTime(value: string | null, now = Date.now()): string {
  if (!value) return "No conversations yet";
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  if (Math.abs(seconds) < 60) return "Just now";
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, duration] of [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ] as const) {
    if (Math.abs(seconds) >= duration)
      return format.format(Math.round(seconds / duration), unit);
  }
  return "Just now";
}

export function isToday(
  value: string | null,
  timeZone: string,
  now = new Date(),
): boolean {
  if (!value) return false;
  const format = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return format.format(new Date(value)) === format.format(now);
}

export function dateTime(value: string, timeZone?: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function reminderState(
  value: string | null,
  timeZone: string,
  now: number,
) {
  if (!value) return "none";
  if (new Date(value).getTime() < now) return "overdue";
  return isToday(value, timeZone, new Date(now)) ? "today" : "upcoming";
}
