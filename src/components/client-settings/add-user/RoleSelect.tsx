
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientRole } from "../types";

interface RoleSelectProps {
  role: ClientRole;
  onRoleChange: (value: ClientRole) => void;
  // Added for compatibility with old code
  value?: ClientRole;
  onChange?: (value: ClientRole) => void;
}

export function RoleSelect({ 
  role, 
  onRoleChange,
  value,
  onChange 
}: RoleSelectProps) {
  console.log("RoleSelect rendered with role/value:", role || value);
  
  // Use either the new or old prop pattern
  const currentValue = value || role;
  const handleChange = onChange || onRoleChange;
  
  const handleRoleChange = (value: string) => {
    console.log("Role changed to:", value);
    handleChange(value as ClientRole);
  };
  
  return (
    <div>
      <Label htmlFor="role">Role</Label>
      <Select value={currentValue} onValueChange={handleRoleChange}>
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
