
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StudentFileImportProps {
  clientId: string;
  courseInstanceId: number;
  isOpenEnrollment: boolean;
  availableSeats: number;
  onClose: () => void;
}

export function StudentFileImport({
  clientId,
  courseInstanceId,
  isOpenEnrollment,
  availableSeats,
  onClose
}: StudentFileImportProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [targetClientId, setTargetClientId] = useState<string>(clientId);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch available clients (for open enrollment courses)
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

  // Get team for the client (needed for student creation)
  const { data: clientTeams = [] } = useQuery({
    queryKey: ['clientTeams', targetClientId],
    queryFn: async () => {
      // First get default group
      const { data: groups, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('client_id', targetClientId)
        .eq('is_default', true)
        .limit(1);
      
      if (groupError) throw groupError;
      
      if (!groups || groups.length === 0) return [];
      
      // Then get teams from default group
      const { data: teams, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('group_id', groups[0].id)
        .limit(1);
      
      if (teamError) throw teamError;
      
      return teams || [];
    },
    enabled: !!targetClientId,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const header = "First Name,Last Name,Email,Phone,Employee Number\n";
    const blob = new Blob([header], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const processCSV = async (fileContent: string): Promise<any[]> => {
    return new Promise((resolve) => {
      const lines = fileContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const students = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim());
        
        // Create student object
        const student: any = {};
        headers.forEach((header, index) => {
          if (values[index]) {
            // Convert header to snake_case for database fields
            const field = header.toLowerCase().replace(/\s+/g, '_');
            student[field] = values[index];
          }
        });
        
        students.push(student);
      }
      
      resolve(students);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    
    if (!targetClientId) {
      toast.error('Please select a client');
      return;
    }
    
    if (!clientTeams || clientTeams.length === 0) {
      toast.error('No teams found for the selected client');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Read file content
      const fileContent = await file.text();
      const students = await processCSV(fileContent);
      
      if (students.length === 0) {
        toast.error('No valid data found in the CSV file');
        setIsSubmitting(false);
        return;
      }
      
      if (students.length > availableSeats - enrolledCount) {
        toast.error(`CSV contains ${students.length} students but only ${availableSeats - enrolledCount} seats are available`);
        setIsSubmitting(false);
        return;
      }
      
      const teamId = clientTeams[0].id;
      let successCount = 0;
      const errors = [];
      
      for (const studentData of students) {
        // Required fields
        if (!studentData.first_name || !studentData.last_name || !studentData.email) {
          errors.push(`Missing required field for student: ${studentData.email || 'unknown'}`);
          continue;
        }
        
        // Check if student already exists
        const { data: existingStudents, error: searchError } = await supabase
          .from('students')
          .select('id')
          .eq('email', studentData.email.toLowerCase())
          .eq('team_id', teamId);
        
        if (searchError) {
          errors.push(`Error checking student: ${studentData.email} - ${searchError.message}`);
          continue;
        }
        
        let studentId;
        
        if (existingStudents && existingStudents.length > 0) {
          studentId = existingStudents[0].id;
        } else {
          // Create the student record
          const { data: newStudent, error: createError } = await supabase
            .from('students')
            .insert({
              first_name: studentData.first_name,
              last_name: studentData.last_name,
              email: studentData.email.toLowerCase(),
              phone: studentData.phone || null,
              employee_number: studentData.employee_number || null,
              team_id: teamId,
              status: 'active'
            })
            .select('id')
            .single();
          
          if (createError) {
            errors.push(`Error creating student: ${studentData.email} - ${createError.message}`);
            continue;
          }
          
          studentId = newStudent.id;
        }
        
        // Check if student is already enrolled
        const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
          .from('session_attendees')
          .select('id')
          .eq('student_id', studentId)
          .eq('course_instance_id', courseInstanceId)
          .neq('status', 'cancelled');
        
        if (enrollmentCheckError) {
          errors.push(`Error checking enrollment: ${studentData.email} - ${enrollmentCheckError.message}`);
          continue;
        }
        
        if (existingEnrollment && existingEnrollment.length > 0) {
          errors.push(`Student already enrolled: ${studentData.email}`);
          continue;
        }
        
        // Enroll the student
        const { error: enrollError } = await supabase
          .from('session_attendees')
          .insert({
            student_id: studentId,
            course_instance_id: courseInstanceId,
            status: 'pending'
          });
        
        if (enrollError) {
          errors.push(`Error enrolling student: ${studentData.email} - ${enrollError.message}`);
          continue;
        }
        
        successCount++;
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['students', clientId, courseInstanceId] });
      queryClient.invalidateQueries({ queryKey: ['enrolledCount', courseInstanceId] });
      
      if (errors.length > 0) {
        toast.error(`Import completed with ${errors.length} errors. ${successCount} students were enrolled successfully.`);
        console.error('Import errors:', errors);
      } else {
        toast.success(`${successCount} students imported and enrolled successfully`);
        onClose();
      }
    } catch (error) {
      console.error('Error importing students:', error);
      toast.error('Failed to process the file');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Import Students from CSV</h3>
        <p className="text-muted-foreground text-sm">
          Upload a CSV file with student information to bulk enroll them in this course.
        </p>
      </div>

      {(isOpenEnrollment || !clientId) && (
        <div className="space-y-2">
          <Label htmlFor="importClient">Select Client/Company</Label>
          <Select 
            value={targetClientId} 
            onValueChange={setTargetClientId}
            disabled={isSubmitting}
          >
            <SelectTrigger id="importClient">
              <SelectValue placeholder={isLoadingClients ? "Loading..." : "Select a client"} />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Students will be added to this client's default team.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="csvFile">Upload CSV File</Label>
        <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-slate-50">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-2">
            Drop your file here or click to browse
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            CSV format with headers: First Name, Last Name, Email, Phone, Employee Number
          </p>
          <input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isSubmitting}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('csvFile')?.click()}
            disabled={isSubmitting}
          >
            <FileText className="mr-2 h-4 w-4" />
            Select CSV File
          </Button>
          {file && (
            <p className="text-sm mt-2">
              Selected: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="text-sm h-auto p-0"
        onClick={handleDownloadTemplate}
        disabled={isSubmitting}
      >
        <Download className="mr-1 h-3 w-3" />
        Download template CSV
      </Button>

      <Alert className="bg-blue-50 border-blue-200 text-blue-800">
        <AlertDescription>
          {enrolledCount} of {availableSeats} seats already filled. You can import up to {availableSeats - enrolledCount} students.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!file || !targetClientId || isSubmitting || availableSeats <= enrolledCount}
        >
          {isSubmitting ? "Importing..." : "Import Students"}
        </Button>
      </div>
    </form>
  );
}
