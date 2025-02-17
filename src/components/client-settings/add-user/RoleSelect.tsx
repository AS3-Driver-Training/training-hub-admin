
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleSelectProps {
  role: string;
  onRoleChange: (value: string) => void;
}

export function RoleSelect({ role, onRoleChange }: RoleSelectProps) {
  return (
    <div>
      <Label htmlFor="role">Role</Label>
      <Select value={role} onValueChange={onRoleChange}>
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

