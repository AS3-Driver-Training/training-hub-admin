
import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TrainingEvent } from "@/types/events";
import { getCountryInfo, getCountryName, getCountryFlag } from "@/utils/countryMapping";

interface StreamlinedEventFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string[];
  setStatusFilter: (status: string[]) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  countryFilter: string[];
  setCountryFilter: (countries: string[]) => void;
  regionFilter: string[];
  setRegionFilter: (regions: string[]) => void;
  enrollmentTypeFilter: string[];
  setEnrollmentTypeFilter: (types: string[]) => void;
  onClearFilters: () => void;
  events: TrainingEvent[];
}

const dateOptions = [
  { value: "all", label: "All time" },
  { value: "this-month", label: "This month" },
  { value: "next-60", label: "Next 60 days" },
  { value: "this-quarter", label: "This quarter" },
  { value: "this-year", label: "This year" },
];

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const enrollmentOptions = [
  { value: "open", label: "Open enrollment" },
  { value: "private", label: "Private courses" },
];

export function StreamlinedEventFilters({
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
  onClearFilters,
  events
}: StreamlinedEventFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract actual countries from events using the country field
  const availableCountries = [...new Set(events
    .map(event => event.country)
    .filter((country): country is string => Boolean(country))
  )].sort();

  const availableRegions = [...new Set(events.map(event => {
    if (event.region) return event.region;
    // Extract region from location if not explicitly set
    const parts = event.location.split(',').map(p => p.trim());
    return parts.length > 1 ? parts[parts.length - 2] : '';
  }).filter(Boolean))].sort();

  // Calculate active filter count
  const activeFilterCount = [
    statusFilter.length > 0,
    dateFilter !== "all",
    countryFilter.length > 0,
    regionFilter.length > 0,
    enrollmentTypeFilter.length > 0
  ].filter(Boolean).length;

  const handleStatusToggle = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const handleCountryToggle = (country: string) => {
    if (countryFilter.includes(country)) {
      setCountryFilter(countryFilter.filter(c => c !== country));
    } else {
      setCountryFilter([...countryFilter, country]);
    }
  };

  const handleRegionToggle = (region: string) => {
    if (regionFilter.includes(region)) {
      setRegionFilter(regionFilter.filter(r => r !== region));
    } else {
      setRegionFilter([...regionFilter, region]);
    }
  };

  const handleEnrollmentToggle = (type: string) => {
    if (enrollmentTypeFilter.includes(type)) {
      setEnrollmentTypeFilter(enrollmentTypeFilter.filter(t => t !== type));
    } else {
      setEnrollmentTypeFilter([...enrollmentTypeFilter, type]);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events, venues, or clients..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              {/* Clear All Button */}
              {activeFilterCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Filters</span>
                  <Button variant="ghost" size="sm" onClick={onClearFilters}>
                    Clear all
                  </Button>
                </div>
              )}

              {/* Date Filter */}
              <div>
                <Label className="text-sm font-medium">Date Range</Label>
                <div className="mt-2 space-y-2">
                  {dateOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`date-${option.value}`}
                        checked={dateFilter === option.value}
                        onCheckedChange={() => setDateFilter(option.value)}
                      />
                      <Label htmlFor={`date-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Status Filter */}
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-2 space-y-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={statusFilter.includes(option.value)}
                        onCheckedChange={() => handleStatusToggle(option.value)}
                      />
                      <Label htmlFor={`status-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Country Filter */}
              {availableCountries.length > 0 && (
                <>
                  <div>
                    <Label className="text-sm font-medium">Countries</Label>
                    <div className="mt-2 space-y-2">
                      {availableCountries.map((countryCode) => (
                        <div key={countryCode} className="flex items-center space-x-2">
                          <Checkbox
                            id={`country-${countryCode}`}
                            checked={countryFilter.includes(countryCode)}
                            onCheckedChange={() => handleCountryToggle(countryCode)}
                          />
                          <Label htmlFor={`country-${countryCode}`} className="text-sm flex items-center gap-2">
                            <span>{getCountryFlag(countryCode)}</span>
                            {getCountryName(countryCode)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Region Filter */}
              {availableRegions.length > 0 && (
                <>
                  <div>
                    <Label className="text-sm font-medium">Regions</Label>
                    <div className="mt-2 space-y-2">
                      {availableRegions.map((region) => (
                        <div key={region} className="flex items-center space-x-2">
                          <Checkbox
                            id={`region-${region}`}
                            checked={regionFilter.includes(region)}
                            onCheckedChange={() => handleRegionToggle(region)}
                          />
                          <Label htmlFor={`region-${region}`} className="text-sm">
                            {region}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Enrollment Type Filter */}
              <div>
                <Label className="text-sm font-medium">Enrollment Type</Label>
                <div className="mt-2 space-y-2">
                  {enrollmentOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`enrollment-${option.value}`}
                        checked={enrollmentTypeFilter.includes(option.value)}
                        onCheckedChange={() => handleEnrollmentToggle(option.value)}
                      />
                      <Label htmlFor={`enrollment-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  );
}
