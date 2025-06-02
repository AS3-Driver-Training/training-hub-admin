import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertCircle } from "lucide-react";
import { useState } from "react";
import { EventListView } from "@/components/events/training/EventListView";
import { StreamlinedEventFilters } from "@/components/events/training/StreamlinedEventFilters";
import { useEventFilters } from "@/components/events/training/hooks/useEventFilters";
import { TrainingEvent } from "@/types/events";
import { queryKeys } from "@/lib/queryKeys";

interface ClientEventsTabProps {
  clientId: string;
}

// Extended interface for course instances with allocation data
interface CourseInstanceWithAllocation {
  id: number;
  start_date: string;
  end_date: string | null;
  is_open_enrollment: boolean;
  private_seats_allocated: number | null;
  actual_students: number;
  program: {
    name: string;
    max_students: number;
  };
  venue: {
    name: string;
    region?: string;
    address?: string;
    country?: string;
  };
  seats_allocated?: number; // From allocations table for open enrollment courses
}

export function ClientEventsTab({ clientId }: ClientEventsTabProps) {
  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.clientEvents(clientId),
    queryFn: async () => {
      try {
        console.log('Fetching all events for client:', clientId);
        
        // Query 1: Get private courses hosted by this client with actual student count
        const { data: privateCourses, error: privateError } = await supabase
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
              name,
              region,
              address,
              country
            ),
            session_attendees!left (
              id
            )
          `)
          .eq('host_client_id', clientId)
          .order('start_date', { ascending: false });

        if (privateError) {
          console.error('Error fetching private courses:', privateError);
          throw privateError;
        }

        console.log('Private courses found:', privateCourses);

        // Transform private courses to include actual student count
        const privateCoursesWithCount = privateCourses?.map(course => ({
          ...course,
          actual_students: course.session_attendees?.length || 0
        })) || [];

        // Query 2: Get open enrollment courses where this client has allocations
        const { data: allocations, error: allocationsError } = await supabase
          .from('course_allocations')
          .select(`
            seats_allocated,
            course_instance:course_instance_id (
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
                name,
                region,
                address,
                country
              ),
              session_attendees!left (
                id,
                student:student_id (
                  team_id,
                  teams:team_id (
                    group_id,
                    groups:group_id (
                      client_id
                    )
                  )
                )
              )
            )
          `)
          .eq('client_id', clientId);

        if (allocationsError) {
          console.error('Error fetching allocations:', allocationsError);
          throw allocationsError;
        }

        console.log('Allocations found:', allocations);

        // Transform allocations data to include seats_allocated and actual student count for this client
        const openEnrollmentCourses: CourseInstanceWithAllocation[] = allocations
          ?.filter(alloc => alloc.course_instance?.is_open_enrollment)
          .map(alloc => {
            // Count students from this specific client
            const clientStudents = alloc.course_instance?.session_attendees?.filter(attendee => 
              attendee.student?.teams?.groups?.client_id === clientId
            ) || [];
            
            return {
              ...alloc.course_instance!,
              seats_allocated: alloc.seats_allocated,
              actual_students: clientStudents.length
            };
          }) || [];

        console.log('Open enrollment courses with allocations:', openEnrollmentCourses);

        // Combine both types of courses
        const allCourses: CourseInstanceWithAllocation[] = [
          ...privateCoursesWithCount,
          ...openEnrollmentCourses
        ];

        console.log('Combined courses:', allCourses);

        // Transform to TrainingEvent format
        const transformedEvents: TrainingEvent[] = allCourses.map(instance => {
          const startDate = new Date(instance.start_date);
          const endDate = instance.end_date ? new Date(instance.end_date) : new Date(startDate);
          
          // Set default end date if not provided
          if (!instance.end_date) {
            endDate.setDate(startDate.getDate() + 1);
          }

          let capacity = 0;
          let enrolledCount = 0;

          if (instance.is_open_enrollment) {
            // For open enrollment courses, use the client's allocated seats as capacity
            capacity = instance.seats_allocated || 0;
            enrolledCount = instance.actual_students; // Actual students from this client
            console.log(`Open enrollment course ${instance.id}: client allocated seats=${capacity}, actual students=${enrolledCount}`);
          } else {
            // For private courses, use private_seats_allocated as capacity
            capacity = instance.private_seats_allocated || 0;
            enrolledCount = instance.actual_students; // Actual enrolled students
            console.log(`Private course ${instance.id}: private seats=${capacity}, actual students=${enrolledCount}`);
          }

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
            isOpenEnrollment: instance.is_open_enrollment || false,
            region: instance.venue?.region || null,
            country: instance.venue?.country || null,
            venue: instance.venue || null
          };
        });

        console.log('Final transformed client events:', transformedEvents);
        return transformedEvents;
      } catch (error) {
        console.error('Error in client events query:', error);
        throw error;
      }
    },
  });

  // Use the same event filters hook as the main Training Events page
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    countryFilter,
    setCountryFilter,
    regionFilter,
    setRegionFilter,
    enrollmentTypeFilter,
    setEnrollmentTypeFilter,
    filteredEvents,
    upcomingEvents,
    pastEvents,
    handleClearFilters
  } = useEventFilters(events || []);

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
          <div className="space-y-4">
            {/* Add comprehensive filters */}
            <StreamlinedEventFilters 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              countryFilter={countryFilter}
              setCountryFilter={setCountryFilter}
              regionFilter={regionFilter}
              setRegionFilter={setRegionFilter}
              enrollmentTypeFilter={enrollmentTypeFilter}
              setEnrollmentTypeFilter={setEnrollmentTypeFilter}
              onClearFilters={handleClearFilters}
              events={events || []}
            />

            {/* Event list with filtered data */}
            <EventListView 
              upcomingEvents={upcomingEvents}
              pastEvents={pastEvents}
              onEventDeleted={handleEventDeleted}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
