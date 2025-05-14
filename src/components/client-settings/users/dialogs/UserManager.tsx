
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { UserData, Group, ClientRole } from "../../types";

export function useUserManager(user: UserData | null, clientId: string) {
  const [selectedRole, setSelectedRole] = useState<ClientRole>(user?.role || 'supervisor');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role as ClientRole);
      if (user.groups?.[0]) {
        setSelectedGroup(user.groups[0].id);
        setSelectedTeams(user.teams?.map(t => t.id) || []);
      }
    }
  }, [user]);

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(current => 
      current.includes(teamId)
        ? current.filter(id => id !== teamId)
        : [...current, teamId]
    );
  };
  
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
      return true;
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || "Failed to update user");
      return false;
    }
  };
  
  // Get available teams for selected group
  const getAvailableTeams = (groups: Group[]) => {
    return selectedGroup 
      ? (groups.find(g => g.id === selectedGroup)?.teams || [])
      : [];
  };
  
  return {
    selectedRole,
    setSelectedRole,
    selectedGroup,
    setSelectedGroup,
    selectedTeams,
    toggleTeam,
    handleUpdateUser,
    getAvailableTeams
  };
}
