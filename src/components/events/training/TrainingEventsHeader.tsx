
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TrainingEventsHeaderProps {
  view: "list" | "calendar";
  setView: (view: "list" | "calendar") => void;
}

export function TrainingEventsHeader({ view, setView }: TrainingEventsHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Training Events</h1>
        <p className="text-muted-foreground mt-1">
          View and enroll in available training sessions
        </p>
      </div>
      
      <div className="mt-4 sm:mt-0 flex items-center gap-3">
        <Button 
          size="sm" 
          onClick={() => navigate("/events/create")}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
        
        <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as "list" | "calendar")}>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4 mr-2" />
            List
          </ToggleGroupItem>
          <ToggleGroupItem value="calendar" aria-label="Calendar view">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
