
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserData } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Find the default group
  const defaultGroup = groups.find(g => g.id === selectedGroup) || groups[0];

  useEffect(() => {
    if (user && groups.length > 0) {
      // If user has groups, select the first one, otherwise select the first available group
      const userGroup = user.groups?.[0]?.id || groups[0]?.id;
      setSelectedGroup(userGroup || null);
      setSelectedTeams(user.teams?.map(t => t.id) || []);
    }
  }, [user, groups]);

  const availableTeams = defaultGroup?.teams || [];

  const handleUpdateUserAssignments = async () => {
    if (!user || !selectedGroup) return;

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

      // Add new group assignment
      const { error: groupError } = await supabase
        .from('user_groups')
        .insert({
          user_id: user.user_id,
          group_id: selectedGroup
        });

      if (groupError) throw groupError;

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
            <Label>Teams in {defaultGroup?.name}</Label>
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

          <Button 
            className="w-full" 
            onClick={handleUpdateUserAssignments}
            disabled={!selectedGroup}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
