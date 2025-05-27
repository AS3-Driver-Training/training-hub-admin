
import { startOfMonth, endOfMonth, addDays, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval } from "date-fns";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export const getDateRangeFromFilter = (filter: string): DateRange => {
  const today = new Date();
  
  switch (filter) {
    case "this-month":
      return {
        from: startOfMonth(today),
        to: endOfMonth(today)
      };
    case "next-60":
      return {
        from: today,
        to: addDays(today, 60)
      };
    case "this-quarter":
      return {
        from: startOfQuarter(today),
        to: endOfQuarter(today)
      };
    case "this-year":
      return {
        from: startOfYear(today),
        to: endOfYear(today)
      };
    default:
      return {
        from: null,
        to: null
      };
  }
};

export const isEventInDateRange = (eventDate: string, dateRange: DateRange): boolean => {
  if (!dateRange.from || !dateRange.to) {
    return true; // No date filter applied
  }
  
  const eventDateObj = new Date(eventDate);
  return isWithinInterval(eventDateObj, {
    start: dateRange.from,
    end: dateRange.to
  });
};

export const getRegionsFromEvents = (events: Array<{ location: string }>): string[] => {
  const regions = new Set<string>();
  
  events.forEach(event => {
    // Extract region from location string (assuming format like "City, Region" or "Venue, City, Region")
    const parts = event.location.split(',').map(part => part.trim());
    if (parts.length >= 2) {
      regions.add(parts[parts.length - 1]); // Last part is typically the region/state
    }
  });
  
  return Array.from(regions).sort();
};
