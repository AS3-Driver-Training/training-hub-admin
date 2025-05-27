
import { useState } from "react";
import { Search, Calendar, Globe, MapPin, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, addDays, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { countries } from "@/utils/countries";
import { cn } from "@/lib/utils";

interface CompactEventFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  customDateRange: { from: Date | null; to: Date | null };
  setCustomDateRange: (range: { from: Date | null; to: Date | null }) => void;
  countryFilter: string;
  setCountryFilter: (country: string) => void;
  regionFilter: string;
  setRegionFilter: (region: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  availableRegions: string[];
}

const dateRangeOptions = [
  { value: "all", label: "All time" },
  { value: "this-month", label: "This month" },
  { value: "next-60", label: "Next 60 days" },
  { value: "this-quarter", label: "This quarter" },
  { value: "this-year", label: "This year" },
  { value: "custom", label: "Custom range" },
];

export function CompactEventFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
  countryFilter,
  setCountryFilter,
  regionFilter,
  setRegionFilter,
  onClearFilters,
  activeFilterCount,
  availableRegions
}: CompactEventFiltersProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleDateRangeSelect = (value: string) => {
    setDateFilter(value);
    
    if (value !== "custom") {
      const today = new Date();
      let from: Date | null = null;
      let to: Date | null = null;

      switch (value) {
        case "this-month":
          from = startOfMonth(today);
          to = endOfMonth(today);
          break;
        case "next-60":
          from = today;
          to = addDays(today, 60);
          break;
        case "this-quarter":
          from = startOfQuarter(today);
          to = endOfQuarter(today);
          break;
        case "this-year":
          from = startOfYear(today);
          to = endOfYear(today);
          break;
        default:
          from = null;
          to = null;
      }

      setCustomDateRange({ from, to });
    }
  };

  const getDateRangeDisplay = () => {
    if (dateFilter === "custom" && customDateRange.from && customDateRange.to) {
      return `${format(customDateRange.from, "MMM d")} - ${format(customDateRange.to, "MMM d")}`;
    }
    return dateRangeOptions.find(option => option.value === dateFilter)?.label || "All time";
  };

  const getCountryDisplay = () => {
    if (countryFilter === "all") return "All countries";
    const country = countries.find(c => c.code === countryFilter);
    return country ? `${country.flag} ${country.name}` : "All countries";
  };

  // Filter regions based on selected country
  const filteredRegions = countryFilter === "all" 
    ? availableRegions 
    : availableRegions; // In a real app, you'd filter by country

  return (
    <Card className="p-4">
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
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

        {/* Date Filter */}
        <div className="flex flex-wrap lg:flex-nowrap gap-2 w-full lg:w-auto">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[140px] justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="truncate">{getDateRangeDisplay()}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 space-y-3">
                <div className="space-y-2">
                  {dateRangeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={dateFilter === option.value ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        handleDateRangeSelect(option.value);
                        if (option.value !== "custom") {
                          setIsDatePickerOpen(false);
                        }
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                
                {dateFilter === "custom" && (
                  <div className="border-t pt-3">
                    <CalendarComponent
                      mode="range"
                      selected={customDateRange.from && customDateRange.to ? {
                        from: customDateRange.from,
                        to: customDateRange.to
                      } : undefined}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setCustomDateRange({ from: range.from, to: range.to });
                          setIsDatePickerOpen(false);
                        }
                      }}
                      className="pointer-events-auto"
                      numberOfMonths={2}
                    />
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Country Filter */}
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="min-w-[140px]">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue>
                <span className="truncate">{getCountryDisplay()}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Region Filter */}
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="min-w-[120px]">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {filteredRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="min-w-[110px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={onClearFilters} className="whitespace-nowrap">
              Clear
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
