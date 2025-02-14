
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserData } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ManageUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  clientId: string;
  groups: Array<{
    id: string;
    name: string;
    teams?: Array<{ id: string; name: string; }>;
  }>;
}

export function ManageUserDialog({ 
  isOpen, 
  onOpenChange, 
  user, 
  clientId,
  groups = []
}: ManageUserDialogProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setSelectedGroups(user.groups?.map(g => g.id) || []);
      setSelectedTeams(user.teams?.map(t => t.id) || []);
    }
  }, [user]);

  // Get all teams for the selected groups
  const allTeams = groups.reduce<Array<{ id: string; name: string; groupName: string }>>((acc, group) => {
    if (group.teams && Array.isArray(group.teams)) {
      acc.push(...group.teams.map(team => ({
        ...team,
        groupName: group.name
      })));
    }
    return acc;
  }, []);

  const handleUpdateUserAssignments = async () => {
    if (!user) return;

    try {
      // Remove existing assignments
      await supabase
        .from('user_groups')
        .delete()
        .eq('user_id', user.user_id);

      await supabase
        .from('user_teams')
        .delete()
        .eq('user_id', user.user_id);

      // Add new group assignments
      if (selectedGroups.length > 0) {
        const { error: groupError } = await supabase
          .from('user_groups')
          .insert(
            selectedGroups.map(groupId => ({
              user_id: user.user_id,
              group_id: groupId
            }))
          );
        if (groupError) throw groupError;
      }

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
        if (teamError) throw teamError;
      }

      toast.success("User assignments updated successfully");
      queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating user assignments:", error);
      toast.error(error.message || "Failed to update user assignments");
    }
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage User Groups & Teams</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 inline-block">Groups</Label>
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
            <Label className="mb-2 inline-block">Teams</Label>
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

          <Button 
            className="w-full" 
            onClick={handleUpdateUserAssignments}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
