export const EAT_TIME_ZONE = "Africa/Nairobi";
export type EATFormat = "dateTime" | "date" | "time";

export function eatDateKey(value: Date | string = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: EAT_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  const year = parts.find(part => part.type === "year")?.value || "0000";
  const month = parts.find(part => part.type === "month")?.value || "00";
  const day = parts.find(part => part.type === "day")?.value || "00";
  return `${year}-${month}-${day}`;
}

export function formatEAT(value: Date | string, format: EATFormat = "dateTime") {
  const options: Intl.DateTimeFormatOptions = format === "time"
    ? { timeZone: EAT_TIME_ZONE, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }
    : format === "date"
      ? { timeZone: EAT_TIME_ZONE, weekday: "short", day: "2-digit", month: "short", year: "numeric" }
      : { timeZone: EAT_TIME_ZONE, weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
  return new Intl.DateTimeFormat("en-KE", options).format(new Date(value));
}
