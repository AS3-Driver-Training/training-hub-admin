
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserData, Group } from "../types";

interface ManageUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  clientId: string;
  groups: Group[];
}

export function ManageUserDialog({ 
  isOpen, 
  onOpenChange, 
  user, 
  clientId,
  groups = []
}: ManageUserDialogProps) {
  const [selectedRole, setSelectedRole] = useState<'client_admin' | 'manager' | 'supervisor'>(user?.role || 'supervisor');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      if (user.groups?.[0]) {
        setSelectedGroup(user.groups[0].id);
        setSelectedTeams(user.teams?.map(t => t.id) || []);
      } else if (groups.length > 0) {
        setSelectedGroup(groups[0].id);
        setSelectedTeams([]);
      }
    }
  }, [user, groups]);

  const handleUpdateUser = async () => {
    if (!user || !selectedGroup) return;

    try {
      console.log('Starting user update:', { userId: user.id, role: selectedRole });
      
      // Update user role
      const { data: updateData, error: roleError } = await supabase
        .from('client_users')
        .update({ role: selectedRole })
        .eq('id', user.id)
        .select();

      if (roleError) {
        console.error('Error updating role:', roleError);
        throw roleError;
      }

      console.log('Role updated successfully:', updateData);

      // Remove existing group assignments
      const { error: deleteGroupError } = await supabase
        .from('user_groups')
        .delete()
        .eq('user_id', user.user_id);

      if (deleteGroupError) {
        console.error('Error removing groups:', deleteGroupError);
        throw deleteGroupError;
      }

      console.log('Existing groups removed');

      // Add new group assignment
      const { error: groupError } = await supabase
        .from('user_groups')
        .insert({
          user_id: user.user_id,
          group_id: selectedGroup
        });

      if (groupError) {
        console.error('Error adding group:', groupError);
        throw groupError;
      }

      console.log('New group assigned');

      // Remove existing team assignments
      const { error: deleteTeamError } = await supabase
        .from('user_teams')
        .delete()
        .eq('user_id', user.user_id);

      if (deleteTeamError) {
        console.error('Error removing teams:', deleteTeamError);
        throw deleteTeamError;
      }

      console.log('Existing teams removed');

      // Add new team assignments
      if (selectedTeams.length > 0) {
        const { error: teamError } = await supabase
          .from('user_teams')
          .insert(
            selectedTeams.map(teamId => ({
              user_id: user.user_id,
              team_id: teamId
            }))
          );

        if (teamError) {
          console.error('Error adding teams:', teamError);
          throw teamError;
        }

        console.log('New teams assigned');
      }

      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || "Failed to update user");
    }
  };

  // Get available teams for selected group
  const availableTeams = selectedGroup 
    ? (groups.find(g => g.id === selectedGroup)?.teams || [])
    : [];

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(current => 
      current.includes(teamId)
        ? current.filter(id => id !== teamId)
        : [...current, teamId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={(value: 'client_admin' | 'manager' | 'supervisor') => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client_admin">Client Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="supervisor">Supervisor (View Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Group</Label>
            <Select 
              value={selectedGroup || undefined} 
              onValueChange={setSelectedGroup}
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

          <div className="space-y-2">
            <Label>Teams</Label>
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-4 space-y-2">
                {availableTeams.map((team) => (
                  <div
                    key={team.id}
                    className={cn(
                      "flex items-center space-x-2 rounded-lg px-4 py-2 cursor-pointer hover:bg-accent",
                      selectedTeams.includes(team.id) && "bg-accent"
                    )}
                    onClick={() => toggleTeam(team.id)}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedTeams.includes(team.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{team.name}</span>
                  </div>
                ))}
                {availableTeams.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No teams available in this group
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateUser}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

