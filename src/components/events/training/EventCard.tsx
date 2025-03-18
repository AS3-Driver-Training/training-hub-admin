
import { TrainingEvent } from "@/types/events";
import { format } from "date-fns";
import { MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnrollButton } from "./EnrollButton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  event: TrainingEvent;
}

export function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  const dayName = format(startDate, "EEE");
  
  const isSameDay = format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd");
  
  const dateRangeText = isSameDay
    ? format(startDate, "MMM d, yyyy")
    : `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  
  const monthDay = format(startDate, "MMM d");
  const dateRangeForBox = isSameDay 
    ? monthDay 
    : `${format(startDate, "MMM d")} - ${format(endDate, "d")}`;
  
  const handleViewAllocations = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/events/${event.id}/allocations`);
  };
  
  const handleEditEvent = () => {
    navigate(`/events/${event.id}/edit`);
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow" onClick={handleEditEvent}>
      <div className="flex flex-col sm:flex-row">
        <div className="bg-muted p-4 text-center sm:w-32 flex flex-col justify-center">
          <div className="font-medium">{dayName}</div>
          <div className="font-bold">{dateRangeForBox}</div>
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <Badge variant="outline" className={event.status === "scheduled" ? "bg-primary/10 text-primary" : ""}>
              {event.status === "scheduled" ? "Scheduled" : event.status === "completed" ? "Completed" : "Cancelled"}
            </Badge>
          </div>
          
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 mr-2 shrink-0" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Clock className="h-4 w-4 mr-2 shrink-0" />
              <span>{dateRangeText}</span>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2" />
              <span>{event.enrolledCount}/{event.capacity}</span>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewAllocations}
                className="flex items-center"
              >
                Allocations
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
              <EnrollButton event={event} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
