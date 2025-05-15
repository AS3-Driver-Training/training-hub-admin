
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Student, StudentFormValues } from '../types';

export function useStudentManagement(courseInstanceId: number, clientId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const queryClient = useQueryClient();

  // Fetch course information to check if it's open enrollment
  const { data: courseInstance } = useQuery({
    queryKey: ['courseInstance', courseInstanceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_instances')
        .select('is_open_enrollment')
        .eq('id', courseInstanceId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });
  
  const isOpenEnrollment = courseInstance?.is_open_enrollment || false;

  // Fetch students data for the selected client and course instance
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', clientId, courseInstanceId],
    queryFn: async () => {
      try {
        setIsLoading(true);
        
        // First, check if there are already enrolled students
        const { data: attendees, error: attendeesError } = await supabase
          .from('session_attendees')
          .select(`
            id,
            student_id,
            status
          `)
          .eq('course_instance_id', courseInstanceId);
          
        if (attendeesError) throw attendeesError;
        
        // Get student IDs that are already enrolled
        const enrolledStudentIds = attendees?.filter(a => a.status !== 'cancelled')
          .map(a => a.student_id) || [];
        
        // For open enrollment, we may have students from different clients
        // For private courses, only fetch students from this client
        let query = supabase
          .from('students')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            employee_number,
            status
          `);
          
        if (!isOpenEnrollment) {
          // For private courses, only show students from the specific client's team
          query = query.eq('team_id', clientId);
        }

        const { data, error } = await query.order('last_name');
        
        if (error) throw error;
        
        // Mark students as enrolled if their ID is in the enrolledStudentIds array
        let formattedStudents = (data || []).map(student => ({
          ...student,
          enrolled: enrolledStudentIds.includes(student.id),
        }));

        // For private courses, show all client students
        // For open enrollment, only show enrolled students
        if (isOpenEnrollment) {
          formattedStudents = formattedStudents.filter(student => 
            student.enrolled || enrolledStudentIds.includes(student.id)
          );
        }
        
        // Update enrolled count
        setEnrolledCount(enrolledStudentIds.length);
        
        return formattedStudents;
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    enabled: !!clientId && !!courseInstanceId,
  });
  
  // Mutation to enroll a student
  const enrollStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const { data, error } = await supabase
        .from('session_attendees')
        .insert({
          student_id: studentId,
          course_instance_id: courseInstanceId,
          status: 'pending'
        });
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', clientId, courseInstanceId] });
      toast.success('Student enrolled successfully');
    },
    onError: (error) => {
      console.error('Error enrolling student:', error);
      toast.error('Failed to enroll student');
    }
  });
  
  // Mutation to unenroll a student
  const unenrollStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      // Find the session attendee record to update
      const { data: attendee, error: findError } = await supabase
        .from('session_attendees')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_instance_id', courseInstanceId)
        .single();
      
      if (findError) throw findError;
      
      if (!attendee) throw new Error('Student enrollment not found');
      
      // Update the status to cancelled
      const { data, error } = await supabase
        .from('session_attendees')
        .update({ status: 'cancelled' })
        .eq('id', attendee.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', clientId, courseInstanceId] });
      toast.success('Student unenrolled successfully');
    },
    onError: (error) => {
      console.error('Error unenrolling student:', error);
      toast.error('Failed to unenroll student');
    }
  });
  
  // Mutation to add a new student
  const addStudentMutation = useMutation({
    mutationFn: async (newStudent: StudentFormValues) => {
      // Handle different client_id for open enrollment courses
      const teamId = newStudent.client_id || clientId;
      let targetTeamId = teamId;
      
      // For open enrollment with client_id, we need to find a team for that client
      if (newStudent.client_id && newStudent.client_id !== clientId) {
        // Get a default team for the client
        const { data: groups, error: groupsError } = await supabase
          .from('groups')
          .select('id')
          .eq('client_id', newStudent.client_id)
          .eq('is_default', true)
          .limit(1);
          
        if (groupsError) throw groupsError;
        
        if (groups && groups.length > 0) {
          const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('id')
            .eq('group_id', groups[0].id)
            .limit(1);
            
          if (teamsError) throw teamsError;
          
          if (teams && teams.length > 0) {
            targetTeamId = teams[0].id;
          }
        }
      }
      
      // Check if student with this email already exists in the system
      const { data: existingStudent, error: searchError } = await supabase
        .from('students')
        .select('id, team_id')
        .eq('email', newStudent.email.toLowerCase())
        .limit(1);
        
      if (searchError) throw searchError;
      
      let studentId;
      
      if (existingStudent && existingStudent.length > 0) {
        // Use existing student
        studentId = existingStudent[0].id;
      } else {
        // First insert the new student
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .insert({
            first_name: newStudent.first_name,
            last_name: newStudent.last_name,
            email: newStudent.email.toLowerCase(),
            phone: newStudent.phone || null,
            employee_number: newStudent.employee_number || null,
            team_id: targetTeamId,
            status: 'active' // Default status for new students
          })
          .select('id')
          .single();
        
        if (studentError) throw studentError;
        studentId = studentData.id;
      }
      
      // Then check if student is already enrolled in this course
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('session_attendees')
        .select('id, status')
        .eq('student_id', studentId)
        .eq('course_instance_id', courseInstanceId);
        
      if (checkError) throw checkError;
      
      // If student is enrolled but cancelled, update to active
      if (existingEnrollment && existingEnrollment.length > 0) {
        const enrollment = existingEnrollment[0];
        
        if (enrollment.status === 'cancelled') {
          // Reactivate the enrollment
          const { error: updateError } = await supabase
            .from('session_attendees')
            .update({ status: 'pending' })
            .eq('id', enrollment.id);
            
          if (updateError) throw updateError;
        } else {
          throw new Error('Student is already enrolled in this course');
        }
      } else {
        // Enroll the student in the course
        const { error: enrollError } = await supabase
          .from('session_attendees')
          .insert({
            student_id: studentId,
            course_instance_id: courseInstanceId,
            status: 'pending'
          });
        
        if (enrollError) throw enrollError;
      }
      
      return { studentId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', clientId, courseInstanceId] });
      toast.success('Student added and enrolled successfully');
    },
    onError: (error: any) => {
      console.error('Error adding student:', error);
      
      if (error.message.includes('already enrolled')) {
        toast.error('Student is already enrolled in this course');
      } else {
        toast.error('Failed to add student: ' + (error.message || 'Unknown error'));
      }
    }
  });
  
  return {
    students,
    enrolledCount,
    isLoading: isLoading || isLoadingStudents,
    enrollStudent: enrollStudentMutation.mutate,
    unenrollStudent: unenrollStudentMutation.mutate,
    addStudent: addStudentMutation.mutate,
  };
}
