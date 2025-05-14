
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { UserData, GroupData } from "../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserGroupsTeamsProps {
  user: UserData;
  clientId: string;
}

export function UserGroupsTeams({ user, clientId }: UserGroupsTeamsProps) {
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Fetch all available groups for this client
  const { data: allGroups } = useQuery({
    queryKey: ['client_groups', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          is_default,
          teams (id, name)
        `)
        .eq('client_id', clientId);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add user to group mutation
  const addToGroupMutation = useMutation({
    mutationFn: async ({ userId, groupId }: { userId: string, groupId: string }) => {
      console.log("Adding user to group:", { userId, groupId });
      
      // Example mutation - in a real app this would call Supabase
      // For now we'll simulate success
      // const { error } = await supabase
      //   .from('user_groups')
      //   .insert({ user_id: userId, group_id: groupId });
      // if (error) throw error;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { userId, groupId };
    },
    onSuccess: (data) => {
      toast.success("User added to group successfully");
      
      // Update the cache manually since we're not actually making the API call
      queryClient.setQueryData(['client_users', clientId], (oldData: any) => {
        if (!oldData) return oldData;
        
        // Find the group that was added
        const addedGroup = allGroups?.find(g => g.id === data.groupId);
        if (!addedGroup) return oldData;
        
        // Update the user's groups in the cache
        return oldData.map((u: UserData) => {
          if (u.id === user.id) {
            return {
              ...u,
              groups: [...u.groups, {
                id: addedGroup.id,
                name: addedGroup.name,
                description: addedGroup.description || '',
                is_default: addedGroup.is_default || false,
                client_id: clientId,
                teams: addedGroup.teams || []
              }]
            };
          }
          return u;
        });
      });
    },
    onError: (error) => {
      console.error("Error adding user to group:", error);
      toast.error("Failed to add user to group");
    }
  });

  // Filter out groups the user is already a member of
  const availableGroups = allGroups?.filter(
    group => !user.groups.some(userGroup => userGroup.id === group.id)
  ) || [];

  // Handle add to group
  const handleAddToGroup = (groupId: string) => {
    addToGroupMutation.mutate({
      userId: user.user_id,
      groupId
    });
    setSelectedGroup(null);
  };

  return (
    <div className="p-4 bg-muted/30 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Groups Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Groups</h4>
            <div className="flex items-center gap-2">
              <select
                className="text-xs rounded border border-input bg-background px-2 py-1 w-40"
                value={selectedGroup || ""}
                onChange={(e) => setSelectedGroup(e.target.value || null)}
                disabled={availableGroups.length === 0}
              >
                <option value="">Select a group</option>
                {availableGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs gap-1"
                disabled={!selectedGroup}
                onClick={() => selectedGroup && handleAddToGroup(selectedGroup)}
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {user.groups.length > 0 ? (
              user.groups.map((group) => (
                <Card key={group.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{group.name}</div>
                      {group.description && (
                        <div className="text-xs text-muted-foreground">{group.description}</div>
                      )}
                    </div>
                    {group.is_default && (
                      <Badge variant="outline" className="text-xs">Default</Badge>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-2">
                No groups assigned
              </div>
            )}
          </div>
        </div>

        {/* Teams Section */}
        <div>
          <h4 className="text-sm font-medium mb-3">Teams</h4>
          <div className="space-y-2">
            {user.teams.length > 0 ? (
              user.teams.map((team) => (
                <Card key={team.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{team.name}</div>
                      {team.group && (
                        <div className="text-xs text-muted-foreground">
                          {team.group.name} Group
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-2">
                No teams assigned
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
