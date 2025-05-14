
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientRole } from "../../types";

interface RoleSelectorProps {
  selectedRole: ClientRole;
  setSelectedRole: (role: ClientRole) => void;
}

export function RoleSelector({ selectedRole, setSelectedRole }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Role</Label>
      <Select 
        value={selectedRole} 
        onValueChange={(value: ClientRole) => setSelectedRole(value)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="client_admin">Client Admin</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
          <SelectItem value="supervisor">Supervisor (View Only)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
