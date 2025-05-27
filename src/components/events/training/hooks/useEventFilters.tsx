
import { useState } from "react";
import { TrainingEvent } from "@/types/events";
import { 
  isEventInDateRange, 
  getDateRangeFromFilter, 
  matchesArrayFilter, 
  matchesEnrollmentType, 
  getCountryFromLocation 
} from "@/utils/dateFilters";

export function useEventFilters(events: TrainingEvent[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [regionFilter, setRegionFilter] = useState<string[]>([]);
  const [enrollmentTypeFilter, setEnrollmentTypeFilter] = useState<string[]>([]);

  // Enhanced filtering logic with new multi-select filters
  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.clientName && event.clientName.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter (array-based)
    const matchesStatus = matchesArrayFilter(event.status, statusFilter);

    // Date filter
    const dateRange = getDateRangeFromFilter(dateFilter);
    const matchesDate = dateFilter === "all" || isEventInDateRange(event.startDate, dateRange);

    // Country filter (array-based)
    const eventCountry = getCountryFromLocation(event.location);
    const matchesCountry = matchesArrayFilter(eventCountry, countryFilter);

    // Region filter (array-based)
    const eventRegion = event.region || event.location.split(',').slice(-2, -1)[0]?.trim() || '';
    const matchesRegion = matchesArrayFilter(eventRegion, regionFilter);

    // Enrollment type filter
    const matchesEnrollment = matchesEnrollmentType(event.isOpenEnrollment, enrollmentTypeFilter);

    return matchesSearch && matchesStatus && matchesDate && matchesCountry && matchesRegion && matchesEnrollment;
  });

  // Clear all filters function
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setDateFilter("all");
    setCountryFilter([]);
    setRegionFilter([]);
    setEnrollmentTypeFilter([]);
  };

  const currentDate = new Date();
  const upcomingEvents = filteredEvents.filter(
    event => new Date(event.startDate) > currentDate
  );
  const pastEvents = filteredEvents.filter(
    event => new Date(event.startDate) <= currentDate
  );

  return {
    // Filter state
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    countryFilter,
    setCountryFilter,
    regionFilter,
    setRegionFilter,
    enrollmentTypeFilter,
    setEnrollmentTypeFilter,
    
    // Computed values
    filteredEvents,
    upcomingEvents,
    pastEvents,
    
    // Actions
    handleClearFilters
  };
}
