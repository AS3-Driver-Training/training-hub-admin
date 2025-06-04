
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, MessageCircle, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Program } from "@/types/programs";
import { InquiryDialog } from "./InquiryDialog";
import { EnrollmentDialog } from "./EnrollmentDialog";
import { format } from "date-fns";

interface CourseInstance {
  id: string;
  start_date: string;
  end_date: string;
  venue_name: string;
  available_seats: number;
  total_seats: number;
}

interface ProgramWithInstances extends Program {
  upcomingInstances: CourseInstance[];
}

// Function to fetch AS3 programs with upcoming course instances
const fetchAS3ProgramsWithInstances = async (): Promise<ProgramWithInstances[]> => {
  // Fetch programs
  const { data: programsData, error: programsError } = await supabase
    .from('programs')
    .select('*');
  
  if (programsError) {
    console.error("Error fetching programs:", programsError);
    throw new Error("Failed to fetch programs");
  }

  const programs = (programsData || []).map(program => ({
    id: program.id.toString(),
    name: program.name,
    sku: program.sku,
    description: program.description || "",
    durationDays: program.duration_days || 0,
    maxStudents: program.max_students || 0,
    minStudents: program.min_students || 0,
    price: program.price || 0,
    lvl: getLevelString(program.lvl),
    measured: program.measured || false,
    upcomingInstances: [],
  }));

  // Fetch upcoming open enrollment course instances for each program
  for (const program of programs) {
    const { data: instancesData, error: instancesError } = await supabase
      .from('course_instances')
      .select(`
        id,
        start_date,
        end_date,
        private_seats_allocated,
        venues:venue_id(name),
        programs:program_id(max_students)
      `)
      .eq('program_id', parseInt(program.id))
      .eq('is_open_enrollment', true)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true });

    if (instancesError) {
      console.error(`Error fetching instances for program ${program.id}:`, instancesError);
      continue;
    }

    // Get allocations for these instances to calculate available seats
    const instanceIds = (instancesData || []).map(instance => instance.id);
    if (instanceIds.length > 0) {
      const { data: allocationsData } = await supabase
        .from('course_allocations')
        .select('course_instance_id, seats_allocated')
        .in('course_instance_id', instanceIds);

      const allocationsByInstance = (allocationsData || []).reduce((acc, allocation) => {
        acc[allocation.course_instance_id] = (acc[allocation.course_instance_id] || 0) + allocation.seats_allocated;
        return acc;
      }, {} as Record<string, number>);

      program.upcomingInstances = (instancesData || []).map(instance => {
        const totalSeats = instance.private_seats_allocated || instance.programs?.max_students || 0;
        const allocatedSeats = allocationsByInstance[instance.id] || 0;
        
        return {
          id: instance.id.toString(),
          start_date: instance.start_date,
          end_date: instance.end_date,
          venue_name: instance.venues?.name || 'TBD',
          available_seats: totalSeats - allocatedSeats,
          total_seats: totalSeats,
        };
      });
    }
  }

  return programs;
};

// Helper function to convert numeric level to string representation
const getLevelString = (level?: number): string => {
  switch(level) {
    case 1: return "Basic";
    case 2: return "Intermediate";
    case 3: return "Advanced";
    default: return "Basic";
  }
};

export function AS3ProgramsForClients() {
  const [selectedProgram, setSelectedProgram] = useState<ProgramWithInstances | null>(null);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<CourseInstance | null>(null);

  const { data: programs, isLoading } = useQuery({
    queryKey: ["as3-programs-with-instances"],
    queryFn: fetchAS3ProgramsWithInstances,
  });

  const handleInquiry = (program: ProgramWithInstances) => {
    setSelectedProgram(program);
    setInquiryDialogOpen(true);
  };

  const handleEnrollment = (program: ProgramWithInstances, instance: CourseInstance) => {
    setSelectedProgram(program);
    setSelectedInstance(instance);
    setEnrollmentDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading AS3 programs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5" />
        <h2 className="text-xl font-semibold">AS3 Training Programs</h2>
        <Badge variant="outline" className="ml-2">Available for Enrollment</Badge>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs?.map((program) => (
          <Card key={program.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg">{program.name}</CardTitle>
                <Badge variant="secondary">{program.lvl}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{program.description}</p>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{program.durationDays} day{program.durationDays !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>Max {program.maxStudents} students</span>
                </div>
                
                {program.price > 0 && (
                  <div className="text-sm font-medium">
                    ${program.price.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Upcoming Instances */}
              {program.upcomingInstances.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Upcoming Sessions:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {program.upcomingInstances.slice(0, 3).map((instance) => (
                      <div key={instance.id} className="p-2 bg-muted rounded-sm">
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <div className="font-medium">
                              {format(new Date(instance.start_date), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {instance.venue_name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${instance.available_seats > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {instance.available_seats} seats
                            </div>
                            {instance.available_seats > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-1 text-xs h-6"
                                onClick={() => handleEnrollment(program, instance)}
                              >
                                Request Seats
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {program.upcomingInstances.length > 3 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      +{program.upcomingInstances.length - 3} more sessions
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto pt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleInquiry(program)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Inquire About This Program
                </Button>
                
                {program.upcomingInstances.length === 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    No upcoming sessions scheduled
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogs */}
      <InquiryDialog
        open={inquiryDialogOpen}
        onClose={() => {
          setInquiryDialogOpen(false);
          setSelectedProgram(null);
        }}
        program={selectedProgram}
      />
      
      <EnrollmentDialog
        open={enrollmentDialogOpen}
        onClose={() => {
          setEnrollmentDialogOpen(false);
          setSelectedProgram(null);
          setSelectedInstance(null);
        }}
        program={selectedProgram}
        instance={selectedInstance}
      />
    </div>
  );
}
