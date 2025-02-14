
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Mail, Trash2, UserCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface UserData {
  id: string;
  role: string;
  status: string;
  user_id: string;
  client_id: string;
  created_at: string;
  updated_at: string;
  email: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  groups: { id: string; name: string }[];
  teams: { id: string; name: string }[];
}

interface UsersTableProps {
  users: UserData[] | undefined;
  clientId: string;
}

export function UsersTable({ users, clientId }: UsersTableProps) {
  const queryClient = useQueryClient();
  const [isManageUserOpen, setIsManageUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [openGroups, setOpenGroups] = useState(false);
  const [openTeams, setOpenTeams] = useState(false);

  const { data: groups } = useQuery({
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
      return data;
    },
  });

  const handleResendInvitation = async (user: UserData) => {
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');

      if (tokenError) throw tokenError;

      const { error: inviteError } = await supabase
        .from('invitations')
        .insert({
          client_id: clientId,
          email: user.email,
          token: tokenData,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (inviteError) throw inviteError;

      const emailResponse = await supabase.functions.invoke('send-invitation', {
        body: {
          email: user.email,
          token: tokenData,
        },
      });

      if (emailResponse.error) throw emailResponse.error;

      toast.success("Invitation resent successfully");
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error(error.message || "Failed to resend invitation");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return;

    try {
      const { error } = await supabase
        .from('client_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success("User removed successfully");
      queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handleManageUser = (user: UserData) => {
    setSelectedUser(user);
    setSelectedGroups(user.groups.map(g => g.id));
    setSelectedTeams(user.teams.map(t => t.id));
    setIsManageUserOpen(true);
  };

  const handleUpdateUserAssignments = async () => {
    if (!selectedUser) return;

    try {
      // Remove existing assignments
      await supabase
        .from('user_groups')
        .delete()
        .eq('user_id', selectedUser.user_id);

      await supabase
        .from('user_teams')
        .delete()
        .eq('user_id', selectedUser.user_id);

      // Add new group assignments
      if (selectedGroups.length > 0) {
        const { error: groupError } = await supabase
          .from('user_groups')
          .insert(
            selectedGroups.map(groupId => ({
              user_id: selectedUser.user_id,
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
              user_id: selectedUser.user_id,
              team_id: teamId
            }))
          );
        if (teamError) throw teamError;
      }

      toast.success("User assignments updated successfully");
      queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
      setIsManageUserOpen(false);
    } catch (error: any) {
      console.error("Error updating user assignments:", error);
      toast.error(error.message || "Failed to update user assignments");
    }
  };

  const allTeams = groups?.flatMap(group => group.teams) || [];

  return (
    <div className="relative rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[200px]">Email</TableHead>
              <TableHead className="w-[100px]">Role</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px] text-center">Groups</TableHead>
              <TableHead className="w-[100px] text-center">Teams</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {user.profiles.first_name} {user.profiles.last_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "pending" ? "secondary" : "default"}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {user.groups.length > 0 ? (
                    <Badge variant="outline">{user.groups.length}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {user.teams.length > 0 ? (
                    <Badge variant="outline">{user.teams.length}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleManageUser(user)}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Manage Groups & Teams
                      </DropdownMenuItem>
                      {user.status === "pending" && (
                        <DropdownMenuItem onClick={() => handleResendInvitation(user)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Invitation
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!users?.length && (
              <TableRow>
                <TableCell 
                  colSpan={7} 
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isManageUserOpen} onOpenChange={setIsManageUserOpen}>
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
                      {groups?.map((group) => (
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
    </div>
  );
}
