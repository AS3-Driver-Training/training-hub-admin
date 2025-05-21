
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, UsersIcon, Building2Icon, PencilIcon, Share2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/utils/toast";

export function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [closureStatus, setClosureStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('course_instances')
          .select(`
            *,
            programs(*),
            venues(*),
            host_client:clients(*)
          `)
          .eq('id', parseInt(id))
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // Fetch allocations
        const { data: allocationsData, error: allocationsError } = await supabase
          .from('course_allocations')
          .select(`
            *,
            client:clients(*)
          `)
          .eq('course_instance_id', parseInt(id));

        if (allocationsError) throw allocationsError;
        setAllocations(allocationsData || []);

        // Fetch attendees
        const { data: attendeesData, error: attendeesError } = await supabase
          .from('session_attendees')
          .select(`
            *,
            student:students(*)
          `)
          .eq('course_instance_id', parseInt(id));

        if (attendeesError) throw attendeesError;
        setAttendees(attendeesData || []);

        // Fetch vehicles
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('course_vehicles')
          .select(`
            *,
            vehicle:vehicles(*)
          `)
          .eq('course_instance_id', parseInt(id));

        if (vehiclesError) throw vehiclesError;
        setVehicles(vehiclesData || []);

        // Check if course has closure data
        const { data: closureData, error: closureError } = await supabase
          .from('course_closures')
          .select('status')
          .eq('course_instance_id', parseInt(id))
          .maybeSingle();

        if (closureError) throw closureError;
        setClosureStatus(closureData?.status || null);

      } catch (error) {
        console.error('Error fetching course details:', error);
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading course details...</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  const startDate = new Date(course.start_date);
  const endDate = course.end_date ? new Date(course.end_date) : null;

  const totalAllocatedSeats = allocations.reduce((sum, allocation) => sum + allocation.seats_allocated, 0);
  const totalAttendees = attendees.length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{course.programs.name}</h1>
          <p className="text-muted-foreground">
            {format(startDate, 'MMMM d, yyyy')}
            {endDate && ` - ${format(endDate, 'MMMM d, yyyy')}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/events/${id}/edit`)}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => navigate(`/events/${id}/allocations`)}>
            <Share2Icon className="h-4 w-4 mr-2" />
            Allocations
          </Button>
          <Button asChild variant="outline">
            <Link to={`/events/${id}/closure`}>
              Course Closure
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>Information about this training event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{course.venues.name}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {format(startDate, 'MMMM d, yyyy')}
                {endDate && ` - ${format(endDate, 'MMMM d, yyyy')}`}
              </span>
            </div>
            <div className="flex items-center">
              <UsersIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {totalAttendees} attendees / {totalAllocatedSeats} allocated seats
              </span>
            </div>
            {course.host_client && (
              <div className="flex items-center">
                <Building2Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Hosted by {course.host_client.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={course.is_open_enrollment ? "default" : "secondary"}>
                {course.is_open_enrollment ? "Open Enrollment" : "Private"}
              </Badge>
              {closureStatus && (
                <Badge variant={closureStatus === "completed" ? "success" : "warning"}>
                  {closureStatus === "completed" ? "Closed" : "Closure In Progress"}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Program</CardTitle>
            <CardDescription>Program details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium">Name</div>
              <div>{course.programs.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium">SKU</div>
              <div>{course.programs.sku}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Level</div>
              <div>
                {course.programs.lvl === 1 && "Basic"}
                {course.programs.lvl === 2 && "Intermediate"}
                {course.programs.lvl === 3 && "Advanced"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Duration</div>
              <div>{course.programs.duration_days} days</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Section - Consolidated */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Attendees</CardTitle>
            <CardDescription>
              {totalAttendees} students attending this course
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/events/${id}/allocations`)}
          >
            <UsersIcon className="h-4 w-4 mr-2" />
            Manage Students
          </Button>
        </CardHeader>
        <CardContent>
          {attendees.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-slate-50">
              <p className="text-muted-foreground">No attendees enrolled yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate(`/events/${id}/allocations`)}
              >
                Add Students
              </Button>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Student List</span>
                  <span className="text-sm text-muted-foreground">
                    {totalAttendees} of {totalAllocatedSeats} seats filled
                  </span>
                </div>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {attendee.student.first_name} {attendee.student.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendee.student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={attendee.status === "confirmed" ? "success" : "secondary"}>
                          {attendee.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Only show allocations info if there are allocations */}
          {allocations.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border">
              <h4 className="font-medium mb-2">Seat Allocations</h4>
              <div className="flex flex-col gap-2">
                {allocations.map((allocation) => (
                  <div key={allocation.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span>{allocation.client.name}</span>
                    <Badge variant="outline">{allocation.seats_allocated} seats</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicles Section */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
          <CardDescription>
            Vehicles assigned to this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <p className="text-muted-foreground">No vehicles assigned yet</p>
          ) : (
            <div className="space-y-4">
              {vehicles.map((courseVehicle) => (
                <div key={courseVehicle.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <div className="font-medium">
                      Car #{courseVehicle.car_number}: {courseVehicle.vehicle.make} {courseVehicle.vehicle.model}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      LatAcc: {courseVehicle.vehicle.latacc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
