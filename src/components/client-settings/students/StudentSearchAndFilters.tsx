
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

interface StudentSearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  studentFilter: "active" | "inactive";
  onFilterChange: (value: "active" | "inactive") => void;
}

export function StudentSearchAndFilters({
  searchQuery,
  onSearchChange,
  studentFilter,
  onFilterChange,
}: StudentSearchAndFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search students by name, email, or employee number..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={studentFilter} onValueChange={onFilterChange}>
        <TabsList>
          <TabsTrigger value="active">Active Students</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Students</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
