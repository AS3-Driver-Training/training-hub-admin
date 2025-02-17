
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { InternalUser } from "./types";

interface UserListItemProps {
  user: InternalUser;
  onEdit: (user: InternalUser) => void;
  onDelete: (user: InternalUser) => void;
}

export function UserListItem({ user, onEdit, onDelete }: UserListItemProps) {
  return (
    <Card key={user.id} className="p-4">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h4 className="font-medium">
                {user.first_name} {user.last_name}
              </h4>
              {user.title && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{user.title}</span>
                </>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(user)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deactivate User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={user.role === 'superadmin' ? 'destructive' : user.role === 'admin' ? 'default' : 'secondary'}>
            {user.role}
          </Badge>
          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
            {user.status}
          </Badge>
          <div className="text-sm text-muted-foreground ml-auto flex items-center gap-3">
            <span>{user.email}</span>
            <span>•</span>
            <span>Last login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
