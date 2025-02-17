import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { AddGroupDialog } from "./groups/AddGroupDialog";
import { GroupsTable } from "./groups/GroupsTable";
import { AddTeamDialog } from "./groups/AddTeamDialog";
import { Group } from "./types";

interface ClientGroupsTabProps {
  clientId: string;
}

export function ClientGroupsTab({ clientId }: ClientGroupsTabProps) {
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['client_groups', clientId],
    queryFn: async () => {
      console.log('Fetching groups for client:', clientId);
      
      // Simplified query to avoid complex joins
      const { data: existingGroups, error: fetchError } = await supabase
        .from('groups')
        .select('id, name, description, is_default')
        .eq('client_id', clientId)
        .order('is_default', { ascending: false })
        .order('name');

      if (fetchError) {
        console.error('Error fetching groups:', fetchError);
        throw fetchError;
      }

      // Initialize groups with empty teams array
      const groupsWithEmptyTeams: Group[] = (existingGroups || []).map(group => ({
        ...group,
        teams: []
      }));

      // Fetch teams in a separate query to avoid complex joins
      if (existingGroups && existingGroups.length > 0) {
        const groupIds = existingGroups.map(g => g.id);
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select('id, name, group_id')
          .in('group_id', groupIds);

        if (teamsError) {
          console.error('Error fetching teams:', teamsError);
          throw teamsError;
        }

        // Merge teams with their respective groups
        return groupsWithEmptyTeams.map(group => ({
          ...group,
          teams: teams?.filter(team => team.group_id === group.id) || []
        }));
      }

      return groupsWithEmptyTeams;
    },
  });

  const addGroupMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      console.log('Creating new group:', { name, description, clientId });
      const { error } = await supabase
        .from('groups')
        .insert({
          client_id: clientId,
          name,
          description,
          is_default: false
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_groups', clientId] });
      setIsGroupDialogOpen(false);
      toast.success("Group created successfully");
    },
    onError: (error: Error) => {
      console.error('Error creating group:', error);
      toast.error("Failed to create group");
    },
  });

  const addTeamMutation = useMutation({
    mutationFn: async ({ groupId, name }: { groupId: string; name: string }) => {
      console.log('Creating new team:', { groupId, name });
      const { error } = await supabase
        .from('teams')
        .insert({
          group_id: groupId,
          name: name
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_groups', clientId] });
      setIsTeamDialogOpen(false);
      toast.success("Team created successfully");
    },
    onError: (error: Error) => {
      console.error('Error creating team:', error);
      toast.error("Failed to create team");
    },
  });

  const handleAddGroup = (name: string, description: string) => {
    addGroupMutation.mutate({ name, description });
  };

  const handleAddTeam = (groupId: string, name: string) => {
    addTeamMutation.mutate({ groupId, name });
  };

  const handleCreateTeam = async (name: string) => {
    if (!groups || groups.length === 0) {
      toast.error("Unable to create team. Please create a group first.");
      return;
    }

    const defaultGroup = groups.find(g => g.is_default);
    if (!defaultGroup) {
      toast.error("Unable to create team. Default group not found.");
      return;
    }

    handleAddTeam(defaultGroup.id, name);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-24">
          <p className="text-muted-foreground">Loading groups...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Groups & Teams</h3>
            <p className="text-sm text-muted-foreground">
              Manage your organization's structure and teams
            </p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              </DialogTrigger>
              <AddTeamDialog
                isOpen={isTeamDialogOpen}
                onOpenChange={setIsTeamDialogOpen}
                onSubmit={handleCreateTeam}
                groupName="Default Group"
              />
            </Dialog>
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Building2 className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <AddGroupDialog
                isOpen={isGroupDialogOpen}
                onOpenChange={setIsGroupDialogOpen}
                onSubmit={handleAddGroup}
              />
            </Dialog>
          </div>
        </div>

        <div className="rounded-md">
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Company Structure
            </h4>
            <p className="text-sm text-muted-foreground">
              {groups?.length === 0
                ? "No groups created yet. Create a group to get started."
                : `${groups?.length} ${
                    groups?.length === 1 ? "group" : "groups"
                  } created`}
            </p>
          </div>

          <GroupsTable 
            groups={groups || []} 
            onAddTeam={handleAddTeam}
          />
        </div>
      </Card>
    </div>
  );
}
