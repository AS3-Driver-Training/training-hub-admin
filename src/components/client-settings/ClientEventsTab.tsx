
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, AlertCircle } from "lucide-react";
import { useState } from "react";
import { EventListView } from "@/components/events/training/EventListView";
import { TrainingEvent } from "@/types/events";
import { queryKeys } from "@/lib/queryKeys";

interface ClientEventsTabProps {
  clientId: string;
}

export function ClientEventsTab({ clientId }: ClientEventsTabProps) {
  const [eventFilter, setEventFilter] = useState<"upcoming" | "past">("upcoming");

  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.clientEvents(clientId),
    queryFn: async () => {
      try {
        console.log('Fetching events for client:', clientId);
        const { data, error } = await supabase
          .from('course_instances')
          .select(`
            id,
            start_date,
            end_date,
            is_open_enrollment,
            private_seats_allocated,
            programs:program_id (
              name,
              max_students
            ),
            venues:venue_id (
              name
            )
          `)
          .eq('host_client_id', clientId)
          .order('start_date', { ascending: false });

        if (error) {
          console.error('Error fetching client events:', error);
          throw error;
        }

        // Get enrollment counts for these course instances
        const courseInstanceIds = (data || []).map(instance => instance.id);
        
        let enrollmentCounts: Record<string, number> = {};
        if (courseInstanceIds.length > 0) {
          const { data: allocations, error: allocationsError } = await supabase
            .from('course_allocations')
            .select('course_instance_id, seats_allocated')
            .in('course_instance_id', courseInstanceIds);
          
          if (allocationsError) {
            console.error('Error fetching allocations:', allocationsError);
          } else {
            enrollmentCounts = (allocations || []).reduce((acc, allocation) => {
              const instanceId = allocation.course_instance_id.toString();
              acc[instanceId] = (acc[instanceId] || 0) + allocation.seats_allocated;
              return acc;
            }, {} as Record<string, number>);
          }
        }

        // Transform to TrainingEvent format
        const transformedEvents: TrainingEvent[] = (data || []).map(instance => {
          const startDate = new Date(instance.start_date);
          const endDate = instance.end_date ? new Date(instance.end_date) : new Date(startDate);
          
          // Set default end date if not provided
          if (!instance.end_date) {
            endDate.setDate(startDate.getDate() + 1);
          }

          const enrolledCount = enrollmentCounts[instance.id.toString()] || 0;
          const capacity = instance.private_seats_allocated || 
                          (instance.programs?.max_students || 0);

          return {
            id: instance.id.toString(),
            title: instance.programs?.name || "Unnamed Course",
            location: instance.venues?.name || "Unknown Location",
            startDate: instance.start_date,
            endDate: endDate.toISOString(),
            status: new Date(instance.start_date) > new Date() ? 'scheduled' : 'completed',
            capacity: capacity,
            enrolledCount: enrolledCount,
            clientName: null, // Not needed for client view
            isOpenEnrollment: instance.is_open_enrollment || false
          };
        });

        console.log('Transformed client events:', transformedEvents);
        return transformedEvents;
      } catch (error) {
        console.error('Error in events query:', error);
        throw error;
      }
    },
  });

  // Filter events by upcoming/past
  const filteredEvents = events?.filter(event => {
    const now = new Date();
    const eventDate = new Date(event.startDate);
    
    if (eventFilter === "upcoming") {
      return eventDate >= now || event.status === 'scheduled';
    } else {
      return eventDate < now && event.status === 'completed';
    }
  }) || [];

  const upcomingEvents = filteredEvents.filter(event => {
    const now = new Date();
    const eventDate = new Date(event.startDate);
    return eventDate >= now || event.status === 'scheduled';
  });

  const pastEvents = filteredEvents.filter(event => {
    const now = new Date();
    const eventDate = new Date(event.startDate);
    return eventDate < now && event.status === 'completed';
  });

  // Handle event deletion/updates
  const handleEventDeleted = () => {
    console.log("Client event deleted, refetching client events");
    refetch();
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

            <TabsContent value="upcoming">
              {eventFilter === "upcoming" ? (
                <EventListView 
                  upcomingEvents={upcomingEvents}
                  pastEvents={[]}
                  onEventDeleted={handleEventDeleted}
                />
              ) : null}
            </TabsContent>

            <TabsContent value="past">
              {eventFilter === "past" ? (
                <EventListView 
                  upcomingEvents={[]}
                  pastEvents={pastEvents}
                  onEventDeleted={handleEventDeleted}
                />
              ) : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
