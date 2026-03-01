import { Event } from "@/types";

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function expandRecurringEvents(events: Event[]): Event[] {
  const expanded: Event[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneYearFromNow = new Date(today);
  oneYearFromNow.setFullYear(today.getFullYear() + 1);

  for (const event of events) {
    const repeatType = (event as any).repeatType || "NONE";
    const repeatUntil = (event as any).repeatUntil ? new Date((event as any).repeatUntil) : oneYearFromNow;

    if (repeatType === "NONE") {
      expanded.push(event);
      continue;
    }

    const eventDate = new Date(event.date);
    let currentDate = new Date(eventDate);

    while (currentDate <= repeatUntil && currentDate <= oneYearFromNow) {
      const shouldAdd = shouldIncludeDate(currentDate, eventDate, repeatType);
      
      if (shouldAdd && currentDate >= today) {
        const dateStr = formatDateLocal(currentDate);
        expanded.push({
          ...event,
          id: `${event.id}::${dateStr}`,
          date: dateStr,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return expanded;
}

function shouldIncludeDate(date: Date, startDate: Date, repeatType: string): boolean {
  switch (repeatType) {
    case "DAILY":
      return true;
    case "WEEKDAYS":
      const day = date.getDay();
      return day >= 1 && day <= 5; // Monday to Friday
    case "WEEKLY":
      return date.getDay() === startDate.getDay();
    case "MONTHLY":
      return date.getDate() === startDate.getDate();
    default:
      return false;
  }
}
