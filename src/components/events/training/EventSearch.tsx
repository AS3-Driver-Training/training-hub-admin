
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface EventSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function EventSearch({ searchQuery, setSearchQuery }: EventSearchProps) {
  return (
    <Card className="p-4">
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
            ×
          </button>
        )}
      </div>
    </Card>
  );
}
