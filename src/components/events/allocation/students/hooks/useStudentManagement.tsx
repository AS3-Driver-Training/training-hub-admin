
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Student } from '../types';

export function useStudentManagement(courseInstanceId: number, clientId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const queryClient = useQueryClient();

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
        
        // Then, get students from this client
        const { data, error } = await supabase
          .from('students')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            employee_number,
            status
          `)
          .eq('team_id', clientId);
        
        if (error) throw error;
        
        // Mark students who are already enrolled
        const formattedStudents = (data || []).map(student => ({
          ...student,
          enrolled: enrolledStudentIds.includes(student.id),
        }));
        
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
    mutationFn: async (newStudent: Omit<Student, 'id' | 'enrolled'>) => {
      // First insert the new student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          ...newStudent,
          team_id: clientId
        })
        .select('id')
        .single();
      
      if (studentError) throw studentError;
      
      // Then enroll the student in the course
      const { data: enrollData, error: enrollError } = await supabase
        .from('session_attendees')
        .insert({
          student_id: studentData.id,
          course_instance_id: courseInstanceId,
          status: 'pending'
        });
      
      if (enrollError) throw enrollError;
      
      return { student: studentData, enrollment: enrollData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', clientId, courseInstanceId] });
      toast.success('Student added and enrolled successfully');
    },
    onError: (error) => {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
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
