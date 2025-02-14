
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { AddGroupDialog } from "./groups/AddGroupDialog";
import { GroupsTable } from "./groups/GroupsTable";

interface ClientGroupsTabProps {
  clientId: string;
}

export function ClientGroupsTab({ clientId }: ClientGroupsTabProps) {
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['client_groups', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          teams (
            id,
            name
          )
        `)
        .eq('client_id', clientId)
        .order('is_default', { ascending: true })
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const addGroupMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
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
      toast.error(error.message);
    },
  });

  const addTeamMutation = useMutation({
    mutationFn: async ({ groupId, name }: { groupId: string; name: string }) => {
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
      toast.success("Team created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddGroup = (name: string, description: string) => {
    addGroupMutation.mutate({ name, description });
  };

  const handleAddTeam = (groupId: string, name: string) => {
    addTeamMutation.mutate({ groupId, name });
  };

  if (isLoading) return <div>Loading...</div>;

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
          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
                Create New Group
              </Button>
            </DialogTrigger>
            <AddGroupDialog
              isOpen={isGroupDialogOpen}
              onOpenChange={setIsGroupDialogOpen}
              onSubmit={handleAddGroup}
            />
          </Dialog>
        </div>

        <div className="rounded-md">
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Company Structure
            </h4>
            <p className="text-sm text-muted-foreground">
              {groups?.length === 0
                ? "No groups created yet. A default group will be used for all teams."
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
