
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Group } from "../types";

interface GroupSelectProps {
  groups: Group[];
  selectedGroup?: string | null;
  onGroupChange?: (value: string) => void;
  // Add these new props for compatibility with AddUserDialog
  value?: string;
  onChange?: (value: string) => void;
}

export function GroupSelect({ 
  groups, 
  selectedGroup, 
  onGroupChange,
  value,
  onChange
}: GroupSelectProps) {
  console.log("GroupSelect rendered with:", { 
    groupsCount: groups.length, 
    selectedGroup: selectedGroup || value 
  });
  
  const handleGroupChange = (newValue: string) => {
    console.log("Group changed to:", newValue);
    if (onGroupChange) onGroupChange(newValue);
    if (onChange) onChange(newValue);
  };
  
  // Use the appropriate value prop, preferring value over selectedGroup for backward compatibility
  const currentValue = value !== undefined ? value : selectedGroup;
  
  return (
    <div>
      <Label>Group</Label>
      <Select 
        value={currentValue || undefined} 
        onValueChange={handleGroupChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          <SelectGroup>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name} {group.teams?.length ? `(${group.teams.length} teams)` : ''}
              </SelectItem>
            ))}
            {groups.length === 0 && (
              <SelectItem value="no-groups" disabled>No groups available</SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
