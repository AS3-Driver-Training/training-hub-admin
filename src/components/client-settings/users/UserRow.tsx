
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserData } from "../types";
import { UserGroupsTeams } from "./UserGroupsTeams";

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

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <div className="flex items-center gap-3">
            <CollapsibleTrigger asChild className="p-1 hover:bg-muted rounded flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <div className="min-w-0">
              <div className="font-medium truncate">
                {user.profiles.first_name} {user.profiles.last_name}
              </div>
              <div className="text-sm text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="font-medium">
            {user.role}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge 
            variant={getStatusVariant(user.status)}
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
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageGroupsTeams(user)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Manage Groups & Teams
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      
      <TableRow>
        <TableCell colSpan={4} className="p-0">
          <CollapsibleContent>
            <div className="py-4 px-6 bg-muted/20 border-t">
              <UserGroupsTeams 
                user={user} 
                clientId={clientId} 
                onManageAccess={() => onManageGroupsTeams(user)}
              />
            </div>
          </CollapsibleContent>
        </TableCell>
      </TableRow>
    </Collapsible>
  );
}
