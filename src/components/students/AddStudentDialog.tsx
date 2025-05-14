
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStudentDialog({ open, onOpenChange }: AddStudentDialogProps) {
  const queryClient = useQueryClient();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Fetch clients
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });
  
  // Fetch groups based on selected client
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['groups', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, is_default')
        .eq('client_id', clientId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });

  // Find default group
  const defaultGroup = groups.find(group => group.is_default);
  
  // Set default group if available and none selected
  useEffect(() => {
    if (groups.length > 0 && !groupId && defaultGroup) {
      setGroupId(defaultGroup.id);
    }
  }, [groups, groupId]);
  
  // Fetch teams based on selected group
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('group_id', groupId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!groupId,
  });
  
  // Reset downstream selections when parent selection changes
  useEffect(() => {
    if (clientId) {
      setGroupId('');
      setTeamId('');
    }
  }, [clientId]);
  
  useEffect(() => {
    if (groupId) {
      setTeamId('');
    }
  }, [groupId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !clientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a client",
        variant: "destructive"
      });
      return;
    }
    
    // Ensure we have a group (use default if none selected)
    const selectedGroupId = groupId || (defaultGroup ? defaultGroup.id : null);
    
    if (!selectedGroupId) {
      toast({
        title: "Error",
        description: "Please select a group or ensure the client has a default group",
        variant: "destructive"
      });
      return;
    }
    
    // If no team is selected but we have teams for this group, get the first one
    let selectedTeamId = teamId;
    if (!selectedTeamId && teams.length > 0) {
      selectedTeamId = teams[0].id;
    }
    
    // If still no team, we need to create a default team for this group
    if (!selectedTeamId) {
      toast({
        title: "Error",
        description: "No team available for the selected group. Please create a team first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert the new student
      const { data, error } = await supabase
        .from('students')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email,
          phone: phone || null,
          employee_number: employeeNumber || null,
          team_id: selectedTeamId,
          status: isActive ? 'active' : 'inactive'
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Student added successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      onOpenChange(false);
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setEmployeeNumber('');
      setClientId('');
      setGroupId('');
      setTeamId('');
      setIsActive(true);
    } catch (error: any) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Add a new student to your organization. They'll be assigned to the selected client, group, and team.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeNumber">Employee Number</Label>
              <Input
                id="employeeNumber"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client">Client/Company *</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger id="client">
                <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Select a client"} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
                {clients.length === 0 && !isLoadingClients && (
                  <SelectItem value="no-clients" disabled>
                    No clients available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group">Group</Label>
            <Select 
              value={groupId} 
              onValueChange={setGroupId} 
              disabled={!clientId || isLoadingGroups}
            >
              <SelectTrigger id="group">
                <SelectValue placeholder={
                  !clientId ? "Select a client first" : 
                  isLoadingGroups ? "Loading groups..." : 
                  "Select a group"
                } />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} {group.is_default ? "(Default)" : ""}
                  </SelectItem>
                ))}
                {groups.length === 0 && !!clientId && !isLoadingGroups && (
                  <SelectItem value="no-groups" disabled>
                    No groups available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {clientId && groups.length === 0 && !isLoadingGroups && (
              <p className="text-xs text-amber-500">This client has no groups. Please create a group first.</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="team">Team *</Label>
            <Select 
              value={teamId} 
              onValueChange={setTeamId} 
              disabled={!groupId || isLoadingTeams}
            >
              <SelectTrigger id="team">
                <SelectValue placeholder={
                  !clientId ? "Select a client first" :
                  !groupId ? "Select a group first" :
                  isLoadingTeams ? "Loading teams..." : 
                  "Select a team"
                } />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
                {teams.length === 0 && !!groupId && !isLoadingTeams && (
                  <SelectItem value="no-teams" disabled>
                    No teams available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {groupId && teams.length === 0 && !isLoadingTeams && (
              <p className="text-xs text-amber-500">This group has no teams. Please create a team first.</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isActive" 
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)} 
            />
            <Label htmlFor="isActive" className="cursor-pointer">Active student</Label>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
