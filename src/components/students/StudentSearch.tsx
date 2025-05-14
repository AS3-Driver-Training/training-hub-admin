
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface StudentSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function StudentSearch({ searchQuery, setSearchQuery }: StudentSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input 
        placeholder="Search students by name, email or employee number..." 
        className="pl-10 max-w-lg"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
