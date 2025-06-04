
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Program } from "@/types/programs";

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

export function useAS3Programs() {
  return useQuery({
    queryKey: ["as3-programs-with-instances"],
    queryFn: fetchAS3ProgramsWithInstances,
  });
}

export type { ProgramWithInstances, CourseInstance };
