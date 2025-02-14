
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserData } from "./types";

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
  groups 
}: ManageUserDialogProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [openGroups, setOpenGroups] = useState(false);
  const [openTeams, setOpenTeams] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setSelectedGroups(user.groups?.map(g => g.id) || []);
      setSelectedTeams(user.teams?.map(t => t.id) || []);
    }
  }, [user]);

  const allTeams = groups.reduce<Array<{ id: string; name: string }>>((acc, group) => {
    if (group.teams && Array.isArray(group.teams)) {
      acc.push(...group.teams);
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage User Groups & Teams</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Groups</Label>
            <Popover open={openGroups} onOpenChange={setOpenGroups}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openGroups}
                  className="w-full justify-between"
                >
                  {selectedGroups.length === 0
                    ? "Select groups..."
                    : `${selectedGroups.length} group(s) selected`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search groups..." />
                  <CommandEmpty>No groups found.</CommandEmpty>
                  <CommandGroup>
                    {groups.map((group) => (
                      <CommandItem
                        key={group.id}
                        value={group.name}
                        onSelect={() => {
                          setSelectedGroups(
                            selectedGroups.includes(group.id)
                              ? selectedGroups.filter(id => id !== group.id)
                              : [...selectedGroups, group.id]
                          );
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedGroups.includes(group.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {group.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Teams</Label>
            <Popover open={openTeams} onOpenChange={setOpenTeams}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openTeams}
                  className="w-full justify-between"
                  disabled={allTeams.length === 0}
                >
                  {selectedTeams.length === 0
                    ? "Select teams..."
                    : `${selectedTeams.length} team(s) selected`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search teams..." />
                  <CommandEmpty>No teams found.</CommandEmpty>
                  <CommandGroup>
                    {allTeams.map((team) => (
                      <CommandItem
                        key={team.id}
                        value={team.name}
                        onSelect={() => {
                          setSelectedTeams(
                            selectedTeams.includes(team.id)
                              ? selectedTeams.filter(id => id !== team.id)
                              : [...selectedTeams, team.id]
                          );
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedTeams.includes(team.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {team.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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
