
import { useState } from "react";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface EventFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  enrollmentFilter: string;
  setEnrollmentFilter: (enrollment: string) => void;
  capacityFilter: string;
  setCapacityFilter: (capacity: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function EventFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  enrollmentFilter,
  setEnrollmentFilter,
  capacityFilter,
  setCapacityFilter,
  onClearFilters,
  activeFilterCount
}: EventFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Always visible search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by program name, venue, or location..."
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

        {/* Collapsible filters section */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
                <Filter className="h-4 w-4" />
                <span>Advanced Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Clear All
              </Button>
            )}
          </div>

          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Enrollment Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Enrollment Type</label>
                <Select value={enrollmentFilter} onValueChange={setEnrollmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="open">Open Enrollment</SelectItem>
                    <SelectItem value="private">Private Courses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity</label>
                <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All capacities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All capacities</SelectItem>
                    <SelectItem value="available">Available Spots</SelectItem>
                    <SelectItem value="full">At Capacity</SelectItem>
                    <SelectItem value="overbooked">Overbooked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}
