
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  const getLevelBadgeColor = (level: string): string => {
    switch(level) {
      case "Basic": return "bg-blue-100 text-blue-800";
      case "Intermediate": return "bg-purple-100 text-purple-800";
      case "Advanced": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading AS3 programs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <CardTitle>AS3 Training Programs</CardTitle>
          <Badge variant="outline" className="ml-2">Available for Enrollment</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50%]">Program</TableHead>
                <TableHead className="w-[25%]">Upcoming Sessions</TableHead>
                <TableHead className="w-[25%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6">
                    No AS3 programs available at this time.
                  </TableCell>
                </TableRow>
              ) : (
                programs?.map((program) => (
                  <TableRow key={program.id} className="border-t">
                    <TableCell>
                      <div className="space-y-2">
                        <div className="font-semibold text-base">{program.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {program.description}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge 
                            variant="secondary" 
                            className={getLevelBadgeColor(program.lvl)}
                          >
                            Level {program.lvl === "Basic" ? "1" : 
                                   program.lvl === "Intermediate" ? "2" : "3"}
                          </Badge>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {program.durationDays} day{program.durationDays !== 1 ? 's' : ''}
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Max {program.maxStudents} students
                          </span>
                          {program.price > 0 && (
                            <span className="text-muted-foreground font-medium">
                              ${program.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {program.upcomingInstances.length > 0 ? (
                        <div className="space-y-1">
                          {program.upcomingInstances.slice(0, 2).map((instance) => (
                            <div key={instance.id} className="text-sm">
                              <div className="font-medium">
                                {format(new Date(instance.start_date), 'MMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                <MapPin className="h-3 w-3" />
                                {instance.venue_name}
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className={instance.available_seats > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {instance.available_seats} seats available
                                </span>
                                {instance.available_seats > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-xs"
                                    onClick={() => handleEnrollment(program, instance)}
                                  >
                                    Request Seats
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                          {program.upcomingInstances.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{program.upcomingInstances.length - 2} more sessions
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No upcoming sessions
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInquiry(program)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Inquire
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

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
    </Card>
  );
}
