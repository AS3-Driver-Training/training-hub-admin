import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, ArrowLeft, MapPin, Calendar, Users, Building2, Globe, Clock, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { LoadingDisplay } from "./allocation/LoadingDisplay";
import { ErrorDisplay } from "./allocation/ErrorDisplay";
import { StudentsContent } from "./allocation/StudentsContent";

export function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id ? parseInt(id) : undefined;
  
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
  const status = isCompleted ? "completed" : "scheduled";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{courseInstance.programs?.name}</h1>
        <div className="flex-1"></div>
        
        {!isCompleted && (
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
                    {isCompleted ? (
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
              
              {!isCompleted && (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate(`/events/${courseInstance.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Button>
              )}
              
              {/* Add Close Course button */}
              <Button 
                className="w-full justify-start" 
                variant={isCompleted ? "default" : "outline"}
                onClick={() => navigate(`/events/${courseInstance.id}/close`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                {isCompleted ? "Finalize Course" : "Close Course"}
              </Button>
              
              {isCompleted && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
                  <p className="text-sm">This course has been completed and cannot be edited.</p>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
