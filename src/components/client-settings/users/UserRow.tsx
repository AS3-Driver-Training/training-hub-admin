
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserData } from "../types";
import { UserGroupsTeams } from "./UserGroupsTeams";
import { UserActions } from "../users/UserActions";

interface UserRowProps {
  user: UserData;
  clientId: string;
  onEdit: (user: UserData) => void;
  onManageGroupsTeams: (user: UserData) => void;
}

export function UserRow({ user, clientId, onEdit, onManageGroupsTeams }: UserRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Function to get appropriate badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
      case 'invited':
        return 'warning';
      case 'inactive':
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // For invitation rows, show different content
  const isInvitation = user.is_invitation === true;

  const userName = isInvitation 
    ? "Invited User" 
    : `${user.profiles.first_name} ${user.profiles.last_name}`;

  return (
    <>
      <TableRow>
        <TableCell className="w-[50%]">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 p-0 flex-shrink-0"
              onClick={() => !isInvitation && setIsOpen(!isOpen)}
              disabled={isInvitation}
            >
              {isOpen && !isInvitation ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div className="min-w-0">
              <div className="font-medium truncate">
                {userName}
              </div>
              <div className="text-sm text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="w-[20%]">
          <Badge variant="outline" className="font-medium">
            {user.role}
          </Badge>
        </TableCell>
        <TableCell className="w-[15%]">
          <Badge 
            variant={getStatusVariant(user.status)}
            className="capitalize"
          >
            {user.status}
          </Badge>
        </TableCell>
        <TableCell className="w-[15%] text-right">
          <UserActions 
            user={user} 
            clientId={clientId} 
            onManageUser={isInvitation ? onEdit : onManageGroupsTeams} 
          />
        </TableCell>
      </TableRow>
      
      {isOpen && !isInvitation && (
        <TableRow>
          <TableCell colSpan={4} className="p-0">
            <div className="border-t bg-muted/20 py-4 px-6">
              <UserGroupsTeams 
                user={user} 
                clientId={clientId} 
                onManageAccess={() => onManageGroupsTeams(user)}
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
