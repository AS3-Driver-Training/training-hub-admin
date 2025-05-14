
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Edit, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserData } from "../types";
import { UserActions } from "./UserActions";
import { UserGroupsTeams } from "./UserGroupsTeams";

interface UserRowProps {
  user: UserData;
  clientId: string;
  onEdit: (user: UserData) => void;
}

export function UserRow({ user, clientId, onEdit }: UserRowProps) {
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

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="hover:bg-muted/50">
        <TableCell colSpan={2}>
          <div className="flex items-start gap-4">
            <CollapsibleTrigger className="p-1 hover:bg-muted rounded mt-1">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <div className="space-y-1">
              <div className="font-medium">
                {user.profiles.first_name} {user.profiles.last_name}
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <Badge variant="outline" className="font-medium">
              {user.role}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Access Level
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <Badge 
              variant={getStatusVariant(user.status) as "default" | "secondary" | "destructive" | "success" | "warning"}
            >
              {user.status}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Account Status
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => onEdit(user)}
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
            <UserActions
              user={user}
              clientId={clientId}
              onManageUser={onEdit}
            />
          </div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} className="p-0">
          <CollapsibleContent>
            <UserGroupsTeams 
              user={user} 
              clientId={clientId}
            />
          </CollapsibleContent>
        </TableCell>
      </TableRow>
    </Collapsible>
  );
}
