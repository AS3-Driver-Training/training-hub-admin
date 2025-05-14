
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
  selectedGroup: string | null;
  onGroupChange: (value: string) => void;
}

export function GroupSelect({ groups, selectedGroup, onGroupChange }: GroupSelectProps) {
  console.log("GroupSelect rendered with:", { groupsCount: groups.length, selectedGroup });
  
  const handleGroupChange = (value: string) => {
    console.log("Group changed to:", value);
    onGroupChange(value);
  };
  
  return (
    <div>
      <Label>Group</Label>
      <Select 
        value={selectedGroup || undefined} 
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
