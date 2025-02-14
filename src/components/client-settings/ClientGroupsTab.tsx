
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Users, Building2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ClientGroupsTabProps {
  clientId: string;
}

export function ClientGroupsTab({ clientId }: ClientGroupsTabProps) {
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [teamName, setTeamName] = useState("");
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
      setGroupName("");
      setGroupDescription("");
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
      setIsTeamDialogOpen(false);
      setTeamName("");
      setSelectedGroup(null);
      toast.success("Team created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    addGroupMutation.mutate({
      name: groupName,
      description: groupDescription
    });
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroup) {
      addTeamMutation.mutate({
        groupId: selectedGroup,
        name: teamName
      });
    }
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
          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
                Add Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGroup} className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="groupDescription">Description</Label>
                  <Textarea
                    id="groupDescription"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Enter group description"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Group
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups?.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">
                    {group.name}
                    {group.is_default && (
                      <Badge variant="secondary" className="ml-2">
                        Default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-md">
                    {group.description}
                  </TableCell>
                  <TableCell>
                    {group.teams?.map((team) => (
                      <Badge
                        key={team.id}
                        variant="outline"
                        className="mr-2"
                      >
                        {team.name}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Dialog
                      open={isTeamDialogOpen && selectedGroup === group.id}
                      onOpenChange={(open) => {
                        setIsTeamDialogOpen(open);
                        if (!open) setSelectedGroup(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedGroup(group.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Team
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Team to {group.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddTeam} className="space-y-4">
                          <div>
                            <Label htmlFor="teamName">Team Name</Label>
                            <Input
                              id="teamName"
                              value={teamName}
                              onChange={(e) => setTeamName(e.target.value)}
                              placeholder="Enter team name"
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Add Team
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
