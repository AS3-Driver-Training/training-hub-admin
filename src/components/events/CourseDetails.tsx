
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, ArrowLeft, MapPin, Calendar, Users, Building2, Globe, Clock, CheckCircle, AlertCircle, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { LoadingDisplay } from "./allocation/LoadingDisplay";
import { ErrorDisplay } from "./allocation/ErrorDisplay";
import { StudentsContent } from "./allocation/StudentsContent";
import { useCourseClosure } from "./course-closure/hooks/useCourseClosure";

export function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id ? parseInt(id) : undefined;
  
  // Check if course has been formally closed
  const { isClosed, isDraft, closureId } = useCourseClosure(courseId);
  
  const { data: courseInstance, isLoading, error } = useQuery({
    queryKey: ['course-instance', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from('course_instances')
        .select(`
          id,
          start_date,
          end_date,
          is_open_enrollment,
          private_seats_allocated,
          programs:program_id(id, name, max_students),
          venues:venue_id(id, name, address),
          host_client:host_client_id(id, name)
        `)
        .eq('id', courseId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!courseId
  });

  if (isLoading) {
    return <LoadingDisplay text="Loading course details..." />;
  }
  
  if (error || !courseInstance) {
    return (
      <ErrorDisplay 
        title="Error loading course details" 
        error={error} 
        onBack={() => navigate('/events')}
      />
    );
  }

  const startDate = new Date(courseInstance.start_date);
  const endDate = courseInstance.end_date ? new Date(courseInstance.end_date) : null;
  const dateRangeText = endDate 
    ? `${format(startDate, "MMMM d, yyyy")} - ${format(endDate, "MMMM d, yyyy")}` 
    : format(startDate, "MMMM d, yyyy");

  // Determine if the course is completed (end date is in the past)
  const isCompleted = endDate ? endDate < new Date() : startDate < new Date();

  // Determine if the course can be closed
  // Course can be closed only if:
  // 1. It is already completed (end date is in the past)
  // 2. It's not already formally closed
  const canBeClosed = isCompleted && !isClosed;
  
  // Determine if the course is in the future (start date is in the future)
  const isFutureCourse = startDate > new Date();

  // Determine course status for display and actions:
  // 1. If formally closed, show as "Closed" with "Edit Closure" option
  // 2. If date-completed but not formally closed, show as "Completed" with "Finalize Course" option
  // 3. If not completed by date, show as "Scheduled"
  
  const courseStatus = isClosed 
    ? "closed" 
    : isCompleted 
      ? "completed" 
      : "scheduled";
  
  const statusDisplayText = courseStatus === "closed" 
    ? "Closed" 
    : courseStatus === "completed" 
      ? "Completed" 
      : "Scheduled";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{courseInstance.programs?.name}</h1>
        <div className="flex-1"></div>
        
        {courseStatus === "scheduled" && (
          <Button onClick={() => navigate(`/events/${courseInstance.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Course</div>
                  <div className="font-medium">{courseInstance.programs?.name}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div>
                    {courseStatus === "closed" ? (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200">
                        <CheckCircle className="h-3 w-3 mr-1 text-blue-600" /> 
                        Closed
                      </Badge>
                    ) : courseStatus === "completed" ? (
                      <Badge variant="secondary" className="bg-gray-200">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" /> 
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                        <Clock className="h-3 w-3 mr-1" /> 
                        Scheduled
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{courseInstance.venues?.name}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{dateRangeText}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Enrollment Type</div>
                  <div className="flex items-center">
                    {courseInstance.is_open_enrollment ? (
                      <>
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Open Enrollment</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Private ({courseInstance.host_client?.name})</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Capacity</div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {courseInstance.is_open_enrollment 
                        ? courseInstance.programs?.max_students 
                        : courseInstance.private_seats_allocated} seats
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {!courseInstance.is_open_enrollment && (
            <StudentsContent 
              courseInstance={courseInstance} 
              maxStudents={courseInstance.private_seats_allocated || 0} 
            />
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate(`/events/${courseInstance.id}/allocations`)}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Seat Allocations
              </Button>
              
              {courseStatus === "scheduled" && (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate(`/events/${courseInstance.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Button>
              )}
              
              {/* Course closure action button - varies based on status */}
              {courseStatus === "closed" ? (
                <Button 
                  className="w-full justify-start" 
                  variant="default"
                  onClick={() => navigate(`/events/${courseInstance.id}/close`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Closure
                </Button>
              ) : (
                <Button 
                  className="w-full justify-start" 
                  variant={courseStatus === "completed" ? "default" : "outline"}
                  onClick={() => navigate(`/events/${courseInstance.id}/close`)}
                  disabled={!canBeClosed || isFutureCourse}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {courseStatus === "completed" ? "Finalize Course" : "Close Course"}
                </Button>
              )}
              
              {courseStatus === "closed" && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  <p className="text-sm">This course has been successfully closed.</p>
                </Alert>
              )}
              
              {courseStatus === "completed" && !isClosed && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
                  <p className="text-sm">This course has been completed but needs to be finalized.</p>
                </Alert>
              )}
              
              {/* Add an explanation alert when the button is disabled */}
              {!canBeClosed && courseStatus === "scheduled" && !isFutureCourse && (
                <Alert className="bg-gray-50 border-gray-200 text-gray-800">
                  <Clock className="h-4 w-4 text-gray-600 mr-2" />
                  <p className="text-sm">This course cannot be closed until it is completed.</p>
                </Alert>
              )}
              
              {isFutureCourse && (
                <Alert className="bg-gray-50 border-gray-200 text-gray-800">
                  <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                  <p className="text-sm">This course is scheduled in the future and cannot be closed yet.</p>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
