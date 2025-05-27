
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
        
        // First, get all course instances for this client
        const { data: courseInstances, error: instancesError } = await supabase
          .from('course_instances')
          .select(`
            id,
            start_date,
            end_date,
            is_open_enrollment,
            private_seats_allocated,
            program:program_id (
              name,
              max_students
            ),
            venue:venue_id (
              name
            )
          `)
          .eq('host_client_id', clientId)
          .order('start_date', { ascending: false });

        if (instancesError) {
          console.error('Error fetching client course instances:', instancesError);
          throw instancesError;
        }

        console.log('Course instances found:', courseInstances);

        if (!courseInstances || courseInstances.length === 0) {
          console.log('No course instances found for client:', clientId);
          return [];
        }

        // Get all allocations for these course instances in one query
        const courseInstanceIds = courseInstances.map(instance => instance.id);
        console.log('Fetching allocations for course instances:', courseInstanceIds);
        
        const { data: allocations, error: allocationsError } = await supabase
          .from('course_allocations')
          .select('course_instance_id, seats_allocated')
          .in('course_instance_id', courseInstanceIds);
        
        if (allocationsError) {
          console.error('Error fetching allocations:', allocationsError);
          // Don't throw here, just log and continue with empty allocations
        }

        console.log('Allocations found:', allocations);

        // Calculate enrollment counts by course instance
        const enrollmentCounts: Record<string, number> = {};
        if (allocations) {
          allocations.forEach(allocation => {
            const instanceId = allocation.course_instance_id.toString();
            enrollmentCounts[instanceId] = (enrollmentCounts[instanceId] || 0) + allocation.seats_allocated;
          });
        }

        console.log('Calculated enrollment counts:', enrollmentCounts);

        // Transform to TrainingEvent format
        const transformedEvents: TrainingEvent[] = courseInstances.map(instance => {
          const startDate = new Date(instance.start_date);
          const endDate = instance.end_date ? new Date(instance.end_date) : new Date(startDate);
          
          // Set default end date if not provided
          if (!instance.end_date) {
            endDate.setDate(startDate.getDate() + 1);
          }

          const enrolledCount = enrollmentCounts[instance.id.toString()] || 0;
          
          // For private courses, use private_seats_allocated as capacity
          // For open enrollment, use program max_students
          let capacity = 0;
          if (instance.is_open_enrollment) {
            capacity = instance.program?.max_students || 0;
          } else {
            capacity = instance.private_seats_allocated || 0;
          }

          console.log(`Instance ${instance.id}: enrolled=${enrolledCount}, capacity=${capacity}, isOpen=${instance.is_open_enrollment}`);

          return {
            id: instance.id.toString(),
            title: instance.program?.name || "Unnamed Course",
            location: instance.venue?.name || "Unknown Location",
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
        console.error('Error in client events query:', error);
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
            Error loading events: {error instanceof Error ? error.message : 'Unknown error'}
            <div className="mt-2 text-sm">
              Please check the console for more details.
            </div>
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
            Client Events ({events?.length || 0} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={eventFilter} onValueChange={(value) => setEventFilter(value as "upcoming" | "past")}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming Events ({upcomingEvents.length})</TabsTrigger>
              <TabsTrigger value="past">Past Events ({pastEvents.length})</TabsTrigger>
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
