
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Mail, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  groups: { name: string }[];
  teams: { name: string }[];
}

interface ClientUserRowProps {
  user: UserData;
  clientId: string;
}

export function ClientUserRow({ user, clientId }: ClientUserRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleResendInvitation = async () => {
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

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to remove this user?")) return;

    try {
      const { error } = await supabase
        .from('client_users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      toast.success("User removed successfully");
      queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <div className="flex items-center gap-3">
            <CollapsibleTrigger className="p-1 hover:bg-muted rounded flex-shrink-0">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <div className="min-w-0">
              <div className="font-medium truncate">
                {user.profiles.first_name} {user.profiles.last_name}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {user.email}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline">{user.role}</Badge>
        </TableCell>
        <TableCell>
          <Badge 
            variant={user.status === "active" ? "success" : 
                   user.status === "pending" || user.status === "invited" ? "warning" :
                   "secondary"}
            className="capitalize"
          >
            {user.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user.status === "pending" && (
                <DropdownMenuItem onClick={handleResendInvitation}>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Invitation
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDeleteUser} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} className="p-0">
          <CollapsibleContent>
            <div className="p-4 bg-muted/20 border-t space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Groups</h4>
                <div className="flex flex-wrap gap-2">
                  {user.groups.length > 0 ? (
                    user.groups.map((group, index) => (
                      <Badge key={index} variant="outline">
                        {group.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No groups assigned</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Teams</h4>
                <div className="flex flex-wrap gap-2">
                  {user.teams.length > 0 ? (
                    user.teams.map((team, index) => (
                      <Badge key={index} variant="outline">
                        {team.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No teams assigned</span>
                  )}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </TableCell>
      </TableRow>
    </Collapsible>
  );
}
