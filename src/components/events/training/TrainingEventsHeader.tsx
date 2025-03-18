
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

interface TrainingEventsHeaderProps {
  view: "list" | "calendar";
  setView: (view: "list" | "calendar") => void;
}

export function TrainingEventsHeader({ view, setView }: TrainingEventsHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Training Events</h1>
        <p className="text-muted-foreground">
          Manage and schedule training courses
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Tabs value={view} onValueChange={(v) => setView(v as "list" | "calendar")} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={() => navigate("/events/create")} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Create Course
        </Button>
      </div>
    </div>
  );
}
