
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GroupData } from "../types";

interface GroupSelectProps {
  groups: GroupData[];
  selectedGroup: string | null;
  onGroupChange: (value: string) => void;
}

export function GroupSelect({ groups, selectedGroup, onGroupChange }: GroupSelectProps) {
  return (
    <div>
      <Label>Group</Label>
      <Select 
        value={selectedGroup || undefined} 
        onValueChange={onGroupChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name} {group.teams?.length ? `(${group.teams.length} teams)` : ''}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
