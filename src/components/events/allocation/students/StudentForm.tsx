
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Client, Group, Team, Student } from "./types";

// Define the student schema
const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
  groupId: z.string().min(1, "Group is required"),
  teamId: z.string().min(1, "Team is required"),
  active: z.boolean().default(true)
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  clientId: string;
  onCancel: () => void;
  onAddStudent: (student: Student) => void;
  seatsRemaining: number;
}

export function StudentForm({ clientId, onCancel, onAddStudent, seatsRemaining }: StudentFormProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  // Form setup
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      clientId: clientId || "",
      groupId: "",
      teamId: "",
      active: true
    }
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error",
          description: "Could not fetch clients",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Client[];
    }
  });

  // Fetch groups based on selected client
  const { data: groups = [], refetch: refetchGroups } = useQuery({
    queryKey: ['groups', selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return [];
      
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, client_id, is_default')
        .eq('client_id', selectedClientId)
        .order('name');
      
      if (error) {
        console.error("Error fetching groups:", error);
        toast({
          title: "Error",
          description: "Could not fetch groups",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Group[];
    },
    enabled: !!selectedClientId
  });

  // Fetch teams based on selected group
  const { data: teams = [], refetch: refetchTeams } = useQuery({
    queryKey: ['teams', selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, group_id')
        .eq('group_id', selectedGroupId)
        .order('name');
      
      if (error) {
        console.error("Error fetching teams:", error);
        toast({
          title: "Error",
          description: "Could not fetch teams",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Team[];
    },
    enabled: !!selectedGroupId
  });

  // Set clientId from prop if it's provided
  useEffect(() => {
    if (clientId) {
      form.setValue("clientId", clientId);
      setSelectedClientId(clientId);
    }
  }, [clientId, form]);

  // When the client changes, update the groups and clear the group/team selection
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'clientId' && value.clientId) {
        setSelectedClientId(value.clientId as string);
        form.setValue("groupId", ""); // Clear group selection
        form.setValue("teamId", "");  // Clear team selection
        setSelectedGroupId("");
      } else if (name === 'groupId' && value.groupId) {
        setSelectedGroupId(value.groupId as string);
        form.setValue("teamId", "");  // Clear team selection
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // When groups data changes and there's only one group (the default), auto-select it
  useEffect(() => {
    if (groups && groups.length === 1) {
      form.setValue("groupId", groups[0].id);
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, form]);

  // When teams data changes and there's only one team (the default), auto-select it
  useEffect(() => {
    if (teams && teams.length === 1) {
      form.setValue("teamId", teams[0].id);
    }
  }, [teams, form]);

  // Find default group in the selected client
  const getDefaultGroup = (): Group | undefined => {
    return groups.find(g => g.is_default);
  };

  // Add new student
  const onSubmit = async (values: StudentFormValues) => {
    try {
      // Check if we can enroll more students
      if (seatsRemaining <= 0) {
        toast({
          title: "Cannot add more students",
          description: "No more seats available",
          variant: "destructive"
        });
        return;
      }

      // First, add the student to the database
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone: values.phone || null,
          team_id: values.teamId,
          status: values.active ? 'active' : 'inactive'
        })
        .select()
        .single();

      if (studentError) {
        throw studentError;
      }

      // Add the student to the list with enrolled status
      const newStudent: Student = {
        id: studentData.id,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        enrolled: true // Automatically enroll new students
      };

      onAddStudent(newStudent);
      form.reset();

      toast({
        title: "Student added",
        description: `${values.firstName} ${values.lastName} has been added and enrolled.`
      });
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="py-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last name" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email address" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset group and team when client changes
                      form.setValue("groupId", "");
                      form.setValue("teamId", "");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={!form.watch("clientId")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} {group.is_default ? "(Default)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={!form.watch("groupId")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Active
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">
              Add Student
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
