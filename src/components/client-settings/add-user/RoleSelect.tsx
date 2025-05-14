
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleSelectProps {
  role: 'client_admin' | 'manager' | 'supervisor';
  onRoleChange: (value: 'client_admin' | 'manager' | 'supervisor') => void;
}

export function RoleSelect({ role, onRoleChange }: RoleSelectProps) {
  console.log("RoleSelect rendered with role:", role);
  
  const handleRoleChange = (value: string) => {
    console.log("Role changed to:", value);
    onRoleChange(value as 'client_admin' | 'manager' | 'supervisor');
  };
  
  return (
    <div>
      <Label htmlFor="role">Role</Label>
      <Select value={role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          <SelectItem value="client_admin">Client Admin</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
          <SelectItem value="supervisor">Supervisor (View Only)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
