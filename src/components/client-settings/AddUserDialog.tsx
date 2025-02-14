
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AddUserDialogProps {
  clientId: string;
}

export function AddUserDialog({ clientId }: AddUserDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("supervisor");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['client_groups', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          teams (
            id,
            name
          )
        `)
        .eq('client_id', clientId)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });

  // Set default group when groups are loaded
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].id);
    }
  }, [groups]);

  // Get available teams for selected group
  const availableTeams = selectedGroup 
    ? groups.find(g => g.id === selectedGroup)?.teams || []
    : [];

  const addUserMutation = useMutation({
    mutationFn: async ({ email, role, groupId, teamId }: { 
      email: string; 
      role: string;
      groupId: string | null;
      teamId: string | null;
    }) => {
      const { data: userData, error: userError } = await supabase.functions.invoke(
        'get-user-by-email',
        { body: { email } }
      );

      if (userError || !userData?.user) {
        throw new Error('User not found');
      }

      const { error: insertError } = await supabase
        .from('client_users')
        .insert({
          client_id: clientId,
          user_id: userData.user.id,
          role: role,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Insert group assignment
      if (groupId) {
        const { error: groupError } = await supabase
          .from('user_groups')
          .insert({
            user_id: userData.user.id,
            group_id: groupId
          });
        if (groupError) throw groupError;
      }

      // Insert team assignment
      if (teamId) {
        const { error: teamError } = await supabase
          .from('user_teams')
          .insert({
            user_id: userData.user.id,
            team_id: teamId
          });
        if (teamError) throw teamError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
      setIsDialogOpen(false);
      setEmail("");
      setRole("supervisor");
      setSelectedGroup(groups[0]?.id || null);
      setSelectedTeam(null);
      toast.success("User added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) {
      toast.error("Please select a group");
      return;
    }
    addUserMutation.mutate({ 
      email, 
      role, 
      groupId: selectedGroup,
      teamId: selectedTeam
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="supervisor">Supervisor (View Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Group</Label>
            <Select 
              value={selectedGroup || undefined} 
              onValueChange={(value) => {
                setSelectedGroup(value);
                setSelectedTeam(null); // Reset team selection when group changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} {group.teams?.length ? `(${group.teams.length} teams)` : ''}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Team</Label>
            <Select 
              value={selectedTeam || undefined}
              onValueChange={setSelectedTeam}
              disabled={!selectedGroup || availableTeams.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedGroup 
                    ? "Select a group first" 
                    : availableTeams.length === 0 
                      ? "No teams available" 
                      : "Select a team"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Add User
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
