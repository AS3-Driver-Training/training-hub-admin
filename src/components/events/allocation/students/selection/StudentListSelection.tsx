
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Search, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StudentListSelectionProps {
  clientId: string;
  courseInstanceId: number;
  isOpenEnrollment: boolean;
  availableSeats: number;
  onClose: () => void;
}

type Student = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  employee_number?: string;
  company?: string;
  teams?: {
    name: string;
    groups?: {
      name: string;
      clients?: {
        name: string;
        id: string;
      }
    }
  }
};

export function StudentListSelection({
  clientId,
  courseInstanceId,
  isOpenEnrollment,
  availableSeats,
  onClose
}: StudentListSelectionProps) {
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(clientId);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Count for already enrolled students
  const { data: enrolledCount = 0, isLoading: isLoadingEnrolled } = useQuery({
    queryKey: ['enrolledCount', courseInstanceId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('session_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('course_instance_id', courseInstanceId)
        .neq('status', 'cancelled');
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch client list (only for open enrollment courses)
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpenEnrollment,
  });

  // Fetch groups based on selected client
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['groups', selectedClientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, is_default')
        .eq('client_id', selectedClientId)
        .order('name');
      
      if (error) {
        console.error('Error fetching groups:', error);
        throw error;
      }
      console.log('Groups loaded:', data);
      return data || [];
    },
    enabled: !!selectedClientId,
  });

  // Handle default group selection separately using useEffect
  useEffect(() => {
    // Only automatically select default group on initial load
    if (!initialLoadComplete && selectedGroupId === "all" && groups.length > 0) {
      console.log('Finding default group from:', groups);
      const defaultGroup = groups.find(g => g.is_default);
      if (defaultGroup) {
        console.log('Setting default group:', defaultGroup.name);
        setSelectedGroupId(defaultGroup.id);
      }
      setInitialLoadComplete(true);
    }
  }, [groups, selectedGroupId, initialLoadComplete]);

  // Fetch teams based on selected group
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId || selectedGroupId === "all") return [];
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('group_id', selectedGroupId)
        .order('name');
      
      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }
      console.log('Teams loaded:', data);
      return data || [];
    },
    enabled: !!selectedGroupId && selectedGroupId !== "all",
  });

  // Only reset team selection when group changes
  useEffect(() => {
    if (selectedGroupId === "all" || groups.length === 0) {
      setSelectedTeamId("all");
    }
  }, [selectedGroupId, groups.length]);

  // Fetch students with filtering options
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['filteredStudents', courseInstanceId, selectedClientId, selectedGroupId, selectedTeamId, searchQuery],
    queryFn: async () => {
      try {
        console.log('Fetching students with filters:', {
          courseInstanceId,
          selectedClientId,
          selectedGroupId,
          selectedTeamId,
          searchQuery
        });

        let query = supabase
          .from('students')
          .select(`
            id,
            first_name,
            last_name,
            email,
            employee_number,
            status,
            teams (
              name,
              groups (
                name,
                clients (
                  name,
                  id
                )
              )
            )
          `)
          .eq('status', 'active');
        
        // Apply team filter if selected
        if (selectedTeamId && selectedTeamId !== "all") {
          query = query.eq('teams.id', selectedTeamId);
        } 
        // Apply group filter through teams if selected (and team not selected)
        else if (selectedGroupId && selectedGroupId !== "all") {
          query = query.eq('teams.groups.id', selectedGroupId);
        }
        // Apply client filter if selected (and neither team nor group selected)
        if (selectedClientId) {
          if (isOpenEnrollment) {
            if (selectedClientId !== "all") {
              query = query.eq('teams.groups.clients.id', selectedClientId);
            }
          } else {
            // For private courses, always filter by the given client ID
            query = query.eq('teams.groups.clients.id', selectedClientId);
          }
        }
        
        // Apply search query if provided
        if (searchQuery.trim()) {
          query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query.order('last_name');
        
        if (error) {
          console.error('Error in student query:', error);
          throw error;
        }

        console.log('Students raw data:', data);
        
        // Fetch already enrolled students to exclude them
        const { data: enrolled, error: enrolledError } = await supabase
          .from('session_attendees')
          .select('student_id')
          .eq('course_instance_id', courseInstanceId)
          .neq('status', 'cancelled');
        
        if (enrolledError) {
          console.error('Error fetching enrolled students:', enrolledError);
          throw enrolledError;
        }
        
        const enrolledIds = new Set((enrolled || []).map(e => e.student_id));
        console.log('Already enrolled student IDs:', Array.from(enrolledIds));
        
        // Filter out already enrolled students
        const filteredStudents = (data || []).filter(student => !enrolledIds.has(student.id));
        console.log(`Found ${filteredStudents.length} available students after filtering enrolled ones`);
        
        return filteredStudents;
      } catch (error) {
        console.error('Error in filteredStudents query:', error);
        throw error;
      }
    },
    enabled: !!selectedClientId || isOpenEnrollment,
  });

  // Toggle student selection
  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      // Check if we haven't reached the maximum number of available seats
      if (selectedStudents.length < availableSeats) {
        setSelectedStudents([...selectedStudents, studentId]);
      } else {
        toast.error(`Cannot select more than ${availableSeats} students`);
      }
    }
  };

  // Mutation to enroll selected students
  const enrollStudentsMutation = useMutation({
    mutationFn: async (studentIds: string[]) => {
      const enrollmentData = studentIds.map(studentId => ({
        student_id: studentId,
        course_instance_id: courseInstanceId,
        status: 'pending'
      }));

      const { data, error } = await supabase
        .from('session_attendees')
        .insert(enrollmentData);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', clientId, courseInstanceId] });
      queryClient.invalidateQueries({ queryKey: ['enrolledCount', courseInstanceId] });
      toast.success(`${selectedStudents.length} students enrolled successfully`);
      onClose();
    },
    onError: (error) => {
      console.error('Error enrolling students:', error);
      toast.error('Failed to enroll students');
    }
  });

  // Handle enrollment submission
  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    await enrollStudentsMutation.mutate(selectedStudents);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Select Students to Enroll</h3>
        <p className="text-muted-foreground text-sm">
          Select the students you want to enroll in this course. You can select up to {availableSeats} students.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {isOpenEnrollment && (
          <div>
            <Label htmlFor="client">Client/Company</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger id="client">
                <SelectValue placeholder={isLoadingClients ? "Loading..." : "All Clients"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedClientId && (
          <div>
            <Label htmlFor="group">Group</Label>
            <Select value={selectedGroupId} onValueChange={(value) => {
              console.log('Group selection changed to:', value);
              setSelectedGroupId(value);
              if (value === "all") {
                // User explicitly selected "All Groups", respect that choice
                console.log('User selected All Groups explicitly');
              }
            }}>
              <SelectTrigger id="group">
                <SelectValue placeholder={isLoadingGroups ? "Loading..." : "All Groups"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} {group.is_default ? "(Default)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedGroupId && (
          <div>
            <Label htmlFor="team">Team</Label>
            <Select 
              value={selectedTeamId} 
              onValueChange={(value) => {
                console.log('Team selection changed to:', value);
                setSelectedTeamId(value);
              }} 
              disabled={selectedGroupId === "all" || teams.length === 0}
            >
              <SelectTrigger id="team">
                <SelectValue placeholder={isLoadingTeams ? "Loading..." : "All Teams"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name or email"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Selection info */}
      <Alert className="bg-blue-50 border-blue-200 text-blue-800">
        <AlertDescription>
          {selectedStudents.length} of {availableSeats} available seats selected
        </AlertDescription>
      </Alert>

      {/* Students list */}
      <div className="rounded-md border h-[300px] overflow-y-auto">
        {isLoadingStudents ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <p className="text-muted-foreground">No students found for the selected filters</p>
            <p className="text-sm text-muted-foreground mt-2">Try changing your filter criteria</p>
          </div>
        ) : (
          <div className="divide-y">
            {students.map((student) => (
              <div
                key={student.id}
                className={`flex items-center p-3 hover:bg-slate-50 ${
                  selectedStudents.includes(student.id) ? "bg-blue-50" : ""
                }`}
              >
                <Checkbox
                  id={`student-${student.id}`}
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={() => toggleStudentSelection(student.id)}
                  className="mr-3"
                  disabled={
                    !selectedStudents.includes(student.id) &&
                    selectedStudents.length >= availableSeats
                  }
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
                  <div>
                    <Label
                      htmlFor={`student-${student.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {student.first_name} {student.last_name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                    {student.employee_number && (
                      <span className="text-xs text-muted-foreground">
                        ID: {student.employee_number}
                      </span>
                    )}
                  </div>
                  {isOpenEnrollment && (
                    <div className="mt-2 sm:mt-0 text-sm text-muted-foreground whitespace-nowrap">
                      {student.teams?.groups?.clients?.name || "Unknown Company"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enrollment button */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleEnrollStudents}
          disabled={selectedStudents.length === 0 || enrollStudentsMutation.isPending}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {enrollStudentsMutation.isPending 
            ? "Enrolling..." 
            : `Enroll ${selectedStudents.length} Student${selectedStudents.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}
