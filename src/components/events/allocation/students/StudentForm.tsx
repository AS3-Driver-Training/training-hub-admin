
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define the schema for the student form
const studentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().optional(),
  employee_number: z.string().optional(),
  client_id: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  onAddStudent: (student: StudentFormValues) => Promise<void>;
  onCancel: () => void;
  availableSeats: number;
  isOpenEnrollment?: boolean;
}

export function StudentForm({ onAddStudent, onCancel, availableSeats, isOpenEnrollment = false }: StudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      employee_number: "",
      client_id: clients.length > 0 ? clients[0].id : undefined,
    },
  });

  // Update form when clients are loaded
  useEffect(() => {
    if (isOpenEnrollment && clients.length > 0 && !form.getValues('client_id')) {
      form.setValue('client_id', clients[0].id);
    }
  }, [clients, form, isOpenEnrollment]);

  const handleSubmit = async (values: StudentFormValues) => {
    if (availableSeats <= 0) {
      form.setError("root", {
        message: "No available seats. Cannot add more students.",
      });
      return;
    }
    
    if (isOpenEnrollment && !values.client_id) {
      form.setError("client_id", {
        message: "Client is required for open enrollment courses",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onAddStudent(values);
      form.reset();
    } catch (error) {
      console.error('Error adding student:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-md p-4 bg-slate-50">
      <h3 className="text-lg font-medium mb-4">Add New Student</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {isOpenEnrollment && (
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client/Company *</FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      disabled={isSubmitting || isLoadingClients || clients.length === 0}
                    >
                      <SelectTrigger>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="employee_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="EMP123" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {form.formState.errors.root && (
            <div className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || availableSeats <= 0}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isSubmitting ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
