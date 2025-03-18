
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
  id: string;
  title: string;
  date: Date;
  location: string;
  type: 'private' | 'open';
}

export function EventsList() {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<"list" | "calendar">("list");
  
  // Dummy events data - this would come from props or a query
  const events: Event[] = [
    {
      id: "1",
      title: "Safety Training - Basic",
      date: new Date(2023, 6, 15),
      location: "Main Office",
      type: "private"
    },
    {
      id: "2",
      title: "First Aid Certification",
      date: new Date(2023, 6, 22),
      location: "Training Center",
      type: "open"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="list" onValueChange={(value) => setViewType(value as "list" | "calendar")}>
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => navigate("/events/create")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {viewType === "list" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/events/${event.id}/edit`)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  {format(event.date, "PPP")}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm">{event.location}</span>
                  <Badge variant={event.type === "private" ? "outline" : "secondary"}>
                    {event.type === "private" ? "Private" : "Open Enrollment"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center text-muted-foreground">
          Calendar view coming soon
        </div>
      )}
    </div>
  );
}

// Missing import
import { Badge } from "@/components/ui/badge";
