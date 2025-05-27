
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, MapPin, Users, AlertCircle } from "lucide-react";
import { useState } from "react";

interface ClientEvent {
  id: string;
  start_date: string;
  end_date: string | null;
  programs: {
    name: string;
    duration_days: number;
  };
  venues: {
    name: string;
    address: string;
  };
  enrolled_count: number;
  status: string;
}

interface ClientEventsTabProps {
  clientId: string;
}

export function ClientEventsTab({ clientId }: ClientEventsTabProps) {
  const [eventFilter, setEventFilter] = useState<"upcoming" | "past">("upcoming");

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['client-events', clientId],
    queryFn: async () => {
      try {
        console.log('Fetching events for client:', clientId);
        const { data, error } = await supabase
          .from('course_instances')
          .select(`
            id,
            start_date,
            end_date,
            programs:program_id (
              name,
              duration_days
            ),
            venues:venue_id (
              name,
              address
            ),
            session_attendees(count)
          `)
          .eq('host_client_id', clientId)
          .order('start_date', { ascending: false });

        if (error) {
          console.error('Error fetching client events:', error);
          throw error;
        }

        // Transform data to include enrolled count
        const eventsWithCount = (data || []).map(event => ({
          ...event,
          enrolled_count: event.session_attendees?.[0]?.count || 0,
          status: getEventStatus(event.start_date, event.end_date)
        }));

        console.log('Client events:', eventsWithCount);
        return eventsWithCount;
      } catch (error) {
        console.error('Error in events query:', error);
        throw error;
      }
    },
  });

  const getEventStatus = (startDate: string, endDate: string | null) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (end && end < now) return 'completed';
    if (start <= now && (!end || end >= now)) return 'in-progress';
    if (start > now) return 'scheduled';
    return 'scheduled';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'secondary';
      case 'in-progress':
        return 'default';
      case 'scheduled':
        return 'success';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'scheduled':
        return 'Scheduled';
      default:
        return 'Unknown';
    }
  };

  const filteredEvents = events?.filter(event => {
    const now = new Date();
    const start = new Date(event.start_date);
    
    if (eventFilter === "upcoming") {
      return start >= now || event.status === 'in-progress';
    } else {
      return start < now && event.status === 'completed';
    }
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate: string | null) => {
    const start = formatDate(startDate);
    if (!endDate) return start;
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading events...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            Error loading events. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Client Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={eventFilter} onValueChange={(value) => setEventFilter(value as "upcoming" | "past")}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
            </TabsList>

            <TabsContent value={eventFilter}>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No {eventFilter} events found for this client.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{event.programs.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {event.programs.duration_days} days
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDateRange(event.start_date, event.end_date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{event.venues.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {event.venues.address}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(event.status)}>
                            {getStatusLabel(event.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{event.enrolled_count} students</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
