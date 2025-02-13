
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Mail, Trash2, PenSquare } from "lucide-react";
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
      // Generate new token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');

      if (tokenError) throw tokenError;

      // Create new invitation
      const { error: inviteError } = await supabase
        .from('invitations')
        .insert({
          client_id: clientId,
          email: user.email,
          token: tokenData,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (inviteError) throw inviteError;

      // Send invitation email
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
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50">
        <TableCell>
          <div className="flex items-center space-x-2">
            <CollapsibleTrigger
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-muted rounded"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <span>{user.profiles.first_name} {user.profiles.last_name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <PenSquare className="h-4 w-4" />
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
          </div>
        </TableCell>
        <TableCell>
          <Badge>{user.role}</Badge>
        </TableCell>
        <TableCell>
          <Badge variant={user.status === "pending" ? "secondary" : "default"}>
            {user.status}
          </Badge>
        </TableCell>
        <TableCell>{user.groups.length}</TableCell>
        <TableCell>{user.teams.length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} className="p-0">
          <CollapsibleContent>
            <div className="p-4 bg-muted/50 space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Groups</h4>
                <div className="flex flex-wrap gap-2">
                  {user.groups.map((group, index) => (
                    <Badge key={index} variant="outline">
                      {group.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Teams</h4>
                <div className="flex flex-wrap gap-2">
                  {user.teams.map((team, index) => (
                    <Badge key={index} variant="outline">
                      {team.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </TableCell>
      </TableRow>
    </>
  );
}
