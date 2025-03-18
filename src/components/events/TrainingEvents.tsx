import { useState } from "react";
import { List, Calendar, Search, MapPin, Clock, Users, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Button as UIButton } from "@/components/ui/button";
import { TrainingEvent } from "@/types/events";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";

const MOCK_EVENTS: TrainingEvent[] = [
  {
    id: "1",
    title: "Accelerated [Counter-Ambush] Driving Course",
    location: "Weather Tech Laguna Seca International Raceway",
    startDate: "2025-09-20T09:00:00",
    endDate: "2025-09-21T17:00:00",
    status: "scheduled",
    capacity: 16,
    enrolledCount: 1
  },
  {
    id: "2",
    title: "Advanced [Counter-Ambush] Driving Course",
    location: "Weather Tech Laguna Seca International Raceway",
    startDate: "2025-02-26T09:00:00",
    endDate: "2025-02-27T17:00:00",
    status: "scheduled",
    capacity: 16,
    enrolledCount: 0
  },
  {
    id: "3",
    title: "Basic Emergency Response Training",
    location: "Regional Training Center",
    startDate: "2024-07-15T09:00:00",
    endDate: "2024-07-15T17:00:00",
    status: "scheduled",
    capacity: 24,
    enrolledCount: 12
  }
];

export function TrainingEvents() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const filteredEvents = MOCK_EVENTS.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const currentDate = new Date();
  const upcomingEvents = filteredEvents.filter(
    event => new Date(event.startDate) > currentDate
  );
  const pastEvents = filteredEvents.filter(
    event => new Date(event.startDate) <= currentDate
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upcoming Training Events</h1>
          <p className="text-muted-foreground mt-1">
            View and enroll in available training sessions
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <UIButton 
            size="sm" 
            onClick={() => navigate("/events/create")}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </UIButton>
          
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
      
      {view === "list" ? (
        <EventListView upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
      ) : (
        <EventCalendarView events={filteredEvents} />
      )}
    </div>
  );
}

function EventListView({ 
  upcomingEvents, 
  pastEvents 
}: { 
  upcomingEvents: TrainingEvent[], 
  pastEvents: TrainingEvent[] 
}) {
  return (
    <div className="space-y-6">
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
      
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Events</h2>
          <div className="space-y-4">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
      
      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No training events found</p>
        </div>
      )}
    </div>
  );
}

function EventCalendarView({ events }: { events: TrainingEvent[] }) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Calendar view coming soon</p>
    </div>
  );
}

function EventCard({ event }: { event: TrainingEvent }) {
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
  
  return (
    <Card className="overflow-hidden">
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
            <EnrollButton event={event} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function EnrollButton({ event }: { event: TrainingEvent }) {
  return (
    <div className="flex items-center">
      {event.enrolledCount === event.capacity ? (
        <span className="text-sm text-muted-foreground">Fully Booked</span>
      ) : (
        <span className="flex items-center text-sm text-primary cursor-pointer hover:text-primary/90 hover:underline">
          Enroll Now
        </span>
      )}
    </div>
  );
}
