
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AddUserDialogProps {
  clientId: string;
}

export function AddUserDialog({ clientId }: AddUserDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("supervisor");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
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

  const allTeams = groups.reduce<Array<{ id: string; name: string; groupName: string }>>((acc, group) => {
    if (group.teams && Array.isArray(group.teams)) {
      acc.push(...group.teams.map(team => ({
        ...team,
        groupName: group.name
      })));
    }
    return acc;
  }, []);

  const addUserMutation = useMutation({
    mutationFn: async ({ email, role, groupIds, teamIds }: { 
      email: string; 
      role: string;
      groupIds: string[];
      teamIds: string[];
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

      // Insert group assignments
      if (groupIds.length > 0) {
        const { error: groupError } = await supabase
          .from('user_groups')
          .insert(
            groupIds.map(groupId => ({
              user_id: userData.user.id,
              group_id: groupId
            }))
          );
        if (groupError) throw groupError;
      }

      // Insert team assignments
      if (teamIds.length > 0) {
        const { error: teamError } = await supabase
          .from('user_teams')
          .insert(
            teamIds.map(teamId => ({
              user_id: userData.user.id,
              team_id: teamId
            }))
          );
        if (teamError) throw teamError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
      setIsDialogOpen(false);
      setEmail("");
      setRole("supervisor");
      setSelectedGroups([]);
      setSelectedTeams([]);
      toast.success("User added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    addUserMutation.mutate({ 
      email, 
      role, 
      groupIds: selectedGroups,
      teamIds: selectedTeams
    });
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(current => 
      current.includes(groupId)
        ? current.filter(id => id !== groupId)
        : [...current, groupId]
    );
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(current => 
      current.includes(teamId)
        ? current.filter(id => id !== teamId)
        : [...current, teamId]
    );
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
            <Label>Groups</Label>
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-4 space-y-2">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-4 py-2 cursor-pointer hover:bg-accent",
                      selectedGroups.includes(group.id) && "bg-accent"
                    )}
                    onClick={() => toggleGroup(group.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedGroups.includes(group.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>{group.name}</span>
                    </div>
                    {group.teams?.length ? (
                      <Badge variant="outline">{group.teams.length} teams</Badge>
                    ) : null}
                  </div>
                ))}
                {groups.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No groups available
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div>
            <Label>Teams</Label>
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-4 space-y-2">
                {allTeams.map((team) => (
                  <div
                    key={team.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-4 py-2 cursor-pointer hover:bg-accent",
                      selectedTeams.includes(team.id) && "bg-accent"
                    )}
                    onClick={() => toggleTeam(team.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedTeams.includes(team.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>{team.name}</span>
                    </div>
                    <Badge variant="secondary">{team.groupName}</Badge>
                  </div>
                ))}
                {allTeams.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No teams available
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <Button type="submit" className="w-full">
            Add User
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
