
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { DialogTrigger } from "@/components/ui/dialog";
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
            <h3 className="text-lg font-semibold">Groups</h3>
            <p className="text-sm text-muted-foreground">
              Manage organizational departments and divisions
            </p>
          </div>
          <DialogTrigger asChild>
            <Button onClick={() => setIsGroupDialogOpen(true)}>
              <Building2 className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
        </div>

        <GroupsTable 
          groups={groups || []} 
          onAddTeam={handleAddTeam}
        />

        <AddGroupDialog
          isOpen={isGroupDialogOpen}
          onOpenChange={setIsGroupDialogOpen}
          onSubmit={handleAddGroup}
        />
      </Card>
    </div>
  );
}
